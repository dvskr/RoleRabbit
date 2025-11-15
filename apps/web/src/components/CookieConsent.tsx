/**
 * Cookie Consent Banner - Section 6.3
 *
 * GDPR/CCPA compliance: Cookie consent for analytics
 */

'use client';

import { useState, useEffect } from 'react';

export interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
};

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    // Check if user has already made a choice
    const savedPreferences = localStorage.getItem('cookiePreferences');

    if (!savedPreferences) {
      setShowBanner(true);
    } else {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };

    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    savePreferences(DEFAULT_PREFERENCES);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookiePreferences', JSON.stringify(prefs));
    setPreferences(prefs);

    // Initialize analytics based on preferences
    if (prefs.analytics) {
      initializeAnalytics();
    } else {
      disableAnalytics();
    }

    // Initialize marketing based on preferences
    if (prefs.marketing) {
      initializeMarketing();
    } else {
      disableMarketing();
    }
  };

  const initializeAnalytics = () => {
    // Initialize analytics services (e.g., Google Analytics, Plausible)
    if (typeof window !== 'undefined') {
      (window as any).analyticsEnabled = true;
      console.log('Analytics enabled');
    }
  };

  const disableAnalytics = () => {
    if (typeof window !== 'undefined') {
      (window as any).analyticsEnabled = false;
      console.log('Analytics disabled');
    }
  };

  const initializeMarketing = () => {
    // Initialize marketing pixels (e.g., Facebook Pixel, Google Ads)
    if (typeof window !== 'undefined') {
      (window as any).marketingEnabled = true;
      console.log('Marketing enabled');
    }
  };

  const disableMarketing = () => {
    if (typeof window !== 'undefined') {
      (window as any).marketingEnabled = false;
      console.log('Marketing disabled');
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      {/* Cookie Banner */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          padding: '20px',
          zIndex: 9999,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>
              We value your privacy
            </h3>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
              We use cookies to enhance your browsing experience, serve
              personalized content, and analyze our traffic. By clicking "Accept
              All", you consent to our use of cookies. You can manage your
              preferences or learn more in our{' '}
              <a
                href="/privacy-policy"
                style={{ color: '#60a5fa', textDecoration: 'underline' }}
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleAcceptAll}
              style={{
                padding: '10px 24px',
                backgroundColor: '#60a5fa',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Accept All
            </button>

            <button
              onClick={handleRejectAll}
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Reject All
            </button>

            <button
              onClick={() => setShowSettings(true)}
              style={{
                padding: '10px 24px',
                backgroundColor: 'transparent',
                color: '#ffffff',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Customize
            </button>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
          >
            <h2 style={{ margin: '0 0 24px 0', color: '#1a1a1a' }}>
              Cookie Preferences
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Necessary Cookies */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#1a1a1a' }}>
                    Necessary Cookies
                  </h3>
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#6b7280',
                      fontStyle: 'italic',
                    }}
                  >
                    Always Active
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  These cookies are essential for the website to function and
                  cannot be disabled.
                </p>
              </div>

              {/* Analytics Cookies */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#1a1a1a' }}>
                    Analytics Cookies
                  </h3>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          analytics: e.target.checked,
                        })
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  </label>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Help us understand how visitors interact with our website by
                  collecting anonymous information.
                </p>
              </div>

              {/* Marketing Cookies */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#1a1a1a' }}>
                    Marketing Cookies
                  </h3>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) =>
                        setPreferences({
                          ...preferences,
                          marketing: e.target.checked,
                        })
                      }
                      style={{ cursor: 'pointer' }}
                    />
                  </label>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Used to deliver personalized advertisements and measure their
                  effectiveness.
                </p>
              </div>
            </div>

            <div
              style={{
                marginTop: '32px',
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  padding: '10px 24px',
                  backgroundColor: 'transparent',
                  color: '#1a1a1a',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleSavePreferences}
                style={{
                  padding: '10px 24px',
                  backgroundColor: '#60a5fa',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Check if analytics cookies are enabled
 */
export function areAnalyticsEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const savedPreferences = localStorage.getItem('cookiePreferences');

  if (!savedPreferences) {
    return false;
  }

  const preferences: CookiePreferences = JSON.parse(savedPreferences);
  return preferences.analytics;
}

/**
 * Check if marketing cookies are enabled
 */
export function areMarketingEnabled(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const savedPreferences = localStorage.getItem('cookiePreferences');

  if (!savedPreferences) {
    return false;
  }

  const preferences: CookiePreferences = JSON.parse(savedPreferences);
  return preferences.marketing;
}
