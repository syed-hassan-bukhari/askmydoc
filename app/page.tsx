'use client'

import { useState } from 'react'
import ChatInterface from '@/components/ChatInterface'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'
import { Document, ChatMessage, ChatSession } from '@/types'

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const currentSession = sessions.find(s => s.id === currentSessionId)

  const handleDocumentsUploaded = (newDocs: Document[]) => {
    setDocuments(prev => [...prev, ...newDocs])
  }

  const handleNewMessage = (message: ChatMessage) => {
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
        messages: [message],
        createdAt: new Date(),
      }
      setSessions(prev => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
    } else {
      setSessions(prev => prev.map(session =>
        session.id === currentSessionId
          ? { ...session, messages: [...session.messages, message] }
          : session
      ))
    }
  }

  const handleNewSession = () => {
    setCurrentSessionId(null)
    setSidebarOpen(false)
  }

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setSidebarOpen(false)
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (currentSessionId === sessionId) setCurrentSessionId(null)
  }

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, static on desktop */}
      <div className={`
        fixed inset-y-0 left-0 z-50 md:relative md:z-auto md:translate-x-0 md:flex
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          sessions={sessions}
          documents={documents}
          currentSessionId={currentSessionId}
          onNewSession={handleNewSession}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onDeleteDocument={handleDeleteDocument}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header
          onDocumentsUploaded={handleDocumentsUploaded}
          onMenuToggle={() => setSidebarOpen(o => !o)}
          sidebarOpen={sidebarOpen}
        />
        <ChatInterface
          documents={documents}
          messages={currentSession?.messages || []}
          onNewMessage={handleNewMessage}
        />
      </div>
    </div>
  )
}
