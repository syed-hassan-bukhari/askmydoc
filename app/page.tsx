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

  const currentSession = sessions.find(s => s.id === currentSessionId)

  const handleDocumentsUploaded = (newDocs: Document[]) => {
    setDocuments(prev => [...prev, ...newDocs])
  }

  const handleNewMessage = (message: ChatMessage) => {
    if (!currentSessionId) {
      // Create new session
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : ''),
        messages: [message],
        createdAt: new Date(),
      }
      setSessions(prev => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
    } else {
      // Add to existing session
      setSessions(prev => prev.map(session => 
        session.id === currentSessionId
          ? { ...session, messages: [...session.messages, message] }
          : session
      ))
    }
  }

  const handleNewSession = () => {
    setCurrentSessionId(null)
  }

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null)
    }
  }

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        sessions={sessions}
        documents={documents}
        currentSessionId={currentSessionId}
        onNewSession={handleNewSession}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onDeleteDocument={handleDeleteDocument}
      />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onDocumentsUploaded={handleDocumentsUploaded} />
        
        <ChatInterface
          documents={documents}
          messages={currentSession?.messages || []}
          onNewMessage={handleNewMessage}
        />
      </div>
    </div>
  )
}
