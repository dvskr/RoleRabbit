# Portfolio System Integration Plan (PR #58)

**Goal:** Integrate the complete portfolio management system from PR #58 into the working application

**Status:** Backend exists (97k lines), needs frontend integration and database setup

**Estimated Time:** 2-3 days of focused work

---

## 🎯 Overview

PR #58 added a complete portfolio hosting platform with:
- ✅ Backend APIs (ready)
- ✅ Components (ready)
- ✅ Services (ready)
- ❌ Database migrations (need adaptation)
- ❌ Frontend integration (needs wiring)
- ❌ UI routes (need creation)

---

## 📋 Integration Phases

### Phase 1: Database Setup ⚙️
**Time:** 2-4 hours

### Phase 2: API Integration 🔌
**Time:** 2-3 hours

### Phase 3: Frontend Integration 🎨
**Time:** 6-8 hours

### Phase 4: Dashboard Integration 📊
**Time:** 2-3 hours

### Phase 5: Testing & Polish ✨
**Time:** 4-6 hours

---

## 🔧 Phase 1: Database Setup

### Problem
PR #58's migrations use raw SQL, but your app uses Prisma.

### Solution Options

#### Option A: Convert Migrations to Prisma (RECOMMENDED)

Create a new Prisma schema with the portfolio tables:

**File:** `apps/api/prisma/schema.prisma` (add to existing schema)

```prisma
// Portfolio System Tables (from PR #58)

enum PortfolioStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum PortfolioVisibility {
  PUBLIC
  PRIVATE
  UNLISTED
}

model Portfolio {
  id                String              @id @default(uuid())
  userId            String
  title             String
  slug              String              @unique
  description       String?
  content           Json                // Stores the portfolio content/structure
  templateId        String?
  theme             Json?               // Theme customization
  seoSettings       Json?               // SEO meta tags
  status            PortfolioStatus     @default(DRAFT)
  visibility        PortfolioVisibility @default(PRIVATE)
  publishedAt       DateTime?
  customDomain      String?             @unique
  subdomain         String?             @unique
  viewCount         Int                 @default(0)
  shareCount        Int                 @default(0)
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  // Relations
  user              User                @relation(fields: [userId], references: [id], onDelete: Cascade)
  template          PortfolioTemplate?  @relation(fields: [templateId], references: [id])
  versions          PortfolioVersion[]
  shares            PortfolioShare[]
  analytics         PortfolioAnalytics[]
  deployments       PortfolioDeployment[]
  customDomains     CustomDomain[]
  
  @@index([userId])
  @@index([slug])
  @@index([status])
  @@index([publishedAt])
}

model PortfolioTemplate {
  id          String    @id @default(uuid())
  name        String
  description String?
  thumbnail   String?
  category    String?
  structure   Json      // Template structure
  styles      Json?     // Default styles
  isPublic    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  portfolios  Portfolio[]
}

model PortfolioVersion {
  id          String    @id @default(uuid())
  portfolioId String
  version     Int
  content     Json
  changeLog   String?
  createdBy   String
  createdAt   DateTime  @default(now())
  
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  
  @@unique([portfolioId, version])
  @@index([portfolioId])
}

model PortfolioShare {
  id          String    @id @default(uuid())
  portfolioId String
  token       String    @unique
  expiresAt   DateTime?
  maxViews    Int?
  viewCount   Int       @default(0)
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  
  @@index([token])
  @@index([portfolioId])
}

model PortfolioAnalytics {
  id          String    @id @default(uuid())
  portfolioId String
  date        DateTime  @default(now())
  views       Int       @default(0)
  uniqueViews Int       @default(0)
  shares      Int       @default(0)
  referrer    String?
  country     String?
  device      String?
  
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  
  @@index([portfolioId, date])
}

model PortfolioDeployment {
  id          String    @id @default(uuid())
  portfolioId String
  version     Int
  status      String    // pending, building, deployed, failed
  deployedAt  DateTime?
  buildLog    String?
  errorLog    String?
  
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  
  @@index([portfolioId])
}

model CustomDomain {
  id          String    @id @default(uuid())
  portfolioId String
  domain      String    @unique
  isVerified  Boolean   @default(false)
  sslEnabled  Boolean   @default(false)
  createdAt   DateTime  @default(now())
  verifiedAt  DateTime?
  
  portfolio   Portfolio @relation(fields: [portfolioId], references: [id], onDelete: Cascade)
  
  @@index([domain])
}

// Moderation System (from PR #58)

model AbuseReport {
  id          String    @id @default(uuid())
  portfolioId String
  reportedBy  String
  reason      String
  description String?
  status      String    @default("pending") // pending, reviewed, resolved
  createdAt   DateTime  @default(now())
  resolvedAt  DateTime?
  resolvedBy  String?
  
  @@index([portfolioId])
  @@index([status])
}

model AuditLog {
  id          String    @id @default(uuid())
  userId      String
  action      String
  resource    String
  resourceId  String?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())
  
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}
```

#### Option B: Use SQL Migrations (Alternative)

If you want to keep SQL migrations, you'll need to:
1. Set up a separate database client for portfolios
2. Run the SQL migrations manually
3. Keep both Prisma and raw SQL queries

**Not recommended** - causes maintenance complexity.

---

## 🔌 Phase 2: API Integration

### Step 2.1: Update Database Client

PR #58 created `apps/web/src/database/client.ts` but it conflicts with your Prisma setup.

**Action:** Remove or adapt it to use Prisma instead.

**File:** `apps/web/src/lib/db/portfolio-client.ts` (NEW)

```typescript
// Portfolio database client using Prisma
import { PrismaClient } from '@prisma/client'

// Get your existing Prisma client
import { prisma } from '@/lib/prisma' // or wherever your prisma instance is

export { prisma as portfolioDb }

// Helper functions for portfolio operations
export async function getPortfolioBySlug(slug: string) {
  return await prisma.portfolio.findUnique({
    where: { slug },
    include: {
      user: true,
      template: true,
      versions: true,
    },
  })
}

export async function getUserPortfolios(userId: string) {
  return await prisma.portfolio.findMany({
    where: { userId },
    include: {
      template: true,
      analytics: true,
    },
    orderBy: { updatedAt: 'desc' },
  })
}

// Add more helper functions as needed
```

### Step 2.2: Update Services to Use Prisma

The services in `apps/web/src/services/` need to be updated to use your Prisma client.

**Example:** Update `apps/web/src/services/portfolio.service.ts`

```typescript
// Before (uses database/client.ts)
import { createSupabaseServiceClient } from '@/database/client'

// After (uses Prisma)
import { prisma } from '@/lib/prisma'

export class PortfolioService {
  async createPortfolio(userId: string, data: CreatePortfolioInput) {
    return await prisma.portfolio.create({
      data: {
        userId,
        title: data.title,
        slug: data.slug,
        content: data.content,
        status: 'DRAFT',
        visibility: 'PRIVATE',
      },
    })
  }
  
  async getPortfolio(id: string) {
    return await prisma.portfolio.findUnique({
      where: { id },
      include: {
        user: true,
        template: true,
        versions: true,
      },
    })
  }
  
  // ... more methods
}
```

---

## 🎨 Phase 3: Frontend Integration

### Step 3.1: Create Portfolio Routes

Create new pages to access the portfolio system.

**File:** `apps/web/src/app/portfolios/page.tsx` (NEW)

```typescript
'use client'

import { useEffect, useState } from 'react'
import { PortfolioList } from '@/components/portfolio/PortfolioList'
import { useAuth } from '@/contexts/AuthContext'

export default function PortfoliosPage() {
  const { user } = useAuth()
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPortfolios() {
      try {
        const response = await fetch('/api/portfolios')
        const data = await response.json()
        setPortfolios(data.portfolios)
      } catch (error) {
        console.error('Failed to fetch portfolios:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchPortfolios()
    }
  }, [user])

  if (loading) return <div>Loading...</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Portfolios</h1>
      <PortfolioList portfolios={portfolios} />
    </div>
  )
}
```

**File:** `apps/web/src/app/portfolios/[id]/page.tsx` (NEW)

```typescript
'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CustomizationPanel } from '@/components/portfolio/CustomizationPanel'
import { SharePortfolio } from '@/components/portfolio/SharePortfolio'
import { ExportOptions } from '@/components/portfolio/ExportOptions'

export default function PortfolioEditPage() {
  const params = useParams()
  const [portfolio, setPortfolio] = useState(null)

  useEffect(() => {
    async function fetchPortfolio() {
      const response = await fetch(`/api/portfolios/${params.id}`)
      const data = await response.json()
      setPortfolio(data.portfolio)
    }

    fetchPortfolio()
  }, [params.id])

  if (!portfolio) return <div>Loading...</div>

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">{portfolio.title}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CustomizationPanel portfolio={portfolio} />
        </div>
        
        <div className="space-y-4">
          <SharePortfolio portfolio={portfolio} />
          <ExportOptions portfolio={portfolio} />
        </div>
      </div>
    </div>
  )
}
```

### Step 3.2: Add Navigation Links

Update your dashboard navigation to include portfolio links.

**File:** `apps/web/src/app/dashboard/DashboardPageClient.tsx`

```typescript
// Add to your tabs/navigation
const tabs = [
  // ... existing tabs
  { 
    id: 'portfolios', 
    label: 'My Portfolios', 
    icon: '🎨' 
  },
]

// Add to your tab content
{activeTab === 'portfolios' && (
  <PortfolioManager />
)}
```

### Step 3.3: Create Portfolio Manager Component

**File:** `apps/web/src/components/PortfolioManager.tsx` (NEW)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { PortfolioList } from './portfolio/PortfolioList'
import { PortfolioCard } from './portfolio/PortfolioCard'

export function PortfolioManager() {
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortfolios()
  }, [])

  async function fetchPortfolios() {
    try {
      const response = await fetch('/api/portfolios')
      const data = await response.json()
      setPortfolios(data.portfolios)
    } catch (error) {
      console.error('Failed to fetch portfolios:', error)
    } finally {
      setLoading(false)
    }
  }

  async function createPortfolio() {
    try {
      const response = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New Portfolio',
          slug: `portfolio-${Date.now()}`,
          content: {},
        }),
      })
      const data = await response.json()
      setPortfolios([...portfolios, data.portfolio])
    } catch (error) {
      console.error('Failed to create portfolio:', error)
    }
  }

  if (loading) {
    return <div className="animate-pulse">Loading portfolios...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Portfolios</h2>
        <button
          onClick={createPortfolio}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Portfolio
        </button>
      </div>

      {portfolios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No portfolios yet</p>
          <button
            onClick={createPortfolio}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Your First Portfolio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} portfolio={portfolio} />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 📊 Phase 4: Dashboard Integration

### Step 4.1: Add Portfolio Tab to Dashboard

**File:** `apps/web/src/app/dashboard/DashboardPageClient.tsx`

Find the tabs array and add:

```typescript
const tabs = [
  { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'resumes', label: 'Resumes', icon: <FileText className="w-5 h-5" /> },
  { id: 'coverletters', label: 'Cover Letters', icon: <Mail className="w-5 h-5" /> },
  { id: 'interviews', label: 'Interviews', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'portfolioBuilder', label: 'AI Portfolio', icon: <Sparkles className="w-5 h-5" /> }, // Existing
  { 
    id: 'portfolios', 
    label: 'My Portfolios', 
    icon: <Globe className="w-5 h-5" /> // NEW
  },
  // ... rest of tabs
]
```

Import the PortfolioManager:

```typescript
import { PortfolioManager } from '@/components/PortfolioManager'
```

Add to the tab content:

```typescript
{activeTab === 'portfolios' && <PortfolioManager />}
```

### Step 4.2: Link AI Portfolio Builder to Portfolio Manager

When user creates a portfolio with AI builder, save it to the portfolio system:

**File:** `apps/web/src/components/portfolio-generator/AIPortfolioBuilder.tsx`

Add save functionality:

```typescript
async function saveToPortfolios(generatedPortfolio) {
  try {
    const response = await fetch('/api/portfolios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: generatedPortfolio.title,
        slug: generatedPortfolio.slug,
        content: generatedPortfolio.content,
        theme: generatedPortfolio.theme,
        status: 'DRAFT',
      }),
    })
    
    const data = await response.json()
    
    // Show success message
    toast.success('Portfolio saved! View it in My Portfolios tab.')
    
    return data.portfolio
  } catch (error) {
    console.error('Failed to save portfolio:', error)
    toast.error('Failed to save portfolio')
  }
}
```

---

## ✨ Phase 5: Testing & Polish

### Step 5.1: Test Database

```bash
# Run Prisma migrations
cd apps/api
npx prisma migrate dev --name add_portfolio_system

# Generate Prisma client
npx prisma generate

# Seed some test templates (optional)
npx prisma db seed
```

### Step 5.2: Test API Endpoints

```bash
# Test portfolio creation
curl -X POST http://localhost:3000/api/portfolios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Portfolio",
    "slug": "test-portfolio",
    "content": {}
  }'

# Test portfolio retrieval
curl http://localhost:3000/api/portfolios

# Test single portfolio
curl http://localhost:3000/api/portfolios/PORTFOLIO_ID
```

### Step 5.3: Test UI

1. Open dashboard: `http://localhost:3000/dashboard`
2. Click "My Portfolios" tab
3. Create a new portfolio
4. Edit the portfolio
5. Share the portfolio
6. Export the portfolio
7. Test all features

### Step 5.4: Add Error Handling

Add proper error boundaries and loading states to all components.

### Step 5.5: Add Toast Notifications

```typescript
// Install if not already
npm install react-hot-toast

// Use in components
import toast from 'react-hot-toast'

toast.success('Portfolio created!')
toast.error('Failed to save portfolio')
```

---

## 📝 Detailed Step-by-Step Checklist

### Database Setup ✅
- [ ] Add Prisma schema for portfolios
- [ ] Run `npx prisma migrate dev`
- [ ] Run `npx prisma generate`
- [ ] Test database connection
- [ ] Seed sample templates (optional)

### API Updates ✅
- [ ] Update services to use Prisma
- [ ] Test all API routes
- [ ] Add authentication middleware
- [ ] Add validation
- [ ] Test error handling

### Frontend Pages ✅
- [ ] Create `/portfolios` page
- [ ] Create `/portfolios/[id]` page
- [ ] Create `/portfolios/[id]/edit` page
- [ ] Create `/portfolios/new` page
- [ ] Add navigation links

### Component Integration ✅
- [ ] Wire up PortfolioList component
- [ ] Wire up PortfolioCard component
- [ ] Wire up CustomizationPanel component
- [ ] Wire up SharePortfolio component
- [ ] Wire up ExportOptions component
- [ ] Wire up VersionHistory component
- [ ] Wire up Analytics dashboard

### Dashboard Integration ✅
- [ ] Add "My Portfolios" tab
- [ ] Import PortfolioManager
- [ ] Add portfolio counter/stats
- [ ] Link AI builder to portfolio system

### Features to Enable ✅
- [ ] Portfolio CRUD operations
- [ ] Portfolio templates
- [ ] Version control
- [ ] Sharing with tokens
- [ ] Export (HTML, PDF, JSON, ZIP)
- [ ] Custom domains (optional)
- [ ] Analytics tracking
- [ ] SEO settings

### Moderation (Optional) ✅
- [ ] Create admin page
- [ ] Wire up abuse reporting
- [ ] Add moderation queue UI
- [ ] Test reporting flow

### Testing ✅
- [ ] Test portfolio creation
- [ ] Test portfolio editing
- [ ] Test portfolio deletion
- [ ] Test sharing
- [ ] Test export
- [ ] Test analytics
- [ ] Test on mobile
- [ ] Performance testing

---

## 🚀 Quick Start (Let's Begin!)

Want me to start with Phase 1? I can help you:

1. Create the Prisma schema
2. Run the migrations
3. Update the services
4. Create the UI components
5. Wire everything together

**Just say "let's start" and I'll begin with Phase 1!**

---

## ⏱️ Time Estimate

| Phase | Time | Difficulty |
|-------|------|------------|
| Phase 1: Database | 2-4 hours | Medium |
| Phase 2: API | 2-3 hours | Easy |
| Phase 3: Frontend | 6-8 hours | Medium |
| Phase 4: Dashboard | 2-3 hours | Easy |
| Phase 5: Testing | 4-6 hours | Medium |
| **Total** | **16-24 hours** | **Medium** |

**Spread over 2-3 days, this is totally achievable!**

---

## 💰 Value You'll Get

Once integrated, you'll have:

✅ Complete portfolio hosting platform  
✅ Version control for portfolios  
✅ Sharing & analytics  
✅ Export to multiple formats  
✅ Custom domains (if you enable it)  
✅ Template system  
✅ Moderation tools  
✅ Admin dashboard  

**Essentially a full SaaS portfolio builder!**

---

Ready to start? Just say "let's begin with Phase 1" and I'll help you create the Prisma schema! 🚀

