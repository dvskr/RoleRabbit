'use client';

import React, { useState, useMemo } from 'react';
import { Building2, GripVertical, Eye, Settings, Palette, Trash2, Plus, Edit, PlusCircle, Home, User, Briefcase, FileText, Award, Mail, Sparkles, X } from 'lucide-react';
import { WebsiteConfig, Theme, Section } from '../../types/portfolio';
import SectionEditor from './SectionEditor';
import AIPromptPanel from './AIPromptPanel';

interface WebsiteBuilderProps {
  onNext: () => void;
  onBack: () => void;
  config: WebsiteConfig;
  onUpdate: (config: Partial<WebsiteConfig>) => void;
  portfolioData: any;
}

const defaultSections: Section[] = [
  {
    id: 'hero',
    type: 'hero',
    title: 'Hero',
    order: 1,
    enabled: true,
    config: {
      headline: 'Welcome',
      subheading: 'Your professional introduction'
    }
  },
  {
    id: 'about',
    type: 'about',
    title: 'About',
    order: 2,
    enabled: true,
    config: {
      title: 'About Me',
      description: 'Your professional story'
    }
  },
  {
    id: 'experience',
    type: 'experience',
    title: 'Experience',
    order: 3,
    enabled: true,
    config: {
      title: 'Work Experience',
      items: []
    }
  },
  {
    id: 'projects',
    type: 'projects',
    title: 'Projects',
    order: 4,
    enabled: true,
    config: {
      title: 'Featured Projects',
      items: []
    }
  },
  {
    id: 'skills',
    type: 'skills',
    title: 'Skills',
    order: 5,
    enabled: true,
    config: {
      title: 'Technical Skills',
      items: []
    }
  },
  {
    id: 'education',
    type: 'education',
    title: 'Education',
    order: 6,
    enabled: true,
    config: {
      title: 'Education',
      items: []
    }
  },
  {
    id: 'contact',
    type: 'contact',
    title: 'Contact',
    order: 7,
    enabled: true,
    config: {
      title: 'Get In Touch',
      email: '',
      socialLinks: []
    }
  }
];

const sectionIcons: Record<string, React.ComponentType<any>> = {
  hero: Home,
  about: User,
  experience: Briefcase,
  projects: FileText,
  skills: Award,
  education: Award,
  contact: Mail
};

export default function WebsiteBuilder({ onNext, onBack, config, onUpdate, portfolioData }: WebsiteBuilderProps) {
  const [sections, setSections] = useState<Section[]>(config.sections || defaultSections);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('hero');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiHistory, setAiHistory] = useState<any[]>([]);

  const handleToggleSection = (sectionId: string) => {
    const updatedSections = sections.map(section => 
      section.id === sectionId ? { ...section, enabled: !section.enabled } : section
    );
    setSections(updatedSections);
    onUpdate({ sections: updatedSections });
  };

  const handleMoveSection = (sectionId: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === sectionId);
    if (index === -1) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSections.length) return;

    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    
    newSections[index].order = index;
    newSections[targetIndex].order = targetIndex;
    
    setSections(newSections);
    onUpdate({ sections: newSections });
  };

  const handleEditSection = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (section) setEditingSection(section);
  };

  const handleSaveEditedSection = (updatedSection: Section) => {
    const updatedSections = sections.map(section => 
      section.id === updatedSection.id ? updatedSection : section
    );
    setSections(updatedSections);
    onUpdate({ sections: updatedSections });
    setEditingSection(null);
  };

  const handleAIPrompt = async (prompt: string, attachments?: File[]) => {
    setIsAILoading(true);
    
    // Process attachments if provided
    if (attachments && attachments.length > 0) {
      console.log('Attachments received:', attachments.map(f => ({ name: f.name, type: f.type, size: f.size })));
    }
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Parse prompt and apply changes (mock implementation)
    const lowerPrompt = prompt.toLowerCase();
    const updatedSections = [...sections];
    
    // AI logic to interpret and apply changes
    if (lowerPrompt.includes('modern') || lowerPrompt.includes('minimal')) {
      // Make it more modern - update hero section
      updatedSections.forEach(section => {
        if (section.type === 'hero') {
          section.config.headline = `I'm ${portfolioData?.firstName || 'John'} ${portfolioData?.lastName || 'Doe'}`;
          section.config.subheading = section.config.subheading?.replace(/I'm|I am/gi, '') || 'Modern Full-Stack Developer';
          section.config.ctaText = 'Get In Touch';
          section.config.secondaryCta = 'View Work';
        }
      });
    }
    
    if (lowerPrompt.includes('color') || lowerPrompt.includes('colorful')) {
      // Add more colors - this would update theme colors
      onUpdate({ 
        theme: { 
          primaryColor: '#8b5cf6',
          colors: ['#8b5cf6', '#ec4899', '#06b6d4']
        }
      });
    }
    
    if (lowerPrompt.includes('professional')) {
      // Make it more professional - update descriptions
      updatedSections.forEach(section => {
        if (section.type === 'about') {
          section.config.description = 'A dedicated professional with a passion for excellence and innovation.';
        }
        if (section.type === 'hero') {
          section.config.headline = section.config.headline || `${portfolioData?.firstName || 'John'} ${portfolioData?.lastName || 'Doe'}`;
          section.config.subheading = section.config.subheading?.replace(/Experienced|Passionate|Skilled/gi, 'Professional') || 'Professional Developer';
        }
      });
    }
    
    if (lowerPrompt.includes('stand out') || lowerPrompt.includes('bold')) {
      // Make it bold - update hero
      updatedSections.forEach(section => {
        if (section.type === 'hero') {
          section.config.headline = section.config.headline || `Hello, I'm ${portfolioData?.firstName || 'John'}`;
          section.config.subheading = 'Creating exceptional digital experiences';
          section.config.ctaText = 'Let\'s Talk';
          section.config.secondaryCta = 'Explore Work';
        }
      });
    }
    
    if (lowerPrompt.includes('simplify') || lowerPrompt.includes('clean')) {
      // Simplify - update descriptions to be shorter
      updatedSections.forEach(section => {
        if (section.config.description && section.config.description.length > 100) {
          section.config.description = section.config.description.substring(0, 100) + '...';
        }
      });
    }
    
    setSections(updatedSections);
    onUpdate({ sections: updatedSections });
    setAiHistory(prev => [...prev, { prompt, timestamp: Date.now() }]);
    setIsAILoading(false);
  };

  const handleAIReset = () => {
    setSections(config.sections || defaultSections);
    setAiHistory([]);
  };

  const selectedSectionData = sections.find(s => s.id === selectedSection);

  const Icon = editingSection ? Edit : Building2;

  return (
    <div className="h-full flex bg-gray-50">
      {/* Left Sidebar - Sections List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col relative">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Icon size={20} />
            Sections
          </h3>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-2">
          {sections.map((section, index) => {
            const SectionIcon = sectionIcons[section.type] || FileText;
            const isSelected = selectedSection === section.id;
            
            return (
              <div
                key={section.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setSelectedSection(section.id)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <SectionIcon size={16} className="text-gray-600" />
                  <span className="font-medium text-gray-900 flex-1">{section.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSection(section.id);
                    }}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      section.enabled ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                      section.enabled ? 'translate-x-5' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
                
                <div className="flex items-center gap-1 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveSection(section.id, 'up');
                    }}
                    disabled={index === 0}
                    className="px-2 py-1 text-xs border rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ↑
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveSection(section.id, 'down');
                    }}
                    disabled={index === sections.length - 1}
                    className="px-2 py-1 text-xs border rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ↓
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedSectionData?.title || 'Edit Section'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">Customize this section</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAIPanel(!showAIPanel)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  showAIPanel
                    ? 'bg-purple-500 text-white hover:bg-purple-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Sparkles size={18} />
                AI Customize
              </button>
              <button
                onClick={() => handleEditSection(selectedSection)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Edit size={18} />
                Edit Content
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto p-6 relative">
          <div className="max-w-4xl mx-auto">
            {/* Mock Preview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Section Preview</h3>
              <div className="space-y-4">
                {selectedSectionData && (
                  <div className="space-y-3">
                    {selectedSectionData.type === 'hero' && (
                      <div className="text-center py-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl text-white">
                        <h1 className="text-4xl font-bold mb-2">Welcome</h1>
                        <p className="text-lg opacity-90">Your professional introduction</p>
                      </div>
                    )}
                    
                    {selectedSectionData.type === 'about' && (
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">About Me</h2>
                        <p className="text-gray-600">Your professional story and background</p>
                      </div>
                    )}

                    {selectedSectionData.type === 'experience' && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Work Experience</h2>
                        <div className="space-y-3">
                          <div className="border-l-4 border-blue-500 pl-4 py-2">
                            <h3 className="font-semibold text-gray-900">Position</h3>
                            <p className="text-sm text-gray-600">Company • Date</p>
                            <p className="text-gray-700 mt-1">Description</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedSectionData.type === 'projects' && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Projects</h2>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900">Project Name</h3>
                            <p className="text-sm text-gray-600">Project description</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedSectionData.type === 'skills' && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Skill</span>
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">Skill</span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Skill</span>
                        </div>
                      </div>
                    )}

                    {selectedSectionData.type === 'education' && (
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Education</h2>
                        <div className="border-l-4 border-blue-500 pl-4 py-2">
                          <h3 className="font-semibold text-gray-900">Degree</h3>
                          <p className="text-sm text-gray-600">Institution • Year</p>
                        </div>
                      </div>
                    )}

                    {selectedSectionData.type === 'contact' && (
                      <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Get In Touch</h2>
                        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium">
                          Contact Me
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className="px-6 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
          >
            Continue to Preview
          </button>
        </div>
      </div>

      {/* Section Editor Modal */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          onSave={handleSaveEditedSection}
          onClose={() => setEditingSection(null)}
          portfolioData={portfolioData}
        />
      )}

      {/* AI Prompt Panel */}
      {showAIPanel && (
        <div className="absolute top-0 right-0 bottom-0 w-96 z-10">
          <AIPromptPanel
            onPromptSubmit={handleAIPrompt}
            isLoading={isAILoading}
            onReset={handleAIReset}
            onClose={() => setShowAIPanel(false)}
          />
        </div>
      )}
    </div>
  );
}
