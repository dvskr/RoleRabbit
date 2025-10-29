'use client';

import React, { useState } from 'react';
import { GraduationCap, Clock, CheckCircle, XCircle, QrCode, FileText, X } from 'lucide-react';
import { CredentialInfo, CredentialReminder } from '../../types/cloudStorage';
import { logger } from '../../utils/logger';
import { useTheme } from '../../contexts/ThemeContext';

interface CredentialManagerProps {
  credentials: CredentialInfo[];
  reminders: CredentialReminder[];
  onAddCredential: (credential: Partial<CredentialInfo>) => void;
  onUpdateCredential: (id: string, updates: Partial<CredentialInfo>) => void;
  onDeleteCredential: (id: string) => void;
  onGenerateQRCode: (id: string) => string;
}

export default function CredentialManager({
  credentials,
  reminders,
  onAddCredential,
  onUpdateCredential,
  onDeleteCredential,
  onGenerateQRCode
}: CredentialManagerProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<CredentialInfo | null>(null);

  const getStatusColor = (status: CredentialInfo['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return { text: colors.successGreen, bg: colors.badgeSuccessBg };
      case 'expired':
        return { text: colors.errorRed, bg: colors.badgeErrorBg };
      case 'pending':
        return { text: colors.badgeWarningText, bg: colors.badgeWarningBg };
      case 'revoked':
        return { text: colors.secondaryText, bg: colors.inputBackground };
      default:
        return { text: colors.secondaryText, bg: colors.inputBackground };
    }
  };

  const getStatusIcon = (status: CredentialInfo['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle size={16} style={{ color: colors.successGreen }} />;
      case 'expired':
        return <XCircle size={16} style={{ color: colors.errorRed }} />;
      case 'pending':
        return <Clock size={16} style={{ color: colors.badgeWarningText }} />;
      case 'revoked':
        return <XCircle size={16} style={{ color: colors.secondaryText }} />;
      default:
        return <Clock size={16} style={{ color: colors.secondaryText }} />;
    }
  };

  const getReminderPriorityColor = (priority: CredentialReminder['priority']) => {
    switch (priority) {
      case 'high':
        return { border: colors.errorRed, bg: colors.badgeErrorBg };
      case 'medium':
        return { border: colors.badgeWarningText, bg: colors.badgeWarningBg };
      case 'low':
        return { border: colors.primaryBlue, bg: colors.badgeInfoBg };
      default:
        return { border: colors.border, bg: colors.inputBackground };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 
            className="text-xl font-semibold"
            style={{ color: colors.primaryText }}
          >
            Credential Management
          </h2>
          <p 
            className="text-sm mt-1"
            style={{ color: colors.secondaryText }}
          >
            Track certifications, licenses, and credentials
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
          style={{
            background: colors.primaryBlue,
            color: 'white',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <GraduationCap size={18} />
          Add Credential
        </button>
      </div>

      {/* Active Reminders */}
      {reminders.length > 0 && (
        <div 
          className="rounded-lg p-4"
          style={{
            background: colors.badgeWarningBg,
            border: `1px solid ${colors.badgeWarningBorder}`,
          }}
        >
          <div className="flex items-start gap-3">
            <Clock style={{ color: colors.badgeWarningText }} className="mt-0.5" size={20} />
            <div className="flex-1">
              <h3 
                className="font-semibold mb-2"
                style={{ color: colors.primaryText }}
              >
                Upcoming Expirations
              </h3>
              <div className="space-y-2">
                {reminders.map((reminder) => {
                  const priorityColorStyle = getReminderPriorityColor(reminder.priority);
                  return (
                    <div
                      key={reminder.id}
                      className="border rounded-lg p-3"
                      style={{
                        borderColor: priorityColorStyle.border,
                        background: priorityColorStyle.bg,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p 
                            className="font-medium"
                            style={{ color: colors.primaryText }}
                          >
                            {reminder.credentialName}
                          </p>
                          <p 
                            className="text-sm mt-1"
                            style={{ color: colors.secondaryText }}
                          >
                            Expires: {new Date(reminder.expirationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span 
                          className="px-2 py-1 text-xs font-medium rounded"
                          style={{
                            background: reminder.priority === 'high' ? colors.badgeErrorBg :
                                        reminder.priority === 'medium' ? colors.badgeWarningBg :
                                        colors.badgeInfoBg,
                            color: reminder.priority === 'high' ? colors.errorRed :
                                   reminder.priority === 'medium' ? colors.badgeWarningText :
                                   colors.badgeInfoText,
                          }}
                        >
                          {reminder.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Grid */}
      {credentials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {credentials.map((credential) => {
            const statusColorStyle = getStatusColor(credential.verificationStatus);
            return (
              <div
                key={credential.credentialId}
                className="rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                style={{
                  background: colors.cardBackground,
                  border: `1px solid ${colors.border}`,
                }}
                onClick={() => setSelectedCredential(credential)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = colors.borderFocused;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colors.border;
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap style={{ color: colors.primaryBlue }} size={24} />
                    <div>
                      <h3 
                        className="font-semibold"
                        style={{ color: colors.primaryText }}
                      >
                        {credential.issuer}
                      </h3>
                      <p 
                        className="text-xs mt-0.5"
                        style={{ color: colors.secondaryText }}
                      >
                        {credential.credentialType.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>
                  {getStatusIcon(credential.verificationStatus)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span style={{ color: colors.secondaryText }}>Issued:</span>
                    <span 
                      className="font-medium"
                      style={{ color: colors.primaryText }}
                    >
                      {new Date(credential.issuedDate).toLocaleDateString()}
                    </span>
                  </div>
                  {credential.expirationDate && (
                    <div className="flex items-center justify-between">
                      <span style={{ color: colors.secondaryText }}>Expires:</span>
                      <span 
                        className="font-medium"
                        style={{ color: colors.primaryText }}
                      >
                        {new Date(credential.expirationDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <div 
                    className="pt-2 mt-2"
                    style={{ borderTop: `1px solid ${colors.border}` }}
                  >
                    <span 
                      className="px-2 py-1 text-xs font-medium rounded"
                      style={{
                        background: statusColorStyle.bg,
                        color: statusColorStyle.text,
                      }}
                    >
                      {credential.verificationStatus.toUpperCase()}
                    </span>
                  </div>
                </div>

                {credential.qrCode && (
                  <div 
                    className="mt-3 pt-3"
                    style={{ borderTop: `1px solid ${colors.border}` }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const qrUrl = onGenerateQRCode(credential.credentialId || '');
                        window.open(qrUrl, '_blank');
                      }}
                      className="flex items-center gap-2 text-sm transition-colors"
                      style={{ color: colors.primaryBlue }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '0.8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                    >
                      <QrCode size={16} />
                      View QR Code
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div 
          className="text-center py-12 rounded-lg"
          style={{
            background: colors.inputBackground,
          }}
        >
          <GraduationCap size={48} style={{ color: colors.tertiaryText }} className="mx-auto mb-4" />
          <h3 
            className="text-lg font-semibold mb-2"
            style={{ color: colors.primaryText }}
          >
            No Credentials Added
          </h3>
          <p 
            className="mb-4"
            style={{ color: colors.secondaryText }}
          >
            Start tracking your certifications, licenses, and credentials
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg transition-colors"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Add Your First Credential
          </button>
        </div>
      )}

      {/* Add Credential Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-lg shadow-xl max-w-md w-full p-6"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 
                className="text-lg font-semibold"
                style={{ color: colors.primaryText }}
              >
                Add New Credential
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={18} />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.primaryText }}
                >
                  Credential Type
                </label>
                <select 
                  className="w-full px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                >
                  <option value="certification" style={{ background: colors.background, color: colors.secondaryText }}>Certification</option>
                  <option value="license" style={{ background: colors.background, color: colors.secondaryText }}>License</option>
                  <option value="visa" style={{ background: colors.background, color: colors.secondaryText }}>Visa</option>
                  <option value="degree" style={{ background: colors.background, color: colors.secondaryText }}>Degree</option>
                  <option value="badge" style={{ background: colors.background, color: colors.secondaryText }}>Badge</option>
                </select>
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.primaryText }}
                >
                  Issuer
                </label>
                <input
                  type="text"
                  placeholder="e.g., AWS, Microsoft, etc."
                  className="w-full px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>
              <div>
                <label 
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.primaryText }}
                >
                  Credential ID
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: colors.inputBackground,
                    border: `1px solid ${colors.border}`,
                    color: colors.primaryText,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.borderFocused;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = colors.border;
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: colors.primaryText }}
                  >
                    Issued Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  />
                </div>
                <div>
                  <label 
                    className="block text-sm font-medium mb-1"
                    style={{ color: colors.primaryText }}
                  >
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = colors.borderFocused;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = colors.border;
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    background: colors.inputBackground,
                    color: colors.secondaryText,
                    border: `1px solid ${colors.border}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = colors.hoverBackgroundStrong;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = colors.inputBackground;
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    logger.debug('Adding credential');
                    setShowAddModal(false);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg transition-colors"
                  style={{
                    background: colors.primaryBlue,
                    color: 'white',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  Add Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Credential Modal */}
      {selectedCredential && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div 
            className="rounded-lg shadow-xl max-w-lg w-full p-6"
            style={{
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <GraduationCap style={{ color: colors.primaryBlue }} size={32} />
                <div>
                  <h3 
                    className="text-lg font-semibold"
                    style={{ color: colors.primaryText }}
                  >
                    {selectedCredential.issuer}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: colors.secondaryText }}
                  >
                    {selectedCredential.credentialType.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCredential(null)}
                className="transition-colors"
                style={{ color: colors.secondaryText }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.primaryText;
                  e.currentTarget.style.background = colors.hoverBackground;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.secondaryText;
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {selectedCredential.credentialId && (
                <div 
                  className="flex justify-between py-2"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  <span style={{ color: colors.secondaryText }}>Credential ID:</span>
                  <span 
                    className="font-medium"
                    style={{ color: colors.primaryText }}
                  >
                    {selectedCredential.credentialId}
                  </span>
                </div>
              )}
              <div 
                className="flex justify-between py-2"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <span style={{ color: colors.secondaryText }}>Status:</span>
                <span 
                  className="px-2 py-1 text-xs font-medium rounded"
                  style={getStatusColor(selectedCredential.verificationStatus)}
                >
                  {selectedCredential.verificationStatus.toUpperCase()}
                </span>
              </div>
              <div 
                className="flex justify-between py-2"
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <span style={{ color: colors.secondaryText }}>Issued Date:</span>
                <span 
                  className="font-medium"
                  style={{ color: colors.primaryText }}
                >
                  {new Date(selectedCredential.issuedDate).toLocaleDateString()}
                </span>
              </div>
              {selectedCredential.expirationDate && (
                <div 
                  className="flex justify-between py-2"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  <span style={{ color: colors.secondaryText }}>Expiration Date:</span>
                  <span 
                    className="font-medium"
                    style={{ color: colors.primaryText }}
                  >
                    {new Date(selectedCredential.expirationDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {selectedCredential.verificationUrl && (
                <div 
                  className="flex justify-between py-2"
                  style={{ borderBottom: `1px solid ${colors.border}` }}
                >
                  <span style={{ color: colors.secondaryText }}>Verification:</span>
                  <a
                    href={selectedCredential.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors"
                    style={{ color: colors.primaryBlue }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    Verify Certificate
                  </a>
                </div>
              )}
            </div>

            {selectedCredential.qrCode && (
              <div 
                className="mt-4 p-4 rounded-lg"
                style={{
                  background: colors.inputBackground,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <QrCode size={20} style={{ color: colors.primaryBlue }} />
                  <span 
                    className="font-medium"
                    style={{ color: colors.primaryText }}
                  >
                    QR Code
                  </span>
                </div>
                <img src={selectedCredential.qrCode} alt="QR Code" className="w-32 h-32 mx-auto" />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedCredential(null)}
                className="flex-1 px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: colors.inputBackground,
                  color: colors.secondaryText,
                  border: `1px solid ${colors.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackgroundStrong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

