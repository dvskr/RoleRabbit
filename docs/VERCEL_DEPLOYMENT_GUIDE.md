# 🚀 Vercel Deployment Guide for RoleReady

> **📖 Before starting:** See [Hosting Recommendations](./HOSTING_RECOMMENDATIONS.md) for the best platform setup and cost comparison.

## What is Vercel?

**Vercel** is a cloud platform designed specifically for deploying and hosting modern web applications, especially Next.js projects. It's created by the same team that built Next.js, making it the perfect hosting solution for React/Next.js applications.

### Key Features of Vercel:

1. **Zero-Configuration Deployments**: Automatically detects Next.js projects and configures builds
2. **Edge Network**: Global CDN for lightning-fast content delivery
3. **Serverless Functions**: Run API routes as serverless functions
4. **Automatic HTTPS**: SSL certificates provided automatically
5. **Preview Deployments**: Every pull request gets a unique preview URL
6. **Analytics & Monitoring**: Built-in performance monitoring and analytics
7. **Git Integration**: Deploy automatically on git push
8. **Environment Variables**: Secure management of API keys and secrets

### Why Use Vercel for RoleReady?

- ✅ **Perfect for Next.js**: Built by the Next.js creators
- ✅ **Free Tier Available**: Great for personal/small projects
- ✅ **Automatic Scaling**: Handles traffic spikes automatically
- ✅ **Easy CI/CD**: Deploy on every git push
- ✅ **Fast Global CDN**: Your app loads quickly worldwide
- ✅ **Built-in Analytics**: Monitor performance and usage

---

## 🎯 Deployment Options

Your RoleReady project has three components:

1. **Frontend** (Next.js) - ✅ Can deploy to Vercel
2. **Node.js API** - ⚠️ Needs separate hosting (Railway, Render, etc.)
3. **Python API** - ⚠️ Needs separate hosting (Railway, Render, etc.)

**Recommended Setup:**
- **Frontend**: Deploy to Vercel (this guide)
- **Node.js API**: Deploy to Railway, Render, or Fly.io
- **Python API**: Deploy to Railway, Render, or Fly.io

---

## 📋 Prerequisites

1. **GitHub Account**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free)
3. **Deployed Backend APIs**: Your Node.js and Python APIs should be deployed first
4. **Environment Variables**: List of all required environment variables

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Sign Up / Log In to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** (recommended for automatic deployments)

### Step 3: Import Your Project

1. In Vercel dashboard, click **"Add New Project"**
2. Click **"Import Git Repository"**
3. Select your **RoleReady-FullStack** repository
4. Click **"Import"**

### Step 4: Configure Project Settings

Vercel should auto-detect your Next.js app, but verify these settings:

#### Project Settings:
- **Framework Preset**: `Next.js`
- **Root Directory**: `apps/web` (IMPORTANT: Set this!)
- **Build Command**: `npm run build` (or leave default)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install`

#### Environment Variables:
Add all your environment variables in Vercel's dashboard:

```env
# API URLs (Update with your deployed backend URLs)
NEXT_PUBLIC_API_URL=https://your-node-api.railway.app
NEXT_PUBLIC_AI_API_URL=https://your-python-api.railway.app

# OpenAI (if using directly in frontend)
NEXT_PUBLIC_OPENAI_API_KEY=sk-...

# Database (if accessing from frontend)
NEXT_PUBLIC_DATABASE_URL=postgresql://...

# Supabase (if using)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Authentication
NEXT_PUBLIC_JWT_SECRET=...
NEXT_PUBLIC_JWT_EXPIRES_IN=...

# Other public environment variables
# (Only NEXT_PUBLIC_* variables are accessible in browser)
```

**⚠️ Important Notes:**
- Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Never expose secrets in `NEXT_PUBLIC_` variables
- Add variables in Vercel dashboard: **Project Settings → Environment Variables**

### Step 5: Deploy!

1. Click **"Deploy"** button
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

---

## 🔧 Advanced Configuration

### Using vercel.json

The project includes a `vercel.json` file with optimized settings:

```json
{
  "version": 2,
  "rootDirectory": "apps/web",
  "buildCommand": "cd apps/web && npm install && npm run build",
  "outputDirectory": "apps/web/.next",
  "framework": "nextjs"
}
```

### Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Add your custom domain (e.g., `roleready.com`)
3. Follow DNS configuration instructions
4. Vercel automatically provisions SSL certificate

### Preview Deployments

Every pull request automatically gets a preview URL:
- Great for testing before merging
- Share with team members
- Each preview has its own environment

---

## 🌐 Connecting Backend APIs

Since your backend APIs are hosted separately, update your environment variables:

### Update next.config.js (already done)

The `next.config.js` has been updated to support production URLs.

### Update Environment Variables in Vercel

1. Go to **Project Settings → Environment Variables**
2. Add/Update:
   ```
   NEXT_PUBLIC_API_URL=https://your-node-api.railway.app
   NEXT_PUBLIC_AI_API_URL=https://your-python-api.railway.app
   ```
3. Redeploy (or it will auto-deploy on next push)

### CORS Configuration

Make sure your backend APIs allow requests from your Vercel domain:

**Node.js API** (`apps/api/server.js`):
```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-project.vercel.app',
  'https://roleready.com' // if using custom domain
];
```

**Python API** (`apps/api-python/main.py`):
```python
allow_origins=[
  "http://localhost:3000",
  "https://your-project.vercel.app",
  "https://roleready.com"  # if using custom domain
]
```

---

## 🔍 Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Solution: Ensure `rootDirectory` is set to `apps/web`
- Check that all dependencies are in `apps/web/package.json`

**Error: "Build timeout"**
- Solution: Increase build timeout in Project Settings
- Optimize your build process

**Error: "Environment variable not found"**
- Solution: Add all required variables in Vercel dashboard
- Ensure variables are set for Production, Preview, and Development

### Runtime Errors

**API calls failing**
- Check CORS configuration on backend APIs
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check browser console for errors

**Images not loading**
- Update `next.config.js` with correct image domains
- Ensure images are using HTTPS URLs

### Deployment Issues

**"Root directory not found"**
- Ensure `rootDirectory: "apps/web"` in vercel.json
- Or set it in Vercel dashboard

**"Build command failed"**
- Check build logs in Vercel dashboard
- Test build locally: `cd apps/web && npm run build`

---

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Go to **Project Settings → Analytics**
2. Enable **Web Analytics** (free tier available)
3. View real-time traffic, page views, and performance metrics

### Performance Monitoring

- Check **Deployments** tab for build times
- Use **Analytics** tab for page load times
- Monitor **Functions** tab for API route performance

---

## 🎯 Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use Vercel's environment variables feature
   - Use different values for Preview vs Production

2. **Build Optimization**
   - Minimize bundle size
   - Use Next.js Image optimization
   - Enable compression

3. **Security**
   - Never expose secrets in `NEXT_PUBLIC_*` variables
   - Use server-side API routes for sensitive operations
   - Enable Vercel's security headers (already configured in vercel.json)

4. **Performance**
   - Use Next.js automatic code splitting
   - Optimize images with Next.js Image component
   - Enable caching headers

---

## 🔄 Continuous Deployment

### Automatic Deployments

By default, Vercel deploys on:
- Push to `main` branch → Production deployment
- Pull Request → Preview deployment
- Manual trigger from dashboard

### Disable Auto-Deploy

If needed, you can disable auto-deploy:
1. Go to **Project Settings → Git**
2. Disable **"Automatic deployments from Git"**

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel CLI](https://vercel.com/docs/cli) - Deploy from command line

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] Code is pushed to GitHub
- [ ] Backend APIs are deployed and accessible
- [ ] Environment variables are configured in Vercel
- [ ] CORS is configured on backend APIs
- [ ] `vercel.json` is in root directory
- [ ] `next.config.js` has production image domains
- [ ] All API URLs use HTTPS
- [ ] No secrets in `NEXT_PUBLIC_*` variables

---

## 🎉 After Deployment

1. **Test your deployment**: Visit your Vercel URL
2. **Check browser console**: Look for any errors
3. **Test all features**: Resume editor, API calls, etc.
4. **Set up custom domain** (optional)
5. **Enable analytics** for monitoring

Your RoleReady app is now live on Vercel! 🚀

---

## 🆘 Need Help?

- Check Vercel documentation: https://vercel.com/docs
- Vercel Community: https://github.com/vercel/vercel/discussions
- Next.js Discord: https://nextjs.org/discord

