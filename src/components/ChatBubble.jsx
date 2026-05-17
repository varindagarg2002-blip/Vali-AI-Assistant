import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, AlertTriangle, Brain, User, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

const formatTime = (date) =>
  new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit', hour12: true })
    .format(date instanceof Date ? date : new Date(date))

const inlineFormat = (text) =>
  text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#c7d2fe;font-weight:600">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#ddd6fe">$1</em>')
    .replace(/`(.+?)`/g, '<code style="background:rgba(99,102,241,0.12);color:#a5b4fc;padding:2px 6px;border-radius:4px;font-size:13px;font-family:JetBrains Mono,monospace;border:1px solid rgba(99,102,241,0.2)">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#818cf8;text-decoration:underline;text-underline-offset:2px" target="_blank">$1</a>')

const SimpleMarkdown = ({ content }) => {
  const lines = content.split('\n')
  const elements = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim()
      const codeLines = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) { codeLines.push(lines[i]); i++ }
      elements.push(
        <div key={`code-${i}`} className="my-3">
          {lang && (
            <div className="flex items-center px-3 py-1.5 rounded-t-lg"
              style={{ background: '#060910', border: '1px solid rgba(99,102,241,0.2)', borderBottom: 'none' }}>
              <span className="text-[10px] font-mono" style={{ color: 'rgba(129,140,248,0.6)' }}>{lang}</span>
            </div>
          )}
          <pre style={{ background: '#060910', border: '1px solid rgba(99,102,241,0.2)', padding: '12px', overflow: 'auto', borderRadius: lang ? '0 0 8px 8px' : '8px', margin: 0 }}>
            <code style={{ color: '#c7d2fe', fontSize: '13px', fontFamily: 'JetBrains Mono,monospace', lineHeight: 1.6 }}>
              {codeLines.join('\n')}
            </code>
          </pre>
        </div>
      )
      i++; continue
    }
    if (line.startsWith('### ')) { elements.push(<h3 key={i} style={{ color: 'white', fontWeight: 600, fontSize: '14px', margin: '12px 0 4px' }}>{line.slice(4)}</h3>) }
    else if (line.startsWith('## ')) { elements.push(<h2 key={i} style={{ color: 'white', fontWeight: 600, fontSize: '15px', margin: '12px 0 4px' }}>{line.slice(3)}</h2>) }
    else if (line.startsWith('# ')) { elements.push(<h1 key={i} style={{ color: 'white', fontWeight: 700, fontSize: '17px', margin: '12px 0 6px' }}>{line.slice(2)}</h1>) }
    else if (/^[*\-] /.test(line)) {
      const items = []
      while (i < lines.length && /^[*\-] /.test(lines[i])) { items.push(lines[i].slice(2)); i++ }
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: '8px 0', padding: 0, listStyle: 'none' }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
              <span style={{ color: '#818cf8', marginTop: '8px', fontSize: '7px', flexShrink: 0 }}>●</span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ul>
      )
      continue
    }
    else if (/^\d+\. /.test(line)) {
      const items = []
      while (i < lines.length && /^\d+\. /.test(lines[i])) { items.push(lines[i].replace(/^\d+\. /, '')); i++ }
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: '8px 0', padding: 0, listStyle: 'none' }}>
          {items.map((item, j) => (
            <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '4px', color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6 }}>
              <span style={{ color: '#818cf8', fontFamily: 'JetBrains Mono', fontSize: '11px', marginTop: '2px', background: 'rgba(99,102,241,0.1)', width: '20px', height: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{j + 1}</span>
              <span dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />
            </li>
          ))}
        </ol>
      )
      continue
    }
    else if (line.startsWith('> ')) { elements.push(<blockquote key={i} style={{ borderLeft: '2px solid rgba(99,102,241,0.4)', paddingLeft: '12px', margin: '8px 0', color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>{line.slice(2)}</blockquote>) }
    else if (/^---+$/.test(line.trim())) { elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(99,102,241,0.15)', margin: '12px 0' }} />) }
    else if (line.trim() === '') { elements.length > 0 && elements.push(<div key={`sp-${i}`} style={{ height: '6px' }} />) }
    else { elements.push(<p key={i} style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.75 }} dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />) }
    i++
  }
  return <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>{elements}</div>
}

export default function ChatBubble({ message }) {
  const [copied, setCopied] = useState(false)
  const [sourcesOpen, setSourcesOpen] = useState(false)
  const isUser = message.role === 'user'

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex gap-3 group ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
        style={{
          background: isUser
            ? 'linear-gradient(135deg,#4f46e5,#7c3aed)'
            : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
          boxShadow: isUser
            ? '0 0 12px rgba(79,70,229,0.35)'
            : '0 0 12px rgba(99,102,241,0.4)',
        }}>
        {isUser ? <User size={13} className="text-white" /> : <Brain size={13} className="text-white" strokeWidth={2} />}
      </div>

      <div className={`flex flex-col gap-1.5 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={`relative px-4 py-3 rounded-2xl ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}
            ${message.isError ? '' : ''}`}
          style={isUser ? {
            background: 'linear-gradient(135deg,#4f46e5,#6366f1)',
            boxShadow: '0 4px 20px rgba(79,70,229,0.3)',
            color: 'white',
          } : message.isError ? {
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
          } : {
            background: 'rgba(10,13,24,0.9)',
            border: '1px solid rgba(99,102,241,0.15)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          }}
        >
          {message.isError ? (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p style={{ color: '#fca5a5', fontSize: '14px' }}>{message.content}</p>
            </div>
          ) : isUser ? (
            <p style={{ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{message.content}</p>
          ) : (
            <SimpleMarkdown content={message.content} />
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources?.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <button onClick={() => setSourcesOpen(!sourcesOpen)}
              className="flex items-center gap-1.5 px-1 py-0.5 transition-colors"
              style={{ color: 'rgba(99,102,241,0.5)', fontSize: '11px' }}>
              <ExternalLink size={10} />
              {message.sources.length} source{message.sources.length > 1 ? 's' : ''}
              {sourcesOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
            <AnimatePresence>
              {sourcesOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {message.sources.map((src, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-lg text-[11px] font-medium"
                        style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                        {typeof src === 'string' ? src : src.source || `Source ${idx + 1}`}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Time + copy */}
        <div className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span style={{ fontSize: '10px', color: 'rgba(99,102,241,0.35)' }}>{formatTime(message.timestamp)}</span>
          {!isUser && (
            <motion.button
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={copyToClipboard}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md"
              style={{ color: 'rgba(99,102,241,0.4)' }}
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
