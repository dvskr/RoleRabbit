import React from 'react';
import { GraduationCap, QrCode } from 'lucide-react';
import { CredentialInfo } from '../../../../types/cloudStorage';
import { getStatusColor, getStatusIcon, formatCredentialType } from '../utils';

interface CredentialCardProps {
  credential: CredentialInfo;
  colors: {
    cardBackground: string;
    border: string;
    borderFocused: string;
    primaryBlue: string;
    primaryText: string;
    secondaryText: string;
    successGreen: string;
    errorRed: string;
    badgeWarningText: string;
    badgeSuccessBg: string;
    badgeErrorBg: string;
    badgeWarningBg: string;
    inputBackground: string;
  };
  onCardClick: (credential: CredentialInfo) => void;
  onGenerateQRCode: (id: string) => string;
}

export function CredentialCard({ 
  credential, 
  colors, 
  onCardClick,
  onGenerateQRCode 
}: CredentialCardProps) {
  const statusColorStyle = getStatusColor(credential.verificationStatus, colors);

  return (
    <div
      className="rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
      style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
      }}
      onClick={() => onCardClick(credential)}
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
              {formatCredentialType(credential.credentialType)}
            </p>
          </div>
        </div>
        {getStatusIcon(credential.verificationStatus, colors)}
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
}

