'use client';

import React from 'react';
import { useState } from 'react';
import EmailComposerAI from '../components/EmailComposerAI';
import { logger } from '../../../utils/logger';

export default function ComposerTab() {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (emailData: any) => {
    setIsSending(true);
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
      setIsSending(false);
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

