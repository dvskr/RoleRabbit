/**
 * Tests for useDashboardHandlers hook
 */

import { renderHook, act } from '@testing-library/react';
import { useDashboardHandlers } from '../useDashboardHandlers';
import { resumeHelpers } from '../../../../utils/resumeHelpers';
import { aiHelpers } from '../../../../utils/aiHelpers';
import { createCustomField } from '../../utils/dashboardHandlers';
import { logger } from '../../../../utils/logger';
import apiService from '../../../../services/apiService';

// Mock dependencies
jest.mock('../../../../utils/resumeHelpers');
jest.mock('../../../../utils/aiHelpers');
jest.mock('../../utils/dashboardHandlers');
jest.mock('../../../../utils/logger');
jest.mock('../../../../services/apiService', () => ({
  __esModule: true,
  default: {
    runATSCheck: jest.fn(() => Promise.resolve({
      analysis: {
        overall: 72,
        keywords: 65,
        content: 70,
        experience: 68,
        format: 80,
        strengths: ['Good keyword coverage'],
        improvements: ['Add metrics to recent role'],
        matchedKeywords: ['react', 'typescript'],
        missingKeywords: ['graphql']
      },
      matchedKeywords: ['react', 'typescript'],
      missingKeywords: ['graphql'],
      improvements: ['Add metrics to recent role']
    })),
    applyAIRecommendations: jest.fn(() => Promise.resolve({
      updatedResume: { id: 'resume-1', data: {}, metadata: {}, updatedAt: new Date().toISOString() },
      ats: { after: { overall: 82 } },
      appliedRecommendations: ['Added metrics to summary']
    })),
    tailorResume: jest.fn(() => Promise.resolve({
      tailoredResume: {},
      diff: [],
      warnings: [],
      recommendedKeywords: ['leadership'],
      ats: { after: { overall: 88 } },
      confidence: 0.82
    })),
    generateCoverLetter: jest.fn(() => Promise.resolve({
      content: {
        subject: 'Application for Frontend Role',
        greeting: 'Dear Hiring Manager,',
        bodyParagraphs: ['I am excited to apply...'],
        closing: 'Sincerely,',
        signature: 'Test User'
      }
    })),
    generatePortfolio: jest.fn(() => Promise.resolve({
      content: {
        headline: 'Building delightful products',
        tagline: 'Frontend engineer crafting user-focused experiences',
        about: 'Detailed about section',
        highlights: ['Delivered 5+ enterprise apps'],
        selectedProjects: []
      }
    })),
    updateBaseResume: jest.fn(() => Promise.resolve({
      success: true,
      resume: {
        id: 'resume-1',
        name: 'test-resume',
        updatedAt: new Date().toISOString()
      }
    })),
    createBaseResume: jest.fn(() => Promise.resolve({
      success: true,
      resume: {
        id: 'resume-1',
        name: 'test-resume',
        updatedAt: new Date().toISOString()
      }
    }))
  }
}));
jest.mock('../../utils/resumeDataHelpers', () => ({
  removeDuplicateResumeEntries: jest.fn(() => ({ data: {}, removedCount: 0 })),
  duplicateResumeState: jest.fn(() => ({
    resumeFileName: 'test-copy',
    resumeData: {},
    customSections: [],
    sectionOrder: [],
    sectionVisibility: {},
  })),
}));

describe('useDashboardHandlers', () => {
  const mockParams = {
    // Resume data
    resumeData: {
      name: 'Test User',
      title: 'Developer',
      email: '',
      phone: '',
      location: '',
      summary: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: [],
    },
    setResumeData: jest.fn(),
    sectionOrder: ['summary', 'skills'],
    setSectionOrder: jest.fn(),
    sectionVisibility: { summary: true, skills: false },
    setSectionVisibility: jest.fn(),
    customSections: [],
    setCustomSections: jest.fn(),
    resumeFileName: 'test-resume',
    setResumeFileName: jest.fn(),
    currentResumeId: 'resume-1',
    setCurrentResumeId: jest.fn(),
    hasChanges: false,
    setHasChanges: jest.fn(),
    isSaving: false,
    setIsSaving: jest.fn(),
    setSaveError: jest.fn(),
    lastSavedAt: null,
    setLastSavedAt: jest.fn(),
    lastServerUpdatedAt: null,
    setLastServerUpdatedAt: jest.fn(),
    selectedTemplateId: null,
    history: [],
    setHistory: jest.fn(),
    historyIndex: 0,
    setHistoryIndex: jest.fn(),
    
    // Formatting
    fontFamily: 'arial',
    setFontFamily: jest.fn(),
    fontSize: '12pt',
    setFontSize: jest.fn(),
    lineSpacing: '1.5',
    setLineSpacing: jest.fn(),
    sectionSpacing: 'normal',
    setSectionSpacing: jest.fn(),
    margins: 'medium',
    setMargins: jest.fn(),
    headingStyle: 'bold',
    setHeadingStyle: jest.fn(),
    bulletStyle: 'disc',
    setBulletStyle: jest.fn(),
    
    // Modal states
    newSectionName: 'New Section',
    setNewSectionName: jest.fn(),
    newSectionContent: 'Content',
    setNewSectionContent: jest.fn(),
    setShowAddSectionModal: jest.fn(),
    newFieldName: 'New Field',
    setNewFieldName: jest.fn(),
    newFieldIcon: 'link',
    setNewFieldIcon: jest.fn(),
    customFields: [],
    setCustomFields: jest.fn(),
    setShowAddFieldModal: jest.fn(),
    
    // AI states
    aiGenerateSection: 'summary',
    setAiGenerateSection: jest.fn(),
    aiPrompt: 'test prompt',
    setAiPrompt: jest.fn(),
    writingTone: 'professional',
    setWritingTone: jest.fn(),
    contentLength: 'thorough',
    setContentLength: jest.fn(),
    setShowAIGenerateModal: jest.fn(),
    jobDescription: 'We are looking for a React and TypeScript developer to build scalable features.',
    setIsAnalyzing: jest.fn(),
    setMatchScore: jest.fn(),
    setMatchedKeywords: jest.fn(),
    setMissingKeywords: jest.fn(),
    setAiRecommendations: jest.fn(),
    aiRecommendations: [],
    isAnalyzing: false,
    setShowATSScore: jest.fn(),
    applyBaseResume: jest.fn(),
    tailorEditMode: 'partial',
    selectedTone: 'professional',
    selectedLength: 'thorough',
    tailorResult: null,
    setTailorResult: jest.fn(),
    setIsTailoring: jest.fn(),
    setCoverLetterDraft: jest.fn(),
    setIsGeneratingCoverLetter: jest.fn(),
    setPortfolioDraft: jest.fn(),
    setIsGeneratingPortfolio: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with all handlers', () => {
    const { result } = renderHook(() => useDashboardHandlers(mockParams));
    
    expect(result.current).toHaveProperty('toggleSection');
    expect(result.current).toHaveProperty('moveSection');
    expect(result.current).toHaveProperty('generateSmartFileName');
    expect(result.current).toHaveProperty('resetToDefault');
    expect(result.current).toHaveProperty('addCustomSection');
    expect(result.current).toHaveProperty('deleteCustomSection');
    expect(result.current).toHaveProperty('updateCustomSection');
    expect(result.current).toHaveProperty('addCustomField');
    expect(result.current).toHaveProperty('handleDuplicateResume');
    expect(result.current).toHaveProperty('handleRemoveDuplicates');
    expect(result.current).toHaveProperty('openAIGenerateModal');
    expect(result.current).toHaveProperty('hideSection');
    expect(result.current).toHaveProperty('analyzeJobDescription');
    expect(result.current).toHaveProperty('applyAIRecommendations');
    expect(result.current).toHaveProperty('tailorResumeForJob');
    expect(result.current).toHaveProperty('generateCoverLetterDraft');
    expect(result.current).toHaveProperty('generatePortfolioDraft');
    expect(result.current).toHaveProperty('saveResume');
    expect(result.current).toHaveProperty('confirmTailorResult');
    expect(result.current).toHaveProperty('undo');
    expect(result.current).toHaveProperty('redo');
  });

  it('should call resumeHelpers functions when handlers are invoked', () => {
    const { result } = renderHook(() => useDashboardHandlers(mockParams));
    
    act(() => {
      result.current.toggleSection('summary');
    });
    
    expect(resumeHelpers.toggleSection).toHaveBeenCalled();
    
    act(() => {
      result.current.generateSmartFileName();
    });
    
    expect(resumeHelpers.generateSmartFileName).toHaveBeenCalled();
  });

  it('should call AI services for AI operations', async () => {
    const { result } = renderHook(() => useDashboardHandlers(mockParams));

    act(() => {
      result.current.openAIGenerateModal('summary');
    });

    expect(aiHelpers.openAIGenerateModal).toHaveBeenCalled();

    await act(async () => {
      await result.current.analyzeJobDescription();
    });

    expect(apiService.runATSCheck).toHaveBeenCalled();

    await act(async () => {
      await result.current.applyAIRecommendations();
    });

    expect(apiService.applyAIRecommendations).toHaveBeenCalled();

    await act(async () => {
      await result.current.tailorResumeForJob();
    });

    expect(apiService.tailorResume).toHaveBeenCalled();

    await act(async () => {
      await result.current.generateCoverLetterDraft();
    });

    expect(apiService.generateCoverLetter).toHaveBeenCalled();

    await act(async () => {
      await result.current.generatePortfolioDraft();
    });

    expect(apiService.generatePortfolio).toHaveBeenCalled();
  });

  it('should call createCustomField when adding a field', () => {
    (createCustomField as jest.Mock).mockReturnValue({ id: 'field-1', name: 'New Field' });
    
    const { result } = renderHook(() => useDashboardHandlers(mockParams));
    
    act(() => {
      result.current.addCustomField();
    });
    
    expect(createCustomField).toHaveBeenCalledWith('New Field');
    expect(mockParams.setCustomFields).toHaveBeenCalled();
  });

});

