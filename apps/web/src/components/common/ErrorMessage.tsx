import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

export function ErrorMessage({ message, className = '' }: ErrorMessageProps) {
  return (
    <div className={`flex items-center gap-2 text-red-600 ${className}`}>
      <AlertCircle className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
}

