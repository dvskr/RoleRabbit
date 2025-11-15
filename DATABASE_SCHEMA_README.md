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
portfolio_versions
```

### Key Features

- ✅ **Foreign Key Constraints** with CASCADE/RESTRICT
- ✅ **Unique Constraints** (slug per user, subdomain globally)
- ✅ **Check Constraints** (subdomain regex, char limits)
- ✅ **Indexes** on all foreign keys and frequently queried columns
- ✅ **Row Level Security (RLS)** for multi-tenant isolation
- ✅ **Automatic Versioning** via triggers
- ✅ **Soft Deletes** with deletedAt timestamps
- ✅ **Audit Trails** with createdBy/updatedBy
- ✅ **Usage Tracking** for templates

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

---

## Migrations

### Migration Order

Run migrations in this exact order in Supabase SQL Editor:

```sql
-- 1. Create portfolios table
\i 001_create_portfolios_table.sql

-- 2. Create portfolio_templates table
\i 002_create_portfolio_templates_table.sql

-- 3. Create portfolio_versions table
\i 003_create_portfolio_versions_table.sql

-- 4. Add foreign key constraints
\i 004_add_foreign_key_constraints.sql
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
import { PortfolioVisibility, PortfolioBuildStatus, TemplateCategory } from '@/database/types';

const visibility: PortfolioVisibility = PortfolioVisibility.PUBLIC;
const buildStatus: PortfolioBuildStatus = PortfolioBuildStatus.SUCCESS;
const category: TemplateCategory = TemplateCategory.MINIMAL;
```

---

## Setup Instructions

### 1. Run Migrations

In Supabase SQL Editor, run each migration file in order:

```sql
-- Copy/paste contents of each file:
-- 001_create_portfolios_table.sql
-- 002_create_portfolio_templates_table.sql
-- 003_create_portfolio_versions_table.sql
-- 004_add_foreign_key_constraints.sql
```

### 2. Verify Tables

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('portfolios', 'portfolio_templates', 'portfolio_versions');

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
  AND tc.table_name IN ('portfolios', 'portfolio_versions')
ORDER BY tc.table_name;
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

---

## Database Functions

### Automatic Functions (via triggers)

1. **`update_updated_at_column()`**
   - Automatically sets `updated_at` to NOW() on UPDATE
   - Applied to: `portfolios`, `portfolio_templates`

2. **`create_portfolio_version()`**
   - Automatically creates version when `portfolios.data` changes
   - Increments version number
   - Stores metadata (operation, isPublished, buildStatus)

3. **`update_template_usage_count()`**
   - Increments when portfolio created with template
   - Decrements when template changed or portfolio deleted
   - Handles soft deletes

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

---

## Performance & Indexes

### Query Optimization

**All foreign keys are indexed:**
- `portfolios.user_id`
- `portfolios.template_id`
- `portfolio_versions.portfolio_id`

**Common query patterns are indexed:**
- `(user_id, is_published)` - User's published portfolios
- `created_at DESC` - Recent portfolios
- `updated_at DESC` - Recently updated
- `subdomain` - Custom domain lookup
- `slug` - Portfolio by slug

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

### Unique Constraints

- `portfolios(user_id, slug)` - Unique slug per user
- `portfolios(subdomain)` WHERE subdomain IS NOT NULL AND deleted_at IS NULL - Global unique subdomain
- `portfolio_templates(name)` - Unique template names
- `portfolio_templates(slug)` - Unique template slugs
- `portfolio_versions(portfolio_id, version)` - Unique version numbers

### Check Constraints

- `portfolios.name`: 1-200 characters
- `portfolios.subdomain`: Matches regex `^[a-z0-9]([a-z0-9-]{1,61}[a-z0-9])?$`, 3-63 chars
- `portfolio_versions.version`: Must be > 0
- `portfolio_templates.usage_count`: Must be >= 0

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

1. ✅ Run all 4 migrations in Supabase SQL Editor
2. ✅ Verify tables and constraints exist
3. ✅ Install @supabase/supabase-js
4. ✅ Configure environment variables
5. ✅ Import types and client in your code
6. ✅ Test CRUD operations
7. ✅ Test version management
8. ✅ Monitor query performance

For API implementation using this schema, see Section 2.1 (Core Portfolio CRUD Endpoints).
