'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { isOnline } from '../utils/retryHandler';

/**
 * OfflineBanner Component
 * 
 * Displays a banner at the top of the screen when the user goes offline.
 * Automatically hides when connection is restored.
 * 
 * Features:
 * - Monitors online/offline status
 * - Smooth slide-in/slide-out animations
 * - Theme-aware styling
 * - Accessible with ARIA labels
 */
export function OfflineBanner() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [online, setOnline] = useState(true);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Initial check
    setOnline(isOnline());

    const handleOnline = () => {
      setOnline(true);
      // Show "reconnected" message briefly
      setShowReconnected(true);
      setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
    };

    const handleOffline = () => {
      setOnline(false);
      setShowReconnected(false);
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render anything if online and not showing reconnected message
  if (online && !showReconnected) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] transform transition-all duration-300 ease-in-out"
      style={{
        transform: online && showReconnected ? 'translateY(0)' : !online ? 'translateY(0)' : 'translateY(-100%)',
      }}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div
        className="flex items-center justify-center gap-3 px-4 py-3 shadow-lg"
        style={{
          background: online 
            ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
            : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
          borderBottom: `2px solid ${online ? '#10b981' : '#ef4444'}`,
        }}
      >
        {/* Icon */}
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full"
          style={{
            background: online ? '#10b981' : '#ef4444',
          }}
        >
          {online ? (
            <Wifi size={18} className="text-white" />
          ) : (
            <WifiOff size={18} className="text-white animate-pulse" />
          )}
        </div>

        {/* Message */}
        <div className="flex-1">
          <p
            className="text-sm font-semibold"
            style={{
              color: online ? '#065f46' : '#991b1b',
            }}
          >
            {online ? (
              <>
                <span className="inline-block mr-2">✓</span>
                You're back online!
              </>
            ) : (
              <>
                <span className="inline-block mr-2">⚠</span>
                You're offline
              </>
            )}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{
              color: online ? '#047857' : '#7f1d1d',
            }}
          >
            {online
              ? 'Your changes will now sync automatically.'
              : 'Changes will be saved locally and synced when you reconnect.'}
          </p>
        </div>

        {/* Animated pulse indicator for offline */}
        {!online && (
          <div className="flex gap-1">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: '#ef4444',
                animationDelay: '0ms',
              }}
            />
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: '#ef4444',
                animationDelay: '150ms',
              }}
            />
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{
                background: '#ef4444',
                animationDelay: '300ms',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

