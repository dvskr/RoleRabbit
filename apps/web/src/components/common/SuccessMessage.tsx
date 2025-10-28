import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  message: string;
  className?: string;
}

export function SuccessMessage({ message, className = '' }: SuccessMessageProps) {
  return (
    <div className={`flex items-center gap-2 text-green-600 ${className}`}>
      <CheckCircle className="w-5 h-5" />
      <span>{message}</span>
    </div>
  );
}

