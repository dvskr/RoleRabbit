// UI State Types and Interfaces
export interface LayoutSettings {
  selectedTemplate: string;
  layoutMode: string;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  sectionSpacing: string;
  margins: string;
  headingStyle: string;
  bulletStyle: string;
}

export interface AISettings {
  mode: 'match' | 'generate' | 'optimize';
  tone: 'professional' | 'technical' | 'creative' | 'executive' | 'results';
  length: 'concise' | 'medium' | 'detailed';
  jobDescription: string;
  selectedTone: string;
  selectedLength: string;
  tailorEditMode: 'full' | 'partial';
}

export interface SidebarState {
  collapsed: boolean;
  activeTab: string;
  previousState: boolean;
}

export interface ModalState {
  showNewResumeModal: boolean;
  showAIOptimize: boolean;
  showAIGenerate: boolean;
  showAIGenerateModal: boolean;
  showVersionManager: boolean;
  showCreateVersion: boolean;
  showCompareVersions: boolean;
  showRightPanel: boolean;
  showATSScore: boolean;
  showAIConfirmation: boolean;
  showTailorConfirmation: boolean;
}

export interface AIGenerateState {
  mode: string;
  generatedContent: string;
  targetSection: string | null;
  targetExperienceId: number | null;
  prompt: string;
  isGenerating: boolean;
  isTailoringMode: boolean;
  inputType: 'auto' | 'prompt' | 'job';
}

export interface VersionControlState {
  versions: any[];
  currentVersionId: string;
  newVersionName: string;
  newVersionDescription: string;
  newVersionTags: string[];
  compareVersion1: any;
  compareVersion2: any;
  autoSaveEnabled: boolean;
  versionFilter: string;
  versionSearchQuery: string;
  versionViewMode: 'list' | 'timeline' | 'branches';
}
