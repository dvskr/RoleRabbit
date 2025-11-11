import { createApplyChangesHandler } from '../AIPanelRedesigned';

describe('createApplyChangesHandler', () => {
  const baseDeps = () => ({
    confirmTailorChanges: jest.fn().mockResolvedValue(true),
    analyzeJobDescription: jest.fn().mockResolvedValue(undefined),
    setApplyError: jest.fn(),
    setBeforeScore: jest.fn(),
  });

  it('runs confirm handler and triggers ATS analysis on success', async () => {
    const deps = baseDeps();
    const handler = createApplyChangesHandler(deps);

    await handler();

    expect(deps.confirmTailorChanges).toHaveBeenCalledTimes(1);
    expect(deps.analyzeJobDescription).toHaveBeenCalledTimes(1);
    expect(deps.setBeforeScore).toHaveBeenCalledWith(null);
    expect(deps.setApplyError).toHaveBeenCalledWith(null);
  });

  it('surfaces failure message when confirm handler returns false', async () => {
    const deps = baseDeps();
    deps.confirmTailorChanges.mockResolvedValue(false);
    const handler = createApplyChangesHandler(deps);

    await handler();

    expect(deps.setApplyError).toHaveBeenLastCalledWith(
      'Failed to save tailored changes. Please try again.'
    );
    expect(deps.analyzeJobDescription).not.toHaveBeenCalled();
  });

  it('handles thrown errors and displays friendly message', async () => {
    const deps = baseDeps();
    deps.confirmTailorChanges.mockRejectedValue(new Error('network'));
    const handler = createApplyChangesHandler(deps);

    await handler();

    expect(deps.setApplyError).toHaveBeenLastCalledWith('network');
    expect(deps.analyzeJobDescription).not.toHaveBeenCalled();
  });

  it('falls back to default error message when error has no message', async () => {
    const deps = baseDeps();
    deps.confirmTailorChanges.mockRejectedValue({});
    const handler = createApplyChangesHandler(deps);

    await handler();

    expect(deps.setApplyError).toHaveBeenLastCalledWith(
      'Failed to save tailored changes. Please try again.'
    );
  });
});

