/**
 * Email Type Definitions
 * Used for email communication tracking
 */

export type EmailProvider = 'Gmail' | 'Outlook' | 'Custom' | 'None';
export type EmailStatus = 'read' | 'unread' | 'archived' | 'deleted';
export type EmailDirection = 'inbound' | 'outbound';

export interface Email {
  id: string;
  contactId: string;
  fromEmail: string;
  fromName: string;
  toEmail: string;
  toName: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  htmlBody?: string;
  attachments?: EmailAttachment[];
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  status: EmailStatus;
  direction: EmailDirection;
  sentAt: string;
  receivedAt?: string;
  inReplyTo?: string;
  threadId: string;
  provider: EmailProvider;
}

export interface EmailAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url?: string;
}

export interface EmailDraft {
  id: string;
  contactId?: string;
  toEmail: string;
  toName?: string;
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailThread {
  id: string;
  subject: string;
  emails: Email[];
  contactId: string;
  lastActivity: string;
  isArchived: boolean;
}
