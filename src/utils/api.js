import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

// Upload a document
export const uploadDocument = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const res = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

// Get all documents
export const getDocuments = async () => {
  const res = await api.get('/api/documents')
  return res.data
}

// Delete a document
export const deleteDocument = async (docId) => {
  const res = await api.delete(`/api/documents/${docId}`)
  return res.data
}

// Query the knowledge base
export const queryKnowledge = async (query, history = [], docIds = []) => {
  const res = await api.post('/api/query', {
    query,
    history,
    doc_ids: docIds,
  })
  return res.data
}

// Health check
export const healthCheck = async () => {
  const res = await api.get('/api/health')
  return res.data
}

export default api
