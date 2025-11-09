'use client';

import React from 'react';
import EmailComposerAI from '../components/EmailComposerAI';
import { logger } from '../../../utils/logger';
import type { EmailData } from '../components/EmailComposerAI/types/EmailComposerAI.types';

export default function ComposerTab() {
  const handleSend = async (emailData: EmailData) => {
    try {
      const response = await fetch('http://localhost:3001/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          html: emailData.body
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send email');
      }

      const data = await response.json();
      logger.info('Email sent:', data);
    } catch (error) {
      logger.error('Failed to send email:', error);
    } finally {
      // no-op: UI can react to completion via parent state if needed
    }
  };

  const handleCancel = () => {
    // Composer will handle its own reset
  };

  return (
    <div className="h-full bg-white">
      <EmailComposerAI 
        onSend={handleSend}
        onCancel={handleCancel}
      />
    </div>
  );
}

