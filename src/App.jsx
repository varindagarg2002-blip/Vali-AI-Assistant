import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import { useChat } from './hooks/useChat'
import { useDocuments } from './hooks/useDocuments'

export default function App() {
  const [inputValue, setInputValue] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const { messages, isLoading, sendMessage, clearMessages } = useChat()
  const {
    documents,
    isUploading,
    uploadProgress,
    uploadError,
    upload,
    remove,
  } = useDocuments()

  const handleUpload = async (file) => {
    try {
      await upload(file)
    } catch (err) {
      // Error handled in hook
    }
  }

  const handleNewChat = () => {
    clearMessages()
    setInputValue('')
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden mesh-bg" style={{ background: '#080c14' }}>
      {/* Noise texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '256px 256px',
        }}
      />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -288 }}
            animate={{ x: 0 }}
            exit={{ x: -288 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed md:relative z-30 md:z-auto h-full"
          >
            <Sidebar
              documents={documents}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              uploadError={uploadError}
              onUpload={handleUpload}
              onDelete={remove}
              onNewChat={handleNewChat}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat area */}
      <Chat
        messages={messages}
        isLoading={isLoading}
        hasDocuments={documents.length > 0}
        onSend={sendMessage}
        onClear={handleNewChat}
        inputValue={inputValue}
        onInputChange={setInputValue}
        onMenuToggle={() => setSidebarOpen(prev => !prev)}
      />
    </div>
  )
}
