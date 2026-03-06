# 🚀 Deployment Guide

## Deploy to Vercel (Recommended — FREE)

Vercel is the best platform for Next.js apps. Takes under 2 minutes!

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/askmydoc.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your `askmydoc` repo

3. **Add Environment Variable**
   - Go to "Environment Variables"
   - Add:
     - Name: `HF_TOKEN`
     - Value: Your Hugging Face token (`hf_...`)
   - Click "Add"

4. **Deploy**
   - Click "Deploy" → wait 2–3 minutes
   - Your app is live! 🎉

Your URL: `askmydoc-yourusername.vercel.app`

### Auto-Deploy on Push

Every `git push` to GitHub triggers an automatic Vercel redeploy. No CI/CD setup needed.

---

## Deploy to Netlify

1. Build Command: `npm run build`
2. Publish Directory: `.next`
3. Add environment variable: `HF_TOKEN`

---

## Deploy to Railway

1. Connect GitHub repo
2. Add environment variable: `HF_TOKEN`
3. Railway auto-detects Next.js → Deploy!

---

## Deploy to DigitalOcean App Platform

1. Create new app from GitHub
2. Build command: `npm run build`
3. Run command: `npm start`
4. Add environment variable: `HF_TOKEN`

---

## Environment Variables

All deployments require:

```bash
HF_TOKEN=hf_your_token_here
```

Get your free token at: https://huggingface.co/settings/tokens

---

## Custom Domain (Vercel)

1. Go to project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

---

## Production Checklist

- [ ] Test with multiple document types
- [ ] Verify `HF_TOKEN` is working
- [ ] Check error handling
- [ ] Test dark/light theme
- [ ] Verify mobile responsiveness
- [ ] Test file size limits
- [ ] Check citation functionality
- [ ] Test conversation history

---

## Scaling

### Free Tier Limits

- Vercel: Unlimited hobby projects
- HF Inference API: Rate-limited (free tier)
- Storage: Browser session (no database needed)

### Upgrades

- Vercel Pro — $20/mo (more bandwidth)
- HF Pro — $9/mo (higher rate limits + faster inference)
- Pinecone / Supabase — persistent vector storage

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Build fails | Check Node.js ≥ 18, run `npm install` |
| Token not working | Verify `HF_TOKEN` in dashboard env vars |
| Model loading | HF cold-start — retry after 20–30s |
| Runtime errors | Check Vercel function logs |

---

Ready to deploy? Follow the Vercel steps above! 🚀
