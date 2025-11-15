/**
 * Share Portfolio Component
 * Requirements #23-24: Public link, password protection, expiration, share analytics
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Link as LinkIcon,
  Copy,
  Check,
  Lock,
  Calendar,
  Eye,
  Users,
  Globe,
  Share2,
  X,
  ChevronDown,
  Mail,
  MessageCircle,
  ExternalLink,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

export interface ShareSettings {
  isPublic: boolean;
  publicUrl?: string;
  password?: string;
  expiresAt?: Date | null;
  allowIndexing?: boolean;
}

export interface ShareAnalytics {
  totalViews: number;
  uniqueVisitors: number;
  viewsByDate: { date: string; views: number }[];
  topReferrers: { source: string; count: number }[];
  geographicData: { country: string; count: number }[];
  lastViewedAt?: Date;
}

interface SharePortfolioProps {
  portfolioId: string;
  portfolioName: string;
  shareSettings: ShareSettings;
  analytics?: ShareAnalytics;
  onUpdateSettings: (settings: ShareSettings) => Promise<void>;
  onGenerateLink?: () => Promise<string>;
  onRevokeLink?: () => Promise<void>;
}

/**
 * Share Portfolio Component
 */
export function SharePortfolio({
  portfolioId,
  portfolioName,
  shareSettings,
  analytics,
  onUpdateSettings,
  onGenerateLink,
  onRevokeLink,
}: SharePortfolioProps) {
  const [settings, setSettings] = useState<ShareSettings>(shareSettings);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Generate public link
  const handleGenerateLink = async () => {
    if (!onGenerateLink) return;

    setIsGenerating(true);
    try {
      const url = await onGenerateLink();
      setSettings({ ...settings, isPublic: true, publicUrl: url });
    } catch (error) {
      console.error('Failed to generate link:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy link to clipboard
  const handleCopyLink = async () => {
    if (!settings.publicUrl) return;

    try {
      await navigator.clipboard.writeText(settings.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await onUpdateSettings(settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Revoke link
  const handleRevokeLink = async () => {
    if (!onRevokeLink) return;

    if (!confirm('Are you sure you want to revoke this link? Anyone with the current link will no longer be able to access your portfolio.')) {
      return;
    }

    try {
      await onRevokeLink();
      setSettings({ ...settings, isPublic: false, publicUrl: undefined });
    } catch (error) {
      console.error('Failed to revoke link:', error);
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 12;
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSettings({ ...settings, password });
  };

  // Share on social media
  const shareOnPlatform = (platform: 'facebook' | 'twitter' | 'linkedin' | 'email' | 'whatsapp') => {
    if (!settings.publicUrl) return;

    const url = encodeURIComponent(settings.publicUrl);
    const text = encodeURIComponent(`Check out my portfolio: ${portfolioName}`);

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${text}&body=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  // Format date for input
  const formatDateForInput = (date: Date | null | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Share Portfolio
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Create a shareable link and control access to your portfolio
        </p>
      </div>

      {/* Public Link Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <LinkIcon size={20} />
          Public Link
        </h3>

        {settings.publicUrl ? (
          <div className="space-y-4">
            {/* Link Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your public link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={settings.publicUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      Copy
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.open(settings.publicUrl, '_blank')}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>

            {/* Share Buttons */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share on social media
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => shareOnPlatform('facebook')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                <button
                  onClick={() => shareOnPlatform('twitter')}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </button>
                <button
                  onClick={() => shareOnPlatform('linkedin')}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </button>
                <button
                  onClick={() => shareOnPlatform('whatsapp')}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <MessageCircle size={16} />
                  WhatsApp
                </button>
                <button
                  onClick={() => shareOnPlatform('email')}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <Mail size={16} />
                  Email
                </button>
              </div>
            </div>

            {/* Revoke Link */}
            <button
              onClick={handleRevokeLink}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Revoke link
            </button>
          </div>
        ) : (
          <div className="text-center py-8">
            <Globe className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No public link generated yet
            </p>
            <button
              onClick={handleGenerateLink}
              disabled={isGenerating}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  Generate Public Link
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Access Control */}
      {settings.publicUrl && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock size={20} />
            Access Control
          </h3>

          <div className="space-y-6">
            {/* Password Protection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password Protection
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!settings.password}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        password: e.target.checked ? '' : undefined,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.password !== undefined && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      value={settings.password || ''}
                      onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                      placeholder="Enter password..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                    >
                      {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button
                      onClick={generatePassword}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">
                    Visitors will need this password to view your portfolio
                  </p>
                </div>
              )}
            </div>

            {/* Expiration Date */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Link Expiration
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.expiresAt !== null && settings.expiresAt !== undefined}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        expiresAt: e.target.checked ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {settings.expiresAt !== null && settings.expiresAt !== undefined && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Calendar className="text-gray-400 mt-2" size={20} />
                    <input
                      type="date"
                      value={formatDateForInput(settings.expiresAt)}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          expiresAt: e.target.value ? new Date(e.target.value) : null,
                        })
                      }
                      min={new Date().toISOString().split('T')[0]}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Link will expire on this date and become inaccessible
                  </p>
                </div>
              )}
            </div>

            {/* Search Engine Indexing */}
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Allow Search Engine Indexing
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Let search engines like Google index your portfolio
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowIndexing ?? true}
                  onChange={(e) =>
                    setSettings({ ...settings, allowIndexing: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
              </label>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Analytics */}
      {settings.publicUrl && analytics && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 size={20} />
              Share Analytics
            </h3>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${
                showAnalytics ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showAnalytics && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600 rounded-lg">
                      <Eye className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.totalViews.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Views
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-600 rounded-lg">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.uniqueVisitors.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Unique Visitors
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Referrers */}
              {analytics.topReferrers.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Top Referrers
                  </h4>
                  <div className="space-y-2">
                    {analytics.topReferrers.slice(0, 5).map((referrer, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {referrer.source}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {referrer.count} views
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Last Viewed */}
              {analytics.lastViewedAt && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Last viewed:{' '}
                  {new Date(analytics.lastViewedAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
