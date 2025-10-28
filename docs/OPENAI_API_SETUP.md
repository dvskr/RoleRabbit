# 🔑 OpenAI API Key Setup Guide

## Step-by-Step Instructions

### 1️⃣ Get Your OpenAI API Key

1. **Visit OpenAI Platform:**
   - Go to: https://platform.openai.com/api-keys
   - Sign in with your OpenAI account (or create one if needed)

2. **Create a New API Key:**
   - Click **"Create new secret key"** button
   - Give it a name (e.g., "RoleReady Development")
   - Click **"Create secret key"**
   - ⚠️ **IMPORTANT:** Copy the key immediately - you won't be able to see it again!
   - The key will look like: `sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Set Usage Limits (Optional but Recommended):**
   - Go to: https://platform.openai.com/settings/organization/limits
   - Set monthly spending limits to avoid unexpected charges
   - Recommended: Start with $10-20/month for development

---

### 2️⃣ Configure the API Key in RoleReady

You need to add the API key to **TWO places**:

#### **Option A: Backend (.env file - RECOMMENDED)**

1. Navigate to the backend directory:
   ```bash
   cd apps/api
   ```

2. Open or create `.env` file in `apps/api/`:
   ```bash
   # Windows
   notepad .env
   
   # Mac/Linux
   nano .env
   ```

3. Add your OpenAI API key:
   ```env
   # OpenAI API Configuration
   OPENAI_API_KEY=sk-proj-your-key-here
   ```

4. Save the file

#### **Option B: Frontend (.env.local file - for frontend AI features)**

1. Navigate to the web directory:
   ```bash
   cd apps/web
   ```

2. Open or create `.env.local` file:
   ```bash
   # Windows
   notepad .env.local
   
   # Mac/Linux
   nano .env.local
   ```

3. Add your OpenAI API key:
   ```env
   NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-your-key-here
   ```

4. Save the file

---

### 3️⃣ Verify Configuration

1. **Restart your servers** (important for env variables to load):
   ```bash
   # Stop current servers (Ctrl+C in terminal)
   # Then start again:
   npm run dev:all
   ```

2. **Check if the key is loaded** (optional):
   ```bash
   # In backend logs, you should see:
   # OpenAI API configured successfully
   ```

---

### 4️⃣ Security Best Practices

✅ **DO:**
- Keep your API key secret and never commit it to Git
- Use different keys for development and production
- Set usage limits to prevent unexpected charges
- Rotate keys regularly (every 90 days recommended)

❌ **DON'T:**
- Share your API key publicly
- Commit `.env` files to version control
- Hardcode keys in your source code
- Use the same key for multiple projects

---

### 5️⃣ Troubleshooting

#### Key Not Working?
- Check for typos in the key
- Verify no extra spaces before/after the key
- Make sure you copied the full key (starts with `sk-`)
- Check OpenAI dashboard for usage/quota limits

#### Getting 401 Unauthorized?
- Verify the key is correctly set in `.env` file
- Restart your servers after adding the key
- Check if the key has the necessary permissions

#### Getting Rate Limit Errors?
- Go to OpenAI dashboard and check usage limits
- Increase your rate limits if needed
- Implement request queuing in your app

---

### 6️⃣ File Structure

After setup, your project should have:

```
RoleReady-FullStack/
├── apps/
│   ├── api/
│   │   └── .env                    ← Add OPENAI_API_KEY here
│   └── web/
│       └── .env.local              ← Add NEXT_PUBLIC_OPENAI_API_KEY here
```

---

### 7️⃣ Alternative: Using Environment Variables Directly

If you prefer not to use .env files:

**Windows:**
```powershell
$env:OPENAI_API_KEY="sk-proj-your-key-here"
npm run dev:all
```

**Mac/Linux:**
```bash
export OPENAI_API_KEY="sk-proj-your-key-here"
npm run dev:all
```

---

### 📞 Need Help?

If you encounter any issues:
1. Check OpenAI platform status: https://status.openai.com/
2. Review OpenAI API documentation: https://platform.openai.com/docs
3. Check your API key is valid and active in the dashboard

---

## 🎉 After Setup

Once you've added the API key and restarted the servers:
- Resume AI features will work with real AI inspections
- Cover letter generation will use actual OpenAI models
- Resume analysis will provide real ATS scores
- Job descriptions will generate real content

Let me know when you've added the key and I can continue with the AI integration implementation! 🚀

