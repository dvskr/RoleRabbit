'use client';

import React, { useState } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import type { EmailData } from './EmailComposerAI/types/EmailComposerAI.types';

interface EmailComposerProps {
  recipientEmail?: string;
  recipientName?: string;
  onSend?: (emailData: EmailData) => void;
  onCancel?: () => void;
}

export default function EmailComposer({
  recipientEmail = '',
  recipientName = '',
  onSend,
  onCancel,
}: EmailComposerProps) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [to, setTo] = useState(recipientEmail);
  const [cc, setCc] = useState('');
  const [bcc, setBcc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);

  const handleSend = () => {
    if (onSend) {
      onSend({
        to,
        cc: cc ? cc.split(',').map(e => e.trim()) : [],
        bcc: bcc ? bcc.split(',').map(e => e.trim()) : [],
        subject,
        body,
        attachments,
      });
    }
  };

  const handleAttach = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e: Event) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        setAttachments([...attachments, ...Array.from(files).map(f => f.name)]);
      }
    };
    input.click();
  };

  return (
    <div className="h-full flex flex-col" style={{ background: colors.background }}>
      {/* Toolbar */}
      <div className="px-4 py-3 flex items-center justify-between flex-shrink-0" style={{ background: colors.headerBackground, borderBottom: `1px solid ${colors.border}` }}>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAttach}
            className="p-2 rounded-lg transition-colors"
            style={{ color: colors.secondaryText }}
            onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            title="Attach File"
            aria-label="Attach file"
          >
            <Paperclip size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg transition-colors font-medium"
              style={{
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSend}
            disabled={!to || !subject || !body}
            className="px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: colors.primaryBlue,
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!(!to || !subject || !body)) {
                e.currentTarget.style.background = colors.primaryBlueHover;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = colors.primaryBlue;
            }}
          >
            <Send size={16} />
            Send
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ background: colors.background }}>
        <div className="p-6 space-y-4">
          {/* To */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>To *</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Recipient email"
              required
              className="w-full px-3 py-2 rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />
          </div>

          {/* CC */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>CC</label>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              placeholder="cc1@example.com, cc2@example.com"
              className="w-full px-3 py-2 rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />
          </div>

          {/* BCC */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>BCC</label>
            <input
              type="text"
              value={bcc}
              onChange={(e) => setBcc(e.target.value)}
              placeholder="bcc1@example.com, bcc2@example.com"
              className="w-full px-3 py-2 rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              required
              className="w-full px-3 py-2 rounded-lg"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>Attachments</label>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm" style={{ background: colors.inputBackground }}>
                    <Paperclip size={14} style={{ color: colors.secondaryText }} />
                    <span style={{ color: colors.primaryText }}>{file}</span>
                    <button
                      onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                      className="ml-2"
                      style={{ color: colors.badgeErrorText }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = colors.hoverBackground; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2" style={{ color: colors.secondaryText }}>Body *</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your email..."
              required
              rows={12}
              className="w-full px-3 py-2 rounded-lg resize-none font-mono text-sm"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = colors.primaryBlue; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = colors.border; }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
