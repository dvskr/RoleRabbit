import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardModals } from '../DashboardModals';
import { ResumeData, SectionVisibility, CustomSection } from '../../../../types/resume';
import { ResumeFile } from '../../../../types/cloudStorage';

// Mock next/dynamic to return components directly
jest.mock('next/dynamic', () => {
  return (importFn: () => Promise<any>) => {
    return React.lazy(importFn);
  };
});

// Mock all modal components
jest.mock('../../../../components/modals', () => {
  const MockExportModal = ({ showExportModal, resumeFileName }: any) =>
    showExportModal ? <div data-testid="export-modal">{resumeFileName}</div> : null;
  
  const MockImportModal = ({ showImportModal }: any) =>
    showImportModal ? <div data-testid="import-modal">Import Modal</div> : null;
  
  const MockAddSectionModal = ({ showAddSectionModal }: any) =>
    showAddSectionModal ? <div data-testid="add-section-modal">Add Section</div> : null;
  
  const MockAddFieldModal = ({ showAddFieldModal }: any) =>
    showAddFieldModal ? <div data-testid="add-field-modal">Add Field</div> : null;
  
  const MockNewResumeModal = ({ showNewResumeModal }: any) =>
    showNewResumeModal ? <div data-testid="new-resume-modal">New Resume</div> : null;
  
  const MockMobileMenuModal = ({ showMobileMenu }: any) =>
    showMobileMenu ? <div data-testid="mobile-menu-modal">Mobile Menu</div> : null;
  
  const MockAIGenerateModal = ({ showAIGenerateModal }: any) =>
    showAIGenerateModal ? <div data-testid="ai-generate-modal">AI Generate</div> : null;
  
  const MockResumeSaveToCloudModal = ({ onClose }: any) => (
    <div data-testid="save-to-cloud-modal">
      <button onClick={onClose}>Close</button>
    </div>
  );
  
  const MockResumeImportFromCloudModal = ({ onClose }: any) => (
    <div data-testid="import-from-cloud-modal">
      <button onClick={onClose}>Close</button>
    </div>
  );
  
  return {
    ExportModal: MockExportModal,
    ImportModal: MockImportModal,
    AddSectionModal: MockAddSectionModal,
    AddFieldModal: MockAddFieldModal,
    NewResumeModal: MockNewResumeModal,
    MobileMenuModal: MockMobileMenuModal,
    AIGenerateModal: MockAIGenerateModal,
    ResumeSaveToCloudModal: MockResumeSaveToCloudModal,
    ResumeImportFromCloudModal: MockResumeImportFromCloudModal,
  };
}, { virtual: true });

// Mock analytics components
jest.mock('../../../../components/features/ResumeSharing', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="resume-sharing">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('../../../../components/CoverLetterAnalytics', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="cover-letter-analytics">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('../../../../components/email/EmailAnalytics', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="email-analytics">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

jest.mock('../../../../components/ApplicationAnalytics', () => ({
  __esModule: true,
  default: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="application-analytics">
        <button onClick={onClose}>Close</button>
      </div>
    ) : null,
}));

describe('DashboardModals', () => {
  const mockResumeData: ResumeData = {
    name: 'John Doe',
    title: 'Software Engineer',
    email: 'john@example.com',
    phone: '123-456-7890',
    location: 'New York, NY',
    summary: '',
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
  };

  const defaultProps = {
    // Modal visibility states
    showExportModal: false,
    setShowExportModal: jest.fn(),
    showImportModal: false,
    setShowImportModal: jest.fn(),
    showAddSectionModal: false,
    setShowAddSectionModal: jest.fn(),
    showAddFieldModal: false,
    setShowAddFieldModal: jest.fn(),
    showNewResumeModal: false,
    setShowNewResumeModal: jest.fn(),
    showMobileMenu: false,
    setShowMobileMenu: jest.fn(),
    showAIGenerateModal: false,
    setShowAIGenerateModal: jest.fn(),
    showSaveToCloudModal: false,
    setShowSaveToCloudModal: jest.fn(),
    showImportFromCloudModal: false,
    setShowImportFromCloudModal: jest.fn(),
    showResumeSharing: false,
    setShowResumeSharing: jest.fn(),
    showCoverLetterAnalytics: false,
    setShowCoverLetterAnalytics: jest.fn(),
    showEmailAnalytics: false,
    setShowEmailAnalytics: jest.fn(),
    showApplicationAnalytics: false,
    setShowApplicationAnalytics: jest.fn(),

    // Modal data
    importMethod: 'file',
    setImportMethod: jest.fn(),
    importJsonData: '',
    setImportJsonData: jest.fn(),
    newSectionName: '',
    setNewSectionName: jest.fn(),
    newSectionContent: '',
    setNewSectionContent: jest.fn(),
    newFieldName: '',
    setNewFieldName: jest.fn(),
    newFieldIcon: 'link',
    setNewFieldIcon: jest.fn(),
    aiGenerateSection: 'summary',
    aiPrompt: '',
    setAiPrompt: jest.fn(),
    writingTone: 'professional',
    setWritingTone: jest.fn(),
    contentLength: 'medium',
    setContentLength: jest.fn(),

    // Resume data
    resumeFileName: 'resume.pdf',
    resumeData: mockResumeData,
    customSections: [] as CustomSection[],
    sectionOrder: ['summary'],
    sectionVisibility: {} as SectionVisibility,
    selectedTemplateId: 'template-1',
    fontFamily: 'arial',
    fontSize: '12pt',
    lineSpacing: '1.5',
    sectionSpacing: 'normal',
    margins: 'medium',
    headingStyle: 'bold',
    bulletStyle: 'disc',
    customFields: [],
    setCustomFields: jest.fn(),
    cloudResumes: [] as ResumeFile[],

    // Navigation
    activeTab: 'dashboard' as const,
    onTabChange: jest.fn(),

    // Handlers
    onExport: jest.fn(),
    onSaveToCloud: jest.fn(),
    onImportFromCloud: jest.fn(),
    onFileSelected: jest.fn(),
    onAddSection: jest.fn(),
    onOpenAIGenerateModal: jest.fn(),
    onAddField: jest.fn(),
    onNewResume: jest.fn(),
    onGenerateAIContent: jest.fn(),
    onConfirmSaveToCloud: jest.fn(),
    onLoadFromCloud: jest.fn(),
    DEFAULT_TEMPLATE_ID: 'default-template',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when all modals are hidden', () => {
    render(<DashboardModals {...defaultProps} />);
    
    expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('import-modal')).not.toBeInTheDocument();
  });

  it('renders ExportModal when showExportModal is true', () => {
    render(<DashboardModals {...defaultProps} showExportModal={true} />);
    
    expect(screen.getByTestId('export-modal')).toBeInTheDocument();
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
  });

  it('renders ImportModal when showImportModal is true', () => {
    render(<DashboardModals {...defaultProps} showImportModal={true} />);
    
    expect(screen.getByTestId('import-modal')).toBeInTheDocument();
  });

  it('renders AddSectionModal when showAddSectionModal is true', () => {
    render(<DashboardModals {...defaultProps} showAddSectionModal={true} />);
    
    expect(screen.getByTestId('add-section-modal')).toBeInTheDocument();
  });

  it('renders AddFieldModal when showAddFieldModal is true', () => {
    render(<DashboardModals {...defaultProps} showAddFieldModal={true} />);
    
    expect(screen.getByTestId('add-field-modal')).toBeInTheDocument();
  });

  it('renders NewResumeModal when showNewResumeModal is true', () => {
    render(<DashboardModals {...defaultProps} showNewResumeModal={true} />);
    
    expect(screen.getByTestId('new-resume-modal')).toBeInTheDocument();
  });

  it('renders MobileMenuModal when showMobileMenu is true', () => {
    render(<DashboardModals {...defaultProps} showMobileMenu={true} />);
    
    expect(screen.getByTestId('mobile-menu-modal')).toBeInTheDocument();
  });

  it('renders AIGenerateModal when showAIGenerateModal is true', () => {
    render(<DashboardModals {...defaultProps} showAIGenerateModal={true} />);
    
    expect(screen.getByTestId('ai-generate-modal')).toBeInTheDocument();
  });

  it('renders ResumeSaveToCloudModal when showSaveToCloudModal is true', () => {
    render(<DashboardModals {...defaultProps} showSaveToCloudModal={true} />);
    
    expect(screen.getByTestId('save-to-cloud-modal')).toBeInTheDocument();
  });

  it('renders ResumeImportFromCloudModal when showImportFromCloudModal is true', () => {
    render(<DashboardModals {...defaultProps} showImportFromCloudModal={true} />);
    
    expect(screen.getByTestId('import-from-cloud-modal')).toBeInTheDocument();
  });

  it('renders ResumeSharing when showResumeSharing is true', () => {
    render(<DashboardModals {...defaultProps} showResumeSharing={true} />);
    
    expect(screen.getByTestId('resume-sharing')).toBeInTheDocument();
  });

  it('renders CoverLetterAnalytics when showCoverLetterAnalytics is true', () => {
    render(<DashboardModals {...defaultProps} showCoverLetterAnalytics={true} />);
    
    expect(screen.getByTestId('cover-letter-analytics')).toBeInTheDocument();
  });

  it('renders EmailAnalytics when showEmailAnalytics is true', () => {
    render(<DashboardModals {...defaultProps} showEmailAnalytics={true} />);
    
    expect(screen.getByTestId('email-analytics')).toBeInTheDocument();
  });

  it('renders ApplicationAnalytics when showApplicationAnalytics is true', () => {
    render(<DashboardModals {...defaultProps} showApplicationAnalytics={true} />);
    
    expect(screen.getByTestId('application-analytics')).toBeInTheDocument();
  });

  it('can render multiple modals simultaneously', () => {
    render(
      <DashboardModals
        {...defaultProps}
        showExportModal={true}
        showImportModal={true}
      />
    );
    
    expect(screen.getByTestId('export-modal')).toBeInTheDocument();
    expect(screen.getByTestId('import-modal')).toBeInTheDocument();
  });
});

