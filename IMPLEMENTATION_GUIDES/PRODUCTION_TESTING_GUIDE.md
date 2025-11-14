# Production Testing Guide - Files Tab

## Overview

Comprehensive testing checklist to ensure the files tab is production-ready across performance, security, accessibility, and compatibility.

---

## 1. Load Testing (1000+ Concurrent Uploads)

### Objectives
- Verify system handles high concurrent upload volume
- Identify bottlenecks in upload pipeline
- Measure response times under load
- Test database connection pooling

### Test Setup

```bash
# Install load testing tools
npm install -g artillery k6

# Create artillery config
cat > load-tests/upload-test.yml <<'EOF'
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 100
      name: "Ramp up to 100 users/sec"
    - duration: 180
      arrivalRate: 1000
      name: "Sustained load - 1000 users/sec"
    - duration: 60
      arrivalRate: 50
      name: "Cool down"
  processor: "./upload-processor.js"

scenarios:
  - name: "Concurrent file upload"
    flow:
      - post:
          url: "/api/storage/files/upload"
          headers:
            Authorization: "Bearer {{ authToken }}"
          beforeRequest: "prepareFileUpload"
          formData:
            file: "@test-files/sample-resume.pdf"
            type: "resume"
            description: "Load test upload"
EOF
```

### Load Test Script (K6)

```javascript
// load-tests/upload-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { FormData } from 'https://jslib.k6.io/formdata/0.0.2/index.js';

export const options = {
  stages: [
    { duration: '1m', target: 100 },   // Ramp up to 100 users
    { duration: '2m', target: 500 },   // Ramp to 500 users
    { duration: '3m', target: 1000 },  // Sustain 1000 concurrent users
    { duration: '2m', target: 500 },   // Ramp down
    { duration: '1m', target: 0 },     // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],  // 95% of requests under 5s
    http_req_failed: ['rate<0.1'],       // Error rate under 10%
  },
};

const AUTH_TOKEN = 'YOUR_TEST_TOKEN'; // Replace with valid token
const API_BASE = 'http://localhost:3001';

export default function () {
  const fd = new FormData();
  const fileContent = open('./test-files/sample-resume.pdf', 'b');
  fd.append('file', http.file(fileContent, 'resume.pdf', 'application/pdf'));
  fd.append('type', 'resume');
  fd.append('description', `Load test ${__VU}-${__ITER}`);

  const res = http.post(`${API_BASE}/api/storage/files/upload`, fd.body(), {
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'multipart/form-data; boundary=' + fd.boundary,
    },
    timeout: '30s',
  });

  check(res, {
    'upload successful': (r) => r.status === 201,
    'response has file ID': (r) => JSON.parse(r.body).file?.id !== undefined,
  });

  sleep(Math.random() * 3); // Random delay 0-3s between uploads
}
```

### Database Load Test

```javascript
// load-tests/database-concurrent-test.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    file_list: {
      executor: 'constant-arrival-rate',
      rate: 1000, // 1000 requests per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 50,
      maxVUs: 200,
    },
    advanced_search: {
      executor: 'constant-arrival-rate',
      rate: 500,
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 25,
      maxVUs: 100,
    },
  },
};

export default function () {
  const scenario = __ENV.SCENARIO_NAME;

  if (scenario === 'file_list') {
    // Test paginated file list with 50 items per page
    const res = http.get(`${API_BASE}/api/storage/files?page=1&limit=50`, {
      headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
    });
    check(res, { 'file list OK': (r) => r.status === 200 });
  } else {
    // Test advanced search with filters
    const res = http.get(
      `${API_BASE}/api/storage/search/advanced?q=resume&type=application/pdf&page=1`,
      { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
    );
    check(res, { 'search OK': (r) => r.status === 200 });
  }
}
```

### Monitoring During Load Tests

```bash
# Monitor API server resources
# Terminal 1: Watch CPU/Memory
docker stats

# Terminal 2: Monitor PostgreSQL connections
psql -h localhost -U postgres -d roleready -c "
  SELECT
    count(*) as connections,
    state,
    wait_event_type
  FROM pg_stat_activity
  GROUP BY state, wait_event_type;
" --watch 1

# Terminal 3: Monitor Supabase storage
# Check bucket metrics in Supabase dashboard

# Terminal 4: Run the load test
k6 run load-tests/upload-load-test.js
```

### Success Criteria

- ✅ System handles 1000 concurrent uploads without crashes
- ✅ 95th percentile response time < 5 seconds
- ✅ Error rate < 1% under sustained load
- ✅ Database connections don't exceed pool limit
- ✅ Memory usage remains stable (no leaks)
- ✅ CPU usage stays below 80% average
- ✅ Storage writes complete successfully

---

## 2. Stress Testing (What Breaks First?)

### Objective
Find the breaking point and failure modes of the system.

### Stress Test Scenarios

#### A. Vertical Stress (Single User, Large Files)

```javascript
// stress-tests/large-file-stress.js
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 1 }, // Single user
  ],
};

const FILE_SIZES = [
  10 * 1024 * 1024,    // 10MB
  50 * 1024 * 1024,    // 50MB
  100 * 1024 * 1024,   // 100MB
  500 * 1024 * 1024,   // 500MB
  1024 * 1024 * 1024,  // 1GB
];

export default function () {
  FILE_SIZES.forEach(size => {
    const fileContent = new Uint8Array(size);

    const res = http.post(
      `${API_BASE}/api/storage/files/upload`,
      {
        file: http.file(fileContent, `stress-${size}.bin`, 'application/octet-stream'),
        type: 'document',
      },
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        timeout: '10m',
      }
    );

    console.log(`File size: ${size} bytes, Status: ${res.status}, Duration: ${res.timings.duration}ms`);

    check(res, {
      'upload succeeded or quota exceeded': (r) =>
        r.status === 201 || r.status === 403,
    });
  });
}
```

#### B. Horizontal Stress (Gradual Increase Until Failure)

```javascript
// stress-tests/gradual-increase.js
export const options = {
  stages: [
    { duration: '5m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '5m', target: 1000 },
    { duration: '5m', target: 2000 },
    { duration: '5m', target: 5000 },
    { duration: '5m', target: 10000 }, // Keep increasing until failure
  ],
  thresholds: {
    http_req_failed: ['rate<0.5'], // Allow 50% failure before stopping
  },
};
```

#### C. Storage Quota Stress

```bash
# Test storage quota limits
# Create user with 1GB quota
psql -d roleready -c "
  INSERT INTO storage_quotas (user_id, used_bytes, limit_bytes)
  VALUES ('test-user-id', 0, 1073741824);
"

# Upload files until quota is hit
node stress-tests/quota-stress.js
```

#### D. Database Connection Pool Stress

```javascript
// stress-tests/db-connection-stress.js
// Simulate many concurrent database queries
export const options = {
  scenarios: {
    db_stress: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 1000,
      stages: [
        { target: 100, duration: '2m' },
        { target: 500, duration: '2m' },
        { target: 1000, duration: '2m' },
        { target: 2000, duration: '2m' }, // Push beyond connection pool
      ],
    },
  },
};
```

### Failure Mode Analysis

Document what breaks first:

```markdown
## Stress Test Results

### Breaking Points Found:

1. **Database Connection Pool** (FIRST TO FAIL)
   - Breaks at: ~500 concurrent connections
   - Error: "Connection pool timeout"
   - Fix: Increase max_connections in PostgreSQL, implement connection queuing

2. **Memory Exhaustion** (SECOND TO FAIL)
   - Breaks at: ~5000 concurrent file uploads in memory
   - Error: "Out of memory"
   - Fix: Stream files to disk, limit concurrent uploads per user

3. **Storage Write Throughput** (THIRD TO FAIL)
   - Breaks at: ~10GB/s write throughput
   - Error: Supabase API rate limit
   - Fix: Implement upload queue, retry logic

4. **CPU Saturation**
   - Breaks at: ~80% sustained CPU for 10+ minutes
   - Impact: Slow response times
   - Fix: Scale horizontally, optimize file hash calculations
```

---

## 3. Security Penetration Testing

### A. Authentication & Authorization Tests

```bash
# Test 1: Try accessing files without authentication
curl -X GET http://localhost:3001/api/storage/files \
  -H "Content-Type: application/json"
# Expected: 401 Unauthorized

# Test 2: Try accessing another user's file
curl -X GET http://localhost:3001/api/storage/files/<other-user-file-id>/download \
  -H "Authorization: Bearer <your-token>"
# Expected: 403 Forbidden

# Test 3: Try expired JWT token
curl -X GET http://localhost:3001/api/storage/files \
  -H "Authorization: Bearer <expired-token>"
# Expected: 401 Unauthorized

# Test 4: Malformed JWT
curl -X GET http://localhost:3001/api/storage/files \
  -H "Authorization: Bearer malformed.jwt.token"
# Expected: 401 Unauthorized
```

### B. Injection Attack Tests

```javascript
// security-tests/sql-injection.js
// Test SQL injection in search queries
const sqlInjectionPayloads = [
  "'; DROP TABLE storage_files; --",
  "1' OR '1'='1",
  "admin'--",
  "' UNION SELECT * FROM users--",
];

sqlInjectionPayloads.forEach(payload => {
  const res = http.get(
    `${API_BASE}/api/storage/search/advanced?q=${encodeURIComponent(payload)}`,
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
  );

  check(res, {
    'SQL injection prevented': (r) => r.status !== 500,
    'No data leak': (r) => !r.body.includes('users') && !r.body.includes('password'),
  });
});
```

### C. Path Traversal Tests

```bash
# Test path traversal in file downloads
curl -X GET "http://localhost:3001/api/storage/files/../../etc/passwd/download" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 404 or 403

# Test path traversal in file names
curl -X POST http://localhost:3001/api/storage/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.pdf" \
  -F "displayName=../../../etc/passwd"
# Expected: Filename sanitized or rejected
```

### D. XSS Tests

```javascript
// security-tests/xss-tests.js
const xssPayloads = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  'javascript:alert("XSS")',
  '<svg onload=alert("XSS")>',
];

xssPayloads.forEach(payload => {
  // Test in file description
  const res = http.post(
    `${API_BASE}/api/storage/files/upload`,
    {
      file: http.file(fileContent, 'test.pdf'),
      description: payload,
    },
    { headers: { Authorization: `Bearer ${AUTH_TOKEN}` } }
  );

  // Retrieve and check response is sanitized
  const getRes = http.get(`${API_BASE}/api/storage/files/${res.json().file.id}`, {
    headers: { Authorization: `Bearer ${AUTH_TOKEN}` }
  });

  check(getRes, {
    'XSS payload sanitized': (r) => !r.body.includes('<script>'),
  });
});
```

### E. File Upload Security Tests

```bash
# Test 1: Upload executable disguised as PDF
echo '#!/bin/bash\nrm -rf /' > malicious.sh
mv malicious.sh malicious.pdf
curl -X POST http://localhost:3001/api/storage/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@malicious.pdf" \
  -F "type=resume"
# Expected: File type validation rejects

# Test 2: Upload extremely large file (DOS)
dd if=/dev/zero of=huge.bin bs=1G count=10  # 10GB file
curl -X POST http://localhost:3001/api/storage/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@huge.bin"
# Expected: Request rejected (exceeds limit)

# Test 3: ZIP bomb upload
curl -X POST http://localhost:3001/api/storage/files/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@42.zip"  # 42KB that expands to 4.5PB
# Expected: Rejected based on file type or size validation
```

### F. Share Link Security Tests

```bash
# Test 1: Access expired share link
curl -X GET http://localhost:3001/api/storage/shared/<expired-token>
# Expected: 403 Forbidden with "Link expired" message

# Test 2: Access share link beyond max downloads
curl -X GET http://localhost:3001/api/storage/shared/<exhausted-token>
# Expected: 403 Forbidden with "Download limit exceeded"

# Test 3: Brute force share token
for i in {1..10000}; do
  curl -X GET http://localhost:3001/api/storage/shared/$(openssl rand -hex 16)
done
# Expected: Rate limiting kicks in, tokens are cryptographically random
```

### G. CSRF Tests

```html
<!-- security-tests/csrf-attack.html -->
<!DOCTYPE html>
<html>
<body>
  <h1>CSRF Test</h1>
  <form action="http://localhost:3001/api/storage/files/upload" method="POST" enctype="multipart/form-data">
    <input type="file" name="file" value="malicious.pdf">
    <input type="submit" value="Upload">
  </form>
  <script>
    // Auto-submit form to test CSRF protection
    document.forms[0].submit();
  </script>
</body>
</html>
```

### Security Testing Checklist

- ✅ JWT authentication enforced on all endpoints
- ✅ User can only access their own files
- ✅ SQL injection prevented (parameterized queries)
- ✅ XSS prevented (input sanitization)
- ✅ Path traversal prevented (filename sanitization)
- ✅ CSRF protection enabled
- ✅ Rate limiting prevents brute force
- ✅ File type validation (magic bytes, not just extension)
- ✅ File size limits enforced
- ✅ Share links expire correctly
- ✅ Download limits enforced
- ✅ Password-protected shares work correctly
- ✅ Activity logging captures security events

---

## 4. Cross-Browser Testing

### Browsers to Test

| Browser | Version | Priority | Notes |
|---------|---------|----------|-------|
| Chrome | Latest | P0 | 65% market share |
| Firefox | Latest | P0 | 4% market share |
| Safari | Latest | P0 | 20% market share (macOS/iOS) |
| Edge | Latest | P1 | 5% market share |
| Chrome | -1 version | P1 | Recent previous |
| Safari | iOS 15+ | P0 | Mobile critical |
| Chrome Mobile | Latest | P0 | Mobile critical |

### Test Matrix

```javascript
// cross-browser-tests/file-operations.spec.js
describe('File Operations - Cross Browser', () => {
  const browsers = ['chrome', 'firefox', 'safari', 'edge'];

  browsers.forEach(browser => {
    describe(`${browser} tests`, () => {
      before(() => {
        cy.setBrowser(browser);
      });

      it('should upload files via drag and drop', () => {
        cy.visit('/dashboard?tab=storage');

        // Test drag-and-drop
        const dropEvent = {
          dataTransfer: {
            files: [new File(['content'], 'test.pdf', { type: 'application/pdf' })],
          },
        };

        cy.get('[data-testid="upload-dropzone"]')
          .trigger('drop', dropEvent);

        cy.contains('Upload successful').should('be.visible');
      });

      it('should preview PDFs inline', () => {
        cy.get('[data-testid="file-card"]').first().click();
        cy.get('[data-testid="preview-modal"]').should('be.visible');

        // Check PDF renders
        cy.get('iframe[src*=".pdf"]').should('exist');
      });

      it('should download files', () => {
        cy.get('[data-testid="download-button"]').click();

        // Verify download initiated
        cy.readFile('cypress/downloads/test.pdf').should('exist');
      });

      it('should select multiple files', () => {
        // Test Ctrl+Click (Cmd+Click on Mac)
        const modifier = Cypress.platform === 'darwin' ? 'meta' : 'ctrl';

        cy.get('[data-testid="file-card"]').eq(0).click();
        cy.get('[data-testid="file-card"]').eq(1).click({ [modifier]: true });
        cy.get('[data-testid="file-card"]').eq(2).click({ [modifier]: true });

        cy.get('[data-testid="bulk-toolbar"]').should('contain', '3 selected');
      });
    });
  });
});
```

### Browser-Specific Issues to Check

#### Chrome
- ✅ File drag-and-drop works
- ✅ PDF preview in iframe works
- ✅ Video playback works
- ✅ Audio playback works
- ✅ ZIP download triggers correctly

#### Firefox
- ✅ Multipart form upload works
- ✅ PDF preview (uses Firefox PDF.js)
- ✅ Download attribute honored
- ✅ Content-Disposition header respected

#### Safari
- ✅ File input accepts correct types
- ✅ Video playback (H.264 codec)
- ✅ Audio playback (AAC codec)
- ✅ Date picker works
- ✅ Blob URLs work for downloads
- ✅ IndexedDB for offline storage

#### Edge
- ✅ Same as Chrome (Chromium-based)
- ✅ Legacy file APIs not used

---

## 5. Mobile Browser Testing

### Devices to Test

| Device | OS | Browser | Screen Size | Priority |
|--------|----|---------| ------------|----------|
| iPhone 14 Pro | iOS 17 | Safari | 393×852 | P0 |
| iPhone SE | iOS 16 | Safari | 375×667 | P0 |
| iPad Air | iOS 17 | Safari | 820×1180 | P1 |
| Samsung Galaxy S23 | Android 14 | Chrome | 360×780 | P0 |
| Google Pixel 7 | Android 13 | Chrome | 412×915 | P1 |

### Mobile-Specific Tests

```javascript
// mobile-tests/responsive.spec.js
describe('Mobile File Management', () => {
  beforeEach(() => {
    cy.viewport('iphone-14');
    cy.visit('/dashboard?tab=storage');
  });

  it('should show mobile-optimized file grid', () => {
    // Mobile should show 1-2 columns max
    cy.get('[data-testid="file-grid"]')
      .should('have.css', 'grid-template-columns')
      .and('match', /repeat\(auto-fill, minmax\((280|340)px, 1fr\)\)/);
  });

  it('should allow file upload from camera', () => {
    cy.get('[data-testid="upload-button"]').click();

    // Check file input accepts camera
    cy.get('input[type="file"]')
      .should('have.attr', 'accept')
      .and('include', 'image/*');

    cy.get('input[type="file"]')
      .should('have.attr', 'capture'); // Triggers camera on mobile
  });

  it('should use native share on mobile', () => {
    cy.get('[data-testid="file-card"]').first().click();
    cy.get('[data-testid="share-button"]').click();

    // Should trigger Web Share API
    cy.window().then(win => {
      cy.spy(win.navigator, 'share').as('shareApi');
    });

    cy.get('@shareApi').should('have.been.called');
  });

  it('should support swipe gestures', () => {
    // Swipe to delete
    cy.get('[data-testid="file-card"]').first()
      .trigger('touchstart', { touches: [{ clientX: 100, clientY: 100 }] })
      .trigger('touchmove', { touches: [{ clientX: 50, clientY: 100 }] })
      .trigger('touchend');

    cy.get('[data-testid="delete-action"]').should('be.visible');
  });

  it('should handle touch zoom on images', () => {
    cy.get('[data-testid="file-card"]').first().click();

    // Pinch zoom
    cy.get('[data-testid="image-preview"]')
      .trigger('touchstart', {
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 200 }
        ]
      })
      .trigger('touchmove', {
        touches: [
          { clientX: 50, clientY: 50 },
          { clientX: 250, clientY: 250 }
        ]
      });

    // Image should zoom
    cy.get('[data-testid="image-preview"]')
      .should('have.css', 'transform')
      .and('include', 'scale');
  });

  it('should work in landscape orientation', () => {
    cy.viewport(852, 393); // Landscape

    cy.get('[data-testid="file-grid"]').should('be.visible');
    cy.get('[data-testid="file-card"]').should('have.length.at.least', 1);
  });
});
```

### Mobile Performance Tests

```javascript
describe('Mobile Performance', () => {
  it('should lazy load images', () => {
    cy.visit('/dashboard?tab=storage');

    // Images below fold should not load immediately
    cy.get('[data-testid="file-thumbnail"]').eq(10)
      .should('have.attr', 'loading', 'lazy');
  });

  it('should compress uploads on mobile', () => {
    // Upload large image from mobile
    cy.get('input[type="file"]').attachFile('large-image.jpg');

    // Check compression occurred
    cy.wait('@uploadFile').then(interception => {
      const uploadedSize = interception.request.body.size;
      const originalSize = 5 * 1024 * 1024; // 5MB original

      expect(uploadedSize).to.be.lessThan(originalSize);
    });
  });

  it('should load quickly on 3G network', () => {
    // Throttle to 3G
    cy.intercept('*', (req) => {
      req.on('response', (res) => {
        res.setDelay(100); // Simulate 3G latency
      });
    });

    cy.visit('/dashboard?tab=storage');

    // Should still load in reasonable time
    cy.get('[data-testid="file-list"]', { timeout: 10000 })
      .should('be.visible');
  });
});
```

### Mobile Checklist

- ✅ Responsive layout (280px to 1200px+)
- ✅ Touch targets minimum 44×44px
- ✅ File upload from camera works
- ✅ Native share API integration
- ✅ Swipe gestures for actions
- ✅ Pinch-to-zoom on images
- ✅ Landscape orientation supported
- ✅ Large file uploads compressed on mobile
- ✅ Lazy loading for images
- ✅ Works on slow 3G networks
- ✅ No horizontal scroll
- ✅ Fixed headers stay in view

---

## 6. Accessibility Testing

### WCAG 2.1 Compliance (Level AA)

### Automated Testing

```bash
# Install accessibility testing tools
npm install -D @axe-core/playwright pa11y lighthouse

# Run automated tests
npx pa11y http://localhost:3000/dashboard?tab=storage
npx lighthouse http://localhost:3000/dashboard?tab=storage --only-categories=accessibility
```

### Playwright Accessibility Tests

```javascript
// a11y-tests/accessibility.spec.js
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Files Tab Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard?tab=storage');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA labels on all interactive elements', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard?tab=storage');

    // Upload button
    const uploadBtn = page.getByRole('button', { name: /upload/i });
    await expect(uploadBtn).toHaveAttribute('aria-label');

    // File cards
    const fileCards = page.getByRole('article');
    for (const card of await fileCards.all()) {
      await expect(card).toHaveAttribute('aria-label');
    }

    // Action buttons
    const downloadBtn = page.getByRole('button', { name: /download/i }).first();
    await expect(downloadBtn).toHaveAttribute('aria-label');
  });

  test('should be fully keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard?tab=storage');

    // Tab through all interactive elements
    await page.keyboard.press('Tab'); // Upload button
    await expect(page.getByRole('button', { name: /upload/i })).toBeFocused();

    await page.keyboard.press('Tab'); // Search input
    await expect(page.getByRole('searchbox')).toBeFocused();

    await page.keyboard.press('Tab'); // Filter dropdown
    await expect(page.getByRole('combobox', { name: /filter/i })).toBeFocused();

    // First file card
    await page.keyboard.press('Tab');
    const firstCard = page.getByRole('article').first();
    await expect(firstCard).toBeFocused();

    // Open file with Enter
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard?tab=storage');

    // Check semantic HTML
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation')).toBeVisible();

    // Check headings hierarchy
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveCount(1);

    // Check landmark regions
    await expect(page.locator('[role="search"]')).toBeVisible();

    // Check live regions for dynamic content
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeAttached();
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard?tab=storage');

    const contrastResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = contrastResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toHaveLength(0);
  });

  test('should work with high contrast mode', async ({ page }) => {
    // Enable high contrast
    await page.emulateMedia({ colorScheme: 'dark', forcedColors: 'active' });
    await page.goto('http://localhost:3000/dashboard?tab=storage');

    // All elements should still be visible
    await expect(page.getByRole('button', { name: /upload/i })).toBeVisible();
    await expect(page.getByRole('article').first()).toBeVisible();
  });

  test('should support zoom up to 200%', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard?tab=storage');

    // Zoom to 200%
    await page.evaluate(() => {
      document.body.style.zoom = '2';
    });

    // Content should still be accessible
    await expect(page.getByRole('button', { name: /upload/i })).toBeVisible();

    // No horizontal scroll should appear
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test('should announce dynamic content changes', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard?tab=storage');

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('test-files/sample.pdf');

    // Check for success announcement
    const announcement = page.locator('[aria-live="polite"]');
    await expect(announcement).toContainText(/uploaded successfully/i);
  });

  test('should handle focus management in modals', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard?tab=storage');

    // Open upload modal
    await page.getByRole('button', { name: /upload/i }).click();

    // Focus should move to modal
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Focus should be trapped in modal
    const focusableElements = await modal.locator('button, input, select, textarea, [tabindex]:not([tabindex="-1"])').all();

    // Tab through all elements
    for (let i = 0; i < focusableElements.length; i++) {
      await page.keyboard.press('Tab');
    }

    // Next tab should loop back to first element
    await page.keyboard.press('Tab');
    await expect(focusableElements[0]).toBeFocused();

    // Close modal
    await page.keyboard.press('Escape');

    // Focus should return to trigger button
    await expect(page.getByRole('button', { name: /upload/i })).toBeFocused();
  });
});
```

### Manual Accessibility Testing

#### Screen Reader Testing

**NVDA (Windows - Free)**
```bash
# Download from: https://www.nvaccess.org/download/
# Test checklist:
```

- ✅ File list announced correctly ("List of 10 items")
- ✅ Each file announced with name, type, size, date
- ✅ Upload button labeled clearly
- ✅ Search field has accessible label
- ✅ Filter dropdowns announce selected value
- ✅ Modal dialogs announced when opened
- ✅ Form errors announced
- ✅ Success messages announced
- ✅ Loading states announced ("Loading files...")
- ✅ Empty states announced ("No files found")

**JAWS (Windows - Commercial)**
```bash
# Similar checklist as NVDA
```

**VoiceOver (macOS - Built-in)**
```bash
# Enable: System Preferences > Accessibility > VoiceOver
# Test checklist:
```

- ✅ Landmarks navigable (Cmd+U, then left/right arrows)
- ✅ Headings navigable (VO+Cmd+H)
- ✅ Links list accessible (VO+U, then right arrow to Links)
- ✅ Form controls properly labeled
- ✅ Tables (if any) have proper headers

#### Keyboard-Only Navigation

```markdown
## Keyboard Navigation Test Plan

### Tab Order
1. Tab to Upload button - Should focus
2. Tab to Search field - Should focus
3. Tab to Filter dropdown - Should focus
4. Tab to Sort dropdown - Should focus
5. Tab to Select All checkbox - Should focus
6. Tab to first file card - Should focus
7. Continue tabbing through all file cards
8. Tab to bulk actions toolbar (if files selected)
9. Tab loops back to Upload button

### Keyboard Shortcuts
- `Ctrl/Cmd + A` - Select all files ✅
- `Escape` - Deselect all / Close modal ✅
- `Delete` - Delete selected files ✅
- `Ctrl/Cmd + D` - Download as ZIP ✅
- `Enter` - Open selected file/modal ✅
- `Space` - Toggle checkbox ✅
- `Arrow Keys` - Navigate file grid (optional) ⬜

### Focus Indicators
- All interactive elements show clear focus ring ✅
- Focus ring has 3:1 contrast ratio ✅
- Focus ring visible on all browsers ✅
```

### Accessibility Checklist

#### Perceivable
- ✅ All images have alt text
- ✅ Color is not the only means of conveying information
- ✅ Text contrast ratio ≥ 4.5:1 (normal text)
- ✅ Text contrast ratio ≥ 3:1 (large text)
- ✅ Audio has text alternative (if applicable)
- ✅ Video has captions (if applicable)
- ✅ Content adapts to 200% zoom without horizontal scroll

#### Operable
- ✅ All functionality available via keyboard
- ✅ No keyboard traps
- ✅ Sufficient time to read content
- ✅ No flashing content (seizure risk)
- ✅ Skip to main content link
- ✅ Focus order is logical
- ✅ Link purpose clear from text
- ✅ Multiple ways to navigate (search, browse)
- ✅ Focus visible on all interactive elements
- ✅ Touch targets ≥ 44×44px

#### Understandable
- ✅ Page language declared (`<html lang="en">`)
- ✅ Language changes marked (`<span lang="es">`)
- ✅ Predictable navigation
- ✅ Consistent identification
- ✅ Form labels or instructions
- ✅ Error identification and suggestions
- ✅ Error prevention (confirmations for destructive actions)

#### Robust
- ✅ Valid HTML (no parsing errors)
- ✅ ARIA used correctly
- ✅ Status messages (aria-live regions)
- ✅ Compatible with assistive technologies

---

## Testing Execution Plan

### Phase 1: Development Testing (Week 1)
- Run automated accessibility tests (axe, pa11y)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile browser testing (iOS Safari, Chrome Mobile)

### Phase 2: Load Testing (Week 2)
- Run K6 load tests (100 → 1000 concurrent users)
- Monitor database, API, storage performance
- Identify and fix bottlenecks

### Phase 3: Stress Testing (Week 3)
- Gradual increase test until failure
- Large file uploads (up to 1GB)
- Database connection pool stress
- Document breaking points and fixes

### Phase 4: Security Testing (Week 4)
- Penetration testing (authentication, injection, XSS)
- File upload security tests
- Share link security validation
- CSRF protection verification

### Phase 5: Manual Testing (Week 5)
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard-only navigation
- High contrast mode testing
- Real device testing (iOS, Android)

### Phase 6: Regression Testing (Week 6)
- Re-run all automated tests
- Verify all issues from previous phases are fixed
- Final production readiness sign-off

---

## Success Criteria

### Performance
- ✅ 1000 concurrent uploads without crash
- ✅ 95th percentile response time < 5s
- ✅ Error rate < 1% under load
- ✅ System recovers gracefully from overload

### Security
- ✅ Zero critical vulnerabilities
- ✅ All OWASP Top 10 mitigated
- ✅ No data leaks in error messages
- ✅ Rate limiting prevents abuse

### Compatibility
- ✅ Works on Chrome, Firefox, Safari, Edge (latest 2 versions)
- ✅ Works on iOS 15+, Android 10+
- ✅ Responsive 280px to 4K displays

### Accessibility
- ✅ WCAG 2.1 Level AA compliant
- ✅ Zero axe violations
- ✅ Screen reader friendly
- ✅ Fully keyboard navigable
- ✅ Touch-friendly on mobile

---

## Continuous Testing

### CI/CD Integration

```yaml
# .github/workflows/testing.yml
name: Production Testing

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - run: npm run test:a11y  # Runs axe + pa11y

  cross-browser:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chrome, firefox, edge]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install ${{ matrix.browser }}
      - run: npx playwright test --project=${{ matrix.browser }}

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm audit
      - run: npm run test:security

  load:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: docker-compose up -d
      - run: k6 run load-tests/upload-load-test.js
```

---

**All testing complete = 1000% Production Ready! 🚀**
