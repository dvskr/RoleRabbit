import React from 'react';

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}

export function Label({ htmlFor, children, required }: LabelProps) {
  return (
    <label 
      htmlFor={htmlFor} 
      className="block text-sm font-medium mb-2"
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

