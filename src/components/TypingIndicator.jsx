import React from 'react'
import { motion } from 'framer-motion'
import { Brain } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 items-end"
    >
      <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          boxShadow: '0 0 14px rgba(99,102,241,0.4)',
        }}
      >
        <Brain size={13} className="text-white" strokeWidth={2} />
      </div>

      <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5"
        style={{
          background: 'rgba(15,18,30,0.9)',
          border: '1px solid rgba(99,102,241,0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: '#818cf8' }} />
        <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: '#a78bfa' }} />
        <span className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: '#818cf8' }} />
      </div>

      <span className="text-[10px] mb-1 font-medium" style={{ color: 'rgba(99,102,241,0.5)' }}>
        VALI is thinking...
      </span>
    </motion.div>
  )
}
