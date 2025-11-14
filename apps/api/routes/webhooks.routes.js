const { prisma } = require('../utils/db');
const logger = require('../utils/logger');
const { WEBHOOK_EVENTS, generateSignature } = require('../services/webhooks/webhookService');
const { authenticate } = require('../middleware/auth');
const crypto = require('crypto');

/**
 * Webhook Configuration Routes
 * Allows users to configure webhook endpoints for notifications
 */

async function webhookRoutes(fastify, options) {
  
  /**
   * Get user's webhook configuration
   * GET /api/webhooks/config
   */
  fastify.get('/config', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const config = await prisma.webhookConfig.findUnique({
        where: { userId },
        select: {
          id: true,
          url: true,
          enabled: true,
          enabledEvents: true,
          createdAt: true,
          updatedAt: true
          // Don't expose secret
        }
      });

      if (!config) {
        return reply.send({
          configured: false,
          availableEvents: Object.values(WEBHOOK_EVENTS)
        });
      }

      return reply.send({
        configured: true,
        config: {
          ...config,
          enabledEvents: config.enabledEvents ? JSON.parse(config.enabledEvents) : []
        },
        availableEvents: Object.values(WEBHOOK_EVENTS)
      });

    } catch (error) {
      logger.error('[WEBHOOKS] Failed to get config', {
        userId: request.user.userId,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to get webhook configuration'
      });
    }
  });

  /**
   * Create or update webhook configuration
   * POST /api/webhooks/config
   */
  fastify.post('/config', {
    preHandler: [authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['url'],
        properties: {
          url: { type: 'string', format: 'uri' },
          enabled: { type: 'boolean' },
          enabledEvents: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { url, enabled = true, enabledEvents = Object.values(WEBHOOK_EVENTS) } = request.body;

      // Validate URL
      try {
        new URL(url);
      } catch (error) {
        return reply.status(400).send({
          error: 'Invalid webhook URL'
        });
      }

      // Validate events
      const validEvents = Object.values(WEBHOOK_EVENTS);
      const invalidEvents = enabledEvents.filter(e => !validEvents.includes(e));
      if (invalidEvents.length > 0) {
        return reply.status(400).send({
          error: 'Invalid event types',
          invalidEvents
        });
      }

      // Generate secret if creating new config
      const existingConfig = await prisma.webhookConfig.findUnique({
        where: { userId }
      });

      const secret = existingConfig?.secret || crypto.randomBytes(32).toString('hex');

      // Upsert configuration
      const config = await prisma.webhookConfig.upsert({
        where: { userId },
        create: {
          userId,
          url,
          secret,
          enabled,
          enabledEvents: JSON.stringify(enabledEvents)
        },
        update: {
          url,
          enabled,
          enabledEvents: JSON.stringify(enabledEvents)
        },
        select: {
          id: true,
          url: true,
          secret: true,
          enabled: true,
          enabledEvents: true,
          createdAt: true,
          updatedAt: true
        }
      });

      logger.info('[WEBHOOKS] Configuration updated', {
        userId,
        url,
        enabled,
        eventsCount: enabledEvents.length
      });

      return reply.send({
        success: true,
        config: {
          ...config,
          enabledEvents: JSON.parse(config.enabledEvents)
        },
        message: 'Webhook configuration saved successfully'
      });

    } catch (error) {
      logger.error('[WEBHOOKS] Failed to save config', {
        userId: request.user.userId,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to save webhook configuration'
      });
    }
  });

  /**
   * Delete webhook configuration
   * DELETE /api/webhooks/config
   */
  fastify.delete('/config', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      await prisma.webhookConfig.delete({
        where: { userId }
      });

      logger.info('[WEBHOOKS] Configuration deleted', { userId });

      return reply.send({
        success: true,
        message: 'Webhook configuration deleted successfully'
      });

    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: 'No webhook configuration found'
        });
      }

      logger.error('[WEBHOOKS] Failed to delete config', {
        userId: request.user.userId,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to delete webhook configuration'
      });
    }
  });

  /**
   * Test webhook endpoint
   * POST /api/webhooks/test
   */
  fastify.post('/test', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const config = await prisma.webhookConfig.findUnique({
        where: { userId }
      });

      if (!config) {
        return reply.status(404).send({
          error: 'No webhook configuration found. Please configure a webhook first.'
        });
      }

      // Send test webhook
      const axios = require('axios');
      const deliveryId = crypto.randomUUID();
      const payload = {
        event: 'webhook.test',
        deliveryId,
        timestamp: new Date().toISOString(),
        userId,
        data: {
          message: 'This is a test webhook from RoleReady',
          testId: deliveryId
        }
      };

      const signature = generateSignature(payload, config.secret);

      try {
        const response = await axios.post(config.url, payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': 'webhook.test',
            'X-Webhook-Delivery-Id': deliveryId,
            'User-Agent': 'RoleReady-Webhook/1.0'
          },
          timeout: 10000
        });

        logger.info('[WEBHOOKS] Test webhook sent successfully', {
          userId,
          url: config.url,
          statusCode: response.status
        });

        return reply.send({
          success: true,
          message: 'Test webhook sent successfully',
          statusCode: response.status,
          deliveryId
        });

      } catch (error) {
        logger.warn('[WEBHOOKS] Test webhook failed', {
          userId,
          url: config.url,
          error: error.message,
          statusCode: error.response?.status
        });

        return reply.status(400).send({
          success: false,
          error: 'Failed to deliver test webhook',
          details: error.message,
          statusCode: error.response?.status,
          deliveryId
        });
      }

    } catch (error) {
      logger.error('[WEBHOOKS] Test webhook error', {
        userId: request.user.userId,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to send test webhook'
      });
    }
  });

  /**
   * Get webhook delivery logs
   * GET /api/webhooks/logs
   */
  fastify.get('/logs', {
    preHandler: [authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 50 },
          offset: { type: 'integer', minimum: 0, default: 0 },
          event: { type: 'string' },
          success: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { limit = 50, offset = 0, event, success } = request.query;

      const where = { userId };
      if (event) where.event = event;
      if (success !== undefined) where.success = success;

      const [logs, total] = await Promise.all([
        prisma.webhookLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
          select: {
            id: true,
            event: true,
            url: true,
            success: true,
            statusCode: true,
            attempts: true,
            error: true,
            deliveryId: true,
            deliveredAt: true,
            createdAt: true
            // Don't expose payload for privacy
          }
        }),
        prisma.webhookLog.count({ where })
      ]);

      return reply.send({
        logs,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      });

    } catch (error) {
      logger.error('[WEBHOOKS] Failed to get logs', {
        userId: request.user.userId,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to get webhook logs'
      });
    }
  });

  /**
   * Get webhook statistics
   * GET /api/webhooks/stats
   */
  fastify.get('/stats', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      // Get stats from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const logs = await prisma.webhookLog.findMany({
        where: {
          userId,
          createdAt: { gte: thirtyDaysAgo }
        },
        select: {
          success: true,
          event: true,
          attempts: true
        }
      });

      const stats = {
        total: logs.length,
        successful: logs.filter(l => l.success).length,
        failed: logs.filter(l => !l.success).length,
        successRate: logs.length > 0 ? (logs.filter(l => l.success).length / logs.length * 100).toFixed(2) : 0,
        averageAttempts: logs.length > 0 ? (logs.reduce((sum, l) => sum + l.attempts, 0) / logs.length).toFixed(2) : 0,
        byEvent: {}
      };

      // Group by event
      logs.forEach(log => {
        if (!stats.byEvent[log.event]) {
          stats.byEvent[log.event] = { total: 0, successful: 0, failed: 0 };
        }
        stats.byEvent[log.event].total++;
        if (log.success) {
          stats.byEvent[log.event].successful++;
        } else {
          stats.byEvent[log.event].failed++;
        }
      });

      return reply.send(stats);

    } catch (error) {
      logger.error('[WEBHOOKS] Failed to get stats', {
        userId: request.user.userId,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to get webhook statistics'
      });
    }
  });

  /**
   * Regenerate webhook secret
   * POST /api/webhooks/regenerate-secret
   */
  fastify.post('/regenerate-secret', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;

      const newSecret = crypto.randomBytes(32).toString('hex');

      const config = await prisma.webhookConfig.update({
        where: { userId },
        data: { secret: newSecret },
        select: {
          id: true,
          url: true,
          secret: true,
          enabled: true,
          enabledEvents: true
        }
      });

      logger.info('[WEBHOOKS] Secret regenerated', { userId });

      return reply.send({
        success: true,
        message: 'Webhook secret regenerated successfully',
        secret: config.secret
      });

    } catch (error) {
      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: 'No webhook configuration found'
        });
      }

      logger.error('[WEBHOOKS] Failed to regenerate secret', {
        userId: request.user.userId,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to regenerate webhook secret'
      });
    }
  });
}

module.exports = webhookRoutes;

