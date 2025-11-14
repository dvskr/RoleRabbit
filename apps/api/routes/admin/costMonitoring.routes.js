const { authenticate } = require('../../middleware/auth');
const { prisma } = require('../../utils/db');
const logger = require('../../utils/logger');
const { SubscriptionTier } = require('@prisma/client');

/**
 * Admin Cost Monitoring Routes
 * 
 * Provides comprehensive cost analytics for administrators
 */

// Middleware to check if user is admin
async function requireAdmin(request, reply) {
  const userId = request.user.userId;
  
  // Check if user is admin (you may want to add an isAdmin field to User model)
  // For now, we'll check if they're in the admin override list
  const adminUsers = (process.env.ADMIN_USERS || '').split(',').filter(Boolean);
  
  if (!adminUsers.includes(userId)) {
    return reply.status(403).send({
      success: false,
      error: 'Admin access required'
    });
  }
}

module.exports = async function costMonitoringRoutes(fastify) {
  /**
   * GET /api/admin/costs/overview
   * Get high-level cost overview
   */
  fastify.get('/api/admin/costs/overview', { 
    preHandler: [authenticate, requireAdmin] 
  }, async (request, reply) => {
    try {
      const { period = 'day' } = request.query; // day, week, month
      
      let startDate;
      const now = new Date();
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'day':
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      // Get total costs
      const totalCosts = await prisma.aIRequestLog.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: 'success',
          costUsd: { not: null }
        },
        _sum: {
          costUsd: true,
          tokensUsed: true
        },
        _count: {
          id: true
        }
      });
      
      // Get costs by action
      const costsByAction = await prisma.aIRequestLog.groupBy({
        by: ['action'],
        where: {
          createdAt: { gte: startDate },
          status: 'success',
          costUsd: { not: null }
        },
        _sum: {
          costUsd: true,
          tokensUsed: true
        },
        _count: {
          id: true
        }
      });
      
      // Get costs by model
      const costsByModel = await prisma.aIRequestLog.groupBy({
        by: ['model'],
        where: {
          createdAt: { gte: startDate },
          status: 'success',
          costUsd: { not: null }
        },
        _sum: {
          costUsd: true,
          tokensUsed: true
        },
        _count: {
          id: true
        }
      });
      
      // Get unique users count
      const uniqueUsers = await prisma.aIRequestLog.findMany({
        where: {
          createdAt: { gte: startDate },
          status: 'success'
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      });
      
      return reply.send({
        success: true,
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        overview: {
          totalCost: `$${(totalCosts._sum.costUsd || 0).toFixed(4)}`,
          totalTokens: totalCosts._sum.tokensUsed || 0,
          totalRequests: totalCosts._count.id,
          uniqueUsers: uniqueUsers.length,
          avgCostPerRequest: totalCosts._count.id > 0 
            ? `$${((totalCosts._sum.costUsd || 0) / totalCosts._count.id).toFixed(6)}`
            : '$0.000000'
        },
        byAction: costsByAction.map(item => ({
          action: item.action,
          cost: `$${(item._sum.costUsd || 0).toFixed(4)}`,
          tokens: item._sum.tokensUsed || 0,
          requests: item._count.id,
          avgCost: `$${((item._sum.costUsd || 0) / item._count.id).toFixed(6)}`
        })),
        byModel: costsByModel.map(item => ({
          model: item.model,
          cost: `$${(item._sum.costUsd || 0).toFixed(4)}`,
          tokens: item._sum.tokensUsed || 0,
          requests: item._count.id,
          avgCost: `$${((item._sum.costUsd || 0) / item._count.id).toFixed(6)}`
        }))
      });
    } catch (error) {
      logger.error('Failed to get cost overview', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve cost overview'
      });
    }
  });

  /**
   * GET /api/admin/costs/by-user
   * Get costs broken down by user
   */
  fastify.get('/api/admin/costs/by-user', { 
    preHandler: [authenticate, requireAdmin] 
  }, async (request, reply) => {
    try {
      const { period = 'day', limit = 50 } = request.query;
      
      let startDate;
      const now = new Date();
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'day':
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      
      // Get costs by user
      const costsByUser = await prisma.aIRequestLog.groupBy({
        by: ['userId'],
        where: {
          createdAt: { gte: startDate },
          status: 'success',
          costUsd: { not: null }
        },
        _sum: {
          costUsd: true,
          tokensUsed: true
        },
        _count: {
          id: true
        },
        orderBy: {
          _sum: {
            costUsd: 'desc'
          }
        },
        take: parseInt(limit)
      });
      
      // Get user details
      const userIds = costsByUser.map(item => item.userId);
      const users = await prisma.user.findMany({
        where: {
          id: { in: userIds }
        },
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionTier: true
        }
      });
      
      const userMap = {};
      users.forEach(user => {
        userMap[user.id] = user;
      });
      
      const result = costsByUser.map(item => {
        const user = userMap[item.userId] || { name: 'Unknown', email: 'unknown', subscriptionTier: 'FREE' };
        return {
          userId: item.userId,
          userName: user.name,
          userEmail: user.email,
          subscriptionTier: user.subscriptionTier,
          cost: `$${(item._sum.costUsd || 0).toFixed(4)}`,
          tokens: item._sum.tokensUsed || 0,
          requests: item._count.id,
          avgCostPerRequest: `$${((item._sum.costUsd || 0) / item._count.id).toFixed(6)}`
        };
      });
      
      return reply.send({
        success: true,
        period,
        startDate: startDate.toISOString(),
        endDate: now.toISOString(),
        users: result
      });
    } catch (error) {
      logger.error('Failed to get costs by user', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve costs by user'
      });
    }
  });

  /**
   * GET /api/admin/costs/trends
   * Get cost trends over time
   */
  fastify.get('/api/admin/costs/trends', { 
    preHandler: [authenticate, requireAdmin] 
  }, async (request, reply) => {
    try {
      const { days = 7 } = request.query;
      const daysInt = parseInt(days);
      
      const trends = [];
      const now = new Date();
      
      for (let i = daysInt - 1; i >= 0; i--) {
        const dayStart = new Date(now);
        dayStart.setDate(dayStart.getDate() - i);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(dayStart);
        dayEnd.setHours(23, 59, 59, 999);
        
        const dayCosts = await prisma.aIRequestLog.aggregate({
          where: {
            createdAt: {
              gte: dayStart,
              lte: dayEnd
            },
            status: 'success',
            costUsd: { not: null }
          },
          _sum: {
            costUsd: true,
            tokensUsed: true
          },
          _count: {
            id: true
          }
        });
        
        trends.push({
          date: dayStart.toISOString().split('T')[0],
          cost: parseFloat((dayCosts._sum.costUsd || 0).toFixed(4)),
          tokens: dayCosts._sum.tokensUsed || 0,
          requests: dayCosts._count.id
        });
      }
      
      // Calculate projections
      const avgDailyCost = trends.reduce((sum, day) => sum + day.cost, 0) / trends.length;
      const projectedMonthlyCost = avgDailyCost * 30;
      const projectedYearlyCost = avgDailyCost * 365;
      
      return reply.send({
        success: true,
        trends,
        projections: {
          avgDailyCost: `$${avgDailyCost.toFixed(4)}`,
          projectedMonthlyCost: `$${projectedMonthlyCost.toFixed(2)}`,
          projectedYearlyCost: `$${projectedYearlyCost.toFixed(2)}`
        }
      });
    } catch (error) {
      logger.error('Failed to get cost trends', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve cost trends'
      });
    }
  });

  /**
   * GET /api/admin/costs/export
   * Export cost data as CSV
   */
  fastify.get('/api/admin/costs/export', { 
    preHandler: [authenticate, requireAdmin] 
  }, async (request, reply) => {
    try {
      const { period = 'month' } = request.query;
      
      let startDate;
      const now = new Date();
      
      switch (period) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Get all cost data
      const costs = await prisma.aIRequestLog.findMany({
        where: {
          createdAt: { gte: startDate },
          status: 'success',
          costUsd: { not: null }
        },
        select: {
          userId: true,
          action: true,
          model: true,
          tokensUsed: true,
          costUsd: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      
      // Convert to CSV
      const csvHeader = 'Date,User ID,Action,Model,Tokens,Cost (USD)\n';
      const csvRows = costs.map(row => {
        const date = row.createdAt.toISOString();
        return `${date},${row.userId},${row.action},${row.model || 'N/A'},${row.tokensUsed || 0},${row.costUsd}`;
      }).join('\n');
      
      const csv = csvHeader + csvRows;
      
      reply.header('Content-Type', 'text/csv');
      reply.header('Content-Disposition', `attachment; filename="costs-${period}-${now.toISOString().split('T')[0]}.csv"`);
      
      return reply.send(csv);
    } catch (error) {
      logger.error('Failed to export costs', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to export cost data'
      });
    }
  });

  /**
   * GET /api/admin/costs/alerts
   * Get cost alerts and anomalies
   */
  fastify.get('/api/admin/costs/alerts', { 
    preHandler: [authenticate, requireAdmin] 
  }, async (request, reply) => {
    try {
      const alerts = [];
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      
      // Get today's costs
      const todayCosts = await prisma.aIRequestLog.aggregate({
        where: {
          createdAt: { gte: today },
          status: 'success',
          costUsd: { not: null }
        },
        _sum: {
          costUsd: true
        }
      });
      
      // Get yesterday's costs for comparison
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(today);
      
      const yesterdayCosts = await prisma.aIRequestLog.aggregate({
        where: {
          createdAt: {
            gte: yesterday,
            lt: yesterdayEnd
          },
          status: 'success',
          costUsd: { not: null }
        },
        _sum: {
          costUsd: true
        }
      });
      
      const todayTotal = todayCosts._sum.costUsd || 0;
      const yesterdayTotal = yesterdayCosts._sum.costUsd || 0;
      
      // Alert if today's costs are 50% higher than yesterday
      if (yesterdayTotal > 0 && todayTotal > yesterdayTotal * 1.5) {
        alerts.push({
          type: 'spike',
          severity: 'high',
          message: `Today's costs ($${todayTotal.toFixed(2)}) are ${((todayTotal / yesterdayTotal - 1) * 100).toFixed(0)}% higher than yesterday ($${yesterdayTotal.toFixed(2)})`,
          timestamp: now.toISOString()
        });
      }
      
      // Check for users approaching their spending caps
      const usersNearCap = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          subscriptionTier: true
        }
      });
      
      for (const user of usersNearCap) {
        const userSpending = await prisma.aIRequestLog.aggregate({
          where: {
            userId: user.id,
            createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
            status: 'success',
            costUsd: { not: null }
          },
          _sum: {
            costUsd: true
          }
        });
        
        const spending = userSpending._sum.costUsd || 0;
        const caps = {
          FREE: 1.00,
          PRO: 10.00,
          PREMIUM: 100.00
        };
        const cap = caps[user.subscriptionTier] || caps.FREE;
        const percentUsed = (spending / cap) * 100;
        
        if (percentUsed >= 90) {
          alerts.push({
            type: 'user_near_cap',
            severity: percentUsed >= 100 ? 'critical' : 'medium',
            message: `User ${user.name} (${user.email}) has used ${percentUsed.toFixed(0)}% of their ${user.subscriptionTier} tier cap ($${spending.toFixed(2)}/$${cap.toFixed(2)})`,
            userId: user.id,
            timestamp: now.toISOString()
          });
        }
      }
      
      return reply.send({
        success: true,
        alertCount: alerts.length,
        alerts: alerts.sort((a, b) => {
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        })
      });
    } catch (error) {
      logger.error('Failed to get cost alerts', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve cost alerts'
      });
    }
  });
};

