/**
 * Tests for useDashboardHandlers hook
 */

import { renderHook, act } from '@testing-library/react';
import { useDashboardHandlers } from '../useDashboardHandlers';
import { resumeHelpers } from '../../../../utils/resumeHelpers';
import { aiHelpers } from '../../../../utils/aiHelpers';
import { createCustomField } from '../../utils/dashboardHandlers';
import { logger } from '../../../../utils/logger';

// Mock dependencies
jest.mock('../../../../utils/resumeHelpers');
jest.mock('../../../../utils/aiHelpers');
jest.mock('../../utils/dashboardHandlers');
jest.mock('../../../../utils/logger');
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
    contentLength: 'medium',
    setContentLength: jest.fn(),
    setShowAIGenerateModal: jest.fn(),
    jobDescription: 'test job',
    setIsAnalyzing: jest.fn(),
    setMatchScore: jest.fn(),
    setMatchedKeywords: jest.fn(),
    setMissingKeywords: jest.fn(),
    setAiRecommendations: jest.fn(),
    aiRecommendations: [],
    aiConversation: [],
    setAiConversation: jest.fn(),
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
    expect(result.current).toHaveProperty('sendAIMessage');
    expect(result.current).toHaveProperty('saveResume');
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

  it('should call aiHelpers functions for AI operations', () => {
    const { result } = renderHook(() => useDashboardHandlers(mockParams));
    
    act(() => {
      result.current.openAIGenerateModal('summary');
    });
    
    expect(aiHelpers.openAIGenerateModal).toHaveBeenCalled();
    
    act(() => {
      result.current.analyzeJobDescription();
    });
    
    expect(aiHelpers.analyzeJobDescription).toHaveBeenCalled();
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

