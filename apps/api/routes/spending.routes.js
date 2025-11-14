const { authenticate } = require('../middleware/auth');
const { prisma } = require('../utils/db');
const { getSpendingSummary, DAILY_SPENDING_CAPS } = require('../services/ai/usageService');
const logger = require('../utils/logger');

module.exports = async function spendingRoutes(fastify) {
  /**
   * GET /api/spending/summary
   * Get current spending summary for authenticated user
   */
  fastify.get('/api/spending/summary', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      
      // Get user's subscription tier
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { subscriptionTier: true }
      });
      
      if (!user) {
        return reply.status(404).send({
          success: false,
          error: 'User not found'
        });
      }
      
      const summary = await getSpendingSummary(userId, user.subscriptionTier);
      
      return reply.send({
        success: true,
        spending: {
          current: `$${summary.currentSpending.toFixed(4)}`,
          cap: `$${summary.cap.toFixed(2)}`,
          remaining: `$${summary.remaining.toFixed(4)}`,
          percentUsed: `${summary.percentUsed.toFixed(1)}%`,
          status: summary.status,
          resetTime: summary.resetTime,
          hasAdminOverride: summary.hasAdminOverride
        },
        tier: user.subscriptionTier,
        limits: {
          FREE: `$${DAILY_SPENDING_CAPS.FREE.toFixed(2)}/day`,
          PRO: `$${DAILY_SPENDING_CAPS.PRO.toFixed(2)}/day`,
          PREMIUM: `$${DAILY_SPENDING_CAPS.PREMIUM.toFixed(2)}/day`
        }
      });
    } catch (error) {
      logger.error('Failed to get spending summary', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve spending information'
      });
    }
  });

  /**
   * GET /api/spending/history
   * Get spending history for authenticated user (last 7 days)
   */
  fastify.get('/api/spending/history', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const days = parseInt(request.query.days) || 7;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      // Get AI request logs with costs
      const logs = await prisma.aIRequestLog.findMany({
        where: {
          userId,
          createdAt: { gte: since },
          costUsd: { not: null }
        },
        select: {
          action: true,
          model: true,
          tokensUsed: true,
          costUsd: true,
          status: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 100 // Limit to 100 most recent
      });
      
      // Group by day
      const dailySpending = {};
      logs.forEach(log => {
        const date = log.createdAt.toISOString().split('T')[0];
        if (!dailySpending[date]) {
          dailySpending[date] = {
            date,
            totalCost: 0,
            requests: 0,
            byAction: {}
          };
        }
        
        const cost = parseFloat(log.costUsd);
        dailySpending[date].totalCost += cost;
        dailySpending[date].requests += 1;
        
        if (!dailySpending[date].byAction[log.action]) {
          dailySpending[date].byAction[log.action] = {
            count: 0,
            cost: 0
          };
        }
        
        dailySpending[date].byAction[log.action].count += 1;
        dailySpending[date].byAction[log.action].cost += cost;
      });
      
      // Convert to array and sort by date
      const history = Object.values(dailySpending).sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      // Format costs
      history.forEach(day => {
        day.totalCost = `$${day.totalCost.toFixed(4)}`;
        Object.keys(day.byAction).forEach(action => {
          day.byAction[action].cost = `$${day.byAction[action].cost.toFixed(4)}`;
        });
      });
      
      return reply.send({
        success: true,
        history,
        totalRequests: logs.length,
        totalCost: `$${logs.reduce((sum, log) => sum + parseFloat(log.costUsd), 0).toFixed(4)}`
      });
    } catch (error) {
      logger.error('Failed to get spending history', {
        error: error.message,
        userId: request.user?.userId
      });
      
      return reply.status(500).send({
        success: false,
        error: 'Failed to retrieve spending history'
      });
    }
  });
};

