/**
 * Ensures work experience technologies are preserved when fetching a profile
 */

const Fastify = require('fastify');

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
  },
  workExperience: {
    findMany: jest.fn(),
  },
};

jest.mock('../utils/db', () => ({
  prisma: mockPrisma,
}));

jest.mock('../middleware/auth', () => ({
  authenticate: async (request) => {
    request.user = { userId: 'user-123' };
  },
}));

describe('User Profile Routes - technologies field', () => {
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

  it('returns technologies for each work experience', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      emailNotifications: true,
      smsNotifications: false,
      privacyLevel: 'Professional',
      profileVisibility: 'Public',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
      profile: {
        id: 'profile-123',
        firstName: 'Test',
        lastName: 'User',
        phone: null,
        personalEmail: null,
        location: 'Remote',
        professionalBio: null,
        profilePicture: null,
        linkedin: null,
        github: null,
        portfolio: null,
        website: null,
        createdAt: new Date('2024-01-01T00:00:00Z'),
        updatedAt: new Date('2024-01-02T00:00:00Z'),
        workExperiences: [
          {
            id: 'exp-1',
            company: 'Mock Corp',
            role: 'Engineer',
            location: 'Remote',
            startDate: '2023-01',
            endDate: null,
            isCurrent: true,
            description: 'Built awesome things.',
            projectType: 'Full-time',
            technologies: ['React', 'Node.js'],
          },
        ],
        education: [],
        certifications: [],
        languages: [],
        userSkills: [],
        projects: [],
      },
    });

    mockPrisma.workExperience.findMany.mockResolvedValue([]);

    const response = await app.inject({
      method: 'GET',
      url: '/api/users/profile',
    });

    expect(response.statusCode).toBe(200);

    const selectArg = mockPrisma.user.findUnique.mock.calls[0][0].select;
    expect(
      selectArg.profile.select.workExperiences.select.technologies
    ).toBe(true);

    const payload = response.json();
    expect(payload.user.workExperiences).toHaveLength(1);
    expect(payload.user.workExperiences[0]).toMatchObject({
      company: 'Mock Corp',
      technologies: ['React', 'Node.js'],
    });
  });
});


