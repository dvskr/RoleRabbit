'use client';

import React, { useState } from 'react';
import { Share2, Users, Link, Mail, QrCode, Calendar, Eye, MessageCircle, Check, Copy, X, Clock, Globe } from 'lucide-react';
import { logger } from '../../utils/logger';
import { useTheme } from '../../contexts/ThemeContext';

interface ResumeSharingProps {
  resumeId: string;
  resumeName: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ShareLink {
  id: string;
  url: string;
  expiresAt: string;
  accessCount: number;
  isActive: boolean;
  allowComments: boolean;
  allowDownloads: boolean;
}

interface Feedback {
  id: string;
  reviewerName: string;
  reviewerEmail: string;
  comment: string;
  rating: number;
  timestamp: string;
  isApproved: boolean;
}

export default function ResumeSharing({ resumeId, resumeName, isOpen, onClose }: ResumeSharingProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([
    {
      id: 'link_1',
      url: 'https://roleready.com/share/resume123',
      expiresAt: '2024-12-31T23:59:59Z',
      accessCount: 15,
      isActive: true,
      allowComments: true,
      allowDownloads: true
    }
  ]);
  
  const [feedback, setFeedback] = useState<Feedback[]>([
    {
      id: 'fb_1',
      reviewerName: 'Sarah Johnson',
      reviewerEmail: 'sarah.j@example.com',
      comment: 'Great resume! The experience section is well-detailed. Consider adding more metrics.',
      rating: 4,
      timestamp: '2024-10-20T14:30:00Z',
      isApproved: true
    }
  ]);

  const [showCreateLinkModal, setShowCreateLinkModal] = useState(false);
  const [newLinkSettings, setNewLinkSettings] = useState({
    expiresIn: 30,
    allowComments: true,
    allowDownloads: true,
    password: ''
  });

  const handleCreateShareLink = () => {
    const newLink: ShareLink = {
      id: `link_${Date.now()}`,
      url: `https://roleready.com/share/${resumeId}?token=${Math.random().toString(36).substring(7)}`,
      expiresAt: new Date(Date.now() + newLinkSettings.expiresIn * 24 * 60 * 60 * 1000).toISOString(),
      accessCount: 0,
      isActive: true,
      allowComments: newLinkSettings.allowComments,
      allowDownloads: newLinkSettings.allowDownloads
    };

    setShareLinks([...shareLinks, newLink]);
    setShowCreateLinkModal(false);
    setNewLinkSettings({
      expiresIn: 30,
      allowComments: true,
      allowDownloads: true,
      password: ''
    });
    logger.debug('Share link created:', newLink);
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    logger.debug('Link copied to clipboard');
  };

  const handleDeleteLink = (linkId: string) => {
    if (confirm('Are you sure you want to delete this share link?')) {
      setShareLinks(shareLinks.filter(link => link.id !== linkId));
    }
  };

  const handleApproveFeedback = (feedbackId: string) => {
    setFeedback(feedback.map(fb => 
      fb.id === feedbackId ? { ...fb, isApproved: true } : fb
    ));
  };

  const handleDeleteFeedback = (feedbackId: string) => {
    if (confirm('Are you sure you want to delete this feedback?')) {
      setFeedback(feedback.filter(fb => fb.id !== feedbackId));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
    >
      <div 
        className="rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl transition-all relative pointer-events-auto"
        style={{
          background: colors.cardBackground,
          boxShadow: `0 20px 25px -5px ${colors.border}40`,
          border: `1px solid ${colors.border}`,
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ background: colors.badgePurpleBg }}
            >
              <Share2 size={24} style={{ color: colors.badgePurpleText }} />
            </div>
            <div>
              <h3 className="text-xl font-semibold" style={{ color: colors.primaryText }}>Share & Get Feedback</h3>
              <p className="text-sm" style={{ color: colors.secondaryText }}>{resumeName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.tertiaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
              e.currentTarget.style.color = colors.secondaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = colors.tertiaryText;
            }}
            title="Close modal"
            aria-label="Close share and feedback modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b" style={{ borderBottom: `1px solid ${colors.border}` }}>
          <button 
            className="px-4 py-2 border-b-2 font-medium text-sm transition-colors"
            style={{
              borderBottomColor: colors.badgePurpleText,
              color: colors.badgePurpleText,
            }}
          >
            Share Links
          </button>
          <button 
            className="px-4 py-2 font-medium text-sm transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryText;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
            }}
          >
            Feedback ({feedback.length})
          </button>
        </div>

        {/* Share Links Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold" style={{ color: colors.primaryText }}>Active Share Links</h4>
            <button
              onClick={() => setShowCreateLinkModal(true)}
              className="px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-all"
              style={{
                background: colors.badgePurpleText,
                color: 'white',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.badgePurpleBorder;
                e.currentTarget.style.boxShadow = `0 4px 12px ${colors.badgePurpleText}40`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = colors.badgePurpleText;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Link size={16} />
              Create Share Link
            </button>
          </div>

          {shareLinks.length === 0 ? (
            <div 
              className="text-center py-12 rounded-lg border transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <Link size={48} className="mx-auto mb-3" style={{ color: colors.tertiaryText }} />
              <p className="mb-2" style={{ color: colors.secondaryText }}>No share links yet</p>
              <p className="text-sm" style={{ color: colors.tertiaryText }}>Create a link to share your resume and get feedback</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shareLinks.map(link => (
                <div 
                  key={link.id} 
                  className="border rounded-lg p-4 transition-all"
                  style={{
                    border: `1px solid ${colors.border}`,
                    background: colors.cardBackground,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.badgePurpleBorder;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Globe size={18} style={{ color: colors.badgePurpleText }} />
                      <span className="text-sm font-medium" style={{ color: colors.primaryText }}>Shared Link</span>
                      {link.isActive && (
                        <span 
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            background: colors.badgeSuccessBg,
                            color: colors.badgeSuccessText,
                          }}
                        >
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLink(link.url)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: colors.tertiaryText }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.hoverBackground;
                          e.currentTarget.style.color = colors.secondaryText;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = colors.tertiaryText;
                        }}
                        title="Copy link"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: colors.errorRed }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.badgeErrorBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                        title="Delete link"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div 
                    className="rounded p-2 mb-3 flex items-center gap-2"
                    style={{ background: colors.inputBackground }}
                  >
                    <span className="text-sm font-mono flex-1 truncate" style={{ color: colors.secondaryText }}>{link.url}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs" style={{ color: colors.tertiaryText }}>
                    <div className="flex items-center gap-1">
                      <Eye size={14} />
                      <span>{link.accessCount} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>Expires: {new Date(link.expiresAt).toLocaleDateString()}</span>
                    </div>
                    {link.allowComments && (
                      <div className="flex items-center gap-1" style={{ color: colors.badgePurpleText }}>
                        <MessageCircle size={14} />
                        <span>Comments enabled</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Feedback Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold" style={{ color: colors.primaryText }}>Feedback Received</h4>
            <div className="flex items-center gap-2">
              <span className="text-sm" style={{ color: colors.secondaryText }}>Average Rating: 4.5/5</span>
            </div>
          </div>

          {feedback.length === 0 ? (
            <div 
              className="text-center py-12 rounded-lg border transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
              }}
            >
              <MessageCircle size={48} className="mx-auto mb-3" style={{ color: colors.tertiaryText }} />
              <p className="mb-2" style={{ color: colors.secondaryText }}>No feedback yet</p>
              <p className="text-sm" style={{ color: colors.tertiaryText }}>Share your resume to get feedback from reviewers</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedback.map(fb => (
                <div 
                  key={fb.id} 
                  className="border rounded-lg p-4 transition-all"
                  style={{
                    border: `1px solid ${colors.border}`,
                    background: colors.cardBackground,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-semibold" style={{ color: colors.primaryText }}>{fb.reviewerName}</h5>
                      <p className="text-sm" style={{ color: colors.secondaryText }}>{fb.reviewerEmail}</p>
                      <p className="text-xs mt-1" style={{ color: colors.tertiaryText }}>
                        {new Date(fb.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className="text-lg"
                          style={{ color: i < fb.rating ? '#fbbf24' : colors.tertiaryText }}
                        >
                          ★
                        </span>
                      ))}
                      {!fb.isApproved && (
                        <button
                          onClick={() => handleApproveFeedback(fb.id)}
                          className="p-1.5 rounded transition-colors"
                          style={{ color: colors.successGreen }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = colors.badgeSuccessBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                          title="Approve"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteFeedback(fb.id)}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: colors.errorRed }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = colors.badgeErrorBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                        }}
                        title="Delete"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                  <p 
                    className="text-sm rounded p-3"
                    style={{
                      color: colors.primaryText,
                      background: colors.inputBackground,
                    }}
                  >
                    {fb.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 border rounded-lg font-medium transition-all"
          style={{
            border: `1px solid ${colors.border}`,
            background: colors.inputBackground,
            color: colors.secondaryText,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hoverBackground;
            e.currentTarget.style.borderColor = colors.borderFocused;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.inputBackground;
            e.currentTarget.style.borderColor = colors.border;
          }}
        >
          Close
        </button>
      </div>

      {/* Create Share Link Modal */}
      {showCreateLinkModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 10001,
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          onClick={(e) => {
            // Close modal when clicking on overlay
            if (e.target === e.currentTarget) {
              setShowCreateLinkModal(false);
            }
          }}
        >
          <div 
            className="rounded-2xl p-6 w-full max-w-md shadow-2xl transition-all relative"
            style={{
              background: colors.cardBackground,
              boxShadow: `0 20px 25px -5px ${colors.border}40`,
              zIndex: 10002,
            }}
            onClick={(e) => {
              // Prevent closing when clicking inside modal
              e.stopPropagation();
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold" style={{ color: colors.primaryText }}>Create Share Link</h4>
              <button
                onClick={() => setShowCreateLinkModal(false)}
                className="p-1.5 rounded transition-colors"
                style={{ color: colors.tertiaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.color = colors.secondaryText;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = colors.tertiaryText;
                }}
                title="Close create link modal"
                aria-label="Close create share link modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>
                  Expires In (Days)
                </label>
                <input
                  type="number"
                  value={newLinkSettings.expiresIn}
                  onChange={(e) => setNewLinkSettings({ ...newLinkSettings, expiresIn: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 border rounded-lg transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  placeholder="30"
                  title="Number of days until link expires"
                  aria-label="Link expiration days"
                  onFocus={(e) => {
                    e.target.style.borderColor = colors.primaryBlue;
                    e.target.style.outline = `2px solid ${colors.primaryBlue}40`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = colors.border;
                    e.target.style.outline = 'none';
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newLinkSettings.allowComments}
                    onChange={(e) => setNewLinkSettings({ ...newLinkSettings, allowComments: e.target.checked })}
                    className="rounded"
                    style={{
                      accentColor: colors.badgePurpleText,
                    }}
                  />
                  <span className="text-sm" style={{ color: colors.primaryText }}>Allow Comments</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newLinkSettings.allowDownloads}
                    onChange={(e) => setNewLinkSettings({ ...newLinkSettings, allowDownloads: e.target.checked })}
                    className="rounded"
                    style={{
                      accentColor: colors.badgePurpleText,
                    }}
                  />
                  <span className="text-sm" style={{ color: colors.primaryText }}>Allow Downloads</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateLinkModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg font-medium transition-all"
                style={{
                  border: `1px solid ${colors.border}`,
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateShareLink}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  background: colors.badgePurpleText,
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.badgePurpleBorder;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${colors.badgePurpleText}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.badgePurpleText;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
