/**
 * Tests for user profile routes
 */

const Fastify = require('fastify');

// Create shared Prisma mock that routes will import
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn()
  },
  workExperience: {
    findMany: jest.fn()
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
        emailNotifications: true,
        smsNotifications: false,
        privacyLevel: 'Professional',
        profileVisibility: 'Public',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
        profile: {
          id: 'profile-123',
          firstName: 'Pat',
          lastName: 'Example',
          phone: '1234567890',
          personalEmail: 'pat.personal@example.com',
          location: 'Remote',
          professionalBio: 'Seasoned engineer',
          profilePicture: null,
          linkedin: 'https://linkedin.com/in/pat',
          github: 'https://github.com/pat',
          portfolio: 'https://pat.dev',
          website: 'https://pat.blog',
          createdAt: new Date('2025-01-01T00:00:00Z'),
          updatedAt: new Date('2025-01-02T00:00:00Z'),
          workExperiences: [
            {
              id: 'exp-1',
              company: 'RoleReady',
              role: 'Developer',
              location: 'Remote',
              startDate: '2023-01',
              endDate: null,
              isCurrent: true,
              description: 'Building great products',
              projectType: 'Full-time',
              technologies: ['React', 'Node.js']
            }
          ],
          education: [
            {
              id: 'edu-1',
              institution: 'Uni',
              degree: 'BS',
              field: 'Computer Science',
              startDate: '2018',
              endDate: '2022',
              gpa: '3.9',
              honors: null,
              location: 'NY',
              description: ''
            }
          ],
          certifications: [],
          languages: [
            { id: 'lang-1', name: 'English', proficiency: 'Native' }
          ],
          userSkills: [
            {
              id: 'skill-rel-1',
              yearsOfExperience: 3,
              verified: false,
              skill: {
                id: 'skill-1',
                name: 'React',
                category: 'Technical'
              }
            }
          ],
          projects: []
        }
      });
      mockPrisma.workExperience.findMany.mockResolvedValue([]);

      const response = await app.inject({
        method: 'GET',
        url: '/api/users/profile'
      });

      expect(response.statusCode).toBe(200);
      const payload = response.json();

      expect(payload.user.email).toBe('person@example.com');
      expect(payload.user.skills).toEqual([
        {
          name: 'React',
          yearsOfExperience: 3,
          verified: false
        }
      ]);
      expect(payload.user.workExperiences[0]).toMatchObject({
        company: 'RoleReady',
        role: 'Developer',
        technologies: ['React', 'Node.js']
      });
      expect(payload.user.education[0]).toMatchObject({
        institution: 'Uni',
        degree: 'BS'
      });
      expect(payload.user.languages).toEqual([
        { id: 'lang-1', name: 'English', proficiency: 'Native' }
      ]);
      expect(payload.user.socialLinks).toEqual([
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/pat' },
        { platform: 'GitHub', url: 'https://github.com/pat' },
        { platform: 'Portfolio', url: 'https://pat.dev' },
        { platform: 'Website', url: 'https://pat.blog' }
      ]);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.any(Object)
      });
      expect(mockPrisma.workExperience.findMany).toHaveBeenCalledWith({
        where: { profileId: 'profile-123' }
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
    it('rejects attempts to change login email', async () => {
      getUserById.mockResolvedValue({ id: 'user-123', name: 'Pat Example' });

      const response = await app.inject({
        method: 'PUT',
        url: '/api/users/profile',
        headers: { 'content-type': 'application/json' },
        payload: JSON.stringify({
          email: 'new-email@example.com'
        })
      });

      expect(response.statusCode).toBe(400);
      expect(response.json()).toEqual({
        error: 'Login email cannot be changed. Use personal email field for contact information.',
        hint: 'The email you use to log in cannot be modified. If you need to update your contact email, use the "Personal Email" field in your profile.'
      });
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });
  });
});


