/**
 * Statistics Aggregator
 * Aggregates and analyzes user statistics
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get user statistics
 */
async function getUserStats(userId) {
  const [resumes, jobs, emails, portfolios] = await Promise.all([
    prisma.resume.count({ where: { userId } }),
    prisma.job.count({ where: { userId } }),
    prisma.email.count({ where: { userId } }),
    prisma.portfolio.count({ where: { userId } })
  ]);

  return {
    resumes,
    jobs,
    emails,
    portfolios,
    totalItems: resumes + jobs + emails + portfolios
  };
}

/**
 * Get activity statistics
 */
async function getActivityStats(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [recentResumes, recentJobs, recentEmails] = await Promise.all([
    prisma.resume.count({
      where: {
        userId,
        createdAt: { gte: startDate }
      }
    }),
    prisma.job.count({
      where: {
        userId,
        createdAt: { gte: startDate }
      }
    }),
    prisma.email.count({
      where: {
        userId,
        createdAt: { gte: startDate }
      }
    })
  ]);

  return {
    period: `${days} days`,
    recentResumes,
    recentJobs,
    recentEmails,
    totalActivity: recentResumes + recentJobs + recentEmails
  };
}

module.exports = {
  getUserStats,
  getActivityStats
};

