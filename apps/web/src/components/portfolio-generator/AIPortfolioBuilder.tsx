'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Eye, 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink,
  Upload,
  User,
  Sparkles,
  Send,
  GripVertical,
  X,
  Settings,
  EyeOff,
  Plus,
  Check,
  Bot,
  User as UserIcon
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../ThemeToggle';

interface PortfolioSection {
  id: string;
  name: string;
  visible: boolean;
  required?: boolean;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

type TabType = 'ai-chat' | 'style' | 'sections';
type DeviceView = 'desktop' | 'tablet' | 'mobile';
type DesignStyle = 'clean' | 'moderate' | 'creative';
type Step = 'setup' | 'generate' | 'edit' | 'deploy';

interface AIPortfolioBuilderProps {
  onClose?: () => void;
  profileData?: any;
}

export default function AIPortfolioBuilder({ onClose, profileData }: AIPortfolioBuilderProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  
  const [activeTab, setActiveTab] = useState<TabType>('ai-chat');
  const [currentStep, setCurrentStep] = useState<Step>('setup');
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  const [designStyle, setDesignStyle] = useState<DesignStyle>('moderate');
  const [themeColor, setThemeColor] = useState<string>('purple');
  const [typography, setTypography] = useState<string>('Inter');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sections, setSections] = useState<PortfolioSection[]>([
    { id: 'hero', name: 'Hero', visible: true, required: true },
    { id: 'about', name: 'About', visible: true, required: true },
    { id: 'skills', name: 'Skills', visible: true, required: true },
    { id: 'projects', name: 'Projects', visible: true },
    { id: 'experience', name: 'Experience', visible: true },
    { id: 'testimonials', name: 'Testimonials', visible: true },
    { id: 'blog', name: 'Blog', visible: true },
    { id: 'contact', name: 'Contact', visible: true },
  ]);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: Message = {
      role: 'assistant',
      content: "Hi! I'm your AI portfolio builder. I can help you create a stunning personal website in minutes. Would you like to import your resume, use your RoleReady profile, or describe what you want?",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    };
    setMessages([welcomeMessage]);
  }, []);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: "Got it! I'll help you with that. Let me update your portfolio accordingly.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleQuickAction = (action: 'upload-resume' | 'use-profile' | 'start-scratch') => {
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
            const content = event.target?.result as string;
            const message: Message = {
              role: 'user',
              content: `I've uploaded my resume: ${file.name}`,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
            };
            setMessages(prev => [...prev, message]);
            
            // Simulate AI processing
            setTimeout(() => {
              const aiResponse: Message = {
                role: 'assistant',
                content: `Great! I've analyzed your resume. I can extract your experience, skills, and projects. Would you like me to automatically populate your portfolio with this information?`,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
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
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
        };
        setMessages(prev => [...prev, message]);
        
        setTimeout(() => {
          const aiResponse: Message = {
            role: 'assistant',
            content: `Perfect! I've loaded your profile data. I can see your ${profileData.currentRole || 'professional information'}. Let's customize your portfolio!`,
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
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
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
            };
            setMessages(prev => [...prev, message]);
            
            setTimeout(() => {
              const aiResponse: Message = {
                role: 'assistant',
                content: `Perfect! I've loaded your profile data. Let's customize your portfolio!`,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
              };
              setMessages(prev => [...prev, aiResponse]);
            }, 1000);
          }
        } catch (e) {
          // Profile not found
          const message: Message = {
            role: 'user',
            content: "Use my RoleReady profile data",
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
          };
          setMessages(prev => [...prev, message]);
          
          setTimeout(() => {
            const aiResponse: Message = {
              role: 'assistant',
              content: `I couldn't find your profile data. You can still create a portfolio from scratch or upload a resume!`,
              timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
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

  const steps: { id: Step; label: string }[] = [
    { id: 'setup', label: '1 Setup' },
    { id: 'generate', label: '2 Generate' },
    { id: 'edit', label: '3 Edit' },
    { id: 'deploy', label: '4 Deploy' },
  ];

  const themeColors = [
    { name: 'Purple', value: 'purple', color: '#a855f7' },
    { name: 'Blue', value: 'blue', color: '#3b82f6' },
    { name: 'Green', value: 'green', color: '#10b981' },
    { name: 'Pink', value: 'pink', color: '#ec4899' },
    { name: 'Orange', value: 'orange', color: '#f97316' },
    { name: 'Teal', value: 'teal', color: '#14b8a6' },
    { name: 'Indigo', value: 'indigo', color: '#6366f1' },
    { name: 'Red', value: 'red', color: '#ef4444' },
  ];

  const fonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins'];

  return (
    <div className="h-full flex flex-col" style={{ background: colors.background }}>
      {/* Header with Progress Steps */}
      <div 
        className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
        style={{
          background: colors.headerBackground,
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{
              background: `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`,
            }}
          >
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 
              className="text-lg font-semibold"
              style={{ color: colors.primaryText }}
            >
              AI Portfolio Builder
            </h1>
            <p 
              className="text-xs"
              style={{ color: colors.secondaryText }}
            >
              Create your personal website in minutes
            </p>
          </div>
        </div>

        {/* Progress Steps and Theme Toggle */}
        <div className="flex items-center gap-4">
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => {
                    const stepIndex = steps.findIndex(s => s.id === currentStep);
                    if (index <= stepIndex) {
                      setCurrentStep(step.id);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    step.id === currentStep
                      ? 'text-white shadow-md'
                      : index < steps.findIndex(s => s.id === currentStep)
                      ? 'opacity-60'
                      : 'opacity-40'
                  }`}
                  style={{
                    background: step.id === currentStep
                      ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`
                      : 'transparent',
                    color: step.id === currentStep ? 'white' : colors.secondaryText,
                  }}
                >
                  {step.label}
                </button>
                {index < steps.length - 1 && (
                  <div 
                    className="w-8 h-0.5"
                    style={{ background: colors.border }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Theme Toggle - Properly Aligned */}
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content Area - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Configuration */}
        <div 
          className="w-96 border-r overflow-y-auto"
          style={{
            background: colors.cardBackground,
            borderRight: `1px solid ${colors.border}`,
          }}
        >
          {/* Tabs */}
          <div className="flex border-b" style={{ borderBottom: `1px solid ${colors.border}` }}>
            {(['ai-chat', 'style', 'sections'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                  activeTab === tab
                    ? 'text-white'
                    : ''
                }`}
                style={{
                  background: activeTab === tab
                    ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`
                    : 'transparent',
                  color: activeTab === tab ? 'white' : colors.secondaryText,
                }}
              >
                {tab === 'ai-chat' ? 'AI Chat' : tab === 'style' ? 'Style' : 'Sections'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'ai-chat' && (
              <div className="space-y-4">
                {/* Chat Messages */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      {message.role === 'assistant' ? (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            background: `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`,
                          }}
                        >
                          <Bot size={16} className="text-white" />
                        </div>
                      ) : (
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: colors.inputBackground }}
                        >
                          <UserIcon size={16} style={{ color: colors.secondaryText }} />
                        </div>
                      )}
                      <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                        <div
                          className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${
                            message.role === 'user'
                              ? 'rounded-tr-sm'
                              : 'rounded-tl-sm'
                          }`}
                          style={{
                            background: message.role === 'user'
                              ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`
                              : colors.inputBackground,
                            color: message.role === 'user' ? 'white' : colors.primaryText,
                          }}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p 
                            className="text-xs mt-1"
                            style={{ 
                              color: message.role === 'user' 
                                ? 'rgba(255,255,255,0.7)' 
                                : colors.tertiaryText 
                            }}
                          >
                            {message.timestamp}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div>
                  <p 
                    className="text-xs font-medium mb-2"
                    style={{ color: colors.tertiaryText }}
                  >
                    QUICK ACTIONS
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleQuickAction('upload-resume')}
                      className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all"
                      style={{
                        background: colors.inputBackground,
                        color: colors.primaryText,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.hoverBackgroundStrong;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.inputBackground;
                      }}
                    >
                      <Upload size={18} style={{ color: colors.activeBlueText }} />
                      <span className="text-sm font-medium">Upload Resume</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('use-profile')}
                      className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all"
                      style={{
                        background: colors.inputBackground,
                        color: colors.primaryText,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.hoverBackgroundStrong;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.inputBackground;
                      }}
                    >
                      <User size={18} style={{ color: colors.activeBlueText }} />
                      <span className="text-sm font-medium">Use Profile</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('start-scratch')}
                      className="w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-all"
                      style={{
                        background: colors.inputBackground,
                        color: colors.primaryText,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = colors.hoverBackgroundStrong;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = colors.inputBackground;
                      }}
                    >
                      <Sparkles size={18} style={{ color: colors.activeBlueText }} />
                      <span className="text-sm font-medium">Start from Scratch</span>
                    </button>
                  </div>
                </div>

                {/* Input Field */}
                <div className="pt-4 border-t" style={{ borderTop: `1px solid ${colors.border}` }}>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Describe your portfolio or ask for changes..."
                      className="flex-1 px-4 py-2 rounded-lg text-sm"
                      style={{
                        background: colors.inputBackground,
                        border: `1px solid ${colors.border}`,
                        color: colors.primaryText,
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      className="p-2 rounded-lg transition-all"
                      style={{
                        background: `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`,
                      }}
                      title="Send message"
                      aria-label="Send message"
                    >
                      <Send size={18} className="text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <div className="space-y-6">
                {/* Design Style Options */}
                <div>
                  <p 
                    className="text-sm font-medium mb-3"
                    style={{ color: colors.primaryText }}
                  >
                    Design Style
                  </p>
                  <div className="space-y-3">
                    {([
                      { id: 'clean', label: 'Clean', description: 'Clean, simple design with focus on content', features: 'Simple typography, white space, minimal colors' },
                      { id: 'moderate', label: 'Moderate', description: 'Balanced design with visual interest', features: 'Gradients, animations, modern components' },
                      { id: 'creative', label: 'Creative', description: 'Bold, expressive design with unique elements', features: '3D effects, custom illustrations, interactive' },
                    ] as const).map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setDesignStyle(style.id as DesignStyle)}
                        className={`w-full p-4 rounded-lg text-left border-2 transition-all ${
                          designStyle === style.id
                            ? 'border-purple-500'
                            : ''
                        }`}
                        style={{
                          background: designStyle === style.id
                            ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`
                            : colors.inputBackground,
                          borderColor: designStyle === style.id
                            ? colors.badgePurpleText
                            : colors.border,
                          color: designStyle === style.id ? 'white' : colors.primaryText,
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{style.label}</span>
                              {designStyle === style.id && (
                                <Check size={16} className="text-white" />
                              )}
                            </div>
                            <p className={`text-xs mt-1 ${
                              designStyle === style.id ? 'text-white/80' : ''
                            }`}>
                              {style.description}
                            </p>
                          </div>
                        </div>
                        <p className={`text-xs ${
                          designStyle === style.id ? 'text-white/70' : colors.tertiaryText
                        }`}>
                          {style.features}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Colors */}
                <div>
                  <p 
                    className="text-sm font-medium mb-3"
                    style={{ color: colors.primaryText }}
                  >
                    Theme Colors
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {themeColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setThemeColor(color.value)}
                        className={`w-full h-12 rounded-lg border-2 transition-all ${
                          themeColor === color.value ? 'ring-2 ring-offset-2' : ''
                        }`}
                        style={{
                          background: color.color,
                          borderColor: themeColor === color.value ? color.color : colors.border,
                          ringColor: themeColor === color.value ? color.color : 'transparent',
                        }}
                        title={color.name}
                        aria-label={`Select ${color.name} theme color`}
                      />
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div>
                  <p 
                    className="text-sm font-medium mb-3"
                    style={{ color: colors.primaryText }}
                  >
                    Typography
                  </p>
                  <select
                    value={typography}
                    onChange={(e) => setTypography(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg text-sm"
                    style={{
                      background: colors.inputBackground,
                      border: `1px solid ${colors.border}`,
                      color: colors.primaryText,
                    }}
                    aria-label="Select typography font"
                  >
                    {fonts.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'sections' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <p 
                    className="text-sm font-medium"
                    style={{ color: colors.primaryText }}
                  >
                    Website Sections
                  </p>
                  <button
                    onClick={addSection}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2"
                    style={{
                      background: `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`,
                    }}
                  >
                    <Plus size={16} />
                    Add Section
                  </button>
                </div>

                <div className="space-y-2">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className="flex items-center gap-2 p-3 rounded-lg"
                      style={{
                        background: colors.inputBackground,
                      }}
                    >
                      <GripVertical 
                        size={16} 
                        style={{ 
                          color: colors.tertiaryText,
                          cursor: 'grab'
                        }}
                      />
                      <span 
                        className="flex-1 text-sm font-medium"
                        style={{ color: colors.primaryText }}
                      >
                        {section.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleSectionVisibility(section.id)}
                          className="p-1.5 rounded hover:bg-opacity-10 transition-colors"
                          style={{
                            color: section.visible ? colors.activeBlueText : colors.tertiaryText,
                          }}
                          title={section.visible ? 'Hide section' : 'Show section'}
                        >
                          {section.visible ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )}
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-opacity-10 transition-colors"
                          style={{
                            color: colors.tertiaryText,
                          }}
                          title="Settings"
                        >
                          <Settings size={16} />
                        </button>
                        {!section.required && (
                          <button
                            onClick={() => deleteSection(section.id)}
                            className="p-1.5 rounded hover:bg-opacity-10 transition-colors"
                            style={{
                              color: colors.errorRed,
                            }}
                            title="Delete"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview Header */}
          <div 
            className="px-4 py-3 border-b flex items-center justify-between flex-shrink-0"
            style={{
              background: colors.headerBackground,
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-center gap-2">
              <Eye size={18} style={{ color: colors.activeBlueText }} />
              <span 
                className="text-sm font-medium"
                style={{ color: colors.primaryText }}
              >
                Live Preview
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Device View Buttons */}
              <div className="flex items-center gap-1">
                {(['desktop', 'tablet', 'mobile'] as DeviceView[]).map((device) => (
                  <button
                    key={device}
                    onClick={() => setDeviceView(device)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                      deviceView === device
                        ? 'text-white'
                        : ''
                    }`}
                    style={{
                      background: deviceView === device
                        ? `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`
                        : 'transparent',
                      color: deviceView === device ? 'white' : colors.secondaryText,
                    }}
                  >
                    {device === 'desktop' && <Monitor size={14} />}
                    {device === 'tablet' && <Tablet size={14} />}
                    {device === 'mobile' && <Smartphone size={14} />}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  // Open preview in new window/tab
                  window.open('/portfolio-preview', '_blank');
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all"
                style={{
                  background: colors.inputBackground,
                  border: `1px solid ${colors.border}`,
                  color: colors.primaryText,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = colors.hoverBackgroundStrong;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = colors.inputBackground;
                }}
              >
                <ExternalLink size={14} />
                Open in New Tab
              </button>
            </div>
          </div>

          {/* Preview Area */}
          <div 
            className="flex-1 flex items-center justify-center p-8"
            style={{
              background: colors.background === '#0f0a1e' ? '#1a1a1a' : '#f5f5f5',
            }}
          >
            <div 
              className="w-full h-full rounded-lg flex flex-col items-center justify-center"
              style={{
                background: colors.background === '#0f0a1e' ? '#2a2a2a' : 'white',
                border: `2px dashed ${colors.border}`,
              }}
            >
              <div 
                className="w-32 h-32 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: `linear-gradient(to right, ${colors.badgePurpleText}, ${colors.activeBlueText})`,
                }}
              >
                <Eye size={48} className="text-white" />
              </div>
              <p 
                className="text-lg font-medium mb-2"
                style={{ color: colors.primaryText }}
              >
                Preview Area
              </p>
              <p 
                className="text-sm text-center max-w-md"
                style={{ color: colors.secondaryText }}
              >
                Your portfolio website will appear here once you start the setup process.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

