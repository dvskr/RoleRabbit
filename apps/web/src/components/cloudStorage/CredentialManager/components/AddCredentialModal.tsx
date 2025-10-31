import React, { useState } from 'react';
import { X } from 'lucide-react';
import { logger } from '../../../../utils/logger';
import { CredentialInfo } from '../../../../types/cloudStorage';
import { CREDENTIAL_TYPES, MODAL_OVERLAY_BACKGROUND } from '../constants';

interface AddCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCredential: (credential: Partial<CredentialInfo>) => void;
  colors: {
    cardBackground: string;
    border: string;
    primaryText: string;
    secondaryText: string;
    hoverBackground: string;
    inputBackground: string;
    borderFocused: string;
    primaryBlue: string;
    hoverBackgroundStrong: string;
  };
  theme: {
    mode: 'light' | 'dark';
  };
}

export function AddCredentialModal({ 
  isOpen, 
  onClose,
  onAddCredential,
  colors,
  theme 
}: AddCredentialModalProps) {
  const [formData, setFormData] = useState({
    credentialType: 'certification' as CredentialInfo['credentialType'],
    issuer: '',
    credentialId: '',
    issuedDate: '',
    expirationDate: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logger.debug('Adding credential', formData);
    
    const credentialData: Partial<CredentialInfo> = {
      credentialType: formData.credentialType,
      issuer: formData.issuer,
      credentialId: formData.credentialId || undefined,
      issuedDate: formData.issuedDate,
      expirationDate: formData.expirationDate || undefined,
      verificationStatus: 'pending',
      associatedDocuments: [],
    };

    onAddCredential(credentialData);
    
    // Reset form
    setFormData({
      credentialType: 'certification',
      issuer: '',
      credentialId: '',
      issuedDate: '',
      expirationDate: '',
    });
    
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: MODAL_OVERLAY_BACKGROUND }}
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
            onClick={onClose}
            className="p-1.5 transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = colors.hoverBackground;
            }}
            aria-label="Close add credential modal"
            title="Close"
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              className="block text-sm font-medium mb-1"
              style={{ color: colors.primaryText }}
            >
              Credential Type
            </label>
            <select 
              className="w-full px-3 py-2 rounded-lg transition-all"
              aria-label="Credential type"
              title="Credential type"
              value={formData.credentialType}
              onChange={(e) => setFormData({ ...formData, credentialType: e.target.value as CredentialInfo['credentialType'] })}
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
              {CREDENTIAL_TYPES.map((type) => (
                <option 
                  key={type.value} 
                  value={type.value}
                  style={{ background: theme.mode === 'dark' ? '#1a1625' : '#ffffff', color: theme.mode === 'dark' ? '#cbd5e1' : '#1e293b' }}
                >
                  {type.label}
                </option>
              ))}
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
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              required
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
              value={formData.credentialId}
              onChange={(e) => setFormData({ ...formData, credentialId: e.target.value })}
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
                value={formData.issuedDate}
                onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg transition-all"
                aria-label="Issued date"
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
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg transition-all"
                aria-label="Expiration date"
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
              Cancel
            </button>
            <button
              type="submit"
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
  );
}

