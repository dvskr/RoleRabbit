/**
 * Test Helper Utilities
 * Provides utilities for testing API endpoints and database operations
 */

const logger = require('./logger');

/**
 * Create test user
 */
async function createTestUser(prisma, userData = {}) {
  return await prisma.user.create({
    data: {
      email: userData.email || `test${Date.now()}@example.com`,
      name: userData.name || 'Test User',
      password: userData.password || 'hashed_password_here',
      provider: userData.provider || 'local',
      ...userData
    }
  });
}

/**
 * Delete test user
 */
async function deleteTestUser(prisma, userId) {
  return await prisma.user.delete({
    where: { id: userId }
  });
}

/**
 * Clean up test data
 */
async function cleanupTestData(prisma) {
  try {
    await prisma.$transaction([
      prisma.auditLog.deleteMany({ where: {} })
    ]);
    logger.info('✅ Test data cleaned up');
  } catch (error) {
    logger.error('❌ Error cleaning up test data:', error);
  }
}

/**
 * Create JWT token for testing
 */
function createTestToken(userId = 'test-user-id', expiresIn = '1h') {
  const jwt = require('jsonwebtoken');
  const secret = process.env.JWT_SECRET || 'test-secret';
  
  return jwt.sign(
    { userId, email: 'test@example.com' },
    secret,
    { expiresIn }
  );
}

/**
 * Create authenticated request object
 */
function createAuthenticatedRequest(userId = 'test-user-id') {
  return {
    user: {
      userId,
      email: 'test@example.com'
    },
    headers: {
      authorization: `Bearer ${createTestToken(userId)}`
    }
  };
}

/**
 * Assert response is successful
 */
function assertSuccess(response) {
  if (!response.success) {
    throw new Error(`Expected success but got: ${JSON.stringify(response)}`);
  }
}

/**
 * Assert response has error
 */
function assertError(response, expectedError) {
  if (!response.error) {
    throw new Error(`Expected error but got: ${JSON.stringify(response)}`);
  }
  if (expectedError && !response.error.includes(expectedError)) {
    throw new Error(`Expected error "${expectedError}" but got "${response.error}"`);
  }
}

/**
 * Create mock request
 */
function createMockRequest(data = {}) {
  return {
    body: data.body || {},
    query: data.query || {},
    params: data.params || {},
    headers: data.headers || {},
    user: data.user || null,
    ...data
  };
}

/**
 * Create mock reply
 */
function createMockReply() {
  const reply = {
    status: (code) => {
      reply.statusCode = code;
      return reply;
    },
    header: () => reply,
    send: (data) => {
      reply.sentData = data;
      return reply;
    },
    cookie: () => reply
  };
  
  return reply;
}

/**
 * Wait for async operations
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate test data
 */
function generateTestData(type, count = 1) {
  const generators = {
    user: () => ({
      email: `test${Date.now()}@example.com`,
      name: 'Test User',
      password: 'TestPassword123!'
    })
  };

  if (count === 1) {
    return generators[type]();
  }

  return Array.from({ length: count }, () => generators[type]());
}

module.exports = {
  createTestUser,
  deleteTestUser,
  cleanupTestData,
  createTestToken,
  createAuthenticatedRequest,
  assertSuccess,
  assertError,
  createMockRequest,
  createMockReply,
  wait,
  generateTestData
};

