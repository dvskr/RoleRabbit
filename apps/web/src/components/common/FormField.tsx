import React from 'react';
import { Label } from './Label';
import { Input } from './Input';
import { ErrorMessage } from './ErrorMessage';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required
}: FormFieldProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={name} required={required}>
        {label}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        error={!!error}
      />
      {error && <ErrorMessage>{error}</ErrorMessage>}
    </div>
  );
}

