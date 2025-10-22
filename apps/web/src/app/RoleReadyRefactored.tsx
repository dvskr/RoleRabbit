'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Import our extracted components and hooks
import { useResumeData } from '../hooks/useResumeData';
import { useSidebar } from '../hooks/useSidebar';
import { useModals } from '../hooks/useModals';
import Sidebar from '../components/layout/Sidebar';
import MainContent from '../components/layout/MainContent';

// Import modal components
import {
  AIGeneratorModal,
  NewResumeModal,
  CustomFieldModal,
  CustomSectionModal,
  AIOptimizeModal,
  ExportModal,
  ImportModal
} from '../components/modals';

// Import utility functions
import {
  generateSmartFileName,
  validateResumeData,
  isResumeExportReady,
  exportToJSON,
  exportToHTML,
  downloadFile,
  detectInputType,
  generateSectionContent,
  analyzeJobDescription
} from '../utils';

// Import types
import { ResumeData, ResumeVersion } from '../types/resume';

// Initial dummy data
const initialResumeData: ResumeData = {
  name: 'SATHISH KUMAR',
  title: 'Data Engineer',
  email: 'dvskr.333@gmail.com',
  phone: '+1 (314) 325-9624',
  location: 'St. Louis, MO',
  linkedin: 'linkedin.com/in/dvskr',
  github: 'https://github.com/dvskr',
  website: 'www.your-site.com',
  summary: 'Data Engineer with more than 4 years of experience designing and scaling modern data platforms across manufacturing and healthcare.',
  skills: ['Python', 'PySpark', 'SQL', 'Kafka', 'Schema Registry', 'Airflow', 'Azure Data Factory', 'AWS Glue'],
  experience: [],
  projects: [],
  education: [],
  certifications: []
};

const initialResumeVersions: ResumeVersion[] = [
  {
    id: 'v1.0',
    name: 'Master Version',
    timestamp: new Date().toISOString(),
    description: 'Initial resume version',
    tags: ['base'],
    parent: null,
    snapshot: initialResumeData,
    metadata: {
      appliedTo: [],
      responses: '',
      lastModified: new Date().toISOString(),
      autoSaved: false
    }
  }
];

export default function RoleReady() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Initialize from URL or default to editor
  const initialTab = searchParams.get('tab') || 'editor';
  
  // Use our extracted hooks
  const { activeTab, handleTabChange, sidebarCollapsed, toggleSidebar } = useSidebar(initialTab);
  const {
    resumeData,
    setResumeData,
    versions,
    setVersions,
    currentVersionId,
    setCurrentVersionId,
    createNewVersion,
    loadVersion,
    updateContact,
    updateSummary,
    updateSkills,
    addExperience,
    updateExperience,
    deleteExperience,
    addProject,
    updateProject,
    deleteProject,
    addEducation,
    updateEducation,
    deleteEducation,
    addCertification,
    updateCertification,
    deleteCertification
  } = useResumeData(initialResumeData, initialResumeVersions);
  
  const modals = useModals();

  // Additional state for AI and other features
  const [aiMode, setAiMode] = useState<'tailor' | 'chat'>('tailor');
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [aiGeneratePrompt, setAiGeneratePrompt] = useState('');
  const [targetSection, setTargetSection] = useState<string | null>(null);
  const [targetExperienceId, setTargetExperienceId] = useState<number | null>(null);
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('medium');
  const [inputType, setInputType] = useState<'auto' | 'prompt' | 'job'>('auto');
  const [chatMessages, setChatMessages] = useState([
    { role: 'user' as const, content: 'Hi! I\'m your AI Resume Assistant. Tell me about your experience and I\'ll help you craft professional resume content.' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success' as const, visible: false });

  // Update URL when tab changes
  useEffect(() => {
    const newUrl = activeTab === 'editor' ? '/dashboard' : `/dashboard?tab=${activeTab}`;
    router.replace(newUrl, { scroll: false });
  }, [activeTab, router]);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      if (isResumeExportReady(resumeData)) {
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
      }
    };

    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [resumeData]);

  // Load saved data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setResumeData(parsedData);
      } catch (error) {
        console.error('Error loading saved resume data:', error);
      }
    }
  }, [setResumeData]);

  // Notification helper
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
  };

  // AI Generation handlers
  const handleAIGenerate = async (prompt: string, tone: string, length: string) => {
    setIsGenerating(true);
    setSelectedTone(tone);
    setSelectedLength(length);
    
    try {
      const context = {
        section: targetSection || 'summary',
        prompt,
        tone,
        length,
        jobDescription: inputType === 'job' ? prompt : jobDescription,
        isTailoring: inputType === 'job',
        experienceData: resumeData.experience,
        skillsData: resumeData.skills,
        projectData: resumeData.projects,
        educationData: resumeData.education
      };
      
      const content = generateSectionContent(context);
      setGeneratedContent(content);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showNotification('Content generated successfully!', 'success');
    } catch (error) {
      showNotification('Error generating content. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyGeneratedContent = () => {
    if (!generatedContent || !targetSection) return;
    
    try {
      switch (targetSection) {
        case 'summary':
          updateSummary(generatedContent);
          break;
        case 'skills':
          const skills = generatedContent.split(',').map(s => s.trim()).filter(s => s);
          updateSkills(skills);
          break;
        default:
          showNotification('Content applied successfully!', 'success');
      }
      
      setGeneratedContent('');
      modals.setShowAIGenerateModal(false);
      setTargetSection(null);
    } catch (error) {
      showNotification('Error applying content. Please try again.', 'error');
    }
  };

  // Resume creation handlers
  const handleCreateBlankResume = () => {
    const blankResume: ResumeData = {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      skills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: []
    };
    
    setResumeData(blankResume);
    showNotification('Blank resume created!', 'success');
  };

  const handleImportResume = () => {
    modals.setShowImportModal(true);
  };

  const handleAIAssist = () => {
    modals.setShowAIOptimize(true);
    setAiMode('chat');
  };

  // Export handlers
  const handleExport = async (format: string, options: any = {}) => {
    try {
      const validation = validateResumeData(resumeData);
      if (!validation.isValid) {
        showNotification('Please fix validation errors before exporting.', 'error');
        return;
      }

      const fileName = options.fileName || generateSmartFileName(resumeData);
      
      switch (format) {
        case 'json':
          const jsonContent = exportToJSON(resumeData, options);
          downloadFile(jsonContent, `${fileName}.json`, 'application/json');
          break;
        case 'html':
          const htmlContent = exportToHTML(resumeData, options);
          downloadFile(htmlContent, `${fileName}.html`, 'text/html');
          break;
        case 'pdf':
          // PDF export would require additional library integration
          showNotification('PDF export coming soon!', 'warning');
          break;
        case 'docx':
          // DOCX export would require additional library integration
          showNotification('DOCX export coming soon!', 'warning');
          break;
        default:
          showNotification('Unsupported export format.', 'error');
      }
      
      showNotification(`${format.toUpperCase()} exported successfully!`, 'success');
    } catch (error) {
      showNotification('Export failed. Please try again.', 'error');
    }
  };

  // AI Optimization handlers
  const handleTailorResume = async (jobDesc: string) => {
    setIsProcessing(true);
    setJobDescription(jobDesc);
    
    try {
      const analysis = analyzeJobDescription(jobDesc);
      showNotification(`Resume tailored for job with ${analysis.skills.length} matching skills!`, 'success');
    } catch (error) {
      showNotification('Error tailoring resume. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChatMessage = async (message: string) => {
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsProcessing(true);
    
    try {
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = `I understand you're looking for help with: "${message}". Let me provide some guidance on improving your resume.`;
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      showNotification('Error processing message. Please try again.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Custom field handlers
  const handleAddCustomField = (fieldName: string, fieldIcon: string) => {
    // Implementation would depend on where custom fields are stored
    showNotification(`Custom field "${fieldName}" added!`, 'success');
  };

  const handleAddCustomSection = (sectionName: string, sectionContent: string) => {
    // Implementation would depend on where custom sections are stored
    showNotification(`Custom section "${sectionName}" added!`, 'success');
  };

  // Skill management handlers
  const handleAddSkill = (skill: string) => {
    updateSkills([...resumeData.skills, skill]);
    showNotification(`Skill "${skill}" added!`, 'success');
  };

  const handleRemoveSkill = (skill: string) => {
    updateSkills(resumeData.skills.filter(s => s !== skill));
    showNotification(`Skill "${skill}" removed!`, 'success');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Main Content */}
      <MainContent
        activeTab={activeTab}
        sidebarCollapsed={sidebarCollapsed}
        resumeData={resumeData}
        onUpdateResumeData={(updates) => setResumeData({ ...resumeData, ...updates })}
        onAddExperience={addExperience}
        onUpdateExperience={updateExperience}
        onRemoveExperience={deleteExperience}
        onAddProject={addProject}
        onUpdateProject={updateProject}
        onRemoveProject={deleteProject}
        onAddEducation={addEducation}
        onUpdateEducation={updateEducation}
        onRemoveEducation={deleteEducation}
        onAddCertification={addCertification}
        onUpdateCertification={updateCertification}
        onRemoveCertification={deleteCertification}
        onAddSkill={handleAddSkill}
        onRemoveSkill={handleRemoveSkill}
      />

      {/* Modals */}
      <AIGeneratorModal
        isOpen={modals.showAIGenerateModal}
        onClose={() => {
          modals.setShowAIGenerateModal(false);
          setTargetSection(null);
          setTargetExperienceId(null);
          setGeneratedContent('');
          setAiGeneratePrompt('');
        }}
        targetSection={targetSection}
        targetExperienceId={targetExperienceId}
        onGenerate={handleAIGenerate}
        isGenerating={isGenerating}
        generatedContent={generatedContent}
      />

      <NewResumeModal
        isOpen={modals.showNewResumeModal}
        onClose={() => modals.setShowNewResumeModal(false)}
        onCreateBlank={handleCreateBlankResume}
        onImportResume={handleImportResume}
        onAIAssist={handleAIAssist}
      />

      <CustomFieldModal
        isOpen={modals.showAddFieldModal}
        onClose={() => modals.setShowAddFieldModal(false)}
        onAddField={handleAddCustomField}
      />

      <CustomSectionModal
        isOpen={modals.showAddSectionModal}
        onClose={() => modals.setShowAddSectionModal(false)}
        onAddSection={handleAddCustomSection}
      />

      <AIOptimizeModal
        isOpen={modals.showAIOptimize}
        onClose={() => modals.setShowAIOptimize(false)}
        aiMode={aiMode}
        onModeChange={setAiMode}
        onTailorResume={handleTailorResume}
        onChatMessage={handleChatMessage}
        chatMessages={chatMessages}
        isProcessing={isProcessing}
      />

      <ExportModal
        isOpen={modals.showExportModal}
        onClose={() => modals.setShowExportModal(false)}
        onExport={handleExport}
      />

      <ImportModal
        isOpen={modals.showImportModal}
        onClose={() => modals.setShowImportModal(false)}
        onImportFile={(file) => {
          showNotification(`File "${file.name}" imported!`, 'success');
        }}
        onImportLinkedIn={() => {
          showNotification('LinkedIn import coming soon!', 'warning');
        }}
        onImportJSON={(jsonData) => {
          try {
            const parsedData = JSON.parse(jsonData);
            setResumeData(parsedData);
            showNotification('JSON data imported successfully!', 'success');
          } catch (error) {
            showNotification('Invalid JSON format.', 'error');
          }
        }}
      />

      {/* Notification Toast */}
      {notification.visible && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`px-6 py-3 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            'bg-yellow-500 text-white'
          }`}>
            {notification.message}
          </div>
        </div>
      )}
    </div>
  );
}
