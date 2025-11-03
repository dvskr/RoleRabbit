/**
 * Tests for user profile routes
 */

const Fastify = require('fastify');

// Create shared Prisma mock that routes will import
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn()
  }
};

// Mock dependencies used inside users.routes
jest.mock('../utils/db', () => ({
  prisma: mockPrisma
}));

jest.mock('../middleware/auth', () => ({
  authenticate: async (request) => {
    request.user = { userId: 'user-123' };
  }
}));

jest.mock('../auth', () => ({
  getUserById: jest.fn()
}));

jest.mock('../utils/profileCompleteness', () => ({
  calculateProfileCompleteness: jest.fn(() => ({
    score: 85,
    breakdown: { basicInfo: { score: 15 } },
    level: 'Good'
  }))
}));

const { getUserById } = require('../auth');
const { calculateProfileCompleteness } = require('../utils/profileCompleteness');

describe('User Profile Routes', () => {
  let app;

  beforeAll(async () => {
    app = Fastify();
    await app.register(require('../routes/users.routes'));
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/profile', () => {
    it('returns parsed profile data for authenticated user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'person@example.com',
        name: 'Pat Example',
        skills: JSON.stringify(['React', 'Node.js']),
        certifications: null,
        languages: JSON.stringify(['English']),
        education: JSON.stringify([{ institution: 'Uni', degree: 'BS' }]),
        workExperiences: JSON.stringify([{ company: 'RoleReady', role: 'Dev' }]),
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z')
      });

      const response = await app.inject({
        method: 'GET',
        url: '/api/users/profile'
      });

      expect(response.statusCode).toBe(200);
      const payload = response.json();

      expect(payload.user.email).toBe('person@example.com');
      expect(payload.user.skills).toEqual(['React', 'Node.js']);
      expect(payload.user.certifications).toEqual([]);
      expect(payload.user.languages).toEqual(['English']);
      expect(payload.user.education).toEqual([{ institution: 'Uni', degree: 'BS' }]);
      expect(payload.user.workExperiences).toEqual([{ company: 'RoleReady', role: 'Dev' }]);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object)
      });
    });

    it('returns 404 when user is not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await app.inject({
        method: 'GET',
        url: '/api/users/profile'
      });

      expect(response.statusCode).toBe(404);
      expect(response.json()).toEqual({ error: 'User not found' });
    });
  });

  describe('PUT /api/users/profile', () => {
    it('updates only allowed fields and stringifies JSON arrays', async () => {
      getUserById.mockResolvedValue({
        id: 'user-123',
        firstName: 'Pat',
        lastName: 'Example',
        name: 'Pat Example'
      });

      mockPrisma.user.update.mockResolvedValue({
        id: 'user-123',
        email: 'person@example.com',
        name: 'Pat Example',
        skills: JSON.stringify(['React']),
        workExperiences: JSON.stringify([]),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/profile',
        headers: { 'content-type': 'application/json' },
        payload: JSON.stringify({
          email: 'person@example.com',
          skills: ['React'],
          workExperiences: [],
          notAllowed: 'ignore'
        })
      });

      expect(response.statusCode).toBe(200);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          email: 'person@example.com',
          skills: JSON.stringify(['React']),
          workExperiences: JSON.stringify([])
        },
        select: expect.any(Object)
      });

      const payload = response.json();
      expect(payload.user.skills).toEqual(['React']);
      expect(payload.user.workExperiences).toEqual([]);
      expect(calculateProfileCompleteness).toHaveBeenCalled();
    });

    it('rejects invalid email updates', async () => {
      getUserById.mockResolvedValue({ id: 'user-123', name: 'Pat Example' });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/profile',
        headers: { 'content-type': 'application/json' },
        payload: JSON.stringify({
          email: 'not-an-email'
        })
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({ error: 'Invalid email format' });
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('auto-updates name when first or last name changes', async () => {
      getUserById.mockResolvedValue({
        id: 'user-123',
        firstName: 'Pat',
        lastName: 'Example',
        name: 'Pat Example'
      });

      mockPrisma.user.update.mockResolvedValue({
        id: 'user-123',
        email: 'person@example.com',
        name: 'Pat Taylor',
        firstName: 'Pat',
        lastName: 'Taylor',
        skills: '[]',
        workExperiences: '[]',
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/profile',
        headers: { 'content-type': 'application/json' },
        payload: JSON.stringify({
          lastName: 'Taylor'
        })
      });

      expect(response.statusCode).toBe(200);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          lastName: 'Taylor',
          name: 'Pat Taylor'
        },
        select: expect.any(Object)
      });
      expect(response.json().user.name).toBe('Pat Taylor');
    });
  });
});


