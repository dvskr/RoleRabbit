/**
 * Request ID Generator
 * Generates unique request IDs for tracing
 */

const crypto = require('crypto');

let counter = 0;

function generateRequestId() {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  counter = (counter + 1) % 1000;
  
  return `${timestamp}-${random}-${counter.toString().padStart(3, '0')}`;
}

function addRequestId(req, res, next) {
  req.id = generateRequestId();
  res.setHeader('X-Request-ID', req.id);
  next();
}

module.exports = {
  generateRequestId,
  addRequestId
};

