'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Bot, FileSearch, ChevronRight } from 'lucide-react'
import { ChatMessage, Document, Citation } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'

interface ChatInterfaceProps {
  documents: Document[]
  messages: ChatMessage[]
  onNewMessage: (message: ChatMessage) => void
}

const PROMPT_SUGGESTIONS = [
  'Summarize the key points',
  'What are the main findings?',
  'List the action items',
  'Explain the methodology',
]

export default function ChatInterface({ documents, messages, onNewMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [typingMessage, setTypingMessage] = useState('')
  const [highlightedCitation, setHighlightedCitation] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingMessage])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || documents.length === 0) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    onNewMessage(userMessage)
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          documents: documents.map(d => ({ id: d.id, name: d.name, content: d.content })),
          history: messages,
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || errData.details || 'Server error')
      }
      const data = await response.json()

      // Typing animation
      const fullText = data.response
      setTypingMessage('')
      for (let i = 0; i < fullText.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 8))
        setTypingMessage(fullText.slice(0, i + 1))
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        citations: data.citations,
        timestamp: new Date(),
      }

      onNewMessage(assistantMessage)
      setTypingMessage('')
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key configuration.',
        timestamp: new Date(),
      }
      onNewMessage(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCitationClick = (citation: Citation) => {
    setHighlightedCitation(citation.text)
    setTimeout(() => setHighlightedCitation(null), 3000)
  }

  const canSend = input.trim() && !isLoading && documents.length > 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Subtle radial glow backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30 dark:opacity-20"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, hsl(var(--primary) / 0.12), transparent 70%)',
        }}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 space-y-6 relative">

        {/* Empty state */}
        {messages.length === 0 && !typingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="max-w-xl mx-auto text-center pt-10"
          >
            {/* Animated icon */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="w-24 h-24 mx-auto mb-7 rounded-3xl flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.25), hsl(var(--accent) / 0.2))',
                border: '1px solid hsl(var(--primary) / 0.3)',
                boxShadow: '0 0 40px -10px hsl(var(--primary) / 0.4), 0 0 80px -20px hsl(var(--accent) / 0.3)',
              }}
            >
              <Sparkles className="w-12 h-12 text-[hsl(var(--primary))]" />
            </motion.div>

            <h2 className="text-3xl font-display font-bold tracking-tight mb-3 text-gradient-animated">
              Ask anything about your docs
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              Upload your documents and I'll answer questions with precise citations pulled directly from your files.
            </p>

            {documents.length === 0 ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-muted/70 border border-border text-sm text-muted-foreground"
              >
                <span className="text-base">☝️</span>
                <span>Upload documents using the button above</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </motion.div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-[hsl(var(--primary))] font-medium">
                  ✅ {documents.length} document{documents.length > 1 ? 's' : ''} ready — try asking:
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {PROMPT_SUGGESTIONS.map((prompt) => (
                    <motion.button
                      key={prompt}
                      whileHover={{ scale: 1.04, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setInput(prompt)}
                      className="px-4 py-2 text-sm rounded-xl border border-[hsl(var(--primary))/0.25] bg-[hsl(var(--primary))/0.06] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))/0.12] hover:border-[hsl(var(--primary))/0.5] transition-all font-medium"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Messages list */}
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* AI avatar */}
              {message.role === 'assistant' && (
                <div
                  className="w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center mt-1"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                    boxShadow: '0 0 16px -4px hsl(var(--primary) / 0.5)',
                  }}
                >
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className={`max-w-[82%] space-y-3 ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                {message.role === 'user' ? (
                  <div
                    className="px-4 py-3 rounded-2xl rounded-tr-sm text-white text-sm leading-relaxed"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                      boxShadow: '0 4px 20px -6px hsl(var(--primary) / 0.45)',
                    }}
                  >
                    {message.content}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest flex items-center gap-1.5 ml-0.5">
                      <FileSearch className="w-3 h-3" />
                      AI Assistant
                    </div>
                    <div
                      className="px-5 py-4 rounded-2xl rounded-tl-sm border border-border/60 text-sm leading-relaxed"
                      style={{ background: 'hsl(var(--card) / 0.7)', backdropFilter: 'blur(12px)' }}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:font-display">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {/* Citations */}
                {message.citations && message.citations.length > 0 && (
                  <div className="space-y-2 pl-0.5">
                    <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      📎 {message.citations.length} Source{message.citations.length > 1 ? 's' : ''}
                    </p>
                    <div className="space-y-1.5">
                      {message.citations.map((citation, idx) => (
                        <motion.button
                          key={idx}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.06 }}
                          onClick={() => handleCitationClick(citation)}
                          className={`citation-chip w-full text-left ${highlightedCitation === citation.text ? 'highlighted' : ''
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[hsl(var(--primary))] mb-1 flex items-center gap-1">
                                <FileSearch className="w-3 h-3" />
                                {citation.documentName}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-2 italic">
                                "{citation.text}"
                              </p>
                            </div>
                            <span
                              className="flex-shrink-0 px-2 py-0.5 text-[10px] font-bold rounded-full"
                              style={{
                                background: 'hsl(var(--primary) / 0.15)',
                                color: 'hsl(var(--primary))',
                              }}
                            >
                              {Math.round(citation.relevanceScore * 100)}%
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing animation */}
        {typingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div
              className="w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center mt-1"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                boxShadow: '0 0 16px -4px hsl(var(--primary) / 0.5)',
              }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="max-w-[82%] space-y-2">
              <div className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest flex items-center gap-1.5 ml-0.5">
                <FileSearch className="w-3 h-3" />
                AI Assistant
              </div>
              <div
                className="px-5 py-4 rounded-2xl rounded-tl-sm border border-border/60 text-sm leading-relaxed"
                style={{ background: 'hsl(var(--card) / 0.7)', backdropFilter: 'blur(12px)' }}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1">
                  <ReactMarkdown>{typingMessage}</ReactMarkdown>
                </div>
                <span className="typing-cursor" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Thinking indicator */}
        {isLoading && !typingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div
              className="w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                boxShadow: '0 0 16px -4px hsl(var(--primary) / 0.5)',
              }}
            >
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div
              className="px-5 py-4 rounded-2xl rounded-tl-sm border border-border/60 flex items-center"
              style={{ background: 'hsl(var(--card) / 0.7)', backdropFilter: 'blur(12px)' }}
            >
              <div className="dot-typing flex gap-1.5">
                <span />
                <span />
                <span />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="relative border-t border-border/60 glass px-4 md:px-8 py-4">
        {/* Subtle top glow line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))/0.3] to-transparent" />

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div
            className="flex items-end gap-3 p-2 rounded-2xl border transition-all"
            style={{
              borderColor: input ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--border))',
              background: 'hsl(var(--card) / 0.6)',
              backdropFilter: 'blur(16px)',
              boxShadow: input
                ? '0 0 0 3px hsl(var(--primary) / 0.12), 0 4px 20px -4px hsl(var(--primary) / 0.2)'
                : '0 2px 12px -4px hsl(var(--foreground) / 0.06)',
            }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
              placeholder={
                documents.length === 0
                  ? 'Upload documents to start asking questions…'
                  : 'Ask a question about your documents…'
              }
              disabled={isLoading || documents.length === 0}
              rows={1}
              className="flex-1 resize-none px-3 py-2 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground/60 disabled:opacity-40 disabled:cursor-not-allowed leading-relaxed"
              style={{ minHeight: '40px', maxHeight: '120px' }}
            />

            <motion.button
              type="submit"
              disabled={!canSend}
              whileHover={canSend ? { scale: 1.06 } : {}}
              whileTap={canSend ? { scale: 0.94 } : {}}
              className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={
                canSend
                  ? {
                    background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))',
                    boxShadow: '0 4px 16px -4px hsl(var(--primary) / 0.6)',
                  }
                  : { background: 'hsl(var(--muted))' }
              }
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" strokeWidth={2.5} />
              )}
            </motion.button>
          </div>

          <p className="text-[11px] text-muted-foreground/50 mt-2 text-center">
            Press <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">Enter</kbd> to send
            &nbsp;·&nbsp;
            <kbd className="px-1 py-0.5 rounded bg-muted text-muted-foreground font-mono text-[10px]">Shift+Enter</kbd> for new line
          </p>
        </form>
      </div>
    </div>
  )
}
