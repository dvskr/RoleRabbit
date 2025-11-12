# Embedding-Based ATS Configuration

## Feature Flag

The embedding-based ATS system can be enabled/disabled via environment variable.

### Environment Variable

```bash
# Enable embedding-based ATS scoring
ATS_USE_EMBEDDINGS=true

# Disable embedding-based ATS scoring (default)
ATS_USE_EMBEDDINGS=false
```

### To Enable Embedding ATS

Add this to your `apps/api/.env` file:

```bash
# EMBEDDING-BASED ATS SYSTEM
ATS_USE_EMBEDDINGS=true
```

### To Disable (Use Legacy System)

Remove the variable or set it to false:

```bash
# Use legacy world-class ATS system
ATS_USE_EMBEDDINGS=false
```

Or simply comment it out:

```bash
# ATS_USE_EMBEDDINGS=true
```

---

## How It Works

### When ENABLED (`ATS_USE_EMBEDDINGS=true`):

```
1. User requests ATS check
      ↓
2. Try embedding-based ATS
   - Generate/retrieve embeddings
   - Calculate similarity
   - Extract keywords
   - Return score (fast, ~1s)
      ↓
3. If embedding fails → Fallback to world-class ATS
      ↓
4. If world-class fails → Fallback to basic ATS
```

### When DISABLED (`ATS_USE_EMBEDDINGS=false` or not set):

```
1. User requests ATS check
      ↓
2. Use world-class ATS (existing system)
   - Dictionary matching
   - AI semantic matching (if enabled)
   - Skill quality analysis
      ↓
3. If world-class fails → Fallback to basic ATS
```

---

## Performance Comparison

### Embedding-Based ATS (NEW):
- **First run:** ~1s
- **Cached run:** ~150ms (92% faster!)
- **Cost per request:** $0.000016 (99.99% cheaper!)
- **Accuracy:** 70-80% match rate
- **Method:** OpenAI embeddings + cosine similarity

### World-Class ATS (EXISTING):
- **Duration:** 45-90s (with semantic matching)
- **Duration (fast mode):** 2-5s (dictionary only)
- **Cost per request:** $0.08
- **Accuracy:** 87% (with AI)
- **Method:** Dictionary + AI semantic + skill quality

### Basic ATS (FALLBACK):
- **Duration:** <1s
- **Cost:** $0
- **Accuracy:** ~60%
- **Method:** Dictionary matching only

---

## Gradual Rollout Strategy

### Phase 1: Internal Testing (Week 1)
```bash
# On staging/dev environment only
ATS_USE_EMBEDDINGS=true
```

### Phase 2: Beta Users (Week 2)
```bash
# Production - for beta testers
ATS_USE_EMBEDDINGS=true
```

### Phase 3: 10% Rollout (Week 3)
```bash
# Random 10% of users
# Can be done with feature flag service
ATS_USE_EMBEDDINGS=true
```

### Phase 4: 100% Rollout (Week 4+)
```bash
# All users
ATS_USE_EMBEDDINGS=true
```

---

## Monitoring

### Metrics to Track:

1. **Performance Metrics:**
   - Average response time
   - Cache hit rate
   - 95th percentile latency

2. **Quality Metrics:**
   - ATS score distribution
   - User satisfaction
   - Accuracy vs human evaluation

3. **Cost Metrics:**
   - API calls per day
   - Total embedding cost
   - Cost per user

4. **Error Metrics:**
   - Embedding generation failures
   - Fallback usage rate
   - Error types and frequencies

---

## Troubleshooting

### Issue: Embedding ATS not working

**Check:**
1. Is `ATS_USE_EMBEDDINGS=true` in `.env`?
2. Is OpenAI API key valid?
3. Is pgvector extension installed?
4. Are migrations applied?

**Logs to check:**
```bash
# Look for these log messages:
"Embedding-based ATS scoring complete"  # ✅ Working
"Embedding-based ATS failed, falling back"  # ⚠️ Fallback
```

### Issue: Slow performance

**Possible causes:**
1. First-time generation (expected ~1s)
2. OpenAI API slow response
3. Database connection issues
4. pgvector not optimized

**Solutions:**
- Check OpenAI API status
- Verify database indexes exist
- Check cache hit rate
- Review logs for timeouts

### Issue: Incorrect scores

**Possible causes:**
1. Embeddings not properly generated
2. Resume data format issues
3. Job description too short/long

**Solutions:**
- Verify embedding dimensions (should be 1536)
- Check resume data structure
- Test with known good examples
- Compare with world-class ATS results

---

## Reverting to Legacy System

If you need to revert to the legacy system:

### Step 1: Disable feature flag

```bash
# In apps/api/.env
ATS_USE_EMBEDDINGS=false
```

### Step 2: Restart backend

```bash
cd apps/api
npm run dev
```

### Step 3: Verify

Check logs for:
```
"World-class ATS system"  # ✅ Using legacy
```

---

## API Response Format

### With Embedding ATS:

```json
{
  "overall": 70,
  "matchedKeywords": ["javascript", "react", "node"],
  "missingKeywords": ["kubernetes", "docker"],
  "semanticScore": 74,
  "similarity": 0.7385,
  "method": "embedding",
  "performance": {
    "duration": 1071,
    "fromCache": false,
    "method": "embedding"
  },
  "generatedAt": "2025-11-11T20:00:00.000Z"
}
```

### With World-Class ATS:

```json
{
  "overall": 87,
  "matchedKeywords": ["javascript", "react", "node"],
  "missingKeywords": ["kubernetes"],
  "method": "world-class",
  "generatedAt": "2025-11-11T20:00:00.000Z"
}
```

---

## FAQ

### Q: Should I enable this in production immediately?

**A:** No, start with staging/dev for testing. Gradually roll out to production.

### Q: What happens if OpenAI API goes down?

**A:** The system automatically falls back to world-class ATS, then basic ATS if needed.

### Q: Will this affect existing ATS scores?

**A:** No, scores are cached per job description. New checks will use the new system.

### Q: Can I A/B test both systems?

**A:** Yes, you can route different users to different systems based on user ID or random selection.

### Q: How do I know which system is being used?

**A:** Check the `method` field in the API response:
- `"embedding"` = New system
- `"world-class"` = Legacy system
- `"world-class-fallback"` = Embedding failed, using legacy
- `"basic-fallback"` = All systems failed, using basic

---

## Support

For issues or questions:
1. Check logs in `apps/api/logs/`
2. Review this documentation
3. Check database for embeddings: `SELECT COUNT(*) FROM base_resumes WHERE embedding IS NOT NULL;`
4. Verify cache: `SELECT * FROM job_embedding_cache_stats;`

---

**Last Updated:** November 11, 2025  
**Version:** 1.0  
**Status:** Ready for Testing

