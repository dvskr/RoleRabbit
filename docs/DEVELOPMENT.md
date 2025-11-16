# RoleRabbit Development Guide

**Version:** 1.0
**Last Updated:** January 2025

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Setup](#local-setup)
3. [Running the Application](#running-the-application)
4. [Running Tests](#running-tests)
5. [Debugging](#debugging)
6. [Common Development Tasks](#common-development-tasks)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | >= 18.17.0 | JavaScript runtime |
| npm | >= 9.6.7 | Package manager |
| PostgreSQL | >= 14.0 | Database |
| Redis | >= 7.0 (optional) | Caching and rate limiting |
| Git | >= 2.30 | Version control |

### Optional Tools

- **VS Code**: Recommended IDE with extensions
- **Postman/Insomnia**: API testing
- **Docker**: For containerized development
- **pgAdmin/TablePlus**: Database GUI

### System Requirements

- **RAM**: 8GB minimum, 16GB recommended
- **Disk Space**: 5GB free space
- **OS**: macOS, Linux, or Windows (WSL2 recommended)

---

## Local Setup

### Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-org/rolerabbit.git
cd rolerabbit
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm run install:all

# Or install individually
cd apps/web && npm install
cd apps/api && npm install
```

### Step 3: Set Up Environment Variables

Create `.env` files for each application:

#### **apps/web/.env**

```env
# App Configuration
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Database (Supabase)
DATABASE_URL=postgresql://postgres:password@localhost:5432/rolerabbit
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-min-32-chars
JWT_SECRET=your-jwt-secret-here

# Security
ENCRYPTION_KEY=your-256-bit-encryption-key
PRIVACY_HASH_SALT=your-privacy-salt

# Rate Limiting
ADMIN_ALLOWED_IPS=127.0.0.1,::1

# File Storage
NEXT_PUBLIC_STORAGE_URL=https://your-project.supabase.co/storage/v1
STORAGE_BUCKET=portfolios

# Analytics (optional)
PLAUSIBLE_DOMAIN=rolerabbit.com
NEXT_PUBLIC_PLAUSIBLE_ENABLED=false

# Monitoring (optional)
SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_SENTRY_ENABLED=false

# External Services (optional)
VIRUSTOTAL_API_KEY=your-virustotal-key
CLAMAV_HOST=localhost
CLAMAV_PORT=3310

# Email (optional)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@rolerabbit.com

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

#### **apps/api/.env**

```env
# App Configuration
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/rolerabbit

# Authentication
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
REDIS_URL=redis://localhost:6379

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf
```

### Step 4: Set Up Database

#### Option A: Using Supabase (Recommended)

1. Create a Supabase project at https://supabase.com
2. Copy the connection string and API keys to `.env`
3. Run migrations:

```bash
cd apps/web
npx supabase link --project-ref your-project-ref
npx supabase db push
```

#### Option B: Local PostgreSQL

1. Install PostgreSQL:

```bash
# macOS
brew install postgresql@14
brew services start postgresql@14

# Ubuntu/Debian
sudo apt-get install postgresql-14
sudo systemctl start postgresql

# Windows
# Download installer from postgresql.org
```

2. Create database:

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE rolerabbit;
CREATE USER rolerabbit_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE rolerabbit TO rolerabbit_user;

# Exit
\q
```

3. Run migrations:

```bash
cd apps/web
npm run db:migrate

# Or manually
psql -d rolerabbit -f src/database/migrations/001_create_portfolios_table.sql
psql -d rolerabbit -f src/database/migrations/002_create_portfolio_templates_table.sql
# ... run all migration files in order
```

### Step 5: Seed Database (Optional)

```bash
cd apps/web

# Seed templates
npm run db:seed

# Or manually
psql -d rolerabbit -f src/database/migrations/015_seed_templates.sql
```

### Step 6: Set Up Redis (Optional)

```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis

# Windows
# Download from https://github.com/microsoftarchive/redis/releases

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### Step 7: Generate Keys

Generate encryption keys and secrets:

```bash
# Generate encryption key (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Generate NextAuth secret
openssl rand -base64 32
```

### Step 8: Verify Installation

```bash
# Check Node.js version
node --version  # Should be >= 18.17.0

# Check npm version
npm --version   # Should be >= 9.6.7

# Check PostgreSQL
psql --version  # Should be >= 14.0

# Check Redis (if using)
redis-cli --version

# Test database connection
psql $DATABASE_URL -c "SELECT version();"
```

---

## Running the Application

### Development Mode

#### Start All Services

```bash
# From root directory
npm run dev

# This starts:
# - Frontend (Next.js): http://localhost:3000
# - API (Express): http://localhost:3001
```

#### Start Individual Services

```bash
# Frontend only
cd apps/web
npm run dev

# API only
cd apps/api
npm run dev

# With watch mode
npm run dev:watch
```

### Production Build

```bash
# Build all applications
npm run build

# Build individual apps
cd apps/web && npm run build
cd apps/api && npm run build

# Start production server
npm run start
```

### Docker Development

```bash
# Build and start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**docker-compose.yml** (if not exists, create):

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: rolerabbit
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/rolerabbit
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./apps/web:/app/apps/web
      - /app/apps/web/node_modules
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- apps/web/src/lib/auth/rbac.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="rate limiter"
```

### Integration Tests

```bash
# Run all integration tests
npm run test:integration

# Run API integration tests
cd apps/api && npm run test:integration

# Run with coverage
npm run test:integration:coverage
```

### End-to-End Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test test/e2e/portfolio-creation.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

### Security Tests

```bash
# Run security tests
npm run test:security

# Run XSS tests
npm run test:security -- test/security/xss.spec.ts

# Run SQL injection tests
npm run test:security -- test/security/sql-injection.spec.ts
```

### Performance Tests

```bash
# Install k6 (first time only)
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Run load tests
cd test/performance
k6 run portfolio-creation.load.js
k6 run portfolio-list.load.js
k6 run view-tracking.load.js

# Run with custom VUs and duration
k6 run --vus 50 --duration 30s portfolio-creation.load.js

# Generate HTML report
k6 run --out json=results.json portfolio-creation.load.js
k6 report results.json
```

### Accessibility Tests

```bash
# Run accessibility tests
npm run test:a11y

# Run with coverage
npm run test:a11y:coverage
```

### Visual Regression Tests

```bash
# Run visual tests
npm run test:visual

# Update snapshots
npm run test:visual:update
```

### Test Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html

# Coverage thresholds (in jest.config.js)
# - Statements: 80%
# - Branches: 80%
# - Functions: 80%
# - Lines: 80%
```

---

## Debugging

### VS Code Debugging

#### 1. Install VS Code Extensions

- **ESLint**: Linting
- **Prettier**: Code formatting
- **Prisma**: Database schema
- **Jest**: Test runner
- **Thunder Client**: API testing

#### 2. Configure Launch Configurations

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "cwd": "${workspaceFolder}/apps/web",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/apps/web",
      "sourceMapPathOverrides": {
        "webpack://_N_E/*": "${webRoot}/*"
      }
    },
    {
      "name": "API: debug server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/api/src/index.ts",
      "cwd": "${workspaceFolder}/apps/api",
      "runtimeArgs": ["-r", "ts-node/register"],
      "skipFiles": ["<node_internals>/**"],
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "name": "Jest: debug current file",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": [
        "${fileBasenameNoExtension}",
        "--runInBand",
        "--no-cache"
      ],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "name": "Playwright: debug test",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/playwright",
      "args": ["test", "${file}", "--debug"],
      "console": "integratedTerminal"
    }
  ],
  "compounds": [
    {
      "name": "Full Stack: debug",
      "configurations": [
        "Next.js: debug server-side",
        "Next.js: debug client-side"
      ],
      "stopAll": true
    }
  ]
}
```

#### 3. Set Breakpoints

1. Click in the gutter next to line numbers to set breakpoints
2. Press `F5` to start debugging
3. Use debugging toolbar to step through code

### Browser DevTools

```javascript
// Add debugger statement
function myFunction() {
  debugger; // Execution will pause here
  // ... rest of code
}

// Console logging
console.log('User:', user);
console.table(portfolios);
console.time('operation');
// ... code
console.timeEnd('operation');
```

### View Logs

#### Application Logs

```bash
# View frontend logs
cd apps/web
npm run dev 2>&1 | tee logs/web.log

# View API logs
cd apps/api
npm run dev 2>&1 | tee logs/api.log

# View logs in Docker
docker-compose logs -f web
docker-compose logs -f api
```

#### Database Logs

```bash
# PostgreSQL logs
tail -f /usr/local/var/log/postgres.log  # macOS
tail -f /var/log/postgresql/postgresql-14-main.log  # Linux

# Query specific logs
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity WHERE state = 'active';"
```

#### Redis Logs

```bash
# Redis monitor (real-time)
redis-cli monitor

# Redis logs
tail -f /usr/local/var/log/redis.log
```

### Network Debugging

```bash
# Monitor HTTP requests
npm run dev | grep "GET\|POST\|PUT\|DELETE"

# Use curl for API testing
curl -X GET http://localhost:3001/api/portfolios \
  -H "Authorization: Bearer $TOKEN"

# Use httpie (more user-friendly)
http GET localhost:3001/api/portfolios \
  Authorization:"Bearer $TOKEN"
```

### Performance Profiling

```javascript
// Add to code
console.time('operation');
const result = await expensiveOperation();
console.timeEnd('operation');

// React DevTools Profiler
import { Profiler } from 'react';

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

---

## Common Development Tasks

### 1. Creating a New Template

**Step 1: Design Template Structure**

Create template configuration in `apps/web/src/lib/templates/`:

```typescript
// apps/web/src/lib/templates/modern-developer.ts
export const modernDeveloperTemplate = {
  name: 'Modern Developer',
  description: 'Clean, modern template for developers',
  category: 'developer',
  previewUrl: '/templates/modern-developer-preview.jpg',

  config: {
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      fontFamily: 'Inter, sans-serif',
    },
    layout: {
      type: 'single-page',
      navigation: 'sticky',
      sections: {
        hero: { enabled: true, layout: 'centered' },
        about: { enabled: true, layout: 'split' },
        experience: { enabled: true, layout: 'timeline' },
        projects: { enabled: true, layout: 'grid', columns: 3 },
        skills: { enabled: true, layout: 'badges' },
        contact: { enabled: true, layout: 'centered' },
      },
    },
    placeholders: {
      hero: {
        headline: '{{fullName}}',
        subheadline: '{{jobTitle}}',
      },
    },
  },

  sections: [
    {
      id: 'hero',
      type: 'hero',
      order: 1,
      required: true,
      customizable: true,
    },
    // ... more sections
  ],
};
```

**Step 2: Create Migration**

```bash
cd apps/web
# Create migration file
touch src/database/migrations/020_add_modern_developer_template.sql
```

```sql
-- 020_add_modern_developer_template.sql
INSERT INTO portfolio_templates (
  name,
  description,
  category,
  preview_url,
  config,
  sections,
  is_public
) VALUES (
  'Modern Developer',
  'Clean, modern template for developers',
  'developer',
  '/templates/modern-developer-preview.jpg',
  '{"theme": {"primaryColor": "#3b82f6", ...}}',
  '[{"id": "hero", "type": "hero", ...}]',
  true
);
```

**Step 3: Run Migration**

```bash
psql $DATABASE_URL -f src/database/migrations/020_add_modern_developer_template.sql
```

**Step 4: Test Template**

```bash
# Start dev server
npm run dev

# Navigate to templates page
open http://localhost:3000/templates

# Create portfolio with new template
```

### 2. Adding a New Section Type

**Step 1: Define Section Schema**

```typescript
// apps/web/src/lib/sections/testimonials.ts
export interface TestimonialsSection {
  type: 'testimonials';
  title: string;
  testimonials: Array<{
    id: string;
    name: string;
    position: string;
    company?: string;
    testimonial: string;
    image?: string;
    rating?: number;
  }>;
}
```

**Step 2: Create Section Component**

```typescript
// apps/web/src/components/sections/TestimonialsSection.tsx
import { TestimonialsSection as TestimonialsSectionType } from '@/lib/sections/testimonials';

export function TestimonialsSection({ data }: { data: TestimonialsSectionType }) {
  return (
    <section className="testimonials-section">
      <h2>{data.title}</h2>
      <div className="testimonials-grid">
        {data.testimonials.map(testimonial => (
          <div key={testimonial.id} className="testimonial-card">
            {testimonial.image && (
              <img src={testimonial.image} alt={testimonial.name} />
            )}
            <blockquote>{testimonial.testimonial}</blockquote>
            <cite>
              {testimonial.name} - {testimonial.position}
              {testimonial.company && ` at ${testimonial.company}`}
            </cite>
            {testimonial.rating && (
              <div className="rating">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
```

**Step 3: Register Section**

```typescript
// apps/web/src/lib/sections/index.ts
import { TestimonialsSection } from './testimonials';

export const SECTION_TYPES = {
  hero: 'hero',
  about: 'about',
  experience: 'experience',
  projects: 'projects',
  skills: 'skills',
  education: 'education',
  certifications: 'certifications',
  testimonials: 'testimonials', // New section
  contact: 'contact',
};

export const SECTION_COMPONENTS = {
  hero: HeroSection,
  about: AboutSection,
  experience: ExperienceSection,
  projects: ProjectsSection,
  skills: SkillsSection,
  education: EducationSection,
  certifications: CertificationsSection,
  testimonials: TestimonialsSection, // New component
  contact: ContactSection,
};
```

**Step 4: Add to Portfolio Editor**

```typescript
// apps/web/src/components/editor/SectionSelector.tsx
const AVAILABLE_SECTIONS = [
  // ... existing sections
  {
    type: 'testimonials',
    label: 'Testimonials',
    icon: '💬',
    description: 'Client testimonials and reviews',
  },
];
```

**Step 5: Write Tests**

```typescript
// apps/web/src/components/sections/TestimonialsSection.test.tsx
import { render, screen } from '@testing-library/react';
import { TestimonialsSection } from './TestimonialsSection';

describe('TestimonialsSection', () => {
  const mockData = {
    type: 'testimonials' as const,
    title: 'What People Say',
    testimonials: [
      {
        id: '1',
        name: 'John Doe',
        position: 'CEO',
        company: 'Tech Inc',
        testimonial: 'Great work!',
        rating: 5,
      },
    ],
  };

  it('renders testimonials', () => {
    render(<TestimonialsSection data={mockData} />);

    expect(screen.getByText('What People Say')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Great work!')).toBeInTheDocument();
  });

  it('displays rating stars', () => {
    render(<TestimonialsSection data={mockData} />);

    const stars = screen.getAllByText('⭐');
    expect(stars).toHaveLength(5);
  });
});
```

### 3. Modifying AI Prompts

**Location:** `apps/web/src/lib/ai/prompts.ts`

```typescript
// Current prompt
export const PORTFOLIO_GENERATION_PROMPT = `
Generate a professional portfolio based on the following information:

Name: {{name}}
Job Title: {{jobTitle}}
Experience: {{experience}}

...
`;

// Modify prompt
export const PORTFOLIO_GENERATION_PROMPT = `
Create an engaging portfolio that showcases:

Professional Identity:
- Name: {{name}}
- Current Role: {{jobTitle}}
- Years of Experience: {{yearsOfExperience}}

Key Achievements:
{{#each achievements}}
- {{this}}
{{/each}}

Generate compelling content for:
1. Hero section with attention-grabbing headline
2. About section highlighting unique value proposition
3. Experience section with quantifiable achievements
4. Projects section with technical details and impact
5. Skills section organized by proficiency
6. Contact section with clear call-to-action

Style: Professional, conversational, achievement-focused
Tone: Confident but not boastful
Length: Concise and scannable
`;
```

**Test Prompt Changes:**

```bash
# Run AI generation tests
npm test -- apps/web/src/lib/ai/generator.test.ts

# Manual testing
npm run dev
# Navigate to portfolio creation
# Test with various inputs
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

```bash
# Find process using port
lsof -ti:3000

# Kill process
kill -9 $(lsof -ti:3000)

# Or use different port
PORT=3001 npm run dev
```

#### 2. Database Connection Error

```bash
# Check PostgreSQL is running
psql $DATABASE_URL -c "SELECT 1;"

# Restart PostgreSQL
# macOS
brew services restart postgresql@14

# Linux
sudo systemctl restart postgresql
```

#### 3. Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Or
npm ci
```

#### 4. TypeScript Errors

```bash
# Run type check
npm run type-check

# Clear Next.js cache
rm -rf apps/web/.next

# Rebuild
npm run build
```

#### 5. Test Failures

```bash
# Clear Jest cache
npm test -- --clearCache

# Run tests in band (one at a time)
npm test -- --runInBand

# Update snapshots
npm test -- -u
```

---

**Last Updated:** January 15, 2025
