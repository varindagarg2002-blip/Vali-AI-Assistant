import { useState, useCallback } from 'react'
import { queryKnowledge } from '../utils/api'

export const useChat = () => {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(async (text, hasDocuments) => {
    if (!text.trim()) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)
    setError(null)

    try {
      // Build history for context
      const history = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const data = await queryKnowledge(text, history)

      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.answer || data.response || 'I could not find relevant information.',
        sources: data.sources || [],
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: err.response?.data?.detail || 'Something went wrong. Please try again.',
        isError: true,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMsg])
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [messages])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return { messages, isLoading, error, sendMessage, clearMessages }
}
