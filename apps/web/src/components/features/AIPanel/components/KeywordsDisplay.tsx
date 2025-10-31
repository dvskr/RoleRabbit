import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface KeywordsDisplayProps {
  matchedKeywords: string[];
  missingKeywords: string[];
}

export default function KeywordsDisplay({ matchedKeywords, missingKeywords }: KeywordsDisplayProps) {
  return (
    <>
      {matchedKeywords.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Matched Keywords</h4>
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.map((keyword, index) => (
              <span key={index} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs border border-green-200">
                <CheckCircle size={10} className="inline mr-1" />
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {missingKeywords.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Missing Keywords</h4>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((keyword, index) => (
              <span key={index} className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs border border-red-200">
                <AlertCircle size={10} className="inline mr-1" />
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

