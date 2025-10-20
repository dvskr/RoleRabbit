import { useState, useCallback, useRef, useEffect } from 'react';

// Undo/Redo Hook
export const useUndoRedo = (initialState: any) => {
  const [history, setHistory] = useState([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentState = history[currentIndex];
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const saveState = useCallback((newState: any) => {
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  }, [history, currentIndex]);

  const undo = useCallback(() => {
    if (canUndo) {
      setCurrentIndex(currentIndex - 1);
      return history[currentIndex - 1];
    }
    return currentState;
  }, [canUndo, currentIndex, history, currentState]);

  const redo = useCallback(() => {
    if (canRedo) {
      setCurrentIndex(currentIndex + 1);
      return history[currentIndex + 1];
    }
    return currentState;
  }, [canRedo, currentIndex, history, currentState]);

  return {
    currentState,
    saveState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};

// Keyboard Shortcuts Hook
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, key } = event;
      const isCtrlOrCmd = ctrlKey || metaKey;

      if (isCtrlOrCmd) {
        switch (key.toLowerCase()) {
          case 'z':
            if (event.shiftKey) {
              shortcuts.redo?.();
            } else {
              shortcuts.undo?.();
            }
            event.preventDefault();
            break;
          case 'y':
            shortcuts.redo?.();
            event.preventDefault();
            break;
          case 's':
            shortcuts.save?.();
            event.preventDefault();
            break;
          case 'n':
            shortcuts.new?.();
            event.preventDefault();
            break;
          case 'o':
            shortcuts.open?.();
            event.preventDefault();
            break;
          case 'e':
            shortcuts.export?.();
            event.preventDefault();
            break;
          case 'f':
            shortcuts.search?.();
            event.preventDefault();
            break;
          case 'a':
            shortcuts.aiOptimize?.();
            event.preventDefault();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Auto Save Hook
export const useAutoSave = (data: any) => {
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const saveToLocalStorage = useCallback(() => {
    setIsSaving(true);
    try {
      localStorage.setItem('roleready-autosave', JSON.stringify(data));
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      setIsSaving(false);
    }
  }, [data]);

  const restoreFromAutoSave = useCallback(() => {
    try {
      const saved = localStorage.getItem('roleready-autosave');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Restore from auto-save failed:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveToLocalStorage();
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, saveToLocalStorage]);

  return {
    isSaving,
    restoreFromAutoSave
  };
};

// Form Validation Hook
export const useFormValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateForm = useCallback((data: any) => {
    const newErrors: Record<string, string> = {};

    if (!data.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!data.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!data.title?.trim()) {
      newErrors.title = 'Job title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  const getFieldError = useCallback((fieldName: string) => {
    return errors[fieldName];
  }, [errors]);

  const setFieldTouched = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  }, []);

  return {
    validateForm,
    getFieldError,
    setFieldTouched,
    errors,
    touched
  };
};

// Search Hook
export const useSearch = (data: any) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const searchInData = useCallback((query: string, data: any) => {
    if (!query.trim()) return [];

    const results: any[] = [];
    const lowerQuery = query.toLowerCase();

    const searchInObject = (obj: any, path: string = '') => {
      if (typeof obj === 'string' && obj.toLowerCase().includes(lowerQuery)) {
        results.push({ path, value: obj, type: 'text' });
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          if (typeof item === 'string' && item.toLowerCase().includes(lowerQuery)) {
            results.push({ path: `${path}[${index}]`, value: item, type: 'array-item' });
          } else if (typeof item === 'object') {
            searchInObject(item, `${path}[${index}]`);
          }
        });
      } else if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          searchInObject(value, path ? `${path}.${key}` : key);
        });
      }
    };

    searchInObject(data);
    return results;
  }, []);

  useEffect(() => {
    const results = searchInData(searchQuery, data);
    setSearchResults(results);
  }, [searchQuery, data, searchInData]);

  const highlightText = useCallback((text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    highlightText
  };
};
