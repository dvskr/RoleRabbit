import React from 'react';
import { GraduationCap, QrCode, X } from 'lucide-react';
import { CredentialInfo } from '../../../../types/cloudStorage';
import { getStatusColor, formatCredentialType } from '../utils';
import { MODAL_OVERLAY_BACKGROUND } from '../constants';

interface ViewCredentialModalProps {
  credential: CredentialInfo | null;
  onClose: () => void;
  colors: {
    cardBackground: string;
    border: string;
    primaryBlue: string;
    primaryText: string;
    secondaryText: string;
    hoverBackground: string;
    inputBackground: string;
    hoverBackgroundStrong: string;
    successGreen: string;
    errorRed: string;
    badgeWarningText: string;
    badgeSuccessBg: string;
    badgeErrorBg: string;
    badgeWarningBg: string;
  };
}

export function ViewCredentialModal({ 
  credential, 
  onClose, 
  colors 
}: ViewCredentialModalProps) {
  if (!credential) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: MODAL_OVERLAY_BACKGROUND }}
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
                {credential.issuer}
              </h3>
              <p 
                className="text-sm"
                style={{ color: colors.secondaryText }}
              >
                {formatCredentialType(credential.credentialType)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = colors.primaryText;
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            aria-label="Close credential details"
            title="Close"
            onMouseLeave={(e) => {
              e.currentTarget.style.color = colors.secondaryText;
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          {credential.credentialId && (
            <div 
              className="flex justify-between py-2"
              style={{ borderBottom: `1px solid ${colors.border}` }}
            >
              <span style={{ color: colors.secondaryText }}>Credential ID:</span>
              <span 
                className="font-medium"
                style={{ color: colors.primaryText }}
              >
                {credential.credentialId}
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
              style={{
                color: getStatusColor(credential.verificationStatus, colors).text,
                backgroundColor: getStatusColor(credential.verificationStatus, colors).bg,
              }}
            >
              {credential.verificationStatus.toUpperCase()}
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
              {new Date(credential.issuedDate).toLocaleDateString()}
            </span>
          </div>
          {credential.expirationDate && (
            <div 
              className="flex justify-between py-2"
              style={{ borderBottom: `1px solid ${colors.border}` }}
            >
              <span style={{ color: colors.secondaryText }}>Expiration Date:</span>
              <span 
                className="font-medium"
                style={{ color: colors.primaryText }}
              >
                {new Date(credential.expirationDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {credential.verificationUrl && (
            <div 
              className="flex justify-between py-2"
              style={{ borderBottom: `1px solid ${colors.border}` }}
            >
              <span style={{ color: colors.secondaryText }}>Verification:</span>
              <a
                href={credential.verificationUrl}
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

        {credential.qrCode && (
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
            <img src={credential.qrCode} alt="QR Code" className="w-32 h-32 mx-auto" />
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
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
  );
}

