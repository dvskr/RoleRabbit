/**
 * Reporting Utility
 * Generates reports and analytics data
 */

const { prisma } = require('./db');

class ReportGenerator {
  /**
   * Generate user activity report
   */
  async generateUserActivityReport(userId, startDate, endDate) {
    try {
      const activities = await prisma.activityLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return {
        totalActivities: activities.length,
        activities,
        period: { startDate, endDate }
      };
    } catch (error) {
      throw new Error(`Failed to generate activity report: ${error.message}`);
    }
  }

  /**
   * Generate job application report
   */
  async generateJobApplicationReport(userId) {
    try {
      const jobs = await prisma.job.findMany({
        where: { userId },
        include: {
          _count: {
            select: { resumes: true, emails: true }
          }
        }
      });

      const statusCounts = jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {});

      return {
        totalApplications: jobs.length,
        statusBreakdown: statusCounts,
        jobs
      };
    } catch (error) {
      throw new Error(`Failed to generate job report: ${error.message}`);
    }
  }

  /**
   * Generate performance report
   */
  async generatePerformanceReport(startDate, endDate) {
    try {
      // Aggregate metrics
      const totalUsers = await prisma.user.count();
      const totalJobs = await prisma.job.count();
      const totalResumes = await prisma.resume.count();

      return {
        metrics: {
          totalUsers,
          totalJobs,
          totalResumes
        },
        period: { startDate, endDate }
      };
    } catch (error) {
      throw new Error(`Failed to generate performance report: ${error.message}`);
    }
  }
}

module.exports = new ReportGenerator();

