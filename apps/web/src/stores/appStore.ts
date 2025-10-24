import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

interface ResumeData {
  id: string;
  title: string;
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    year: string;
  }>;
  skills: string[];
  customSections: Array<{
    id: string;
    title: string;
    content: string;
  }>;
}

interface AIState {
  mode: 'assistant' | 'moderator' | 'analyzer';
  isAnalyzing: boolean;
  selectedModel: string;
  conversation: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  recommendations: string[];
}

interface UIState {
  activeTab: string;
  sidebarCollapsed: boolean;
  showRightPanel: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: Date;
    read: boolean;
  }>;
}

interface AppStore {
  // User state
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Resume state
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData) => void;
  updateResumeSection: (section: keyof ResumeData, data: any) => void;
  
  // AI state
  aiState: AIState;
  setAiMode: (mode: AIState['mode']) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  setSelectedModel: (model: string) => void;
  addAIMessage: (role: 'user' | 'assistant', content: string) => void;
  setRecommendations: (recommendations: string[]) => void;
  
  // UI state
  uiState: UIState;
  setActiveTab: (tab: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setShowRightPanel: (show: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Actions
  resetStore: () => void;
}

const defaultResumeData: ResumeData = {
  id: 'default',
  title: 'My Resume',
  summary: '',
  experience: [],
  education: [],
  skills: [],
  customSections: []
};

const defaultAIState: AIState = {
  mode: 'assistant',
  isAnalyzing: false,
  selectedModel: 'gpt-5',
  conversation: [],
  recommendations: []
};

const defaultUIState: UIState = {
  activeTab: 'home',
  sidebarCollapsed: false,
  showRightPanel: false,
  theme: 'light',
  notifications: []
};

export const useAppStore = create<AppStore>()(
  devtools(
    persist(
      (set, get) => ({
        // User state
        user: null,
        setUser: (user) => set({ user }),
        
        // Resume state
        resumeData: defaultResumeData,
        setResumeData: (data) => set({ resumeData: data }),
        updateResumeSection: (section, data) => set((state) => ({
          resumeData: state.resumeData ? {
            ...state.resumeData,
            [section]: data
          } : null
        })),
        
        // AI state
        aiState: defaultAIState,
        setAiMode: (mode) => set((state) => ({
          aiState: { ...state.aiState, mode }
        })),
        setIsAnalyzing: (analyzing) => set((state) => ({
          aiState: { ...state.aiState, isAnalyzing: analyzing }
        })),
        setSelectedModel: (model) => set((state) => ({
          aiState: { ...state.aiState, selectedModel: model }
        })),
        addAIMessage: (role, content) => set((state) => ({
          aiState: {
            ...state.aiState,
            conversation: [
              ...state.aiState.conversation,
              {
                id: Date.now().toString(),
                role,
                content,
                timestamp: new Date()
              }
            ]
          }
        })),
        setRecommendations: (recommendations) => set((state) => ({
          aiState: { ...state.aiState, recommendations }
        })),
        
        // UI state
        uiState: defaultUIState,
        setActiveTab: (tab) => set((state) => ({
          uiState: { ...state.uiState, activeTab: tab }
        })),
        setSidebarCollapsed: (collapsed) => set((state) => ({
          uiState: { ...state.uiState, sidebarCollapsed: collapsed }
        })),
        setShowRightPanel: (show) => set((state) => ({
          uiState: { ...state.uiState, showRightPanel: show }
        })),
        setTheme: (theme) => set((state) => ({
          uiState: { ...state.uiState, theme }
        })),
        addNotification: (notification) => set((state) => ({
          uiState: {
            ...state.uiState,
            notifications: [
              ...state.uiState.notifications,
              {
                ...notification,
                id: Date.now().toString(),
                timestamp: new Date()
              }
            ]
          }
        })),
        markNotificationRead: (id) => set((state) => ({
          uiState: {
            ...state.uiState,
            notifications: state.uiState.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            )
          }
        })),
        clearNotifications: () => set((state) => ({
          uiState: { ...state.uiState, notifications: [] }
        })),
        
        // Actions
        resetStore: () => set({
          user: null,
          resumeData: defaultResumeData,
          aiState: defaultAIState,
          uiState: defaultUIState
        })
      }),
      {
        name: 'roleready-store',
        partialize: (state) => ({
          user: state.user,
          resumeData: state.resumeData,
          uiState: {
            theme: state.uiState.theme,
            sidebarCollapsed: state.uiState.sidebarCollapsed
          }
        })
      }
    ),
    { name: 'RoleReady Store' }
  )
);

// Selectors for better performance
export const useUser = () => useAppStore((state) => state.user);
export const useResumeData = () => useAppStore((state) => state.resumeData);
export const useAIState = () => useAppStore((state) => state.aiState);
export const useUIState = () => useAppStore((state) => state.uiState);

// Action selectors
export const useAppActions = () => useAppStore((state) => ({
  setUser: state.setUser,
  setResumeData: state.setResumeData,
  updateResumeSection: state.updateResumeSection,
  setAiMode: state.setAiMode,
  setIsAnalyzing: state.setIsAnalyzing,
  setSelectedModel: state.setSelectedModel,
  addAIMessage: state.addAIMessage,
  setRecommendations: state.setRecommendations,
  setActiveTab: state.setActiveTab,
  setSidebarCollapsed: state.setSidebarCollapsed,
  setShowRightPanel: state.setShowRightPanel,
  setTheme: state.setTheme,
  addNotification: state.addNotification,
  markNotificationRead: state.markNotificationRead,
  clearNotifications: state.clearNotifications,
  resetStore: state.resetStore
}));
