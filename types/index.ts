export interface Document {
  id: string
  name: string
  content: string
  uploadedAt: Date
  type: string
  size: number
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  timestamp: Date
}

export interface Citation {
  documentId: string
  documentName: string
  text: string
  relevanceScore: number
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
}

export interface EmbeddingResult {
  text: string
  embedding: number[]
  documentId: string
  documentName: string
}
