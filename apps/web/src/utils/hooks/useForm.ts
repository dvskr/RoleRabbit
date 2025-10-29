import { useState, useCallback } from 'react';

interface ValidationRule<T> {
  validator: (value: T) => boolean;
  message: string;
}

interface FormField<T = any> {
  value: T;
  error?: string;
  touched?: boolean;
  rules?: ValidationRule<T>[];
}

type FormFields<T> = {
  [K in keyof T]: FormField<T[K]>;
};

export function useForm<T extends Record<string, any>>(initialValues: T) {
  const [fields, setFields] = useState<FormFields<T>>(() => {
    const initialFields = {} as FormFields<T>;
    Object.keys(initialValues).forEach((key) => {
      initialFields[key as keyof T] = {
        value: initialValues[key],
        error: undefined,
        touched: false
      };
    });
    return initialFields;
  });

  const setValue = useCallback((name: keyof T, value: any) => {
    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], value }
    }));
  }, []);

  const setError = useCallback((name: keyof T, error: string) => {
    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], error }
    }));
  }, []);

  const setTouched = useCallback((name: keyof T) => {
    setFields((prev) => ({
      ...prev,
      [name]: { ...prev[name], touched: true }
    }));
  }, []);

  const validateField = useCallback((name: keyof T): boolean => {
    const field = fields[name];
    if (!field.rules) return true;

    for (const rule of field.rules) {
      if (!rule.validator(field.value)) {
        setError(name, rule.message);
        return false;
      }
    }

    setError(name, '');
    return true;
  }, [fields, setError]);

  const validateAll = useCallback((): boolean => {
    let isValid = true;
    
    Object.keys(fields).forEach((key) => {
      const fieldKey = key as keyof T;
      const field = fields[fieldKey];
      
      if (field.rules) {
        const fieldValid = validateField(fieldKey);
        if (!fieldValid) isValid = false;
        
        setTouched(fieldKey);
      }
    });

    return isValid;
  }, [fields, validateField, setTouched]);

  const getValues = useCallback((): T => {
    const values = {} as T;
    Object.keys(fields).forEach((key) => {
      values[key as keyof T] = fields[key as keyof T].value;
    });
    return values;
  }, [fields]);

  const reset = useCallback(() => {
    setFields(() => {
      const initialFields = {} as FormFields<T>;
      Object.keys(initialValues).forEach((key) => {
        initialFields[key as keyof T] = {
          value: initialValues[key],
          error: undefined,
          touched: false
        };
      });
      return initialFields;
    });
  }, [initialValues]);

  return {
    fields,
    setValue,
    setError,
    setTouched,
    validateField,
    validateAll,
    getValues,
    reset
  };
}

