<div align="center">

# ⚡ AskMyDoc

### AI-Powered Document Intelligence — Ask Anything, Get Cited Answers

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Inference%20API-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black)](https://huggingface.co/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-violet?style=for-the-badge)](LICENSE)

**Upload your documents. Ask questions. Get AI-powered answers with exact citations.**

---

## 🌐 Live Demo

> 🔗 **[https://askmydoc-psi.vercel.app](https://askmydoc-psi.vercel.app)**

---

[📖 Docs](#how-to-use) · [🐛 Report Bug](#troubleshooting) · [✨ Request Feature](#future-enhancements)

</div>

---

## 🌟 What is AskMyDoc?

**AskMyDoc** is a full-stack RAG (Retrieval-Augmented Generation) app that lets you upload PDFs, Word documents, or text files and have a real conversation with them. Every answer is grounded in your documents with **precise, clickable citations** — no hallucinations.

```
You: "What are the quarterly revenue targets?"
AI:  "According to [Q3_Report.pdf], the revenue target is $4.2M..."
     📎 Source: Q3_Report.pdf — 94% relevance
```

---

## ✨ Features

| Feature | Description |
|---|---|
| 📄 **Multi-Document Upload** | PDF, DOCX, and TXT — upload several at once |
| 🧠 **Real Semantic Search** | `sentence-transformers/all-MiniLM-L6-v2` for true vector similarity |
| 💬 **Chat Interface** | Streaming responses with character-by-character typing animation |
| 📎 **Cited Answers** | Every response links back to the source chunk with a relevance % |
| 🗂️ **Session History** | Multiple conversation threads in a collapsible sidebar |
| 🎨 **Dark / Light Mode** | Smooth animated toggle with a deep indigo-violet design system |
| ⚡ **Glassmorphism UI** | Framer Motion animations, gradient buttons, frosted-glass panels |
| 🔒 **Private by Default** | Documents never leave your server session |

---

## 🏗️ Tech Stack

```
Frontend          →  Next.js 16 · React 18 · TypeScript · Tailwind CSS
Animations        →  Framer Motion
AI / LLM          →  meta-llama/Llama-3.2-3B-Instruct  (via HF Inference API)
Embeddings        →  sentence-transformers/all-MiniLM-L6-v2  (real semantic search)
Document Parsing  →  pdf-parse · mammoth
Fonts             →  Space Grotesk · Inter  (Google Fonts)
Deployment        →  Vercel (recommended)
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/syed-hassan-bukhari/askmydoc.git
cd askmydoc
npm install
```

### 2. Get a Free Hugging Face Token

1. Go to 👉 [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)
2. Click **"New token"** → Type: **Read**
3. Copy the token (starts with `hf_...`)

### 3. Configure Environment

```bash
# Create your .env file
echo "HF_TOKEN=hf_your_token_here" > .env
```

### 4. Run

```bash
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** — you're live! 🎉

---

## 📖 How to Use

```
1. Upload Docs    →  Click "Upload Docs" → select PDF / DOCX / TXT files
2. Ask Questions  →  Type your question → press Enter
3. View Citations →  Click any 📎 citation chip to highlight the source
4. Manage Chats   →  Switch sessions in the sidebar, delete old ones anytime
5. Toggle Theme   →  Click the 🌙 / ☀️ icon in the header
```

---

## 📁 Project Structure

```
askmydoc/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        ← RAG pipeline (embeddings + LLM)
│   │   └── upload/route.ts      ← Document parsing (PDF / DOCX / TXT)
│   ├── globals.css              ← Design system (indigo-violet theme)
│   ├── layout.tsx               ← Root layout + font loading
│   └── page.tsx                 ← Main page + state management
├── components/
│   ├── ChatInterface.tsx        ← Chat bubbles, typing animation, citations
│   ├── Header.tsx               ← Upload button, theme toggle
│   ├── Sidebar.tsx              ← Session list, document list
│   └── ThemeProvider.tsx        ← Dark/light context
├── types/index.ts               ← Shared TypeScript types
├── .env                         ← HF_TOKEN (never commit this!)
├── tailwind.config.js
└── next.config.js
```

---

## 🧠 How the RAG Pipeline Works

```
User Question
      │
      ▼
┌─────────────────────┐
│  Embed query with   │  ← sentence-transformers/all-MiniLM-L6-v2
│  all-MiniLM-L6-v2  │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  Chunk documents    │  ← 400 words, 80-word overlap
│  + embed each chunk │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  Cosine similarity  │  ← Rank chunks, pick top 5
│  ranking            │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  Build prompt with  │  ← Top chunks injected as context
│  retrieved context  │
└─────────────────────┘
      │
      ▼
┌─────────────────────┐
│  Llama-3.2-3B       │  ← Streaming response with source citations
│  Instruct (HF)      │
└─────────────────────┘
```

---

## 🚢 Deployment

### Deploy to Vercel (Recommended — Free)

```bash
# 1. Push to GitHub
git add . && git commit -m "Initial commit" && git push

# 2. Import on Vercel
# → vercel.com → New Project → Import repo
# → Add Environment Variable: HF_TOKEN = hf_your_token
# → Deploy!
```

Your app will be live at `https://askmydoc-yourname.vercel.app` 🌍

### Other Platforms

Works on any Node.js host — just set the `HF_TOKEN` environment variable:

| Platform | Guide |
|---|---|
| Railway | [railway.app](https://railway.app) |
| Render | [render.com](https://render.com) |
| DigitalOcean | App Platform |

---

## 🔧 Customization

### Change the LLM

Edit `app/api/chat/route.ts`:

```typescript
// Swap to any HF chat model:
const CHAT_MODEL = 'HuggingFaceH4/zephyr-7b-beta'
// or
const CHAT_MODEL = 'Qwen/Qwen2.5-7B-Instruct'
```

### Change the Embedding Model

```typescript
const EMBED_MODEL = 'BAAI/bge-small-en-v1.5'  // faster
// or
const EMBED_MODEL = 'thenlper/gte-large'        // more accurate
```

### Change Theme Colors

Edit `app/globals.css`:

```css
:root {
  --primary: 252 97% 65%;   /* Indigo */
  --accent:  290 80% 62%;   /* Violet */
}
```

---

## 🐛 Troubleshooting

| Error | Fix |
|---|---|
| `HF_TOKEN not configured` | Add `HF_TOKEN=hf_...` to `.env` and restart |
| `Model is loading` | HF cold-start — wait 20s and retry |
| `Rate limit hit (429)` | Free tier — wait a few seconds |
| `Upload failed` | Check file is PDF / DOCX / TXT, under 10 MB |
| `Invalid PDF structure` | Try a different PDF or convert to `.txt` |
| Styling broken | Delete `.next/` folder and run `npm run dev` again |

---

## 🛣️ Future Enhancements

- [ ] Vector database integration (Pinecone / Chroma)
- [ ] Support for PPTX, XLSX, images (OCR)
- [ ] Conversation export (PDF / Markdown)
- [ ] User authentication
- [ ] Document sharing between users
- [ ] Analytics dashboard
- [ ] On-device inference (WebLLM / Transformers.js)

---

## 📄 License

MIT — free for personal, commercial, and portfolio use. See [LICENSE](LICENSE).

---

<div align="center">

**Built with ❤️ using Next.js + Hugging Face**

*If this project helped you — drop a ⭐ on GitHub!*

</div>
>
