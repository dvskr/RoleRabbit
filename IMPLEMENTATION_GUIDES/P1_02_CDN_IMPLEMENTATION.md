# CDN Implementation for File Delivery

## Overview
Implement CloudFlare CDN for faster file delivery worldwide with caching and bandwidth optimization.

## Why CDN?
- ✅ Faster downloads (edge caching)
- ✅ Reduced bandwidth costs
- ✅ Better global performance
- ✅ Built-in DDoS protection
- ✅ Automatic compression

## Implementation Steps

### Step 1: Set Up CloudFlare (Recommended - Free Tier Available)

```bash
# 1. Sign up at cloudflare.com
# 2. Add your domain
# 3. Update nameservers
# 4. Enable "Always Use HTTPS"
```

### Step 2: Configure CDN for Supabase Storage

Create `apps/api/utils/cdnService.js`:

```javascript
const crypto = require('crypto');
const logger = require('./logger');

const CDN_URL = process.env.CDN_URL || process.env.SUPABASE_URL;
const CDN_SIGNING_KEY = process.env.CDN_SIGNING_KEY; // For signed URLs

/**
 * Generate CDN URL for file
 */
function getCDNUrl(storagePath, options = {}) {
  const {
    expiresIn = 3600, // 1 hour default
    fileName = null,
    contentType = null
  } = options;

  // Base CDN URL
  let url = `${CDN_URL}/storage/v1/object/public/${process.env.SUPABASE_STORAGE_BUCKET}/${storagePath}`;

  // Add query parameters
  const params = new URLSearchParams();

  if (fileName) {
    params.append('download', fileName);
  }

  // Add signature for private files
  if (CDN_SIGNING_KEY) {
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    const signature = generateSignature(storagePath, expires);
    params.append('expires', expires);
    params.append('signature', signature);
  }

  const queryString = params.toString();
  return queryString ? `${url}?${queryString}` : url;
}

/**
 * Generate HMAC signature for URL
 */
function generateSignature(storagePath, expires) {
  const message = `${storagePath}:${expires}`;
  return crypto
    .createHmac('sha256', CDN_SIGNING_KEY)
    .update(message)
    .digest('hex');
}

/**
 * Purge file from CDN cache
 */
async function purgeCDNCache(storagePath) {
  if (!process.env.CLOUDFLARE_API_TOKEN) {
    logger.warn('CloudFlare API token not configured, skipping cache purge');
    return;
  }

  try {
    const url = getCDNUrl(storagePath);

    await fetch(`https://api.cloudflare.com/client/v4/zones/${process.env.CLOUDFLARE_ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: [url]
      })
    });

    logger.info(`✅ Purged CDN cache for: ${storagePath}`);
  } catch (error) {
    logger.error('Failed to purge CDN cache:', error);
  }
}

module.exports = {
  getCDNUrl,
  purgeCDNCache
};
```

### Step 3: Update Storage Handler to Use CDN

Update `apps/api/utils/storageHandler.js`:

```javascript
const cdnService = require('./cdnService');

// In getDownloadUrl function
async function getDownloadUrl(storagePath, expiresIn = 3600) {
  await initializeStorage();

  // Use CDN if configured
  if (process.env.USE_CDN === 'true') {
    return cdnService.getCDNUrl(storagePath, { expiresIn });
  }

  // Fallback to Supabase signed URL
  if (!supabaseClient) {
    throw new Error('Storage not initialized. Supabase client is required.');
  }

  const { data, error } = await supabaseClient.storage
    .from(supabaseStorageBucket)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    const { data: publicData } = supabaseClient.storage
      .from(supabaseStorageBucket)
      .getPublicUrl(storagePath);
    return publicData?.publicUrl || null;
  }

  return data?.signedUrl || null;
}
```

### Step 4: Update File Routes to Return CDN URLs

Update file list endpoint to include CDN URLs:

```javascript
// In storage.routes.js - formatFiles
const formattedFiles = files.map(file => ({
  // ... existing fields
  publicUrl: file.publicUrl,
  cdnUrl: process.env.USE_CDN === 'true'
    ? cdnService.getCDNUrl(file.storagePath)
    : file.publicUrl
}));
```

### Step 5: CloudFlare Configuration

```yaml
# cloudflare-workers.js (optional for advanced control)
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Cache static files for 1 hour
    if (url.pathname.startsWith('/storage/')) {
      return fetch(request, {
        cf: {
          cacheTtl: 3600,
          cacheEverything: true,
        }
      });
    }

    return fetch(request);
  }
}
```

### Step 6: Cache Purging on File Updates

```javascript
// In storage.routes.js - when file is updated
await prisma.storageFile.update({
  where: { id: fileId },
  data: updatePayload
});

// Purge CDN cache
if (process.env.USE_CDN === 'true') {
  await cdnService.purgeCDNCache(file.storagePath);
}
```

### Step 7: Environment Variables

```env
# CDN Configuration
USE_CDN=true
CDN_URL=https://cdn.yourdomain.com
CDN_SIGNING_KEY=your-secret-signing-key

# CloudFlare (for cache purging)
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ZONE_ID=your-zone-id
```

## Alternative: AWS CloudFront

If using AWS, configure CloudFront instead:

```javascript
const AWS = require('aws-sdk');
const cloudfront = new AWS.CloudFront();

async function createInvalidation(paths) {
  await cloudfront.createInvalidation({
    DistributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID,
    InvalidationBatch: {
      CallerReference: Date.now().toString(),
      Paths: {
        Quantity: paths.length,
        Items: paths
      }
    }
  }).promise();
}
```

## Performance Impact

### Before CDN
- Average download: 500-2000ms
- Bandwidth cost: $0.09/GB

### After CDN
- Average download: 50-200ms (10x faster)
- Bandwidth cost: $0.02/GB (cache hit ratio: 80%+)

## Cost Estimate

- **CloudFlare Free:** Unlimited bandwidth, 100k requests/day
- **CloudFlare Pro:** $20/month, advanced caching
- **AWS CloudFront:** $0.085/GB (first 10TB), $0.02/10k requests

## Implementation Time
- Setup: 2 hours
- Integration: 2 hours
- Testing: 1 hour
- **Total: 5 hours**

## Testing

```bash
# Test CDN URL generation
curl "http://localhost:5000/api/storage/files/FILE_ID" \
  -H "Authorization: Bearer TOKEN"

# Verify CDN URL in response
# Should see: "cdnUrl": "https://cdn.yourdomain.com/..."

# Test cache headers
curl -I "https://cdn.yourdomain.com/storage/..."
# Should see: CF-Cache-Status: HIT
```
