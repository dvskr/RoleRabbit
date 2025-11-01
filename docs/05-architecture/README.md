# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    RoleReady Platform                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌─────────────────┐
│  Next.js Frontend│────────▶│  Node.js API    │
│   (Port 3000)    │         │   (Port 3001)   │
│                  │         │                 │
│  - Components    │         │  - Auth         │
│  - Hooks         │         │  - Resumes      │
│  - State Mgmt    │         │  - Jobs         │
│  - Tailwind CSS  │         │  - Cover Letters│
└──────────────────┘         │  - Emails       │
                              └────────┬────────┘
                                       │
                    ┌──────────────────┴─────────────────┐
                    │                                    │
         ┌──────────▼─────────┐              ┌──────────▼──────────┐
         │   Prisma ORM       │              │   Python AI API     │
         │   Database         │              │     (Port 8000)     │
         │                    │              │                     │
         │  - SQLite (Dev)    │              │  - OpenAI Proxy     │
         │  - PostgreSQL      │              │  - AI Generation    │
         │    (Prod)          │              │  - ATS Scoring      │
         └────────────────────┘              │  - Analysis         │
                                             └─────────┬───────────┘
                                                       │
                                              ┌────────▼────────┐
                                              │   OpenAI API    │
                                              └─────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React Hooks + Zustand
- **Icons:** Lucide React
- **Animations:** Framer Motion

### Backend
- **Node.js API:** Fastify + Prisma
- **Python AI API:** FastAPI
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Auth:** JWT + httpOnly cookies
- **AI:** OpenAI API

### Infrastructure
- **Containerization:** Docker
- **Development:** Docker Compose
- **CI/CD:** GitHub Actions
- **Production:** Kubernetes (planned)

---

## Directory Structure

```
RoleReady-FullStack/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/           # Next.js App Router
│   │   │   ├── components/    # React Components
│   │   │   ├── hooks/         # Custom Hooks
│   │   │   ├── services/      # API Services
│   │   │   ├── contexts/      # Context Providers
│   │   │   ├── utils/         # Utilities
│   │   │   └── types/         # TypeScript Types
│   │   └── public/            # Static Assets
│   │
│   ├── api/                   # Node.js Backend
│   │   ├── routes/           # API Routes
│   │   ├── utils/            # Utilities
│   │   ├── middleware/       # Auth & Logging
│   │   ├── prisma/           # Database Schema
│   │   └── tests/            # Tests
│   │
│   └── api-python/           # Python AI Backend
│       ├── main.py           # FastAPI App
│       └── requirements.txt  # Dependencies
│
├── docs/                     # Documentation
│   ├── 01-getting-started/  # Getting Started
│   ├── 02-setup/            # Setup Guides
│   ├── 03-api/              # API Docs
│   ├── 04-implementation/   # Roadmap
│   ├── 05-architecture/     # Architecture
│   ├── 06-deployment/       # Deployment
│   ├── 07-testing/          # Testing
│   ├── 08-security/         # Security
│   ├── 09-reference/        # Reference
│   └── 10-contributing/     # Contributing
│
├── browser-extension/        # Chrome Extension
├── docker-compose.yml        # Docker Config
└── README.md                 # Project README
```

---

## Data Flow

### Request Flow

1. **User Action** → Frontend Component
2. **API Call** → `apiService` (centralized)
3. **HTTP Request** → Node.js API
4. **Authentication** → JWT middleware
5. **Database** → Prisma ORM → SQLite/PostgreSQL
6. **Response** → Frontend updates state

### AI Request Flow

1. **User Action** → Frontend
2. **AI Request** → `aiService`
3. **Proxy** → Node.js API (`/api/ai/*`)
4. **Forward** → Python AI API
5. **Process** → OpenAI API
6. **Response** → Back through chain to frontend

---

## Database Schema

### Core Models

- **User** - Accounts and profiles
- **Resume** - User resumes
- **Job** - Job applications
- **CoverLetter** - Cover letters
- **Email** - Email templates
- **CloudFile** - File storage
- **Portfolio** - Portfolio sites
- **AIAgent** - AI agents
- **Session** - Active sessions
- **RefreshToken** - JWT tokens

**See:** `apps/api/prisma/schema.prisma` for full schema

---

## Security Architecture

### Authentication
- JWT tokens with httpOnly cookies
- Refresh token mechanism
- Session management
- Password hashing (bcrypt)

### Authorization
- Role-based access control (planned)
- Resource ownership validation
- API rate limiting

### Data Protection
- Input sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- HTTPS in production

---

## Performance Optimizations

### Frontend
- Code splitting
- Lazy loading
- Image optimization
- Font optimization
- Bundle size: < 1MB

### Backend
- Database indexing
- Query optimization
- Connection pooling
- Response caching (planned)
- Redis caching (planned)

---

## Scaling Strategy

### Current: Single Instance
- SQLite database
- Single Node.js API
- Single Python API

### Production: Distributed
- PostgreSQL with read replicas
- Redis for caching
- Kubernetes with auto-scaling
- CDN for static assets
- Load balancers

---

## Monitoring & Logging

### Current
- Basic console logging
- Error tracking
- Health checks

### Planned
- Structured logging (JSON)
- Centralized logging (ELK stack)
- Application monitoring (Prometheus)
- Performance monitoring
- Error tracking (Sentry)

---

## Next Steps

- [System Overview](./system-overview.md)
- [Component Structure](./components.md)
- [Backend Architecture](./backend.md)
- [Database Design](./database.md)

