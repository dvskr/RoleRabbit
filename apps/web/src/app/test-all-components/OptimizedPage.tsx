'use client';

import React, { Suspense, lazy, memo, useCallback, useMemo } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { AccessibilityProvider } from '../../providers/AccessibilityProvider';
import GlobalErrorBoundary from '../../components/GlobalErrorBoundary';
import { PageLoading } from '../../components/Loading';
import { NetworkStatus } from '../../components/ErrorRecovery';
import { SkipLinks, AccessibilityToolbar } from '../../providers/AccessibilityProvider';
import { MobileLayout } from '../../components/MobileLayout';
import { useAppStore } from '../../stores/appStore';
import { useErrorCapture } from '../../services/errorHandler';

// Lazy load heavy components for better performance
const Sidebar = lazy(() => import('../../components/layout/OptimizedSidebar'));
const Header = lazy(() => import('../../components/layout/OptimizedHeader'));
const ResumeEditor = lazy(() => import('../../components/features/ResumeEditor'));
const AIPanel = lazy(() => import('../../components/features/AIPanel'));
const Home = lazy(() => import('../../components/Home'));
const CloudStorage = lazy(() => import('../../components/CloudStorage'));
const Templates = lazy(() => import('../../components/Templates'));
const JobTracker = lazy(() => import('../../components/JobTracker'));
const Discussion = lazy(() => import('../../components/Discussion'));
const Email = lazy(() => import('../../components/Email'));
const CoverLetterGenerator = lazy(() => import('../../components/CoverLetterGenerator'));
const Profile = lazy(() => import('../../components/Profile'));

// Helper function to provide default props for ResumeEditor
const getResumeEditorProps = () => ({
  resumeFileName: 'My Resume',
  setResumeFileName: () => {},
  sectionOrder: ['summary', 'experience', 'education', 'skills'],
  sectionVisibility: { summary: true, experience: true, education: true, skills: true },
  customSections: [],
  resumeData: {
    id: 'default',
    title: 'My Resume',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    customSections: []
  },
  setResumeData: () => {},
  fontFamily: 'Inter',
  setFontFamily: () => {},
  fontSize: '14px',
  setFontSize: () => {},
  lineSpacing: '1.5',
  setLineSpacing: () => {},
  sectionSpacing: '20px',
  setSectionSpacing: () => {},
  margins: '1in',
  setMargins: () => {},
  headingStyle: 'bold',
  setHeadingStyle: () => {},
  bulletStyle: 'disc',
  setBulletStyle: () => {},
  onToggleSection: () => {},
  onMoveSection: () => {},
  onShowAddSectionModal: () => {},
  onDeleteCustomSection: () => {},
  onUpdateCustomSection: () => {},
  onGenerateSmartFileName: () => 'My Resume',
  onResetToDefault: () => {},
  renderSection: () => null,
  showAddFieldModal: false,
  setShowAddFieldModal: () => {},
  customFields: [],
  setCustomFields: () => {},
  newFieldName: '',
  setNewFieldName: () => {},
  newFieldIcon: '',
  setNewFieldIcon: () => {},
  onAddCustomField: () => {}
});

// Memoized component renderer to prevent unnecessary re-renders
const ComponentRenderer = memo(({ activeTab }: { activeTab: string }) => {
  const components = useMemo(() => ({
    home: Home,
    profile: Profile,
    storage: CloudStorage,
    editor: () => <ResumeEditor {...getResumeEditorProps()} />,
    templates: Templates,
    jobs: JobTracker,
    discussion: Discussion,
    email: Email,
    'cover-letter': CoverLetterGenerator
  }), []);

  const Component = components[activeTab as keyof typeof components] || Home;

  return (
    <Suspense fallback={<PageLoading title="Loading component..." />}>
      <Component />
    </Suspense>
  );
});

ComponentRenderer.displayName = 'ComponentRenderer';

// Main app component with performance optimizations
const OptimizedTestAllComponents = memo(() => {
  const { 
    uiState,
    setActiveTab,
    setSidebarCollapsed,
    setShowRightPanel,
    addNotification
  } = useAppStore();
  
  const { activeTab, sidebarCollapsed, showRightPanel } = uiState;

  const { captureError } = useErrorCapture();

  // Memoized callbacks to prevent unnecessary re-renders
  const handleTabChange = useCallback((tab: string) => {
    try {
      setActiveTab(tab);
      addNotification({
        title: 'Navigation',
        type: 'info',
        message: `Switched to ${tab} tab`,
        read: false
      });
    } catch (error) {
      captureError(error as Error, 'tab-change');
    }
  }, [setActiveTab, addNotification, captureError]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  const handleShowNewResumeModal = useCallback(() => {
    addNotification({
      title: 'New Resume',
      type: 'info',
      message: 'Opening new resume modal...',
      read: false
    });
    // Implement modal logic here
  }, [addNotification]);

  const handleShowImportModal = useCallback(() => {
    addNotification({
      title: 'Import Resume',
      type: 'info',
      message: 'Opening import modal...',
      read: false
    });
    // Implement import logic here
  }, [addNotification]);

  const handleShowSettings = useCallback(() => {
    addNotification({
      title: 'Settings',
      type: 'info',
      message: 'Opening settings...',
      read: false
    });
    // Implement settings logic here
  }, [addNotification]);

  const handleShowProfile = useCallback(() => {
    setActiveTab('profile');
  }, [setActiveTab]);

  const handleShowNotifications = useCallback(() => {
    addNotification({
      title: 'Notifications',
      type: 'info',
      message: 'Opening notifications...',
      read: false
    });
    // Implement notifications logic here
  }, [addNotification]);

  // Memoized layout classes
  const layoutClasses = useMemo(() => ({
    container: 'flex h-screen bg-gray-50',
    sidebar: sidebarCollapsed ? 'w-16' : 'w-72',
    main: 'flex-1 flex flex-col',
    content: 'flex-1 flex',
    leftPanel: 'flex-1',
    rightPanel: showRightPanel ? 'w-96 border-l border-gray-200 bg-white' : 'w-0'
  }), [sidebarCollapsed, showRightPanel]);

  return (
    <MobileLayout>
      <div className={layoutClasses.container}>
        {/* Skip Links */}
        <SkipLinks />
        
        {/* Network Status Indicator */}
        <NetworkStatus />
        
        {/* Accessibility Toolbar */}
        <AccessibilityToolbar />
        
        {/* Sidebar */}
        <Suspense fallback={<div className="w-72 bg-gray-100 animate-pulse" />}>
          <GlobalErrorBoundary level="component">
            <nav id="navigation" aria-label="Main navigation">
              <Sidebar
                onTabChange={handleTabChange}
                onShowNewResumeModal={handleShowNewResumeModal}
                onShowImportModal={handleShowImportModal}
              />
            </nav>
          </GlobalErrorBoundary>
        </Suspense>

        {/* Main Content */}
        <div className={layoutClasses.main}>
          {/* Header */}
          <Suspense fallback={<div className="h-16 bg-gray-100 animate-pulse" />}>
            <GlobalErrorBoundary level="component">
              <Header
                onToggleSidebar={handleToggleSidebar}
                onShowSettings={handleShowSettings}
                onShowProfile={handleShowProfile}
                onShowNotifications={handleShowNotifications}
              />
            </GlobalErrorBoundary>
          </Suspense>

          {/* Content Area */}
          <div className={layoutClasses.content}>
            {/* Left Panel */}
            <main id="main-content" className={layoutClasses.leftPanel} role="main">
              <GlobalErrorBoundary level="feature">
                <ComponentRenderer activeTab={activeTab} />
              </GlobalErrorBoundary>
            </main>

            {/* Right Panel (AI Panel) */}
            {showRightPanel && (
              <aside id="ai-panel" className={layoutClasses.rightPanel} aria-label="AI Assistant Panel">
                <Suspense fallback={<PageLoading title="Loading AI Panel..." />}>
                  <GlobalErrorBoundary level="component">
                    <AIPanel 
                      showRightPanel={showRightPanel}
                      setShowRightPanel={setShowRightPanel}
                      aiMode="assistant"
                      setAiMode={() => {}}
                      jobDescription=""
                      setJobDescription={() => {}}
                      isAnalyzing={false}
                      matchScore={0}
                      showATSScore={false}
                      setShowATSScore={() => {}}
                      matchedKeywords={[]}
                      missingKeywords={[]}
                      aiRecommendations={null}
                      setAiRecommendations={() => {}}
                      tailorEditMode="enhance"
                      setTailorEditMode={() => {}}
                      selectedTone="professional"
                      setSelectedTone={() => {}}
                      selectedLength="medium"
                      setSelectedLength={() => {}}
                      aiConversation={[]}
                      aiPrompt=""
                      setAiPrompt={() => {}}
                      selectedModel="gpt-5"
                      setSelectedModel={() => {}}
                      isMobile={false}
                      onAnalyzeJobDescription={() => {}}
                      onApplyAIRecommendations={() => {}}
                      onSendAIMessage={() => {}}
                    />
                  </GlobalErrorBoundary>
                </Suspense>
              </aside>
            )}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
});

OptimizedTestAllComponents.displayName = 'OptimizedTestAllComponents';

// Main export with providers
export default function TestAllComponents() {
  return (
    <GlobalErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
      <AccessibilityProvider>
        <QueryProvider>
          <OptimizedTestAllComponents />
        </QueryProvider>
      </AccessibilityProvider>
    </GlobalErrorBoundary>
  );
}
