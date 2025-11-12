import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { DashboardModals } from '../DashboardModals';
import { ResumeData, SectionVisibility, CustomSection } from '../../../../types/resume';
import { ResumeFile } from '../../../../types/cloudStorage';

// Mock next/dynamic so dynamic imports resolve immediately to mocked components.
jest.mock('next/dynamic', () => {
  const React = require('react');
  return (importFn: () => Promise<any>) => {
    const LazyComponent = React.lazy(async () => {
      const mod = await importFn();
      const Component = mod?.default ?? mod;
      return { default: Component ?? (() => null) };
    });

    const DynamicWrapper = (props: any) => (
      <React.Suspense fallback={null}>
        <LazyComponent {...props} />
      </React.Suspense>
    );

    DynamicWrapper.displayName = 'DynamicMockComponent';
    return DynamicWrapper;
  };
});

// Mock all modal components
jest.mock('../../../../components/modals', () => {
  const ExportModal = ({ showExportModal, resumeFileName }: any) =>
    showExportModal ? <div data-testid="export-modal">{resumeFileName}</div> : null;

  const ImportModal = ({ showImportModal }: any) =>
    showImportModal ? <div data-testid="import-modal">Import Modal</div> : null;

  const AddSectionModal = ({ showAddSectionModal }: any) =>
    showAddSectionModal ? <div data-testid="add-section-modal">Add Section</div> : null;

  const AddFieldModal = ({ showAddFieldModal }: any) =>
    showAddFieldModal ? <div data-testid="add-field-modal">Add Field</div> : null;

  const NewResumeModal = ({ showNewResumeModal }: any) =>
    showNewResumeModal ? <div data-testid="new-resume-modal">New Resume</div> : null;

  const MobileMenuModal = ({ showMobileMenu }: any) =>
    showMobileMenu ? <div data-testid="mobile-menu-modal">Mobile Menu</div> : null;

  const AIGenerateModal = ({ showAIGenerateModal }: any) =>
    showAIGenerateModal ? <div data-testid="ai-generate-modal">AI Generate</div> : null;

  const ResumeSaveToCloudModal = ({ onClose }: any) => (
    <div data-testid="save-to-cloud-modal">
      <button onClick={onClose}>Close</button>
    </div>
  );

  const ResumeImportFromCloudModal = ({ onClose }: any) => (
    <div data-testid="import-from-cloud-modal">
      <button onClick={onClose}>Close</button>
    </div>
  );

  return {
    __esModule: true,
    ExportModal,
    ImportModal,
    AddSectionModal,
    AddFieldModal,
    NewResumeModal,
    MobileMenuModal,
    AIGenerateModal,
    ResumeSaveToCloudModal,
    ResumeImportFromCloudModal,
  };
});

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
    linkedin: '',
    github: '',
    website: '',
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
    contentLength: 'thorough',
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
    onCreateBlank: jest.fn(),
    slotsUsed: 0,
    maxSlots: 5,
    onResumeApplied: jest.fn(),
    onApplyStart: jest.fn(),
    onApplySuccess: jest.fn(),
    onApplyError: jest.fn(),
    onApplyComplete: jest.fn(),
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

  const asyncRender = async (ui: React.ReactElement) => {
    let view: ReturnType<typeof render> | undefined;
    await act(async () => {
      view = render(ui);
    });
    return view!;
  };

  it('renders nothing when all modals are hidden', async () => {
    await asyncRender(<DashboardModals {...defaultProps} />);
    expect(screen.queryByTestId('export-modal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('import-modal')).not.toBeInTheDocument();
  });

  it('renders ExportModal when showExportModal is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showExportModal={true} />);
    expect(await screen.findByTestId('export-modal')).toBeInTheDocument();
    expect(screen.getByText('resume.pdf')).toBeInTheDocument();
  });

  it('renders ImportModal when showImportModal is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showImportModal={true} />);
    expect(await screen.findByTestId('import-modal')).toBeInTheDocument();
  });

  it('renders AddSectionModal when showAddSectionModal is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showAddSectionModal={true} />);
    expect(await screen.findByTestId('add-section-modal')).toBeInTheDocument();
  });

  it('renders AddFieldModal when showAddFieldModal is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showAddFieldModal={true} />);
    expect(await screen.findByTestId('add-field-modal')).toBeInTheDocument();
  });

  it('renders NewResumeModal when showNewResumeModal is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showNewResumeModal={true} />);
    expect(await screen.findByTestId('new-resume-modal')).toBeInTheDocument();
  });

  it('renders MobileMenuModal when showMobileMenu is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showMobileMenu={true} />);
    expect(await screen.findByTestId('mobile-menu-modal')).toBeInTheDocument();
  });

  it('renders AIGenerateModal when showAIGenerateModal is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showAIGenerateModal={true} />);
    expect(await screen.findByTestId('ai-generate-modal')).toBeInTheDocument();
  });

  it('renders ResumeSaveToCloudModal when showSaveToCloudModal is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showSaveToCloudModal={true} />);
    expect(await screen.findByTestId('save-to-cloud-modal')).toBeInTheDocument();
  });

  it('renders ResumeImportFromCloudModal when showImportFromCloudModal is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showImportFromCloudModal={true} />);
    expect(await screen.findByTestId('import-from-cloud-modal')).toBeInTheDocument();
  });

  it('renders CoverLetterAnalytics when showCoverLetterAnalytics is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showCoverLetterAnalytics={true} />);
    expect(await screen.findByTestId('cover-letter-analytics')).toBeInTheDocument();
  });

  it('renders EmailAnalytics when showEmailAnalytics is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showEmailAnalytics={true} />);
    expect(await screen.findByTestId('email-analytics')).toBeInTheDocument();
  });

  it('renders ApplicationAnalytics when showApplicationAnalytics is true', async () => {
    await asyncRender(<DashboardModals {...defaultProps} showApplicationAnalytics={true} />);
    expect(await screen.findByTestId('application-analytics')).toBeInTheDocument();
  });

  it('can render multiple modals simultaneously', async () => {
    await asyncRender(
      <DashboardModals
        {...defaultProps}
        showExportModal={true}
        showImportModal={true}
      />
    );
    
    expect(await screen.findByTestId('export-modal')).toBeInTheDocument();
    expect(await screen.findByTestId('import-modal')).toBeInTheDocument();
  });
});

