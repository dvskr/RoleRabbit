import { useState, useEffect } from 'react';
import type { Message, PortfolioSection, TabType, Step, DeviceView, DesignStyle, QuickActionType } from '../types/aiPortfolioBuilder';
import { DEFAULT_SECTIONS, WELCOME_MESSAGE, DEFAULT_AI_RESPONSE } from '../constants/aiPortfolioBuilder';
import { generateTimestamp } from '../utils/aiPortfolioBuilderHelpers';

interface UseAIPortfolioBuilderOptions {
  profileData?: any;
}

export const useAIPortfolioBuilder = (options: UseAIPortfolioBuilderOptions = {}) => {
  const { profileData } = options;

  // UI State
  const [activeTab, setActiveTab] = useState<TabType>('ai-chat');
  const [currentStep, setCurrentStep] = useState<Step>('setup');
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  
  // Style State
  const [designStyle, setDesignStyle] = useState<DesignStyle>('moderate');
  const [themeColor, setThemeColor] = useState<string>('purple');
  const [typography, setTypography] = useState<string>('Inter');
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Sections State
  const [sections, setSections] = useState<PortfolioSection[]>(DEFAULT_SECTIONS);

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: WELCOME_MESSAGE,
      timestamp: generateTimestamp()
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: generateTimestamp()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: DEFAULT_AI_RESPONSE,
        timestamp: generateTimestamp()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleQuickAction = (action: QuickActionType) => {
    if (action === 'upload-resume') {
      // Create file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.doc,.docx,.txt';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            const message: Message = {
              role: 'user',
              content: `I've uploaded my resume: ${file.name}`,
              timestamp: generateTimestamp()
            };
            setMessages(prev => [...prev, message]);
            
            // Simulate AI processing
            setTimeout(() => {
              const aiResponse: Message = {
                role: 'assistant',
                content: `Great! I've analyzed your resume. I can extract your experience, skills, and projects. Would you like me to automatically populate your portfolio with this information?`,
                timestamp: generateTimestamp()
              };
              setMessages(prev => [...prev, aiResponse]);
            }, 1500);
          };
          reader.readAsText(file);
        }
      };
      input.click();
    } else if (action === 'use-profile') {
      if (profileData) {
        const message: Message = {
          role: 'user',
          content: "Use my RoleReady profile data",
          timestamp: generateTimestamp()
        };
        setMessages(prev => [...prev, message]);
        
        setTimeout(() => {
          const aiResponse: Message = {
            role: 'assistant',
            content: `Perfect! I've loaded your profile data. I can see your ${profileData.currentRole || 'professional information'}. Let's customize your portfolio!`,
            timestamp: generateTimestamp()
          };
          setMessages(prev => [...prev, aiResponse]);
        }, 1000);
      } else {
        // Try to load from localStorage
        try {
          const saved = localStorage.getItem('userProfile');
          if (saved) {
            const profile = JSON.parse(saved);
            const message: Message = {
              role: 'user',
              content: "Use my RoleReady profile data",
              timestamp: generateTimestamp()
            };
            setMessages(prev => [...prev, message]);
            
            setTimeout(() => {
              const aiResponse: Message = {
                role: 'assistant',
                content: `Perfect! I've loaded your profile data. Let's customize your portfolio!`,
                timestamp: generateTimestamp()
              };
              setMessages(prev => [...prev, aiResponse]);
            }, 1000);
          }
        } catch (e) {
          // Profile not found
          const message: Message = {
            role: 'user',
            content: "Use my RoleReady profile data",
            timestamp: generateTimestamp()
          };
          setMessages(prev => [...prev, message]);
          
          setTimeout(() => {
            const aiResponse: Message = {
              role: 'assistant',
              content: `I couldn't find your profile data. You can still create a portfolio from scratch or upload a resume!`,
              timestamp: generateTimestamp()
            };
            setMessages(prev => [...prev, aiResponse]);
          }, 1000);
        }
      }
    } else {
      const message = "Let's start from scratch";
      setInputMessage(message);
      setTimeout(() => handleSendMessage(), 100);
    }
  };

  const toggleSectionVisibility = (id: string) => {
    setSections(prev => prev.map(section => 
      section.id === id ? { ...section, visible: !section.visible } : section
    ));
  };

  const deleteSection = (id: string) => {
    setSections(prev => prev.filter(section => section.id !== id && section.required));
  };

  const addSection = () => {
    const newSection: PortfolioSection = {
      id: `section-${Date.now()}`,
      name: 'New Section',
      visible: true
    };
    setSections(prev => [...prev, newSection]);
  };

  return {
    // UI State
    activeTab,
    setActiveTab,
    currentStep,
    setCurrentStep,
    deviceView,
    setDeviceView,
    
    // Style State
    designStyle,
    setDesignStyle,
    themeColor,
    setThemeColor,
    typography,
    setTypography,
    
    // Chat State
    messages,
    inputMessage,
    setInputMessage,
    handleSendMessage,
    handleQuickAction,
    
    // Sections State
    sections,
    toggleSectionVisibility,
    deleteSection,
    addSection
  };
};

