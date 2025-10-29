/**
 * Job Analytics Utilities
 * Provides analytics aggregation and insights for job applications
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get job application analytics
 */
async function getJobAnalytics(userId, dateRange = 30) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - dateRange);

    // Get all jobs for user in date range
    const jobs = await prisma.job.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Calculate statistics
    const totalApplications = jobs.length;
    
    const statusBreakdown = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    const applicationsByMonth = jobs.reduce((acc, job) => {
      const month = new Date(job.createdAt).toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const sourceBreakdown = jobs.reduce((acc, job) => {
      const source = job.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const responseRate = jobs.filter(job => 
      ['interview', 'offer'].includes(job.status)
    ).length / totalApplications * 100;

    const avgResponseTime = calculateAvgResponseTime(jobs);
    const topCompanies = getTopCompanies(jobs);
    const topPositions = getTopPositions(jobs);

    return {
      totalApplications,
      statusBreakdown,
      applicationsByMonth,
      sourceBreakdown,
      responseRate: isNaN(responseRate) ? 0 : responseRate,
      avgResponseTime,
      topCompanies,
      topPositions
    };
  } catch (error) {
    console.error('Error getting job analytics:', error);
    throw error;
  }
}

/**
 * Calculate average response time
 */
function calculateAvgResponseTime(jobs) {
  const responses = jobs.filter(job => 
    job.status !== 'applied' && job.updatedAt
  ).map(job => {
    const appliedDate = new Date(job.createdAt || job.appliedDate);
    const updatedDate = new Date(job.updatedAt);
    return Math.floor((updatedDate - appliedDate) / (1000 * 60 * 60 * 24)); // days
  });

  if (responses.length === 0) return 0;
  
  const sum = responses.reduce((a, b) => a + b, 0);
  return Math.round(sum / responses.length);
}

/**
 * Get top companies by application count
 */
function getTopCompanies(jobs, limit = 5) {
  const companyCounts = jobs.reduce((acc, job) => {
    acc[job.company] = (acc[job.company] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(companyCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([company, count]) => ({ company, count }));
}

/**
 * Get top positions by application count
 */
function getTopPositions(jobs, limit = 5) {
  const positionCounts = jobs.reduce((acc, job) => {
    acc[job.title] = (acc[job.title] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(positionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([title, count]) => ({ title, count }));
}

/**
 * Get application trends
 */
async function getApplicationTrends(userId, days = 30) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const jobs = await prisma.job.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Group by date
    const trends = {};
    jobs.forEach(job => {
      const date = new Date(job.createdAt).toISOString().split('T')[0];
      if (!trends[date]) {
        trends[date] = {
          date,
          applied: 0,
          interview: 0,
          offer: 0,
          rejected: 0
        };
      }
      trends[date][job.status] = (trends[date][job.status] || 0) + 1;
    });

    return Object.values(trends);
  } catch (error) {
    console.error('Error getting trends:', error);
    throw error;
  }
}

/**
 * Get success metrics
 */
async function getSuccessMetrics(userId) {
  try {
    const allJobs = await prisma.job.findMany({
      where: { userId }
    });

    const metrics = {
      totalApplications: allJobs.length,
      interviews: allJobs.filter(job => job.status === 'interview').length,
      offers: allJobs.filter(job => job.status === 'offer').length,
      rejections: allJobs.filter(job => job.status === 'rejected').length
    };

    metrics.interviewRate = metrics.totalApplications > 0 
      ? (metrics.interviews / metrics.totalApplications * 100).toFixed(1)
      : 0;

    metrics.offerRate = metrics.totalApplications > 0
      ? (metrics.offers / metrics.totalApplications * 100).toFixed(1)
      : 0;

    return metrics;
  } catch (error) {
    console.error('Error getting metrics:', error);
    throw error;
  }
}

module.exports = {
  getJobAnalytics,
  getApplicationTrends,
  getSuccessMetrics
};

