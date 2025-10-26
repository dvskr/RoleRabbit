export interface CoverLetterTemplate {
  id: string;
  name: string;
  category: 'software' | 'design' | 'marketing' | 'sales' | 'finance' | 'general';
  description: string;
  content: string;
  wordCount: number;
  aiGenerated: boolean;
  successRate: number;
  usageCount: number;
  tags: string[];
}

export interface CoverLetterDraft {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  template?: CoverLetterTemplate;
  aiGenerated: boolean;
  jobTitle: string;
  companyName: string;
  createdAt: string;
  lastModified: string;
  status: 'draft' | 'completed' | 'archived';
}

export interface AIContext {
  jobTitle: string;
  companyName: string;
  industry: 'tech' | 'finance' | 'healthcare' | 'education' | 'retail' | 'other';
  jobLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'executive';
  experience: '0-1' | '2-5' | '6-10' | '10+';
  tone: 'professional' | 'casual' | 'formal' | 'enthusiastic';
  length: 'short' | 'medium' | 'long';
  keyPoints: string[];
  skills: string[];
  achievements: string[];
}

export interface CoverLetterHeaderProps {
  onSave: () => void;
  onExport: () => void;
  onPrint: () => void;
  wordCount: number;
  isSaving: boolean;
}

export interface CoverLetterTabsProps {
  activeTab: 'templates' | 'ai' | 'custom' | 'preview';
  onTabChange: (tab: 'templates' | 'ai' | 'custom' | 'preview') => void;
}

export interface CoverLetterEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  wordCount: number;
  onWordCountChange: (count: number) => void;
  placeholder?: string;
}

export interface TemplateCardProps {
  template: CoverLetterTemplate;
  onUse: (template: CoverLetterTemplate) => void;
  onPreview?: (template: CoverLetterTemplate) => void;
}

export interface AIContextFormProps {
  context: AIContext;
  onContextChange: (context: Partial<AIContext>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export interface PreviewPanelProps {
  content: string;
  title: string;
  onExport: (format: 'pdf' | 'word') => void;
  onPrint: () => void;
  wordCount: number;
}
