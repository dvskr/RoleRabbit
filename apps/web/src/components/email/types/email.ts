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

// Component Props
export interface AIGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate?: (prompt: string) => void;
  context?: AIContext;
  onContextChange?: (changes: Partial<AIContext>) => void;
  prompt?: string;
  onPromptChange?: (prompt: string) => void;
}

export interface CampaignCardProps {
  campaign: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSend: (id: string) => void;
  onPause?: (id: string) => void;
  onResume?: (id: string) => void;
}

export interface EmailHeaderProps {
  title?: string;
  subtitle?: string;
  onCompose?: () => void;
  onSync?: () => void;
}

export interface EmailTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  recipientCount: number;
  recipients?: string[];
  template?: any;
  sent?: number;
  opened?: number;
  replied?: number;
  clicked?: number;
  scheduledAt?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'completed' | 'active' | 'paused';
  createdAt: string;
}

export interface AIContext {
  mode: 'generate' | 'improve' | 'reply';
  tone: string;
  length: string;
  customPrompt?: string;
}

export interface EmailComposerProps {
  recipientEmail?: string;
  recipientName?: string;
  onSend?: (emailData: any) => void;
  onCancel?: () => void;
}
