# Lumina — AI Knowledge Assistant

> A production-grade, ChatGPT-style RAG application with a premium dark UI.
> Built using **React + Vite + Tailwind + Framer Motion (frontend)** and **FastAPI + Groq (Llama 3.3 70B) (backend)**.

---

## 🧱 Architecture

![Architecture](./architecture.png)

### 🔄 Request Flow

1. User uploads document → FastAPI backend
2. Document parsing + chunking pipeline
3. TF-IDF indexing (in-memory search layer)
4. User query → similarity search → top-k chunks retrieved
5. Context sent to **Groq API (Llama 3.3 70B)**
6. Response generated (~1s latency) and streamed to UI

---

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Add your Groq API key
export GROQ_API_KEY="your_key_here"   # Windows: set GROQ_API_KEY=your_key_here

# Run server
uvicorn main:app --reload --port 8000
```

Get API key: https://console.groq.com/

---

### 2. Frontend Setup

```bash
npm install
npm run dev
```

Open: http://localhost:5173

---

## 📁 Project Structure

```
lumina/
├── src/
│   ├── components/        # UI components (Chat, Sidebar, Input, etc.)
│   ├── hooks/             # Custom hooks (state + API logic)
│   ├── utils/             # Axios client & helpers
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── backend/
│   ├── main.py            # FastAPI app + RAG engine
│   └── requirements.txt
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 🧠 System Design

### 📥 Ingestion Pipeline

* File upload via `/api/upload`
* Parsing: PDF, DOCX, TXT, CSV, Markdown
* Text chunking (~400 tokens with overlap)
* TF-IDF vectorization
* In-memory index creation

### 🔍 Query Pipeline

* User query vectorized using TF-IDF
* Cosine similarity search retrieves top-k chunks
* Relevant context injected into Groq prompt
* LLM generates response (~1s latency)
* Response returned to frontend

---

## ⚙️ Key Engineering Decisions

* **Custom TF-IDF search engine** → eliminates need for external vector DB (cost = $0)
* **Groq (Llama 3.3 70B)** → ultra-fast inference (~1s response time)
* **Async FastAPI APIs** → supports concurrent user requests
* **Modular architecture** → API layer, processing layer, search layer
* **Frontend-backend separation** → enables independent scaling
* **CI/CD pipeline** → auto-deploy on GitHub push

---

## ✨ Features

* ChatGPT-style conversational UI
* Multi-document RAG querying
* Source citations with collapsible UI
* Markdown rendering (code blocks, lists, headings)
* Drag & drop file upload with progress
* Typing indicator animation
* Suggested prompts (empty state)
* Fully responsive (mobile + desktop)

---

## 🔧 Supported File Types

| Format | Library     |
| ------ | ----------- |
| PDF    | pdfplumber  |
| DOCX   | python-docx |
| TXT    | built-in    |
| MD     | built-in    |
| CSV    | built-in    |

---

## 🚢 Deployment

### Frontend (Vercel / Netlify)

```bash
npm run build
```

### Backend (Render / Railway / Fly.io)

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Environment Variables

```bash
GROQ_API_KEY=your_key_here
```

---

## 📦 Tech Stack

| Layer     | Technology                |
| --------- | ------------------------- |
| Frontend  | React, Vite, Tailwind CSS |
| Animation | Framer Motion             |
| Backend   | FastAPI, Uvicorn          |
| LLM       | Groq (Llama 3.3 70B)      |
| RAG       | Custom TF-IDF             |
| Parsing   | pdfplumber, python-docx   |

---

## 📈 Future Improvements

* Add Redis caching to reduce query latency
* Persist vector index (disk/DB-based storage)
* Add authentication & user sessions
* Streaming responses using SSE/WebSockets
* Horizontal scaling with load balancer

---

## 📄 License

MIT License
