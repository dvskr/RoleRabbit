import { useState, useEffect, useRef, useCallback } from 'react';

// Undo/Redo functionality
export const useUndoRedo = (initialState: any) => {
  const [state, setState] = useState(initialState);
  const [history, setHistory] = useState([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setState(history[historyIndex - 1]);
    }
  }, [historyIndex, history]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setState(history[historyIndex + 1]);
    }
  }, [historyIndex, history]);

  const updateState = useCallback((newState: any) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setState(newState);
  }, [history, historyIndex]);

  return {
    state,
    updateState,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
};

// Keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.ctrlKey || event.metaKey ? 
        `${event.ctrlKey || event.metaKey ? 'ctrl+' : ''}${event.key.toLowerCase()}` : 
        event.key.toLowerCase();

      if (shortcuts[key]) {
        event.preventDefault();
        shortcuts[key]();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Auto-save functionality
export const useAutoSave = (data: any, delay: number = 2000) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Simulate auto-save
      localStorage.setItem('resume_autosave', JSON.stringify(data));
      setLastSaved(new Date());
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay]);

  return { lastSaved };
};

// Form validation
export const useFormValidation = (validationRules: Record<string, (value: any) => boolean> = {}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = useCallback((field: string, value: any) => {
    if (validationRules[field]) {
      const isValid = validationRules[field](value);
      setErrors(prev => ({
        ...prev,
        [field]: isValid ? '' : `Invalid ${field}`
      }));
      return isValid;
    }
    return true;
  }, [validationRules]);

  const validateAll = useCallback((data: Record<string, any>) => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      if (!validationRules[field](data[field])) {
        newErrors[field] = `Invalid ${field}`;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules]);

  const getFieldError = useCallback((field: string) => {
    return errors[field] ? [errors[field]] : null;
  }, [errors]);

  const setFieldTouched = useCallback((field: string) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  }, []);

  const isFieldTouched = useCallback((field: string) => {
    return touched[field] || false;
  }, [touched]);

  return { 
    errors, 
    validate, 
    validateAll, 
    getFieldError, 
    setFieldTouched, 
    isFieldTouched,
    touched
  };
};

// Search functionality
export const useSearch = (data: any[], searchFields: string[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
      })
    );

    setFilteredData(filtered);
  }, [searchTerm, data, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    filteredData
  };
};
