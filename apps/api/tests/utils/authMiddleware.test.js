/**
 * Auth Middleware Tests
 * Testing authentication middleware
 */

const fastify = require('fastify');
const jwt = require('@fastify/jwt');

describe('Auth Middleware Tests', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    
    await app.register(jwt, {
      secret: 'test-secret-key-for-testing-only'
    });

    app.get('/protected', {
      preHandler: async (request, reply) => {
        try {
          await request.jwtVerify();
        } catch (err) {
          reply.status(401).send({ error: 'Unauthorized' });
        }
      }
    }, async (request, reply) => {
      return { message: 'Success', userId: request.user.userId };
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('JWT Verification', () => {
    test('should allow access with valid token', async () => {
      const token = app.jwt.sign({ userId: 'test-user-id' });

      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBe('Success');
    });

    test('should reject access without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/protected'
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Unauthorized');
    });

    test('should reject access with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: {
          authorization: 'Bearer invalid.token.here'
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('Token Expiration', () => {
    test('should handle expired tokens', async () => {
      const token = app.jwt.sign(
        { userId: 'test-user-id' },
        { expiresIn: '1ms' }
      );

      // Wait for token to expire
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await app.inject({
        method: 'GET',
        url: '/protected',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });
});

