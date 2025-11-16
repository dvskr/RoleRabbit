## Section 3: Database Schema, Migrations & Data Integrity

Complete PostgreSQL database schema for RoleRabbit with migrations, foreign keys, indexes, and Row Level Security (RLS).

---

## Table of Contents

1. [Overview](#overview)
2. [Database Structure](#database-structure)
3. [Migrations](#migrations)
4. [TypeScript Types](#typescript-types)
5. [Setup Instructions](#setup-instructions)
6. [Usage Examples](#usage-examples)
7. [Database Functions](#database-functions)
8. [Performance & Indexes](#performance--indexes)

---

## Overview

### Architecture

```
auth.users (Supabase Auth)
    ↓
portfolios ────→ portfolio_templates
    ↓
    ├─→ portfolio_versions
    ├─→ custom_domains
    ├─→ portfolio_analytics (partitioned by month)
    ├─→ portfolio_shares
    └─→ portfolio_deployments
```

### Key Features

- ✅ **Foreign Key Constraints** with CASCADE/RESTRICT
- ✅ **Unique Constraints** (slug per user, subdomain globally, domain uniqueness)
- ✅ **Check Constraints** (subdomain regex, char limits, domain validation)
- ✅ **Indexes** on all foreign keys and frequently queried columns
- ✅ **Row Level Security (RLS)** for multi-tenant isolation
- ✅ **Automatic Versioning** via triggers
- ✅ **Soft Deletes** with deletedAt timestamps
- ✅ **Audit Trails** with createdBy/updatedBy
- ✅ **Usage Tracking** for templates
- ✅ **Table Partitioning** for analytics (monthly partitions)
- ✅ **Custom Domain Management** with DNS and SSL verification
- ✅ **Secure Share Links** with password protection and expiry
- ✅ **Deployment Pipeline Tracking** with build logs and rollback support

---

## Database Structure

### 3.1 Core Portfolio Tables

**`portfolios` table** (Section 3.1)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Portfolio identifier |
| `user_id` | UUID | NOT NULL, FK → auth.users | Owner of portfolio |
| `name` | VARCHAR(200) | NOT NULL, 1-200 chars | Portfolio name |
| `slug` | VARCHAR(200) | UNIQUE (user_id, slug) | URL-friendly identifier |
| `description` | TEXT | NULLABLE | Portfolio description |
| `data` | JSONB | NOT NULL, DEFAULT '{}' | Portfolio content |
| `template_id` | UUID | FK → portfolio_templates | Template reference |
| `is_published` | BOOLEAN | DEFAULT false | Published status |
| `is_draft` | BOOLEAN | DEFAULT true | Draft status |
| `visibility` | ENUM | DEFAULT 'PRIVATE' | Visibility level |
| `subdomain` | VARCHAR(63) | UNIQUE, REGEX | Custom subdomain |
| `meta_title` | VARCHAR(255) | NULLABLE | SEO title |
| `meta_description` | TEXT | NULLABLE | SEO description |
| `og_image` | VARCHAR(500) | NULLABLE | Open Graph image |
| `view_count` | INTEGER | DEFAULT 0 | View counter |
| `last_viewed_at` | TIMESTAMPTZ | NULLABLE | Last view timestamp |
| `build_status` | ENUM | DEFAULT 'PENDING' | Build status |
| `build_artifact_path` | VARCHAR(500) | NULLABLE | Build output path |
| `last_build_at` | TIMESTAMPTZ | NULLABLE | Last build timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp (auto) |
| `published_at` | TIMESTAMPTZ | NULLABLE | Publish timestamp |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | Soft delete timestamp |
| `created_by` | UUID | FK → auth.users | Creator user |
| `updated_by` | UUID | FK → auth.users | Last updater user |

**Indexes:**
- `idx_portfolios_user_published` ON (user_id, is_published)
- `idx_portfolios_slug` ON (slug)
- `idx_portfolios_subdomain` ON (subdomain) WHERE subdomain IS NOT NULL
- `idx_portfolios_created_at` ON (created_at DESC)
- `idx_portfolios_updated_at` ON (updated_at DESC)

### 3.2 Portfolio Template Tables

**`portfolio_templates` table** (Section 3.2)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Template identifier |
| `name` | VARCHAR(200) | UNIQUE, NOT NULL | Template name |
| `slug` | VARCHAR(200) | UNIQUE, NOT NULL | URL-friendly identifier |
| `description` | TEXT | NULLABLE | Template description |
| `category` | ENUM | DEFAULT 'OTHER' | Template category |
| `thumbnail` | VARCHAR(500) | NULLABLE | Thumbnail image URL |
| `preview_url` | VARCHAR(500) | NULLABLE | Live preview URL |
| `html_template` | TEXT | NOT NULL | HTML template code |
| `css_template` | TEXT | NOT NULL | CSS styles |
| `js_template` | TEXT | NULLABLE | JavaScript code |
| `config` | JSONB | DEFAULT '{}' | Template configuration |
| `default_data` | JSONB | DEFAULT '{}' | Default data structure |
| `is_premium` | BOOLEAN | DEFAULT false | Premium template flag |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `usage_count` | INTEGER | DEFAULT 0 | Usage counter (auto) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp (auto) |

**Indexes:**
- `idx_portfolio_templates_category` ON (category)
- `idx_portfolio_templates_active` ON (is_active) WHERE is_active = true

### 3.3 Portfolio Version Tables

**`portfolio_versions` table** (Section 3.3)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Version identifier |
| `portfolio_id` | UUID | FK → portfolios, NOT NULL | Parent portfolio |
| `version` | INTEGER | UNIQUE (portfolio_id, version) | Version number (1, 2, 3...) |
| `name` | VARCHAR(200) | NULLABLE | Version name/description |
| `data` | JSONB | NOT NULL | Data snapshot |
| `metadata` | JSONB | DEFAULT '{}' | Version metadata |
| `created_by` | UUID | FK → auth.users | Creator user |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_portfolio_versions_portfolio` ON (portfolio_id, version DESC)

**Note:** Versions are **immutable** - no UPDATE or DELETE policies.

### 3.4 Custom Domain Tables

**`custom_domains` table** (Section 3.4)

Manages custom domains for portfolios with DNS verification and SSL certificate tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Domain identifier |
| `portfolio_id` | UUID | FK → portfolios, NOT NULL | Parent portfolio |
| `domain` | VARCHAR(255) | UNIQUE, NOT NULL, REGEX | Custom domain (e.g., 'portfolio.example.com') |
| `is_verified` | BOOLEAN | DEFAULT false | DNS verification status |
| `verification_token` | VARCHAR(255) | NOT NULL | Unique verification token |
| `ssl_status` | ENUM | DEFAULT 'PENDING' | SSL certificate status |
| `ssl_cert_path` | TEXT | NULLABLE | Path to SSL certificate |
| `ssl_expires_at` | TIMESTAMPTZ | NULLABLE | SSL expiration date |
| `dns_records` | JSONB | DEFAULT '[]' | Required DNS records |
| `last_checked_at` | TIMESTAMPTZ | NULLABLE | Last DNS check timestamp |
| `verified_at` | TIMESTAMPTZ | NULLABLE | Verification timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp (auto) |

**Indexes:**
- `idx_custom_domains_portfolio` ON (portfolio_id)
- `idx_custom_domains_domain` ON (domain)
- `idx_custom_domains_verified` ON (is_verified) WHERE is_verified = true
- `idx_custom_domains_ssl_expiry` ON (ssl_expires_at) WHERE ssl_expires_at IS NOT NULL

**Check Constraints:**
- Domain must match regex: `^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$`

**SSL Status Enum:**
- `PENDING` - Awaiting SSL provisioning
- `PROVISIONING` - SSL certificate being generated
- `ACTIVE` - SSL certificate active
- `FAILED` - SSL provisioning failed
- `EXPIRED` - SSL certificate expired

### 3.5 Analytics Tables

**`portfolio_analytics` table** (Section 3.5)

Stores daily analytics data with monthly table partitioning for performance.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | DEFAULT gen_random_uuid() | Analytics record identifier |
| `portfolio_id` | UUID | FK → portfolios, NOT NULL | Parent portfolio |
| `date` | DATE | NOT NULL | Analytics date |
| `views` | INTEGER | DEFAULT 0 | Page views |
| `unique_visitors` | INTEGER | DEFAULT 0 | Unique visitor count |
| `avg_time_on_page` | INTEGER | NULLABLE | Average time (seconds) |
| `bounce_rate` | NUMERIC(5,2) | NULLABLE | Bounce rate (0-100%) |
| `referrers` | JSONB | DEFAULT '{}' | Referrer sources map |
| `countries` | JSONB | DEFAULT '{}' | Country visitor map |
| `devices` | JSONB | DEFAULT '{}' | Device type map |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Update timestamp (auto) |

**Partitioning:** Monthly partitions by `date` column
- Format: `portfolio_analytics_YYYY_MM`
- Auto-creates 3 months ahead
- Index on `(portfolio_id, date)` per partition

**Unique Constraint:** `(portfolio_id, date)` - one record per portfolio per day

**Indexes (per partition):**
- `idx_analytics_YYYY_MM_portfolio_date` ON (portfolio_id, date DESC)

### 3.6 Sharing Tables

**`portfolio_shares` table** (Section 3.6)

Secure sharing links with password protection, expiry, and view limits.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Share identifier |
| `portfolio_id` | UUID | FK → portfolios, NOT NULL | Parent portfolio |
| `token` | VARCHAR(255) | UNIQUE, NOT NULL, 32+ chars | URL-safe share token |
| `expires_at` | TIMESTAMPTZ | NULLABLE | Expiration timestamp |
| `password` | TEXT | NULLABLE | Hashed password (bcrypt) |
| `view_count` | INTEGER | DEFAULT 0 | View counter |
| `max_views` | INTEGER | NULLABLE | Maximum views allowed |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `last_accessed_at` | TIMESTAMPTZ | NULLABLE | Last access timestamp |

**Indexes:**
- `idx_portfolio_shares_portfolio` ON (portfolio_id)
- `idx_portfolio_shares_token` ON (token)
- `idx_portfolio_shares_expires` ON (expires_at) WHERE expires_at IS NOT NULL

**Check Constraints:**
- Token length ≥ 32 characters
- Token matches: `^[a-zA-Z0-9_-]+$`

### 3.7 Deployment History Tables

**`portfolio_deployments` table** (Section 3.7)

Tracks deployment pipeline with build logs and rollback support.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Deployment identifier |
| `portfolio_id` | UUID | FK → portfolios, NOT NULL | Parent portfolio |
| `status` | ENUM | DEFAULT 'QUEUED' | Deployment status |
| `build_log` | TEXT | NULLABLE | Build/deployment logs |
| `error_message` | TEXT | NULLABLE | Error details if failed |
| `deployed_url` | TEXT | NULLABLE | Final deployed URL |
| `build_duration` | INTEGER | NULLABLE | Build time (seconds) |
| `deployed_by` | UUID | FK → auth.users | User who deployed |
| `deployed_at` | TIMESTAMPTZ | NULLABLE | Deployment completion time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes:**
- `idx_portfolio_deployments_portfolio` ON (portfolio_id, created_at DESC)
- `idx_portfolio_deployments_status` ON (status) WHERE status NOT IN ('DEPLOYED', 'FAILED')

**Deployment Status Enum:**
- `QUEUED` - Deployment queued
- `BUILDING` - Building portfolio
- `DEPLOYING` - Deploying to hosting
- `DEPLOYED` - Successfully deployed
- `FAILED` - Deployment failed
- `ROLLED_BACK` - Rolled back to previous version

### 3.8 Additional Enums

**Portfolio Category** (for classification):
```sql
CREATE TYPE portfolio_category AS ENUM (
  'DEVELOPER',
  'DESIGNER',
  'MARKETING',
  'BUSINESS',
  'CREATIVE',
  'ACADEMIC',
  'GENERAL'
);
```

**Updated Portfolio Visibility** (added PASSWORD_PROTECTED):
```sql
ALTER TYPE portfolio_visibility ADD VALUE 'PASSWORD_PROTECTED';
-- Now supports: PRIVATE, PUBLIC, UNLISTED, PASSWORD_PROTECTED
```

---

## Migrations

### Migration Order

Run migrations in this exact order in Supabase SQL Editor:

```sql
-- Core Tables (Sections 3.1-3.3)
\i 001_create_portfolios_table.sql
\i 002_create_portfolio_templates_table.sql
\i 003_create_portfolio_versions_table.sql
\i 004_add_foreign_key_constraints.sql

-- Extended Tables (Sections 3.4-3.8)
\i 006_create_enums.sql
\i 007_create_custom_domains_table.sql
\i 008_create_portfolio_analytics_table.sql
\i 009_create_portfolio_shares_table.sql
\i 010_create_portfolio_deployments_table.sql
\i 011_add_foreign_key_constraints_extended.sql
```

### Migration Files

1. **`001_create_portfolios_table.sql`**
   - Creates `portfolio_visibility` enum
   - Creates `portfolio_build_status` enum
   - Creates `portfolios` table
   - Adds all constraints and indexes
   - Creates `updated_at` trigger
   - Enables RLS with policies

2. **`002_create_portfolio_templates_table.sql`**
   - Creates `template_category` enum
   - Creates `portfolio_templates` table
   - Adds constraints and indexes
   - Creates usage counter function
   - Enables RLS (admin-only write access)
   - Seeds 3 starter templates

3. **`003_create_portfolio_versions_table.sql`**
   - Creates `portfolio_versions` table
   - Creates auto-versioning trigger
   - Creates version utility functions
   - Enables RLS (owner read-only)

4. **`004_add_foreign_key_constraints.sql`**
   - Adds all foreign key constraints
   - Creates template deletion prevention
   - Creates usage count tracking
   - Adds cascade logging

5. **`006_create_enums.sql`** (Section 3.8)
   - Creates `ssl_status` enum
   - Creates `deployment_status` enum
   - Creates `portfolio_category` enum
   - Updates `portfolio_visibility` enum with PASSWORD_PROTECTED

6. **`007_create_custom_domains_table.sql`** (Section 3.4)
   - Creates `custom_domains` table
   - Adds domain validation constraints
   - Creates indexes for performance
   - Creates domain verification functions
   - Creates SSL management functions
   - Enables RLS policies

7. **`008_create_portfolio_analytics_table.sql`** (Section 3.5)
   - Creates partitioned `portfolio_analytics` table
   - Creates initial 3 monthly partitions
   - Creates partition management functions
   - Creates analytics upsert function with JSONB merging
   - Creates analytics summary function
   - Enables RLS policies

8. **`009_create_portfolio_shares_table.sql`** (Section 3.6)
   - Creates `portfolio_shares` table
   - Adds token generation function
   - Creates share creation function
   - Creates share validation function
   - Creates view count increment function
   - Enables RLS policies

9. **`010_create_portfolio_deployments_table.sql`** (Section 3.7)
   - Creates `portfolio_deployments` table
   - Creates deployment status update functions
   - Creates build log append function
   - Creates deployment start/complete functions
   - Creates rollback function
   - Creates deployment stats function
   - Enables RLS policies

10. **`011_add_foreign_key_constraints_extended.sql`**
    - Adds foreign keys for custom_domains
    - Adds foreign keys for portfolio_analytics
    - Adds foreign keys for portfolio_shares
    - Adds foreign keys for portfolio_deployments
    - All with CASCADE delete behavior

---

## TypeScript Types

All types are in `apps/web/src/database/types.ts`.

### Core Types

```typescript
import { Portfolio, PortfolioTemplate, PortfolioVersion } from '@/database/types';

// Full portfolio object
const portfolio: Portfolio = {
  id: 'uuid',
  userId: 'uuid',
  name: 'My Portfolio',
  slug: 'my-portfolio',
  data: { /* ... */ },
  // ... all other fields
};
```

### Input Types

```typescript
import { CreatePortfolioInput, UpdatePortfolioInput } from '@/database/types';

// Create a portfolio
const input: CreatePortfolioInput = {
  name: 'My Portfolio',
  slug: 'my-portfolio', // Optional - auto-generated if not provided
  templateId: 'template-uuid',
  data: {
    about: {
      name: 'John Doe',
      title: 'Software Engineer',
    },
  },
};
```

### Enums

```typescript
import {
  PortfolioVisibility,
  PortfolioBuildStatus,
  TemplateCategory,
  SSLStatus,
  DeploymentStatus,
  PortfolioCategory
} from '@/database/types';

const visibility: PortfolioVisibility = PortfolioVisibility.PUBLIC;
const buildStatus: PortfolioBuildStatus = PortfolioBuildStatus.SUCCESS;
const category: TemplateCategory = TemplateCategory.MINIMAL;

// New enums (Sections 3.4-3.8)
const sslStatus: SSLStatus = SSLStatus.ACTIVE;
const deployStatus: DeploymentStatus = DeploymentStatus.DEPLOYED;
const portfolioCategory: PortfolioCategory = PortfolioCategory.DEVELOPER;
```

### Extended Types (Sections 3.4-3.8)

```typescript
import {
  CustomDomain,
  PortfolioAnalytics,
  PortfolioShare,
  PortfolioDeployment,
  CreateCustomDomainInput,
  UpsertAnalyticsInput,
  CreateShareInput,
  StartDeploymentInput
} from '@/database/types';

// Custom domain
const domain: CustomDomain = {
  id: 'uuid',
  portfolioId: 'portfolio-uuid',
  domain: 'portfolio.example.com',
  isVerified: true,
  verificationToken: 'token-123',
  sslStatus: SSLStatus.ACTIVE,
  // ... other fields
};

// Analytics
const analytics: PortfolioAnalytics = {
  id: 'uuid',
  portfolioId: 'portfolio-uuid',
  date: new Date('2025-01-15'),
  views: 150,
  uniqueVisitors: 120,
  referrers: { 'google.com': 80, 'twitter.com': 40 },
  countries: { 'US': 90, 'UK': 30 },
  devices: { 'desktop': 100, 'mobile': 50 },
  // ... other fields
};

// Share link
const share: PortfolioShare = {
  id: 'uuid',
  portfolioId: 'portfolio-uuid',
  token: 'abcd1234efgh5678ijkl9012mnop3456',
  expiresAt: new Date('2025-12-31'),
  viewCount: 25,
  maxViews: 100,
  // ... other fields
};

// Deployment
const deployment: PortfolioDeployment = {
  id: 'uuid',
  portfolioId: 'portfolio-uuid',
  status: DeploymentStatus.DEPLOYED,
  deployedUrl: 'https://portfolio.rolerabbit.com',
  buildDuration: 45,
  // ... other fields
};
```

---

## Setup Instructions

### 1. Run Migrations

In Supabase SQL Editor, run each migration file in order:

```sql
-- Copy/paste contents of each file in order:
-- Core tables (3.1-3.3)
-- 001_create_portfolios_table.sql
-- 002_create_portfolio_templates_table.sql
-- 003_create_portfolio_versions_table.sql
-- 004_add_foreign_key_constraints.sql

-- Extended tables (3.4-3.8)
-- 006_create_enums.sql
-- 007_create_custom_domains_table.sql
-- 008_create_portfolio_analytics_table.sql
-- 009_create_portfolio_shares_table.sql
-- 010_create_portfolio_deployments_table.sql
-- 011_add_foreign_key_constraints_extended.sql
```

### 2. Verify Tables

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'portfolios',
    'portfolio_templates',
    'portfolio_versions',
    'custom_domains',
    'portfolio_analytics',
    'portfolio_shares',
    'portfolio_deployments'
  )
ORDER BY table_name;

-- Check foreign keys
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN (
    'portfolios',
    'portfolio_versions',
    'custom_domains',
    'portfolio_analytics',
    'portfolio_shares',
    'portfolio_deployments'
  )
ORDER BY tc.table_name, kcu.column_name;

-- Check analytics partitions
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE tablename LIKE 'portfolio_analytics_%'
ORDER BY tablename;
```

### 3. Install TypeScript Dependencies

```bash
npm install @supabase/supabase-js
```

### 4. Configure Environment

In `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Usage Examples

### Basic CRUD Operations

```typescript
import { db } from '@/database/client';
import { CreatePortfolioInput } from '@/database/types';

// Create a portfolio
const input: CreatePortfolioInput = {
  name: 'My Portfolio',
  templateId: 'template-uuid',
  data: {
    about: {
      name: 'John Doe',
      title: 'Software Engineer',
    },
    experience: [
      {
        title: 'Senior Developer',
        company: 'Acme Corp',
        startDate: '2020-01-01',
        current: true,
        description: 'Building awesome stuff',
      },
    ],
  },
};

const slug = await db.generateUniqueSlug(input.name, userId);
const { data, error } = await supabase
  .from('portfolios')
  .insert({
    ...input,
    slug,
    user_id: userId,
  })
  .select()
  .single();

// Update a portfolio
const { error } = await supabase
  .from('portfolios')
  .update({
    name: 'Updated Name',
    is_published: true,
    published_at: new Date().toISOString(),
  })
  .eq('id', portfolioId);

// Soft delete
await db.softDeletePortfolio(portfolioId);

// Restore
await db.restorePortfolio(portfolioId);
```

### Version Management

```typescript
// Get version history
const history = await db.getVersionHistory(portfolioId, 10);
console.log(history);
// [
//   { version: 3, name: 'Auto-save...', createdAt: '...', changesSummary: 'Updated' },
//   { version: 2, name: 'Auto-save...', createdAt: '...', changesSummary: 'Updated' },
//   { version: 1, name: 'Auto-save...', createdAt: '...', changesSummary: 'Created' },
// ]

// Compare versions
const diff = await db.compareVersions(portfolioId, 1, 3);
console.log(diff);
// [
//   { field: 'about.name', version1Value: 'John', version2Value: 'Jane', isDifferent: true },
//   ...
// ]

// Restore to version 2
await db.restoreVersion(portfolioId, 2);
```

### Template Operations

```typescript
// Get active templates
const templates = await db.getActiveTemplates();

// Get templates by category
const minimalTemplates = await db.getActiveTemplates('MINIMAL');

// Use a template
const { data } = await supabase
  .from('portfolio_templates')
  .select('*')
  .eq('slug', 'minimal-professional')
  .single();

// Create portfolio from template
const portfolio = await supabase
  .from('portfolios')
  .insert({
    user_id: userId,
    name: 'My Portfolio',
    slug: 'my-portfolio',
    template_id: data.id,
    data: data.default_data, // Use template's default data
  });
```

### With Type Safety

```typescript
import { createSupabaseClient, Database } from '@/database/client';

const supabase = createSupabaseClient();

// Type-safe query
const { data, error } = await supabase
  .from('portfolios')
  .select('*, template:portfolio_templates(*)')
  .eq('user_id', userId)
  .single();

if (data) {
  console.log(data.name); // ✅ Type-safe
  console.log(data.template?.html_template); // ✅ Type-safe
}
```

### Custom Domains (Section 3.4)

```typescript
import { db } from '@/database/client';
import { CreateCustomDomainInput } from '@/database/types';

// Create a custom domain
const domainInput: CreateCustomDomainInput = {
  portfolioId: 'portfolio-uuid',
  domain: 'portfolio.example.com',
};
const domain = await db.createCustomDomain(domainInput);
console.log(`Verification token: ${domain.verificationToken}`);

// Get all domains for a portfolio
const domains = await db.getPortfolioCustomDomains('portfolio-uuid');

// Verify a domain (after DNS verification)
await db.verifyCustomDomain(domain.id, true);

// Update SSL status
await db.updateDomainSSLStatus(
  domain.id,
  'ACTIVE',
  '/path/to/cert',
  new Date('2026-01-15')
);

// Get domains needing SSL renewal (30 days before expiry)
const renewalDomains = await db.getDomainsNeedingSSLRenewal(30);
```

### Analytics (Section 3.5)

```typescript
import { db } from '@/database/client';
import { UpsertAnalyticsInput } from '@/database/types';

// Upsert daily analytics
const analyticsInput: UpsertAnalyticsInput = {
  portfolioId: 'portfolio-uuid',
  date: new Date(),
  views: 10,
  uniqueVisitors: 8,
  avgTimeOnPage: 120, // seconds
  bounceRate: 35.5,
  referrer: 'google.com',
  country: 'US',
  device: 'desktop',
};
await db.upsertAnalytics(analyticsInput);

// Get analytics summary (last 30 days)
const startDate = new Date();
startDate.setDate(startDate.getDate() - 30);
const endDate = new Date();

const summary = await db.getAnalyticsSummary('portfolio-uuid', startDate, endDate);
console.log(`Total views: ${summary.totalViews}`);
console.log(`Unique visitors: ${summary.totalUniqueVisitors}`);
console.log(`Top referrers:`, summary.topReferrers);
console.log(`Top countries:`, summary.topCountries);

// Get raw analytics for date range
const analytics = await db.getAnalyticsByDateRange('portfolio-uuid', startDate, endDate);
```

### Share Links (Section 3.6)

```typescript
import { db } from '@/database/client';
import { CreateShareInput } from '@/database/types';

// Create a share link with expiry and password
const shareInput: CreateShareInput = {
  portfolioId: 'portfolio-uuid',
  expiresInDays: 7, // Expires in 7 days
  password: 'secret123', // Will be hashed
  maxViews: 100, // Max 100 views
};
const share = await db.createShareLink(shareInput);
console.log(`Share URL: https://app.com/share/${share.token}`);

// Validate share access (without password)
const validation = await db.validateShareAccess(share.token);
if (validation.requiresPassword) {
  console.log('Password required');
}

// Validate share access (with password)
const validationWithPwd = await db.validateShareAccess(share.token, 'secret123');
if (validationWithPwd.isValid && validationWithPwd.passwordCorrect) {
  // Increment view count
  await db.incrementShareViewCount(share.token);
  console.log(`Portfolio ID: ${validationWithPwd.portfolioId}`);
}

// Get all share links for a portfolio
const shares = await db.getPortfolioShares('portfolio-uuid');

// Delete a share link
await db.deleteShareLink(share.id);
```

### Deployments (Section 3.7)

```typescript
import { db } from '@/database/client';
import { StartDeploymentInput } from '@/database/types';

// Start a new deployment
const deployInput: StartDeploymentInput = {
  portfolioId: 'portfolio-uuid',
  deployedBy: 'user-uuid',
};
const deploymentId = await db.startDeployment(deployInput);

// Update deployment status during build
await db.updateDeploymentStatus(deploymentId, 'BUILDING');

// Append build logs
await db.appendDeploymentLog(deploymentId, '[INFO] Starting build...');
await db.appendDeploymentLog(deploymentId, '[INFO] Compiling templates...');

// Complete deployment (success)
await db.completeDeployment(
  deploymentId,
  true, // success
  'https://portfolio.rolerabbit.com',
  undefined, // no error
  45 // build duration in seconds
);

// Complete deployment (failure)
await db.completeDeployment(
  deploymentId,
  false, // failed
  undefined,
  'Build failed: Template compilation error',
  30
);

// Get deployment history
const history = await db.getDeploymentHistory('portfolio-uuid', 20);

// Get deployment stats
const stats = await db.getDeploymentStats('portfolio-uuid');
console.log(`Total deployments: ${stats.totalDeployments}`);
console.log(`Success rate: ${(stats.successfulDeployments / stats.totalDeployments * 100).toFixed(1)}%`);
console.log(`Avg build duration: ${stats.avgBuildDuration}s`);

// Get latest deployment
const latest = await db.getLatestDeployment('portfolio-uuid');
if (latest) {
  console.log(`Status: ${latest.status}`);
  console.log(`URL: ${latest.deployedUrl}`);
}
```

---

## Database Functions

### Automatic Functions (via triggers)

1. **`update_updated_at_column()`**
   - Automatically sets `updated_at` to NOW() on UPDATE
   - Applied to: `portfolios`, `portfolio_templates`, `custom_domains`, `portfolio_analytics`

2. **`create_portfolio_version()`**
   - Automatically creates version when `portfolios.data` changes
   - Increments version number
   - Stores metadata (operation, isPublished, buildStatus)

3. **`update_template_usage_count()`**
   - Increments when portfolio created with template
   - Decrements when template changed or portfolio deleted
   - Handles soft deletes

4. **`create_next_analytics_partition()`**
   - Automatically creates next month's analytics partition
   - Triggered when data is inserted near partition boundary
   - Creates partitions 3 months ahead

### Manual Functions (callable via RPC)

```typescript
// Get next version number
const { data } = await supabase.rpc('get_next_portfolio_version', {
  p_portfolio_id: 'uuid',
});
// Returns: 4

// Restore version
const { data } = await supabase.rpc('restore_portfolio_version', {
  p_portfolio_id: 'uuid',
  p_version: 2,
});
// Returns: true

// Compare versions
const { data } = await supabase.rpc('compare_portfolio_versions', {
  p_portfolio_id: 'uuid',
  p_version1: 1,
  p_version2: 3,
});
// Returns: [{ field, version1_value, version2_value, is_different }, ...]

// Get version history
const { data } = await supabase.rpc('get_portfolio_version_history', {
  p_portfolio_id: 'uuid',
  p_limit: 10,
});
// Returns: [{ version, name, created_at, created_by, changes_summary }, ...]
```

### Extended Functions (Sections 3.4-3.8)

```typescript
// ============================================================================
// Custom Domains (3.4)
// ============================================================================

// Verify a custom domain
await supabase.rpc('verify_custom_domain', {
  p_domain_id: 'domain-uuid',
  p_verified: true,
});

// Update SSL status
await supabase.rpc('update_domain_ssl_status', {
  p_domain_id: 'domain-uuid',
  p_status: 'ACTIVE',
  p_cert_path: '/path/to/cert',
  p_expires_at: '2026-01-15T00:00:00Z',
});

// Get domains needing SSL renewal
const { data } = await supabase.rpc('get_domains_needing_ssl_renewal', {
  p_days_before_expiry: 30,
});
// Returns: [{ id, portfolio_id, domain, ssl_expires_at, days_until_expiry }, ...]

// ============================================================================
// Analytics (3.5)
// ============================================================================

// Upsert analytics data
await supabase.rpc('upsert_portfolio_analytics', {
  p_portfolio_id: 'portfolio-uuid',
  p_date: '2025-01-15',
  p_views: 10,
  p_unique_visitors: 8,
  p_avg_time_on_page: 120,
  p_bounce_rate: 35.5,
  p_referrer: 'google.com',
  p_country: 'US',
  p_device: 'desktop',
});

// Get analytics summary
const { data } = await supabase.rpc('get_portfolio_analytics_summary', {
  p_portfolio_id: 'portfolio-uuid',
  p_start_date: '2024-12-15',
  p_end_date: '2025-01-15',
});
// Returns: { total_views, total_unique_visitors, avg_time_on_page, avg_bounce_rate, top_referrers, top_countries, top_devices, daily_data }

// ============================================================================
// Shares (3.6)
// ============================================================================

// Create share link
const { data } = await supabase.rpc('create_portfolio_share', {
  p_portfolio_id: 'portfolio-uuid',
  p_expires_in_days: 7,
  p_password: 'secret123',
  p_max_views: 100,
});
// Returns: { id, token }

// Validate share access
const { data } = await supabase.rpc('validate_share_access', {
  p_share_token: 'abcd1234efgh5678...',
  p_password: 'secret123',
});
// Returns: { is_valid, portfolio_id, requires_password, password_correct, is_expired, views_remaining, error_message }

// Increment share view count
await supabase.rpc('increment_share_view_count', {
  p_share_token: 'abcd1234efgh5678...',
});

// ============================================================================
// Deployments (3.7)
// ============================================================================

// Start deployment
const { data: deploymentId } = await supabase.rpc('start_deployment', {
  p_portfolio_id: 'portfolio-uuid',
  p_deployed_by: 'user-uuid',
});
// Returns: deployment_id (UUID)

// Update deployment status
await supabase.rpc('update_deployment_status', {
  p_deployment_id: deploymentId,
  p_status: 'BUILDING',
  p_error: null,
  p_url: null,
  p_duration: null,
});

// Complete deployment
await supabase.rpc('complete_deployment', {
  p_deployment_id: deploymentId,
  p_success: true,
  p_url: 'https://portfolio.rolerabbit.com',
  p_error: null,
  p_duration: 45,
});

// Get deployment history
const { data } = await supabase.rpc('get_deployment_history', {
  p_portfolio_id: 'portfolio-uuid',
  p_limit: 20,
});
// Returns: [{ id, status, deployed_url, build_duration, created_at, ... }, ...]

// Get deployment stats
const { data } = await supabase.rpc('get_deployment_stats', {
  p_portfolio_id: 'portfolio-uuid',
});
// Returns: { total_deployments, successful_deployments, failed_deployments, avg_build_duration, last_deployment_at, last_successful_deployment_at }
```

---

## Performance & Indexes

### Query Optimization

**All foreign keys are indexed:**
- `portfolios.user_id`
- `portfolios.template_id`
- `portfolio_versions.portfolio_id`
- `custom_domains.portfolio_id`
- `portfolio_analytics.portfolio_id` (per partition)
- `portfolio_shares.portfolio_id`
- `portfolio_deployments.portfolio_id`

**Common query patterns are indexed:**
- `(user_id, is_published)` - User's published portfolios
- `created_at DESC` - Recent portfolios
- `updated_at DESC` - Recently updated
- `subdomain` - Custom domain lookup
- `slug` - Portfolio by slug
- `custom_domains.domain` - Domain lookup
- `portfolio_shares.token` - Share token lookup
- `(portfolio_id, date)` - Analytics by portfolio and date
- `(portfolio_id, created_at DESC)` - Deployment history

**Partitioned Tables:**
- `portfolio_analytics` is partitioned by month for improved query performance
- Each partition has its own indexes
- Queries filtering by date automatically use the correct partition

### Performance Tips

1. **Use SELECT with field list** (not `SELECT *`):
   ```typescript
   // ✅ Good
   .select('id, name, slug, is_published')

   // ❌ Avoid
   .select('*')
   ```

2. **Use pagination**:
   ```typescript
   .range(offset, offset + limit - 1)
   ```

3. **Filter deleted records**:
   ```typescript
   .is('deleted_at', null)
   ```

4. **Use RLS policies** (automatic filtering):
   - Portfolios are automatically filtered by `user_id`
   - Public queries only see published portfolios

### Index Usage Examples

```sql
-- Uses idx_portfolios_user_published
EXPLAIN ANALYZE
SELECT * FROM portfolios
WHERE user_id = 'uuid'
  AND is_published = true;

-- Uses idx_portfolios_subdomain
EXPLAIN ANALYZE
SELECT * FROM portfolios
WHERE subdomain = 'johndoe'
  AND deleted_at IS NULL;

-- Uses idx_portfolio_versions_portfolio
EXPLAIN ANALYZE
SELECT * FROM portfolio_versions
WHERE portfolio_id = 'uuid'
ORDER BY version DESC
LIMIT 10;
```

---

## Row Level Security (RLS)

### Portfolios Policies

```sql
-- Users can view own portfolios OR published portfolios
CREATE POLICY "Users can view own portfolios"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id OR is_published = true);

-- Users can insert their own portfolios
CREATE POLICY "Users can create own portfolios"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own portfolios
CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id);

-- Public can view published portfolios
CREATE POLICY "Public can view published portfolios"
  ON portfolios FOR SELECT
  USING (is_published = true AND visibility = 'PUBLIC');
```

### Templates Policies

```sql
-- Anyone can view active templates
CREATE POLICY "Anyone can view active templates"
  ON portfolio_templates FOR SELECT
  USING (is_active = true);

-- Only admins can create/update/delete templates
CREATE POLICY "Only admins can create templates"
  ON portfolio_templates FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM users WHERE role = 'admin'));
```

### Versions Policies

```sql
-- Users can view versions of their own portfolios
CREATE POLICY "Users can view own portfolio versions"
  ON portfolio_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.id = portfolio_versions.portfolio_id
      AND portfolios.user_id = auth.uid()
    )
  );

-- Versions are immutable (no UPDATE/DELETE policies)
```

---

## Constraints Summary

### Foreign Keys

| Table | Column | References | ON DELETE |
|-------|--------|------------|-----------|
| portfolios | user_id | auth.users(id) | CASCADE |
| portfolios | template_id | portfolio_templates(id) | RESTRICT |
| portfolios | created_by | auth.users(id) | SET NULL |
| portfolios | updated_by | auth.users(id) | SET NULL |
| portfolio_versions | portfolio_id | portfolios(id) | CASCADE |
| portfolio_versions | created_by | auth.users(id) | SET NULL |
| custom_domains | portfolio_id | portfolios(id) | CASCADE |
| portfolio_analytics | portfolio_id | portfolios(id) | CASCADE |
| portfolio_shares | portfolio_id | portfolios(id) | CASCADE |
| portfolio_deployments | portfolio_id | portfolios(id) | CASCADE |
| portfolio_deployments | deployed_by | auth.users(id) | SET NULL |

### Unique Constraints

- `portfolios(user_id, slug)` - Unique slug per user
- `portfolios(subdomain)` WHERE subdomain IS NOT NULL AND deleted_at IS NULL - Global unique subdomain
- `portfolio_templates(name)` - Unique template names
- `portfolio_templates(slug)` - Unique template slugs
- `portfolio_versions(portfolio_id, version)` - Unique version numbers
- `custom_domains(domain)` - Global unique domain
- `portfolio_analytics(portfolio_id, date)` - One record per portfolio per day
- `portfolio_shares(token)` - Unique share tokens

### Check Constraints

- `portfolios.name`: 1-200 characters
- `portfolios.subdomain`: Matches regex `^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$`, 3-63 chars
- `portfolio_versions.version`: Must be > 0
- `portfolio_templates.usage_count`: Must be >= 0
- `custom_domains.domain`: Matches domain regex `^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$`
- `portfolio_shares.token`: Minimum 32 characters, matches `^[a-zA-Z0-9_-]+$`

---

## Troubleshooting

### Common Issues

**1. Foreign key violation when deleting template:**
```
ERROR: Cannot delete template because it is used by N portfolio(s)
```
**Solution:** Reassign portfolios to a different template first.

**2. Subdomain already exists:**
```
ERROR: duplicate key value violates unique constraint "unique_active_subdomain"
```
**Solution:** Choose a different subdomain.

**3. RLS policy blocking access:**
```
ERROR: new row violates row-level security policy
```
**Solution:** Ensure `auth.uid()` matches `user_id` or user has admin role.

### Debugging Queries

```sql
-- Check portfolio ownership
SELECT id, user_id, name FROM portfolios WHERE id = 'portfolio-uuid';

-- Check template usage
SELECT COUNT(*) as usage_count
FROM portfolios
WHERE template_id = 'template-uuid' AND deleted_at IS NULL;

-- Check version count
SELECT COUNT(*) as version_count
FROM portfolio_versions
WHERE portfolio_id = 'portfolio-uuid';

-- Verify indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('portfolios', 'portfolio_templates', 'portfolio_versions')
ORDER BY tablename, indexname;
```

---

## Next Steps

1. ✅ Run all 10 migrations in Supabase SQL Editor (001-004, 006-011)
2. ✅ Verify all 7 tables and constraints exist
3. ✅ Verify analytics partitions are created
4. ✅ Install @supabase/supabase-js
5. ✅ Configure environment variables
6. ✅ Import types and client in your code
7. ✅ Test CRUD operations
8. ✅ Test version management
9. ✅ Test custom domains, analytics, shares, and deployments
10. ✅ Monitor query performance and partition usage

For API implementation using this schema, see Section 2.1 (Core Portfolio CRUD Endpoints).

---

## Summary

This database schema provides a complete, production-ready foundation for RoleRabbit with:

- **7 tables**: portfolios, portfolio_templates, portfolio_versions, custom_domains, portfolio_analytics, portfolio_shares, portfolio_deployments
- **Table partitioning** for analytics (monthly)
- **Foreign key constraints** with proper CASCADE behavior
- **Row Level Security** for multi-tenant data isolation
- **Automatic versioning** via triggers
- **20+ database functions** for common operations
- **Comprehensive indexes** for performance
- **Full TypeScript types** matching the database schema
- **Database client helpers** for all operations

All code is production-ready with real working implementations.
