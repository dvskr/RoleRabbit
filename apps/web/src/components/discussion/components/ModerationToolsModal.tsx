'use client';

import React from 'react';
import { X, Shield, Users, Trash2 } from 'lucide-react';
import type { Community } from '../../../types/discussion';
import { useTheme } from '../../../contexts/ThemeContext';

interface ModerationToolsModalProps {
  isOpen: boolean;
  community: Community | null;
  onClose: () => void;
  onApprovePost?: (postId: string) => void;
  onRemovePost?: (postId: string) => void;
  onReviewPost?: (postId: string) => void;
}

export default function ModerationToolsModal({
  isOpen,
  community,
  onClose,
  onApprovePost,
  onRemovePost,
  onReviewPost
}: ModerationToolsModalProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  if (!isOpen || !community) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: colors.background }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(to right, #dc2626, #ea580c)` }}>
          <h2 className="text-xl font-bold text-white">Moderation Tools - {community.name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'white' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title="Close"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6" style={{ borderBottom: `1px solid ${colors.border}` }}>
            <button className="px-4 py-2 font-medium" style={{ borderBottom: `2px solid #dc2626`, color: '#dc2626' }}>Reported Posts (2)</button>
            <button className="px-4 py-2 transition-colors" style={{ color: colors.tertiaryText }}
              onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryText; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
            >Flagged Content</button>
            <button className="px-4 py-2 transition-colors" style={{ color: colors.tertiaryText }}
              onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryText; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
            >Member Violations</button>
            <button className="px-4 py-2 transition-colors" style={{ color: colors.tertiaryText }}
              onMouseEnter={(e) => { e.currentTarget.style.color = colors.primaryText; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = colors.tertiaryText; }}
            >Rules</button>
          </div>
          
          {/* Reported Posts */}
          <div className="space-y-4">
            <div className="rounded-lg p-4" style={{ border: `1px solid ${colors.badgeErrorText}40`, background: `${colors.badgeErrorText}15` }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold" style={{ color: colors.primaryText }}>Post: "Need Help with Resume"</h4>
                    <span className="px-2 py-0.5 text-white text-xs rounded-full" style={{ background: '#dc2626' }}>Reported</span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>Reason: Spam/Inappropriate content</p>
                  <p className="text-xs" style={{ color: colors.tertiaryText }}>Reported by: 3 users | Author: @username</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onApprovePost?.('post1')}
                    className="px-3 py-1.5 text-white rounded-lg text-sm transition-colors" 
                    style={{ background: '#16a34a' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#15803d'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#16a34a'; }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => onRemovePost?.('post1')}
                    className="px-3 py-1.5 text-white rounded-lg text-sm transition-colors" 
                    style={{ background: '#dc2626' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#b91c1c'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg p-4" style={{ border: `1px solid #ea580c40`, background: '#ea580c15' }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold" style={{ color: colors.primaryText }}>Post: "Job Interview Tips"</h4>
                    <span className="px-2 py-0.5 text-white text-xs rounded-full" style={{ background: '#ea580c' }}>Under Review</span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: colors.secondaryText }}>Reason: Misleading information</p>
                  <p className="text-xs" style={{ color: colors.tertiaryText }}>Reported by: 1 user | Author: @username2</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onApprovePost?.('post2')}
                    className="px-3 py-1.5 text-white rounded-lg text-sm transition-colors" 
                    style={{ background: '#16a34a' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#15803d'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#16a34a'; }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => onRemovePost?.('post2')}
                    className="px-3 py-1.5 text-white rounded-lg text-sm transition-colors" 
                    style={{ background: '#dc2626' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#b91c1c'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#dc2626'; }}
                  >
                    Remove
                  </button>
                  <button 
                    onClick={() => onReviewPost?.('post2')}
                    className="px-3 py-1.5 text-white rounded-lg text-sm transition-colors" 
                    style={{ background: colors.primaryBlue }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-8 pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.primaryText }}>Quick Actions</h3>
            <div className="grid grid-cols-3 gap-2">
              <button className="p-4 rounded-lg transition-shadow text-center" style={{ border: `1px solid ${colors.border}`, background: colors.cardBackground }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <Shield size={24} className="mx-auto mb-2" style={{ color: colors.primaryBlue }} />
                <p className="text-sm font-medium" style={{ color: colors.primaryText }}>Automod Settings</p>
              </button>
              <button className="p-4 rounded-lg transition-shadow text-center" style={{ border: `1px solid ${colors.border}`, background: colors.cardBackground }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <Users size={24} className="mx-auto mb-2" style={{ color: '#16a34a' }} />
                <p className="text-sm font-medium" style={{ color: colors.primaryText }}>Ban Members</p>
              </button>
              <button className="p-4 rounded-lg transition-shadow text-center" style={{ border: `1px solid ${colors.border}`, background: colors.cardBackground }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <Trash2 size={24} className="mx-auto mb-2" style={{ color: colors.badgeErrorText }} />
                <p className="text-sm font-medium" style={{ color: colors.primaryText }}>Clean Up Posts</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

