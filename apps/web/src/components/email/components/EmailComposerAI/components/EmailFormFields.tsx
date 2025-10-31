'use client';

import React from 'react';
import { PLACEHOLDERS, TIPS } from '../utils/emailComposerAI.constants';

interface EmailFormFieldsProps {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
  onToChange: (value: string) => void;
  onCcChange: (value: string) => void;
  onBccChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  colors: {
    primaryText: string;
    secondaryText: string;
    inputBackground: string;
    border: string;
    borderFocused: string;
  };
}

export function EmailFormFields({
  to,
  cc,
  bcc,
  subject,
  body,
  onToChange,
  onCcChange,
  onBccChange,
  onSubjectChange,
  onBodyChange,
  colors,
}: EmailFormFieldsProps) {
  return (
    <div className="space-y-4">
      {/* To */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
          To *
        </label>
        <input
          type="email"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          placeholder={PLACEHOLDERS.RECIPIENT_EMAIL}
          required
          className="w-full px-3 py-2 rounded-lg transition-colors"
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

      {/* CC */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
          CC
        </label>
        <input
          type="text"
          value={cc}
          onChange={(e) => onCcChange(e.target.value)}
          placeholder={PLACEHOLDERS.CC_EMAILS}
          className="w-full px-3 py-2 rounded-lg transition-colors"
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

      {/* BCC */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
          BCC
        </label>
        <input
          type="text"
          value={bcc}
          onChange={(e) => onBccChange(e.target.value)}
          placeholder={PLACEHOLDERS.BCC_EMAILS}
          className="w-full px-3 py-2 rounded-lg transition-colors"
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

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
          Subject *
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder={PLACEHOLDERS.EMAIL_SUBJECT}
          required
          className="w-full px-3 py-2 rounded-lg transition-colors"
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

      {/* Body */}
      <div className="flex-1">
        <label className="block text-sm font-medium mb-2" style={{ color: colors.primaryText }}>
          Body *
        </label>
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder={PLACEHOLDERS.EMAIL_BODY}
          required
          rows={12}
          className="w-full px-3 py-2 rounded-lg resize-none font-mono text-sm transition-colors"
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
        <p className="text-xs mt-2" style={{ color: colors.secondaryText }}>
          {TIPS.EMAIL_BODY_TIP}
        </p>
      </div>
    </div>
  );
}

