/**
 * Validation Message Component
 * Displays inline validation error messages
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationMessageProps {
  error?: string;
  show?: boolean;
}

export function ValidationMessage({ error, show = true }: ValidationMessageProps) {
  if (!error || !show) return null;

  return (
    <div className="flex items-center gap-1.5 mt-1 text-sm text-red-600">
      <AlertCircle size={14} className="flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

export default ValidationMessage;
