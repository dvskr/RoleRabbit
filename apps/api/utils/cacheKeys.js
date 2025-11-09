const KEY_SEPARATOR = '::';

const CACHE_NAMESPACES = Object.freeze({
  RESUME_PARSE: 'resume:parse',
  JOB_ANALYSIS: 'job:analysis',
  ATS_SCORE: 'ats:score',
  AI_DRAFT: 'ai:draft'
});

function normalizeParts(parts) {
  if (!parts) return [];
  if (Array.isArray(parts)) {
    return parts
      .filter((part) => part !== undefined && part !== null)
      .map((part) => String(part));
  }
  return [String(parts)];
}

function buildCacheKey(namespace, parts = []) {
  if (!namespace) {
    throw new Error('Cache namespace is required to build a cache key');
  }
  const normalized = normalizeParts(parts);
  if (!normalized.length) {
    return namespace;
  }
  return `${namespace}${KEY_SEPARATOR}${normalized.join(KEY_SEPARATOR)}`;
}

function userScopedKey(namespace, userId, parts = []) {
  if (!userId) {
    throw new Error('userId is required for user scoped cache keys');
  }
  return buildCacheKey(namespace, [userId, ...normalizeParts(parts)]);
}

function baseResumeScopedKey(userId, baseResumeId, parts = []) {
  if (!userId || !baseResumeId) {
    throw new Error('Both userId and baseResumeId are required for base resume scoped cache keys');
  }
  return buildCacheKey(CACHE_NAMESPACES.AI_DRAFT, [userId, baseResumeId, ...normalizeParts(parts)]);
}

module.exports = {
  CACHE_NAMESPACES,
  KEY_SEPARATOR,
  buildCacheKey,
  userScopedKey,
  baseResumeScopedKey
};
