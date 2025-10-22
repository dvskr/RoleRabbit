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

// Import our extracted components gradually
import Sidebar from '../components/layout/Sidebar';

export default function RoleReady() {
  const [activeTab, setActiveTab] = useState('editor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle tab change and sidebar collapse logic
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Collapse sidebar only when Resume Editor is selected
    setSidebarCollapsed(tab === 'editor');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Keep all the original state for now to maintain functionality
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
  const [tailorEditMode, setTailorEditMode] = useState('partial'); // 'full' or 'partial'
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailoredResume, setTailoredResume] = useState(null);
  const [showTailorConfirmation, setShowTailorConfirmation] = useState(false);
  const [missingKeywords, setMissingKeywords] = useState([]);
  const [matchedKeywords, setMatchedKeywords] = useState([]);
  const [aiConversation, setAiConversation] = useState([
    { role: 'assistant', text: 'Hi! I\'m your AI Resume Assistant. Tell me about your experience and I\'ll help you craft professional resume content. What position are you applying for?' }
  ]);
  const [aiPrompt, setAiPrompt] = useState('');

  // Resume data state
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

  // All other original state variables...
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

  // Use our extracted Sidebar component
  const sidebarProps = {
    activeTab,
    handleTabChange,
    sidebarCollapsed,
    toggleSidebar
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Use our extracted Sidebar component */}
      <Sidebar {...sidebarProps} />

      {/* Keep the original main content for now to maintain functionality */}
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${
        sidebarCollapsed ? 'ml-0' : 'ml-0'
      }`}>
        {/* Resume Editor */}
        {activeTab === 'editor' && (
          <div className="flex-1 overflow-hidden">
            {/* Keep original editor content for now */}
            <div className="h-full bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Sparkles size={40} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Resume Editor</h2>
                <p className="text-gray-600">Start building your professional resume</p>
                <p className="text-sm text-gray-500 mt-2">Refactoring in progress - using extracted Sidebar component</p>
              </div>
            </div>
          </div>
        )}

        {/* Home */}
        {activeTab === 'home' && (
          <div className="flex-1 overflow-hidden">
            <Home />
          </div>
        )}

        {/* Job Tracker */}
        {activeTab === 'tracker' && (
          <div className="flex-1 overflow-hidden">
            <JobTracker />
          </div>
        )}

        {/* Templates */}
        {activeTab === 'templates' && (
          <div className="flex-1 overflow-hidden">
            <Templates />
          </div>
        )}

        {/* Discussion */}
        {activeTab === 'discussion' && (
          <div className="flex-1 overflow-hidden">
            <Discussion />
          </div>
        )}

        {/* Cloud Storage */}
        {activeTab === 'storage' && (
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Sparkles size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Cloud Storage</h2>
              <p className="text-gray-600">Your cloud storage options will appear here.</p>
            </div>
          </div>
        )}

        {/* Email */}
        {activeTab === 'email' && (
          <div className="flex-1 overflow-hidden">
            <Email />
          </div>
        )}

        {/* Profile */}
        {activeTab === 'profile' && (
          <div className="flex-1 overflow-hidden">
            <UserProfileModal />
          </div>
        )}

        {/* Fallback for unimplemented tabs */}
        {activeTab !== 'editor' && activeTab !== 'home' && activeTab !== 'tracker' && activeTab !== 'templates' && activeTab !== 'discussion' && activeTab !== 'storage' && activeTab !== 'email' && activeTab !== 'profile' && (
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Sparkles size={40} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon!</h2>
              <p className="text-gray-600">We're working hard to bring you amazing features.</p>
            </div>
          </div>
        )}
      </div>

      {/* Keep original modals for now */}
      {/* All the original modal JSX would go here */}
      
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
