const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');
const billingService = require('../utils/billing');

async function billingRoutes(fastify) {
  fastify.get('/api/billing/subscription', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const overview = await billingService.getSubscriptionOverview(userId);
      reply.send(overview);
    } catch (error) {
      logger.error('Error fetching subscription overview:', error);
      reply.status(500).send({ error: 'Failed to load subscription details', details: error.message });
    }
  });

  fastify.get('/api/billing/invoices', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const page = Number.parseInt(request.query.page, 10) || 1;
      const pageSize = Number.parseInt(request.query.pageSize, 10) || 10;

      const data = await billingService.listInvoices(userId, page, pageSize);
      reply.send(data);
    } catch (error) {
      logger.error('Error fetching invoices:', error);
      reply.status(500).send({ error: 'Failed to load invoices', details: error.message });
    }
  });

  fastify.post('/api/billing/subscribe', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { plan, paymentMethodId } = request.body || {};

      if (!plan) {
        reply.status(400).send({ error: 'Plan is required' });
        return;
      }

      const result = await billingService.subscribeUser(userId, plan, paymentMethodId);
      reply.send(result);
    } catch (error) {
      logger.error('Error subscribing user:', error);
      reply.status(400).send({ error: error.message || 'Failed to update subscription' });
    }
  });

  fastify.post('/api/billing/cancel', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const subscription = await billingService.cancelSubscription(userId);
      reply.send({ subscription });
    } catch (error) {
      logger.error('Error cancelling subscription:', error);
      reply.status(500).send({ error: 'Failed to cancel subscription', details: error.message });
    }
  });

  fastify.get('/api/billing/payment-methods', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const methods = await billingService.listPaymentMethods(userId);
      reply.send({ paymentMethods: methods });
    } catch (error) {
      logger.error('Error fetching payment methods:', error);
      reply.status(500).send({ error: 'Failed to load payment methods', details: error.message });
    }
  });

  fastify.post('/api/billing/payment-methods', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { cardNumber, cardHolder, expiryMonth, expiryYear, setDefault } = request.body || {};

      if (!cardNumber || !cardHolder || !expiryMonth || !expiryYear) {
        reply.status(400).send({ error: 'Card number, holder name, expiry month, and expiry year are required' });
        return;
      }

      const paymentMethod = await billingService.addPaymentMethod(userId, {
        cardNumber,
        cardHolder,
        expiryMonth,
        expiryYear,
        setDefault,
        type: 'card'
      });

      reply.send({ paymentMethod });
    } catch (error) {
      logger.error('Error adding payment method:', error);
      reply.status(400).send({ error: error.message || 'Failed to add payment method' });
    }
  });

  fastify.delete('/api/billing/payment-methods/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const { id } = request.params;

      await billingService.removePaymentMethod(userId, id);
      reply.send({ success: true });
    } catch (error) {
      logger.error('Error removing payment method:', error);
      reply.status(400).send({ error: error.message || 'Failed to remove payment method' });
    }
  });

  fastify.post('/api/billing/webhook', async (request, reply) => {
    logger.info('Billing webhook received', {
      event: request.body?.event || 'unknown',
      payload: request.body
    });
    reply.send({ received: true });
  });
}

module.exports = billingRoutes;


