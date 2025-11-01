# Configuring OpenAI API Key for Resume Parsing

## Location

Add the `OPENAI_API_KEY` to the **Node.js API** environment file:

**File Path:** `apps/api/.env`

## Steps

### 1. Create or Edit the `.env` File

Navigate to the `apps/api` directory and create/edit the `.env` file:

```bash
cd apps/api
```

### 2. Add the OpenAI API Key

Open `apps/api/.env` in your editor and add:

```env
# OpenAI API Key (for AI-powered resume parsing)
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Complete `.env` File Example

Your `apps/api/.env` file should look something like this:

```env
# Server Configuration
NODE_ENV=development
PORT=3001
HOST=localhost

# Database
DATABASE_URL=file:./prisma/dev.db

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# OpenAI API Key (for resume parsing and AI features)
OPENAI_API_KEY=sk-your-actual-openai-api-key-here

# Email Service (Optional)
RESEND_API_KEY=re_your_key
SENDGRID_API_KEY=SG.your_key

# Python AI API URL (for other AI features)
PYTHON_API_URL=http://localhost:8000

# CORS
CORS_ORIGIN=http://localhost:3000
```

### 4. Get Your OpenAI API Key

If you don't have an API key yet:

1. Visit https://platform.openai.com/api-keys
2. Sign up or log in to your OpenAI account
3. Click **"Create new secret key"**
4. Copy the key (it starts with `sk-`)
5. Paste it into `apps/api/.env`

### 5. Restart the Server

After adding the key, restart the Node.js API server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd apps/api
npm run dev
```

### 6. Verify It's Working

Check the server logs. You should see:

```
✅ "OpenAI client initialized for resume parsing"
```

If you see:
```
⚠️ "OpenAI API key not configured, will use regex parsing"
```

Then the key wasn't loaded correctly. Check:
- The `.env` file is in `apps/api/` directory
- The key is correct and starts with `sk-`
- No extra spaces or quotes around the key
- The server was restarted after adding the key

## Notes

- **Without OpenAI Key**: The system will still work using regex-based parsing (less accurate but functional)
- **With OpenAI Key**: AI-powered parsing provides much more accurate extraction
- **Security**: Never commit your `.env` file to git! It should already be in `.gitignore`

## Alternative: Root Level `.env`

If you prefer, you can also set it in the root `.env` file, but the `apps/api/.env` file takes precedence and is the recommended location.

