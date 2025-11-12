# AI Auto Apply - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Add Credentials

```bash
curl -X POST http://localhost:3000/api/job-board/credentials \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "LINKEDIN",
    "email": "your@email.com",
    "password": "your_password"
  }'
```

### Step 2: Apply to a Job

```bash
curl -X POST http://localhost:3000/api/job-board/linkedin/easy-apply \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "credentialId": "CREDENTIAL_ID_FROM_STEP_1",
    "jobUrl": "https://www.linkedin.com/jobs/view/1234567890",
    "jobTitle": "Software Engineer",
    "company": "Tech Corp",
    "userData": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "555-0123"
    }
  }'
```

### Step 3: Check Application Status

```bash
curl -X GET http://localhost:3000/api/job-board/applications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📋 Common Tasks

### Apply to Multiple Jobs

```bash
curl -X POST http://localhost:3000/api/ai-agent/apply-to-jobs-bulk \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "applications": [
      {
        "jobUrl": "https://linkedin.com/jobs/view/1",
        "platform": "LINKEDIN",
        "credentialId": "YOUR_CRED_ID",
        "jobTitle": "Engineer",
        "company": "Company A"
      },
      {
        "jobUrl": "https://indeed.com/viewjob?jk=2",
        "platform": "INDEED",
        "credentialId": "YOUR_CRED_ID",
        "jobTitle": "Developer",
        "company": "Company B"
      }
    ]
  }'
```

### Get Application Statistics

```bash
curl -X GET http://localhost:3000/api/job-board/applications/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Credentials

```bash
curl -X POST http://localhost:3000/api/job-board/linkedin/test-credential \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"credentialId": "YOUR_CRED_ID"}'
```

---

## 🎯 Supported Platforms

| Platform | Status | Method |
|----------|--------|--------|
| LinkedIn | ✅ Ready | Easy Apply |
| Indeed | ✅ Ready | Quick Apply |
| Glassdoor | 🔜 Coming Soon | - |
| ZipRecruiter | 🔜 Coming Soon | - |

---

## ⚡ API Endpoints Summary

### Credentials
- `POST /api/job-board/credentials` - Add credential
- `GET /api/job-board/credentials` - List credentials
- `PUT /api/job-board/credentials/:id` - Update credential
- `DELETE /api/job-board/credentials/:id` - Delete credential
- `POST /api/job-board/credentials/:id/verify` - Test credential

### Applications
- `POST /api/job-board/linkedin/easy-apply` - Apply to LinkedIn job
- `POST /api/job-board/indeed/quick-apply` - Apply to Indeed job
- `GET /api/job-board/applications` - List applications
- `GET /api/job-board/applications/stats` - Get statistics

### Bulk Operations
- `POST /api/ai-agent/apply-to-jobs-bulk` - Apply to multiple jobs
- `POST /api/ai-agent/scrape-jobs-bulk` - Scrape multiple job URLs

---

## 🔑 Environment Setup

```env
DATABASE_URL=postgresql://user:password@localhost:5432/rolerabbit
JOB_BOARD_ENCRYPTION_KEY=your_32_byte_hex_key
SESSION_ENCRYPTION_KEY=your_32_byte_hex_key
JWT_SECRET=your_jwt_secret
```

Generate encryption keys:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📊 Response Examples

### Successful Application
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "id": "app_xyz123",
    "status": "SUBMITTED",
    "appliedAt": "2025-11-11T12:00:00Z"
  },
  "automationResult": {
    "success": true,
    "verified": true,
    "steps": 3
  }
}
```

### Application Statistics
```json
{
  "success": true,
  "stats": {
    "total": 50,
    "recentApplications": 10,
    "averageAtsScore": 85,
    "byStatus": {
      "SUBMITTED": 30,
      "INTERVIEWING": 5,
      "OFFERED": 2
    },
    "byPlatform": {
      "LINKEDIN": 30,
      "INDEED": 20
    }
  }
}
```

---

## 🎨 Frontend Integration Example

```javascript
// React example
async function applyToJob(jobUrl, platform) {
  try {
    const response = await fetch(`/api/job-board/${platform.toLowerCase()}/easy-apply`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        credentialId: selectedCredential,
        jobUrl,
        jobTitle,
        company,
        userData: userProfile
      })
    });

    const result = await response.json();

    if (result.success) {
      toast.success('Application submitted!');
      refreshApplications();
    }
  } catch (error) {
    toast.error('Application failed');
  }
}
```

---

## 🐛 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| **401 Unauthorized** | Check your JWT token |
| **404 Credential Not Found** | Verify credential ID |
| **Login Failed** | Test credential first |
| **Easy Apply Not Available** | Job must support Easy/Quick Apply |
| **Rate Limit Error** | Wait 30-40 seconds between applications |

---

## 📈 Performance Tips

1. **Reuse Sessions**: Sessions last 30 days - no need to login every time
2. **Batch Processing**: Use bulk endpoints for multiple applications
3. **Rate Limiting**: Space out applications to avoid detection
4. **Monitor Stats**: Check success rates regularly
5. **Test Credentials**: Verify credentials before bulk operations

---

## 🎯 Best Practices

✅ Test credentials before using them
✅ Provide complete user data for better success rates
✅ Use bulk endpoint for multiple applications
✅ Monitor application statistics
✅ Space out applications (30-40s minimum)
✅ Keep credentials up to date
✅ Handle errors gracefully in your app

---

## 🔗 Related Documentation

- [Complete Documentation](./AI_AUTO_APPLY_DOCUMENTATION.md) - Full system documentation
- [Database Schema](./apps/api/prisma/schema.prisma) - Database models
- [API Routes](./apps/api/routes/jobBoard.routes.js) - Route implementations

---

## 🎉 Success Metrics

After setup, you should see:
- ✅ Applications completing in < 60 seconds
- ✅ Success rate > 85%
- ✅ Sessions persisting for 30 days
- ✅ Forms filling automatically
- ✅ Complete audit trail in database

---

**Need Help?** Check the [full documentation](./AI_AUTO_APPLY_DOCUMENTATION.md) or review server logs for detailed error messages.
