/**
 * Tests for Retry with Exponential Backoff
 */

const { retryWithBackoff, retryOpenAIOperation, shouldRetryOpenAIError } = require('./retryWithBackoff');
const { AIServiceError } = require('./openAI');

describe('retryWithBackoff', () => {
  
  describe('shouldRetryOpenAIError', () => {
    it('should NOT retry invalid API key errors', () => {
      const error = new AIServiceError('Invalid API key', { code: 'AI_INVALID_KEY' });
      expect(shouldRetryOpenAIError(error, 1)).toBe(false);
    });

    it('should NOT retry quota exceeded errors', () => {
      const error = new AIServiceError('Quota exceeded', { code: 'AI_QUOTA_EXCEEDED' });
      expect(shouldRetryOpenAIError(error, 1)).toBe(false);
    });

    it('should retry timeout errors', () => {
      const error = new AIServiceError('Timeout', { code: 'AI_TIMEOUT', statusCode: 408 });
      expect(shouldRetryOpenAIError(error, 1)).toBe(true);
    });

    it('should retry rate limit errors', () => {
      const error = new AIServiceError('Rate limit', { code: 'AI_RATE_LIMIT', statusCode: 429 });
      expect(shouldRetryOpenAIError(error, 1)).toBe(true);
    });

    it('should retry 500-level errors', () => {
      const error = new AIServiceError('Server error', { statusCode: 503 });
      expect(shouldRetryOpenAIError(error, 1)).toBe(true);
    });

    it('should NOT retry 400-level errors except 408 and 429', () => {
      const error400 = new AIServiceError('Bad request', { statusCode: 400 });
      const error404 = new AIServiceError('Not found', { statusCode: 404 });
      expect(shouldRetryOpenAIError(error400, 1)).toBe(false);
      expect(shouldRetryOpenAIError(error404, 1)).toBe(false);
    });

    it('should retry network errors', () => {
      const error = new Error('Connection reset');
      error.code = 'ECONNRESET';
      expect(shouldRetryOpenAIError(error, 1)).toBe(true);
    });
  });

  describe('retryWithBackoff basic functionality', () => {
    it('should succeed on first attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(mockFn, { maxAttempts: 3 });
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry and succeed on second attempt', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValueOnce('success');
      
      const result = await retryWithBackoff(mockFn, {
        maxAttempts: 3,
        initialDelay: 10 // Fast for testing
      });
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should retry maximum times and then throw', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Persistent failure'));
      
      await expect(
        retryWithBackoff(mockFn, {
          maxAttempts: 3,
          initialDelay: 10
        })
      ).rejects.toThrow('Persistent failure');
      
      expect(mockFn).toHaveBeenCalledTimes(3);
    });

    it('should not retry if shouldRetry returns false', async () => {
      const mockFn = jest.fn().mockRejectedValue(new Error('Non-retryable'));
      
      await expect(
        retryWithBackoff(mockFn, {
          maxAttempts: 3,
          initialDelay: 10,
          shouldRetry: () => false
        })
      ).rejects.toThrow('Non-retryable');
      
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should call onRetry callback', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Retry me'))
        .mockResolvedValueOnce('success');
      
      const onRetry = jest.fn();
      
      await retryWithBackoff(mockFn, {
        maxAttempts: 3,
        initialDelay: 10,
        onRetry
      });
      
      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(
        expect.any(Error),
        1,
        expect.any(Number)
      );
    });

    it('should implement exponential backoff', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');
      
      const delays = [];
      const onRetry = jest.fn((error, attempt, delay) => {
        delays.push(delay);
      });
      
      await retryWithBackoff(mockFn, {
        maxAttempts: 3,
        initialDelay: 100,
        backoffMultiplier: 2,
        onRetry
      });
      
      expect(delays).toEqual([100, 200]);
    });

    it('should respect maxDelay', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockResolvedValueOnce('success');
      
      const delays = [];
      const onRetry = jest.fn((error, attempt, delay) => {
        delays.push(delay);
      });
      
      await retryWithBackoff(mockFn, {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 1500,
        backoffMultiplier: 2,
        onRetry
      });
      
      expect(delays[0]).toBe(1000);
      expect(delays[1]).toBe(1500); // Capped at maxDelay
    });
  });

  describe('retryOpenAIOperation', () => {
    it('should use correct defaults for OpenAI operations', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      
      const result = await retryOpenAIOperation(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry OpenAI timeout errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new AIServiceError('Timeout', { code: 'AI_TIMEOUT' }))
        .mockResolvedValueOnce('success');
      
      const result = await retryOpenAIOperation(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should NOT retry OpenAI invalid key errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValue(new AIServiceError('Invalid key', { code: 'AI_INVALID_KEY' }));
      
      await expect(retryOpenAIOperation(mockFn)).rejects.toThrow('Invalid key');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry OpenAI 503 errors', async () => {
      const mockFn = jest.fn()
        .mockRejectedValueOnce(new AIServiceError('Service unavailable', { statusCode: 503 }))
        .mockResolvedValueOnce('success');
      
      const result = await retryOpenAIOperation(mockFn);
      
      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
  });
});

