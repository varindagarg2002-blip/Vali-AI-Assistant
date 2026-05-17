import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Download, Menu, Brain } from 'lucide-react'
import ChatBubble from './ChatBubble'
import TypingIndicator from './TypingIndicator'
import EmptyState from './EmptyState'
import ChatInput from './ChatInput'

export default function Chat({
  messages, isLoading, hasDocuments,
  onSend, onClear, inputValue, onInputChange, onSuggestion, onMenuToggle,
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = (text) => {
    onSend(text)
    onInputChange('')
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 relative">
      {/* Top bar */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{
          borderBottom: '1px solid rgba(99,102,241,0.1)',
          background: 'rgba(5,8,16,0.85)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle}
            className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center
              transition-all" style={{ color: '#6366f1' }}>
            <Menu size={16} />
          </button>
          <div>
            <h2 className="font-bold text-white text-sm" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.01em' }}>
              {messages.length === 0 ? 'New Conversation' : 'Knowledge Query'}
            </h2>
            <p className="text-[11px]" style={{ color: 'rgba(99,102,241,0.6)' }}>
              {hasDocuments
                ? `${messages.length} message${messages.length !== 1 ? 's' : ''} · RAG enabled`
                : 'No documents loaded'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => {
                  const text = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}`).join('\n\n---\n\n')
                  const blob = new Blob([text], { type: 'text/plain' })
                  const a = document.createElement('a')
                  a.href = URL.createObjectURL(blob)
                  a.download = 'vali-conversation.txt'
                  a.click()
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                  transition-all duration-200"
                style={{
                  color: 'rgba(148,163,184,0.6)',
                  border: '1px solid rgba(99,102,241,0.1)',
                  background: 'rgba(99,102,241,0.04)',
                }}
              >
                <Download size={12} /> Export
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ color: 'rgba(239,68,68,0.6)', border: '1px solid rgba(239,68,68,0.1)', background: 'rgba(239,68,68,0.04)' }}
              >
                <RotateCcw size={12} /> Clear
              </motion.button>
            </>
          )}

          {/* Status pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-400'}`} />
            <span className="text-[10px] font-medium" style={{ color: 'rgba(165,180,252,0.7)' }}>
              {isLoading ? 'Thinking' : 'Online'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto min-h-0"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(99,102,241,0.2) transparent',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.03) 0%, transparent 60%)',
        }}>
        {messages.length === 0 ? (
          <EmptyState hasDocuments={hasDocuments} onSuggestion={(text) => {
            onInputChange(text)
            setTimeout(() => handleSend(text), 100)
          }} />
        ) : (
          <div className="px-4 md:px-8 py-6 space-y-6 max-w-4xl mx-auto">
            <AnimatePresence initial={false}>
              {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
            </AnimatePresence>
            <AnimatePresence>
              {isLoading && <TypingIndicator />}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="max-w-4xl mx-auto w-full">
        <ChatInput
          value={inputValue}
          onChange={onInputChange}
          onSend={handleSend}
          isLoading={isLoading}
          disabled={false}
        />
      </div>
    </div>
  )
}
