# Virus Scanning Implementation Guide

## Overview
Add ClamAV virus scanning to all file uploads to protect against malware.

## Implementation Steps

### Step 1: Install ClamAV (Local Development)
```bash
# macOS
brew install clamav
freshclam  # Update virus definitions

# Ubuntu/Debian
sudo apt-get install clamav clamav-daemon
sudo freshclam
sudo systemctl start clamav-daemon

# Windows
# Download from https://www.clamav.net/downloads
```

### Step 2: Install Node.js ClamAV Client
```bash
cd apps/api
npm install clamscan
```

### Step 3: Create Virus Scanner Utility
Create `apps/api/utils/virusScanner.js`:

```javascript
const NodeClam = require('clamscan');
const logger = require('./logger');

let clamScan = null;

async function initializeScanner() {
  if (clamScan) return clamScan;

  try {
    clamScan = await new NodeClam().init({
      removeInfected: false, // We handle cleanup
      quarantineInfected: false,
      scanLog: null,
      debugMode: process.env.NODE_ENV === 'development',
      clamdscan: {
        socket: '/var/run/clamav/clamd.ctl', // Default Unix socket
        host: process.env.CLAMAV_HOST || 'localhost',
        port: process.env.CLAMAV_PORT || 3310,
        timeout: 60000,
        localFallback: true
      }
    });

    logger.info('✅ Virus scanner initialized');
    return clamScan;
  } catch (error) {
    logger.error('Failed to initialize virus scanner:', error);

    // In production, fail fast if scanner unavailable
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Virus scanner initialization failed');
    }

    // In development, return mock scanner
    return {
      scanStream: async () => ({ isInfected: false, viruses: [] })
    };
  }
}

/**
 * Scan a file buffer for viruses
 * @param {Buffer} buffer - File buffer to scan
 * @returns {Promise<{safe: boolean, viruses: string[]}>}
 */
async function scanBuffer(buffer) {
  const scanner = await initializeScanner();

  try {
    const { Readable } = require('stream');
    const stream = Readable.from(buffer);

    const { isInfected, viruses } = await scanner.scanStream(stream);

    if (isInfected) {
      logger.warn('🦠 VIRUS DETECTED:', viruses);
      return {
        safe: false,
        viruses: viruses || ['Unknown virus']
      };
    }

    return { safe: true, viruses: [] };
  } catch (error) {
    logger.error('Virus scan error:', error);

    // In production, fail secure (assume infected if scan fails)
    if (process.env.NODE_ENV === 'production') {
      return {
        safe: false,
        viruses: ['Scan failed - rejected for security']
      };
    }

    // In development, allow through
    return { safe: true, viruses: [] };
  }
}

module.exports = {
  scanBuffer,
  initializeScanner
};
```

### Step 4: Integrate into Upload Route
Update `apps/api/routes/storage.routes.js`:

```javascript
const { scanBuffer } = require('../utils/virusScanner');

// In file upload handler, after reading buffer:
const buffer = Buffer.concat(chunks);

// 🆕 SCAN FOR VIRUSES
logger.info('🔍 Scanning file for viruses...');
const scanResult = await scanBuffer(buffer);

if (!scanResult.safe) {
  logger.warn(`🦠 VIRUS DETECTED in upload: ${scanResult.viruses.join(', ')}`);
  return reply.status(400).send({
    error: 'Malware detected',
    message: `File contains malicious content: ${scanResult.viruses.join(', ')}`,
    viruses: scanResult.viruses
  });
}

logger.info('✅ File scan passed - no threats detected');
```

### Step 5: Environment Variables
Add to `.env`:
```env
CLAMAV_HOST=localhost
CLAMAV_PORT=3310
VIRUS_SCAN_ENABLED=true
```

### Step 6: Production Deployment (Cloud Option)
For cloud deployments without ClamAV daemon, use a cloud service:

**Option A: CloudAV (AWS-based)**
```bash
npm install @cloudav/scan
```

**Option B: VirusTotal API**
```bash
npm install virustotal-api
```

**Option C: Self-hosted ClamAV Docker**
```yaml
# docker-compose.yml
services:
  clamav:
    image: clamav/clamav:latest
    ports:
      - "3310:3310"
    volumes:
      - clamav-data:/var/lib/clamav
    healthcheck:
      test: ["CMD", "/usr/local/bin/clamdcheck.sh"]
      interval: 60s
      retries: 3
      start_period: 300s
```

### Step 7: Monitoring & Alerts
```javascript
// Add metrics
if (!scanResult.safe) {
  // Send alert to Sentry/DataDog
  logger.error('SECURITY: Virus upload attempt', {
    userId,
    fileName,
    viruses: scanResult.viruses,
    ipAddress: request.ip
  });

  // Optional: Ban user after multiple attempts
  await trackMaliciousUpload(userId);
}
```

### Step 8: Testing
```javascript
// Test with EICAR test file (industry standard test virus)
const eicarTestString = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

test('should detect virus in upload', async () => {
  const response = await request(app)
    .post('/api/storage/files/upload')
    .attach('file', Buffer.from(eicarTestString), 'test.txt');

  expect(response.status).toBe(400);
  expect(response.body.error).toContain('Malware detected');
});
```

## Estimated Implementation Time
- Setup: 1-2 hours
- Integration: 2-3 hours
- Testing: 1-2 hours
- **Total: 4-7 hours**

## Cost Estimate
- Self-hosted ClamAV: Free (open source)
- Cloud services: $50-200/month depending on volume
- Computational overhead: ~500ms per file scan
