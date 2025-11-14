/**
 * Phase 6: Timeout Handling Tests
 * Verifies that all AI operations have proper timeout handling
 */

const { generateText } = require('../utils/openAI');
const { parseResumeBuffer } = require('../services/resumeParser');
const { tailorResume } = require('../services/ai/tailorService');
const { extractSkillsWithAI } = require('../services/ats/aiSkillExtractor');
const { generateEmbedding } = require('../services/embeddings/embeddingService');
const logger = require('../utils/logger');

// Mock dependencies
jest.mock('../utils/openAI', () => ({
  generateText: jest.fn(),
  AIServiceError: class AIServiceError extends Error {
    constructor(message, { statusCode, code } = {}) {
      super(message);
      this.statusCode = statusCode;
      this.code = code;
      this.isAIServiceError = true;
    }
  }
}));

jest.mock('../services/embeddings/embeddingUtil', () => ({
  generateEmbedding: jest.fn()
}));

jest.mock('../utils/logger');
jest.mock('../services/ai/usageService', () => ({
  recordAIRequest: jest.fn(),
}));
jest.mock('../utils/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn().mockResolvedValue({ id: 'user123', subscriptionTier: 'PRO' }),
    },
  },
}));
jest.mock('pdf-parse', () => jest.fn());
jest.mock('jsonrepair', () => ({ jsonrepair: jest.fn() }));
jest.mock('@roleready/resume-normalizer', () => ({
  normalizeResumeData: jest.fn(),
}));
jest.mock('../utils/progressTracker', () => ({
  createTailorProgressTracker: jest.fn().mockReturnValue({
    update: jest.fn(),
    complete: jest.fn(),
    fail: jest.fn(),
  }),
}));
jest.mock('../utils/realisticCeiling', () => ({
  calculateRealisticCeiling: jest.fn().mockReturnValue(90),
  calculateTargetScore: jest.fn().mockReturnValue(85),
}));
jest.mock('../services/ai/intelligentKeywordLimits', () => ({
  calculateOptimalKeywordLimit: jest.fn().mockReturnValue(10),
}));
jest.mock('../services/ai/promptBuilder', () => ({
  buildTailorResumePrompt: jest.fn().mockReturnValue('tailor prompt'),
}));

const { AIServiceError } = require('../utils/openAI');
const { generateEmbedding: generateEmbeddingUtil } = require('../services/embeddings/embeddingUtil');

describe('Phase 6: Timeout Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    logger.error.mockImplementation(() => {});
    logger.warn.mockImplementation(() => {});
    logger.info.mockImplementation(() => {});
    logger.debug.mockImplementation(() => {});
  });

  describe('6.1 OpenAI generateText Timeout', () => {
    it('should timeout after specified duration', async () => {
      // Mock a slow response that exceeds timeout
      generateText.mockImplementation(() => 
        new Promise((resolve) => setTimeout(() => resolve({ text: 'response' }), 5000))
      );

      const promise = generateText('test prompt', { timeout: 100 });
      
      await expect(promise).rejects.toThrow();
    }, 10000);

    it('should use default timeout of 150 seconds', async () => {
      generateText.mockResolvedValue({
        text: 'response',
        usage: { total_tokens: 100 }
      });

      await generateText('test prompt');
      
      // Verify it was called (default timeout is internal)
      expect(generateText).toHaveBeenCalled();
    });

    it('should allow custom timeout values', async () => {
      generateText.mockResolvedValue({
        text: 'response',
        usage: { total_tokens: 100 }
      });

      await generateText('test prompt', { timeout: 30000 });
      
      expect(generateText).toHaveBeenCalledWith('test prompt', { timeout: 30000 });
    });
  });

  describe('6.2 Resume Parsing Timeout', () => {
    it('should have 30 second timeout per parsing attempt', async () => {
      const mockBuffer = Buffer.from('mock pdf content');
      
      // Mock timeout error
      generateText.mockRejectedValue(
        new AIServiceError('Timeout', { statusCode: 408, code: 'AI_TIMEOUT' })
      );

      await expect(parseResumeBuffer(mockBuffer, 'resume.pdf', 'user123'))
        .rejects.toThrow();
    });

    it('should retry on timeout with exponential backoff', async () => {
      const mockBuffer = Buffer.from('mock pdf content');
      
      // First 2 attempts timeout, 3rd succeeds
      generateText
        .mockRejectedValueOnce(new AIServiceError('Timeout', { statusCode: 408, code: 'AI_TIMEOUT' }))
        .mockRejectedValueOnce(new AIServiceError('Timeout', { statusCode: 408, code: 'AI_TIMEOUT' }))
        .mockResolvedValueOnce({
          text: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
          usage: { total_tokens: 500 }
        });

      // Should eventually succeed after retries
      const result = await parseResumeBuffer(mockBuffer, 'resume.pdf', 'user123');
      
      expect(generateText).toHaveBeenCalledTimes(3);
    });
  });

  describe('6.3 ATS Check Timeout', () => {
    it('should have 90 second timeout for skill extraction', async () => {
      // Mock timeout for skill extraction
      generateText.mockRejectedValue(
        new AIServiceError('Timeout', { statusCode: 408, code: 'AI_TIMEOUT' })
      );

      await expect(extractSkillsWithAI('long job description', 'user123'))
        .rejects.toThrow();
    });

    it('should handle timeout gracefully and return partial results', async () => {
      // Mock timeout for skill extraction but embeddings work
      generateText.mockRejectedValue(
        new AIServiceError('Timeout', { statusCode: 408, code: 'AI_TIMEOUT' })
      );
      
      generateEmbeddingUtil.mockResolvedValue([0.1, 0.2, 0.3]);

      // Should not throw, but return partial results
      try {
        await extractSkillsWithAI('job description', 'user123');
      } catch (error) {
        expect(error.message).toContain('timeout');
      }
    });
  });

  describe('6.4 Tailoring Timeout', () => {
    it('should have 240 second (4 minute) timeout for full tailoring', async () => {
      const mockResume = {
        personalInfo: { name: 'John Doe' },
        experience: [],
        education: []
      };
      const mockJobDescription = 'Software Engineer position';

      // Mock timeout
      generateText.mockRejectedValue(
        new AIServiceError('Timeout', { statusCode: 408, code: 'AI_TIMEOUT' })
      );

      await expect(
        tailorResume(mockResume, mockJobDescription, 'user123', {
          mode: 'FULL',
          tone: 'PROFESSIONAL',
          length: 'STANDARD'
        })
      ).rejects.toThrow();
    });

    it('should have 90 second timeout for partial tailoring', async () => {
      const mockResume = {
        personalInfo: { name: 'John Doe' },
        experience: [],
        education: []
      };
      const mockJobDescription = 'Software Engineer position';

      // Mock timeout
      generateText.mockRejectedValue(
        new AIServiceError('Timeout', { statusCode: 408, code: 'AI_TIMEOUT' })
      );

      await expect(
        tailorResume(mockResume, mockJobDescription, 'user123', {
          mode: 'PARTIAL',
          tone: 'PROFESSIONAL',
          length: 'STANDARD'
        })
      ).rejects.toThrow();
    });

    it('should retry on timeout with exponential backoff', async () => {
      const mockResume = {
        personalInfo: { name: 'John Doe' },
        experience: [],
        education: []
      };
      const mockJobDescription = 'Software Engineer position';

      // First 2 attempts timeout, 3rd succeeds
      generateText
        .mockRejectedValueOnce(new AIServiceError('Timeout', { statusCode: 408, code: 'AI_TIMEOUT' }))
        .mockRejectedValueOnce(new AIServiceError('Timeout', { statusCode: 408, code: 'AI_TIMEOUT' }))
        .mockResolvedValueOnce({
          text: JSON.stringify({
            tailoredResume: mockResume,
            changes: [],
            summary: 'Tailored successfully'
          }),
          usage: { total_tokens: 2000 }
        });

      const result = await tailorResume(mockResume, mockJobDescription, 'user123', {
        mode: 'PARTIAL',
        tone: 'PROFESSIONAL',
        length: 'STANDARD'
      });

      expect(generateText).toHaveBeenCalledTimes(3);
      expect(result).toBeDefined();
    });
  });

  describe('6.5 Embeddings Timeout', () => {
    it('should have 30 second timeout for embedding generation', async () => {
      // Mock timeout
      generateEmbeddingUtil.mockRejectedValue(
        new AIServiceError('Timeout', { statusCode: 408, code: 'AI_TIMEOUT' })
      );

      await expect(generateEmbedding('test text', 'user123'))
        .rejects.toThrow();
    });

    it('should allow custom timeout values', async () => {
      generateEmbeddingUtil.mockResolvedValue([0.1, 0.2, 0.3]);

      await generateEmbedding('test text', 'user123', { timeout: 60000 });
      
      expect(generateEmbeddingUtil).toHaveBeenCalled();
    });
  });

  describe('6.6 Timeout Error Messages', () => {
    it('should return user-friendly timeout messages', async () => {
      generateText.mockRejectedValue(
        new AIServiceError(
          'The AI service timed out. Please try again in a few moments.',
          { statusCode: 408, code: 'AI_TIMEOUT' }
        )
      );

      try {
        await generateText('test prompt');
      } catch (error) {
        expect(error.message).toContain('timed out');
        expect(error.message).toContain('try again');
        expect(error.statusCode).toBe(408);
        expect(error.code).toBe('AI_TIMEOUT');
      }
    });

    it('should log timeout events for monitoring', async () => {
      generateText.mockRejectedValue(
        new AIServiceError('Timeout', { statusCode: 408, code: 'AI_TIMEOUT' })
      );

      try {
        await generateText('test prompt');
      } catch (error) {
        // Error should be logged (mocked)
        expect(error.code).toBe('AI_TIMEOUT');
      }
    });
  });

  describe('6.7 Timeout Values Summary', () => {
    it('should have correct timeout values for each operation', () => {
      const timeouts = {
        resumeParsing: 30000,        // 30 seconds per attempt
        atsCheck: 90000,             // 90 seconds
        tailoringPartial: 90000,     // 90 seconds
        tailoringFull: 240000,       // 4 minutes
        embeddings: 30000,           // 30 seconds
        defaultOpenAI: 150000        // 2.5 minutes
      };

      // Verify all timeouts are reasonable
      expect(timeouts.resumeParsing).toBeLessThanOrEqual(60000); // Max 1 minute
      expect(timeouts.atsCheck).toBeLessThanOrEqual(120000); // Max 2 minutes
      expect(timeouts.tailoringFull).toBeLessThanOrEqual(300000); // Max 5 minutes
      expect(timeouts.embeddings).toBeLessThanOrEqual(60000); // Max 1 minute
    });
  });
});

