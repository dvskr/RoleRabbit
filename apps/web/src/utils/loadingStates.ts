import React from 'react';

/**
 * Loading States Utility
 * Centralized loading state management
 */

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface LoadingHookReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  state: LoadingState;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export const createLoadingHook = <T>(
  asyncFn: (...args: any[]) => Promise<T>
): Omit<LoadingHookReturn<T>, 'execute'> => {
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [state, setState] = React.useState<LoadingState>('idle');

  const execute = async (...args: any[]) => {
    try {
      setState('loading');
      setError(null);
      const result = await asyncFn(...args);
      setData(result);
      setState('success');
    } catch (err) {
      setError(err as Error);
      setState('error');
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setState('idle');
  };

  return {
    data,
    loading: state === 'loading',
    error,
    state,
    execute,
    reset
  };
};

