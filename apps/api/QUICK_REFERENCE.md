# Backend Validation & Error Handling - Quick Reference

## 🚀 Quick Start

### 1. Add Validation to Route

```javascript
const { validateRequest, CreateResumePayloadSchema } = require('./schemas/resumeData.schema');
const { asyncHandler } = require('./utils/errorHandler');

router.post('/resumes',
  validateRequest(CreateResumePayloadSchema),
  asyncHandler(async (req, res) => {
    // req.validatedBody contains validated data
    const resume = await createResume(req.validatedBody);
    res.json({ success: true, resume });
  })
);
```

### 2. Send Error Response

```javascript
const { sendErrorResponse, ErrorCodes } = require('./utils/errorHandler');

if (!resume) {
  return sendErrorResponse(res, ErrorCodes.RESUME_NOT_FOUND);
}

// With custom message
return sendErrorResponse(
  res,
  ErrorCodes.VALIDATION_ERROR,
  'Invalid email format',
  { field: 'contact.email' }
);
```

### 3. Retry Database Operation

```javascript
const { retryDatabaseOperation } = require('./utils/retryHandler');

const resume = await retryDatabaseOperation(
  async () => await prisma.resume.findUnique({ where: { id } })
);
```

### 4. Retry LLM Operation

```javascript
const { retryLLMOperation } = require('./utils/retryHandler');

const result = await retryLLMOperation(
  async () => await openai.createCompletion(...)
);
```

### 5. Use Circuit Breaker

```javascript
const { executeWithOpenAIBreaker } = require('./utils/circuitBreaker');

const result = await executeWithOpenAIBreaker(
  async () => await openai.createCompletion(...),
  async () => getCachedResult() // Fallback
);
```

### 6. Handle Cache Errors Gracefully

```javascript
const { handleCacheError } = require('./utils/errorHandler');

try {
  await redis.set(key, value);
} catch (error) {
  handleCacheError(error, 'set cache');
  // Continue without caching
}
```

### 7. Add to Dead Letter Queue

```javascript
const { DeadLetterQueue } = require('./utils/deadLetterQueue');
const dlq = new DeadLetterQueue(prisma);

await dlq.add({
  userId: user.id,
  resumeId: resume.id,
  operationType: 'RESUME_TAILORING',
  payload: { jobDescription, resumeData },
  error: error,
  attemptCount: 3
});
```

### 8. Handle Partial Success

```javascript
const { PartialSuccessHandler } = require('./utils/deadLetterQueue');

const result = await PartialSuccessHandler.handlePartialTailoring(
  resumeData,
  completedSections,
  failedSections
);
```

---

## 📋 Available Schemas

### Resume Schemas
- `CreateResumePayloadSchema` - For POST /resumes
- `UpdateResumePayloadSchema` - For PUT /resumes/:id
- `ExportResumePayloadSchema` - For POST /resumes/:id/export
- `ResumeDataSchema` - Full resume data structure
- `ResumeFormattingSchema` - Formatting options
- `ResumeMetadataSchema` - Resume metadata

### Component Schemas
- `ContactSchema` - Contact information
- `ExperienceItemSchema` - Work experience
- `EducationItemSchema` - Education entry
- `ProjectItemSchema` - Project entry
- `CertificationItemSchema` - Certification entry
- `SkillsSchema` - Skills section
- `CustomSectionSchema` - Custom section
- `FileHashSchema` - SHA-256 file hash

---

## 🎯 Error Codes

### Resume Errors (404, 500)
- `RESUME_NOT_FOUND`
- `RESUME_CREATION_FAILED`
- `RESUME_UPDATE_FAILED`
- `RESUME_DELETE_FAILED`

### Validation Errors (400)
- `VALIDATION_ERROR`
- `INVALID_TEMPLATE_ID`
- `INVALID_FILE_HASH`
- `INVALID_DATE_FORMAT`
- `DUPLICATE_SECTION_NAMES`

### Limit Errors (403)
- `SLOT_LIMIT_REACHED`
- `MAX_RESUMES_REACHED`

### Service Errors (500, 503, 429)
- `AI_SERVICE_ERROR`
- `AI_SERVICE_UNAVAILABLE`
- `AI_RATE_LIMIT`
- `DATABASE_ERROR`
- `CONNECTION_ERROR`
- `CACHE_ERROR`

---

## 🔧 Utility Functions

### Error Handler (`utils/errorHandler.js`)
- `sendErrorResponse(res, code, message, details)`
- `handleZodError(res, error)`
- `handleDatabaseError(res, error, operation)`
- `handleAIServiceError(res, error)`
- `handleCacheError(error, operation)`
- `asyncHandler(fn)` - Wrap async routes
- `validateRequest(schema)` - Middleware

### Retry Handler (`utils/retryHandler.js`)
- `retryWithBackoff(fn, options)`
- `retryDatabaseOperation(fn, options)`
- `retryLLMOperation(fn, options)`
- `retryWithJitter(fn, options)`
- `retryBatch(operations, options)`

### Circuit Breaker (`utils/circuitBreaker.js`)
- `executeWithOpenAIBreaker(fn, fallback)`
- `executeWithDatabaseBreaker(fn, fallback)`
- `executeWithRedisBreaker(fn, fallback)`
- `circuitBreakerManager.getBreaker(name, options)`
- `circuitBreakerManager.getAllStates()`
- `circuitBreakerManager.reset(name)`

### Dead Letter Queue (`utils/deadLetterQueue.js`)
- `dlq.add(operation)`
- `dlq.getPending(limit)`
- `dlq.retry(entryId, retryFn)`
- `dlq.retryAll(retryFnMap)`
- `dlq.cancel(entryId, reason)`
- `dlq.getStats()`
- `dlq.cleanup(daysOld)`
- `PartialSuccessHandler.handlePartialTailoring(...)`

### Validation Functions (`schemas/resumeData.schema.js`)
- `validateCustomSectionNames(customSections)`
- `validateDate(dateString)`
- `validateTemplateId(templateId)`

---

## 📊 Configuration Options

### Retry Options
```javascript
{
  maxRetries: 3,              // Number of retries
  initialDelay: 1000,         // Initial delay (ms)
  maxDelay: 30000,            // Max delay (ms)
  backoffMultiplier: 2,       // Backoff multiplier
  onRetry: (error, attempt, delay) => {},
  shouldRetry: (error) => boolean
}
```

### Circuit Breaker Options
```javascript
{
  name: 'service-name',
  failureThreshold: 5,        // Failures before opening
  successThreshold: 2,        // Successes to close
  timeout: 60000,             // Cooldown period (ms)
  monitoringPeriod: 120000    // Failure tracking period (ms)
}
```

### DLQ Operation Types
- `DLQOperationType.ATS_ANALYSIS`
- `DLQOperationType.RESUME_TAILORING`
- `DLQOperationType.COVER_LETTER`
- `DLQOperationType.PORTFOLIO_GENERATION`
- `DLQOperationType.AI_CONTENT_GENERATION`

---

## 🎨 Response Formats

### Success Response
```json
{
  "success": true,
  "resume": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "User-friendly message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Partial Success Response
```json
{
  "success": "partial",
  "data": { ... },
  "completedSections": ["summary", "experience"],
  "failedSections": ["projects"],
  "warning": "Operation partially completed. 1 step failed."
}
```

---

## 🧪 Testing

### Test Validation
```javascript
const { CreateResumePayloadSchema } = require('./schemas/resumeData.schema');

// Valid data
const result = CreateResumePayloadSchema.safeParse(validData);
expect(result.success).toBe(true);

// Invalid data
const result = CreateResumePayloadSchema.safeParse(invalidData);
expect(result.success).toBe(false);
expect(result.error.errors).toHaveLength(1);
```

### Test Error Handler
```javascript
const { sendErrorResponse, ErrorCodes } = require('./utils/errorHandler');

sendErrorResponse(mockRes, ErrorCodes.RESUME_NOT_FOUND);
expect(mockRes.status).toHaveBeenCalledWith(404);
expect(mockRes.json).toHaveBeenCalledWith({
  success: false,
  error: expect.any(String),
  code: 'RESUME_NOT_FOUND',
  details: {}
});
```

### Test Circuit Breaker
```javascript
const { CircuitBreaker } = require('./utils/circuitBreaker');

const breaker = new CircuitBreaker({ failureThreshold: 2 });

// Fail twice
await expect(breaker.execute(failingFn)).rejects.toThrow();
await expect(breaker.execute(failingFn)).rejects.toThrow();

// Circuit should be open
expect(breaker.getState().state).toBe('OPEN');
```

---

## 📝 Common Patterns

### Pattern 1: CRUD with Validation
```javascript
router.post('/resumes',
  validateRequest(CreateResumePayloadSchema),
  asyncHandler(async (req, res) => {
    const resume = await retryDatabaseOperation(
      async () => await prisma.resume.create({ data: req.validatedBody })
    );
    res.json({ success: true, resume });
  })
);
```

### Pattern 2: AI Operation with Full Protection
```javascript
router.post('/resumes/:id/analyze',
  asyncHandler(async (req, res) => {
    try {
      const result = await executeWithOpenAIBreaker(
        async () => await retryLLMOperation(
          async () => await analyzeResume(resumeData)
        ),
        async () => getCachedAnalysis(id)
      );
      res.json({ success: true, result });
    } catch (error) {
      await dlq.add({ userId, resumeId: id, operationType: 'ATS_ANALYSIS', payload, error });
      return handleAIServiceError(res, error);
    }
  })
);
```

### Pattern 3: Graceful Cache Handling
```javascript
try {
  await executeWithRedisBreaker(
    async () => await redis.set(key, value)
  );
} catch (error) {
  handleCacheError(error, 'cache operation');
  // Continue without caching
}
```

---

## 🔗 File Locations

- **Schemas:** `apps/api/schemas/resumeData.schema.js`
- **Error Handler:** `apps/api/utils/errorHandler.js`
- **Retry Handler:** `apps/api/utils/retryHandler.js`
- **Circuit Breaker:** `apps/api/utils/circuitBreaker.js`
- **Dead Letter Queue:** `apps/api/utils/deadLetterQueue.js`
- **Integration Example:** `apps/api/INTEGRATION_EXAMPLE.js`

---

## 💡 Tips

1. **Always use `asyncHandler`** for async routes
2. **Always validate** user input with Zod schemas
3. **Always retry** database operations
4. **Always use circuit breakers** for external services
5. **Always handle cache failures** gracefully
6. **Never expose** raw error details to users
7. **Always log** errors server-side
8. **Use DLQ** for critical operations that can't fail silently

---

**For complete examples, see:** `apps/api/INTEGRATION_EXAMPLE.js`  
**For full documentation, see:** `SECTIONS_2.2_AND_2.3_COMPLETE.md`

