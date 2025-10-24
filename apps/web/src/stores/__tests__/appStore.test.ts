import { renderHook, act } from '@testing-library/react';
import { useAppStore } from '../appStore';

// Mock the persist middleware
jest.mock('zustand/middleware', () => ({
  persist: (fn: any) => fn,
  devtools: (fn: any) => fn
}));

describe('AppStore', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useAppStore());
    
    expect(result.current.user).toBe(null);
    expect(result.current.resumeData).toEqual({
      id: 'default',
      title: 'My Resume',
      summary: '',
      experience: [],
      education: [],
      skills: [],
      customSections: []
    });
    expect(result.current.aiState.mode).toBe('assistant');
    expect(result.current.aiState.isAnalyzing).toBe(false);
    expect(result.current.aiState.selectedModel).toBe('gpt-5');
    expect(result.current.uiState.activeTab).toBe('home');
    expect(result.current.uiState.sidebarCollapsed).toBe(false);
    expect(result.current.uiState.showRightPanel).toBe(false);
    expect(result.current.uiState.theme).toBe('light');
    expect(result.current.uiState.notifications).toEqual([]);
  });

  it('should set user', () => {
    const { result } = renderHook(() => useAppStore());
    const user = { 
      id: '1', 
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      avatar: 'avatar.jpg'
    };
    
    act(() => {
      result.current.setUser(user);
    });
    
    expect(result.current.user).toEqual(user);
  });

  it('should set resume data', () => {
    const { result } = renderHook(() => useAppStore());
    const resumeData = { 
      id: '1', 
      title: 'Test Resume', 
      summary: 'Test summary',
      experience: [],
      education: [],
      skills: [],
      customSections: []
    };
    
    act(() => {
      result.current.setResumeData(resumeData);
    });
    
    expect(result.current.resumeData).toEqual(resumeData);
  });

  it('should update resume section', () => {
    const { result } = renderHook(() => useAppStore());
    const resumeData = { 
      id: '1', 
      title: 'Test Resume', 
      summary: 'Test summary',
      experience: [],
      education: [],
      skills: ['JavaScript', 'React'],
      customSections: []
    };
    
    act(() => {
      result.current.setResumeData(resumeData);
    });
    
    expect(result.current.resumeData?.skills).toEqual(['JavaScript', 'React']);
  });

  it('should set AI mode', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setAiMode('analyzer');
    });
    
    expect(result.current.aiState.mode).toBe('analyzer');
  });

  it('should set analyzing state', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setIsAnalyzing(true);
    });
    
    expect(result.current.aiState.isAnalyzing).toBe(true);
  });

  it('should set selected model', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setSelectedModel('sonnet-4.5');
    });
    
    expect(result.current.aiState.selectedModel).toBe('sonnet-4.5');
  });

  it('should add AI message', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.addAIMessage('user', 'Hello AI');
    });
    
    expect(result.current.aiState.conversation).toHaveLength(1);
    expect(result.current.aiState.conversation[0].role).toBe('user');
    expect(result.current.aiState.conversation[0].content).toBe('Hello AI');
  });

  it('should set recommendations', () => {
    const { result } = renderHook(() => useAppStore());
    const recommendations = ['Improve skills section', 'Add more experience'];
    
    act(() => {
      result.current.setRecommendations(recommendations);
    });
    
    expect(result.current.aiState.recommendations).toEqual(recommendations);
  });

  it('should set active tab', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setActiveTab('editor');
    });
    
    expect(result.current.uiState.activeTab).toBe('editor');
  });

  it('should toggle sidebar', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.toggleSidebar();
    });
    
    expect(result.current.uiState.sidebarCollapsed).toBe(true);
  });

  it('should set show right panel', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setShowRightPanel(true);
    });
    
    expect(result.current.uiState.showRightPanel).toBe(true);
  });

  it('should set theme', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setTheme('dark');
    });
    
    expect(result.current.uiState.theme).toBe('dark');
  });

  it('should add notification', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.addNotification({
        type: 'info',
        message: 'Test message',
        timestamp: new Date()
      });
    });
    
    expect(result.current.uiState.notifications).toHaveLength(1);
    expect(result.current.uiState.notifications[0].message).toBe('Test message');
  });

  it('should remove notification', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.addNotification({
        type: 'info',
        message: 'Test message',
        timestamp: new Date()
      });
    });
    
    const notificationId = result.current.uiState.notifications[0].id;
    
    act(() => {
      result.current.removeNotification(notificationId);
    });
    
    expect(result.current.uiState.notifications).toHaveLength(0);
  });

  it('should clear notifications', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.addNotification({
        type: 'info',
        message: 'Test message',
        timestamp: new Date()
      });
    });
    
    act(() => {
      result.current.clearNotifications();
    });
    
    expect(result.current.uiState.notifications).toHaveLength(0);
  });

  it('should reset store', () => {
    const { result } = renderHook(() => useAppStore());
    
    act(() => {
      result.current.setUser({ 
        id: '1', 
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        avatar: 'avatar.jpg'
      });
      result.current.setActiveTab('editor');
    });
    
    act(() => {
      result.current.resetStore();
    });
    
    expect(result.current.user).toBe(null);
    expect(result.current.uiState.activeTab).toBe('home');
  });
});