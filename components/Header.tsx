'use client'

import { Upload, Moon, Sun, Zap } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useRef, useState } from 'react'
import { Document } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

interface HeaderProps {
  onDocumentsUploaded: (docs: Document[]) => void
}

export default function Header({ onDocumentsUploaded }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadCount, setUploadCount] = useState(0)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const newDocs: Document[] = []

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) throw new Error('Upload failed')

        const data = await response.json()
        newDocs.push({
          id: Date.now().toString() + Math.random(),
          name: file.name,
          content: data.content,
          uploadedAt: new Date(),
          type: file.type,
          size: file.size,
        })
      } catch (error) {
        console.error('Error uploading file:', file.name, error)
      }
    }

    onDocumentsUploaded(newDocs)
    setUploadCount(c => c + newDocs.length)
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <header className="relative z-20 border-b border-border/60 glass">
      {/* Subtle top glow bar */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent opacity-60" />

      <div className="flex items-center justify-between px-6 py-3.5">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--accent))] flex items-center justify-center shadow-lg glow-primary">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            {/* Pulsing ring */}
            <span className="absolute inset-0 rounded-xl ring-2 ring-[hsl(var(--primary))/0.35] animate-ping opacity-0 [animation-duration:2s]" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight text-gradient">
              AskMyDoc
            </h1>
            <p className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">
              AI Knowledge Assistant
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm text-white overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
              boxShadow: '0 4px 20px -4px hsl(var(--primary) / 0.55)',
            }}
          >
            {/* shimmer overlay */}
            <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
            <AnimatePresence mode="wait">
              {uploading ? (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                />
              ) : (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                >
                  <Upload className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
            <span>{uploading ? 'Uploading…' : 'Upload Docs'}</span>
            {uploadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white text-[hsl(var(--primary))] text-[9px] font-bold rounded-full flex items-center justify-center shadow ring-2 ring-[hsl(var(--primary))]">
                {uploadCount}
              </span>
            )}
          </motion.button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />

          <motion.button
            whileHover={{ scale: 1.08, rotate: 15 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-border/60 hover:border-[hsl(var(--primary))/0.5] hover:bg-[hsl(var(--primary))/0.08] transition-all"
            aria-label="Toggle theme"
          >
            <AnimatePresence mode="wait">
              {theme === 'light' ? (
                <motion.div
                  key="moon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon className="w-4.5 h-4.5" />
                </motion.div>
              ) : (
                <motion.div
                  key="sun"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun className="w-4.5 h-4.5 text-yellow-400" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </motion.div>
      </div>
    </header>
  )
}
