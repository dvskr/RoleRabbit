import { useState, useCallback } from 'react';

/**
 * Custom hook for toggling boolean states
 * 
 * @param initialValue - Initial boolean value
 * @returns [value, toggle function]
 */
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => setValue(prev => !prev), []);
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, { toggle, setTrue, setFalse }] as const;
}

