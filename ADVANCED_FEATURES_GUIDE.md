## Advanced Features Guide - RoleRabbit Templates

### Overview

This guide covers all 18 advanced features implemented for the RoleRabbit Templates system. Each feature is production-ready with comprehensive error handling, security measures, and scalability considerations.

---

## Table of Contents

1. [Premium Access Control](#1-premium-access-control)
2. [Template Approval Workflow](#2-template-approval-workflow)
3. [Template Versioning](#3-template-versioning)
4. [User Ratings System](#4-user-ratings-system)
5. [Recommendation Engine](#5-recommendation-engine)
6. [Template Sharing](#6-template-sharing)
7. [Custom Template Upload](#7-custom-template-upload)
8. [Preview Generation Service](#8-preview-generation-service)
9. [Template Export (PDF/DOCX/LaTeX)](#9-template-export)
10. [Collaboration Features](#10-collaboration-features)
11. [A/B Testing Framework](#11-ab-testing-framework)
12. [WebSockets for Real-Time Updates](#12-websockets)
13. [Template Comments](#13-template-comments)
14. [Template Categories (Advanced)](#14-advanced-categories)
15. [Bulk Operations](#15-bulk-operations)
16. [Template Search Improvements](#16-advanced-search)
17. [Template Filters (Advanced)](#17-advanced-filters)
18. [Template Sorting (Advanced)](#18-advanced-sorting)

---

## 1. Premium Access Control

**Location:** `apps/api/middleware/premiumAccessControl.js`

### Features
- Role-based access control (FREE, PREMIUM, ENTERPRISE, ADMIN)
- Feature flags for premium features
- Usage tracking and limits
- Trial period management
- Template-level access control

### Subscription Tiers

```javascript
const SUBSCRIPTION_TIERS = {
  FREE: {
    templateAccess: ['ATS', 'MINIMAL'],
    maxDownloads: 3,
    maxFavorites: 10,
    canUploadTemplates: false,
  },
  PREMIUM: {
    templateAccess: 'ALL',
    maxDownloads: 50,
    maxFavorites: 100,
    canUploadTemplates: true,
    canExportDOCX: true,
  },
  ENTERPRISE: {
    templateAccess: 'ALL',
    maxDownloads: -1, // Unlimited
    customBranding: true,
    apiAccess: true,
  },
};
```

### Usage

```javascript
const { requirePremium, requireFeature } = require('./middleware/premiumAccessControl');

// Require premium subscription
fastify.get('/api/premium-templates', {
  preHandler: requirePremium
}, handler);

// Require specific feature
fastify.post('/api/templates/upload', {
  preHandler: requireFeature('canUploadTemplates')
}, handler);
```

---

## 2. Template Approval Workflow

**Location:** `apps/api/services/templateApprovalWorkflow.js`

### Features
- Multi-stage approval process
- Automated quality checks
- Reviewer assignment
- Approval/rejection with feedback
- Appeal process

### Workflow Stages

1. **DRAFT** - Template being edited
2. **SUBMITTED** - Submitted for review
3. **IN_REVIEW** - Being reviewed
4. **CHANGES_REQUESTED** - Needs modifications
5. **APPROVED** - Approved and published
6. **REJECTED** - Rejected with reason
7. **APPEALED** - Rejection appealed

### Usage

```javascript
const { submitTemplateForApproval, reviewTemplate } = require('./services/templateApprovalWorkflow');

// Submit for approval
await submitTemplateForApproval(templateId, userId);

// Review template
await reviewTemplate(workflowId, reviewerId, decision, {
  action: 'APPROVE', // or 'REJECT', 'REQUEST_CHANGES'
  comments: 'Looks good!',
  rating: 5,
});
```

### Quality Checks

- Required fields validation
- Description length (min 50 chars)
- Prohibited content detection
- Category validity
- Image dimensions and format

---

## 3. Template Versioning

**Location:** `apps/api/services/templateVersioning.js`

### Features
- Semantic versioning (major.minor.patch)
- Diff comparison between versions
- Version rollback
- Change history tracking
- Version tagging

### Usage

```javascript
const { createVersion, rollbackToVersion } = require('./services/templateVersioning');

// Create new version
await createVersion(templateId, userId, {
  changeLog: 'Updated color scheme',
  tag: 'v2.0',
}, 'minor');

// Rollback to previous version
await rollbackToVersion(templateId, versionId, userId);

// Compare versions
await compareVersions(version1Id, version2Id);
```

### Version Types

- **Major** (1.0.0 → 2.0.0): Breaking changes
- **Minor** (1.0.0 → 1.1.0): New features
- **Patch** (1.0.0 → 1.0.1): Bug fixes

---

## 4. User Ratings System

**Location:** `apps/api/services/templateRatings.js`

### Features
- Star ratings (1-5)
- Detailed reviews with pros/cons
- Verified reviews (for downloaders)
- Helpful votes on reviews
- Review moderation
- Rating analytics

### Usage

```javascript
const { rateTemplate, markReviewHelpful } = require('./services/templateRatings');

// Submit rating
await rateTemplate(templateId, userId, {
  rating: 5,
  review: 'Excellent template!',
  title: 'Best ATS template',
  pros: ['Clean design', 'ATS-friendly'],
  cons: ['Limited customization'],
  wouldRecommend: true,
});

// Mark review as helpful
await markReviewHelpful(ratingId, userId);
```

### Rating Breakdown

```javascript
const { getRatingBreakdown } = require('./services/templateRatings');

const breakdown = await getRatingBreakdown(templateId);
// {
//   distribution: {
//     5: { count: 120, percentage: 60 },
//     4: { count: 50, percentage: 25 },
//     ...
//   }
// }
```

---

## 5. Recommendation Engine

**Location:** `apps/api/services/recommendationEngine.js`

### Features
- Collaborative filtering (user-based and item-based)
- Content-based filtering
- Hybrid recommendations
- Context-aware suggestions
- Similar templates

### Recommendation Strategies

1. **Collaborative Filtering** (35%): Based on similar users' preferences
2. **Content-Based** (30%): Based on template attributes
3. **Popularity** (15%): Trending templates
4. **Ratings** (10%): Highly-rated templates
5. **Recency** (10%): Recent additions

### Usage

```javascript
const { getRecommendations, getSimilarTemplates } = require('./services/recommendationEngine');

// Get personalized recommendations
const recommendations = await getRecommendations(userId, {
  limit: 12,
  context: {
    industry: 'Technology',
    experience: 'senior',
    urgency: 'high',
  },
});

// Get similar templates
const similar = await getSimilarTemplates(templateId, 6);
```

---

## 6. Template Sharing

**Location:** `apps/api/services/templateSharing.js`

### Features
- Share via link (public/private)
- Share with specific users
- Permission levels (VIEW, DOWNLOAD, EDIT, FULL)
- Expiring share links
- Share tracking and analytics

### Usage

```javascript
const { createShareLink, accessSharedTemplate } = require('./services/templateSharing');

// Create share link
const share = await createShareLink(templateId, userId, {
  permission: 'DOWNLOAD',
  expiresIn: 7, // days
  requireAuth: true,
  sharedWith: [user1Id, user2Id],
});

// Access shared template
const template = await accessSharedTemplate(shareToken, userId);
```

### Share Permissions

- **VIEW**: View template only
- **DOWNLOAD**: View and download
- **EDIT**: View, download, and edit
- **FULL**: All permissions

---

## 7. Custom Template Upload

**Location:** `apps/api/services/templateUpload.js`

### Features
- File validation (format, size, dimensions)
- Image processing and optimization
- Thumbnail generation (small, medium, large)
- Metadata extraction
- Upload limits per tier

### Upload Limits

```javascript
const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_WIDTH: 800,
  MIN_HEIGHT: 1132,
  MAX_WIDTH: 4000,
  MAX_HEIGHT: 6000,
  ALLOWED_FORMATS: ['PNG', 'JPG', 'JPEG', 'PDF'],
  MAX_UPLOADS_PER_DAY: 10,
};
```

### Usage

```javascript
const { uploadTemplate } = require('./services/templateUpload');

await uploadTemplate(file, userId, {
  name: 'My Custom Template',
  description: 'A professional ATS-friendly template',
  category: 'ATS',
  difficulty: 'BEGINNER',
  tags: ['professional', 'ats', 'modern'],
});
```

---

## 8. Preview Generation Service

Auto-generated previews for uploaded templates with multiple thumbnail sizes.

---

## 9. Template Export

**Location:** `apps/api/services/templateExport.js`

### Supported Formats

1. **PDF** - High-quality PDF with metadata
2. **DOCX** - Microsoft Word format
3. **LaTeX** - LaTeX source code
4. **JSON** - Template data
5. **HTML** - Styled HTML page

### Usage

```javascript
const { exportTemplate } = require('./services/templateExport');

const result = await exportTemplate(templateId, userId, 'PDF', {
  quality: 'high',
  includeMetadata: true,
});

// Returns: { filename, buffer, mimeType }
```

### Permission Requirements

- **PDF**: Basic tier
- **DOCX**: Premium tier
- **LaTeX**: Premium tier
- **JSON/HTML**: All tiers

---

## 10. Collaboration Features

Real-time collaboration through WebSocket integration (see WebSockets section).

---

## 11. A/B Testing Framework

**Location:** `apps/api/services/abTestingFramework.js`

### Features
- Multi-variant testing
- Traffic splitting
- Metrics tracking
- Statistical significance calculation
- Automatic winner selection

### Usage

```javascript
const { createTest, startTest, getTestResults } = require('./services/abTestingFramework');

// Create test
await createTest({
  name: 'Template Layout Test',
  variants: [
    { name: 'Control', config: { layout: 'single' } },
    { name: 'Variant A', config: { layout: 'two-column' } },
    { name: 'Variant B', config: { layout: 'sidebar' } },
  ],
  metrics: ['views', 'clicks', 'downloads', 'ratings'],
  duration: 14, // days
}, userId);

// Start test
await startTest(testId, userId);

// Get results
const results = await getTestResults(testId);
// Includes statistical significance and winner
```

### Tracked Metrics

- Views
- Clicks
- Downloads
- Ratings
- Click-through rate
- Conversion rate

---

## 12. WebSockets for Real-Time Updates

**Location:** `apps/api/services/websocketService.js`

### Features
- Real-time template updates
- Live comment notifications
- Rating updates
- Approval status changes
- User presence tracking
- Room-based messaging

### Client Usage

```javascript
const ws = new WebSocket('ws://localhost:8000/ws');

// Authenticate
ws.send(JSON.stringify({
  type: 'auth',
  payload: { token, userId },
}));

// Subscribe to template updates
ws.send(JSON.stringify({
  type: 'subscribe',
  payload: { templateId: 'tpl_123' },
}));

// Listen for updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'template_update':
      // Handle template update
      break;
    case 'new_comment':
      // Handle new comment
      break;
    case 'rating_update':
      // Handle rating update
      break;
  }
};
```

### Server-Side Emissions

```javascript
const { emitTemplateUpdate, emitNewComment } = require('./services/websocketService');

// Emit template update
emitTemplateUpdate(templateId, {
  field: 'rating',
  oldValue: 4.2,
  newValue: 4.5,
});

// Emit new comment
emitNewComment(templateId, comment);
```

---

## 13. Template Comments

**Location:** `apps/api/services/templateComments.js`

### Features
- Nested comments (replies)
- Rich text support
- Mentions (@user)
- Reactions/likes
- Comment moderation
- Edit history
- Pinned comments

### Usage

```javascript
const { addComment, toggleCommentLike } = require('./services/templateComments');

// Add comment
await addComment(templateId, userId, {
  content: 'Great template! @john what do you think?',
  parentId: null, // null for top-level comment
  mentions: ['john_user_id'],
});

// Reply to comment
await addComment(templateId, userId, {
  content: 'I agree!',
  parentId: commentId,
});

// Like comment
await toggleCommentLike(commentId, userId);
```

### Comment Moderation

```javascript
const { moderateComment, reportComment } = require('./services/templateComments');

// Report comment
await reportComment(commentId, userId, 'Inappropriate content');

// Moderate (admin only)
await moderateComment(commentId, true, 'Violates guidelines');
```

---

## 14. Advanced Categories

Enhanced category system with subcategories and industry-specific templates.

---

## 15. Bulk Operations

**Location:** `apps/api/services/templateBulkOperations.js`

### Supported Operations

1. **activate** - Activate templates
2. **deactivate** - Deactivate templates
3. **delete** - Delete templates (soft/hard)
4. **updateCategory** - Change category
5. **addTags** - Add tags to templates
6. **removeTags** - Remove tags from templates
7. **updateDifficulty** - Change difficulty
8. **setPremium** - Mark as premium/free
9. **approve** - Bulk approve (admin)
10. **reject** - Bulk reject (admin)
11. **export** - Bulk export

### Usage

```javascript
const { bulkOperation } = require('./services/templateBulkOperations');

// Bulk activate templates
await bulkOperation('activate', [id1, id2, id3], userId);

// Bulk add tags
await bulkOperation('addTags', templateIds, userId, {
  tags: ['professional', 'modern'],
});

// Bulk approve (admin)
await bulkOperation('approve', templateIds, adminUserId);
```

### Limits

- Maximum 100 templates per operation
- Owner verification for non-admin operations
- Operation history tracking

---

## 16. Advanced Search

**Location:** `apps/api/services/advancedTemplateSearch.js`

### Features
- Full-text search with relevance scoring
- Fuzzy matching
- Multi-field search
- Search suggestions/autocomplete
- Search history
- Trending searches
- Search analytics

### Usage

```javascript
const { advancedSearch, getSearchSuggestions } = require('./services/advancedTemplateSearch');

// Advanced search
const results = await advancedSearch('professional resume', {
  limit: 20,
  filters: {
    category: 'ATS',
    minRating: 4.0,
  },
  sortBy: 'relevance',
  fuzzy: true,
  autocomplete: true,
});

// Get suggestions
const suggestions = await getSearchSuggestions('prof');
// Returns: template names, tags, trending searches
```

### Search Scoring

- Exact name match: 100 points
- Partial name match: 50 points
- Name word matches: 10 points each
- Description match: 20 points
- Tag matches: 15 points each
- Category match: 25 points
- Popularity boost: up to 25 points

---

## 17. Advanced Filters

**Location:** `apps/api/services/advancedFiltersAndSorting.js`

### Available Filters

- Category (single/multiple)
- Difficulty (single/multiple)
- Layout (single/multiple)
- Color Scheme (single/multiple)
- Premium status
- Rating range
- Downloads range
- Industry
- Tags
- Author
- Date ranges (created/updated)
- Composite filters (featured, trending)

### Usage

```javascript
const { applyFiltersAndSort } = require('./services/advancedFiltersAndSorting');

const results = await applyFiltersAndSort({
  category: ['ATS', 'MODERN'],
  minRating: 4.0,
  maxRating: 5.0,
  isPremium: false,
  industry: ['Technology', 'Healthcare'],
  featured: true,
}, {
  sortBy: 'popular',
  sortOrder: 'desc',
}, {
  limit: 12,
  offset: 0,
});
```

### Filter Presets

```javascript
const { saveFilterPreset } = require('./services/advancedFiltersAndSorting');

// Save preset
await saveFilterPreset(userId, {
  name: 'My Favorite Filters',
  filters: { category: 'ATS', minRating: 4.5 },
  sortOptions: { sortBy: 'rating-high' },
  isPublic: false,
});
```

### Facet Counts

Returns available filter options with counts:

```javascript
facets: {
  category: [
    { value: 'ATS', count: 145 },
    { value: 'MODERN', count: 98 },
  ],
  difficulty: [
    { value: 'BEGINNER', count: 87 },
    { value: 'INTERMEDIATE', count: 156 },
  ],
}
```

---

## 18. Advanced Sorting

### Sort Options

1. **relevance** - Search relevance (search only)
2. **popular** - Most downloads + highest rating
3. **newest** - Recently created
4. **oldest** - Oldest first
5. **rating-high** - Highest rated
6. **rating-low** - Lowest rated
7. **downloads-high** - Most downloaded
8. **downloads-low** - Least downloaded
9. **name-az** - Alphabetical A-Z
10. **name-za** - Alphabetical Z-A
11. **recently-updated** - Recently modified
12. **trending** - Recent + popular

### Usage

```javascript
const results = await applyFiltersAndSort({
  // filters
}, {
  sortBy: 'trending',
  sortOrder: 'desc',
});
```

---

## API Integration Examples

### Complete Template Discovery Flow

```javascript
// 1. Get personalized recommendations
const recommendations = await getRecommendations(userId);

// 2. Search with filters
const searchResults = await advancedSearch('professional', {
  filters: {
    category: 'ATS',
    minRating: 4.0,
  },
  sortBy: 'popular',
});

// 3. Get similar templates
const similar = await getSimilarTemplates(templateId);

// 4. View template details
const template = await getTemplateByIdOptimized(templateId);

// 5. Check ratings
const ratings = await getTemplateRatings(templateId);

// 6. Add to favorites
await addFavorite(userId, templateId);

// 7. Download/Export
await exportTemplate(templateId, userId, 'PDF');
```

### Admin Workflow

```javascript
// 1. Get pending approvals
const pending = await getPendingReviews(adminId);

// 2. Review template
await reviewTemplate(workflowId, adminId, {
  action: 'APPROVE',
  comments: 'Excellent quality',
  rating: 5,
});

// 3. Bulk approve similar templates
await bulkOperation('approve', templateIds, adminId);

// 4. Monitor approval statistics
const stats = await getApprovalStatistics();
```

---

## Performance Considerations

### Caching Strategy

All services integrate with Redis caching (see PERFORMANCE_OPTIMIZATION_GUIDE.md):

- Recommendations cached for 10 minutes
- Search results cached for 5 minutes
- Rating breakdowns cached for 5 minutes
- Filter facets cached for 15 minutes

### Rate Limiting

- Upload: 10 templates per day (FREE), unlimited (PREMIUM)
- Comments: 50 per hour
- Ratings: 10 per day
- Search: 100 per minute

### Pagination

- Default limit: 12 items
- Maximum limit: 100 items
- Cursor-based pagination available for large datasets

---

## Security Measures

### Authentication & Authorization

- JWT token validation
- Role-based access control
- Feature-level permissions
- Template ownership verification

### Input Validation

- File size and format validation
- Content sanitization
- SQL injection prevention
- XSS protection

### Rate Limiting

- Per-user rate limits
- IP-based rate limiting
- Usage quota tracking

---

## Monitoring & Analytics

### Metrics Tracked

1. **Template Metrics**
   - Views, downloads, ratings
   - Share count, favorite count
   - Comment count

2. **User Metrics**
   - Upload history
   - Download history
   - Search history
   - Engagement rate

3. **System Metrics**
   - API response times
   - Cache hit rates
   - Error rates
   - WebSocket connections

### Analytics Endpoints

```javascript
// Template analytics
GET /api/templates/:id/analytics

// User analytics
GET /api/users/:id/analytics

// Search analytics
GET /api/analytics/search

// Approval analytics
GET /api/analytics/approvals
```

---

## Testing

### Unit Tests

Each service includes comprehensive unit tests:

```bash
npm test apps/api/services/templateRatings.test.js
```

### Integration Tests

Full workflow tests available:

```bash
npm test apps/api/integration/templates.test.js
```

### Load Tests

See `load-tests/templates-load-test.js` for k6 load testing scenarios.

---

## Deployment

### Environment Variables

```bash
# Premium Features
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Storage
AWS_S3_BUCKET=rolerabbit-templates
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Redis (Caching)
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379

# WebSocket
WS_PORT=8001

# Limits
MAX_UPLOAD_SIZE=10485760  # 10MB
MAX_UPLOADS_PER_DAY=10
```

### Database Migrations

```bash
# Run migrations for new tables
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## Support & Maintenance

### Monitoring

- Set up alerts for error rates >1%
- Monitor cache hit rates (target >80%)
- Track API response times (target p95 <500ms)

### Backup Strategy

- Database backups: Daily
- File storage backups: Weekly
- Redis persistence: Enabled

### Scaling Considerations

- Horizontal scaling supported via load balancer
- Redis clustering for high availability
- Database read replicas for read-heavy operations
- CDN for static assets

---

## Changelog

### Version 2.0.0 (Current)

- ✅ Premium access control
- ✅ Template approval workflow
- ✅ Template versioning
- ✅ User ratings system
- ✅ Recommendation engine
- ✅ Template sharing
- ✅ Custom template upload
- ✅ Template export (PDF/DOCX/LaTeX)
- ✅ A/B testing framework
- ✅ WebSockets for real-time updates
- ✅ Template comments
- ✅ Bulk operations
- ✅ Advanced search
- ✅ Advanced filters and sorting

---

**Last Updated:** November 14, 2025
**Maintained By:** Engineering Team
**Documentation Version:** 2.0.0
