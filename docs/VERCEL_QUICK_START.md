# ⚡ Vercel Quick Start Guide

## What is Vercel?

**Vercel** is a cloud hosting platform specifically designed for Next.js applications. It's like GitHub Pages but much more powerful, with automatic deployments, serverless functions, and global CDN.

### Why Vercel for RoleReady?
- ✅ **Free tier** for personal projects
- ✅ **Automatic deployments** on every git push
- ✅ **Built for Next.js** (made by Next.js creators)
- ✅ **Global CDN** for fast loading
- ✅ **Preview URLs** for every pull request

---

## 🚀 Quick Deployment (5 Minutes)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Vercel configuration"
git push origin main
```

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up (use GitHub)
2. Click **"Add New Project"**
3. Import your **RoleReady-FullStack** repository
4. **IMPORTANT**: Set **Root Directory** to `apps/web`
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-node-api-url.com
   NEXT_PUBLIC_AI_API_URL=https://your-python-api-url.com
   ```
6. Click **"Deploy"**

### Step 3: Done! 🎉
Your app is live at `https://your-project.vercel.app`

---

## 📝 Required Environment Variables

Add these in **Vercel Dashboard → Project Settings → Environment Variables**:

```env
# Required - Update with your backend URLs
NEXT_PUBLIC_API_URL=https://your-node-api.railway.app
NEXT_PUBLIC_AI_API_URL=https://your-python-api.railway.app

# Optional - If using directly in frontend
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
```

---

## ⚙️ Project Configuration

The project is already configured with:
- ✅ `vercel.json` - Deployment configuration
- ✅ `next.config.js` - Production-ready settings
- ✅ Security headers configured

**No additional setup needed!**

---

## 🔗 Backend API Setup

Your backend APIs need to be deployed separately:

1. **Node.js API** → Deploy to [Railway](https://railway.app) or [Render](https://render.com)
2. **Python API** → Deploy to [Railway](https://railway.app) or [Render](https://render.com)
3. Update CORS on both APIs to allow your Vercel domain

---

## 📚 Full Documentation

For detailed instructions, troubleshooting, and advanced configuration, see:
**[VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)**

---

## ❓ Common Issues

**Build fails?**
- Make sure **Root Directory** is set to `apps/web` in Vercel dashboard

**API calls not working?**
- Check CORS settings on your backend APIs
- Verify environment variables are set correctly

**Need help?**
- See full guide: `docs/VERCEL_DEPLOYMENT_GUIDE.md`
- Vercel docs: https://vercel.com/docs

