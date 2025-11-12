const { prisma } = require('../utils/db');
const logger = require('../utils/logger');
const { Prisma } = require('@prisma/client');
const cacheManager = require('../utils/cacheManager');
const { CACHE_NAMESPACES } = require('../utils/cacheKeys');
const { normalizeResumeData } = require('@roleready/resume-normalizer');

const PLAN_LIMITS = {
  FREE: { maxSlots: 1 },
  PRO: { maxSlots: 5 },
  PREMIUM: { maxSlots: 5 }
};

function normalizeResumePayload(data) {
  if (data === undefined) {
    return undefined;
  }
  if (!data || typeof data !== 'object') {
    return {};
  }
  try {
    return normalizeResumeData(data);
  } catch (error) {
    logger.warn('Failed to normalize resume data before persistence', { error: error.message });
    return data;
  }
}

function getPlanLimits(user) {
  const tier = (user.subscriptionTier || 'FREE').toUpperCase();
  return PLAN_LIMITS[tier] || PLAN_LIMITS.FREE;
}

async function invalidateUserAIArtifacts(userId) {
  await Promise.all([
    cacheManager.invalidateNamespace(CACHE_NAMESPACES.JOB_ANALYSIS, [userId]),
    cacheManager.invalidateNamespace(CACHE_NAMESPACES.AI_DRAFT, [userId]),
    cacheManager.invalidateNamespace(CACHE_NAMESPACES.ATS_SCORE, [userId])
  ]);
}

async function invalidateBaseResumeArtifacts(userId, baseResumeId) {
  if (!baseResumeId) return;
  await Promise.all([
    cacheManager.invalidateNamespace(CACHE_NAMESPACES.JOB_ANALYSIS, [userId, baseResumeId]),
    cacheManager.invalidateNamespace(CACHE_NAMESPACES.AI_DRAFT, [userId, baseResumeId]),
    cacheManager.invalidateNamespace(CACHE_NAMESPACES.ATS_SCORE, [userId, baseResumeId])
  ]);
}

async function getBaseResume({ userId, baseResumeId }) {
  return prisma.baseResume.findFirst({
    where: { id: baseResumeId, userId },
    select: {
      id: true,
      userId: true,
      slotNumber: true,
      name: true,
      isActive: true,
      data: true,
      formatting: true,
      metadata: true,
      lastAIAccessedAt: true,
      parsingConfidence: true,
      createdAt: true,
      updatedAt: true,
      // Exclude embedding & embeddingUpdatedAt to avoid vector type issues
    }
  });
}

async function updateBaseResume({
  userId,
  baseResumeId,
  name,
  data,
  formatting,
  metadata,
  lastKnownServerUpdatedAt
}) {
  const resume = await prisma.baseResume.findFirst({
    where: { id: baseResumeId, userId },
    select: {
      id: true,
      updatedAt: true,
      // Exclude embedding to avoid vector type issues
    }
  });
  if (!resume) {
    const error = new Error('Base resume not found');
    error.code = 'BASE_RESUME_NOT_FOUND';
    throw error;
  }

  if (lastKnownServerUpdatedAt && resume.updatedAt) {
    const clientUpdatedAt = new Date(lastKnownServerUpdatedAt);
    if (!Number.isNaN(clientUpdatedAt.getTime()) && resume.updatedAt > clientUpdatedAt) {
      const conflictError = new Error('Resume has been updated on another device. Please refresh.');
      conflictError.code = 'RESUME_CONFLICT';
      throw conflictError;
    }
  }

  const preparedData = normalizeResumePayload(data);

  const updatedResume = await prisma.baseResume.update({
    where: { id: baseResumeId },
    data: {
      ...(name ? { name } : {}),
      ...(preparedData !== undefined ? { data: preparedData } : {}),
      ...(formatting !== undefined ? { formatting } : {}),
      ...(metadata !== undefined ? { metadata } : {}),
      lastAIAccessedAt: new Date()
    },
    select: {
      id: true,
      userId: true,
      slotNumber: true,
      name: true,
      isActive: true,
      data: true,
      formatting: true,
      metadata: true,
      lastAIAccessedAt: true,
      parsingConfidence: true,
      createdAt: true,
      updatedAt: true,
      // Exclude embedding to avoid vector type issues
    }
  });

  await invalidateBaseResumeArtifacts(userId, baseResumeId);

  return updatedResume;
}

async function ensureActiveResume(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { activeBaseResumeId: true }
  });

  if (user?.activeBaseResumeId) {
    return user.activeBaseResumeId;
  }

  const firstResume = await prisma.baseResume.findFirst({
    where: { userId },
    orderBy: { slotNumber: 'asc' },
    select: {
      id: true,
      // Exclude embedding to avoid vector type issues
    }
  });

  if (firstResume) {
    // Use raw SQL for ALL updates to completely avoid vector deserialization issues
    await prisma.$transaction([
      prisma.$executeRaw`UPDATE base_resumes SET "isActive" = true WHERE id = ${firstResume.id}`,
      prisma.$executeRaw`UPDATE users SET "activeBaseResumeId" = ${firstResume.id} WHERE id = ${userId}`
    ]);
    return firstResume.id;
  }

  return null;
}

async function listBaseResumes(userId) {
  const resumes = await prisma.baseResume.findMany({
    where: { userId },
    orderBy: { slotNumber: 'asc' },
    select: {
      id: true,
      slotNumber: true,
      name: true,
      isActive: true,
      data: true,
      formatting: true,
      metadata: true,
      updatedAt: true,
      createdAt: true
    }
  });

  return resumes;
}

async function findNextAvailableSlot(userId, maxSlots) {
  const slots = await prisma.baseResume.findMany({
    where: { userId },
    select: { slotNumber: true }
  });
  const used = new Set(slots.map((s) => s.slotNumber));
  for (let i = 1; i <= maxSlots; i++) {
    if (!used.has(i)) {
      return i;
    }
  }
  return null;
}

async function countBaseResumes(userId) {
  return prisma.baseResume.count({ where: { userId } });
}

async function createBaseResume({ userId, name, data, formatting, metadata }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionTier: true }
  });
  if (!user) {
    throw new Prisma.PrismaClientKnownRequestError('User not found', { code: 'P0001' });
  }

  const { maxSlots } = getPlanLimits(user);
  const currentCount = await countBaseResumes(userId);
  if (currentCount >= maxSlots) {
    const error = new Error('Base resume slot limit reached for current plan');
    error.code = 'SLOT_LIMIT_REACHED';
    error.meta = { maxSlots };
    throw error;
  }

  const slotNumber = await findNextAvailableSlot(userId, maxSlots);
  if (!slotNumber) {
    const error = new Error('No available slot found for new base resume');
    error.code = 'NO_SLOT_AVAILABLE';
    error.meta = { maxSlots };
    throw error;
  }

  const preparedData = normalizeResumePayload(data);

  const resume = await prisma.baseResume.create({
    data: {
      userId,
      slotNumber,
      name: name || `Resume ${slotNumber}`,
      data: preparedData ?? {},
      formatting: formatting || {},
      metadata: metadata || {}
    }
  });

  await ensureActiveResume(userId);

  return resume;
}

async function activateBaseResume({ userId, baseResumeId }) {
  const resume = await prisma.baseResume.findFirst({
    where: { id: baseResumeId, userId },
    select: {
      id: true,
      userId: true,
      name: true,
      isActive: true,
      // Exclude embedding column to avoid Prisma deserialization error with vector type
    }
  });
  if (!resume) {
    const error = new Error('Base resume not found');
    error.code = 'BASE_RESUME_NOT_FOUND';
    throw error;
  }

  // Use raw SQL for ALL updates to completely avoid vector deserialization issues
  await prisma.$transaction([
    prisma.$executeRaw`UPDATE base_resumes SET "isActive" = false WHERE "userId" = ${userId}`,
    prisma.$executeRaw`UPDATE base_resumes SET "isActive" = true WHERE id = ${baseResumeId}`,
    prisma.$executeRaw`UPDATE users SET "activeBaseResumeId" = ${baseResumeId} WHERE id = ${userId}`
  ]);

  await invalidateUserAIArtifacts(userId);

  return true;
}

async function deleteBaseResume({ userId, baseResumeId }) {
  const resume = await prisma.baseResume.findFirst({
    where: { id: baseResumeId, userId },
    select: {
      id: true,
      isActive: true,
      // Exclude embedding to avoid vector type issues
    }
  });
  if (!resume) {
    const error = new Error('Base resume not found');
    error.code = 'BASE_RESUME_NOT_FOUND';
    throw error;
  }

  await invalidateBaseResumeArtifacts(userId, baseResumeId);

  await prisma.baseResume.delete({ where: { id: baseResumeId } });

  const remaining = await prisma.baseResume.findMany({
    where: { userId },
    orderBy: { slotNumber: 'asc' },
    select: {
      id: true,
      // Exclude embedding to avoid vector type issues
    }
  });

  if (resume.isActive) {
    if (remaining.length > 0) {
      await activateBaseResume({ userId, baseResumeId: remaining[0].id });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { activeBaseResumeId: null }
      });
      await invalidateUserAIArtifacts(userId);
    }
  }
}

module.exports = {
  getPlanLimits,
  listBaseResumes,
  createBaseResume,
  activateBaseResume,
  deleteBaseResume,
  ensureActiveResume,
  countBaseResumes,
  findNextAvailableSlot,
  getBaseResume,
  updateBaseResume
};
