'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Search className="w-10 h-10 text-gray-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          404
        </h1>
        
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home size={16} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">Common pages:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 underline">
              Dashboard
            </Link>
            <Link href="/landing" className="text-sm text-blue-600 hover:text-blue-700 underline">
              Landing
            </Link>
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
