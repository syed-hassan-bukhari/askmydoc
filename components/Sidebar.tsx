'use client'

import { Plus, MessageSquare, FileText, Trash2, BookOpen, Clock } from 'lucide-react'
import { ChatSession, Document } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

interface SidebarProps {
  sessions: ChatSession[]
  documents: Document[]
  currentSessionId: string | null
  onNewSession: () => void
  onSelectSession: (id: string) => void
  onDeleteSession: (id: string) => void
  onDeleteDocument: (id: string) => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function Sidebar({
  sessions,
  documents,
  currentSessionId,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onDeleteDocument,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<'chats' | 'documents'>('chats')

  return (
    <aside className="w-72 h-full flex flex-col overflow-hidden border-r border-border/60 sidebar-bg">
      {/* Brand strip */}
      <div className="px-5 pt-5 pb-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl font-semibold text-sm text-white relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
            boxShadow: '0 4px 20px -6px hsl(var(--primary) / 0.6)',
          }}
        >
          <span className="absolute inset-0 bg-white/0 hover:bg-white/10 transition-all" />
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          New Conversation
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex px-3 gap-1 mb-1">
        {(['chats', 'documents'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
              ? 'text-[hsl(var(--primary))]'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="sidebar-tab"
                className="absolute inset-0 rounded-lg"
                style={{ background: 'hsl(var(--primary) / 0.1)' }}
                transition={{ type: 'spring', stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {tab === 'chats' ? (
                <MessageSquare className="w-3.5 h-3.5" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              {tab === 'chats' ? 'Chats' : 'Docs'}
              {tab === 'documents' && documents.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(var(--primary))/0.15] text-[hsl(var(--primary))]">
                  {documents.length}
                </span>
              )}
              {tab === 'chats' && sessions.length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[hsl(var(--primary))/0.15] text-[hsl(var(--primary))]">
                  {sessions.length}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="mx-4 mb-3 h-px bg-border/50" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1.5">
        <AnimatePresence mode="wait">
          {activeTab === 'chats' ? (
            <motion.div
              key="chats"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.18 }}
              className="space-y-1.5"
            >
              {sessions.length === 0 ? (
                <div className="text-center py-14">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-muted/60 flex items-center justify-center">
                    <MessageSquare className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Upload docs &amp; start chatting</p>
                </div>
              ) : (
                sessions.map((session, i) => (
                  <motion.button
                    key={session.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => onSelectSession(session.id)}
                    className={`w-full group flex items-start gap-3 p-3 rounded-xl text-left transition-all border ${currentSessionId === session.id
                      ? 'border-[hsl(var(--primary))/0.35] bg-[hsl(var(--primary))/0.08] text-[hsl(var(--primary))]'
                      : 'border-transparent hover:border-border hover:bg-muted/60'
                      }`}
                  >
                    <div className={`mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${currentSessionId === session.id
                      ? 'bg-[hsl(var(--primary))/0.2]'
                      : 'bg-muted'
                      }`}>
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-snug">
                        {session.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-2.5 h-2.5 text-muted-foreground/60" />
                        <p className="text-[11px] text-muted-foreground/70">
                          {session.messages.length} msg{session.messages.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 mt-0.5 p-1.5 rounded-lg hover:bg-red-500/15 text-muted-foreground hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.button>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="documents"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="space-y-1.5"
            >
              {documents.length === 0 ? (
                <div className="text-center py-14">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-muted/60 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">No documents yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Click Upload Docs to begin</p>
                </div>
              ) : (
                documents.map((doc, i) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/60 transition-all"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))/0.15] to-[hsl(var(--accent))/0.1] flex items-center justify-center flex-shrink-0 border border-[hsl(var(--primary))/0.2]">
                      <FileText className="w-4 h-4 text-[hsl(var(--primary))]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-[11px] text-muted-foreground/70">
                        {doc.size ? formatBytes(doc.size) : ''} · {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/15 text-muted-foreground hover:text-red-500 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  )
}
