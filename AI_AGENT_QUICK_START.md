# AI Agent Auto-Apply - Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites
```bash
✅ Node.js >= 18.x
✅ PostgreSQL running
✅ Redis running
```

### Step 1: Install Dependencies (2 minutes)

```bash
# Backend
cd apps/api
npm install bull redis socket.io

# Frontend
cd apps/web
npm install socket.io-client jspdf docx file-saver
```

### Step 2: Configure Environment (1 minute)

**apps/api/.env:**
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/rolerabbit"
REDIS_URL="redis://localhost:6379"
AI_AGENT_MOCK_MODE="true"  # No API keys needed for testing!
SOCKET_IO_CORS_ORIGIN="http://localhost:3000"
```

**apps/web/.env.local:**
```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

### Step 3: Database Setup (1 minute)

```bash
cd apps/api
npx prisma generate
npx prisma migrate deploy
```

### Step 4: Start Everything (1 minute)

```bash
# Terminal 1: API
cd apps/api && npm run dev

# Terminal 2: Web
cd apps/web && npm run dev

# Terminal 3: Redis (if not running)
redis-server
```

### Step 5: Test It! ✨

1. Open http://localhost:3000
2. Navigate to AI Auto-Apply tab
3. Click "Generate Resume"
4. Fill in any job details
5. Watch it process in real-time!

**Note:** With `AI_AGENT_MOCK_MODE="true"`, you get instant mock responses - no API keys needed!

---

## 🎯 Production Setup

### Enable Real AI (Optional)

**apps/api/.env:**
```bash
AI_AGENT_MOCK_MODE="false"
AI_PROVIDER="openai"  # or "anthropic"
OPENAI_API_KEY="sk-..."
```

### Usage Limits

Default limits per subscription tier:
- **FREE:** 5 tasks/month
- **PRO:** 50 tasks/month
- **PREMIUM:** Unlimited

Configure in database or environment variables.

---

## 📦 What You Get

### Features Ready to Use

✅ **Single Task Creation**
- Resume generation
- Cover letters
- Company research
- Interview prep

✅ **Bulk Processing**
- Process 10+ jobs at once
- Import from JSON/TXT files
- Batch progress tracking

✅ **Real-Time Updates**
- WebSocket live progress
- Toast notifications
- Auto-refresh

✅ **Document Export**
- PDF generation
- DOCX generation
- Professional formatting

✅ **Smart Features**
- ATS score calculation
- Keyword matching
- History with search/filters
- Usage tracking

---

## 🧪 Testing Without API Keys

### Mock Mode Features

When `AI_AGENT_MOCK_MODE="true"`:

- ✅ Instant responses (no delays)
- ✅ Realistic mock data
- ✅ All features work
- ✅ Perfect for development
- ✅ No API costs

**Example mock resume:**
```json
{
  "name": "John Doe",
  "title": "Senior Software Engineer",
  "summary": "Experienced engineer with 8+ years...",
  "atsScore": 87,
  "skills": ["React", "Node.js", "AWS"]
}
```

---

## 🔧 Common Commands

```bash
# Database
npx prisma generate        # Regenerate Prisma client
npx prisma migrate dev     # Create new migration
npx prisma studio          # Open database GUI

# Redis
redis-cli ping             # Check if running
redis-cli monitor          # Watch commands
redis-cli flushall         # Clear all data (careful!)

# Development
npm run dev                # Start dev server
npm run build              # Build for production
npm run lint               # Run linter
```

---

## 🐛 Quick Troubleshooting

### Tasks stuck in queue?
```bash
# Check Redis
redis-cli ping

# Restart if needed
brew services restart redis
```

### WebSocket not connecting?
```bash
# Check ports match
API: http://localhost:4000
Web: http://localhost:3000
```

### Migration errors?
```bash
# Reset database (WARNING: deletes data)
npx prisma migrate reset
```

---

## 📚 Next Steps

1. **Read Full Docs:** `AI_AGENT_DOCUMENTATION.md`
2. **Customize AI Prompts:** `apps/api/services/aiService.js`
3. **Add New Features:** Follow patterns in existing code
4. **Deploy:** See deployment guide in full docs

---

## 🎨 UI Components

### Import and Use

```typescript
import { JobInputModal } from '@/components/AIAgents/components/JobInputModal';
import { useAIAgentsContext } from '@/components/AIAgents';

function MyComponent() {
  const { showSuccess, refreshActiveTasks } = useAIAgentsContext();

  const handleSubmit = async (data) => {
    // Create task
    await fetch('/api/ai-agent/tasks/resume-generation', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    showSuccess('Task created!');
    await refreshActiveTasks();
  };

  return <JobInputModal onSubmit={handleSubmit} />;
}
```

---

## 🚀 Production Checklist

Before deploying:

- [ ] Set `AI_AGENT_MOCK_MODE="false"`
- [ ] Add real API keys
- [ ] Configure Redis persistence
- [ ] Set up monitoring
- [ ] Enable error logging
- [ ] Configure CORS properly
- [ ] Set up database backups
- [ ] Test WebSocket connection
- [ ] Verify rate limits
- [ ] Update documentation

---

## 💡 Pro Tips

1. **Use Mock Mode First:** Develop and test without API costs
2. **Monitor Redis:** Watch queue processing in real-time
3. **Check Logs:** Enable debug mode for detailed info
4. **Test Bulk Import:** Try importing 10+ jobs from a file
5. **Customize Prompts:** Tailor AI responses to your needs

---

## 📞 Need Help?

- **Documentation:** `AI_AGENT_DOCUMENTATION.md`
- **Setup Guide:** You're reading it! 🎉
- **Code Examples:** Check `apps/web/src/components/AIAgents/`
- **API Reference:** See full docs for all endpoints

---

**Happy Building! 🎉**

*Built with ❤️ for automated job applications*
