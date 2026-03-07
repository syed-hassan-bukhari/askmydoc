import { NextRequest, NextResponse } from 'next/server'
import { InferenceClient } from '@huggingface/inference'

// ── Hugging Face client (new router.huggingface.co endpoint) ──────────────
const hf = new InferenceClient(process.env.HF_TOKEN || '')

// Chat model — fully open, no gated access required
const CHAT_MODEL = 'Qwen/Qwen2.5-7B-Instruct'
// Real semantic embedding model
const EMBED_MODEL = 'sentence-transformers/all-MiniLM-L6-v2'

// ── Math helpers ──────────────────────────────────────────────────────────
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB)
  return denom === 0 ? 0 : dot / denom
}

// ── Real semantic embedding via HF router ─────────────────────────────────
async function embed(text: string): Promise<number[]> {
  const truncated = text.slice(0, 2000) // stay under ~512 tokens
  const result = await hf.featureExtraction({
    model: EMBED_MODEL,
    inputs: truncated,
  })
  // v3 returns number[] for a single string input
  if (Array.isArray(result) && typeof result[0] === 'number') {
    return result as number[]
  }
  // Safety: if 2D, take first row
  return (result as number[][])[0]
}

// Batch embed with small delay to respect free-tier rate limits
async function embedBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = []
  for (const text of texts) {
    results.push(await embed(text))
    await new Promise(r => setTimeout(r, 120))
  }
  return results
}

// ── Text chunking ──────────────────────────────────────────────────────────
function chunkText(text: string, chunkSize = 400, overlap = 80): string[] {
  const words = text.split(/\s+/)
  const chunks: string[] = []
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ')
    if (chunk.trim()) chunks.push(chunk)
  }
  return chunks
}

// ── Types ──────────────────────────────────────────────────────────────────
interface Document { id: string; name: string; content: string }
interface Citation { documentId: string; documentName: string; text: string; relevanceScore: number }

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { message, documents, history } = await request.json()

    if (!process.env.HF_TOKEN) {
      return NextResponse.json(
        { error: 'HF_TOKEN not configured. Please add it to your .env file.' },
        { status: 500 }
      )
    }

    if (!message || !documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'Message and documents are required' },
        { status: 400 }
      )
    }

    // 1️⃣  Embed the user query
    const queryEmbedding = await embed(message)

    // 2️⃣  Build + embed all document chunks
    const rawChunks: Array<{ text: string; documentId: string; documentName: string }> = []
    for (const doc of documents as Document[]) {
      for (const chunk of chunkText(doc.content)) {
        rawChunks.push({ text: chunk, documentId: doc.id, documentName: doc.name })
      }
    }

    const chunkEmbeddings = await embedBatch(rawChunks.map(c => c.text))

    // 3️⃣  Rank by cosine similarity, take top 5
    const scored = rawChunks
      .map((chunk, i) => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunkEmbeddings[i]) }))
      .sort((a, b) => b.score - a.score)

    const topChunks = scored.slice(0, 5)

    // 4️⃣  Build context for the prompt
    const context = topChunks
      .map((c, i) => `[Source ${i + 1}: ${c.documentName}]\n${c.text}`)
      .join('\n\n---\n\n')

    // 5️⃣  Last 4 conversation turns
    const conversationHistory = history
      ?.slice(-4)
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n\n') || ''

    // 6️⃣  System prompt
    const systemContent = `You are a helpful AI assistant that answers questions based on provided document excerpts.

CONTEXT FROM DOCUMENTS:
${context}

Instructions:
1. Answer using ONLY information from the context above.
2. If the answer isn't in the context, say "I don't have enough information to answer that from the uploaded documents."
3. Cite which source(s) you used.
4. Be concise, clear, and professional.`

    const userContent = conversationHistory
      ? `${conversationHistory}\n\nUser: ${message}`
      : message

    // 7️⃣  Generate response (streaming)
    let response = ''
    const stream = hf.chatCompletionStream({
      model: CHAT_MODEL,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: userContent },
      ],
      max_tokens: 1024,
      temperature: 0.3,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content
      if (delta) response += delta
    }

    // 8️⃣  Citations from top 3
    const citations: Citation[] = topChunks.slice(0, 3).map(c => ({
      documentId: c.documentId,
      documentName: c.documentName,
      text: c.text.slice(0, 200) + (c.text.length > 200 ? '…' : ''),
      relevanceScore: Math.min(c.score, 1),
    }))

    return NextResponse.json({ response, citations, success: true })

  } catch (error: any) {
    console.error('Chat error:', error)

    let errorMessage = 'Failed to generate response'
    if (error.message?.includes('401') || error.message?.includes('token')) {
      errorMessage = 'Invalid or missing HF_TOKEN. Please check your .env file.'
    } else if (error.message?.includes('loading')) {
      errorMessage = 'Model is loading on Hugging Face. Please try again in a moment.'
    } else if (error.message?.includes('429') || error.message?.includes('rate')) {
      errorMessage = 'HF rate limit hit. Please wait a few seconds and try again.'
    }

    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: 500 }
    )
  }
}
