'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Upload, FileText, Link as LinkIcon, Award, Lightbulb, Wand2 } from 'lucide-react';
import { portfolioPrompts, quickPrompts } from './prompts';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'resume-upload' | 'link-input' | 'file-upload';
  data?: any;
}

interface ChatInterfaceProps {
  onComplete: (collectedData: any) => void;
  profileData?: any;
  initialData?: any;
  onSyncToProfile?: (data: any) => void;
}

export default function ChatInterface({ onComplete, profileData, initialData, onSyncToProfile }: ChatInterfaceProps) {
  // Pre-populate from profile data and initial setup data
  const getInitialData = () => {
    const fromProfile = profileData ? {
      name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
      role: profileData.currentRole || profileData.currentCompany ? 
        `${profileData.currentRole || ''} at ${profileData.currentCompany || ''}`.trim() : '',
      bio: profileData.bio || profileData.professionalSummary?.overview || '',
      email: profileData.email || '',
      links: [
        ...(profileData.github ? [profileData.github] : []),
        ...(profileData.linkedin ? [profileData.linkedin] : []),
        ...(profileData.website ? [profileData.website] : []),
        ...(profileData.portfolio ? [profileData.portfolio] : [])
      ].filter(Boolean),
      projects: profileData.projects || [],
      skills: profileData.skills?.map((s: any) => s.name) || []
    } : {};

    return { ...fromProfile, ...initialData };
  };

  // Store resume data for LLM context
  const [resumeContext, setResumeContext] = useState<any>(null);

  // If initialData includes resume content, store it
  React.useEffect(() => {
    if (initialData?.resumeContent) {
      setResumeContext(initialData.resumeContent);
    }
  }, [initialData]);

  const getInitialMessage = () => {
    const data = getInitialData();
    
    // Build context-aware greeting
    if (resumeContext) {
      return `Perfect! I've reviewed your resume. I can see you're ${data.role || 'an experienced professional'}. Let's enhance your portfolio with AI. Want to add more projects, highlight achievements, or customize your story? Just type what you'd like to add!`;
    }
    
    if (data.name || data.role || data.bio) {
      return `Perfect! I have your basic info from Step 1. Now let's enhance it with AI. Want to add projects, achievements, or customize anything? Or just type "ready" to proceed!`;
    }
    return "Hi! Let's add more details to make your portfolio stand out. Tell me about your achievements, projects, or skills!";
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getInitialMessage(),
      type: 'text'
    }
  ]);
  const [currentInput, setCurrentInput] = useState('');
  const [collectedData, setCollectedData] = useState<any>(getInitialData());
  const [isTyping, setIsTyping] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = (response: string, callback: () => void) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, 1500);
  };

  const addMessage = (role: 'user' | 'assistant', content: string, type: 'text' | 'resume-upload' | 'link-input' | 'file-upload' = 'text', data?: any) => {
    setMessages(prev => [...prev, { role, content, type, data }]);
  };

  const handleResumeUpload = (file: File) => {
    // Simulate parsing resume
    const reader = new FileReader();
    reader.onload = (e) => {
      const resumeData = {
        name: file.name,
        data: e.target?.result
      };
      addMessage('user', `Uploaded resume: ${file.name}`, 'file-upload', resumeData);
      
      setTimeout(() => {
        addMessage('assistant', `Great! I've analyzed your resume. I can see your experience and skills. Let's add some personality - tell me what makes you unique or what you're passionate about?`, 'text');
      }, 1000);
    };
    reader.readAsText(file);
  };

  // AI-like intelligence to extract information from natural language and resume context
  const extractInformation = (message: string) => {
    const updated = { ...collectedData };
    let extracted = false;

    // If we have resume context, use it to enhance extraction
    if (resumeContext) {
      // For projects: Check if message mentions project or if we should extract from resume
      if (message.toLowerCase().includes('project') || message.toLowerCase().includes('built')) {
        // Could extract from resume context here if needed
      }
      
      // For experience: Map resume experience if mentioned
      if (message.toLowerCase().includes('experience') && !updated.experience) {
        // Extract experience from resume context
        const expMatches = resumeContext.match(/(?:EXPERIENCE|WORK HISTORY)[:\s]*([^\n]+(?:\n[^\n]+){0,10})/i);
        if (expMatches) {
          updated.experience = [expMatches[1]];
          extracted = true;
        }
      }
    }

    // Extract projects
    if (message.toLowerCase().includes('project') || message.toLowerCase().includes('built') || message.toLowerCase().includes('developed')) {
      const projectPattern = /(?:project|built|developed|created)\s*:?\s*([^.]{10,200})/i;
      const projectMatch = message.match(projectPattern);
      if (projectMatch && projectMatch[1].length > 10) {
        updated.projects = [
          ...(updated.projects || []),
          {
            title: extractProjectTitle(projectMatch[1]),
            description: projectMatch[1],
            technologies: extractTechnologies(projectMatch[1])
          }
        ];
        extracted = true;
      }
    }

    // Extract skills
    const skillsPattern = /\b(?:Python|JavaScript|React|Node\.js|TypeScript|Java|C\+\+|PHP|Ruby|Go|Swift|Kotlin|Angular|Vue|Svelte|Express|Django|Flask|Laravel|AWS|Azure|GCP|Docker|Kubernetes|GraphQL|REST|SQL|NoSQL|MongoDB|PostgreSQL|MySQL)\b/gi;
    const skills = message.match(skillsPattern);
    if (skills) {
      updated.skills = [...(updated.skills || []), ...skills.filter((skill, idx, arr) => arr.indexOf(skill) === idx)];
      extracted = true;
    }

    // Extract achievements
    if (message.toLowerCase().includes('achievement') || message.toLowerCase().includes('award') || message.toLowerCase().includes('won')) {
      const achievementText = message;
      updated.achievements = [...(updated.achievements || []), achievementText];
      extracted = true;
    }

    // Extract email
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const emailMatch = message.match(emailPattern);
    if (!collectedData.email && emailMatch) {
      updated.email = emailMatch[0];
      extracted = true;
    }

    // Extract URLs
    const urlPattern = /https?:\/\/[^\s]+/gi;
    const urls = message.match(urlPattern);
    if (urls) {
      updated.links = [...(updated.links || []), ...urls];
      extracted = true;
    }

    // Extract experience
    if (message.toLowerCase().includes('experience') || message.toLowerCase().includes('worked') || message.toLowerCase().includes('years')) {
      const expText = message;
      if (!updated.experience) updated.experience = [];
      updated.experience.push(expText);
      extracted = true;
    }

    return { updated, extracted };
  };

  const extractProjectTitle = (text: string): string => {
    const titleMatch = text.match(/^[^.]+/);
    return titleMatch ? titleMatch[0].substring(0, 50) : 'Portfolio Project';
  };

  const extractTechnologies = (text: string): string[] => {
    const techKeywords = ['React', 'Node.js', 'JavaScript', 'Python', 'TypeScript', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker'];
    return techKeywords.filter(tech => text.includes(tech));
  };

  const handleSend = () => {
    if (!currentInput.trim()) return;

    const userMessage = currentInput;
    addMessage('user', userMessage);

    // AI-like intelligence to understand user intent
    const { updated, extracted } = extractInformation(userMessage);
    
    if (extracted) {
      setCollectedData(updated);
    } else {
      // If no extraction happened, try to understand context
      const lowerMessage = userMessage.toLowerCase();
      
      // Check if user is answering questions
      if (!updated.name && userMessage.length < 50) {
        updated.name = userMessage;
      } else if (!updated.role && !updated.bio && userMessage.length > 20 && userMessage.length < 200) {
        if (userMessage.includes('http') || userMessage.includes('@')) {
          // Contains contact info, might be sharing links
        } else if (userMessage.toLowerCase().includes('engineer') || userMessage.toLowerCase().includes('developer')) {
          updated.role = userMessage;
        } else if (!updated.bio) {
          updated.bio = userMessage;
        }
      }
      
      setCollectedData(updated);
    }

    // Check for completion signals
    const completionSignals = ['ready', 'done', 'build', 'complete', 'finish', 'generate', 'create portfolio'];
    const isCompleting = completionSignals.some(signal => userMessage.toLowerCase().includes(signal));

    // Determine what to ask next based on missing information
    const missingInfo: string[] = [];
    if (!updated.name) missingInfo.push('name');
    if (!updated.role) missingInfo.push('role/profession');
    if (!updated.bio) missingInfo.push('bio/description');
    if (!updated.email) missingInfo.push('email');
    if (!updated.links || updated.links.length === 0) missingInfo.push('social links');

    let assistantResponse = '';

    if (isCompleting && (updated.name || updated.role || updated.bio)) {
      // User wants to complete with what they have
      const completeData = {
        ...updated,
        skills: updated.skills || ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        projects: updated.projects || [
          { title: 'Portfolio Project', description: updated.bio || 'A showcase of my work', technologies: ['React', 'Node.js'] }
        ],
        github: updated.links?.find((link: string) => link.includes('github')),
        linkedin: updated.links?.find((link: string) => link.includes('linkedin'))
      };
      
      simulateTyping('', () => {
        addMessage('assistant', 'Perfect! I have gathered your information. Generating your amazing portfolio website...', 'text');
        setTimeout(() => {
          // Sync to profile if handler provided
          if (onSyncToProfile) {
            onSyncToProfile(completeData);
          }
          onComplete(completeData);
        }, 2000);
      });
      setCurrentInput('');
      return;
    }

    // Advanced natural conversation responses based on collected data
    const hasName = !!updated.name;
    const hasRole = !!updated.role;
    const hasBio = !!updated.bio;
    const hasProjects = !!updated.projects && updated.projects.length > 0;
    const hasSkills = !!updated.skills && updated.skills.length > 0;
    const hasExperience = !!updated.experience && updated.experience.length > 0;
    
    if (!hasName) {
      assistantResponse = 'Hi! I am your portfolio assistant. What is your name?';
    } else if (!hasRole) {
      assistantResponse = `Nice to meet you${hasName ? `, ${updated.name}` : ''}! What is your profession or role?`;
    } else if (!hasBio) {
      assistantResponse = `Perfect! As a ${updated.role}, can you tell me about yourself - your passion, experience, and what drives you?`;
    } else if (!hasExperience) {
      assistantResponse = `Excellent! I would love to hear about your professional experience. Where have you worked and what did you accomplish?`;
    } else if (!hasProjects) {
      assistantResponse = `Great background! Tell me about projects you have built or are proud of. What technologies did you use?`;
    } else if (!hasSkills) {
      assistantResponse = `Nice projects! What are your technical skills and areas of expertise?`;
    } else if (missingInfo.length === 0) {
      assistantResponse = 'Amazing! You have shared a lot of information. Anything else to add, or type "ready" to build your portfolio!';
    } else {
      assistantResponse = extracted 
        ? 'Got it! I will include that in your portfolio.' 
        : 'Tell me more! What else should I know about you?';
    }

    simulateTyping('', () => {
      addMessage('assistant', assistantResponse, 'text');
    });

    setCurrentInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex flex-col">
            <p className="text-sm text-gray-600">AI Enhancement - Step 2 of 4</p>
            {resumeContext && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <FileText size={12} />
                Using resume context for smarter responses
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            const completeData = { ...collectedData };
            onComplete(completeData);
          }}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all"
        >
          Continue to Preview
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
              </div>
            )}
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-gray-600" />
              </div>
            )}
            
            <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
              <div
                className={`inline-block px-4 py-3 rounded-2xl max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}
              >
                {message.type === 'file-upload' && (
                  <div className="flex items-center gap-2 mb-2">
                    <FileText size={16} />
                    <span className="text-sm">{message.data?.name}</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2 items-end">
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <button
            onClick={handleSend}
            disabled={!currentInput.trim() || isTyping}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Send size={18} />
            Send
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.pdf,.doc,.docx';
              input.onchange = (e: any) => {
                const file = e.target.files[0];
                if (file) handleResumeUpload(file);
              };
              input.click();
            }}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            <Upload size={14} />
            Upload Resume
          </button>
          <button
            onClick={() => {
              setShowPrompts(!showPrompts);
            }}
            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <Wand2 size={14} />
            AI Prompts
          </button>
          <button
            onClick={() => setCurrentInput('I\'m ready to build my portfolio!')}
            className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100 transition-colors flex items-center gap-2"
          >
            <Award size={14} />
            Ready to Build
          </button>
        </div>

        {/* AI Prompts Panel */}
        {showPrompts && (
          <div className="mt-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-purple-600" />
              <h4 className="text-sm font-semibold text-gray-900">AI Prompt Library</h4>
              <button
                onClick={() => setShowPrompts(false)}
                className="ml-auto text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 max-h-64 overflow-y-auto">
              {/* Quick Prompts */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Quick Start Templates</p>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.slice(0, 4).map((quickPrompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentInput(quickPrompt.prompt);
                        setShowPrompts(false);
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:border-purple-400 hover:bg-purple-50 transition-all text-gray-700"
                    >
                      {quickPrompt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Prompts */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Hero Section</p>
                <div className="flex flex-wrap gap-2">
                  {portfolioPrompts[0].prompts.slice(0, 3).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentInput(prompt.prompt);
                        setShowPrompts(false);
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:border-purple-400 hover:bg-purple-50 transition-all text-gray-700"
                    >
                      {prompt.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Projects & Experience */}
              <div>
                <p className="text-xs font-medium text-gray-700 mb-2">Projects & Impact</p>
                <div className="flex flex-wrap gap-2">
                  {portfolioPrompts[2].prompts.slice(0, 3).map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentInput(prompt.prompt);
                        setShowPrompts(false);
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs hover:border-purple-400 hover:bg-purple-50 transition-all text-gray-700"
                    >
                      {prompt.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPrompts(false)}
              className="w-full mt-3 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

