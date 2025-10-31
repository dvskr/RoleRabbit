'use client';

import React from 'react';
import { X, Users } from 'lucide-react';
import type { Community, CommunityMember } from '../../../types/discussion';
import { useTheme } from '../../../contexts/ThemeContext';
import { logger } from '../../../utils/logger';

interface ManageMembersModalProps {
  isOpen: boolean;
  community: Community | null;
  members: CommunityMember[];
  onClose: () => void;
  onRemoveMember?: (memberId: string) => void;
  onRoleChange?: (memberId: string, role: 'admin' | 'moderator' | 'member') => void;
}

export default function ManageMembersModal({
  isOpen,
  community,
  members,
  onClose,
  onRemoveMember,
  onRoleChange
}: ManageMembersModalProps) {
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
      <div className="rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: colors.background }}>
        <div className="px-6 py-4 flex items-center justify-between" style={{ background: `linear-gradient(to right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}>
          <h2 className="text-xl font-bold text-white">Manage Members - {community.name}</h2>
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.primaryText }}>Members ({members.length})</h3>
                <p className="text-sm" style={{ color: colors.tertiaryText }}>Manage roles and permissions</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-lg flex items-center gap-2 transition-colors" style={{ background: colors.primaryBlue, color: 'white' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = colors.primaryBlueHover; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = colors.primaryBlue; }}
                >
                  <Users size={16} />
                  Invite Members
                </button>
              </div>
            </div>
            
            {/* Search */}
            <input
              type="text"
              placeholder="Search members..."
              className="w-full px-4 py-2 rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />
          </div>
          
          {/* Members List */}
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="rounded-lg p-4 transition-shadow" style={{ border: `1px solid ${colors.border}`, background: colors.cardBackground }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{ background: `linear-gradient(to bottom right, ${colors.primaryBlue}, ${colors.badgePurpleText})` }}>
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold" style={{ color: colors.primaryText }}>{member.name}</h4>
                        {member.role === 'admin' && (
                          <span className="px-2 py-0.5 text-xs rounded-full" style={{ background: `${colors.badgeErrorText}20`, color: colors.badgeErrorText }}>Admin</span>
                        )}
                        {member.role === 'moderator' && (
                          <span className="px-2 py-0.5 text-xs rounded-full" style={{ background: `${colors.primaryBlue}20`, color: colors.activeBlueText }}>Mod</span>
                        )}
                        {member.role === 'member' && (
                          <span className="px-2 py-0.5 text-xs rounded-full" style={{ background: colors.inputBackground, color: colors.primaryText }}>Member</span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: colors.tertiaryText }}>{member.email}</p>
                      <div className="flex items-center gap-4 text-xs mt-1" style={{ color: colors.tertiaryText }}>
                        <span>{member.postCount} posts</span>
                        <span>Joined {member.joinedAt}</span>
                        <span>Last active: {member.lastActive}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => {
                        const newRole = e.target.value as 'admin' | 'moderator' | 'member';
                        if (onRoleChange) {
                          onRoleChange(member.id, newRole);
                        } else {
                          logger.debug(`Change role for ${member.name} to ${newRole}`);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        background: colors.inputBackground,
                        border: `1px solid ${colors.border}`,
                        color: colors.primaryText,
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
                      title={`Change role for ${member.name}`}
                      aria-label={`Change role for ${member.name}`}
                    >
                      <option value="member">Member</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${member.name} from ${community.name}?`)) {
                          if (onRemoveMember) {
                            onRemoveMember(member.id);
                          } else {
                            logger.debug(`Removed ${member.name}`);
                          }
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg transition-colors text-sm"
                      style={{
                        background: 'transparent',
                        border: `1px solid ${colors.badgeErrorText}`,
                        color: colors.badgeErrorText,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = `${colors.badgeErrorText}20`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

