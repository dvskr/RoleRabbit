# Integration Guide

## Setting Up the Complete Stack

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL or SQLite
- Docker (optional)

### Environment Variables

#### Backend (.env)
```
NODE_ENV=development
PORT=3001
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="your-openai-key"
```

#### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### Installation Steps

1. **Clone Repository**
```bash
git clone https://github.com/yourorg/roleready.git
cd roleready
```

2. **Install Dependencies**
```bash
npm install
cd apps/api && npm install
cd ../web && npm install
cd ../api-python && pip install -r requirements.txt
```

3. **Setup Database**
```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
```

4. **Start Services**
```bash
# From root directory
npm run dev:all
```

### Service Endpoints

- Frontend: http://localhost:3000
- Node.js API: http://localhost:3001
- Python AI API: http://localhost:8000
- Health Check: http://localhost:3001/health

## Development Workflow

1. Make changes
2. Run tests: `npm test`
3. Check linting: `npm run lint`
4. Build: `npm run build`
5. Deploy: Follow deployment checklist

## Troubleshooting

### Common Issues

**Port already in use**
```bash
# Kill process on port
npx kill-port 3000 3001 8000
```

**Database connection error**
```bash
# Reset database
npx prisma migrate reset
```

**Python server not starting**
```bash
# Check API key
echo $OPENAI_API_KEY
```

## Production Deployment

See `DEPLOYMENT_CHECKLIST.md` for detailed production deployment steps.

