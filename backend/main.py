"""
Lumina AI Knowledge Assistant — FastAPI Backend
Supports: PDF, TXT, DOCX, CSV, MD
RAG: TF-IDF chunking + cosine similarity
LLM: Groq (Llama 3.3 70B) — free, fast, no daily limits
"""

import os
import re
import uuid
import math
from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ── Optional heavy deps (graceful fallback) ──────────────────────
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    print("groq not installed – run: pip install groq")

try:
    import pdfplumber
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

try:
    import docx as python_docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

# ── Config ─────────────────────────────────────────────────────────
GROQ_API_KEY  = os.getenv("GROQ_API_KEY", "")
CHUNK_SIZE    = 400
CHUNK_OVERLAP = 80
TOP_K         = 6
MAX_CONTEXT   = 3000

groq_client = Groq(api_key=GROQ_API_KEY) if (GROQ_AVAILABLE and GROQ_API_KEY) else None

# ── In-memory store ────────────────────────────────────────────────
DOCS: dict[str, dict] = {}

# ── FastAPI app ────────────────────────────────────────────────────
app = FastAPI(title="Lumina API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Text extraction ────────────────────────────────────────────────
def extract_text(file_bytes: bytes, filename: str) -> str:
    ext = Path(filename).suffix.lower()

    if ext == ".pdf":
        if not PDF_AVAILABLE:
            raise HTTPException(400, "Install pdfplumber: pip install pdfplumber")
        with pdfplumber.open(BytesIO(file_bytes)) as pdf:
            return "\n\n".join(page.extract_text() or "" for page in pdf.pages)

    elif ext in (".docx", ".doc"):
        if not DOCX_AVAILABLE:
            raise HTTPException(400, "Install python-docx: pip install python-docx")
        doc = python_docx.Document(BytesIO(file_bytes))
        return "\n".join(p.text for p in doc.paragraphs)

    elif ext == ".csv":
        text = file_bytes.decode("utf-8", errors="ignore")
        lines = text.split("\n")
        if not lines:
            return ""
        headers = lines[0].split(",")
        rows = []
        for line in lines[1:200]:
            cols = line.split(",")
            row_text = "; ".join(
                f"{h.strip()}: {c.strip()}"
                for h, c in zip(headers, cols) if c.strip()
            )
            if row_text:
                rows.append(row_text)
        return "\n".join(rows)

    else:
        return file_bytes.decode("utf-8", errors="ignore")


# ── Chunking ───────────────────────────────────────────────────────
def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP):
    words = text.split()
    chunks, i = [], 0
    while i < len(words):
        chunk = " ".join(words[i: i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
        i += chunk_size - overlap
    return chunks


# ── Lightweight TF-IDF vectors (no numpy) ─────────────────────────
def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9']+", text.lower())


def build_index(chunks: list[str]):
    vocab = sorted({w for c in chunks for w in tokenize(c)})
    n = len(chunks)
    df: dict[str, int] = {}
    for c in chunks:
        for w in set(tokenize(c)):
            df[w] = df.get(w, 0) + 1

    def vectorize(text: str) -> list[float]:
        tokens = tokenize(text)
        tf: dict[str, float] = {}
        for t in tokens:
            tf[t] = tf.get(t, 0) + 1
        total = max(len(tokens), 1)
        return [
            (tf.get(w, 0) / total) * (math.log((n + 1) / (df.get(w, 0) + 1)) + 1)
            for w in vocab
        ]

    embeddings = [vectorize(c) for c in chunks]
    return vocab, df, embeddings, vectorize


def cosine_sim(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na  = math.sqrt(sum(x * x for x in a)) or 1e-9
    nb  = math.sqrt(sum(y * y for y in b)) or 1e-9
    return dot / (na * nb)


def retrieve(query: str, doc_id: str, top_k: int = TOP_K):
    doc    = DOCS[doc_id]
    qvec   = doc["vectorize"](query)
    scored = [
        (chunk, cosine_sim(qvec, emb))
        for chunk, emb in zip(doc["chunks"], doc["embeddings"])
    ]
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_k]


# ── Pydantic models ────────────────────────────────────────────────
class QueryRequest(BaseModel):
    query:   str
    history: list[dict] = []
    doc_ids: list[str]  = []


class QueryResponse(BaseModel):
    answer:  str
    sources: list[str]


# ── Routes ─────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "docs": len(DOCS),
        "llm": groq_client is not None
    }


@app.post("/api/upload")
async def upload_document(file: UploadFile = File(...)):
    contents = await file.read()
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(413, "File too large (max 20 MB)")

    text = extract_text(contents, file.filename)
    if not text.strip():
        raise HTTPException(422, "Could not extract text from file")

    chunks = chunk_text(text)
    if not chunks:
        raise HTTPException(422, "Document appears empty after processing")

    vocab, df, embeddings, vectorize = build_index(chunks)
    doc_id = str(uuid.uuid4())

    DOCS[doc_id] = {
        "name":       file.filename,
        "chunks":     chunks,
        "vocab":      vocab,
        "df":         df,
        "embeddings": embeddings,
        "vectorize":  vectorize,
    }

    return {
        "document_id": doc_id,
        "name":        file.filename,
        "chunks":      len(chunks),
        "chars":       len(text),
    }


@app.get("/api/documents")
def list_documents():
    return [
        {"id": did, "name": d["name"], "chunks": len(d["chunks"])}
        for did, d in DOCS.items()
    ]


@app.delete("/api/documents/{doc_id}")
def delete_document(doc_id: str):
    if doc_id not in DOCS:
        raise HTTPException(404, "Document not found")
    del DOCS[doc_id]
    return {"deleted": doc_id}


@app.post("/api/query", response_model=QueryResponse)
def query_knowledge(req: QueryRequest):
    if not req.query.strip():
        raise HTTPException(400, "Query is empty")

    target_ids = req.doc_ids if req.doc_ids else list(DOCS.keys())

    if not target_ids:
        context, sources = "", []
    else:
        all_results: list[tuple[str, float, str]] = []
        for did in target_ids:
            if did not in DOCS:
                continue
            for chunk, score in retrieve(req.query, did):
                all_results.append((chunk, score, DOCS[did]["name"]))

        all_results.sort(key=lambda x: x[1], reverse=True)
        top = all_results[: TOP_K * 2]

        context_parts, total_words, sources_set = [], 0, set()
        for chunk, score, name in top:
            words = chunk.split()
            if total_words + len(words) > MAX_CONTEXT:
                break
            context_parts.append(chunk)
            total_words += len(words)
            sources_set.add(name)

        context = "\n\n---\n\n".join(context_parts)
        sources  = list(sources_set)

    # Build prompt
    history_text = ""
    for h in req.history[-6:]:
        role = "User" if h["role"] == "user" else "Assistant"
        history_text += f"{role}: {h['content']}\n"

    if context:
        prompt = f"""You are Lumina, an expert AI knowledge assistant.
Answer the user's question using the document context below.
Be precise, clear, and well-structured. Use markdown (headers, bullets, code blocks) where helpful.
If the context is insufficient, say so honestly and answer from general knowledge.

DOCUMENT CONTEXT:
{context}

CONVERSATION HISTORY:
{history_text}
User: {req.query}
Assistant:"""
    else:
        prompt = f"""You are Lumina, a helpful AI assistant.
No documents have been uploaded yet, so answer from your general knowledge.
Be helpful, precise, and use markdown formatting where appropriate.

CONVERSATION HISTORY:
{history_text}
User: {req.query}
Assistant:"""

    # Generate answer
    if groq_client:
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1024,
                temperature=0.7,
            )
            answer = response.choices[0].message.content.strip()
        except Exception as e:
            raise HTTPException(500, f"LLM error: {str(e)}")
    else:
        answer = (
            "**Lumina Demo Mode** — No Groq API key detected.\n\n"
            "Get a free key at **https://console.groq.com** → API Keys\n\n"
            "Then set it in your Render dashboard under **Environment Variables**:\n"
            "`GROQ_API_KEY = your_key_here`\n\n"
            f"Your query was: *{req.query}*\n\n"
            + (f"Found **{len(context.split())} words** of context across {len(sources)} document(s)."
               if context else "No documents loaded yet.")
        )

    return QueryResponse(answer=answer, sources=sources)
