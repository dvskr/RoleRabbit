/**
 * Webhook Handler
 * Manages webhook events and notifications
 */

const crypto = require('crypto');
const logger = require('./logger');

const webhooks = new Map();

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  const calculatedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

function registerWebhook(name, url, secret, events = []) {
  const webhook = {
    name,
    url,
    secret,
    events,
    enabled: true,
    createdAt: new Date().toISOString()
  };
  
  webhooks.set(name, webhook);
  return webhook;
}

async function triggerWebhook(name, event, data) {
  const webhook = webhooks.get(name);
  if (!webhook || !webhook.enabled) return;

  const payload = {
    event,
    data,
    timestamp: new Date().toISOString()
  };

  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      logger.error(`Webhook ${name} failed:`, response.statusText);
    }
  } catch (error) {
    logger.error(`Webhook ${name} error:`, error);
  }
}

function listWebhooks() {
  return Array.from(webhooks.values());
}

module.exports = {
  verifyWebhook,
  registerWebhook,
  triggerWebhook,
  listWebhooks
};

