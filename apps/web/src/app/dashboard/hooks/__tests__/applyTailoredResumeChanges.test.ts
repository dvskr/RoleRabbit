import { applyTailoredResumeChanges } from '../useDashboardHandlers';

const baseTailorResult = {
  tailoredResume: {},
  diff: [],
  warnings: [],
  recommendedKeywords: [],
  ats: null,
  confidence: null,
  mode: 'PARTIAL',
  tailoredVersionId: 'tv-1',
} as const;

describe('applyTailoredResumeChanges', () => {
  it('returns false and skips save when no tailor result exists', async () => {
    const saveResume = jest.fn();
    const clearTailorResult = jest.fn();

    const success = await applyTailoredResumeChanges({
      tailorResult: null,
      saveResume,
      clearTailorResult,
    });

    expect(success).toBe(false);
    expect(saveResume).not.toHaveBeenCalled();
    expect(clearTailorResult).not.toHaveBeenCalled();
  });

  it('persists tailored resume and clears result on success', async () => {
    const saveResume = jest.fn().mockResolvedValue(true);
    const clearTailorResult = jest.fn();

    const success = await applyTailoredResumeChanges({
      tailorResult: baseTailorResult,
      saveResume,
      clearTailorResult,
    });

    expect(success).toBe(true);
    expect(saveResume).toHaveBeenCalledTimes(1);
    expect(clearTailorResult).toHaveBeenCalledTimes(1);
  });

  it('does not clear tailor result when save fails', async () => {
    const saveResume = jest.fn().mockResolvedValue(false);
    const clearTailorResult = jest.fn();

    const success = await applyTailoredResumeChanges({
      tailorResult: baseTailorResult,
      saveResume,
      clearTailorResult,
    });

    expect(success).toBe(false);
    expect(saveResume).toHaveBeenCalledTimes(1);
    expect(clearTailorResult).not.toHaveBeenCalled();
  });
});

