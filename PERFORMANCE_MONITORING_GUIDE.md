## Performance Monitoring Guide - RoleRabbit Frontend

## Overview

The performance monitoring system tracks frontend performance metrics to help optimize user experience. It collects:
- **Web Vitals** - Core performance metrics (LCP, FID, CLS, etc.)
- **Navigation Timing** - Page load performance
- **Resource Timing** - Asset loading performance
- **Custom Metrics** - Component render times, API call durations, user interactions

---

## Features

✅ **Automatic Tracking**
- Web Vitals (LCP, FID, CLS, FCP, TTFB, INP)
- Navigation timing (DNS, TCP, request/response, DOM processing)
- Resource timing (scripts, stylesheets, images, fonts, XHR)

✅ **Custom Tracking**
- Component performance
- Operation timing
- User interactions
- Data fetching

✅ **Smart Sampling**
- Configurable sample rate (e.g., monitor 10% of users)
- Reduces backend load and costs
- Statistical significance maintained

✅ **Automatic Reporting**
- Periodic batch reporting (every 30s)
- Report on page unload
- Uses sendBeacon for reliability

---

## Quick Start

### 1. Enable Performance Monitoring

```bash
# apps/web/.env.local
NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED=true
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE=0.1  # Monitor 10% of users
```

### 2. Install web-vitals

```bash
cd apps/web
npm install web-vitals
```

### 3. Initialize in App

```typescript
// app/layout.tsx or _app.tsx
import { useEffect } from 'react';
import performanceMonitoring from '@/services/performanceMonitoring';

export default function RootLayout({ children }) {
  useEffect(() => {
    performanceMonitoring.initialize();
  }, []);

  return <>{children}</>;
}
```

---

## Web Vitals

### What Are Web Vitals?

Web Vitals are Google's core metrics for measuring user experience:

| Metric | Name | Good | Needs Improvement | Poor | What It Measures |
|--------|------|------|-------------------|------|------------------|
| **LCP** | Largest Contentful Paint | ≤2.5s | 2.5s-4.0s | >4.0s | Loading performance |
| **FID** | First Input Delay | ≤100ms | 100ms-300ms | >300ms | Interactivity |
| **CLS** | Cumulative Layout Shift | ≤0.1 | 0.1-0.25 | >0.25 | Visual stability |
| **FCP** | First Contentful Paint | ≤1.8s | 1.8s-3.0s | >3.0s | Loading speed |
| **TTFB** | Time to First Byte | ≤800ms | 800ms-1800ms | >1800ms | Server response |
| **INP** | Interaction to Next Paint | ≤200ms | 200ms-500ms | >500ms | Responsiveness |

### Automatic Tracking

Web Vitals are automatically tracked when `web-vitals` package is installed:

```typescript
import performanceMonitoring from '@/services/performanceMonitoring';

// Initialize (automatically tracks Web Vitals)
performanceMonitoring.initialize();
```

### Manual Reporting

```typescript
import { onCLS, onFID, onLCP } from 'web-vitals';

onCLS((metric) => console.log('CLS:', metric.value, metric.rating));
onFID((metric) => console.log('FID:', metric.value, metric.rating));
onLCP((metric) => console.log('LCP:', metric.value, metric.rating));
```

---

## Custom Metrics

### Track Simple Metric

```typescript
import { trackMetric } from '@/services/performanceMonitoring';

// Track time (milliseconds)
trackMetric('template_render_time', 145, 'ms');

// Track size (bytes)
trackMetric('image_size', 52480, 'bytes');

// Track count
trackMetric('templates_loaded', 12, 'count');

// Track score
trackMetric('quality_score', 0.95, 'score');
```

### Track Operation Duration

```typescript
import { trackOperation } from '@/services/performanceMonitoring';

// Synchronous operation
const result = trackOperation('calculate_score', () => {
  return complexCalculation();
});

// Asynchronous operation
const data = await trackOperation('fetch_templates', async () => {
  return await apiService.getTemplates();
});

// With metadata
await trackOperation(
  'search_templates',
  async () => {
    return await apiService.searchTemplates(query);
  },
  { query, resultCount: results.length }
);
```

---

## React Hooks

### usePerformance Hook

Track component performance:

```typescript
import { usePerformance } from '@/hooks/usePerformance';

function TemplatesList() {
  const { trackAction, trackMetric, startTimer } = usePerformance({
    componentName: 'TemplatesList',
    trackMount: true,    // Track mount time
    trackRender: true,   // Track render count
    trackUnmount: true,  // Track component lifetime
  });

  const handlePreview = async (id: string) => {
    // Track user action
    await trackAction('preview_template', async () => {
      await previewTemplate(id);
    });
  };

  const handleFilter = () => {
    // Start timer
    const stopTimer = startTimer('apply_filter');

    // Do work
    applyFilter();

    // Stop timer and track duration
    stopTimer();
  };

  return <div>...</div>;
}
```

### useFetchPerformance Hook

Track data fetching:

```typescript
import { useFetchPerformance } from '@/hooks/usePerformance';

function useTemplates() {
  const { trackFetch } = useFetchPerformance('templates');

  const fetchTemplates = async () => {
    // Automatically tracks duration and success/error
    const data = await trackFetch(() => apiService.getTemplates());
    setTemplates(data);
  };

  return { fetchTemplates };
}
```

### useListPerformance Hook

Track list rendering:

```typescript
import { useListPerformance } from '@/hooks/usePerformance';

function TemplatesList({ templates }) {
  // Automatically tracks render time for list
  useListPerformance('templates_list', templates.length);

  return (
    <div>
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
```

### useInteractionTracking Hook

Track user interactions:

```typescript
import { useInteractionTracking } from '@/hooks/usePerformance';

function TemplateCard() {
  const { trackClick, trackHover, trackScroll } = useInteractionTracking('TemplateCard');

  const handleClick = () => {
    trackClick('preview_button');
    openPreview();
  };

  const handleMouseEnter = () => {
    const hoverStart = Date.now();
    // ... on mouse leave:
    trackHover('card_hover', Date.now() - hoverStart);
  };

  return <div>...</div>;
}
```

---

## Backend Integration

### Performance Metrics Endpoint

Create endpoint to receive metrics:

```javascript
// apps/api/routes/performance.routes.js

fastify.post('/api/performance/metrics', async (request, reply) => {
  const {
    url,
    userAgent,
    timestamp,
    webVitals,
    metrics
  } = request.body;

  try {
    // Store in database
    await prisma.performanceMetric.createMany({
      data: metrics.map((metric) => ({
        name: metric.name,
        value: metric.value,
        unit: metric.unit,
        url,
        userAgent,
        userId: request.user?.id || null,
        metadata: metric.metadata ? JSON.stringify(metric.metadata) : null,
        timestamp: new Date(timestamp)
      }))
    });

    // Store Web Vitals
    if (webVitals && Object.keys(webVitals).length > 0) {
      await prisma.webVitals.create({
        data: {
          url,
          userAgent,
          userId: request.user?.id || null,
          lcp: webVitals.LCP,
          fid: webVitals.FID,
          cls: webVitals.CLS,
          fcp: webVitals.FCP,
          ttfb: webVitals.TTFB,
          inp: webVitals.INP,
          timestamp: new Date(timestamp)
        }
      });
    }

    reply.send({ success: true });
  } catch (error) {
    console.error('Failed to store performance metrics:', error);
    reply.send({ success: false });
  }
});
```

### Database Schema (Example)

```prisma
model PerformanceMetric {
  id        String   @id @default(cuid())
  name      String
  value     Float
  unit      String   // 'ms', 'bytes', 'count', 'score'
  url       String
  userAgent String
  userId    String?
  metadata  String?  // JSON
  timestamp DateTime
  createdAt DateTime @default(now())

  @@index([name, timestamp])
  @@index([userId, timestamp])
}

model WebVitals {
  id        String   @id @default(cuid())
  url       String
  userAgent String
  userId    String?
  lcp       Float?   // Largest Contentful Paint
  fid       Float?   // First Input Delay
  cls       Float?   // Cumulative Layout Shift
  fcp       Float?   // First Contentful Paint
  ttfb      Float?   // Time to First Byte
  inp       Float?   // Interaction to Next Paint
  timestamp DateTime
  createdAt DateTime @default(now())

  @@index([url, timestamp])
  @@index([userId, timestamp])
}
```

---

## Analyzing Performance Data

### SQL Queries

**Average Web Vitals:**
```sql
SELECT
  AVG(lcp) as avg_lcp,
  AVG(fid) as avg_fid,
  AVG(cls) as avg_cls,
  AVG(fcp) as avg_fcp,
  AVG(ttfb) as avg_ttfb
FROM "WebVitals"
WHERE "timestamp" >= NOW() - INTERVAL '7 days'
  AND url LIKE '%/templates%';
```

**P95 Metrics:**
```sql
SELECT
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95
FROM "PerformanceMetric"
WHERE name = 'operation_fetch_templates'
  AND "timestamp" >= NOW() - INTERVAL '7 days';
```

**Slow Operations:**
```sql
SELECT
  name,
  AVG(value) as avg_duration,
  COUNT(*) as count
FROM "PerformanceMetric"
WHERE unit = 'ms'
  AND "timestamp" >= NOW() - INTERVAL '24 hours'
GROUP BY name
HAVING AVG(value) > 1000  -- Operations slower than 1s
ORDER BY avg_duration DESC
LIMIT 20;
```

### Grafana Dashboard

**Panel Queries (Prometheus/SQL):**

1. **Web Vitals Trends**
   ```sql
   SELECT
     DATE_TRUNC('hour', timestamp) as time,
     AVG(lcp) as lcp,
     AVG(fid) as fid,
     AVG(cls) as cls
   FROM "WebVitals"
   WHERE timestamp >= $__timeFrom AND timestamp <= $__timeTo
   GROUP BY time
   ORDER BY time;
   ```

2. **Operation Performance**
   ```sql
   SELECT
     name,
     AVG(value) as avg,
     PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95,
     PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value) as p99
   FROM "PerformanceMetric"
   WHERE unit = 'ms'
     AND timestamp >= NOW() - INTERVAL '1 hour'
   GROUP BY name;
   ```

---

## Best Practices

### 1. Use Sampling in Production

```bash
# Reduce backend load by sampling
NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE=0.1  # Monitor 10% of users
```

### 2. Track Key User Flows

```typescript
// Track critical paths
const { trackAction } = usePerformance({ componentName: 'Checkout' });

const handleCheckout = () => {
  trackAction('complete_checkout', async () => {
    await processPayment();
    await createOrder();
    await sendConfirmation();
  });
};
```

### 3. Monitor Slow Operations

```typescript
// Alert on slow operations
await trackOperation('critical_operation', async () => {
  const result = await criticalOperation();

  if (result.duration > 2000) {
    // Log warning for operations >2s
    console.warn('Slow operation detected:', result);
  }

  return result;
});
```

### 4. Track Resource Sizes

```typescript
// Monitor bundle sizes
trackMetric('bundle_size_main', bundleSize, 'bytes', {
  page: 'templates',
  buildTime: new Date().toISOString()
});
```

### 5. Use Conditional Tracking

```typescript
// Only track in production or for specific users
if (process.env.NODE_ENV === 'production' || user.isBetaTester) {
  trackMetric('beta_feature_usage', 1, 'count');
}
```

---

## Performance Optimization Tips

### Improve LCP (Largest Contentful Paint)

- ✅ Optimize largest image/text block
- ✅ Use Next.js Image component
- ✅ Implement lazy loading
- ✅ Reduce server response time
- ✅ Use CDN for assets

### Improve FID (First Input Delay)

- ✅ Minimize JavaScript execution
- ✅ Code split with dynamic imports
- ✅ Use Web Workers for heavy tasks
- ✅ Defer non-critical scripts

### Improve CLS (Cumulative Layout Shift)

- ✅ Set explicit width/height on images
- ✅ Reserve space for ads/embeds
- ✅ Avoid inserting content above existing content
- ✅ Use CSS aspect-ratio

### Improve Overall Performance

- ✅ Enable Gzip/Brotli compression
- ✅ Minimize and bundle assets
- ✅ Use code splitting
- ✅ Implement caching strategies
- ✅ Optimize database queries
- ✅ Use CDN for static assets

---

## Troubleshooting

### Metrics Not Being Sent

1. Check environment variables:
   ```bash
   echo $NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED
   ```

2. Check sampling:
   ```typescript
   console.log('Sample rate:', process.env.NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE);
   ```

3. Check browser console for errors

### High Web Vitals Scores

1. Use Lighthouse to diagnose:
   ```bash
   npm install -g lighthouse
   lighthouse https://your-app.com --view
   ```

2. Check Network tab for slow resources
3. Use Performance tab to profile JavaScript
4. Use Coverage tab to find unused code

### Backend Overload

1. Increase sampling rate (lower percentage):
   ```bash
   NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE=0.05  # 5% instead of 10%
   ```

2. Increase report interval (in code)
3. Add database indexes on timestamp columns
4. Implement metric aggregation

---

## Testing

### Test Performance Tracking

```typescript
import { trackMetric, trackOperation } from '@/services/performanceMonitoring';

// Test metric tracking
trackMetric('test_metric', 123, 'ms', { test: true });

// Test operation tracking
await trackOperation('test_operation', async () => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log('Operation tracked');
});
```

### Test in Development

```bash
# Enable in development
NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED=true
NEXT_PUBLIC_PERFORMANCE_SAMPLE_RATE=1.0

# Start app
npm run dev

# Check console for performance logs
```

---

## Resources

### Internal Files
- `apps/web/src/services/performanceMonitoring.ts` - Performance monitoring service
- `apps/web/src/hooks/usePerformance.ts` - Performance hooks
- `apps/web/.env.performance.example` - Environment variables

### External Resources
- [Web Vitals](https://web.dev/vitals/)
- [web-vitals library](https://github.com/GoogleChrome/web-vitals)
- [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API)
- [Navigation Timing](https://developer.mozilla.org/en-US/docs/Web/API/Navigation_timing_API)
- [Resource Timing](https://developer.mozilla.org/en-US/docs/Web/API/Resource_Timing_API)

---

**Last Updated:** November 14, 2025
**Maintained By:** Development Team
