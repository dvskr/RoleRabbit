'use strict';

const { randomUUID } = require('crypto');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

const coverLettersStore = new Map();

function getUserCoverLetters(userId) {
  if (!coverLettersStore.has(userId)) {
    coverLettersStore.set(userId, []);
  }
  return coverLettersStore.get(userId);
}

function ensureSampleCoverLetter(userId) {
  const letters = getUserCoverLetters(userId);
  if (letters.length === 0) {
    const now = new Date().toISOString();
    letters.push({
      id: randomUUID(),
      title: 'AI Platform Product Manager Application',
      content: `Dear Hiring Manager,

I am excited to apply for the Senior Product Manager position at Aurora Analytics. Over the last decade, I have shipped enterprise analytics platforms that combine ML-driven insights with intuitive user experience. At CloudForge, I led the creation of an AI experimentation platform adopted by 120+ enterprise teams and drove $48M in net-new ARR.

I would welcome the opportunity to bring that same customer-obsessed product leadership to Aurora Analytics.

Sincerely,
Sarah Johnson`,
      wordCount: 126,
      createdAt: now,
      lastModified: now,
      status: 'draft',
      aiGenerated: false,
      jobTitle: 'Senior Product Manager',
      companyName: 'Aurora Analytics',
    });
  }
  return letters;
}

module.exports = async function coverLettersRoutes(fastify) {
  fastify.get('/api/cover-letters', { preHandler: authenticate }, async (request) => {
    const userId = request.user?.userId || request.user?.id;
    if (!userId) {
      return { success: false, coverLetters: [] };
    }

    const coverLetters = ensureSampleCoverLetter(userId);
    return {
      success: true,
      coverLetters,
    };
  });

  fastify.post('/api/cover-letters', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user?.userId || request.user?.id;
    if (!userId) {
      return reply.status(401).send({ success: false, error: 'User not authenticated' });
    }

    const payload = request.body || {};
    const now = new Date().toISOString();
    const coverLetter = {
      id: randomUUID(),
      title: payload.title || 'Untitled Cover Letter',
      content: payload.content || '',
      wordCount: payload.wordCount || (payload.content ? payload.content.split(/\s+/).length : 0),
      createdAt: now,
      lastModified: now,
      status: payload.status || 'draft',
      aiGenerated: !!payload.aiGenerated,
      jobTitle: payload.jobTitle || '',
      companyName: payload.companyName || '',
    };

    const coverLetters = getUserCoverLetters(userId);
    coverLetters.unshift(coverLetter);
    logger.debug('Cover letter saved for user', { userId, coverLetterId: coverLetter.id });

    return reply.status(201).send({ success: true, coverLetter });
  });

  fastify.put('/api/cover-letters/:id', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user?.userId || request.user?.id;
    if (!userId) {
      return reply.status(401).send({ success: false, error: 'User not authenticated' });
    }

    const coverLetters = getUserCoverLetters(userId);
    const { id } = request.params;
    const index = coverLetters.findIndex((letter) => letter.id === id);
    if (index === -1) {
      return reply.status(404).send({ success: false, error: 'Cover letter not found' });
    }

    const updates = request.body || {};
    coverLetters[index] = {
      ...coverLetters[index],
      ...updates,
      lastModified: new Date().toISOString(),
    };
    logger.debug('Cover letter updated for user', { userId, coverLetterId: id });

    return { success: true, coverLetter: coverLetters[index] };
  });
};


