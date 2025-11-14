const { prisma } = require('../utils/db');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');
const {
  OPERATIONS,
  ALLOCATION_STRATEGIES,
  getTestResults,
  getWinnerVariant,
  promoteToControl
} = require('../services/abTesting/promptTestingService');

/**
 * A/B Testing Routes
 * Admin routes for managing prompt variants and viewing test results
 */

async function abTestingRoutes(fastify, options) {
  
  // Admin authentication middleware
  const requireAdmin = async (request, reply) => {
    const adminUsers = (process.env.ADMIN_USERS || '').split(',').map(e => e.trim());
    
    if (!adminUsers.includes(request.user.email)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }
  };

  /**
   * Get all prompt variants
   * GET /api/ab-testing/variants
   */
  fastify.get('/variants', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { operation, active } = request.query;

      const where = {};
      if (operation) where.operation = operation;
      if (active !== undefined) where.isActive = active === 'true';

      const variants = await prisma.promptVariant.findMany({
        where,
        orderBy: [
          { operation: 'asc' },
          { createdAt: 'asc' }
        ],
        include: {
          _count: {
            select: { tests: true }
          }
        }
      });

      return reply.send({
        variants: variants.map(v => ({
          ...v,
          metadata: JSON.parse(v.metadata),
          testCount: v._count.tests
        })),
        availableOperations: Object.values(OPERATIONS)
      });

    } catch (error) {
      logger.error('[AB_TEST] Failed to get variants', {
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to get variants'
      });
    }
  });

  /**
   * Create new prompt variant
   * POST /api/ab-testing/variants
   */
  fastify.post('/variants', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      body: {
        type: 'object',
        required: ['name', 'operation', 'variant', 'prompt'],
        properties: {
          name: { type: 'string' },
          operation: { type: 'string' },
          variant: { type: 'string' },
          prompt: { type: 'string' },
          metadata: { type: 'object' },
          isActive: { type: 'boolean' },
          isControl: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { name, operation, variant, prompt, metadata = {}, isActive = true, isControl = false } = request.body;

      // Validate operation
      if (!Object.values(OPERATIONS).includes(operation)) {
        return reply.status(400).send({
          error: 'Invalid operation',
          validOperations: Object.values(OPERATIONS)
        });
      }

      // Check if variant already exists
      const existing = await prisma.promptVariant.findUnique({
        where: {
          operation_variant: { operation, variant }
        }
      });

      if (existing) {
        return reply.status(400).send({
          error: 'Variant already exists',
          message: `A variant with identifier "${variant}" already exists for operation "${operation}"`
        });
      }

      // If setting as control, demote current control
      if (isControl) {
        await prisma.promptVariant.updateMany({
          where: {
            operation,
            isControl: true
          },
          data: { isControl: false }
        });
      }

      const newVariant = await prisma.promptVariant.create({
        data: {
          name,
          operation,
          variant,
          prompt,
          metadata: JSON.stringify(metadata),
          isActive,
          isControl
        }
      });

      logger.info('[AB_TEST] Variant created', {
        variantId: newVariant.id,
        operation,
        variant,
        isControl
      });

      return reply.status(201).send({
        success: true,
        variant: {
          ...newVariant,
          metadata: JSON.parse(newVariant.metadata)
        }
      });

    } catch (error) {
      logger.error('[AB_TEST] Failed to create variant', {
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to create variant'
      });
    }
  });

  /**
   * Update prompt variant
   * PUT /api/ab-testing/variants/:id
   */
  fastify.put('/variants/:id', {
    preHandler: [authenticate, requireAdmin],
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          prompt: { type: 'string' },
          metadata: { type: 'object' },
          isActive: { type: 'boolean' },
          isControl: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const { name, prompt, metadata, isActive, isControl } = request.body;

      const variant = await prisma.promptVariant.findUnique({
        where: { id }
      });

      if (!variant) {
        return reply.status(404).send({
          error: 'Variant not found'
        });
      }

      // If setting as control, demote current control
      if (isControl === true) {
        await prisma.promptVariant.updateMany({
          where: {
            operation: variant.operation,
            isControl: true,
            id: { not: id }
          },
          data: { isControl: false }
        });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (prompt !== undefined) updateData.prompt = prompt;
      if (metadata !== undefined) updateData.metadata = JSON.stringify(metadata);
      if (isActive !== undefined) updateData.isActive = isActive;
      if (isControl !== undefined) updateData.isControl = isControl;

      const updatedVariant = await prisma.promptVariant.update({
        where: { id },
        data: updateData
      });

      logger.info('[AB_TEST] Variant updated', {
        variantId: id,
        updates: Object.keys(updateData)
      });

      return reply.send({
        success: true,
        variant: {
          ...updatedVariant,
          metadata: JSON.parse(updatedVariant.metadata)
        }
      });

    } catch (error) {
      logger.error('[AB_TEST] Failed to update variant', {
        variantId: request.params.id,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to update variant'
      });
    }
  });

  /**
   * Delete prompt variant
   * DELETE /api/ab-testing/variants/:id
   */
  fastify.delete('/variants/:id', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params;

      const variant = await prisma.promptVariant.findUnique({
        where: { id },
        include: {
          _count: {
            select: { tests: true }
          }
        }
      });

      if (!variant) {
        return reply.status(404).send({
          error: 'Variant not found'
        });
      }

      // Prevent deleting control variant
      if (variant.isControl) {
        return reply.status(400).send({
          error: 'Cannot delete control variant',
          message: 'Promote another variant to control before deleting this one'
        });
      }

      await prisma.promptVariant.delete({
        where: { id }
      });

      logger.info('[AB_TEST] Variant deleted', {
        variantId: id,
        operation: variant.operation,
        variant: variant.variant,
        testCount: variant._count.tests
      });

      return reply.send({
        success: true,
        message: 'Variant deleted successfully'
      });

    } catch (error) {
      logger.error('[AB_TEST] Failed to delete variant', {
        variantId: request.params.id,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to delete variant'
      });
    }
  });

  /**
   * Get test results for an operation
   * GET /api/ab-testing/results/:operation
   */
  fastify.get('/results/:operation', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { operation } = request.params;
      const { startDate, endDate, minTests = 10 } = request.query;

      if (!Object.values(OPERATIONS).includes(operation)) {
        return reply.status(400).send({
          error: 'Invalid operation',
          validOperations: Object.values(OPERATIONS)
        });
      }

      const results = await getTestResults(operation, {
        startDate,
        endDate,
        minTests: parseInt(minTests)
      });

      return reply.send(results);

    } catch (error) {
      logger.error('[AB_TEST] Failed to get results', {
        operation: request.params.operation,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to get test results'
      });
    }
  });

  /**
   * Get winner variant
   * GET /api/ab-testing/winner/:operation
   */
  fastify.get('/winner/:operation', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { operation } = request.params;
      const { minTests = 30 } = request.query;

      if (!Object.values(OPERATIONS).includes(operation)) {
        return reply.status(400).send({
          error: 'Invalid operation',
          validOperations: Object.values(OPERATIONS)
        });
      }

      const winner = await getWinnerVariant(operation, parseInt(minTests));

      if (!winner) {
        return reply.send({
          hasWinner: false,
          message: 'Not enough data to determine winner',
          minTestsRequired: parseInt(minTests)
        });
      }

      return reply.send({
        hasWinner: true,
        winner
      });

    } catch (error) {
      logger.error('[AB_TEST] Failed to get winner', {
        operation: request.params.operation,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to get winner'
      });
    }
  });

  /**
   * Promote variant to control
   * POST /api/ab-testing/promote/:id
   */
  fastify.post('/promote/:id', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const { id } = request.params;

      const updatedVariant = await promoteToControl(id);

      return reply.send({
        success: true,
        message: 'Variant promoted to control successfully',
        variant: {
          ...updatedVariant,
          metadata: JSON.parse(updatedVariant.metadata)
        }
      });

    } catch (error) {
      if (error.message === 'Variant not found') {
        return reply.status(404).send({
          error: 'Variant not found'
        });
      }

      logger.error('[AB_TEST] Failed to promote variant', {
        variantId: request.params.id,
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to promote variant'
      });
    }
  });

  /**
   * Get A/B testing statistics summary
   * GET /api/ab-testing/stats
   */
  fastify.get('/stats', {
    preHandler: [authenticate, requireAdmin]
  }, async (request, reply) => {
    try {
      const operations = Object.values(OPERATIONS);
      const stats = [];

      for (const operation of operations) {
        const [variants, tests] = await Promise.all([
          prisma.promptVariant.count({
            where: { operation, isActive: true }
          }),
          prisma.promptTest.count({
            where: { operation }
          })
        ]);

        stats.push({
          operation,
          activeVariants: variants,
          totalTests: tests
        });
      }

      const totalVariants = await prisma.promptVariant.count({
        where: { isActive: true }
      });

      const totalTests = await prisma.promptTest.count();

      return reply.send({
        summary: {
          totalActiveVariants: totalVariants,
          totalTests
        },
        byOperation: stats
      });

    } catch (error) {
      logger.error('[AB_TEST] Failed to get stats', {
        error: error.message
      });
      return reply.status(500).send({
        error: 'Failed to get statistics'
      });
    }
  });
}

module.exports = abTestingRoutes;

