const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const HOURS = 60 * 60 * 1000;
const DAYS = 24 * HOURS;

const cacheConfig = {
  redisEnabled: Boolean(process.env.REDIS_URL),
  redisUrl: process.env.REDIS_URL || null,
  redisTls: process.env.REDIS_TLS === '1' || process.env.REDIS_TLS === 'true',
  redisKeyPrefix: process.env.CACHE_KEY_PREFIX || 'rolerabbit',
  redisLazyConnect: process.env.REDIS_LAZY_CONNECT !== 'false',
  redisReconnectIntervalMs: parseNumber(process.env.REDIS_RECONNECT_INTERVAL_MS, 5 * 1000),
  defaultTtlMs: parseNumber(process.env.CACHE_DEFAULT_TTL_MS, 5 * 60 * 1000),
  resumeParseTtlMs: parseNumber(process.env.CACHE_RESUME_PARSE_TTL_MS, 30 * DAYS),
  jobAnalysisTtlMs: parseNumber(process.env.CACHE_JOB_ANALYSIS_TTL_MS, 24 * HOURS),
  atsScoreTtlMs: parseNumber(process.env.CACHE_ATS_SCORE_TTL_MS, 6 * HOURS),
  aiDraftTtlMs: parseNumber(process.env.CACHE_AI_DRAFT_TTL_MS, 2 * HOURS),
  lruMaxItems: parseNumber(process.env.CACHE_LRU_MAX_ITEMS, 1000),
  lruDefaultTtlMs: parseNumber(process.env.CACHE_LRU_TTL_MS, 10 * 60 * 1000)
};

module.exports = cacheConfig;
