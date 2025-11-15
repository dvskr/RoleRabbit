/**
 * Form Validation Summary Component
 * Displays all form errors in a summary box at the top of form
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface FormValidationSummaryProps {
  errors: string[];
  show?: boolean;
}

export function FormValidationSummary({ errors, show = true }: FormValidationSummaryProps) {
  if (!show || errors.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900 mb-2">
            Please correct the following errors:
          </h3>
          <ul className="space-y-1 text-sm text-red-800">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-600">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default FormValidationSummary;
