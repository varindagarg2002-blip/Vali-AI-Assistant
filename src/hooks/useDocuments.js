import { useState, useCallback } from 'react'
import { uploadDocument, getDocuments, deleteDocument } from '../utils/api'

export const useDocuments = () => {
  const [documents, setDocuments] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState(null)

  const upload = useCallback(async (file) => {
    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 15, 85))
    }, 200)

    try {
      const result = await uploadDocument(file)
      clearInterval(progressInterval)
      setUploadProgress(100)

      const newDoc = {
        id: result.document_id || Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        chunkCount: result.chunks || 0,
        status: 'ready',
      }

      setDocuments(prev => [newDoc, ...prev])
      setTimeout(() => setUploadProgress(0), 800)
      return newDoc
    } catch (err) {
      clearInterval(progressInterval)
      setUploadProgress(0)
      setUploadError(err.response?.data?.detail || 'Upload failed. Please try again.')
      throw err
    } finally {
      setIsUploading(false)
    }
  }, [])

  const remove = useCallback(async (docId) => {
    try {
      await deleteDocument(docId)
      setDocuments(prev => prev.filter(d => d.id !== docId))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }, [])

  const fetchDocuments = useCallback(async () => {
    try {
      const docs = await getDocuments()
      setDocuments(docs)
    } catch (err) {
      console.error('Fetch documents failed:', err)
    }
  }, [])

  return {
    documents,
    isUploading,
    uploadProgress,
    uploadError,
    upload,
    remove,
    fetchDocuments,
  }
}
