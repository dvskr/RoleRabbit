/**
 * Search Utilities
 * Provides search functionality across the platform
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Global search across all resources
 */
async function globalSearch(userId, query, options = {}) {
  const { types = ['resumes', 'jobs', 'emails', 'portfolios'], limit = 20 } = options;
  
  const results = {
    resumes: [],
    jobs: [],
    emails: [],
    portfolios: [],
    total: 0
  };

  // Search resumes
  if (types.includes('resumes')) {
    const resumes = await prisma.resume.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { data: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit
    });
    results.resumes = resumes;
  }

  // Search jobs
  if (types.includes('jobs')) {
    const jobs = await prisma.job.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } },
          { location: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit
    });
    results.jobs = jobs;
  }

  // Search emails
  if (types.includes('emails')) {
    const emails = await prisma.email.findMany({
      where: {
        userId,
        OR: [
          { subject: { contains: query, mode: 'insensitive' } },
          { body: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit
    });
    results.emails = emails;
  }

  // Search portfolios
  if (types.includes('portfolios')) {
    const portfolios = await prisma.portfolio.findMany({
      where: {
        userId,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: limit
    });
    results.portfolios = portfolios;
  }

  // Calculate total
  results.total = results.resumes.length + results.jobs.length + results.emails.length + results.portfolios.length;

  return results;
}

/**
 * Search resumes with filters
 */
async function searchResumes(userId, query, filters = {}) {
  const where = {
    userId,
    OR: [
      { name: { contains: query, mode: 'insensitive' } },
      { data: { contains: query, mode: 'insensitive' } }
    ]
  };

  // Add filters
  if (filters.templateId) {
    where.templateId = filters.templateId;
  }

  return await prisma.resume.findMany({
    where,
    take: filters.limit || 20
  });
}

/**
 * Search jobs with filters
 */
async function searchJobs(userId, query, filters = {}) {
  const where = {
    userId,
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { company: { contains: query, mode: 'insensitive' } }
    ]
  };

  if (filters.status) {
    where.status = filters.status;
  }

  return await prisma.job.findMany({
    where,
    take: filters.limit || 20
  });
}

module.exports = {
  globalSearch,
  searchResumes,
  searchJobs
};
