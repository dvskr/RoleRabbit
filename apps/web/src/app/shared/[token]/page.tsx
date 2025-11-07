'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface SharedFileData {
  file: {
    id: string;
    name: string;
    fileName: string;
    type: string;
    contentType: string;
    size: number;
    publicUrl: string;
    createdAt: string;
  };
  share: {
    permission: string;
    expiresAt: string | null;
    sharedBy: string;
  };
}

export default function SharedFilePage() {
  const params = useParams();
  const router = useRouter();
  
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileData, setFileData] = useState<SharedFileData | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    loadSharedFile();
  }, [token]);

  const loadSharedFile = async (pwd?: string) => {
    try {
      setLoading(true);
      setError(null);

      // Detect API URL from current host or use env variable
      let API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL && typeof window !== 'undefined') {
        const currentHost = window.location.hostname;
        const protocol = window.location.protocol;
        
        // If on localhost, use port 3001
        if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
          API_URL = `${protocol}//${currentHost}:3001`;
        } else {
          // In production, API might be on same domain with /api path or subdomain
          // Try to use same domain (assuming API is proxied or on same host)
          API_URL = `${protocol}//${currentHost}${window.location.port ? ':' + window.location.port : ''}`;
        }
      }
      API_URL = API_URL || 'http://localhost:3001';
      
      const endpoint = pwd 
        ? `${API_URL}/api/storage/shared/${token}?password=${encodeURIComponent(pwd)}`
        : `${API_URL}/api/storage/shared/${token}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.passwordRequired) {
          setPasswordRequired(true);
          return;
        }
        throw new Error(errorData.message || 'Failed to load shared file');
      }

      const data = await response.json();
      
      if (data && data.file) {
        setFileData(data);
      } else {
        setError('File not found or share link has expired');
      }
    } catch (err: any) {
      if (err.message.includes('password') || err.message.includes('Password')) {
        setPasswordRequired(true);
      } else {
        setError(err.message || 'Failed to load shared file');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setSubmittingPassword(true);
    await loadSharedFile(password);
    setSubmittingPassword(false);
  };

  const handleDownload = async () => {
    if (!fileData) return;

    try {
      // Detect API URL from current host or use env variable
      let API_URL = process.env.NEXT_PUBLIC_API_URL;
      if (!API_URL && typeof window !== 'undefined') {
        const currentHost = window.location.hostname;
        const protocol = window.location.protocol;
        
        // If on localhost, use port 3001
        if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
          API_URL = `${protocol}//${currentHost}:3001`;
        } else {
          // In production, API might be on same domain with /api path or subdomain
          // Try to use same domain (assuming API is proxied or on same host)
          API_URL = `${protocol}//${currentHost}${window.location.port ? ':' + window.location.port : ''}`;
        }
      }
      API_URL = API_URL || 'http://localhost:3001';
      
      const endpoint = password
        ? `${API_URL}/api/storage/shared/${token}/download?password=${encodeURIComponent(password)}`
        : `${API_URL}/api/storage/shared/${token}/download`;

      const response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileData.file.fileName || fileData.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Failed to download file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading shared file...</p>
        </div>
      </div>
    );
  }

  if (passwordRequired && !fileData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-yellow-100">
              <svg className="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentWidth">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2 text-gray-900">Password Required</h1>
            <p className="text-gray-600">This file is password-protected. Please enter the password to view it.</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg bg-red-50 text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!password.trim() || submittingPassword}
              className="w-full px-6 py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {submittingPassword ? 'Verifying...' : 'Access File'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-xl p-8 text-center shadow-lg">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-red-100">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentWidth">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">File Not Available</h1>
          <p className="mb-6 text-gray-600">{error || 'This share link is invalid or has expired.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-lg font-medium bg-blue-500 text-white hover:bg-blue-600"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isPreviewablePdf = fileData.file.contentType === 'application/pdf';
  const isPreviewableImage = fileData.file.contentType?.startsWith('image/');
  const canPreview = (isPreviewablePdf || isPreviewableImage) && fileData.file.publicUrl;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-100">
                <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentWidth">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold mb-2 text-gray-900">{fileData.file.name}</h1>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Shared by: {fileData.share.sharedBy}</p>
                  <p>Type: {fileData.file.type} • Size: {(fileData.file.size / 1024).toFixed(2)} KB</p>
                  <p>Permission: {fileData.share.permission}</p>
                  {fileData.share.expiresAt && (
                    <p>Expires: {new Date(fileData.share.expiresAt).toLocaleString()}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>

        {/* Preview */}
        {canPreview && (
          <div className="bg-white rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Preview</h2>
            </div>
            <div className="p-6">
              {isPreviewablePdf && (
                <iframe
                  src={`${fileData.file.publicUrl}#toolbar=0`}
                  className="w-full h-[600px] rounded-lg border border-gray-200"
                  title={fileData.file.name}
                />
              )}
              {isPreviewableImage && (
                <img
                  src={fileData.file.publicUrl}
                  alt={fileData.file.name}
                  className="max-w-full h-auto rounded-lg"
                />
              )}
            </div>
          </div>
        )}

        {!canPreview && (
          <div className="bg-white rounded-xl p-12 text-center shadow-lg">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-blue-100">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentWidth">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-600">
              Preview not available for this file type. Click the download button above to view it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
