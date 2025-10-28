'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Build Your Perfect Resume
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered tools to land your dream job
        </p>
        <div className="space-x-4">
          <Link href="/login" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold">
            Sign In
          </Link>
          <Link href="/signup" className="bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold">
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
