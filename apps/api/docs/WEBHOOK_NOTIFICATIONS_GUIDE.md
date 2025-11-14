# Webhook Notifications Guide

**Created:** November 14, 2024  
**Status:** ✅ Production Ready  
**Version:** 1.0

---

## Overview

The Webhook Notifications system allows users to receive real-time HTTP callbacks when long-running operations complete (resume parsing, ATS checks, tailoring). This enables integration with external systems, automation workflows, and custom notifications.

---

## Features

### ✅ Implemented

- **Automatic Retry Logic** - 3 attempts with exponential backoff (1s, 5s, 15s)
- **HMAC Signature Verification** - Secure payload signing with SHA-256
- **Event Filtering** - Users can enable/disable specific event types
- **Delivery Logs** - Complete history of webhook deliveries
- **Test Endpoint** - Send test webhooks to verify configuration
- **Statistics Dashboard** - Success rates, failure tracking, average attempts
- **Secret Regeneration** - Rotate webhook secrets for security

### 🎯 Supported Events

1. **`resume.parsed`** - Resume parsing completed successfully
2. **`resume.parse_failed`** - Resume parsing failed
3. **`ats.check_completed`** - ATS analysis completed
4. **`ats.check_failed`** - ATS analysis failed
5. **`tailoring.completed`** - Resume tailoring completed
6. **`tailoring.failed`** - Resume tailoring failed
7. **`operation.cancelled`** - User cancelled an operation

---

## Setup

### 1. Database Migration

Run the Prisma migration to create webhook tables:

```bash
cd apps/api
npx prisma migrate dev --name add_webhook_tables
```

This creates:
- `webhook_configs` - User webhook configurations
- `webhook_logs` - Delivery history and logs

### 2. Environment Variables

No additional environment variables required. The system uses existing authentication.

---

## API Endpoints

### User Endpoints

#### 1. Get Webhook Configuration

```http
GET /api/webhooks/config
Authorization: Bearer <token>
```

**Response:**
```json
{
  "configured": true,
  "config": {
    "id": "clx...",
    "url": "https://your-app.com/webhooks",
    "enabled": true,
    "enabledEvents": [
      "resume.parsed",
      "ats.check_completed",
      "tailoring.completed"
    ],
    "createdAt": "2024-11-14T10:00:00Z",
    "updatedAt": "2024-11-14T10:00:00Z"
  },
  "availableEvents": [
    "resume.parsed",
    "resume.parse_failed",
    "ats.check_completed",
    "ats.check_failed",
    "tailoring.completed",
    "tailoring.failed",
    "operation.cancelled"
  ]
}
```

#### 2. Create/Update Webhook Configuration

```http
POST /api/webhooks/config
Authorization: Bearer <token>
Content-Type: application/json

{
  "url": "https://your-app.com/webhooks",
  "enabled": true,
  "enabledEvents": [
    "resume.parsed",
    "ats.check_completed",
    "tailoring.completed"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "config": {
    "id": "clx...",
    "url": "https://your-app.com/webhooks",
    "secret": "a1b2c3d4e5f6...",
    "enabled": true,
    "enabledEvents": ["resume.parsed", "ats.check_completed", "tailoring.completed"]
  },
  "message": "Webhook configuration saved successfully"
}
```

**Important:** Save the `secret` - you'll need it to verify webhook signatures!

#### 3. Test Webhook

```http
POST /api/webhooks/test
Authorization: Bearer <token>
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Test webhook sent successfully",
  "statusCode": 200,
  "deliveryId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "error": "Failed to deliver test webhook",
  "details": "connect ECONNREFUSED 127.0.0.1:3000",
  "statusCode": null,
  "deliveryId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### 4. Get Delivery Logs

```http
GET /api/webhooks/logs?limit=50&offset=0&event=resume.parsed&success=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (integer, 1-100, default: 50) - Number of logs to return
- `offset` (integer, default: 0) - Pagination offset
- `event` (string, optional) - Filter by event type
- `success` (boolean, optional) - Filter by success/failure

**Response:**
```json
{
  "logs": [
    {
      "id": "clx...",
      "event": "resume.parsed",
      "url": "https://your-app.com/webhooks",
      "success": true,
      "statusCode": 200,
      "attempts": 1,
      "error": null,
      "deliveryId": "550e8400-e29b-41d4-a716-446655440000",
      "deliveredAt": "2024-11-14T10:05:00Z",
      "createdAt": "2024-11-14T10:05:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

#### 5. Get Statistics

```http
GET /api/webhooks/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "total": 150,
  "successful": 145,
  "failed": 5,
  "successRate": "96.67",
  "averageAttempts": "1.08",
  "byEvent": {
    "resume.parsed": {
      "total": 50,
      "successful": 49,
      "failed": 1
    },
    "ats.check_completed": {
      "total": 60,
      "successful": 58,
      "failed": 2
    },
    "tailoring.completed": {
      "total": 40,
      "successful": 38,
      "failed": 2
    }
  }
}
```

#### 6. Regenerate Secret

```http
POST /api/webhooks/regenerate-secret
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook secret regenerated successfully",
  "secret": "new_secret_here_a1b2c3d4e5f6..."
}
```

**Warning:** After regenerating, update your webhook endpoint to use the new secret!

#### 7. Delete Configuration

```http
DELETE /api/webhooks/config
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook configuration deleted successfully"
}
```

---

## Webhook Payload Format

All webhooks follow this structure:

```json
{
  "event": "resume.parsed",
  "deliveryId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2024-11-14T10:05:00.000Z",
  "userId": "clx...",
  "data": {
    // Event-specific data
  }
}
```

### Event-Specific Data

#### `resume.parsed`
```json
{
  "resumeId": "clx...",
  "fileName": "john_doe_resume.pdf",
  "parsedAt": "2024-11-14T10:05:00Z",
  "success": true
}
```

#### `resume.parse_failed`
```json
{
  "fileName": "corrupted_file.pdf",
  "error": "Failed to extract text from PDF",
  "failedAt": "2024-11-14T10:05:00Z"
}
```

#### `ats.check_completed`
```json
{
  "resumeId": "clx...",
  "score": 85.5,
  "matchedKeywords": 12,
  "missingKeywords": 3,
  "completedAt": "2024-11-14T10:05:00Z"
}
```

#### `ats.check_failed`
```json
{
  "resumeId": "clx...",
  "error": "Failed to analyze job description",
  "failedAt": "2024-11-14T10:05:00Z"
}
```

#### `tailoring.completed`
```json
{
  "resumeId": "clx...",
  "jobTitle": "Senior Software Engineer",
  "mode": "PARTIAL",
  "atsScoreImprovement": 15.5,
  "completedAt": "2024-11-14T10:05:00Z"
}
```

#### `tailoring.failed`
```json
{
  "resumeId": "clx...",
  "error": "OpenAI API timeout",
  "failedAt": "2024-11-14T10:05:00Z"
}
```

#### `operation.cancelled`
```json
{
  "operationType": "tailoring",
  "operationId": "clx...",
  "cancelledAt": "2024-11-14T10:05:00Z"
}
```

---

## Webhook Headers

Every webhook request includes these headers:

```http
Content-Type: application/json
X-Webhook-Signature: a1b2c3d4e5f6...
X-Webhook-Event: resume.parsed
X-Webhook-Delivery-Id: 550e8400-e29b-41d4-a716-446655440000
User-Agent: RoleReady-Webhook/1.0
```

---

## Signature Verification

**IMPORTANT:** Always verify webhook signatures to ensure requests are from RoleReady!

### Node.js Example

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Express.js example
app.post('/webhooks', express.json(), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET; // Your webhook secret
  
  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  const { event, data } = req.body;
  console.log(`Received ${event}:`, data);
  
  res.status(200).send('OK');
});
```

### Python Example

```python
import hmac
import hashlib
import json

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        json.dumps(payload).encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

# Flask example
@app.route('/webhooks', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('X-Webhook-Signature')
    secret = os.environ['WEBHOOK_SECRET']
    
    if not verify_webhook_signature(request.json, signature, secret):
        return 'Invalid signature', 401
    
    # Process webhook
    event = request.json['event']
    data = request.json['data']
    print(f'Received {event}:', data)
    
    return 'OK', 200
```

---

## Retry Logic

If your webhook endpoint fails, RoleReady will automatically retry:

- **Attempt 1:** Immediate
- **Attempt 2:** After 1 second
- **Attempt 3:** After 5 seconds
- **Attempt 4:** After 15 seconds (final)

**Success Criteria:**
- HTTP status code 200-299
- Response received within 10 seconds

**Failure Scenarios:**
- HTTP status code 400-599
- Timeout (>10 seconds)
- Network error (connection refused, DNS failure, etc.)

---

## Integration Examples

### 1. Slack Notifications

```javascript
// Webhook endpoint that forwards to Slack
app.post('/webhooks', async (req, res) => {
  const { event, data } = req.body;
  
  let message = '';
  
  switch (event) {
    case 'resume.parsed':
      message = `✅ Resume parsed: ${data.fileName}`;
      break;
    case 'ats.check_completed':
      message = `📊 ATS Score: ${data.score}% (${data.matchedKeywords} keywords matched)`;
      break;
    case 'tailoring.completed':
      message = `🎯 Resume tailored for ${data.jobTitle} (+${data.atsScoreImprovement}% ATS score)`;
      break;
  }
  
  await axios.post(process.env.SLACK_WEBHOOK_URL, {
    text: message
  });
  
  res.status(200).send('OK');
});
```

### 2. Email Notifications

```javascript
const nodemailer = require('nodemailer');

app.post('/webhooks', async (req, res) => {
  const { event, data, userId } = req.body;
  
  if (event === 'tailoring.completed') {
    const user = await getUserById(userId);
    
    await transporter.sendMail({
      to: user.email,
      subject: 'Your Resume is Ready!',
      html: `
        <h2>Resume Tailored Successfully</h2>
        <p>Your resume has been tailored for <strong>${data.jobTitle}</strong></p>
        <p>ATS Score Improvement: <strong>+${data.atsScoreImprovement}%</strong></p>
        <a href="https://app.roleready.com/dashboard">View Resume</a>
      `
    });
  }
  
  res.status(200).send('OK');
});
```

### 3. Database Logging

```javascript
app.post('/webhooks', async (req, res) => {
  const { event, data, userId, timestamp } = req.body;
  
  await db.webhookEvents.create({
    userId,
    event,
    data: JSON.stringify(data),
    receivedAt: new Date(timestamp)
  });
  
  res.status(200).send('OK');
});
```

---

## Testing

### 1. Using the Test Endpoint

```bash
curl -X POST https://api.roleready.com/api/webhooks/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Using webhook.site

1. Go to https://webhook.site
2. Copy the unique URL
3. Configure it as your webhook URL in RoleReady
4. Use the test endpoint
5. View the received webhook in webhook.site

### 3. Local Testing with ngrok

```bash
# Start ngrok
ngrok http 3000

# Use the ngrok URL as your webhook URL
# Example: https://abc123.ngrok.io/webhooks
```

---

## Best Practices

### 1. **Always Verify Signatures**
Never trust webhook payloads without signature verification.

### 2. **Respond Quickly**
Return `200 OK` immediately, then process the webhook asynchronously.

```javascript
app.post('/webhooks', async (req, res) => {
  // Verify signature
  if (!verifySignature(req.body, req.headers['x-webhook-signature'])) {
    return res.status(401).send('Invalid signature');
  }
  
  // Respond immediately
  res.status(200).send('OK');
  
  // Process asynchronously
  processWebhookAsync(req.body).catch(console.error);
});
```

### 3. **Handle Idempotency**
Use `deliveryId` to prevent processing duplicate webhooks.

```javascript
const processedDeliveries = new Set();

function processWebhook(webhook) {
  if (processedDeliveries.has(webhook.deliveryId)) {
    console.log('Duplicate webhook, skipping');
    return;
  }
  
  processedDeliveries.add(webhook.deliveryId);
  // Process webhook...
}
```

### 4. **Monitor Failures**
Check webhook logs regularly for delivery failures.

### 5. **Rotate Secrets Periodically**
Regenerate webhook secrets every 90 days for security.

---

## Troubleshooting

### Webhooks Not Received

1. **Check Configuration**
   ```bash
   curl https://api.roleready.com/api/webhooks/config \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Test Webhook**
   ```bash
   curl -X POST https://api.roleready.com/api/webhooks/test \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Check Logs**
   ```bash
   curl https://api.roleready.com/api/webhooks/logs?success=false \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Signature Verification Fails

- Ensure you're using the correct secret
- Verify you're hashing the entire JSON payload (not formatted)
- Check for character encoding issues

### Timeout Errors

- Ensure your endpoint responds within 10 seconds
- Return `200 OK` immediately, process asynchronously

---

## Security Considerations

1. **HTTPS Only** - Webhook URLs must use HTTPS in production
2. **Signature Verification** - Always verify `X-Webhook-Signature`
3. **Secret Rotation** - Regenerate secrets periodically
4. **IP Whitelisting** - Consider whitelisting RoleReady's IP addresses
5. **Rate Limiting** - Implement rate limiting on your webhook endpoint

---

## Limits

- **Timeout:** 10 seconds per attempt
- **Max Retries:** 3 attempts
- **Max URL Length:** 2048 characters
- **Max Events:** All 7 event types can be enabled
- **Log Retention:** 90 days

---

## Support

For issues or questions:
- Check webhook logs: `GET /api/webhooks/logs`
- Test your endpoint: `POST /api/webhooks/test`
- Contact support: support@roleready.com

---

**Last Updated:** November 14, 2024

