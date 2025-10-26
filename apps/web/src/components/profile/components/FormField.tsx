'use client';

import React from 'react';
import { FormFieldProps } from '../types/profile';

export default function FormField({
  label,
  type = 'text',
  value,
  onChange,
  disabled = false,
  placeholder,
  rows = 1,
  className = ''
}: FormFieldProps) {
  const baseInputClasses = "w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400";
  
  const inputClasses = type === 'textarea' 
    ? `${baseInputClasses} resize-none`
    : baseInputClasses;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={rows}
          className={inputClasses}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={inputClasses}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
