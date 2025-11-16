/**
 * State Persistence Hooks
 * Section 1.10: State Persistence & Auto-save
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  removeFromLocalStorage,
  formatLastSaved,
  formatAbsoluteTime,
  isOnline,
  detectConflict,
  createOptimisticUpdate,
  deepEqual,
  type OptimisticUpdate,
  type ConflictInfo,
} from '../utils/statePersistence';

/**
 * Auto-save hook
 * Requirement #1: Auto-save every 30 seconds
 *
 * @example
 * ```tsx
 * const { saveStatus, lastSaved, triggerSave } = useAutoSave(
 *   portfolioData,
 *   async (data) => {
 *     await api.savePortfolio(data);
 *   },
 *   { interval: 30000, enabled: hasChanges }
 * );
 * ```
 */
export function useAutoSave<T>(
  data: T,
  saveFn: (data: T) => Promise<void>,
  options: {
    interval?: number; // Default: 30000ms (30 seconds)
    enabled?: boolean; // Default: true
    onSaveSuccess?: () => void;
    onSaveError?: (error: Error) => void;
  } = {}
) {
  const {
    interval = 30000,
    enabled = true,
    onSaveSuccess,
    onSaveError,
  } = options;

  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const dataRef = useRef(data);
  const lastSavedDataRef = useRef<T | null>(null);
  const saveInProgressRef = useRef(false);

  // Update data ref
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Manual save trigger
  const triggerSave = useCallback(async () => {
    if (saveInProgressRef.current) return;

    try {
      saveInProgressRef.current = true;
      setSaveStatus('saving');
      setError(null);

      await saveFn(dataRef.current);

      lastSavedDataRef.current = dataRef.current;
      setLastSaved(Date.now());
      setSaveStatus('saved');
      onSaveSuccess?.();

      // Reset to idle after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed');
      setError(error);
      setSaveStatus('error');
      onSaveError?.(error);
    } finally {
      saveInProgressRef.current = false;
    }
  }, [saveFn, onSaveSuccess, onSaveError]);

  // Auto-save interval
  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      // Only save if data has changed
      if (!deepEqual(dataRef.current, lastSavedDataRef.current)) {
        triggerSave();
      }
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, triggerSave]);

  return {
    saveStatus,
    lastSaved,
    error,
    triggerSave,
    isSaving: saveStatus === 'saving',
  };
}

/**
 * localStorage persistence hook
 * Requirement #2: localStorage fallback
 *
 * @example
 * ```tsx
 * const [formData, setFormData] = useLocalStorage('portfolio-form', initialData);
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    const saved = loadFromLocalStorage<T>(key);
    return saved !== null ? saved : initialValue;
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        saveToLocalStorage(key, valueToStore);
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    removeFromLocalStorage(key);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Unsaved changes warning hook
 * Requirement #3: beforeunload warning
 *
 * @example
 * ```tsx
 * useUnsavedChangesWarning(hasUnsavedChanges);
 * ```
 */
export function useUnsavedChangesWarning(hasUnsavedChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
        return ''; // Some browsers show this message
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);
}

/**
 * Last saved indicator hook
 * Requirement #4: Last saved at indicator
 *
 * @example
 * ```tsx
 * const { lastSavedText, lastSavedTime } = useLastSavedIndicator(lastSavedTimestamp);
 * // Returns: "Last saved 2 minutes ago" and "2:30 PM"
 * ```
 */
export function useLastSavedIndicator(lastSaved: number | null) {
  const [lastSavedText, setLastSavedText] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  useEffect(() => {
    if (!lastSaved) {
      setLastSavedText(null);
      setLastSavedTime(null);
      return;
    }

    const updateText = () => {
      setLastSavedText(formatLastSaved(lastSaved));
      setLastSavedTime(formatAbsoluteTime(lastSaved));
    };

    updateText();

    // Update every 10 seconds for relative time
    const interval = setInterval(updateText, 10000);

    return () => clearInterval(interval);
  }, [lastSaved]);

  return {
    lastSavedText,
    lastSavedTime,
  };
}

/**
 * Optimistic updates hook
 * Requirement #5: Optimistic updates with rollback
 *
 * @example
 * ```tsx
 * const { state, updateOptimistically, rollback } = useOptimisticUpdate(
 *   initialState,
 *   async (newState) => await api.update(newState)
 * );
 * ```
 */
export function useOptimisticUpdate<T>(
  initialState: T,
  updateFn: (state: T) => Promise<void>
) {
  const [state, setState] = useState<T>(initialState);
  const [updates, setUpdates] = useState<OptimisticUpdate<T>[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateOptimistically = useCallback(
    async (newState: T) => {
      const updateId = `update-${Date.now()}`;
      const update = createOptimisticUpdate(updateId, state, newState);

      // Immediately update UI (optimistic)
      setState(newState);
      setUpdates((prev) => [...prev, { ...update, status: 'pending' }]);
      setIsUpdating(true);

      try {
        // Attempt to save to server
        await updateFn(newState);

        // Mark update as successful
        setUpdates((prev) =>
          prev.map((u) => (u.id === updateId ? { ...u, status: 'success' as const } : u))
        );
        setIsUpdating(false);
      } catch (error) {
        // Rollback on error
        setState(update.previousState);
        setUpdates((prev) =>
          prev.map((u) => (u.id === updateId ? { ...u, status: 'error' as const } : u))
        );
        setIsUpdating(false);
        throw error;
      }
    },
    [state, updateFn]
  );

  const rollback = useCallback(() => {
    const lastUpdate = updates[updates.length - 1];
    if (lastUpdate) {
      setState(lastUpdate.previousState);
      setUpdates((prev) => prev.slice(0, -1));
    }
  }, [updates]);

  const clearSuccessful = useCallback(() => {
    setUpdates((prev) => prev.filter((u) => u.status !== 'success'));
  }, []);

  return {
    state,
    updateOptimistically,
    rollback,
    clearSuccessful,
    isUpdating,
    pendingUpdates: updates.filter((u) => u.status === 'pending').length,
    failedUpdates: updates.filter((u) => u.status === 'error').length,
  };
}

/**
 * Conflict detection hook
 * Requirement #6: Conflict detection
 *
 * @example
 * ```tsx
 * const { hasConflict, conflictInfo, checkConflict, resolveConflict } =
 *   useConflictDetection(localTimestamp);
 * ```
 */
export function useConflictDetection(localTimestamp: number) {
  const [conflictInfo, setConflictInfo] = useState<ConflictInfo | null>(null);

  const checkConflict = useCallback(
    (serverTimestamp: number) => {
      const info = detectConflict(localTimestamp, serverTimestamp);
      setConflictInfo(info);
      return info.hasConflict;
    },
    [localTimestamp]
  );

  const resolveConflict = useCallback(() => {
    setConflictInfo(null);
  }, []);

  return {
    hasConflict: conflictInfo?.hasConflict ?? false,
    conflictInfo,
    checkConflict,
    resolveConflict,
  };
}

/**
 * Online status hook
 * Helper for localStorage fallback
 *
 * @example
 * ```tsx
 * const { isOnline, wasOffline } = useOnlineStatus();
 * ```
 */
export function useOnlineStatus() {
  const [online, setOnline] = useState(isOnline());
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setWasOffline(true);
      // Reset wasOffline after 5 seconds
      setTimeout(() => setWasOffline(false), 5000);
    };

    const handleOffline = () => {
      setOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline: online,
    wasOffline,
  };
}

/**
 * Combined state persistence hook
 * Combines auto-save, localStorage, and conflict detection
 *
 * @example
 * ```tsx
 * const {
 *   data,
 *   setData,
 *   saveStatus,
 *   lastSaved,
 *   hasUnsavedChanges,
 *   hasConflict,
 * } = usePersistedState('portfolio', initialData, saveFn);
 * ```
 */
export function usePersistedState<T>(
  key: string,
  initialData: T,
  saveFn: (data: T) => Promise<{ timestamp: number }>,
  options: {
    autoSaveInterval?: number;
    enableAutoSave?: boolean;
  } = {}
) {
  const { autoSaveInterval = 30000, enableAutoSave = true } = options;

  // Local state
  const [data, setData] = useState<T>(initialData);
  const [serverTimestamp, setServerTimestamp] = useState<number>(Date.now());

  // localStorage backup
  const [localBackup, setLocalBackup] = useLocalStorage(
    `${key}-backup`,
    initialData
  );

  // Track changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const initialDataRef = useRef(initialData);

  // Auto-save
  const {
    saveStatus,
    lastSaved,
    triggerSave: save,
    isSaving,
  } = useAutoSave(
    data,
    async (dataToSave) => {
      const result = await saveFn(dataToSave);
      setServerTimestamp(result.timestamp);
      setHasUnsavedChanges(false);
      // Clear localStorage backup after successful save
      if (isOnline()) {
        setLocalBackup(initialData);
      }
    },
    {
      interval: autoSaveInterval,
      enabled: enableAutoSave && hasUnsavedChanges,
    }
  );

  // Conflict detection
  const { hasConflict, checkConflict, resolveConflict } = useConflictDetection(
    lastSaved || Date.now()
  );

  // Online status
  const { isOnline: online, wasOffline } = useOnlineStatus();

  // Unsaved changes warning
  useUnsavedChangesWarning(hasUnsavedChanges);

  // Update data and track changes
  const updateData = useCallback(
    (newData: T | ((prev: T) => T)) => {
      setData((prev) => {
        const updated = newData instanceof Function ? newData(prev) : newData;
        const changed = !deepEqual(updated, initialDataRef.current);
        setHasUnsavedChanges(changed);

        // Save to localStorage as backup
        setLocalBackup(updated);

        return updated;
      });
    },
    [setLocalBackup]
  );

  // Restore from localStorage on mount if offline
  useEffect(() => {
    if (!online && localBackup) {
      setData(localBackup);
      setHasUnsavedChanges(true);
    }
  }, []); // Only on mount

  // Sync when coming back online
  useEffect(() => {
    if (wasOffline && hasUnsavedChanges) {
      save();
    }
  }, [wasOffline, hasUnsavedChanges, save]);

  return {
    data,
    setData: updateData,
    saveStatus,
    lastSaved,
    isSaving,
    hasUnsavedChanges,
    hasConflict,
    isOnline: online,
    wasOffline,
    save,
    checkConflict,
    resolveConflict,
  };
}
