'use client';

import React from 'react';
import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Application Error
            </h1>
            
            <p className="text-gray-600 mb-6">
              A critical error occurred in the application. Please refresh the page or contact support if the problem persists.
            </p>

            {process.env.NODE_ENV === 'development' && error.message && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-left">
                <p className="text-sm text-red-800 font-mono break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs text-red-600 mt-2">
                    Error ID: {error.digest}
                  </p>
                )}
                {error.stack && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-600 cursor-pointer">Stack trace</summary>
                    <pre className="text-xs text-red-700 mt-2 overflow-auto max-h-40">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={reset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                Try again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Home size={16} />
                Go home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

