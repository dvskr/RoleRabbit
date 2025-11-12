const mockCreate = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

const mockTrackAIUsage = jest.fn();

jest.mock('../utils/aiUsageTracker', () => ({
  trackAIUsage: jest.fn((...args) => mockTrackAIUsage(...args)),
}));

describe('OpenAI generateText usage tracking', () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV, OPENAI_API_KEY: 'test-key' };
    mockCreate.mockReset();
    mockTrackAIUsage.mockReset();
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it('tracks AI usage when userId is provided', async () => {
    mockCreate.mockResolvedValueOnce({
      usage: {
        total_tokens: 120,
        prompt_tokens: 70,
        completion_tokens: 50,
      },
      choices: [{ message: { content: 'Response' } }],
      model: 'gpt-4o-mini',
    });

    jest.useFakeTimers();
    const { generateText } = require('../utils/openAI');

    await generateText('hello world', { userId: 'user-123', model: 'gpt-4o-mini' });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockTrackAIUsage).toHaveBeenCalledTimes(1);
    expect(mockTrackAIUsage.mock.calls[0][0]).toBe('user-123');
    expect(mockTrackAIUsage.mock.calls[0][1]).toMatchObject({
      endpoint: 'chat/completions',
      model: 'gpt-4o-mini',
      tokens: 120,
      cost: expect.any(Number),
    });
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('does not track usage when userId is missing', async () => {
    mockCreate.mockResolvedValueOnce({
      usage: {
        total_tokens: 80,
        prompt_tokens: 40,
        completion_tokens: 40,
      },
      choices: [{ message: { content: 'Response' } }],
      model: 'gpt-4o-mini',
    });

    jest.useFakeTimers();
    const { generateText } = require('../utils/openAI');

    await generateText('no user', { model: 'gpt-4o-mini' });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockTrackAIUsage).not.toHaveBeenCalled();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('translates OpenAI quota errors into friendly messages', async () => {
    mockCreate.mockRejectedValueOnce({
      message: 'You exceeded your current quota, please check your plan and billing details.',
      code: 'insufficient_quota',
      response: { status: 429 },
    });

    const { generateText } = require('../utils/openAI');

    await expect(generateText('quota', { model: 'gpt-4o-mini' })).rejects.toMatchObject({
      statusCode: 429,
      code: 'AI_QUOTA_EXCEEDED',
      message: expect.stringContaining('usage limit'),
    });
  });

  it('throws a timeout error when OpenAI does not respond in time', async () => {
    jest.useFakeTimers();
    mockCreate.mockImplementation(() => new Promise(() => {}));

    const { generateText } = require('../utils/openAI');

    const promise = generateText('slow', { model: 'gpt-4o-mini', timeout: 1000 });

    jest.advanceTimersByTime(1000);

    await expect(promise).rejects.toMatchObject({
      statusCode: 408,
      code: 'AI_TIMEOUT',
      message: expect.stringContaining('timed out'),
    });

    jest.useRealTimers();
  });
});

