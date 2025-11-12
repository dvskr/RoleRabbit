const { prisma } = require('../../utils/db');
const cacheManager = require('../../utils/cacheManager');
const { CACHE_NAMESPACES } = require('../../utils/cacheKeys');
const cacheConfig = require('../../config/cacheConfig');
const { setAtPath } = require('../../utils/objectPath');
const logger = require('../../utils/logger');
const { normalizeResumeData } = require('@roleready/resume-normalizer');

const DEFAULT_DRAFT_TTL_MS = cacheConfig.aiDraftTtlMs || 15 * 60 * 1000;

function sanitizeDraft(draft) {
  if (!draft) return null;
  const { id, userId, baseResumeId, action, payload, metadata, expiresAt, createdAt, updatedAt } = draft;
  return { id, userId, baseResumeId, action, payload, metadata, expiresAt, createdAt, updatedAt };
}

async function cacheDraft(draft, ttlMs) {
  try {
    await cacheManager.set(CACHE_NAMESPACES.AI_DRAFT, draft.id, sanitizeDraft(draft), {
      ttl: ttlMs ?? DEFAULT_DRAFT_TTL_MS
    });
  } catch (error) {
    logger.warn('Failed to cache AI draft', { error: error.message, draftId: draft.id });
  }
}

async function removeCachedDraft(draftId) {
  try {
    await cacheManager.del(CACHE_NAMESPACES.AI_DRAFT, draftId);
  } catch (error) {
    logger.warn('Failed to evict AI draft cache', { error: error.message, draftId });
  }
}

async function createDraft({ userId, baseResumeId, action, payload, metadata, ttlMs = DEFAULT_DRAFT_TTL_MS }) {
  const expiresAt = new Date(Date.now() + ttlMs);
  const draft = await prisma.aIDraft.create({
    data: {
      userId,
      baseResumeId,
      action,
      payload,
      metadata,
      expiresAt
    }
  });
  await cacheDraft(draft, ttlMs);
  return sanitizeDraft(draft);
}

async function getDraft(draftId) {
  const cached = await cacheManager.get(CACHE_NAMESPACES.AI_DRAFT, draftId);
  if (cached) {
    return cached;
  }

  const draft = await prisma.aIDraft.findUnique({ where: { id: draftId } });
  if (!draft) return null;
  if (draft.expiresAt <= new Date()) {
    await prisma.aIDraft.delete({ where: { id: draftId } }).catch(() => {});
    await removeCachedDraft(draftId);
    return null;
  }
  await cacheDraft(draft, draft.expiresAt.getTime() - Date.now());
  return sanitizeDraft(draft);
}

async function deleteDraft(draftId) {
  await prisma.aIDraft.delete({ where: { id: draftId } }).catch(() => {});
  await removeCachedDraft(draftId);
}

function applyPatchToResumeData(resumeData, patch) {
  if (!patch) {
    throw new Error('Draft payload missing patch');
  }
  const patches = Array.isArray(patch) ? patch : [patch];
  const clone = JSON.parse(JSON.stringify(resumeData || {}));
  for (const entry of patches) {
    if (!entry || !entry.path) {
      throw new Error('Draft patch entry missing path');
    }
    setAtPath(clone, entry.path, entry.value);
  }
  return clone;
}

async function applyDraft({ draftId, userId }) {
  const draft = await prisma.aIDraft.findUnique({ where: { id: draftId } });
  if (!draft) {
    throw new Error('Draft not found');
  }
  if (draft.userId !== userId) {
    throw new Error('You do not have permission to apply this draft');
  }
  if (draft.expiresAt <= new Date()) {
    await prisma.aIDraft.delete({ where: { id: draftId } }).catch(() => {});
    await removeCachedDraft(draftId);
    throw new Error('Draft has expired. Please regenerate content.');
  }

  const baseResume = await prisma.baseResume.findFirst({
    where: { id: draft.baseResumeId, userId },
    select: { id: true, data: true, metadata: true }
  });
  if (!baseResume) {
    throw new Error('Base resume not found');
  }

  const updatedData = applyPatchToResumeData(baseResume.data, draft.payload?.patch);
  const normalizedData = normalizeResumeData(updatedData);
  const updatedMetadata = draft.payload?.metadataPatch
    ? applyPatchToResumeData(baseResume.metadata || {}, draft.payload.metadataPatch)
    : baseResume.metadata;

  const updatedResume = await prisma.baseResume.update({
    where: { id: baseResume.id },
    data: {
      data: normalizedData,
      metadata: updatedMetadata ?? baseResume.metadata,
      lastAIAccessedAt: new Date()
    },
    select: { id: true, data: true, metadata: true, updatedAt: true }
  });

  await prisma.aIDraft.delete({ where: { id: draftId } }).catch(() => {});
  await removeCachedDraft(draftId);

  return {
    draft: sanitizeDraft(draft),
    updatedResume
  };
}

module.exports = {
  createDraft,
  getDraft,
  deleteDraft,
  applyDraft,
  applyPatchToResumeData
};
