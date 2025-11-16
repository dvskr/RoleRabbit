/**
 * Offline Banner Component
 * Displays a banner when user loses internet connection
 */

'use client';

import React, { useState, useEffect } from 'react';

interface OfflineBannerProps {
  className?: string;
  showReconnecting?: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  className = '',
  showReconnecting = true
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOnline(navigator.onLine);

    // Handle online event
    const handleOnline = () => {
      setIsOnline(true);
      
      // Show "reconnected" message if we were offline
      if (wasOffline && showReconnecting) {
        setShowReconnected(true);
        
        // Hide reconnected message after 3 seconds
        setTimeout(() => {
          setShowReconnected(false);
          setWasOffline(false);
        }, 3000);
      }
    };

    // Handle offline event
    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowReconnected(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline, showReconnecting]);

  // Don't render anything if online and not showing reconnected message
  if (isOnline && !showReconnected) {
    return null;
  }

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-3 shadow-lg animate-slide-down ${className}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Offline Icon */}
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                />
              </svg>
              
              {/* Message */}
              <div>
                <p className="font-semibold">You're offline</p>
                <p className="text-sm opacity-90">
                  Your changes are being saved locally and will sync when you reconnect.
                </p>
              </div>
            </div>
            
            {/* Retry Button (optional) */}
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-white text-yellow-600 rounded-md hover:bg-yellow-50 transition-colors text-sm font-medium"
              aria-label="Retry connection"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Reconnected Banner */}
      {showReconnected && (
        <div
          className={`fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-3 shadow-lg animate-slide-down ${className}`}
          role="alert"
          aria-live="polite"
        >
          <div className="container mx-auto flex items-center gap-3">
            {/* Online Icon */}
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            
            {/* Message */}
            <div>
              <p className="font-semibold">You're back online!</p>
              <p className="text-sm opacity-90">
                Your changes are being synced now.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ============================================
// HOOK FOR ONLINE STATUS
// ============================================

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ============================================
// EXPORTS
// ============================================

export default OfflineBanner;



