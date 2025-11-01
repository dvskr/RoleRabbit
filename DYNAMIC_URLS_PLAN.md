# Dynamic URLs Implementation Plan

## Current State
- Single URL: `/dashboard`
- Tab switching via React state
- localStorage for persistence

## Proposed State  
- Dynamic URLs: `/dashboard/[tab]` where `tab` can be: profile, jobs, editor, etc.
- Browser back/forward works
- Shareable links
- Bookmarkable tabs

## Implementation Strategy

### Option 1: URL-based with Search Params (Recommended)
```
/dashboard?tab=profile
/dashboard?tab=jobs
/dashboard?tab=editor
```
**Pros:**
- Keeps existing `/dashboard` route
- URL params preserve state
- Easy to implement

### Option 2: Next.js Dynamic Routes
```
/dashboard/profile
/dashboard/jobs  
/dashboard/editor
```
**Pros:**
- Cleaner URLs
- Better SEO
- More professional

**Cons:**
- More file restructuring needed

## Recommendation: Option 1 (Search Params)

**Why?**
1. Minimal code changes
2. No file restructuring
3. Works with existing routing
4. Quick to implement

## Implementation Steps

1. Read `?tab=` from URL on mount
2. Update URL when tab changes
3. Keep localStorage as fallback
4. Use Next.js `useSearchParams` hook

Let me implement this approach!

