import { useReducer, useEffect } from 'react';

type ReducerAction<T> = T | ((prevState: T) => T);

export function useReducerLocalStorage<T>(
  key: string,
  initialValue: T,
  reducer: (state: T, action: ReducerAction<T>) => T
) {
  const [state, dispatch] = useReducer(
    (state: T, action: ReducerAction<T>) => {
      const newState = reducer(state, action);
      try {
        localStorage.setItem(key, JSON.stringify(newState));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      return newState;
    },
    initialValue,
    (initial) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : initial;
      } catch (error) {
        console.error('Error reading from localStorage:', error);
        return initial;
      }
    }
  );

  return [state, dispatch] as const;
}

