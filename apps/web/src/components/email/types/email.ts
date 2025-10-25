export interface EmailTemplate {
  id: string;
  name: string;
  category: 'cold-email' | 'follow-up' | 'thank-you' | 'networking' | 'application' | 'inquiry';
  subject: string;
  content: string;
  aiGenerated: boolean;
  successRate: number;
  usageCount: number;
  tags: string[];
}

export interface EmailDraft {
  id: string;
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  content: string;
  attachments: string[];
  template?: EmailTemplate;
  aiGenerated: boolean;
  createdAt: string;
  status: 'draft' | 'sent' | 'scheduled' | 'failed';
}

export interface EmailCampaign {
  id: string;
  name: string;
  template: EmailTemplate;
  recipients: string[];
  sent: number;
  opened: number;
  replied: number;
  clicked: number;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: string;
}

export interface AIContext {
  recipientType: 'hr' | 'recruiter' | 'manager' | 'ceo';
  industry: 'tech' | 'finance' | 'healthcare' | 'education' | 'retail';
  position: 'software-engineer' | 'data-scientist' | 'product-manager' | 'designer';
  tone: 'professional' | 'casual' | 'formal' | 'friendly';
  length: 'short' | 'medium' | 'long';
}

export interface EmailHeaderProps {
  onCompose: () => void;
  onSync: () => void;
}

export interface EmailTabsProps {
  activeTab: 'inbox' | 'compose' | 'templates' | 'campaigns' | 'analytics';
  onTabChange: (tab: 'inbox' | 'compose' | 'templates' | 'campaigns' | 'analytics') => void;
}

export interface EmailComposerProps {
  draft: EmailDraft;
  onDraftChange: (draft: Partial<EmailDraft>) => void;
  onSend: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export interface TemplateCardProps {
  template: EmailTemplate;
  onUse: (template: EmailTemplate) => void;
  onEdit?: (template: EmailTemplate) => void;
  onDelete?: (template: EmailTemplate) => void;
}

export interface CampaignCardProps {
  campaign: EmailCampaign;
  onEdit?: (campaign: EmailCampaign) => void;
  onDelete?: (campaign: EmailCampaign) => void;
  onPause?: (campaign: EmailCampaign) => void;
  onResume?: (campaign: EmailCampaign) => void;
}

export interface AIGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (content: string) => void;
  context: AIGontext;
  onContextChange: (context: Partial<AIContext>) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
}
