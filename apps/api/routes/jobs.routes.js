'use strict';

const { randomUUID } = require('crypto');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

const jobsStore = new Map();

function getUserJobs(userId) {
  if (!jobsStore.has(userId)) {
    jobsStore.set(userId, []);
  }
  return jobsStore.get(userId);
}

function ensureSampleJobs(userId) {
  const jobs = getUserJobs(userId);
  if (jobs.length === 0) {
    const sampleJob = {
      id: randomUUID(),
      title: 'Senior Product Manager',
      company: 'Aurora Analytics',
      location: 'Remote • United States',
      status: 'applied',
      appliedDate: new Date().toISOString().split('T')[0],
      priority: 'high',
      url: 'https://jobs.aurora-analytics.com/senior-product-manager',
      notes: 'Follow up with hiring manager next week',
      contact: {
        name: 'Jamie Chen',
        email: 'jamie.chen@aurora-analytics.com',
      },
      requirements: [
        '7+ years product management experience',
        'Experience with B2B SaaS analytics products',
        'Strong stakeholder communication skills',
      ],
      remote: true,
      companySize: '201-500 employees',
      industry: 'Technology',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    jobs.push(sampleJob);
  }
  return jobs;
}

module.exports = async function jobsRoutes(fastify) {
  fastify.get('/api/jobs', { preHandler: authenticate }, async (request) => {
    const userId = request.user?.userId || request.user?.id;
    if (!userId) {
      return { success: false, jobs: [] };
    }

    const jobs = ensureSampleJobs(userId);
    return {
      success: true,
      jobs,
    };
  });

  fastify.post('/api/jobs', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user?.userId || request.user?.id;
    if (!userId) {
      return reply.status(401).send({ success: false, error: 'User not authenticated' });
    }

    const payload = request.body || {};
    const newJob = {
      id: randomUUID(),
      title: payload.title || 'Untitled Job',
      company: payload.company || '',
      location: payload.location || '',
      status: payload.status || 'applied',
      appliedDate: payload.appliedDate || new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString(),
      priority: payload.priority || 'medium',
      salary: payload.salary || '',
      description: payload.description || '',
      url: payload.url || '',
      notes: payload.notes || '',
      contact: payload.contact || {},
      requirements: Array.isArray(payload.requirements) ? payload.requirements : [],
      benefits: Array.isArray(payload.benefits) ? payload.benefits : [],
      remote: !!payload.remote,
      companySize: payload.companySize || '',
      industry: payload.industry || '',
      nextStep: payload.nextStep || '',
      nextStepDate: payload.nextStepDate || null,
      createdAt: new Date().toISOString(),
      deletedAt: payload.deletedAt || undefined,
    };

    const jobs = getUserJobs(userId);
    jobs.push(newJob);
    logger.debug('Job saved for user', { userId, jobId: newJob.id });

    return reply.status(201).send({ success: true, job: newJob });
  });

  fastify.put('/api/jobs/:id', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user?.userId || request.user?.id;
    if (!userId) {
      return reply.status(401).send({ success: false, error: 'User not authenticated' });
    }

    const jobs = getUserJobs(userId);
    const { id } = request.params;
    const index = jobs.findIndex((job) => job.id === id);
    if (index === -1) {
      return reply.status(404).send({ success: false, error: 'Job not found' });
    }

    const updates = request.body || {};
    const updatedJob = {
      ...jobs[index],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    jobs[index] = updatedJob;
    logger.debug('Job updated for user', { userId, jobId: id });

    return { success: true, job: updatedJob };
  });

  fastify.delete('/api/jobs/:id', { preHandler: authenticate }, async (request, reply) => {
    const userId = request.user?.userId || request.user?.id;
    if (!userId) {
      return reply.status(401).send({ success: false, error: 'User not authenticated' });
    }

    const jobs = getUserJobs(userId);
    const { id } = request.params;
    const index = jobs.findIndex((job) => job.id === id);
    if (index === -1) {
      return reply.status(404).send({ success: false, error: 'Job not found' });
    }

    jobs.splice(index, 1);
    logger.debug('Job deleted for user', { userId, jobId: id });

    return { success: true };
  });
};


