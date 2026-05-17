import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Search, FileText, Zap, ArrowRight, Sparkles } from 'lucide-react'

const suggestions = [
  { icon: Search,   text: 'Summarize the key points of this document', color: 'indigo' },
  { icon: FileText, text: 'What are the main conclusions?',             color: 'violet' },
  { icon: Zap,      text: 'List the most important facts',              color: 'cyan'   },
]

const colorMap = {
  indigo: { bg: 'rgba(99,102,241,0.08)',  text: '#818cf8', border: 'rgba(99,102,241,0.2)'  },
  violet: { bg: 'rgba(139,92,246,0.08)', text: '#a78bfa', border: 'rgba(139,92,246,0.2)' },
  cyan:   { bg: 'rgba(6,182,212,0.08)',  text: '#22d3ee', border: 'rgba(6,182,212,0.2)'  },
}

export default function EmptyState({ hasDocuments, onSuggestion }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full px-8 pb-24"
    >
      {/* Hero */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="relative mb-8"
      >
        {/* Outer glow ring */}
        <div className="absolute -inset-4 rounded-full opacity-20 blur-xl"
          style={{ background: 'radial-gradient(circle, #6366f1, #8b5cf6, transparent)' }} />

        <div className="w-24 h-24 rounded-3xl flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.15))',
            border: '1px solid rgba(99,102,241,0.25)',
            boxShadow: '0 0 40px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <Brain size={38} style={{ color: '#818cf8' }} strokeWidth={1.5} />
          {/* Live dot */}
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
            style={{ background: '#10b981', boxShadow: '0 0 10px rgba(16,185,129,0.6)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-2 tracking-tight leading-none"
          style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}>
          {hasDocuments ? (
            <>Ask <span style={{ background: 'linear-gradient(135deg,#818cf8,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VALI</span> anything</>
          ) : (
            <>Hello, I'm <span style={{ background: 'linear-gradient(135deg,#818cf8,#c4b5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>VALI</span></>
          )}
        </h2>
        <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>
          {hasDocuments
            ? 'Your documents are loaded. Ask me anything — I\'ll search through them and give you precise answers.'
            : 'Upload a document and I\'ll become an expert on it instantly. Ask questions, get summaries, extract insights.'
          }
        </p>
      </motion.div>

      {/* Suggestions */}
      {hasDocuments ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md space-y-2"
        >
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-center mb-4"
            style={{ color: 'rgba(99,102,241,0.5)' }}>
            Try asking
          </p>
          {suggestions.map((s, i) => {
            const c = colorMap[s.color]
            const Icon = s.icon
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSuggestion(s.text)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left group transition-all duration-200"
                style={{
                  background: c.bg,
                  border: `1px solid ${c.border}`,
                }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${c.bg}` }}>
                  <Icon size={13} style={{ color: c.text }} />
                </div>
                <span className="text-sm flex-1" style={{ color: '#94a3b8' }}>{s.text}</span>
                <ArrowRight size={12} style={{ color: 'rgba(148,163,184,0.3)' }}
                  className="group-hover:text-slate-400 transition-colors" />
              </motion.button>
            )
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="flex items-center gap-2">
            {['PDF', 'DOCX', 'TXT', 'CSV', 'MD'].map((fmt, i) => (
              <motion.div key={fmt}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium"
                style={{
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.15)',
                  color: 'rgba(129,140,248,0.6)',
                }}>
                {fmt}
              </motion.div>
            ))}
          </div>
          <p className="text-[11px]" style={{ color: 'rgba(148,163,184,0.3)' }}>
            ← Upload a file from the sidebar to get started
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
