/**
 * Validation Message Component
 * Displays inline validation error messages
 * Section 1.8 requirement #5: role="alert" for screen reader announcements
 * Section 1.8 requirement #4: Provides id for aria-describedby
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationMessageProps {
  error?: string;
  show?: boolean;
  id?: string; // For aria-describedby reference
}

export function ValidationMessage({ error, show = true, id }: ValidationMessageProps) {
  if (!error || !show) return null;

  return (
    <div
      id={id}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className="flex items-center gap-1.5 mt-1 text-sm text-red-600"
    >
      <AlertCircle size={14} className="flex-shrink-0" aria-hidden="true" />
      <span>{error}</span>
    </div>
  );
}

export default ValidationMessage;
