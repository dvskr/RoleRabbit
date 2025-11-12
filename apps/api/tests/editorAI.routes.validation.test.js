const Fastify = require('fastify');

const mockPrisma = {
  user: {
    findUnique: jest.fn()
  },
  baseResume: {
    findFirst: jest.fn()
  }
};

jest.mock('../utils/db', () => ({
  prisma: mockPrisma
}));

jest.mock('../middleware/auth', () => ({
  authenticate: async (request) => {
    request.user = { userId: 'user-123' };
  }
}));

const mockGenerateSectionDraft = jest.fn();
jest.mock('../services/ai/generateContentService', () => ({
  generateSectionDraft: mockGenerateSectionDraft
}));

const mockDraftService = {
  applyDraft: jest.fn(),
  getDraft: jest.fn()
};
jest.mock('../services/ai/draftService', () => mockDraftService);

const mockTailorResume = jest.fn();
const mockApplyRecommendations = jest.fn();
const mockGenerateCoverLetter = jest.fn();
const mockGeneratePortfolio = jest.fn();
jest.mock('../services/ai/tailorService', () => ({
  tailorResume: mockTailorResume,
  applyRecommendations: mockApplyRecommendations,
  generateCoverLetter: mockGenerateCoverLetter,
  generatePortfolio: mockGeneratePortfolio
}));

const mockRecordAIRequest = jest.fn();
const mockEnsureActionAllowed = jest.fn();
jest.mock('../services/ai/usageService', () => ({
  recordAIRequest: mockRecordAIRequest,
  AIUsageError: class extends Error {},
  ensureActionAllowed: mockEnsureActionAllowed,
  ensureWithinRateLimit: jest.fn()
}));

jest.mock('../utils/cacheManager', () => ({
  invalidateNamespace: jest.fn(() => Promise.resolve()),
  wrap: jest.fn(async ({ fetch }) => ({
    value: await fetch(),
    hit: false
  })),
  set: jest.fn(() => Promise.resolve())
}));

jest.mock('../config/cacheConfig', () => ({
  atsScoreTtlMs: 1000,
  jobAnalysisTtlMs: 1000
}));

jest.mock('../services/ats/atsScoringService', () => ({
  scoreResumeAgainstJob: jest.fn(() => ({
    overall: 80,
    matchedKeywords: [],
    missingKeywords: []
  })),
  hashJobDescription: jest.fn(() => 'hash-123')
}));

jest.mock('../services/ats/worldClassATS', () => ({
  scoreResumeWorldClass: jest.fn(async () => ({
    overall: 82,
    matchedKeywords: [],
    missingKeywords: [],
    strengths: [],
    improvements: []
  }))
}));

jest.mock('../observability/metrics', () => ({
  atsScoreCounter: { inc: jest.fn() },
  atsScoreGauge: { set: jest.fn() }
}));

describe('Editor AI routes validation', () => {
  let app;

  beforeAll(async () => {
    app = Fastify();
    await app.register(require('../routes/editorAI.routes'));
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.user.findUnique.mockReset();
    mockGenerateSectionDraft.mockReset();
  });

  it('rejects generate-content requests missing sectionPath', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/editor/ai/generate-content',
      payload: {
        resumeId: 'resume-123',
        sectionType: 'summary'
      }
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('sectionPath is required');
    expect(Array.isArray(body.details)).toBe(true);
    expect(mockGenerateSectionDraft).not.toHaveBeenCalled();
  });

  it('accepts generate-content requests with valid payloads', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user-123',
      subscriptionTier: 'PRO',
      activeBaseResumeId: 'resume-123'
    });

    mockGenerateSectionDraft.mockResolvedValue({
      draft: { summary: 'Updated summary content' },
      ai: { provider: 'openai', model: 'gpt-4o' },
      usage: { tokens: 100 }
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/editor/ai/generate-content',
      payload: {
        resumeId: 'resume-123',
        sectionPath: 'summary',
        sectionType: 'summary',
        currentContent: 'Existing content',
        jobContext: 'Context about job',
        tone: 'professional',
        length: 'thorough'
      }
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.success).toBe(true);
    expect(mockGenerateSectionDraft).toHaveBeenCalledTimes(1);
    expect(mockGenerateSectionDraft).toHaveBeenCalledWith(
      expect.objectContaining({
        resumeId: 'resume-123',
        sectionPath: 'summary',
        sectionType: 'summary',
        currentContent: 'Existing content',
        jobContext: 'Context about job',
        tone: 'professional',
        length: 'thorough'
      })
    );
  });

  it('rejects ATS check when jobDescription is too short', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/editor/ai/ats-check',
      payload: {
        resumeId: 'resume-123',
        jobDescription: 'Too short'
      }
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('jobDescription must be at least 10 characters long');
  });

  it('rejects tailor requests with unsupported mode', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/editor/ai/tailor',
      payload: {
        resumeId: 'resume-123',
        jobDescription: 'This is a sufficiently long job description.',
        mode: 'invalid-mode'
      }
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('mode must be FULL or PARTIAL');
    expect(body.details[0].path).toBe('mode');
  });
});

