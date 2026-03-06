# 🔌 API Documentation

## Overview

AskMyDoc provides two main API endpoints for document processing and chat functionality.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-app.vercel.app/api
```

---

## Endpoints

### 1. Upload Document

**POST** `/api/upload`

Upload and process a document (PDF, DOCX, or TXT).

#### Request

**Content-Type**: `multipart/form-data`

**Body Parameters**:
- `file` (required): File to upload

#### Response

**Success (200)**:
```json
{
  "content": "Extracted text content from the document...",
  "success": true
}
```

**Error (400)**:
```json
{
  "error": "No file provided"
}
```

**Error (400)**:
```json
{
  "error": "Unsupported file type. Please upload PDF, DOCX, or TXT files."
}
```

**Error (500)**:
```json
{
  "error": "Failed to process file"
}
```

#### Example

```javascript
const formData = new FormData()
formData.append('file', fileInput.files[0])

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})

const data = await response.json()
console.log(data.content)
```

#### Supported File Types

| Extension | MIME Type | Max Size |
|-----------|-----------|----------|
| .pdf | application/pdf | 10MB |
| .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document | 10MB |
| .txt | text/plain | 5MB |

---

### 2. Chat with Documents

**POST** `/api/chat`

Send a message and get AI-powered response with citations.

#### Request

**Content-Type**: `application/json`

**Body Parameters**:
```typescript
{
  message: string           // User's question
  documents: Array<{        // Uploaded documents
    id: string
    name: string
    content: string
  }>
  history?: Array<{         // Optional conversation history
    role: 'user' | 'assistant'
    content: string
  }>
}
```

#### Response

**Success (200)**:
```json
{
  "response": "AI-generated answer based on documents...",
  "citations": [
    {
      "documentId": "123",
      "documentName": "example.pdf",
      "text": "Relevant text excerpt from document...",
      "relevanceScore": 0.87
    }
  ],
  "success": true
}
```

**Error (400)**:
```json
{
  "error": "Message and documents are required"
}
```

**Error (500)**:
```json
{
  "error": "HF_TOKEN not configured. Please add it to your .env file."
}
```

**Error (500)**:
```json
{
  "error": "Failed to generate response",
  "details": "Specific error message"
}
```

#### Example

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'What are the main findings?',
    documents: [
      {
        id: '1',
        name: 'research.pdf',
        content: 'Full document text...'
      }
    ],
    history: [
      {
        role: 'user',
        content: 'Previous question'
      },
      {
        role: 'assistant',
        content: 'Previous answer'
      }
    ]
  }),
})

const data = await response.json()
console.log(data.response)
console.log(data.citations)
```

---

## Data Models

### Document

```typescript
interface Document {
  id: string              // Unique identifier
  name: string            // Original filename
  content: string         // Extracted text content
  uploadedAt: Date        // Upload timestamp
  type: string            // MIME type
  size: number            // File size in bytes
}
```

### Citation

```typescript
interface Citation {
  documentId: string      // Reference to source document
  documentName: string    // Human-readable document name
  text: string            // Relevant excerpt (max 200 chars)
  relevanceScore: number  // 0-1 similarity score
}
```

### ChatMessage

```typescript
interface ChatMessage {
  id: string              // Unique identifier
  role: 'user' | 'assistant'  // Message sender
  content: string         // Message text
  citations?: Citation[]  // Optional source citations
  timestamp: Date         // Message timestamp
}
```

### ChatSession

```typescript
interface ChatSession {
  id: string              // Unique identifier
  title: string           // Session title (from first message)
  messages: ChatMessage[] // Full conversation
  createdAt: Date         // Session creation time
}
```

---

## RAG Implementation Details

### Document Processing Pipeline

1. **Upload**: File received via multipart/form-data
2. **Parse**: Extract text using appropriate library
   - PDF: `pdf-parse`
   - DOCX: `mammoth`
   - TXT: Direct read
3. **Clean**: Normalize whitespace and formatting
4. **Return**: Send extracted content to client

### Chat Processing Pipeline

1. **Receive Query**: Get user message and documents
2. **Chunk Documents**: Split text into overlapping chunks
   - Default: 500 words per chunk
   - Overlap: 100 words
3. **Create Embeddings**: Real semantic vectors via `sentence-transformers/all-MiniLM-L6-v2` (HF Inference API)
4. **Similarity Search**: Find most relevant chunks
   - Algorithm: Cosine similarity
   - Top-k: 5 chunks
5. **Build Context**: Assemble relevant chunks with metadata
6. **Generate Response**: Send to `meta-llama/Llama-3.2-3B-Instruct` (HF Inference API)
7. **Extract Citations**: Return top 3 sources with scores
8. **Return**: Send response and citations to client

### Embedding Function

Current implementation (simple):
```typescript
function simpleEmbed(text: string): number[] {
  // Character frequency embedding
  // Returns 128-dimensional vector
}
```

Current implementation (HF Inference API):
```typescript
// Real semantic embeddings via Hugging Face
const result = await hf.featureExtraction({
  model: 'sentence-transformers/all-MiniLM-L6-v2',
  inputs: text,
})
```

### Similarity Calculation

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0)
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (magnitudeA * magnitudeB)
}
```

---

## Rate Limits

### Hugging Face Inference API (Free Tier)
- **Requests**: Rate-limited (varies by model)
- **Tokens**: Up to model context window
- **Usage**: Check [huggingface.co/settings/usage](https://huggingface.co/settings/usage)

### Recommendations
- Implement client-side debouncing
- Add 100–200ms delay between embedding calls
- Cache embeddings for repeated chunks
- Upgrade to HF Pro for higher limits

---

## Error Handling

All endpoints return consistent error format:

```typescript
{
  error: string,      // Human-readable error message
  details?: string,   // Technical details (optional)
  code?: string       // Error code (optional)
}
```

### Common Error Codes

| Code | Meaning |
|------|---------|
| `INVALID_FILE_TYPE` | Unsupported file format |
| `FILE_TOO_LARGE` | File exceeds size limit |
| `MISSING_API_KEY` | HF_TOKEN not configured |
| `RATE_LIMIT` | API rate limit exceeded |
| `INVALID_REQUEST` | Malformed request body |
| `PROCESSING_ERROR` | Document processing failed |

---

## Environment Variables

Required for API functionality:

```bash
# Required
HF_TOKEN=hf_your_token_here

# Optional (future enhancements)
VECTOR_DB_URL=your_pinecone_url
REDIS_URL=your_redis_url
MAX_FILE_SIZE=10485760  # 10MB in bytes
CHUNK_SIZE=500
CHUNK_OVERLAP=100
```

---

## Security Considerations

### Input Validation
- File type checking
- File size limits
- Content sanitization
- Query length limits

### API Key Security
- Never expose in client code
- Use environment variables
- Rotate keys regularly
- Monitor usage

### CORS Configuration
```typescript
// In production, restrict to your domain
const allowedOrigins = [
  'https://your-app.vercel.app',
  'http://localhost:3000'
]
```

### Rate Limiting
```typescript
// Add to API routes
const rateLimit = {
  windowMs: 60 * 1000,  // 1 minute
  max: 60                // 60 requests per window
}
```

---

## Extending the API

### Add Custom Embeddings

```typescript
// app/api/embeddings/route.ts
import { pipeline } from '@xenova/transformers'

export async function POST(request: NextRequest) {
  const { text } = await request.json()
  
  const embedder = await pipeline(
    'feature-extraction',
    'sentence-transformers/all-MiniLM-L6-v2'
  )
  
  const embedding = await embedder(text, {
    pooling: 'mean',
    normalize: true
  })
  
  return NextResponse.json({ embedding })
}
```

### Add Vector Database

```typescript
// lib/vectordb.ts
import { PineconeClient } from '@pinecone-database/pinecone'

const pinecone = new PineconeClient()
await pinecone.init({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: process.env.PINECONE_ENV!
})

const index = pinecone.Index('documents')

export async function upsertDocument(id: string, embedding: number[], metadata: any) {
  await index.upsert([{
    id,
    values: embedding,
    metadata
  }])
}

export async function queryDocuments(embedding: number[], topK: number = 5) {
  const results = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true
  })
  return results.matches
}
```

### Add Conversation Memory

```typescript
// lib/memory.ts
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!
})

export async function saveConversation(sessionId: string, messages: any[]) {
  await redis.set(`session:${sessionId}`, JSON.stringify(messages), {
    ex: 86400  // 24 hour expiry
  })
}

export async function getConversation(sessionId: string) {
  const data = await redis.get(`session:${sessionId}`)
  return data ? JSON.parse(data as string) : []
}
```

---

## Testing

### Unit Tests

```typescript
// __tests__/api/upload.test.ts
import { POST } from '@/app/api/upload/route'

describe('Upload API', () => {
  it('should process PDF files', async () => {
    const formData = new FormData()
    formData.append('file', new File(['test'], 'test.pdf', { type: 'application/pdf' }))
    
    const response = await POST({ formData } as any)
    const data = await response.json()
    
    expect(data.success).toBe(true)
    expect(data.content).toBeDefined()
  })
  
  it('should reject unsupported files', async () => {
    const formData = new FormData()
    formData.append('file', new File(['test'], 'test.exe', { type: 'application/exe' }))
    
    const response = await POST({ formData } as any)
    const data = await response.json()
    
    expect(response.status).toBe(400)
    expect(data.error).toContain('Unsupported file type')
  })
})
```

### Integration Tests

```typescript
// __tests__/integration/chat.test.ts
describe('Chat Integration', () => {
  it('should return response with citations', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Test question',
        documents: [{ id: '1', name: 'test.txt', content: 'Test content' }]
      })
    })
    
    const data = await response.json()
    
    expect(data.response).toBeDefined()
    expect(data.citations).toBeInstanceOf(Array)
  })
})
```

---

## Performance Optimization

### Caching Strategies

```typescript
// Cache embeddings
const embeddingCache = new Map<string, number[]>()

function getCachedEmbedding(text: string): number[] | undefined {
  const hash = crypto.createHash('md5').update(text).digest('hex')
  return embeddingCache.get(hash)
}

// Cache API responses
const responseCache = new Map<string, any>()
const CACHE_TTL = 60 * 1000 // 1 minute

function getCachedResponse(key: string): any | undefined {
  const cached = responseCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return undefined
}
```

### Batch Processing

```typescript
// Process multiple documents in parallel
async function processDocuments(files: File[]): Promise<Document[]> {
  const results = await Promise.all(
    files.map(file => processDocument(file))
  )
  return results.filter(doc => doc !== null)
}
```

---

Ready to build on top of AskMyDoc? Start with these endpoints! 🚀
