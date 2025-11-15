# RoleRabbit Data Model Documentation

**Version:** 1.0
**Last Updated:** January 2025

---

## Table of Contents

1. [Entity Relationship Diagram](#entity-relationship-diagram)
2. [Portfolio Data Structure](#portfolio-data-structure)
3. [Portfolio Template Structure](#portfolio-template-structure)
4. [Version Control Model](#version-control-model)
5. [Analytics Data Model](#analytics-data-model)
6. [Table Schemas](#table-schemas)

---

## Entity Relationship Diagram

```
┌─────────────────┐
│     Users       │
│─────────────────│
│ id (PK)         │
│ email           │
│ name            │
│ avatar          │
│ role            │
│ created_at      │
└────────┬────────┘
         │
         │ 1:N
         │
         ▼
┌─────────────────┐          ┌──────────────────┐
│   Portfolios    │◄─────────│ PortfolioVersion │
│─────────────────│   1:N    │──────────────────│
│ id (PK)         │          │ id (PK)          │
│ user_id (FK)    │          │ portfolio_id (FK)│
│ template_id (FK)│          │ version_number   │
│ title           │          │ data             │
│ subdomain       │          │ created_at       │
│ data (JSONB)    │          │ created_by       │
│ published       │          └──────────────────┘
│ theme (JSONB)   │
│ created_at      │
└────┬───┬────┬───┘
     │   │    │
     │   │    │ 1:N
     │   │    └──────────┐
     │   │               ▼
     │   │    ┌──────────────────┐
     │   │    │ PortfolioShares  │
     │   │    │──────────────────│
     │   │    │ id (PK)          │
     │   │    │ portfolio_id (FK)│
     │   │    │ share_token      │
     │   │    │ password_hash    │
     │   │    │ expires_at       │
     │   │    │ permissions      │
     │   │    └──────────────────┘
     │   │
     │   │ 1:N
     │   └──────────┐
     │              ▼
     │   ┌──────────────────┐
     │   │ CustomDomains    │
     │   │──────────────────│
     │   │ id (PK)          │
     │   │ portfolio_id (FK)│
     │   │ domain           │
     │   │ verified         │
     │   │ ssl_status       │
     │   │ dns_records      │
     │   └──────────────────┘
     │
     │ 1:N
     └──────────┐
                ▼
     ┌──────────────────┐
     │PortfolioAnalytics│
     │──────────────────│
     │ id (PK)          │
     │ portfolio_id (FK)│
     │ event_type       │
     │ ip_hash          │
     │ user_agent_hash  │
     │ country          │
     │ referrer         │
     │ metadata (JSONB) │
     │ created_at       │
     └──────────────────┘

┌──────────────────┐
│PortfolioTemplates│
│──────────────────│
│ id (PK)          │
│ name             │
│ category         │
│ preview_url      │
│ config (JSONB)   │
│ sections (JSONB) │
│ created_at       │
└──────────────────┘
         │
         │ 1:N
         └────────────► Portfolios
```

---

## Portfolio Data Structure

The `portfolios.data` column is a JSONB field containing the complete portfolio content.

### Schema

```typescript
interface PortfolioData {
  // Hero Section
  hero: {
    headline: string;              // "Full Stack Developer"
    subheadline?: string;          // "Building exceptional web experiences"
    tagline?: string;              // "Passionate about clean code and UX"
    cta?: {
      text: string;                // "View My Work"
      link: string;                // "#projects"
    };
    backgroundImage?: string;      // URL or gradient
    showSocialLinks: boolean;      // Show social icons in hero
  };

  // About Section
  about: {
    title: string;                 // "About Me"
    bio: string;                   // Main biography text (markdown supported)
    image?: string;                // Profile photo URL
    highlights?: string[];         // Key achievements
    skills?: string[];             // Top skills to highlight
    resumeUrl?: string;            // Link to resume PDF
  };

  // Experience Section
  experience: Array<{
    id: string;
    company: string;               // "Google"
    position: string;              // "Senior Software Engineer"
    location?: string;             // "Mountain View, CA"
    startDate: string;             // "2020-01"
    endDate?: string;              // "2023-12" or null for current
    current: boolean;              // Currently working here
    description: string;           // Role description (markdown)
    achievements?: string[];       // Bullet points
    technologies?: string[];       // Tech stack used
    companyLogo?: string;          // Company logo URL
    companyUrl?: string;           // Company website
  }>;

  // Projects Section
  projects: Array<{
    id: string;
    title: string;                 // "E-Commerce Platform"
    description: string;           // Project description
    longDescription?: string;      // Detailed description (markdown)
    image?: string;                // Project screenshot/logo
    images?: string[];             // Gallery of images
    tags: string[];                // ["React", "Node.js", "PostgreSQL"]
    demoUrl?: string;              // Live demo URL
    githubUrl?: string;            // GitHub repository
    highlights?: string[];         // Key features/achievements
    startDate?: string;            // Project start date
    endDate?: string;              // Project end date
    featured: boolean;             // Show in featured projects
    category?: string;             // "Web App", "Mobile", "Open Source"
  }>;

  // Skills Section
  skills: {
    categories: Array<{
      name: string;                // "Frontend Development"
      skills: Array<{
        name: string;              // "React"
        level?: number;            // 1-5 proficiency level
        yearsOfExperience?: number;
        icon?: string;             // Skill icon URL
      }>;
    }>;
    showLevels: boolean;           // Display proficiency levels
  };

  // Education Section
  education?: Array<{
    id: string;
    institution: string;           // "MIT"
    degree: string;                // "B.S. Computer Science"
    field?: string;                // "Software Engineering"
    startDate: string;
    endDate?: string;
    current: boolean;
    gpa?: string;                  // "3.9/4.0"
    honors?: string[];             // Dean's List, Summa Cum Laude
    courses?: string[];            // Relevant coursework
    logo?: string;                 // Institution logo
  }>;

  // Certifications Section
  certifications?: Array<{
    id: string;
    name: string;                  // "AWS Certified Solutions Architect"
    issuer: string;                // "Amazon Web Services"
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
    credentialUrl?: string;        // Verification link
    logo?: string;
  }>;

  // Contact Section
  contact: {
    title: string;                 // "Get In Touch"
    message?: string;              // Custom message
    email: string;
    phone?: string;
    location?: string;             // "San Francisco, CA"
    socialLinks: {
      linkedin?: string;
      github?: string;
      twitter?: string;
      instagram?: string;
      facebook?: string;
      youtube?: string;
      website?: string;
      custom?: Array<{
        name: string;
        url: string;
        icon?: string;
      }>;
    };
    showContactForm: boolean;      // Display contact form
    availability?: {
      status: 'available' | 'busy' | 'unavailable';
      message?: string;            // "Open to opportunities"
    };
  };

  // Testimonials Section (optional)
  testimonials?: Array<{
    id: string;
    name: string;
    position: string;              // "CTO at Startup Inc"
    company?: string;
    testimonial: string;           // Quote text
    image?: string;                // Headshot
    rating?: number;               // 1-5 stars
    date?: string;
  }>;

  // Blog/Articles Section (optional)
  articles?: Array<{
    id: string;
    title: string;
    excerpt: string;
    url: string;
    publishedDate: string;
    readTime?: string;             // "5 min read"
    tags?: string[];
    image?: string;
  }>;

  // Custom Sections
  customSections?: Array<{
    id: string;
    type: string;                  // "text", "image", "video", "code"
    title: string;
    content: any;                  // Flexible content based on type
    order: number;
  }>;

  // Metadata
  metadata?: {
    seoTitle?: string;
    seoDescription?: string;
    ogImage?: string;              // Open Graph image
    twitterCard?: 'summary' | 'summary_large_image';
    keywords?: string[];
    author?: string;
  };
}
```

### Example Data

```json
{
  "hero": {
    "headline": "John Doe",
    "subheadline": "Full Stack Developer & UI/UX Enthusiast",
    "tagline": "Building beautiful, performant web applications",
    "cta": {
      "text": "View My Work",
      "link": "#projects"
    },
    "showSocialLinks": true
  },
  "about": {
    "title": "About Me",
    "bio": "I'm a passionate full stack developer with 5+ years of experience...",
    "image": "https://cdn.rolerabbit.com/users/johndoe/avatar.jpg",
    "highlights": [
      "Led development of 3 successful SaaS products",
      "Mentored 10+ junior developers",
      "Contributed to 50+ open source projects"
    ],
    "resumeUrl": "https://johndoe.com/resume.pdf"
  },
  "experience": [
    {
      "id": "exp1",
      "company": "Tech Startup Inc",
      "position": "Senior Full Stack Developer",
      "location": "San Francisco, CA",
      "startDate": "2020-03",
      "endDate": null,
      "current": true,
      "description": "Leading development of core platform features...",
      "achievements": [
        "Reduced API response time by 60%",
        "Implemented CI/CD pipeline reducing deployment time by 80%"
      ],
      "technologies": ["React", "Node.js", "PostgreSQL", "AWS"]
    }
  ],
  "projects": [
    {
      "id": "proj1",
      "title": "E-Commerce Platform",
      "description": "Full-featured e-commerce solution",
      "image": "https://cdn.rolerabbit.com/projects/ecommerce.jpg",
      "tags": ["React", "Node.js", "Stripe", "MongoDB"],
      "demoUrl": "https://demo.example.com",
      "githubUrl": "https://github.com/johndoe/ecommerce",
      "featured": true
    }
  ],
  "skills": {
    "categories": [
      {
        "name": "Frontend",
        "skills": [
          { "name": "React", "level": 5, "yearsOfExperience": 5 },
          { "name": "TypeScript", "level": 5, "yearsOfExperience": 4 },
          { "name": "Next.js", "level": 4, "yearsOfExperience": 3 }
        ]
      }
    ],
    "showLevels": true
  },
  "contact": {
    "title": "Get In Touch",
    "message": "I'm always open to new opportunities and collaborations!",
    "email": "john.doe@example.com",
    "phone": "+1 (555) 123-4567",
    "location": "San Francisco, CA",
    "socialLinks": {
      "linkedin": "https://linkedin.com/in/johndoe",
      "github": "https://github.com/johndoe",
      "twitter": "https://twitter.com/johndoe"
    },
    "showContactForm": true,
    "availability": {
      "status": "available",
      "message": "Open to full-time opportunities"
    }
  }
}
```

---

## Portfolio Template Structure

The `portfolio_templates.config` column defines how templates work.

### Schema

```typescript
interface PortfolioTemplate {
  id: string;
  name: string;                    // "Modern Developer"
  description: string;
  category: 'developer' | 'designer' | 'business' | 'creative';
  previewUrl: string;              // Template preview image

  // Template Configuration
  config: {
    // Theme
    theme: {
      primaryColor: string;        // "#3b82f6"
      secondaryColor: string;      // "#8b5cf6"
      accentColor: string;         // "#f59e0b"
      backgroundColor: string;     // "#ffffff"
      textColor: string;           // "#1f2937"
      fontFamily: string;          // "Inter, sans-serif"
      headingFont?: string;        // "Poppins, sans-serif"
      borderRadius: string;        // "8px"
      spacing: 'compact' | 'normal' | 'relaxed';
    };

    // Layout
    layout: {
      type: 'single-page' | 'multi-page';
      navigation: 'top' | 'side' | 'sticky' | 'none';
      maxWidth: string;            // "1200px"
      sections: {
        hero: {
          enabled: boolean;
          layout: 'centered' | 'split' | 'fullscreen';
          backgroundType: 'solid' | 'gradient' | 'image';
        };
        about: {
          enabled: boolean;
          layout: 'text' | 'split' | 'cards';
        };
        experience: {
          enabled: boolean;
          layout: 'timeline' | 'cards' | 'list';
          sortBy: 'startDate' | 'endDate';
          sortOrder: 'desc' | 'asc';
        };
        projects: {
          enabled: boolean;
          layout: 'grid' | 'masonry' | 'carousel';
          columns: number;
          showFilters: boolean;
        };
        skills: {
          enabled: boolean;
          layout: 'bars' | 'badges' | 'circles' | 'list';
          showLevels: boolean;
        };
        education: {
          enabled: boolean;
          layout: 'timeline' | 'cards';
        };
        contact: {
          enabled: boolean;
          layout: 'centered' | 'split';
          showForm: boolean;
        };
      };
    };

    // Placeholders
    placeholders: {
      hero: {
        headline: string;          // "{{fullName}}"
        subheadline: string;       // "{{jobTitle}}"
        tagline: string;           // "{{personalStatement}}"
      };
      about: {
        bio: string;               // "{{bio}}"
        highlights: string[];      // ["{{achievement1}}", ...]
      };
      experience: {
        defaultCount: number;      // 3
        template: string;          // "{{company}} - {{position}}"
      };
      projects: {
        defaultCount: number;      // 6
        featuredCount: number;     // 3
      };
    };

    // Features
    features: {
      darkMode: boolean;
      animations: boolean;
      particleEffects: boolean;
      smoothScroll: boolean;
      backToTop: boolean;
      analytics: boolean;
      seo: boolean;
    };

    // Customization Options
    customization: {
      allowColorChange: boolean;
      allowFontChange: boolean;
      allowLayoutChange: boolean;
      allowSectionReorder: boolean;
    };
  };

  // Section Templates
  sections: Array<{
    id: string;
    type: string;                  // "hero", "about", "experience", etc.
    order: number;
    defaultContent: any;           // Default content for this section
    required: boolean;             // Can user remove this section?
    customizable: boolean;         // Can user customize this section?
  }>;

  // Assets
  assets?: {
    css?: string;                  // Custom CSS URL
    js?: string;                   // Custom JS URL
    fonts?: string[];              // Font URLs
    images?: {
      background?: string;
      placeholder?: string;
    };
  };

  // Metadata
  isPremium: boolean;
  isPublic: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
```

### How Placeholders Work

1. **Template Definition**:
   ```json
   {
     "placeholders": {
       "hero": {
         "headline": "{{fullName}}",
         "subheadline": "{{jobTitle}}"
       }
     }
   }
   ```

2. **User Data**:
   ```json
   {
     "fullName": "John Doe",
     "jobTitle": "Full Stack Developer"
   }
   ```

3. **Rendered Output**:
   ```json
   {
     "hero": {
       "headline": "John Doe",
       "subheadline": "Full Stack Developer"
     }
   }
   ```

### Placeholder Replacement Process

```typescript
function replacePlaceholders(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match; // Keep placeholder if no data
  });
}

// Example usage
const template = {
  hero: {
    headline: "{{fullName}}",
    subheadline: "{{jobTitle}} at {{company}}"
  }
};

const userData = {
  fullName: "Jane Smith",
  jobTitle: "Senior Developer",
  company: "Tech Corp"
};

const result = {
  hero: {
    headline: replacePlaceholders(template.hero.headline, userData),
    subheadline: replacePlaceholders(template.hero.subheadline, userData)
  }
};

// Result:
// {
//   hero: {
//     headline: "Jane Smith",
//     subheadline: "Senior Developer at Tech Corp"
//   }
// }
```

---

## Version Control Model

The `portfolio_versions` table stores snapshots of portfolio state.

### Schema

```sql
CREATE TABLE portfolio_versions (
  id UUID PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  data JSONB NOT NULL,               -- Complete portfolio data snapshot
  theme JSONB,                       -- Theme settings at this version
  created_at TIMESTAMP NOT NULL,
  created_by UUID REFERENCES users(id),
  change_summary TEXT,               -- What changed in this version
  is_published BOOLEAN DEFAULT FALSE,-- Was this version published?

  UNIQUE(portfolio_id, version_number)
);
```

### Version Creation

**When versions are created:**

1. **Manual Save**: User clicks "Save Version"
2. **Before Publish**: Automatically before publishing
3. **Major Edit**: After significant changes (configurable threshold)
4. **Time-Based**: Auto-save every N minutes (optional)

**Version Creation Flow**:

```typescript
async function createVersion(
  portfolioId: string,
  userId: string,
  changeSummary?: string
): Promise<PortfolioVersion> {
  // Get current portfolio state
  const portfolio = await getPortfolio(portfolioId);

  // Get current version number
  const latestVersion = await getLatestVersion(portfolioId);
  const newVersionNumber = (latestVersion?.version_number || 0) + 1;

  // Create version snapshot
  const version = await db.portfolio_versions.create({
    portfolio_id: portfolioId,
    version_number: newVersionNumber,
    data: portfolio.data,           // Complete data snapshot
    theme: portfolio.theme,         // Theme snapshot
    created_by: userId,
    change_summary: changeSummary || 'Manual save',
    is_published: portfolio.published,
    created_at: new Date()
  });

  // Cleanup old versions (keep last 30)
  await cleanupOldVersions(portfolioId, 30);

  return version;
}
```

### Version Restoration

**Restore to Previous Version**:

```typescript
async function restoreVersion(
  portfolioId: string,
  versionId: string,
  userId: string
): Promise<Portfolio> {
  // Get version to restore
  const version = await db.portfolio_versions.findOne({
    id: versionId,
    portfolio_id: portfolioId
  });

  if (!version) {
    throw new Error('Version not found');
  }

  // Create backup of current state (before restore)
  await createVersion(portfolioId, userId, 'Before restore');

  // Restore data from version
  const portfolio = await db.portfolios.update(
    { id: portfolioId },
    {
      data: version.data,
      theme: version.theme,
      updated_at: new Date()
    }
  );

  // Create version entry for restoration
  await createVersion(
    portfolioId,
    userId,
    `Restored to version ${version.version_number}`
  );

  return portfolio;
}
```

### Version Comparison

**Compare Two Versions**:

```typescript
interface VersionDiff {
  added: string[];      // Paths to added fields
  removed: string[];    // Paths to removed fields
  changed: Array<{
    path: string;
    old: any;
    new: any;
  }>;
}

function compareVersions(
  version1: PortfolioVersion,
  version2: PortfolioVersion
): VersionDiff {
  return {
    added: findAddedPaths(version1.data, version2.data),
    removed: findRemovedPaths(version1.data, version2.data),
    changed: findChangedPaths(version1.data, version2.data)
  };
}
```

### Version Retention Policy

- **Recent versions** (last 7 days): Keep all
- **Weekly versions** (last 3 months): Keep 1 per week
- **Monthly versions** (last year): Keep 1 per month
- **Yearly versions**: Keep 1 per year
- **Published versions**: Always keep

```typescript
async function cleanupOldVersions(
  portfolioId: string,
  maxVersions: number
): Promise<void> {
  // Get all versions
  const versions = await db.portfolio_versions.find({
    portfolio_id: portfolioId
  }).sort({ version_number: 'desc' });

  // Keep recent versions
  const recentVersions = versions.slice(0, maxVersions);

  // Keep published versions
  const publishedVersions = versions.filter(v => v.is_published);

  // Versions to keep
  const keepVersions = new Set([
    ...recentVersions.map(v => v.id),
    ...publishedVersions.map(v => v.id)
  ]);

  // Delete old versions
  const toDelete = versions.filter(v => !keepVersions.has(v.id));

  await db.portfolio_versions.deleteMany({
    id: { $in: toDelete.map(v => v.id) }
  });
}
```

---

## Analytics Data Model

The `portfolio_analytics` table stores anonymized tracking data.

### Schema

```sql
CREATE TABLE portfolio_analytics (
  id UUID PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Event Information
  event_type VARCHAR(50) NOT NULL,  -- 'view', 'share', 'export', 'click'

  -- Anonymized User Data
  ip_hash VARCHAR(64) NOT NULL,     -- SHA-256 hash of IP
  user_agent_hash VARCHAR(64),      -- SHA-256 hash of user agent

  -- Geo/Device Data
  country VARCHAR(2),                -- ISO country code (from IP before hashing)
  city VARCHAR(100),                 -- City (optional)
  device_type VARCHAR(20),           -- 'desktop', 'mobile', 'tablet'
  browser VARCHAR(50),               -- 'Chrome', 'Firefox', 'Safari'
  os VARCHAR(50),                    -- 'Windows', 'macOS', 'Linux', 'iOS', 'Android'

  -- Referrer Data
  referrer_domain VARCHAR(255),     -- Domain only (no full URL for privacy)
  referrer_type VARCHAR(50),        -- 'direct', 'search', 'social', 'referral'

  -- Additional Metadata
  metadata JSONB,                    -- Flexible additional data

  -- Timestamp
  created_at TIMESTAMP NOT NULL,

  -- Indexes for common queries
  INDEX idx_portfolio_analytics_portfolio_id (portfolio_id),
  INDEX idx_portfolio_analytics_event_type (event_type),
  INDEX idx_portfolio_analytics_created_at (created_at),
  INDEX idx_portfolio_analytics_country (country)
);
```

### Tracked Metrics

**Event Types**:

1. **`view`** - Portfolio page view
2. **`share`** - Portfolio shared
3. **`export`** - Portfolio exported (PDF/HTML)
4. **`click`** - Link clicked (project, social, etc.)
5. **`contact`** - Contact form submitted
6. **`download`** - Resume/file downloaded

### Metadata JSONB Structure

```typescript
interface AnalyticsMetadata {
  // For 'view' events
  pageUrl?: string;              // Page path (not full URL)
  sessionId?: string;            // Hashed session ID
  duration?: number;             // Time spent (seconds)
  scrollDepth?: number;          // Percentage scrolled

  // For 'click' events
  clickTarget?: string;          // Element clicked
  clickUrl?: string;             // URL clicked
  clickType?: 'project' | 'social' | 'contact' | 'resume';

  // For 'share' events
  shareMethod?: 'link' | 'email' | 'social';
  sharePlatform?: 'twitter' | 'linkedin' | 'facebook';

  // For 'export' events
  exportFormat?: 'pdf' | 'html' | 'json';

  // Device details
  screenResolution?: string;     // "1920x1080"
  viewport?: string;             // "1440x900"

  // UTM parameters (for marketing)
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}
```

### Example Analytics Records

```json
[
  {
    "id": "uuid-1",
    "portfolio_id": "portfolio-123",
    "event_type": "view",
    "ip_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "user_agent_hash": "5f2b...8d9a",
    "country": "US",
    "city": "San Francisco",
    "device_type": "desktop",
    "browser": "Chrome",
    "os": "macOS",
    "referrer_domain": "google.com",
    "referrer_type": "search",
    "metadata": {
      "sessionId": "hashed-session-id",
      "duration": 45,
      "scrollDepth": 85
    },
    "created_at": "2025-01-15T10:30:00Z"
  },
  {
    "id": "uuid-2",
    "portfolio_id": "portfolio-123",
    "event_type": "click",
    "ip_hash": "e3b0...",
    "country": "US",
    "device_type": "mobile",
    "browser": "Safari",
    "os": "iOS",
    "metadata": {
      "clickTarget": "project-card",
      "clickUrl": "https://demo.example.com",
      "clickType": "project"
    },
    "created_at": "2025-01-15T10:32:00Z"
  }
]
```

### Aggregated Analytics Queries

**Daily Stats**:

```sql
SELECT
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) AS total_events,
  COUNT(DISTINCT ip_hash) AS unique_visitors,
  COUNT(*) FILTER (WHERE event_type = 'view') AS views,
  COUNT(*) FILTER (WHERE event_type = 'click') AS clicks
FROM portfolio_analytics
WHERE portfolio_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

**Top Countries**:

```sql
SELECT
  country,
  COUNT(*) AS visits,
  COUNT(DISTINCT ip_hash) AS unique_visitors,
  ROUND(COUNT(*)::NUMERIC / SUM(COUNT(*)) OVER () * 100, 2) AS percentage
FROM portfolio_analytics
WHERE portfolio_id = $1
  AND country IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY country
ORDER BY visits DESC
LIMIT 10;
```

**Top Referrers**:

```sql
SELECT
  referrer_domain,
  referrer_type,
  COUNT(*) AS visits
FROM portfolio_analytics
WHERE portfolio_id = $1
  AND referrer_domain IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY referrer_domain, referrer_type
ORDER BY visits DESC
LIMIT 10;
```

**Device Breakdown**:

```sql
SELECT
  device_type,
  browser,
  os,
  COUNT(*) AS visits,
  ROUND(AVG((metadata->>'duration')::INTEGER), 2) AS avg_duration
FROM portfolio_analytics
WHERE portfolio_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY device_type, browser, os
ORDER BY visits DESC;
```

### Privacy Compliance

**IP Anonymization**:
```typescript
import crypto from 'crypto';

function anonymizeIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + SALT).digest('hex');
}
```

**Data Retention**:
- Raw events: 12 months
- Aggregated data: 36 months
- User can request deletion anytime (GDPR)

**Opt-Out**:
```typescript
// Check if user has opted out of analytics
if (await hasOptedOutOfAnalytics(userId)) {
  return; // Don't track
}
```

---

## Table Schemas

### Portfolios Table

```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES portfolio_templates(id) ON DELETE SET NULL,

  -- Basic Info
  title VARCHAR(200) NOT NULL,
  subtitle VARCHAR(500),
  description TEXT,

  -- Domain Settings
  subdomain VARCHAR(63) UNIQUE,                -- user.rolerabbit.com
  custom_domain VARCHAR(255) UNIQUE,           -- www.example.com

  -- Content
  data JSONB NOT NULL DEFAULT '{}',            -- Portfolio content
  theme JSONB,                                 -- Theme customization

  -- Publishing
  published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMP,
  visibility VARCHAR(20) DEFAULT 'public',     -- 'public', 'unlisted', 'private'
  password_hash TEXT,                          -- For private portfolios

  -- Moderation
  moderation_status VARCHAR(50) DEFAULT 'pending',
  moderation_notes TEXT,

  -- SEO
  seo_title VARCHAR(200),
  seo_description TEXT,
  og_image VARCHAR(500),

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP,                        -- Soft delete

  -- Constraints
  CHECK (subdomain ~ '^[a-z][a-z0-9-]{1,61}[a-z0-9]$'),
  CHECK (visibility IN ('public', 'unlisted', 'private'))
);

-- Indexes
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_subdomain ON portfolios(subdomain);
CREATE INDEX idx_portfolios_published ON portfolios(published);
CREATE INDEX idx_portfolios_created_at ON portfolios(created_at DESC);
```

### Portfolio Templates Table

```sql
CREATE TABLE portfolio_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,              -- 'developer', 'designer', etc.
  preview_url VARCHAR(500),
  thumbnail_url VARCHAR(500),

  -- Configuration
  config JSONB NOT NULL DEFAULT '{}',         -- Template configuration
  sections JSONB NOT NULL DEFAULT '[]',       -- Section definitions

  -- Features
  is_premium BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  price DECIMAL(10, 2) DEFAULT 0,

  -- Usage Stats
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3, 2),

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CHECK (category IN ('developer', 'designer', 'business', 'creative', 'other'))
);

-- Indexes
CREATE INDEX idx_templates_category ON portfolio_templates(category);
CREATE INDEX idx_templates_is_public ON portfolio_templates(is_public);
CREATE INDEX idx_templates_is_premium ON portfolio_templates(is_premium);
```

### Portfolio Versions Table

```sql
CREATE TABLE portfolio_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Version Info
  version_number INTEGER NOT NULL,

  -- Snapshot Data
  data JSONB NOT NULL,                        -- Complete data snapshot
  theme JSONB,                                -- Theme snapshot

  -- Metadata
  change_summary TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  UNIQUE(portfolio_id, version_number)
);

-- Indexes
CREATE INDEX idx_versions_portfolio_id ON portfolio_versions(portfolio_id);
CREATE INDEX idx_versions_created_at ON portfolio_versions(created_at DESC);
CREATE INDEX idx_versions_is_published ON portfolio_versions(is_published);
```

### Custom Domains Table

```sql
CREATE TABLE custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Domain Info
  domain VARCHAR(255) NOT NULL UNIQUE,

  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(100),
  verified_at TIMESTAMP,

  -- SSL/TLS
  ssl_status VARCHAR(50) DEFAULT 'pending',   -- 'pending', 'active', 'failed'
  ssl_issued_at TIMESTAMP,
  ssl_expires_at TIMESTAMP,

  -- DNS Configuration
  dns_records JSONB,                          -- Required DNS records

  -- Status
  status VARCHAR(50) DEFAULT 'pending',       -- 'pending', 'active', 'failed'
  error_message TEXT,

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CHECK (status IN ('pending', 'active', 'failed', 'expired')),
  CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired'))
);

-- Indexes
CREATE INDEX idx_custom_domains_portfolio_id ON custom_domains(portfolio_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX idx_custom_domains_verified ON custom_domains(verified);
```

### Portfolio Shares Table

```sql
CREATE TABLE portfolio_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Share Token
  share_token VARCHAR(100) NOT NULL UNIQUE,

  -- Access Control
  password_hash TEXT,                         -- Optional password protection
  permissions JSONB DEFAULT '{"view": true}', -- Access permissions

  -- Expiration
  expires_at TIMESTAMP,
  max_views INTEGER,                          -- Limit number of views
  view_count INTEGER DEFAULT 0,

  -- Tracking
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_accessed_at TIMESTAMP,

  -- Status
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes
CREATE INDEX idx_shares_portfolio_id ON portfolio_shares(portfolio_id);
CREATE INDEX idx_shares_token ON portfolio_shares(share_token);
CREATE INDEX idx_shares_is_active ON portfolio_shares(is_active);
```

### Portfolio Analytics Table

```sql
CREATE TABLE portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,

  -- Event
  event_type VARCHAR(50) NOT NULL,

  -- Anonymized User Data
  ip_hash VARCHAR(64) NOT NULL,
  user_agent_hash VARCHAR(64),

  -- Geo/Device
  country VARCHAR(2),
  city VARCHAR(100),
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),

  -- Referrer
  referrer_domain VARCHAR(255),
  referrer_type VARCHAR(50),

  -- Metadata
  metadata JSONB,

  -- Timestamp
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  -- Constraints
  CHECK (event_type IN ('view', 'share', 'export', 'click', 'contact', 'download')),
  CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  CHECK (referrer_type IN ('direct', 'search', 'social', 'referral', 'email', 'unknown'))
);

-- Indexes
CREATE INDEX idx_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX idx_analytics_event_type ON portfolio_analytics(event_type);
CREATE INDEX idx_analytics_created_at ON portfolio_analytics(created_at DESC);
CREATE INDEX idx_analytics_country ON portfolio_analytics(country);
CREATE INDEX idx_analytics_device_type ON portfolio_analytics(device_type);

-- Composite indexes for common queries
CREATE INDEX idx_analytics_portfolio_date ON portfolio_analytics(portfolio_id, created_at DESC);
CREATE INDEX idx_analytics_portfolio_event ON portfolio_analytics(portfolio_id, event_type);
```

---

## Relationships Summary

1. **Users ↔ Portfolios**: One-to-Many
   - One user can have multiple portfolios
   - Each portfolio belongs to one user

2. **Portfolios ↔ Templates**: Many-to-One
   - Many portfolios can use the same template
   - Each portfolio based on one template (optional)

3. **Portfolios ↔ Versions**: One-to-Many
   - One portfolio can have many versions
   - Each version belongs to one portfolio

4. **Portfolios ↔ Custom Domains**: One-to-One
   - One portfolio can have one custom domain
   - Each domain belongs to one portfolio

5. **Portfolios ↔ Shares**: One-to-Many
   - One portfolio can have multiple share links
   - Each share link belongs to one portfolio

6. **Portfolios ↔ Analytics**: One-to-Many
   - One portfolio can have many analytics events
   - Each event belongs to one portfolio

---

## Data Access Patterns

### Common Queries

**Get Portfolio with All Related Data**:
```sql
SELECT
  p.*,
  t.name AS template_name,
  t.config AS template_config,
  (SELECT COUNT(*) FROM portfolio_versions WHERE portfolio_id = p.id) AS version_count,
  (SELECT COUNT(*) FROM portfolio_analytics WHERE portfolio_id = p.id) AS total_views,
  cd.domain AS custom_domain,
  cd.verified AS domain_verified
FROM portfolios p
LEFT JOIN portfolio_templates t ON p.template_id = t.id
LEFT JOIN custom_domains cd ON p.id = cd.portfolio_id
WHERE p.id = $1;
```

**Get User's Portfolios with Stats**:
```sql
SELECT
  p.*,
  COUNT(DISTINCT pv.id) AS version_count,
  COUNT(DISTINCT CASE WHEN pa.created_at >= NOW() - INTERVAL '30 days' THEN pa.id END) AS views_last_30_days,
  COUNT(DISTINCT CASE WHEN pa.event_type = 'click' THEN pa.id END) AS total_clicks
FROM portfolios p
LEFT JOIN portfolio_versions pv ON p.id = pv.portfolio_id
LEFT JOIN portfolio_analytics pa ON p.id = pa.portfolio_id
WHERE p.user_id = $1
  AND p.deleted_at IS NULL
GROUP BY p.id
ORDER BY p.updated_at DESC;
```

**Get Analytics Summary**:
```sql
SELECT
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) FILTER (WHERE event_type = 'view') AS views,
  COUNT(DISTINCT ip_hash) AS unique_visitors,
  COUNT(*) FILTER (WHERE event_type = 'click') AS clicks,
  COUNT(*) FILTER (WHERE event_type = 'contact') AS contacts
FROM portfolio_analytics
WHERE portfolio_id = $1
  AND created_at >= $2
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

---

**Last Updated:** January 15, 2025
**Version:** 1.0
