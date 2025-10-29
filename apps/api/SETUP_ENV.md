# Environment Setup Instructions

## ✅ PostgreSQL is Running!

Your PostgreSQL container is running successfully.

## 📝 Create .env File

1. Go to the `apps/api` folder
2. Create a new file called `.env` (with the dot at the beginning)
3. Copy and paste this content:

```env
# Database
DATABASE_URL="postgresql://postgres:roleready_dev@localhost:5432/roleready"

# JWT Secret
JWT_SECRET=your-jwt-secret-key-change-this-in-production

# Resend Email (Add your API key)
RESEND_API_KEY=
EMAIL_FROM=noreply@roleready.com

# OpenAI API Key (You already configured this)
OPENAI_API_KEY=your_openai_key_here

# CORS
CORS_ORIGIN=http://localhost:3000

# Server Port
PORT=3001

# Environment
NODE_ENV=development
```

## 🔧 Quick Setup (Copy This)

Or just run this command in PowerShell:
```powershell
cd apps/api
@"
DATABASE_URL="postgresql://postgres:roleready_dev@localhost:5432/roleready"
JWT_SECRET=dev-jwt-secret-change-in-production
RESEND_API_KEY=
EMAIL_FROM=noreply@roleready.com
OPENAI_API_KEY=your_openai_key_here
CORS_ORIGIN=http://localhost:3000
PORT=3001
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

## ✅ After Creating .env

Then run the migration:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

This will create all the database tables!

