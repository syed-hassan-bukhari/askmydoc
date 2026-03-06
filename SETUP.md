# 🎯 Quick Setup Guide

Follow these steps to get AskMyDoc running in under 5 minutes!

## Step 1: Get a Hugging Face Token (2 minutes)

1. Go to: https://huggingface.co/settings/tokens
2. Click **"New token"** → Type: **Read**
3. Copy the token (starts with `hf_...`)

## Step 2: Install Dependencies (1 minute)

```bash
cd askmydoc
npm install
```

## Step 3: Configure Your Token (30 seconds)

Create a `.env` file in the project root:

```bash
HF_TOKEN=hf_your_token_here
```

## Step 4: Run the App (30 seconds)

```bash
npm run dev
```

Open http://localhost:3000

## Step 5: Test It Out! (1 minute)

1. Click **"Upload Docs"**
2. Upload a PDF, DOCX, or TXT file
3. Ask a question like "What is this document about?"
4. See AI-powered answers with citations! 🎉

---

## 🚀 Deploy to Vercel (FREE)

1. Push code to GitHub
2. Go to https://vercel.com → Import Project
3. Add environment variable: `HF_TOKEN`
4. Deploy!

Your app will be live at: `your-project.vercel.app`

---

## 🆘 Common Issues

| Issue | Fix |
|---|---|
| Token error | Check `HF_TOKEN` is in `.env` and restart server |
| Upload fails | Try smaller files first (< 5MB) |
| Model loading | HF cold-start — wait 20s and retry |
| Nothing happens | Check browser console for errors |

---

## 🎨 Next Steps

- Customize theme colors in `app/globals.css`
- Change fonts in `app/layout.tsx`
- Adjust chunk size in `app/api/chat/route.ts`
- Add your own branding

Enjoy building with AI! ✨
