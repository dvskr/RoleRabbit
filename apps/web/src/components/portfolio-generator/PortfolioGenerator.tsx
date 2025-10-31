'use client';

import React, { useState } from 'react';
import { ArrowRight, Globe, Layout, FileText, Eye, Settings, Download, Send, Sparkles } from 'lucide-react';
import { WebsiteConfig } from '../../types/portfolio';
import TemplateSelector from './TemplateSelector';
import WebsiteBuilder from './WebsiteBuilder';
import PreviewPanel from './PreviewPanel';
// import HostingConfig from './HostingConfig';
import ResumeUploadModal from './ResumeUploadModal';
import { generateSectionsFromProfile, generateDefaultSections } from '../../utils/portfolioDataMapper';

interface PortfolioGeneratorProps {
  userData?: any;
  onClose?: () => void;
}

// Mock user data for demonstration
const mockUserData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  bio: 'Experienced software engineer with 5+ years of experience in full-stack development.',
  currentRole: 'Senior Software Engineer',
  currentCompany: 'Tech Corp',
  experience: '5+ years',
  professionalSummary: {
    overview: 'Seasoned full-stack engineer with expertise in modern web technologies.',
    currentFocus: 'Leading migration to microservices architecture'
  },
  skills: [
    { name: 'JavaScript', proficiency: 'Expert', yearsOfExperience: 5, verified: true },
    { name: 'React', proficiency: 'Advanced', yearsOfExperience: 4, verified: true },
    { name: 'Node.js', proficiency: 'Advanced', yearsOfExperience: 4, verified: true },
    { name: 'Python', proficiency: 'Intermediate', yearsOfExperience: 3, verified: true }
  ],
  education: [
    {
      institution: 'Stanford University',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2015-09',
      endDate: '2019-06',
    }
  ],
  projects: [
    {
      title: 'E-Commerce Platform',
      description: 'Built a scalable e-commerce platform handling 10K+ daily transactions',
      technologies: ['React', 'Node.js'],
      link: 'https://example.com/ecommerce',
      date: '2023-01'
    },
    {
      title: 'Real-time Collaboration Tool',
      description: 'Developed a real-time document collaboration tool',
      technologies: ['React', 'Socket.io'],
      date: '2022-08'
    }
  ],
  linkedin: 'https://linkedin.com/in/johndoe',
  github: 'https://github.com/johndoe',
  socialLinks: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe' },
    { platform: 'GitHub', url: 'https://github.com/johndoe' }
  ]
};

export default function PortfolioGenerator({ userData, onClose }: PortfolioGeneratorProps) {
  // Use provided userData or fallback to mock
  const effectiveUserData = userData || mockUserData;
  
  const [activeStep, setActiveStep] = useState<'data-source' | 'template' | 'builder' | 'preview' | 'publish'>('data-source');
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [portfolioConfig, setPortfolioConfig] = useState<Partial<WebsiteConfig>>({
    sections: [],
    theme: {
      templateId: 'minimal',
      primaryColor: '#3b82f6',
      colors: ['#3b82f6']
    }
  });

  const handleDataSourceSelect = (source: 'profile' | 'resume' | 'manual') => {
    if (source === 'resume') {
      // Show upload modal
      setShowResumeUpload(true);
      return;
    }
    
    let populatedSections;
    
    if (source === 'profile') {
      // Generate sections from profile data
      populatedSections = generateSectionsFromProfile(effectiveUserData as any);
      setPortfolioConfig(prev => ({ ...prev, sections: populatedSections }));
    } else {
      // Use default empty sections for manual
      populatedSections = generateDefaultSections();
      setPortfolioConfig(prev => ({ ...prev, sections: populatedSections }));
    }
    
    setActiveStep('template');
  };

  const handleResumeUpload = async (file: File) => {
    setIsUploading(true);
    
    // Simulate file processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock parsing - In real implementation, this would parse the PDF/Word file
    // For now, use profile data as a fallback
    const populatedSections = generateSectionsFromProfile(effectiveUserData as any);
    setPortfolioConfig(prev => ({ ...prev, sections: populatedSections }));
    
    setIsUploading(false);
    setShowResumeUpload(false);
    setActiveStep('template');
  };

  const handleConfigUpdate = (updates: Partial<WebsiteConfig>) => {
    setPortfolioConfig(prev => ({ ...prev, ...updates }));
  };

  const generateSubdomain = () => {
    const username = userData?.firstName?.toLowerCase() || 'user';
    return `${username}-portfolio`;
  };

  const steps = [
    { id: 'data-source', label: 'Data Source', icon: FileText },
    { id: 'template', label: 'Template', icon: Layout },
    { id: 'builder', label: 'Customize', icon: Settings },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'publish', label: 'Publish', icon: Globe }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === activeStep);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Globe size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Portfolio Website Generator</h1>
              <p className="text-sm text-gray-600">Create your professional portfolio website in minutes</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Close
            </button>
          )}
        </div>

        {/* Progress Steps */}
        <div className="mt-6 flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === activeStep;
            const isCompleted = index < getCurrentStepIndex();
            const isClickable = index <= getCurrentStepIndex();

            return (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => isClickable && setActiveStep(step.id as any)}
                  disabled={!isClickable}
                  className={`flex flex-col items-center gap-2 flex-1 transition-all ${
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
                        : isCompleted
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isActive ? 'text-purple-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeStep === 'data-source' && (
          <div className="h-full overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center mb-8">
                <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Data Source</h2>
                <p className="text-gray-600">Where should we pull your portfolio content from?</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Auto-populate from Profile */}
                <button
                  onClick={() => handleDataSourceSelect('profile')}
                  className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                    <Sparkles className="w-6 h-6 text-blue-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Use My Profile</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Auto-populate from your existing Profile data (skills, experience, education)
                  </p>
                  <div className="text-xs text-blue-600 font-medium">
                    Recommended • Fastest setup
                  </div>
                </button>

                {/* Upload Resume */}
                <button
                  onClick={() => handleDataSourceSelect('resume')}
                  className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                    <FileText className="w-6 h-6 text-green-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload Resume</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your resume and we'll extract all the data automatically
                  </p>
                  <div className="text-xs text-green-600 font-medium">
                    Supports PDF, Word, DocX
                  </div>
                </button>

                {/* Manual Input */}
                <button
                  onClick={() => handleDataSourceSelect('manual')}
                  className="p-6 bg-white border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all text-left group"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                    <Settings className="w-6 h-6 text-purple-600 group-hover:text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Manual Input</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Start from scratch and fill everything yourself
                  </p>
                  <div className="text-xs text-purple-600 font-medium">
                    Full control • Custom content
                  </div>
                </button>
              </div>

              <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> You can always edit any content later in the builder. Start with whichever is easiest for you!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeStep === 'template' && (
          <TemplateSelector
            onNext={() => setActiveStep('builder')}
            onBack={() => setActiveStep('data-source')}
            config={portfolioConfig as WebsiteConfig}
            onUpdate={handleConfigUpdate}
          />
        )}

        {activeStep === 'builder' && (
          <WebsiteBuilder
            onNext={() => setActiveStep('preview')}
            onBack={() => setActiveStep('template')}
            config={portfolioConfig as WebsiteConfig}
            onUpdate={handleConfigUpdate}
            portfolioData={effectiveUserData}
          />
        )}

        {activeStep === 'preview' && (
          <PreviewPanel
            onNext={() => setActiveStep('publish')}
            onBack={() => setActiveStep('builder')}
            config={portfolioConfig as WebsiteConfig}
            portfolioData={effectiveUserData}
          />
        )}

        {activeStep === 'publish' && (
          <div className="p-8">
            Publish step (HostingConfig temporarily disabled)
            {/* <HostingConfig
              onNext={() => {}}
              onBack={() => setActiveStep('preview')}
              config={portfolioConfig as WebsiteConfig}
              onUpdate={handleConfigUpdate}
              portfolioData={effectiveUserData}
            /> */}
          </div>
        )}
      </div>

      {/* Resume Upload Modal */}
      {showResumeUpload && (
        <ResumeUploadModal
          onUpload={handleResumeUpload}
          onClose={() => setShowResumeUpload(false)}
          isUploading={isUploading}
        />
      )}
    </div>
  );
}


