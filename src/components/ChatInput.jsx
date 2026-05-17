import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Square, Paperclip } from 'lucide-react'

export default function ChatInput({ onSend, isLoading, disabled, value, onChange }) {
  const textareaRef = useRef(null)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [value])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && value.trim()) {
      e.preventDefault()
      onSend(value)
    }
  }

  const canSend = value.trim().length > 0 && !isLoading && !disabled

  return (
    <div className="relative px-4 pb-4 pt-2 flex-shrink-0">
      {/* Fade */}
      <div className="absolute -top-8 left-0 right-0 h-8 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #050810, transparent)' }} />

      <motion.div
        animate={{
          boxShadow: isFocused
            ? '0 0 0 1px rgba(99,102,241,0.4), 0 0 30px rgba(99,102,241,0.1), 0 8px 32px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(0,0,0,0.3)',
          borderColor: isFocused ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.12)',
        }}
        transition={{ duration: 0.2 }}
        className="relative rounded-2xl"
        style={{
          background: 'rgba(10,13,24,0.95)',
          border: '1px solid rgba(99,102,241,0.12)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={disabled ? 'Upload a document to begin...' : 'Ask VALI anything about your documents...'}
          disabled={disabled}
          rows={1}
          className="w-full bg-transparent text-sm px-4 pt-3.5 pb-3 resize-none outline-none leading-relaxed pr-14 disabled:cursor-not-allowed"
          style={{
            maxHeight: '160px',
            fontFamily: 'DM Sans, system-ui, sans-serif',
            color: '#e2e8f0',
          }}
        />

        <div className="flex items-center justify-between px-3 pb-2.5">
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
              style={{ color: 'rgba(99,102,241,0.4)' }}
            >
              <Paperclip size={13} />
            </motion.button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono" style={{ color: 'rgba(99,102,241,0.3)' }}>
              {value.length > 0 ? `${value.length} chars` : 'Enter ↵'}
            </span>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.button
                  key="stop"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
                >
                  <Square size={12} fill="currentColor" />
                </motion.button>
              ) : (
                <motion.button
                  key="send"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  whileHover={canSend ? { scale: 1.08 } : {}}
                  whileTap={canSend ? { scale: 0.95 } : {}}
                  onClick={() => canSend && onSend(value)}
                  disabled={!canSend}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={canSend ? {
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    boxShadow: '0 0 18px rgba(99,102,241,0.45)',
                    color: 'white',
                  } : {
                    background: 'rgba(99,102,241,0.08)',
                    color: 'rgba(99,102,241,0.25)',
                    cursor: 'not-allowed',
                  }}
                >
                  <Send size={13} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <p className="text-center text-[10px] mt-2" style={{ color: 'rgba(99,102,241,0.25)' }}>
        VALI may make mistakes. Verify important information.
      </p>
    </div>
  )
}
