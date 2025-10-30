# Quick Optimization Checklist - Start Here

## 🚀 Immediate Actions (Do First - 30 minutes)

### 1. Add React.memo to List Items (10 min)
```bash
# Files to update:
- email/components/ContactCard.tsx
- discussion/PostCard.tsx  
- discussion/CommunityCard.tsx
- cloudStorage/FileCard.tsx
```

**Template:**
```typescript
import React from 'react';

const ComponentName = React.memo(function ComponentName({ ...props }) {
  // component code
}, (prevProps, nextProps) => {
  // Optional: custom comparison
  return prevProps.id === nextProps.id && 
         prevProps.isSelected === nextProps.isSelected;
});

export default ComponentName;
```

### 2. Debounce Search Inputs (10 min)
Already have utility at `apps/web/src/utils/performance.ts`

**Example for InboxTab.tsx:**
```typescript
import { debounce } from '../utils/performance';
import { useState, useEffect, useCallback } from 'react';

const [searchTerm, setSearchTerm] = useState('');
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

const debouncedSetSearch = useCallback(
  debounce((value: string) => {
    setDebouncedSearchTerm(value);
  }, 300),
  []
);

useEffect(() => {
  debouncedSetSearch(searchTerm);
}, [searchTerm, debouncedSetSearch]);

// Use debouncedSearchTerm in filtering instead of searchTerm
```

### 3. Add useCallback to Event Handlers (10 min)
In components with many event handlers, wrap them:

```typescript
const handleClick = useCallback(() => {
  // handler code
}, [dependencies]);

const handleChange = useCallback((e) => {
  // handler code
}, [dependencies]);
```

---

## 📋 High Priority Items (1-2 hours each)

### 4. Implement Virtual Scrolling
```bash
npm install react-window @types/react-window
```

### 5. Split Large Components
- Discussion.tsx (2262 lines) → Split into sections
- Templates.tsx (2050 lines) → Split by view mode

### 6. Optimize Bundle
```bash
npm install --save-dev @next/bundle-analyzer
```

Add to `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // your config
});
```

Run: `ANALYZE=true npm run build`

---

## ✅ Already Optimized
- ✅ Global animations removed
- ✅ Navigation optimized
- ✅ JobCard memoized
- ✅ JobTracker callbacks optimized
- ✅ Filter computations memoized

---

## 📊 Priority Order

1. **React.memo for list items** (Critical - prevents re-renders)
2. **Debounce search inputs** (Critical - reduces filtering overhead)
3. **Virtual scrolling** (High - handles large lists)
4. **Split large components** (High - improves maintainability)
5. **Bundle optimization** (Medium - reduces load time)

---

See `COMPREHENSIVE_OPTIMIZATION_PLAN.md` for full details.

