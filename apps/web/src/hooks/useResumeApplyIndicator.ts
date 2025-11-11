import { useCallback, useEffect, useRef, useState } from 'react';
import { analytics } from '../utils/analytics';

export type ResumeApplySource = 'file' | 'existing';

export interface ResumeApplyContext {
  resumeId: string;
  source: ResumeApplySource;
}

export interface ResumeApplySuccessPayload extends ResumeApplyContext {
  resumeRecord?: unknown;
}

export interface ResumeApplyErrorPayload extends ResumeApplyContext {
  message: string;
}

export type ResumeApplyStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ResumeApplyState {
  status: ResumeApplyStatus;
  resumeId?: string;
  source?: ResumeApplySource;
  message?: string;
}

export interface ResumeApplyIndicator {
  state: ResumeApplyState;
  message: string | null;
  onApplyStart: (payload: ResumeApplyContext) => void;
  onApplySuccess: (payload: ResumeApplySuccessPayload) => void;
  onApplyError: (payload: ResumeApplyErrorPayload) => void;
  onApplyComplete: (payload: ResumeApplyContext) => void;
  reset: () => void;
}

const SUCCESS_TIMEOUT_MS = 2500;
const ERROR_TIMEOUT_MS = 5000;

const getDefaultMessage = (status: ResumeApplyStatus, source?: ResumeApplySource) => {
  switch (status) {
    case 'loading':
      return source === 'file' ? 'Parsing resume file…' : 'Applying resume…';
    case 'success':
      return source === 'file' ? 'Resume parsed and applied to editor!' : 'Resume applied to editor!';
    case 'error':
      return 'Failed to apply resume';
    default:
      return null;
  }
};

export const useResumeApplyIndicator = (): ResumeApplyIndicator => {
  const [state, setState] = useState<ResumeApplyState>({ status: 'idle' });
  const timeoutRef = useRef<number | null>(null);

  const clearPendingTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleReset = useCallback((status: ResumeApplyStatus) => {
    clearPendingTimeout();
    if (status === 'success' || status === 'error') {
      const delay = status === 'success' ? SUCCESS_TIMEOUT_MS : ERROR_TIMEOUT_MS;
      timeoutRef.current = window.setTimeout(() => {
        setState({ status: 'idle' });
        timeoutRef.current = null;
      }, delay);
    }
  }, [clearPendingTimeout]);

  const onApplyStart = useCallback((payload: ResumeApplyContext) => {
    clearPendingTimeout();
    setState({ status: 'loading', ...payload, message: getDefaultMessage('loading', payload.source) });
    analytics.track('resume_apply_start', payload);
  }, [clearPendingTimeout]);

  const onApplySuccess = useCallback((payload: ResumeApplySuccessPayload) => {
    clearPendingTimeout();
    setState({
      status: 'success',
      resumeId: payload.resumeId,
      source: payload.source,
      message: payload.resumeRecord
        ? getDefaultMessage('success', payload.source)
        : getDefaultMessage('success', payload.source),
    });
    analytics.track('resume_apply_success', {
      resumeId: payload.resumeId,
      source: payload.source,
      hasRecord: Boolean(payload.resumeRecord),
    });
    scheduleReset('success');
  }, [clearPendingTimeout, scheduleReset]);

  const onApplyError = useCallback((payload: ResumeApplyErrorPayload) => {
    clearPendingTimeout();
    const message = payload.message || getDefaultMessage('error', payload.source) || undefined;
    setState({ status: 'error', resumeId: payload.resumeId, source: payload.source, message });
    analytics.track('resume_apply_error', {
      resumeId: payload.resumeId,
      source: payload.source,
      message,
    });
    scheduleReset('error');
  }, [clearPendingTimeout, scheduleReset]);

  const onApplyComplete = useCallback((payload: ResumeApplyContext) => {
    analytics.track('resume_apply_complete', payload);
    setState(prev => {
      if (prev.status === 'loading' && prev.resumeId === payload.resumeId) {
        return { status: 'idle' };
      }
      return prev;
    });
  }, []);

  const reset = useCallback(() => {
    clearPendingTimeout();
    setState({ status: 'idle' });
  }, [clearPendingTimeout]);

  useEffect(() => () => clearPendingTimeout(), [clearPendingTimeout]);

  const message = state.status === 'idle'
    ? null
    : state.message ?? getDefaultMessage(state.status, state.source);

  return {
    state,
    message,
    onApplyStart,
    onApplySuccess,
    onApplyError,
    onApplyComplete,
    reset,
  };
};
