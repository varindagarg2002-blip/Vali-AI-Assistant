import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, Trash2, Database, Zap, BookOpen,
  AlertCircle, CheckCircle2, Loader2, Plus, Brain,
} from 'lucide-react'

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const getFileIcon = (type) => {
  if (type?.includes('pdf')) return '📄'
  if (type?.includes('word') || type?.includes('docx')) return '📝'
  if (type?.includes('text')) return '📃'
  if (type?.includes('csv')) return '📊'
  return '📁'
}

export default function Sidebar({
  documents, isUploading, uploadProgress,
  uploadError, onUpload, onDelete, onNewChat,
}) {
  const fileInputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [hoveredDoc, setHoveredDoc] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onUpload(file)
  }

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-72 flex-shrink-0 flex flex-col h-full relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #080d1a 0%, #050810 100%)',
        borderRight: '1px solid rgba(99,102,241,0.12)',
      }}
    >
      {/* Top ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
      />

      {/* ── Logo ── */}
      <div className="px-5 pt-6 pb-5 flex-shrink-0 relative">
        <div className="flex items-center gap-3">
          {/* VALI logo mark */}
          <div className="relative w-9 h-9 flex-shrink-0">
            <div className="absolute inset-0 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
                boxShadow: '0 0 20px rgba(99,102,241,0.5), 0 0 40px rgba(99,102,241,0.2)',
              }}
            />
            <div className="absolute inset-0 rounded-xl flex items-center justify-center">
              <Brain size={16} className="text-white" strokeWidth={2} />
            </div>
            {/* Pulse ring */}
            <div className="absolute -inset-0.5 rounded-xl opacity-40"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite',
                zIndex: -1,
              }}
            />
          </div>

          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.3rem', letterSpacing: '-0.02em' }}
              className="text-white leading-none">
              VALI
            </h1>
            <p className="text-[10px] font-medium tracking-[0.18em] uppercase mt-0.5"
              style={{ color: '#6366f1' }}>
              AI Assistant
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="mt-5 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent)' }}
        />
      </div>

      {/* ── New Chat ── */}
      <div className="px-4 mb-5 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium
            transition-all duration-200 group relative overflow-hidden"
          style={{
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            color: '#a5b4fc',
          }}
        >
          <div className="w-5 h-5 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.2)' }}>
            <Plus size={11} className="text-indigo-400" />
          </div>
          New Conversation
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(99,102,241,0.05)' }} />
        </motion.button>
      </div>

      {/* ── Upload ── */}
      <div className="px-4 flex-shrink-0">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase mb-2.5 px-1"
          style={{ color: 'rgba(99,102,241,0.6)' }}>
          Knowledge Base
        </p>

        <input ref={fileInputRef} type="file" className="hidden"
          accept=".pdf,.txt,.doc,.docx,.csv,.md" onChange={handleFileChange} />

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          disabled={isUploading}
          className="w-full rounded-2xl p-4 flex flex-col items-center gap-2.5
            transition-all duration-300 cursor-pointer group relative overflow-hidden"
          style={{
            border: dragOver
              ? '2px dashed #6366f1'
              : isUploading
              ? '2px dashed rgba(99,102,241,0.2)'
              : '2px dashed rgba(99,102,241,0.25)',
            background: dragOver
              ? 'rgba(99,102,241,0.08)'
              : 'rgba(99,102,241,0.03)',
          }}
        >
          {isUploading ? (
            <>
              <Loader2 size={20} className="animate-spin" style={{ color: '#6366f1' }} />
              <div className="w-full">
                <div className="flex justify-between text-[11px] mb-1.5" style={{ color: 'rgba(165,180,252,0.6)' }}>
                  <span>Processing...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                }}>
                <Upload size={15} style={{ color: '#818cf8' }} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium" style={{ color: '#94a3b8' }}>
                  Drop or <span style={{ color: '#818cf8' }}>browse files</span>
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(148,163,184,0.4)' }}>
                  PDF · TXT · DOCX · CSV · MD
                </p>
              </div>
            </>
          )}
        </motion.button>

        <AnimatePresence>
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-2 flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle size={12} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-[11px]">{uploadError}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Documents ── */}
      <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-1 min-h-0"
        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.2) transparent' }}>
        <AnimatePresence>
          {documents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 gap-3"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                <Database size={18} style={{ color: 'rgba(99,102,241,0.4)' }} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium" style={{ color: 'rgba(148,163,184,0.5)' }}>No documents yet</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'rgba(148,163,184,0.3)' }}>Upload to start querying</p>
              </div>
            </motion.div>
          ) : (
            documents.map((doc, i) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ delay: i * 0.04 }}
                onMouseEnter={() => setHoveredDoc(doc.id)}
                onMouseLeave={() => setHoveredDoc(null)}
                className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer"
                style={{
                  background: hoveredDoc === doc.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                  border: hoveredDoc === doc.id ? '1px solid rgba(99,102,241,0.15)' : '1px solid transparent',
                }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: 'rgba(99,102,241,0.1)' }}>
                  {getFileIcon(doc.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: '#cbd5e1' }}>{doc.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[10px]" style={{ color: 'rgba(148,163,184,0.5)' }}>{formatFileSize(doc.size)}</p>
                    {doc.chunkCount > 0 && (
                      <>
                        <span style={{ color: 'rgba(148,163,184,0.3)', fontSize: '10px' }}>·</span>
                        <p className="text-[10px]" style={{ color: 'rgba(148,163,184,0.5)' }}>{doc.chunkCount} chunks</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-emerald-500 opacity-60" />
                  <AnimatePresence>
                    {hoveredDoc === doc.id && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={(e) => { e.stopPropagation(); onDelete(doc.id) }}
                        className="w-5 h-5 rounded-md flex items-center justify-center ml-1 transition-colors"
                        style={{ background: 'rgba(239,68,68,0.1)' }}
                      >
                        <Trash2 size={10} className="text-red-400" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-4 flex-shrink-0">
        <div className="h-px mb-3"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)' }} />
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Zap size={10} className="text-white" />
          </div>
          <p className="text-[10px] font-medium" style={{ color: 'rgba(148,163,184,0.4)' }}>
            Powered by Groq · Llama 3.3
          </p>
        </div>
      </div>
    </motion.aside>
  )
}
