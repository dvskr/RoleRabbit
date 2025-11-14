# Templates Feature - Quick Reference Card

## 🚀 Quick Commands

### Development
```bash
# Start all services
npm run dev:all

# Start API only
npm run dev:api

# Start web only
npm run dev:web
```

### Testing
```bash
# Run all tests
npm test

# Backend tests
npm run test:api

# Frontend tests
npm run test:web

# Template tests only
npm run test:templates

# Watch mode
npm run test:watch:api
npm run test:watch:web

# Coverage reports
npm run test:coverage:api
npm run test:coverage:web
```

### Database
```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed templates
node prisma/seed-templates.js

# Open Prisma Studio
npx prisma studio
```

---

## 📁 Key Files

| File | Purpose | Lines |
|------|---------|-------|
| `apps/api/services/templateService.js` | CRUD operations | 544 |
| `apps/api/services/templateFavoritesService.js` | Favorites | 405 |
| `apps/api/services/templatePreferencesService.js` | Preferences | 343 |
| `apps/api/services/templateAnalyticsService.js` | Analytics | 463 |
| `apps/api/routes/templates.routes.js` | 22 API endpoints | 727 |
| `apps/web/src/hooks/useTemplates.ts` | Templates hook | 239 |
| `apps/web/src/hooks/useTemplateFavorites.ts` | Favorites hook | 175 |
| `apps/web/src/hooks/useTemplatePreferences.ts` | Preferences hook | 221 |

---

## 🔌 API Endpoints Cheat Sheet

### Public
```
GET    /api/templates              # List with filters
GET    /api/templates/search       # Search
GET    /api/templates/:id          # Get one
GET    /api/templates/analytics/popular   # Popular
GET    /api/templates/analytics/trending  # Trending
```

### Authenticated
```
POST   /api/templates/:id/favorite        # Add favorite
DELETE /api/templates/:id/favorite        # Remove favorite
GET    /api/templates/favorites/list      # List favorites
POST   /api/templates/:id/track           # Track usage
GET    /api/templates/preferences         # Get prefs
PUT    /api/templates/preferences         # Save prefs
```

### Admin
```
POST   /api/templates              # Create
PUT    /api/templates/:id          # Update
DELETE /api/templates/:id          # Delete
```

---

## 💻 Code Snippets

### Fetch Templates
```javascript
// With filters
const response = await apiService.getTemplates({
  category: 'ATS',
  difficulty: 'BEGINNER',
  sortBy: 'popular',
  page: 1,
  limit: 12
});
```

### Use Templates Hook
```typescript
const {
  templates,
  loading,
  updateFilters,
  nextPage
} = useTemplates({ autoFetch: true });
```

### Toggle Favorite
```typescript
const { toggleFavorite, isFavorite } = useTemplateFavorites();

await toggleFavorite('template_id');
const favorited = isFavorite('template_id');
```

### Track Usage
```javascript
await apiService.trackTemplateUsage('template_id', 'PREVIEW', {
  source: 'search',
  query: 'professional'
});
```

---

## 🗄️ Database Models

### ResumeTemplate
```
id, name, category, description, preview, features[],
difficulty, industry[], layout, colorScheme, isPremium,
rating, downloads, author, tags[], isActive, timestamps
```

### UserTemplateFavorite
```
id, userId, templateId, createdAt
Unique: [userId, templateId]
```

### UserTemplatePreferences
```
id, userId (unique), filterSettings (JSON),
sortPreference, viewMode, timestamps
```

### TemplateUsageHistory
```
id, userId, templateId, action, metadata (JSON), createdAt
Actions: PREVIEW, DOWNLOAD, USE, FAVORITE, SHARE
```

---

## 🧪 Test Commands

```bash
# Specific test file
npm test -- templateService.test.js

# Pattern matching
npm test -- --testNamePattern="should fetch"

# Update snapshots
npm test -- -u

# Verbose output
npm test -- --verbose

# Debug mode
node --inspect-brk node_modules/.bin/jest --runInBand
```

---

## 📊 Filters & Sorting

### Filter Options
```typescript
category: 'ATS' | 'CREATIVE' | 'MODERN' | 'CLASSIC' | ...
difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
layout: 'SINGLE_COLUMN' | 'TWO_COLUMN' | 'THREE_COLUMN'
colorScheme: 'BLUE' | 'GREEN' | 'RED' | 'PROFESSIONAL' | ...
isPremium: boolean
minRating: number (0-5)
maxRating: number (0-5)
industry: string[]
```

### Sort Options
```typescript
sortBy: 'popular' | 'newest' | 'rating' | 'downloads' | 'name'
sortOrder: 'asc' | 'desc'
```

---

## 🎯 Usage Actions

```typescript
enum TemplateUsageAction {
  PREVIEW  = 'PREVIEW',   // User views preview
  DOWNLOAD = 'DOWNLOAD',  // User downloads
  USE      = 'USE',       // User applies to editor
  FAVORITE = 'FAVORITE',  // User favorites
  SHARE    = 'SHARE'      // User shares
}
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| `TEMPLATES_FEATURE_README.md` | Main README |
| `TEMPLATES_IMPLEMENTATION_SUMMARY.md` | Technical details |
| `DEPLOYMENT_GUIDE.md` | Deployment steps |
| `TESTING_SUMMARY.md` | Test documentation |
| `TESTING_GUIDE.md` | Test how-to |
| `TEMPLATES_QUICK_REFERENCE.md` | This file |

---

## 🐛 Common Issues

### "Cannot find module '@prisma/client'"
```bash
cd apps/api && npx prisma generate
```

### Database connection errors
```bash
# Check .env DATABASE_URL
# Ensure PostgreSQL is running
```

### Tests fail
```bash
# Clear cache
npm test -- --clearCache

# Reinstall
rm -rf node_modules && npm install
```

---

## 📈 Metrics

### Test Coverage
- Backend: 2,617 lines (5 files)
- Frontend: 2,720 lines (4 files)
- Total: 5,337 lines

### Code Distribution
- Services: 1,724 lines
- Routes: 727 lines
- Hooks: 696 lines
- Tests: 5,337 lines
- Docs: 1,945 lines

---

## ✅ Checklist

### Before Commit
- [ ] Tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] TypeScript compiles: `npm run type-check`

### Before Deploy
- [ ] All tests pass with coverage
- [ ] Database migrated
- [ ] Templates seeded
- [ ] Environment variables set
- [ ] Build succeeds

---

## 🔗 Quick Links

- **Git Branch:** `claude/review-templates-tab-01RcHgDdkkSCbthekaWqvfR4`
- **API Base:** `http://localhost:8000`
- **Web Base:** `http://localhost:3000`
- **Prisma Studio:** `npx prisma studio` → `http://localhost:5555`

---

**Last Updated:** November 14, 2025
**Status:** ✅ Production Ready

