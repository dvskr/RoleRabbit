'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Layout, Download, MessageSquare, Mail, Briefcase, Plus, Edit, Save, X, Send, Trash2, Copy, Eye, EyeOff, ChevronUp, ChevronDown, Sparkles, FileUp, History, Layers, Type, Palette, Zap, AlertCircle, GripVertical, Link, Phone, MapPin, Linkedin, Github, Globe, Database, Cloud, Search, Bot, Menu, Undo, Redo, Settings, Brain, CheckCircle, Info, Target, User, Home as HomeIcon } from 'lucide-react';
import { useUndoRedo, useKeyboardShortcuts, useAutoSave, useFormValidation, useSearch } from '../hooks/useEnhancedFeatures';
import { ExportModal, SearchModal, NotificationToast } from '../components/EnhancedModals';
import UserProfileModal from '../components/UserProfileModal';
import JobTracker from '../components/JobTracker';
import Templates from '../components/Templates';
import Discussion from '../components/Discussion';
import Home from '../components/Home';
import Email from '../components/Email';

// Import our extracted components
import Sidebar from '../components/layout/Sidebar';
import MainContent from '../components/layout/MainContent';

// Import our extracted modal components
import {
  AIGeneratorModal,
  NewResumeModal,
  CustomFieldModal,
  CustomSectionModal,
  AIOptimizeModal,
  ExportModal as ExtractedExportModal,
  ImportModal
} from '../components/modals';

export default function RoleReady() {
  // Use our extracted sidebar hook
  const [activeTab, setActiveTab] = useState('editor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarCollapsed(tab === 'editor');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Keep all original state to maintain functionality
  const [selectedTemplate, setSelectedTemplate] = useState('ats');
  const [layoutMode, setLayoutMode] = useState('one-column');
  const [fontFamily, setFontFamily] = useState('arial');
  const [fontSize, setFontSize] = useState('ats11pt');
  const [lineSpacing, setLineSpacing] = useState('normal');
  const [sectionSpacing, setSectionSpacing] = useState('medium');
  const [margins, setMargins] = useState('normal');
  const [headingStyle, setHeadingStyle] = useState('bold');
  const [bulletStyle, setBulletStyle] = useState('disc');
  const [showNewResumeModal, setShowNewResumeModal] = useState(false);
  const [showAIOptimize, setShowAIOptimize] = useState(false);
  const [aiMode, setAiMode] = useState('match');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  const [showAIConfirmation, setShowAIConfirmation] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);
  const [tailorEditMode, setTailorEditMode] = useState('partial');
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [showTailorConfirmation, setShowTailorConfirmation] = useState(false);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [aiConversation, setAiConversation] = useState([
    { role: 'assistant', text: 'Hi! I\'m your AI Resume Assistant. Tell me about your experience and I\'ll help you craft professional resume content. What position are you applying for?' }
  ]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [previousSidebarState, setPreviousSidebarState] = useState(false);
  const [showATSScore, setShowATSScore] = useState(false);
  const [initialATSScore, setInitialATSScore] = useState(0);
  const [showAIGenerate, setShowAIGenerate] = useState(false);
  const [aiGenerateMode, setAiGenerateMode] = useState('summary');
  const [aiGeneratedContent, setAiGeneratedContent] = useState('');
  const [selectedTone, setSelectedTone] = useState('professional');
  const [selectedLength, setSelectedLength] = useState('concise');
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false);
  const [targetSection, setTargetSection] = useState(null);
  const [targetExperienceId, setTargetExperienceId] = useState(null);
  const [aiGeneratePrompt, setAiGeneratePrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTailoringMode, setIsTailoringMode] = useState(false);
  const [inputType, setInputType] = useState('auto');

  // Resume data state - keep original structure
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: 'SATHISH KUMAR',
      title: 'Data Engineer',
      email: 'dvskr.333@gmail.com',
      phone: '+1 (314) 325-9624',
      location: 'St. Louis, MO',
      linkedin: 'linkedin.com/in/dvskr',
      github: 'https://github.com/dvskr',
      website: 'www.your-site.com'
    },
    summary: 'Data Engineer with more than 4 years of experience designing and scaling modern data platforms across manufacturing and healthcare.',
    skills: ['Python', 'PySpark', 'SQL', 'Kafka', 'Schema Registry', 'Airflow', 'Azure Data Factory', 'AWS Glue'],
    experience: [],
    projects: [],
    education: [],
    certifications: []
  });

  // All other original state variables
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldIcon, setNewFieldIcon] = useState('link');
  const [showFileNameModal, setShowFileNameModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');
  const [showAddCustomFieldModal, setShowAddCustomFieldModal] = useState(false);
  const [customFieldSection, setCustomFieldSection] = useState('');
  const [customFieldItemId, setCustomFieldItemId] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success', visible: false });

  // Version Control State
  const [versions, setVersions] = useState([
    {
      id: 'v1.0',
      name: 'Master Version',
      timestamp: new Date().toISOString(),
      description: 'Initial resume version',
      tags: ['base'],
      parent: null,
      snapshot: null,
      metadata: {
        appliedTo: [],
        responses: '',
        lastModified: new Date().toISOString(),
        autoSaved: false
      }
    }
  ]);

  const [currentVersionId, setCurrentVersionId] = useState('v1.0');
  const [showVersionManager, setShowVersionManager] = useState(false);
  const [showCreateVersion, setShowCreateVersion] = useState(false);
  const [showCompareVersions, setShowCompareVersions] = useState(false);

  // Keep all original functions for now
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => setNotification({ ...notification, visible: false }), 3000);
  };

  // Resume data handlers - simplified versions for now
  const updateResumeData = (updates) => {
    setResumeData(prev => ({ ...prev, ...updates }));
  };

  const addExperience = (experience) => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { ...experience, id: Date.now() }]
    }));
  };

  const updateExperience = (id, updates) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp =>
        exp.id === id ? { ...exp, ...updates } : exp
      )
    }));
  };

  const deleteExperience = (id) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addProject = (project) => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, { ...project, id: Date.now() }]
    }));
  };

  const updateProject = (id, updates) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, ...updates } : proj
      )
    }));
  };

  const deleteProject = (id) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  const addEducation = (education) => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { ...education, id: Date.now() }]
    }));
  };

  const updateEducation = (id, updates) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu =>
        edu.id === id ? { ...edu, ...updates } : edu
      )
    }));
  };

  const deleteEducation = (id) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addCertification = (certification) => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, { ...certification, id: Date.now() }]
    }));
  };

  const updateCertification = (id, updates) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert =>
        cert.id === id ? { ...cert, ...updates } : cert
      )
    }));
  };

  const deleteCertification = (id) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const addSkill = (skill) => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, skill]
    }));
  };

  const removeSkill = (skill) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  // Modal handlers
  const handleCreateBlankResume = () => {
    const blankResume = {
      personalInfo: {
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: ''
      },
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
    setShowImportModal(true);
  };

  const handleAIAssist = () => {
    setShowAIOptimize(true);
    setAiMode('chat');
  };

  const handleExport = async (format, options = {}) => {
    showNotification(`${format.toUpperCase()} export coming soon!`, 'warning');
  };

  const handleTailorResume = async (jobDesc) => {
    setJobDescription(jobDesc);
    showNotification('Resume tailoring coming soon!', 'warning');
  };

  const handleChatMessage = async (message) => {
    setAiConversation(prev => [...prev, { role: 'user', text: message }]);
    // Simulate AI response
    setTimeout(() => {
      setAiConversation(prev => [...prev, { role: 'assistant', text: `I understand you're looking for help with: "${message}". Let me provide some guidance.` }]);
    }, 1000);
  };

  const handleAddCustomField = (fieldName, fieldIcon) => {
    showNotification(`Custom field "${fieldName}" added!`, 'success');
  };

  const handleAddCustomSection = (sectionName, sectionContent) => {
    showNotification(`Custom section "${sectionName}" added!`, 'success');
  };

  const handleAIGenerate = async (prompt, tone, length) => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent(`Generated content for: ${prompt} with ${tone} tone and ${length} length.`);
      setIsGenerating(false);
      showNotification('Content generated successfully!', 'success');
    }, 2000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Use our extracted Sidebar component */}
      <Sidebar
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        sidebarCollapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* Use our extracted MainContent component */}
      <MainContent
        activeTab={activeTab}
        sidebarCollapsed={sidebarCollapsed}
        resumeData={resumeData}
        onUpdateResumeData={updateResumeData}
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
        onAddSkill={addSkill}
        onRemoveSkill={removeSkill}
      />

      {/* Use our extracted modal components */}
      <AIGeneratorModal
        isOpen={showAIGenerateModal}
        onClose={() => {
          setShowAIGenerateModal(false);
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
        isOpen={showNewResumeModal}
        onClose={() => setShowNewResumeModal(false)}
        onCreateBlank={handleCreateBlankResume}
        onImportResume={handleImportResume}
        onAIAssist={handleAIAssist}
      />

      <CustomFieldModal
        isOpen={showAddFieldModal}
        onClose={() => setShowAddFieldModal(false)}
        onAddField={handleAddCustomField}
      />

      <CustomSectionModal
        isOpen={showAddSectionModal}
        onClose={() => setShowAddSectionModal(false)}
        onAddSection={handleAddCustomSection}
      />

      <AIOptimizeModal
        isOpen={showAIOptimize}
        onClose={() => setShowAIOptimize(false)}
        aiMode={aiMode}
        onModeChange={setAiMode}
        onTailorResume={handleTailorResume}
        onChatMessage={handleChatMessage}
        chatMessages={aiConversation.map(msg => ({ role: msg.role, content: msg.text }))}
        isProcessing={isAnalyzing}
      />

      <ExtractedExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
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
