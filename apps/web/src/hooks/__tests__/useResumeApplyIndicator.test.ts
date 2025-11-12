import { renderHook, act } from '@testing-library/react';
import { useResumeApplyIndicator } from '../useResumeApplyIndicator';
import { analytics } from '../../utils/analytics';

type TrackSpy = jest.SpyInstance;

describe('useResumeApplyIndicator', () => {
  let trackSpy: TrackSpy;

  beforeEach(() => {
    trackSpy = jest.spyOn(analytics, 'track').mockImplementation(() => undefined);
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    trackSpy.mockRestore();
  });

  it('sets loading state and logs analytics on apply start', () => {
    const { result } = renderHook(() => useResumeApplyIndicator());

    act(() => {
      result.current.onApplyStart({ resumeId: 'resume-1', source: 'file' });
    });

    expect(result.current.state).toMatchObject({ status: 'loading', resumeId: 'resume-1', source: 'file' });
    expect(result.current.message).toBe('Parsing resume file…');
    expect(trackSpy).toHaveBeenCalledWith('resume_apply_start', { resumeId: 'resume-1', source: 'file' });
  });

  it('transitions to success, schedules auto reset, and logs analytics', () => {
    const { result } = renderHook(() => useResumeApplyIndicator());

    act(() => {
      result.current.onApplyStart({ resumeId: 'resume-1', source: 'existing' });
    });

    act(() => {
      result.current.onApplySuccess({ resumeId: 'resume-1', source: 'existing', resumeRecord: { id: 'resume-1' } });
    });

    expect(result.current.state.status).toBe('success');
    expect(result.current.message).toBe('Resume applied to editor!');
    expect(trackSpy).toHaveBeenLastCalledWith('resume_apply_success', {
      resumeId: 'resume-1',
      source: 'existing',
      hasRecord: true,
    });

    act(() => {
      jest.advanceTimersByTime(2500);
    });

    expect(result.current.state.status).toBe('idle');
  });

  it('transitions to error, schedules auto reset, and logs analytics', () => {
    const { result } = renderHook(() => useResumeApplyIndicator());

    act(() => {
      result.current.onApplyStart({ resumeId: 'resume-42', source: 'file' });
    });

    act(() => {
      result.current.onApplyError({ resumeId: 'resume-42', source: 'file', message: 'Boom' });
    });

    expect(result.current.state).toMatchObject({ status: 'error', resumeId: 'resume-42', source: 'file', message: 'Boom' });
    expect(result.current.message).toBe('Boom');
    expect(trackSpy).toHaveBeenLastCalledWith('resume_apply_error', {
      resumeId: 'resume-42',
      source: 'file',
      message: 'Boom',
    });

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(result.current.state.status).toBe('idle');
  });

  it('resets loading state on complete if still pending', () => {
    const { result } = renderHook(() => useResumeApplyIndicator());

    act(() => {
      result.current.onApplyStart({ resumeId: 'resume-9', source: 'existing' });
      result.current.onApplyComplete({ resumeId: 'resume-9', source: 'existing' });
    });

    expect(result.current.state.status).toBe('idle');
    expect(trackSpy).toHaveBeenLastCalledWith('resume_apply_complete', { resumeId: 'resume-9', source: 'existing' });
  });
});
