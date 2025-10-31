export interface EmailComposerAIProps {
  recipientEmail?: string;
  recipientName?: string;
  onSend?: (emailData: EmailData) => void;
  onCancel?: () => void;
}

export interface EmailData {
  to: string;
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  attachments: string[];
}

export interface EmailTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  isCustom?: boolean;
  usageCount?: number;
}

