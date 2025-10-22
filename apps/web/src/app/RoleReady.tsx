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

export default function RoleReady() {
  const [activeTab, setActiveTab] = useState('editor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Handle tab change and sidebar collapse logic
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Collapse sidebar only when Resume Editor is selected
    setSidebarCollapsed(tab === 'editor');
  };
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
  const [inputType, setInputType] = useState('auto'); // 'auto', 'prompt', 'job'
  
  // AI Tone and Length Options
  const toneOptions = [
    { id: 'professional', name: 'Professional', icon: '💼', description: 'Formal and polished' },
    { id: 'technical', name: 'Technical', icon: '⚙️', description: 'Detailed and precise' },
    { id: 'creative', name: 'Creative', icon: '🎨', description: 'Dynamic and engaging' },
    { id: 'executive', name: 'Executive', icon: '👔', description: 'Strategic and leadership-focused' },
    { id: 'results', name: 'Results', icon: '📊', description: 'Metrics and impact-focused' }
  ];

  const lengthOptions = [
    { id: 'concise', name: 'Concise', description: 'Short and punchy' },
    { id: 'medium', name: 'Medium', description: 'Balanced detail' },
    { id: 'detailed', name: 'Detailed', description: 'Full detail' }
  ];
  
  // Version Control State
  const [versions, setVersions] = useState([
    {
      id: 'v1.0',
      name: 'Master Version',
      timestamp: new Date().toISOString(),
      description: 'Initial resume version',
      tags: ['base'],
      parent: null,
      snapshot: null, // Will be set on first save
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
  const [newVersionName, setNewVersionName] = useState('');
  const [newVersionDescription, setNewVersionDescription] = useState('');
  const [newVersionTags, setNewVersionTags] = useState([]);
  const [compareVersion1, setCompareVersion1] = useState(null);
  const [compareVersion2, setCompareVersion2] = useState(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [versionFilter, setVersionFilter] = useState('all');
  const [versionSearchQuery, setVersionSearchQuery] = useState('');
  const [versionViewMode, setVersionViewMode] = useState('list'); // list, timeline, branches
  
  const availableTags = [
    'FAANG', 'Startup', 'Enterprise', 'Consulting',
    'Backend', 'Frontend', 'Fullstack', 'Data', 'ML',
    'Entry', 'Mid', 'Senior', 'Staff', 'Principal'
  ];
  
  
  const [resumeData, setResumeData] = useState({
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
    experience: [
      { 
        id: 1,
        company: 'Propper International', 
        role: 'Data Engineer',
        period: 'May 2023',
        endPeriod: 'Present',
        location: 'St. Louis, MO',
        skills: ['Azure Data Factory', 'Apache Airflow', 'Kafka', 'Spark', 'Snowflake', 'dbt'],
        bullets: [
          'Designed and managed ADF/Airflow pipelines integrating POS, e-commerce, and vendor feeds',
          'Re-engineered order processing from batch to Kafka + Spark streaming',
          'Migrated legacy SQL Server marts to Snowflake + dbt'
        ]
      },
      {
        id: 2,
        company: 'Globus Medical',
        role: 'Data Engineer',
        period: 'Jan 2021',
        endPeriod: 'Dec 2022',
        location: 'Hyderabad, India',
        skills: ['Apache Airflow', 'NiFi', 'Apache Spark', 'HL7', 'FHIR', 'Healthcare Standards'],
        bullets: [
          'Built Airflow/NiFi/Spark pipelines for structured and unstructured healthcare data',
          'Normalized HL7 v2/FHIR payloads and standardized ICD-10, CPT, LOINC, SNOMED codes'
        ]
      }
    ],
    projects: [
      {
        id: 1,
        name: 'Formula 1 Telemetry Lakehouse',
        subtitle: 'Personal Project',
        link: 'github.com/project',
        description: 'Databricks + Delta + ADF incremental processing',
        skills: ['Databricks', 'Delta Lake', 'Azure Data Factory', 'Python', 'Spark', 'Azure'],
        bullets: [
          'Built an end-to-end lakehouse processing 50 GB per race weekend for $5 in cloud cost'
        ]
      }
    ],
    education: [
      { 
        id: 1, 
        school: 'Southeast Missouri State University, USA',
        degree: 'M.S., Computer Science',
        startDate: 'Aug 2023',
        endDate: 'Present',
        gpa: '3.9',
        location: 'Cape Girardeau, MO'
      },
      {
        id: 2,
        school: 'Karunya Institute of Technology and Sciences, India',
        degree: 'B.Tech., Computer Science & Engineering',
        startDate: 'Aug 2015',
        endDate: 'May 2019',
        gpa: '3.7',
        location: 'Coimbatore, India'
      }
    ],
    certifications: [
      { id: 1, name: 'Neural Networks & Deep Learning', issuer: 'DeepLearning.AI', link: 'coursera.org/certificate', skills: ['Deep Learning', 'Neural Networks', 'TensorFlow', 'Keras'] },
      { id: 2, name: 'Python for Everybody', issuer: 'University of Michigan', link: 'coursera.org/certificate', skills: ['Python', 'Programming Fundamentals', 'Data Structures'] }
    ]
  });

  const [sectionVisibility, setSectionVisibility] = useState({
    summary: true,
    experience: true,
    education: true,
    skills: true,
    projects: true,
    certifications: true
  });

  const [sectionOrder, setSectionOrder] = useState([
    'summary', 'skills', 'experience', 'projects', 'education', 'certifications'
  ]);

  const [sectionNames, setSectionNames] = useState({
    summary: 'SUMMARY',
    skills: 'SKILLS',
    experience: 'EXPERIENCE',
    projects: 'PROJECTS',
    education: 'EDUCATION',
    certifications: 'CERTIFICATIONS'
  });

  const [editingSection, setEditingSection] = useState(null);
  const [tempSectionName, setTempSectionName] = useState('');

  const [customFields, setCustomFields] = useState([]);
  const [customSections, setCustomSections] = useState([]);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('My_Resume');
  const [showFileNameModal, setShowFileNameModal] = useState(false);
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [showAddCustomFieldModal, setShowAddCustomFieldModal] = useState(false);
  const [customFieldContext, setCustomFieldContext] = useState({ section: '', itemId: null });
  const [newCustomFieldName, setNewCustomFieldName] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importType, setImportType] = useState('json');
  const [importData, setImportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldIcon, setNewFieldIcon] = useState('link');
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');

  // Enhanced Features State
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notification, setNotification] = useState({ message: '', type: 'success', visible: false });
  const [isMobile, setIsMobile] = useState(false);
  const resumeElementRef = useRef(null);


  const fontFamilies = {
    arial: { 
      name: 'Arial', 
      class: 'font-sans',
      label: 'Arial (ATS Recommended)',
      ats: true
    },
    times: { 
      name: 'Times New Roman', 
      class: 'font-serif',
      label: 'Times New Roman (ATS Recommended)',
      ats: true
    },
    calibri: { 
      name: 'Calibri', 
      class: 'font-sans',
      label: 'Calibri (ATS Friendly)',
      ats: true
    },
    georgia: { 
      name: 'Georgia', 
      class: 'font-serif',
      label: 'Georgia (ATS Friendly)',
      ats: true
    },
    verdana: { 
      name: 'Verdana', 
      class: 'font-sans',
      label: 'Verdana (ATS Friendly)',
      ats: true
    },
    helvetica: { 
      name: 'Helvetica', 
      class: 'font-sans',
      label: 'Helvetica (ATS Friendly)',
      ats: true
    },
    inter: { 
      name: 'Inter', 
      class: 'font-sans',
      label: 'Inter (Modern)',
      ats: false
    },
    roboto: { 
      name: 'Roboto', 
      class: 'font-sans',
      label: 'Roboto (Modern)',
      ats: false
    }
  };

  const fontSizes = {
    ats10pt: { 
      name: 'text-3xl', 
      title: 'text-lg', 
      body: 'text-sm',
      label: '10pt',
      ats: true
    },
    ats11pt: { 
      name: 'text-4xl', 
      title: 'text-xl', 
      body: 'text-base',
      label: '11pt',
      ats: true
    },
    ats12pt: { 
      name: 'text-5xl', 
      title: 'text-2xl', 
      body: 'text-lg',
      label: '12pt',
      ats: true
    }
  };

  const lineSpacings = {
    compact: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose'
  };

  const sectionSpacings = {
    tight: 'mb-6',
    medium: 'mb-10',
    loose: 'mb-14'
  };

  const marginSettings = {
    narrow: 'p-8',
    normal: 'p-14',
    wide: 'p-20'
  };

  const headingStyles = {
    bold: 'font-black',
    semibold: 'font-bold',
    normal: 'font-semibold',
    light: 'font-medium'
  };

  const bulletStyles = {
    disc: '•',
    circle: '○',
    square: '▪',
    arrow: '→',
    check: '✓',
    dash: '–'
  };

  const analyzeJobDescription = () => {
    if (!jobDescription.trim()) {
      alert('Please paste a job description first!');
      return;
    }

    console.log('Analyzing job description...');
    setIsAnalyzing(true);
    
    setTimeout(() => {
      const resumeKeywords = resumeData.skills;
      const jdKeywords = ['Kubernetes', 'Docker', 'Terraform', 'GraphQL', 'TypeScript', 'CI/CD', 'Microservices', 'REST API'];
      const matched = resumeKeywords.filter(k => jobDescription.toLowerCase().includes(k.toLowerCase()));
      const missing = jdKeywords.filter(k => !resumeKeywords.some(rk => rk.toLowerCase() === k.toLowerCase()));
      
      setMatchedKeywords(matched);
      setMissingKeywords(missing);
      const calculatedScore = Math.floor((matched.length / (matched.length + missing.length)) * 100);
      console.log('ATS Score calculated:', calculatedScore);
      setMatchScore(calculatedScore);
      setInitialATSScore(calculatedScore);
      setShowATSScore(true);
      
      // Generate AI recommendations based on selected tone and length
      const toneContext = toneOptions.find(t => t.id === selectedTone);
      const lengthContext = lengthOptions.find(l => l.id === selectedLength);
      
      let recommendations = [];
      
      if (lengthContext.id === 'concise') {
        recommendations = [
          `Add ${missing.slice(0, 2).join(', ')} to skills`,
          'Use action verbs: Built, Led, Optimized',
          'Quantify with metrics'
        ];
      } else if (lengthContext.id === 'detailed') {
        recommendations = [
          `Add ${missing.slice(0, 5).join(', ')} to your skills section`,
          'Quantify achievements with specific metrics and percentages',
          'Use strong action verbs: Architected, Spearheaded, Optimized, Transformed',
          'Match job title keywords in your summary section',
          'Include relevant certifications and training',
          'Add specific project examples with technologies used'
        ];
      } else { // medium
        recommendations = [
        `Add ${missing.slice(0, 3).join(', ')} to your skills section`,
        'Quantify achievements with specific metrics',
        'Use action verbs: Architected, Spearheaded, Optimized',
        'Match job title keywords in your summary section'
        ];
      }
      
      // Adjust recommendations based on tone
      if (toneContext.id === 'creative') {
        recommendations = recommendations.map(rec => rec.replace('Use action verbs', 'Use creative action verbs'));
      } else if (toneContext.id === 'technical') {
        recommendations = recommendations.map(rec => rec.replace('action verbs', 'technical action verbs'));
      }
      
      // Store recommendations for confirmation
      const aiRecommendationsData = {
        recommendations,
        missingKeywords: missing,
        matchedKeywords: matched,
        matchScore: Math.floor((matched.length / (matched.length + missing.length)) * 100),
        toneContext,
        lengthContext
      };
      
      setAiRecommendations(aiRecommendationsData);
      setIsAnalyzing(false);
    }, 1500);
  };

  const applyAIRecommendations = () => {
    if (!aiRecommendations) return;
    
    const { missingKeywords, recommendations } = aiRecommendations;
    
    // Add missing keywords to skills
    const keywordsToAdd = missingKeywords.slice(0, 3);
    const newSkills = [...new Set([...resumeData.skills, ...keywordsToAdd])];
    setResumeData({...resumeData, skills: newSkills});
    
    // Clear the missing keywords since they've been added
    setMissingKeywords([]);
    setMatchedKeywords([...matchedKeywords, ...keywordsToAdd]);
    setMatchScore(prev => Math.min(prev + 15, 100));
    
    // Clear recommendations
    setAiRecommendations(null);
  };

  const cancelAIRecommendations = () => {
    setAiRecommendations(null);
  };

  // Smart input detection function
  const detectInputType = (text) => {
    if (!text.trim()) return 'auto';
    
    const lowerText = text.toLowerCase();
    const jobDescriptionKeywords = [
      'job description', 'requirements', 'qualifications', 'responsibilities',
      'experience required', 'skills required', 'education required', 'bachelor',
      'master', 'degree', 'years of experience', 'proficient in', 'knowledge of',
      'ability to', 'must have', 'should have', 'preferred', 'benefits', 'salary',
      'location', 'remote', 'hybrid', 'full-time', 'part-time', 'contract'
    ];
    
    const promptKeywords = [
      'generate', 'create', 'write', 'make', 'build', 'develop', 'design',
      'i want', 'i need', 'help me', 'can you', 'please', 'for my', 'about my'
    ];
    
    const jobScore = jobDescriptionKeywords.filter(keyword => lowerText.includes(keyword)).length;
    const promptScore = promptKeywords.filter(keyword => lowerText.includes(keyword)).length;
    
    // If text is long and contains job-related keywords, it's likely a job description
    if (text.length > 200 && jobScore > 2) return 'job';
    if (promptScore > 0 && jobScore === 0) return 'prompt';
    if (jobScore > promptScore) return 'job';
    
    return 'auto';
  };

  // Universal AI Generation Functions
  const openAIGenerateModal = (section, experienceId = null) => {
    setTargetSection(section);
    setTargetExperienceId(experienceId);
    setAiGeneratePrompt('');
    setGeneratedContent('');
    setIsTailoringMode(false);
    setInputType('auto');
    setShowAIGenerateModal(true);
  };

  const generateContent = async () => {
    if (!aiGeneratePrompt.trim()) {
      showNotification('Please enter your prompt or job description!', 'error');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Simulate AI generation (replace with actual AI API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Auto-detect input type if not manually set
      const detectedType = inputType === 'auto' ? detectInputType(aiGeneratePrompt) : inputType;
      const isTailoring = detectedType === 'job' || isTailoringMode;
      
      // Generate content based on section and prompt (or job description)
      const content = generateSectionContent(targetSection, aiGeneratePrompt, isTailoring);
      setGeneratedContent(content);
      
    } catch (error) {
      console.error('Error generating content:', error);
      showNotification('Error generating content. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSmartFileName = () => {
    const name = resumeData.personalInfo?.name || 'Resume';
    const title = resumeData.experience?.[0]?.jobTitle || 'Professional';
    const currentDate = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Clean and format the name and title
    const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    
    return `${cleanName}_${cleanTitle}_${currentDate}`;
  };

  const generateSectionContent = (section, prompt, isTailoring = false) => {
    const context = {
      section,
      prompt,
      tone: selectedTone,
      length: selectedLength,
      jobDescription: isTailoring ? prompt : (jobDescription || ''),
      isTailoring,
      experienceData,
      skillsData,
      projectData,
      educationData
    };

    switch (section) {
      case 'summary':
        return generateSummaryContent(context);
      case 'experience':
        return generateExperienceContent(context);
      case 'skills':
        return generateSkillsContent(context);
      case 'projects':
        return generateProjectsContent(context);
      case 'education':
        return generateEducationContent(context);
      default:
        return generateGenericContent(context);
    }
  };

  const generateSummaryContent = (context) => {
    const { prompt, tone, length, isTailoring, jobDescription } = context;
    const experience = experienceData[0];
    
    if (isTailoring) {
      // Generate tailored summary based on job description
      const jdKeywords = jobDescription.toLowerCase();
      const roleMatch = jdKeywords.includes('engineer') ? 'Engineer' : 
                       jdKeywords.includes('manager') ? 'Manager' : 
                       jdKeywords.includes('analyst') ? 'Analyst' : 'Professional';
      
      const tailoredTemplates = {
        professional: `Results-driven ${roleMatch} with expertise in key technologies and methodologies. Proven track record of delivering high-impact solutions that align with business objectives and drive measurable results.`,
        technical: `Technical ${roleMatch} specializing in modern technologies and best practices. Strong background in system design, development, and optimization with a focus on scalable, efficient solutions.`,
        creative: `Innovative ${roleMatch} with a passion for creative problem-solving and cutting-edge solutions. Combines technical expertise with strategic thinking to deliver exceptional results.`,
        leadership: `Experienced ${roleMatch} with proven leadership capabilities and expertise in team management. Demonstrated ability to build high-performing teams and drive organizational success.`
      };
      
      let content = tailoredTemplates[tone] || tailoredTemplates.professional;
      
      if (length === 'concise') {
        content = content.split('.')[0] + '.';
      } else if (length === 'detailed') {
        content += ` Skilled in cross-functional collaboration, strategic planning, and delivering results that exceed expectations.`;
      }
      
      return content;
    }
    
    // Regular generation mode
    const templates = {
      professional: `Results-driven professional with expertise in ${experience?.jobTitle || 'relevant field'}. ${prompt}. Proven track record of delivering high-impact solutions and driving business growth through innovative approaches.`,
      technical: `Technical professional specializing in ${experience?.jobTitle || 'technology solutions'}. ${prompt}. Strong background in system architecture, development, and optimization with a focus on scalable solutions.`,
      creative: `Innovative professional with a passion for ${experience?.jobTitle || 'creative solutions'}. ${prompt}. Combines technical expertise with creative thinking to deliver exceptional results.`,
      leadership: `Experienced leader with expertise in ${experience?.jobTitle || 'team management'}. ${prompt}. Proven ability to build high-performing teams and drive organizational success.`
    };

    let content = templates[tone] || templates.professional;
    
    if (length === 'concise') {
      content = content.split('.')[0] + '.';
    } else if (length === 'detailed') {
      content += ` Skilled in problem-solving, strategic thinking, and cross-functional collaboration.`;
    }

    return content;
  };

  const generateExperienceContent = (context) => {
    const { prompt, jobDescription, isTailoring } = context;
    
    if (isTailoring) {
      // Generate tailored bullets based on job description
      const jdLower = jobDescription.toLowerCase();
      const tailoredBullets = [];
      
      if (jdLower.includes('data') || jdLower.includes('analytics')) {
        tailoredBullets.push(
          `Designed and implemented scalable data pipelines processing ${Math.floor(Math.random() * 1000) + 100}GB daily`,
          `Optimized ETL processes reducing data processing time by ${Math.floor(Math.random() * 50) + 30}%`,
          `Built real-time analytics dashboards serving ${Math.floor(Math.random() * 100) + 50} concurrent users`
        );
      }
      
      if (jdLower.includes('software') || jdLower.includes('development')) {
        tailoredBullets.push(
          `Developed and maintained ${Math.floor(Math.random() * 20) + 5} microservices handling ${Math.floor(Math.random() * 1000) + 100} requests/day`,
          `Implemented automated testing reducing bug reports by ${Math.floor(Math.random() * 60) + 40}%`,
          `Led technical architecture decisions for ${Math.floor(Math.random() * 10) + 3} major product features`
        );
      }
      
      if (jdLower.includes('management') || jdLower.includes('leadership')) {
        tailoredBullets.push(
          `Led cross-functional team of ${Math.floor(Math.random() * 15) + 5} professionals to deliver key initiatives`,
          `Managed project budgets up to $${Math.floor(Math.random() * 1000) + 100}K with ${Math.floor(Math.random() * 20) + 10}% cost savings`,
          `Implemented process improvements resulting in ${Math.floor(Math.random() * 40) + 20}% efficiency gains`
        );
      }
      
      // Add generic tailored bullets if no specific matches
      if (tailoredBullets.length === 0) {
        tailoredBullets.push(
          `Delivered exceptional results aligned with business objectives and key performance indicators`,
          `Led key initiatives that significantly improved operational efficiency and team productivity`,
          `Collaborated with cross-functional teams to achieve strategic business goals`,
          `Implemented innovative solutions resulting in measurable improvements and cost savings`
        );
      }
      
      return tailoredBullets.slice(0, 4); // Return up to 4 bullets
    }
    
    // Regular generation mode
    const baseBullets = [
      `Delivered exceptional results in ${prompt}`,
      `Led key initiatives that significantly improved operational efficiency`,
      `Collaborated with cross-functional teams to achieve business objectives`,
      `Implemented innovative solutions resulting in measurable improvements`
    ];

    // If prompt contains specific technologies or concepts, generate more targeted bullets
    const promptLower = prompt.toLowerCase();
    const jdLower = jobDescription.toLowerCase();
    
    if (promptLower.includes('data') || promptLower.includes('engineer') || jdLower.includes('data')) {
      return [
        `Designed and implemented scalable data pipelines processing ${Math.floor(Math.random() * 1000) + 100}GB daily`,
        `Optimized ETL processes reducing data processing time by ${Math.floor(Math.random() * 50) + 30}%`,
        `Built real-time analytics dashboards serving ${Math.floor(Math.random() * 100) + 50} concurrent users`,
        `Migrated legacy data systems to cloud infrastructure, improving reliability by ${Math.floor(Math.random() * 40) + 20}%`
      ];
    }
    
    if (promptLower.includes('software') || promptLower.includes('developer') || jdLower.includes('software')) {
      return [
        `Developed and maintained ${Math.floor(Math.random() * 20) + 5} microservices handling ${Math.floor(Math.random() * 1000) + 100} requests/day`,
        `Implemented automated testing reducing bug reports by ${Math.floor(Math.random() * 60) + 40}%`,
        `Led technical architecture decisions for ${Math.floor(Math.random() * 10) + 3} major product features`,
        `Optimized application performance resulting in ${Math.floor(Math.random() * 50) + 25}% faster load times`
      ];
    }
    
    if (promptLower.includes('product') || promptLower.includes('manager') || jdLower.includes('product')) {
      return [
        `Led product strategy for ${Math.floor(Math.random() * 5) + 2} product lines generating $${Math.floor(Math.random() * 1000) + 100}K ARR`,
        `Conducted user research with ${Math.floor(Math.random() * 500) + 100} customers to identify key pain points`,
        `Managed cross-functional team of ${Math.floor(Math.random() * 15) + 5} engineers and designers`,
        `Launched ${Math.floor(Math.random() * 10) + 3} major features with ${Math.floor(Math.random() * 40) + 20}% adoption rate`
      ];
    }

    return baseBullets;
  };

  const generateSkillsContent = (context) => {
    const { prompt } = context;
    const skills = prompt.split(',').map(skill => skill.trim()).filter(skill => skill);
    
    if (skills.length === 0) {
      return ['Leadership', 'Problem Solving', 'Communication', 'Project Management'];
    }
    
    return skills;
  };

  const generateProjectsContent = (context) => {
    const { prompt } = context;
    return [
      {
        name: `Project: ${prompt}`,
        description: `Successfully delivered ${prompt} project with measurable impact on business objectives`,
        technologies: ['Technology A', 'Technology B', 'Technology C'],
        achievements: [
          `Achieved significant improvement in ${prompt}`,
          `Delivered project on time and within budget`,
          `Received positive feedback from stakeholders`
        ]
      }
    ];
  };

  const generateEducationContent = (context) => {
    const { prompt } = context;
    return [
      {
        degree: prompt.includes('degree') ? prompt : `${prompt} Degree`,
        school: 'University Name',
        year: '2020',
        gpa: '3.8',
        achievements: [
          `Graduated with honors in ${prompt}`,
          `Relevant coursework and projects`,
          `Academic achievements and recognition`
        ]
      }
    ];
  };

  const generateGenericContent = (context) => {
    const { prompt } = context;
    return `Generated content based on: ${prompt}`;
  };

  const applyGeneratedContent = () => {
    if (!generatedContent || !targetSection) return;

    switch (targetSection) {
      case 'summary':
        setSummary(generatedContent);
        break;
      case 'experience':
        if (Array.isArray(generatedContent)) {
          // Find the current experience entry being edited
          const currentExperience = experienceData.find(exp => exp.id === targetExperienceId);
          if (currentExperience) {
            // Update existing experience with generated bullets
            setExperienceData(prev => prev.map(exp => 
              exp.id === targetExperienceId 
                ? { ...exp, bullets: generatedContent }
                : exp
            ));
          } else {
            // Add new experience entry if no specific target
            const newExperience = {
              id: Date.now(),
              jobTitle: 'Generated Role',
              company: 'Company Name',
              startDate: '2023',
              endDate: 'Present',
              location: 'Location',
              bullets: generatedContent
            };
            setExperienceData([...experienceData, newExperience]);
          }
        }
        break;
      case 'skills':
        if (Array.isArray(generatedContent)) {
          setSkillsData(generatedContent);
        }
        break;
      case 'projects':
        if (Array.isArray(generatedContent)) {
          setProjectData([...projectData, ...generatedContent]);
        }
        break;
      case 'education':
        if (Array.isArray(generatedContent)) {
          setEducationData([...educationData, ...generatedContent]);
        }
        break;
    }

    setShowAIGenerateModal(false);
    setTargetSection(null);
    setTargetExperienceId(null);
    setGeneratedContent('');
    setAiGeneratePrompt('');
    setIsTailoringMode(false);
    showNotification('Content applied successfully!', 'success');
  };


  const performAITailoring = async () => {
    if (!jobDescription.trim()) {
      showNotification('Please paste a job description first!', 'error');
      return;
    }

    setIsTailoring(true);
    showNotification('🤖 AI is analyzing the job description...', 'info');

    try {
      // Simulate AI processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const toneContext = toneOptions.find(t => t.id === selectedTone);
      const lengthContext = lengthOptions.find(l => l.id === selectedLength);

      let tailoredResumeData = { ...resumeData };

      if (tailorEditMode === 'full') {
        // Full tailoring - rewrite all sections based on job description
        tailoredResumeData = await performFullTailoring(resumeData, jobDescription, toneContext, lengthContext);
      } else {
        // Partial tailoring - ATS optimization only
        tailoredResumeData = await performPartialTailoring(resumeData, jobDescription);
      }

      // Calculate improved ATS score after tailoring
      const improvedKeywords = tailoredResumeData.skills;
      const jdKeywords = ['Kubernetes', 'Docker', 'Terraform', 'GraphQL', 'TypeScript', 'CI/CD', 'Microservices', 'REST API'];
      const improvedMatched = improvedKeywords.filter(k => jobDescription.toLowerCase().includes(k.toLowerCase()));
      const improvedMissing = jdKeywords.filter(k => !improvedKeywords.some(rk => rk.toLowerCase() === k.toLowerCase()));
      const improvedScore = Math.floor((improvedMatched.length / (improvedMatched.length + improvedMissing.length)) * 100);
      
      setMatchScore(improvedScore);
      setTailoredResume(tailoredResumeData);
      setShowTailorConfirmation(true);
      showNotification(`✅ Resume tailored successfully! ATS score improved from ${initialATSScore}% to ${improvedScore}%`, 'success');
    } catch (error) {
      console.error('AI Tailoring failed:', error);
      showNotification('AI tailoring failed. Please try again.', 'error');
    } finally {
      setIsTailoring(false);
    }
  };

  const performFullTailoring = async (originalResume, jobDesc, tone, length) => {
    // Extract key requirements from job description
    const jobKeywords = extractKeywordsFromJD(jobDesc);
    const jobTitle = extractJobTitle(jobDesc);
    const requiredSkills = extractRequiredSkills(jobDesc);
    const experienceLevel = extractExperienceLevel(jobDesc);

    // Create tailored resume
    const tailored = { ...originalResume };

    // Tailor summary based on job requirements
    tailored.summary = generateTailoredSummary(originalResume, jobDesc, tone, length);

    // Tailor skills section
    tailored.skills = [...new Set([...originalResume.skills, ...requiredSkills])];

    // Tailor experience descriptions
    tailored.experience = originalResume.experience.map(exp => ({
      ...exp,
      description: tailorExperienceDescription(exp, jobDesc, tone, length)
    }));

    // Tailor projects if any
    if (tailored.projects) {
      tailored.projects = tailored.projects.map(project => ({
        ...project,
        description: tailorProjectDescription(project, jobDesc, tone, length)
      }));
    }

    return tailored;
  };

  const performPartialTailoring = async (originalResume, jobDesc) => {
    // ATS optimization only - add keywords and optimize formatting
    const jobKeywords = extractKeywordsFromJD(jobDesc);
    const tailored = { ...originalResume };

    // Add missing keywords to skills
    const missingSkills = jobKeywords.filter(keyword => 
      !originalResume.skills.some(skill => 
        skill.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    tailored.skills = [...new Set([...originalResume.skills, ...missingSkills.slice(0, 5)])];

    // Optimize existing descriptions for ATS
    tailored.experience = originalResume.experience.map(exp => ({
      ...exp,
      description: optimizeForATS(exp.description, jobKeywords)
    }));

    return tailored;
  };

  const extractKeywordsFromJD = (jobDesc) => {
    // Simple keyword extraction - in real implementation, this would use NLP
    const commonTechKeywords = [
      'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'AWS', 'Azure',
      'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum', 'CI/CD', 'REST API', 'GraphQL',
      'TypeScript', 'Vue.js', 'Angular', 'MongoDB', 'PostgreSQL', 'Redis', 'Terraform'
    ];

    return commonTechKeywords.filter(keyword => 
      jobDesc.toLowerCase().includes(keyword.toLowerCase())
    );
  };

  const extractJobTitle = (jobDesc) => {
    // Simple job title extraction
    const lines = jobDesc.split('\n');
    return lines[0]?.trim() || 'Software Engineer';
  };

  const extractRequiredSkills = (jobDesc) => {
    return extractKeywordsFromJD(jobDesc);
  };

  const extractExperienceLevel = (jobDesc) => {
    if (jobDesc.toLowerCase().includes('senior') || jobDesc.toLowerCase().includes('lead')) {
      return 'senior';
    } else if (jobDesc.toLowerCase().includes('junior') || jobDesc.toLowerCase().includes('entry')) {
      return 'junior';
    }
    return 'mid';
  };

  const generateTailoredSummary = (resume, jobDesc, tone, length) => {
    const jobTitle = extractJobTitle(jobDesc);
    const experienceLevel = extractExperienceLevel(jobDesc);
    
    let summary = '';
    
    if (length.id === 'concise') {
      summary = `Experienced ${jobTitle} with ${resume.experience.length}+ years in software development. `;
    } else if (length.id === 'detailed') {
      summary = `Results-driven ${jobTitle} with ${resume.experience.length}+ years of comprehensive experience in software development and technology solutions. `;
    } else {
      summary = `Skilled ${jobTitle} with ${resume.experience.length}+ years of experience in software development. `;
    }

    if (tone.id === 'technical') {
      summary += 'Expertise in system architecture, performance optimization, and scalable solutions.';
    } else if (tone.id === 'creative') {
      summary += 'Passionate about innovative solutions and creative problem-solving approaches.';
    } else if (tone.id === 'executive') {
      summary += 'Proven track record of leading teams and delivering strategic technology initiatives.';
    } else {
      summary += 'Committed to delivering high-quality solutions and continuous improvement.';
    }

    return summary;
  };

  const tailorExperienceDescription = (experience, jobDesc, tone, length) => {
    // This would be more sophisticated in a real implementation
    let description = experience.description;
    
    // Add job-relevant keywords
    const jobKeywords = extractKeywordsFromJD(jobDesc);
    const relevantKeywords = jobKeywords.filter(keyword => 
      description.toLowerCase().includes(keyword.toLowerCase())
    );

    if (relevantKeywords.length === 0 && jobKeywords.length > 0) {
      description += ` Utilized ${jobKeywords[0]} and ${jobKeywords[1] || 'modern technologies'} for enhanced performance.`;
    }

    return description;
  };

  const tailorProjectDescription = (project, jobDesc, tone, length) => {
    return tailorExperienceDescription(project, jobDesc, tone, length);
  };

  const optimizeForATS = (description, keywords) => {
    // Simple ATS optimization - add relevant keywords naturally
    const existingKeywords = keywords.filter(keyword => 
      description.toLowerCase().includes(keyword.toLowerCase())
    );

    if (existingKeywords.length < 2 && keywords.length > 0) {
      description += ` Technologies used: ${keywords.slice(0, 3).join(', ')}.`;
    }

    return description;
  };

  const applyTailoredResume = () => {
    if (tailoredResume) {
      setResumeData(tailoredResume);
      setShowTailorConfirmation(false);
      setTailoredResume(null);
      showNotification('✅ Resume tailored successfully!', 'success');
    }
  };

  const cancelTailoring = () => {
    setShowTailorConfirmation(false);
    setTailoredResume(null);
    showNotification('Tailoring cancelled', 'info');
  };


  const createBlankResume = () => {
    setResumeData({
      name: 'Your Name',
      title: 'Job Title',
      email: 'email@example.com',
      phone: '(555) 000-0000',
      location: 'City, State',
      linkedin: 'linkedin.com/in/yourname',
      github: 'github.com/yourname',
      website: 'yourwebsite.com',
      summary: 'Write a compelling professional summary here...',
      skills: [],
      experience: [],
      projects: [],
      education: [],
      certifications: []
    });
    setResumeFileName('My_Resume');
    setShowNewResumeModal(false);
    setActiveTab('editor');
  };

  const sendAIMessage = () => {
    if (!aiPrompt.trim()) return;
    const newConversation = [...aiConversation, { role: 'user', text: aiPrompt }];
    
    // Simulate AI response with tone and length consideration
    const toneContext = toneOptions.find(t => t.id === selectedTone);
    const lengthContext = lengthOptions.find(l => l.id === selectedLength);
    
    let aiResponse = '';
    
    // Generate different responses based on tone and length
    if (toneContext.id === 'professional') {
      if (lengthContext.id === 'concise') {
        aiResponse = `I'll help you craft a concise, professional response. Here's a brief, impactful version:\n\n"Experienced professional with proven track record in delivering results."`;
      } else if (lengthContext.id === 'detailed') {
        aiResponse = `I'll help you create a comprehensive, professional response with detailed examples:\n\n"Accomplished professional with extensive experience in strategic planning, team leadership, and cross-functional collaboration. Demonstrated success in driving operational excellence and delivering measurable business outcomes through innovative solutions and data-driven decision making."`;
      } else {
        aiResponse = `I'll help you write a balanced, professional response:\n\n"Results-driven professional with strong background in project management and stakeholder engagement. Proven ability to deliver high-quality solutions while maintaining focus on business objectives."`;
      }
    } else if (toneContext.id === 'creative') {
      if (lengthContext.id === 'concise') {
        aiResponse = `I'll help you create something creative and punchy:\n\n"Visionary innovator who transforms ideas into reality."`;
      } else if (lengthContext.id === 'detailed') {
        aiResponse = `I'll help you craft a detailed, creative narrative:\n\n"Creative visionary with a passion for transforming complex challenges into innovative solutions. Known for thinking outside the box and bringing fresh perspectives to traditional problems. Expert in blending artistic sensibility with technical expertise to create compelling user experiences."`;
      } else {
        aiResponse = `I'll help you write with creative flair:\n\n"Innovative thinker who approaches challenges with fresh perspective and creative problem-solving skills. Passionate about turning ideas into impactful solutions."`;
      }
    } else if (toneContext.id === 'technical') {
      if (lengthContext.id === 'concise') {
        aiResponse = `I'll help you write precise, technical content:\n\n"Senior engineer specializing in scalable system architecture and performance optimization."`;
      } else if (lengthContext.id === 'detailed') {
        aiResponse = `I'll help you create comprehensive technical documentation:\n\n"Senior Software Engineer with expertise in distributed systems architecture, microservices design, and cloud infrastructure. Proficient in multiple programming languages including Python, Java, and Go. Experienced in implementing CI/CD pipelines, containerization with Docker/Kubernetes, and database optimization strategies."`;
      } else {
        aiResponse = `I'll help you write detailed technical content:\n\n"Experienced software engineer with strong background in system design and implementation. Skilled in modern development practices and cloud technologies."`;
      }
    } else {
      // Default response
      aiResponse = `I'll help you with that in a ${toneContext?.name.toLowerCase()} tone (${lengthContext?.name.toLowerCase()} length). For a real implementation, this would generate content based on your selected preferences.`;
    }
    
    setAiConversation([...newConversation, { role: 'assistant', text: aiResponse }]);
    setAiPrompt('');
  };


  const toggleSection = (section) => {
    setSectionVisibility({...sectionVisibility, [section]: !sectionVisibility[section]});
  };

  const moveSection = (index, direction) => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newOrder.length) {
      [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
      setSectionOrder(newOrder);
    }
  };

  const removeSkill = (index) => {
    setResumeData({...resumeData, skills: resumeData.skills.filter((_, i) => i !== index)});
  };

  const addSkill = (skill) => {
    if (skill && skill.trim()) {
      setResumeData({...resumeData, skills: [...resumeData.skills, skill.trim()]});
    }
  };

  // Skills management for sections
  const addSectionSkill = (section, itemId, skill) => {
    if (skill && skill.trim()) {
      const items = resumeData[section].map(item => {
        if (item.id === itemId) {
          const currentSkills = item.skills || [];
          return {...item, skills: [...currentSkills, skill.trim()]};
        }
        return item;
      });
      setResumeData({...resumeData, [section]: items});
    }
  };

  const removeSectionSkill = (section, itemId, skillIndex) => {
    const items = resumeData[section].map(item => {
      if (item.id === itemId) {
        const updatedSkills = (item.skills || []).filter((_, i) => i !== skillIndex);
        return {...item, skills: updatedSkills};
      }
      return item;
    });
    setResumeData({...resumeData, [section]: items});
  };

  // Link utility functions
  const formatUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  const handleLinkClick = (url) => {
    if (url) {
      const formattedUrl = formatUrl(url);
      window.open(formattedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Cloud Storage Functions
  const [cloudResumes, setCloudResumes] = useState([]);
  const [showCloudStorage, setShowCloudStorage] = useState(false);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const saveToCloud = async (resumeName = null) => {
    try {
      const name = resumeName || resumeData.name || 'Untitled Resume';
      const resumeToSave = {
        id: Date.now(),
        name: name,
        data: resumeData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: '1.0'
      };

      // Simulate cloud storage (replace with actual cloud API)
      const existingResumes = JSON.parse(localStorage.getItem('cloudResumes') || '[]');
      const updatedResumes = [...existingResumes.filter(r => r.id !== resumeToSave.id), resumeToSave];
      localStorage.setItem('cloudResumes', JSON.stringify(updatedResumes));
      
      setCloudResumes(updatedResumes);
      showNotification(`Resume "${name}" saved to cloud!`, 'success');
      return resumeToSave;
    } catch (error) {
      showNotification('Failed to save to cloud', 'error');
      console.error('Cloud save error:', error);
    }
  };

  const loadFromCloud = (resumeId) => {
    try {
      const resume = cloudResumes.find(r => r.id === resumeId);
      if (resume) {
        setResumeData(resume.data);
        setResumeFileName(resume.name);
        showNotification(`Resume "${resume.name}" loaded from cloud!`, 'success');
      }
    } catch (error) {
      showNotification('Failed to load from cloud', 'error');
      console.error('Cloud load error:', error);
    }
  };

  const deleteFromCloud = (resumeId) => {
    try {
      const updatedResumes = cloudResumes.filter(r => r.id !== resumeId);
      localStorage.setItem('cloudResumes', JSON.stringify(updatedResumes));
      setCloudResumes(updatedResumes);
      showNotification('Resume deleted from cloud', 'success');
    } catch (error) {
      showNotification('Failed to delete from cloud', 'error');
      console.error('Cloud delete error:', error);
    }
  };

  // Load cloud resumes on component mount
  useEffect(() => {
    const savedResumes = JSON.parse(localStorage.getItem('cloudResumes') || '[]');
    setCloudResumes(savedResumes);
  }, []);

  const updateBullet = (section, itemId, bulletIndex, newText) => {
    const items = resumeData[section].map(item => {
      if (item.id === itemId) {
        const newBullets = [...item.bullets];
        newBullets[bulletIndex] = newText;
        return {...item, bullets: newBullets};
      }
      return item;
    });
    setResumeData({...resumeData, [section]: items});
  };

  const deleteBullet = (section, itemId, bulletIndex) => {
    const items = resumeData[section].map(item => {
      if (item.id === itemId) {
        return {...item, bullets: item.bullets.filter((_, i) => i !== bulletIndex)};
      }
      return item;
    });
    setResumeData({...resumeData, [section]: items});
  };

  const addBullet = (section, id) => {
    const items = resumeData[section].map(item => {
      if (item.id === id) {
        return {...item, bullets: [...(item.bullets || []), 'New bullet point...']};
      }
      return item;
    });
    setResumeData({...resumeData, [section]: items});
  };

  const updateField = (section, id, field, value) => {
    const items = resumeData[section].map(item => 
      item.id === id ? {...item, [field]: value} : item
    );
    setResumeData({...resumeData, [section]: items});
  };

  const deleteItem = (section, id) => {
    setResumeData({
      ...resumeData,
      [section]: resumeData[section].filter(item => item.id !== id)
    });
  };

  const addNewItem = (section) => {
    const templates = {
      experience: { 
        id: Date.now(), 
        company: 'Company Name', 
        role: 'Job Title', 
        period: 'Start Date',
        endPeriod: 'Present',
        location: 'Location',
        skills: [],
        bullets: ['Describe your achievement...']
      },
      projects: {
        id: Date.now(),
        name: 'Project Name',
        subtitle: 'Personal Project',
        link: 'github.com/project',
        description: 'Brief description...',
        skills: [],
        bullets: ['Key achievement...']
      },
      education: {
        id: Date.now(),
        school: 'School Name',
        degree: 'Degree',
        startDate: 'Start Date',
        endDate: 'End Date',
        gpa: '0.0',
        location: 'Location'
      },
      certifications: {
        id: Date.now(),
        name: 'Certification Name',
        issuer: 'Issuing Organization',
        link: '',
        skills: []
      }
    };

    if (templates[section]) {
      setResumeData({
        ...resumeData,
        [section]: [...resumeData[section], templates[section]]
      });
    }
  };

  const saveResume = () => {
    alert('Resume saved to cloud storage!');
  };

  const addCustomField = () => {
    if (newFieldName.trim()) {
      const field = {
        id: Date.now(),
        name: newFieldName.toLowerCase().replace(/\s+/g, '_'),
        label: newFieldName,
        value: '',
        icon: newFieldIcon
      };
      setCustomFields([...customFields, field]);
      setResumeData({...resumeData, [field.name]: ''});
      setNewFieldName('');
      setShowAddFieldModal(false);
    }
  };

  const deleteCustomField = (fieldId) => {
    const field = customFields.find(f => f.id === fieldId);
    if (field) {
      const newData = {...resumeData};
      delete newData[field.name];
      setResumeData(newData);
      setCustomFields(customFields.filter(f => f.id !== fieldId));
    }
  };

  const addCustomSection = () => {
    if (newSectionName.trim()) {
      const sectionId = `custom_${Date.now()}`;
      const section = {
        id: sectionId,
        name: newSectionName,
        content: newSectionContent || 'Add content here...',
        type: 'custom'
      };
      setCustomSections([...customSections, section]);
      setSectionVisibility({...sectionVisibility, [sectionId]: true});
      setSectionOrder([...sectionOrder, sectionId]);
      setNewSectionName('');
      setNewSectionContent('');
      setShowAddSectionModal(false);
    }
  };

  const deleteCustomSection = (sectionId) => {
    setCustomSections(customSections.filter(s => s.id !== sectionId));
    setSectionOrder(sectionOrder.filter(s => s !== sectionId));
    const newVisibility = {...sectionVisibility};
    delete newVisibility[sectionId];
    setSectionVisibility(newVisibility);
  };

  const updateCustomSection = (sectionId, content) => {
    setCustomSections(customSections.map(s => 
      s.id === sectionId ? {...s, content} : s
    ));
  };

  const addCustomFieldToItem = () => {
    if (!newCustomFieldName.trim()) return;
    
    const { section, itemId } = customFieldContext;
    const items = resumeData[section].map(item => {
      if (item.id === itemId) {
        const customFields = item.customFields || [];
        return {
          ...item,
          customFields: [...customFields, { label: newCustomFieldName, value: '' }]
        };
      }
      return item;
    });
    
    setResumeData({...resumeData, [section]: items});
    setNewCustomFieldName('');
    setShowAddCustomFieldModal(false);
    
    // Show success message
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce';
    notification.innerHTML = `✓ Custom field "${newCustomFieldName}" added!`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const openCustomFieldModal = (section, itemId) => {
    setCustomFieldContext({ section, itemId });
    setShowAddCustomFieldModal(true);
  };

  const handleImport = () => {
    setIsImporting(true);
    
    try {
      if (importType === 'json') {
        const data = JSON.parse(importData);
        if (data.resumeData) {
          setResumeData(data.resumeData);
          if (data.customFields) setCustomFields(data.customFields);
          if (data.customSections) setCustomSections(data.customSections);
          if (data.sectionOrder) setSectionOrder(data.sectionOrder);
          if (data.sectionVisibility) setSectionVisibility(data.sectionVisibility);
          
          // Restore formatting settings
          if (data.formatting) {
            if (data.formatting.fontSize) setFontSize(data.formatting.fontSize);
            if (data.formatting.fontFamily) setFontFamily(data.formatting.fontFamily);
            if (data.formatting.lineSpacing) setLineSpacing(data.formatting.lineSpacing);
            if (data.formatting.sectionSpacing) setSectionSpacing(data.formatting.sectionSpacing);
            if (data.formatting.margins) setMargins(data.formatting.margins);
            if (data.formatting.headingStyle) setHeadingStyle(data.formatting.headingStyle);
            if (data.formatting.bulletStyle) setBulletStyle(data.formatting.bulletStyle);
          }
          
          // Restore AI preferences
          if (data.aiPreferences) {
            if (data.aiPreferences.selectedTone) setSelectedTone(data.aiPreferences.selectedTone);
            if (data.aiPreferences.selectedLength) setSelectedLength(data.aiPreferences.selectedLength);
          }
          
          // Restore filename if available
          if (data.resumeFileName) {
            setResumeFileName(data.resumeFileName);
          }
          
          alert('✅ Resume imported successfully with all formatting and AI preferences!');
        } else {
          alert('❌ Invalid JSON format. Please check your data.');
        }
      } else if (importType === 'linkedin') {
        // Simulate LinkedIn import
        setTimeout(() => {
          alert('📊 LinkedIn import feature coming soon! This will allow you to import your profile data directly.');
        }, 1000);
      } else if (importType === 'text') {
        // Parse plain text resume
        const lines = importData.split('\n').filter(line => line.trim());
        if (lines.length > 0) {
          setResumeData({
            ...resumeData,
            name: lines[0] || 'Your Name',
            summary: lines.slice(1, 4).join(' ') || 'Professional summary...',
          });
          alert('✅ Text imported! Please review and edit your resume.');
        }
      }
      
      setShowImportModal(false);
      setImportData('');
    } catch (error) {
      alert('❌ Import failed: ' + error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        if (file.type === 'application/json') {
          setImportData(content);
          setImportType('json');
        } else {
          setImportData(content);
          setImportType('text');
        }
      } catch (error) {
        alert('❌ Error reading file: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  const exportResume = () => {
    const exportData = {
      resumeData,
      customFields,
      customSections,
      sectionOrder,
      sectionVisibility,
      resumeFileName,
      formatting: {
        fontSize,
        fontFamily,
        lineSpacing,
        sectionSpacing,
        margins,
        headingStyle,
        bulletStyle
      },
      aiPreferences: {
        selectedTone,
        selectedLength
      },
      exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeFileName}.json`;
    link.click();
    URL.revokeObjectURL(url);
    alert('✅ Resume exported as JSON!');
  };

  // Enhanced Features Hooks
  const { currentState, saveState, undo, redo, canUndo, canRedo } = useUndoRedo(resumeData);
  const { isSaving, restoreFromAutoSave } = useAutoSave(resumeData);
  const { validateForm, getFieldError, setFieldTouched } = useFormValidation();
  const { searchQuery, setSearchQuery, searchResults, highlightText } = useSearch(resumeData);

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    undo: () => {
      const previousState = undo();
      setResumeData(previousState);
      showNotification('Undo performed', 'success');
    },
    redo: () => {
      const nextState = redo();
      setResumeData(nextState);
      showNotification('Redo performed', 'success');
    },
    save: () => {
      saveState(resumeData);
      showNotification('Resume saved', 'success');
    },
    new: () => {
      setResumeData({
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        github: '',
        website: '',
        summary: '',
        skills: [],
        experience: [],
        projects: [],
        education: [],
        certifications: []
      });
      showNotification('New resume created', 'success');
    },
    open: () => {
      const restored = restoreFromAutoSave();
      if (restored) {
        setResumeData(restored);
        showNotification('Resume restored from auto-save', 'success');
      }
    },
    export: () => setShowExportModal(true),
    search: () => setShowSearchModal(true),
    aiOptimize: () => {
      showNotification('AI optimization started', 'info');
    }
  });

  // Validation rules
  const validationRules = {
    name: { required: true, minLength: 2 },
    email: { required: true, email: true },
    phone: { required: true, phone: true },
    title: { required: true, minLength: 2 },
    summary: { required: true, minLength: 50 }
  };

  // Helper functions
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, visible: true });
  };

  const handleSave = () => {
    if (validateForm(resumeData, validationRules)) {
      saveState(resumeData);
      showNotification('Resume saved successfully!', 'success');
    } else {
      showNotification('Please fix validation errors before saving', 'error');
    }
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleSearch = () => {
    setShowSearchModal(true);
  };

  // Section rename functions
  const startRenamingSection = (sectionId) => {
    setEditingSection(sectionId);
    setTempSectionName(sectionNames[sectionId] || '');
  };

  const cancelRenaming = () => {
    setEditingSection(null);
    setTempSectionName('');
  };

  const saveSectionName = (sectionId) => {
    if (tempSectionName.trim()) {
      setSectionNames({
        ...sectionNames,
        [sectionId]: tempSectionName.trim().toUpperCase()
      });
    }
    setEditingSection(null);
    setTempSectionName('');
  };

  const handleSectionNameKeyPress = (e, sectionId) => {
    if (e.key === 'Enter') {
      saveSectionName(sectionId);
    } else if (e.key === 'Escape') {
      cancelRenaming();
    }
  };

  const currentFont = fontSizes[fontSize];
  const currentFontFamily = fontFamilies[fontFamily];
  const currentLineSpacing = lineSpacings[lineSpacing];
  const currentSectionSpacing = sectionSpacings[sectionSpacing];
  const currentMargin = marginSettings[margins];
  const currentHeadingStyle = headingStyles[headingStyle];
  const currentBullet = bulletStyles[bulletStyle];

  const renderSection = (section) => {
    if (!sectionVisibility[section]) return null;

    // Handle custom sections
    const customSection = customSections.find(s => s.id === section);
    if (customSection) {
      return (
        <div className={currentSectionSpacing}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <GripVertical size={18} className="text-gray-400 cursor-move" />
              <h3 className={`${currentFont.title} ${currentHeadingStyle} text-black uppercase tracking-wide`}>
                {customSection.name}
              </h3>
            </div>
            <button 
              onClick={() => deleteCustomSection(customSection.id)}
              className="p-2 hover:bg-red-100 rounded-xl transition-all hover:scale-110"
            >
              <Trash2 size={18} className="text-red-600" />
            </button>
          </div>
          <textarea
            className={`w-full ${currentFont.body} text-gray-700 border-2 border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none ${currentLineSpacing} transition-all`}
            rows="6"
            value={customSection.content}
            onChange={(e) => updateCustomSection(customSection.id, e.target.value)}
            placeholder="Add your custom content here..."
          />
        </div>
      );
    }

    switch(section) {
      case 'summary':
        return (
          <div className={currentSectionSpacing}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <GripVertical size={18} className="text-gray-400 cursor-move" />
                {editingSection === 'summary' ? (
                  <input
                    type="text"
                    value={tempSectionName}
                    onChange={(e) => setTempSectionName(e.target.value)}
                    onKeyPress={(e) => handleSectionNameKeyPress(e, 'summary')}
                    onBlur={() => saveSectionName('summary')}
                    className={`${currentFont.title} ${currentHeadingStyle} text-black uppercase tracking-wide bg-transparent border-b-2 border-purple-500 outline-none`}
                    autoFocus
                  />
                ) : (
                  <h3 
                    className={`${currentFont.title} ${currentHeadingStyle} text-black uppercase tracking-wide cursor-pointer hover:text-purple-600 transition-colors`}
                    onClick={() => startRenamingSection('summary')}
                    title="Click to rename"
                  >
                    {sectionNames.summary}
                  </h3>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-red-100 rounded-xl transition-all hover:scale-110">
                  <Trash2 size={18} className="text-red-600" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <textarea
                className={`w-full ${currentFont.body} text-gray-700 border-2 border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none ${currentLineSpacing} transition-all`}
                rows="4"
                value={resumeData.summary}
                onChange={(e) => setResumeData({...resumeData, summary: e.target.value})}
                placeholder="Write a compelling professional summary..."
              />
              <div className="flex justify-end">
                <button 
                  onClick={() => openAIGenerateModal('summary')}
                  className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2 font-semibold px-3 py-2 rounded-lg hover:bg-purple-50 transition-all"
                >
                  <Sparkles size={16} />
                  AI Generate
                </button>
              </div>
            </div>
          </div>
        );

      case 'skills':
        return (
          <div className={currentSectionSpacing}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <GripVertical size={18} className="text-gray-400 cursor-move" />
                {editingSection === 'skills' ? (
                  <input
                    type="text"
                    value={tempSectionName}
                    onChange={(e) => setTempSectionName(e.target.value)}
                    onKeyPress={(e) => handleSectionNameKeyPress(e, 'skills')}
                    onBlur={() => saveSectionName('skills')}
                    className={`${currentFont.title} ${currentHeadingStyle} text-black uppercase tracking-wide bg-transparent border-b-2 border-orange-500 outline-none`}
                    autoFocus
                  />
                ) : (
                  <h3 
                    className={`${currentFont.title} ${currentHeadingStyle} text-black uppercase tracking-wide cursor-pointer hover:text-orange-600 transition-colors`}
                    onClick={() => startRenamingSection('skills')}
                    title="Click to rename"
                  >
                    {sectionNames.skills}
                  </h3>
                )}
              </div>
              <button
                onClick={() => toggleSection('skills')}
                className="p-2 hover:bg-red-100 rounded-xl transition-all hover:scale-110"
                title="Remove skills section"
              >
                <Trash2 size={18} className="text-red-600" />
              </button>
            </div>
            
            {/* Skills Container */}
            <div className="p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Skills</h4>
                <button
                  onClick={() => setShowSkillInput(true)}
                  className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-orange-50 transition-all"
                >
                  <Plus size={12} />
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-300 hover:border-orange-400 transition-all group">
                    <span className="text-xs text-gray-700 font-medium">{skill}</span>
                    <button
                      onClick={() => removeSkill(idx)}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                
                {/* Inline skill input */}
                {showSkillInput && (
                  <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border-2 border-orange-400">
                    <input
                      type="text"
                      placeholder="Enter skill..."
                      className="text-xs text-gray-700 font-medium bg-transparent border-none outline-none w-24"
                      autoFocus
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (e.target.value.trim()) {
                            addSkill(e.target.value.trim());
                            setShowSkillInput(false);
                          }
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          addSkill(e.target.value.trim());
                        }
                        setShowSkillInput(false);
                      }}
                    />
                    <button
                      onClick={() => setShowSkillInput(false)}
                      className="text-red-500 hover:text-red-700 transition-all"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                
                {resumeData.skills.length === 0 && !showSkillInput && (
                  <span className="text-xs text-gray-500 italic">No skills added yet</span>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-3">
              <button 
                onClick={() => openAIGenerateModal('skills')}
                className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2 font-semibold px-3 py-2 rounded-lg hover:bg-purple-50 transition-all"
              >
                <Sparkles size={16} />
                AI Generate
              </button>
            </div>
          </div>
        );

      case 'experience':
        return (
          <div className={currentSectionSpacing}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <GripVertical size={18} className="text-gray-400 cursor-move" />
                {editingSection === 'experience' ? (
                  <input
                    type="text"
                    value={tempSectionName}
                    onChange={(e) => setTempSectionName(e.target.value)}
                    onKeyPress={(e) => handleSectionNameKeyPress(e, 'experience')}
                    onBlur={() => saveSectionName('experience')}
                    className={`${currentFont.title} ${currentHeadingStyle} text-black uppercase tracking-wide bg-transparent border-b-2 border-purple-500 outline-none`}
                    autoFocus
                  />
                ) : (
                  <h3 
                    className={`${currentFont.title} ${currentHeadingStyle} text-black uppercase tracking-wide cursor-pointer hover:text-purple-600 transition-colors`}
                    onClick={() => startRenamingSection('experience')}
                    title="Click to rename"
                  >
                    {sectionNames.experience}
                  </h3>
                )}
              </div>
              <button 
                onClick={() => addNewItem('experience')}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-all"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {resumeData.experience.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-all">
                <Briefcase size={40} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4 font-semibold">No experience added yet</p>
                <button 
                  onClick={() => addNewItem('experience')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 inline-flex items-center gap-2 font-bold transition-all hover:scale-105"
                >
                  <Plus size={18} />
                  Add Experience
                </button>
              </div>
            )}

            {resumeData.experience.map((exp) => (
              <div key={exp.id} className="mb-6 group p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-white">
                <div className="flex items-start gap-3 mb-4">
                  <GripVertical size={18} className="text-gray-400 cursor-move mt-2" />
                  <div className="flex-1 space-y-3">
                    <input
                      className={`font-bold ${currentFont.body} text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl px-4 py-2 w-full transition-all`}
                      value={exp.company}
                      onChange={(e) => updateField('experience', exp.id, 'company', e.target.value)}
                      placeholder="Company Name"
                    />
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <input 
                        className="border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-3 py-2 transition-all font-medium" 
                        value={exp.period}
                        onChange={(e) => updateField('experience', exp.id, 'period', e.target.value)}
                        placeholder="Start Date"
                      />
                      <span className="font-bold text-gray-400">→</span>
                      <input 
                        className="border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-3 py-2 transition-all font-medium" 
                        value={exp.endPeriod}
                        onChange={(e) => updateField('experience', exp.id, 'endPeriod', e.target.value)}
                        placeholder="End Date"
                      />
                    </div>
                    <input
                      className={`text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-4 py-2 w-full transition-all`}
                      value={exp.location}
                      onChange={(e) => updateField('experience', exp.id, 'location', e.target.value)}
                      placeholder="Location"
                    />
                    <input
                      className={`font-semibold ${currentFont.body} text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-xl px-4 py-2 w-full transition-all`}
                      value={exp.role}
                      onChange={(e) => updateField('experience', exp.id, 'role', e.target.value)}
                      placeholder="Job Title"
                    />
                    
                    {/* Custom fields for this experience */}
                    {exp.customFields && exp.customFields.map((cf, cfIdx) => (
                      <div key={cfIdx} className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 min-w-[100px]">{cf.label}:</label>
                        <input
                          className="text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-3 py-2 w-48 transition-all"
                          value={cf.value}
                          onChange={(e) => {
                            const newCustomFields = [...exp.customFields];
                            newCustomFields[cfIdx].value = e.target.value;
                            updateField('experience', exp.id, 'customFields', newCustomFields);
                          }}
                          placeholder="Enter value..."
                        />
                      </div>
                    ))}
                    
                    <button
                      onClick={() => openCustomFieldModal('experience', exp.id)}
                      className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all w-full"
                    >
                      <Plus size={16} />
                      Add Custom Field
                    </button>

                    <div className="space-y-3 mt-4">
                      {exp.bullets && exp.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex items-start gap-3 group/bullet bg-gray-50 p-3 rounded-xl hover:bg-blue-50 transition-all">
                          <GripVertical size={16} className="text-gray-400 mt-2 flex-shrink-0" />
                          <span className={`text-sm text-blue-600 mt-2 font-bold ${currentFont.body}`}>{currentBullet}</span>
                          <textarea
                            className={`flex-1 text-sm text-gray-700 ${currentLineSpacing} border-2 border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none transition-all bg-white`}
                            rows="2"
                            value={bullet}
                            onChange={(e) => updateBullet('experience', exp.id, idx, e.target.value)}
                            placeholder="Describe your achievement..."
                          />
                          <button
                            onClick={() => deleteBullet('experience', exp.id, idx)}
                            className="opacity-0 group-hover/bullet:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button 
                        onClick={() => addBullet('experience', exp.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold px-3 py-2 rounded-lg hover:bg-blue-50 transition-all"
                      >
                        <Plus size={16} />
                        Add Bullet
                      </button>
                      <button 
                        onClick={() => openAIGenerateModal('experience', exp.id)}
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2 font-semibold px-3 py-2 rounded-lg hover:bg-purple-50 transition-all"
                      >
                        <Sparkles size={16} />
                        AI Generate
                      </button>
                    </div>

                    {/* Skills Section */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Environment</h4>
                        <button
                          onClick={() => {
                            const newSkillInput = document.getElementById(`exp-skill-input-${exp.id}`);
                            if (newSkillInput) {
                              newSkillInput.style.display = 'flex';
                              newSkillInput.querySelector('input').focus();
                            }
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-blue-50 transition-all"
                        >
                          <Plus size={12} />
                          Add Skill
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(exp.skills || []).map((skill, skillIdx) => (
                          <div key={skillIdx} className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-300 hover:border-blue-400 transition-all group">
                            <span className="text-xs text-gray-700 font-medium">{skill}</span>
                            <button
                              onClick={() => removeSectionSkill('experience', exp.id, skillIdx)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        
                        {/* Inline skill input for experience */}
                        <div id={`exp-skill-input-${exp.id}`} className="hidden items-center gap-1 bg-white px-3 py-1.5 rounded-lg border-2 border-blue-400">
                          <input
                            type="text"
                            placeholder="Enter skill..."
                            className="text-xs text-gray-700 font-medium bg-transparent border-none outline-none w-20"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                if (e.target.value.trim()) {
                                  addSectionSkill('experience', exp.id, e.target.value.trim());
                                  e.target.value = '';
                                  e.target.parentElement.style.display = 'none';
                                }
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value.trim()) {
                                addSectionSkill('experience', exp.id, e.target.value.trim());
                              }
                              e.target.parentElement.style.display = 'none';
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.target.parentElement.style.display = 'none';
                            }}
                            className="text-red-500 hover:text-red-700 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        
                        {(!exp.skills || exp.skills.length === 0) && (
                          <span className="text-xs text-gray-500 italic">No skills added yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem('experience', exp.id)}
                    className="opacity-0 group-hover:opacity-100 p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all hover:scale-110"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'projects':
        return (
          <div className={currentSectionSpacing}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <GripVertical size={18} className="text-gray-400 cursor-move" />
                <h3 className={`${currentFont.title} ${currentHeadingStyle} text-black uppercase tracking-wide`}>PROJECT HIGHLIGHTS</h3>
              </div>
              <button 
                onClick={() => addNewItem('projects')}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-all"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {resumeData.projects.map((project) => (
              <div key={project.id} className="mb-5 p-6 border-2 border-gray-200 rounded-2xl group hover:border-purple-300 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 bg-white">
                <div className="flex items-start gap-3">
                  <GripVertical size={18} className="text-gray-400 cursor-move mt-2" />
                  <div className="flex-1 space-y-3">
                    <input 
                      className={`font-bold ${currentFont.body} text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 rounded-xl px-4 py-2 w-full transition-all`} 
                      value={project.name}
                      onChange={(e) => updateField('projects', project.id, 'name', e.target.value)}
                      placeholder="Project Name"
                    />
                    <input 
                      className="text-sm text-gray-700 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 rounded-lg px-4 py-2 w-full transition-all" 
                      value={project.description}
                      onChange={(e) => updateField('projects', project.id, 'description', e.target.value)}
                      placeholder="Brief description..."
                    />
                    <div className="relative">
                      <input 
                        className="text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 rounded-lg px-4 py-2 w-full transition-all" 
                        value={project.link || ''}
                        onChange={(e) => updateField('projects', project.id, 'link', e.target.value)}
                        placeholder="Project URL (optional)"
                      />
                      {project.link && (
                        <button
                          onClick={() => handleLinkClick(project.link)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded transition-all"
                          title="Open link"
                        >
                          <Link size={14} />
                        </button>
                      )}
                    </div>
                    
                    {/* Custom fields for this project */}
                    {project.customFields && project.customFields.map((cf, cfIdx) => (
                      <div key={cfIdx} className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 min-w-[100px]">{cf.label}:</label>
                        <input
                          className="text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 rounded-lg px-3 py-2 w-48 transition-all"
                          value={cf.value}
                          onChange={(e) => {
                            const newCustomFields = [...project.customFields];
                            newCustomFields[cfIdx].value = e.target.value;
                            updateField('projects', project.id, 'customFields', newCustomFields);
                          }}
                          placeholder="Enter value..."
                        />
                      </div>
                    ))}
                    
                    <button
                      onClick={() => openCustomFieldModal('projects', project.id)}
                      className="text-sm text-gray-600 hover:text-purple-600 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all w-full"
                    >
                      <Plus size={16} />
                      Add Custom Field
                    </button>
                    
                    {project.bullets && project.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-3 group/bullet bg-gray-50 p-3 rounded-xl hover:bg-purple-50 transition-all">
                        <span className={`text-sm text-purple-600 mt-2 font-bold ${currentFont.body}`}>{currentBullet}</span>
                        <textarea
                          className={`flex-1 text-sm text-gray-700 ${currentLineSpacing} border-2 border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none transition-all bg-white`}
                          rows="2"
                          value={bullet}
                          onChange={(e) => updateBullet('projects', project.id, idx, e.target.value)}
                        />
                        <button
                          onClick={() => deleteBullet('projects', project.id, idx)}
                          className="opacity-0 group-hover/bullet:opacity-100 p-2 hover:bg-red-100 rounded-lg transition-all"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-2 mt-4">
                      <button 
                        onClick={() => addBullet('projects', project.id)}
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2 font-semibold px-3 py-2 rounded-lg hover:bg-purple-50 transition-all"
                      >
                        <Plus size={16} />
                        Add Bullet
                      </button>
                      <button 
                        onClick={() => openAIGenerateModal('projects', project.id)}
                        className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-2 font-semibold px-3 py-2 rounded-lg hover:bg-purple-50 transition-all"
                      >
                        <Sparkles size={16} />
                        AI Generate
                      </button>
                    </div>

                    {/* Skills Section */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Skills</h4>
                        <button
                          onClick={() => {
                            const newSkillInput = document.getElementById(`proj-skill-input-${project.id}`);
                            if (newSkillInput) {
                              newSkillInput.style.display = 'flex';
                              newSkillInput.querySelector('input').focus();
                            }
                          }}
                          className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-purple-50 transition-all"
                        >
                          <Plus size={12} />
                          Add Skill
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(project.skills || []).map((skill, skillIdx) => (
                          <div key={skillIdx} className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-300 hover:border-purple-400 transition-all group">
                            <span className="text-xs text-gray-700 font-medium">{skill}</span>
                            <button
                              onClick={() => removeSectionSkill('projects', project.id, skillIdx)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        
                        {/* Inline skill input for projects */}
                        <div id={`proj-skill-input-${project.id}`} className="hidden items-center gap-1 bg-white px-3 py-1.5 rounded-lg border-2 border-purple-400">
                          <input
                            type="text"
                            placeholder="Enter skill..."
                            className="text-xs text-gray-700 font-medium bg-transparent border-none outline-none w-20"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                if (e.target.value.trim()) {
                                  addSectionSkill('projects', project.id, e.target.value.trim());
                                  e.target.value = '';
                                  e.target.parentElement.style.display = 'none';
                                }
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value.trim()) {
                                addSectionSkill('projects', project.id, e.target.value.trim());
                              }
                              e.target.parentElement.style.display = 'none';
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.target.parentElement.style.display = 'none';
                            }}
                            className="text-red-500 hover:text-red-700 transition-all"
                          >
                            <X size={12} />
                          </button>
                        </div>
                        
                        {(!project.skills || project.skills.length === 0) && (
                          <span className="text-xs text-gray-500 italic">No skills added yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem('projects', project.id)}
                    className="opacity-0 group-hover:opacity-100 p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all hover:scale-110"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'education':
        return (
          <div className={currentSectionSpacing}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <GripVertical size={18} className="text-gray-400 cursor-move" />
                <h3 className={`${currentFont.title} ${currentHeadingStyle} text-black uppercase tracking-wide`}>EDUCATION</h3>
              </div>
              <button 
                onClick={() => addNewItem('education')}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-all"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {resumeData.education.map((edu) => (
              <div key={edu.id} className="mb-5 p-6 border-2 border-gray-200 rounded-2xl group hover:border-green-300 hover:shadow-xl hover:shadow-green-500/10 transition-all duration-300 bg-white">
                <div className="flex items-start gap-3">
                  <GripVertical size={18} className="text-gray-400 cursor-move mt-2" />
                  <div className="flex-1 space-y-3">
                    <input 
                      className={`font-bold ${currentFont.body} text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 rounded-xl px-4 py-2 w-full transition-all`} 
                      value={edu.school}
                      onChange={(e) => updateField('education', edu.id, 'school', e.target.value)}
                      placeholder="School Name"
                    />
                    <input 
                      className={`font-semibold ${currentFont.body} text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 rounded-xl px-4 py-2 w-full transition-all`} 
                      value={edu.degree}
                      onChange={(e) => updateField('education', edu.id, 'degree', e.target.value)}
                      placeholder="Degree"
                    />
                    <div className="flex items-center gap-3 text-sm">
                      <input 
                        className="border-2 border-gray-200 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 rounded-lg px-3 py-2 transition-all font-medium" 
                        value={edu.startDate}
                        onChange={(e) => updateField('education', edu.id, 'startDate', e.target.value)}
                        placeholder="Start"
                      />
                      <span className="font-bold text-gray-400">→</span>
                      <input 
                        className="border-2 border-gray-200 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 rounded-lg px-3 py-2 transition-all font-medium" 
                        value={edu.endDate}
                        onChange={(e) => updateField('education', edu.id, 'endDate', e.target.value)}
                        placeholder="End"
                      />
                    </div>
                    
                    {/* Custom fields for this education */}
                    {edu.customFields && edu.customFields.map((cf, cfIdx) => (
                      <div key={cfIdx} className="flex items-center gap-2">
                        <label className="text-sm font-medium text-gray-700 min-w-[100px]">{cf.label}:</label>
                        <input
                          className="text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 rounded-lg px-3 py-2 w-48 transition-all"
                          value={cf.value}
                          onChange={(e) => {
                            const newCustomFields = [...edu.customFields];
                            newCustomFields[cfIdx].value = e.target.value;
                            updateField('education', edu.id, 'customFields', newCustomFields);
                          }}
                          placeholder="Enter value..."
                        />
                      </div>
                    ))}
                    
                    <button
                      onClick={() => openCustomFieldModal('education', edu.id)}
                      className="text-sm text-gray-600 hover:text-green-600 flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all w-full"
                    >
                      <Plus size={16} />
                      Add Custom Field
                    </button>
                  </div>
                  <button
                    onClick={() => deleteItem('education', edu.id)}
                    className="opacity-0 group-hover:opacity-100 p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all hover:scale-110"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case 'certifications':
        return (
          <div className={currentSectionSpacing}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <GripVertical size={18} className="text-gray-400 cursor-move" />
                <h3 className={`${currentFont.title} ${currentHeadingStyle} text-black uppercase tracking-wide`}>CERTIFICATIONS</h3>
              </div>
              <button 
                onClick={() => addNewItem('certifications')}
                className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition-all"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {resumeData.certifications.map((cert) => (
              <div key={cert.id} className="mb-4 p-5 border-2 border-gray-200 rounded-2xl group hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 bg-white">
                <div className="flex items-start gap-3">
                  <GripVertical size={18} className="text-gray-400 cursor-move mt-2" />
                  <div className="flex-1 space-y-2">
                    <input 
                      className={`font-bold ${currentFont.body} text-gray-900 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 rounded-xl px-4 py-2 w-full transition-all`} 
                      value={cert.name}
                      onChange={(e) => updateField('certifications', cert.id, 'name', e.target.value)}
                      placeholder="Certification Name"
                    />
                    <input 
                      className="text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 rounded-lg px-4 py-2 w-full transition-all" 
                      value={cert.issuer}
                      onChange={(e) => updateField('certifications', cert.id, 'issuer', e.target.value)}
                      placeholder="Issuing Organization"
                    />
                    <div className="relative">
                      <input 
                        className="text-sm text-gray-600 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 rounded-lg px-4 py-2 w-full transition-all" 
                        value={cert.link || ''}
                        onChange={(e) => updateField('certifications', cert.id, 'link', e.target.value)}
                        placeholder="Certificate URL (optional)"
                      />
                      {cert.link && (
                        <button
                          onClick={() => handleLinkClick(cert.link)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded transition-all"
                          title="Open certificate link"
                        >
                          <Link size={14} />
                        </button>
                      )}
                    </div>

                    {/* Skills Section */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Skills</h4>
                        <button
                          onClick={() => {
                            const newSkillInput = document.getElementById(`cert-skill-input-${cert.id}`);
                            if (newSkillInput) {
                              newSkillInput.style.display = 'flex';
                              newSkillInput.querySelector('input').focus();
                            }
                          }}
                          className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-orange-50 transition-all"
                        >
                          <Plus size={10} />
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(cert.skills || []).map((skill, skillIdx) => (
                          <div key={skillIdx} className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-300 hover:border-orange-400 transition-all group">
                            <span className="text-xs text-gray-700 font-medium">{skill}</span>
                            <button
                              onClick={() => removeSectionSkill('certifications', cert.id, skillIdx)}
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        
                        {/* Inline skill input for certifications */}
                        <div id={`cert-skill-input-${cert.id}`} className="hidden items-center gap-1 bg-white px-2 py-1 rounded-lg border-2 border-orange-400">
                          <input
                            type="text"
                            placeholder="Enter skill..."
                            className="text-xs text-gray-700 font-medium bg-transparent border-none outline-none w-16"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                if (e.target.value.trim()) {
                                  addSectionSkill('certifications', cert.id, e.target.value.trim());
                                  e.target.value = '';
                                  e.target.parentElement.style.display = 'none';
                                }
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value.trim()) {
                                addSectionSkill('certifications', cert.id, e.target.value.trim());
                              }
                              e.target.parentElement.style.display = 'none';
                            }}
                          />
                          <button
                            onClick={(e) => {
                              e.target.parentElement.style.display = 'none';
                            }}
                            className="text-red-500 hover:text-red-700 transition-all"
                          >
                            <X size={10} />
                          </button>
                        </div>
                        
                        {(!cert.skills || cert.skills.length === 0) && (
                          <span className="text-xs text-gray-500 italic">No skills added yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteItem('certifications', cert.id)}
                    className="opacity-0 group-hover:opacity-100 p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-all hover:scale-110"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Sidebar */}
        <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl flex flex-col`}>
        <div className={`${sidebarCollapsed ? 'p-3' : 'p-6'} border-b border-gray-100/50`}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles size={20} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">RoleReady</h1>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <p className="text-sm text-gray-600 pl-12">AI-Powered Resume Builder</p>
          )}
        </div>
        
        <nav className={`flex-1 ${sidebarCollapsed ? 'p-2' : 'p-4'} space-y-2 overflow-y-auto`}>
          <button 
            onClick={() => handleTabChange('home')} 
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'home' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
            title={sidebarCollapsed ? 'Home' : ''}
          >
            <HomeIcon size={20} />
            {!sidebarCollapsed && <span className="font-semibold">Home</span>}
          </button>
          <button 
            onClick={() => setShowUserProfile(true)} 
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-gray-700 hover:bg-white/60 hover:shadow-md"
            title={sidebarCollapsed ? 'User Profile' : ''}
          >
            <User size={20} />
            {!sidebarCollapsed && <span className="font-semibold">Profile</span>}
          </button>
          <button 
            onClick={() => handleTabChange('storage')} 
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'storage' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
            title={sidebarCollapsed ? 'Cloud Storage' : ''}
          >
            <Cloud size={20} />
            {!sidebarCollapsed && <span className="font-semibold">Cloud Storage</span>}
          </button>
          <button 
            onClick={() => handleTabChange('editor')} 
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'editor' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
            title={sidebarCollapsed ? 'Resume Editor' : ''}
          >
            <Edit size={20} />
            {!sidebarCollapsed && <span className="font-semibold">Resume Editor</span>}
          </button>
          <button 
            onClick={() => handleTabChange('templates')} 
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'templates' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
            title={sidebarCollapsed ? 'Templates' : ''}
          >
            <Layout size={20} />
            {!sidebarCollapsed && <span className="font-semibold">Templates</span>}
          </button>
          <button 
            onClick={() => handleTabChange('tracker')} 
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'tracker' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
            title={sidebarCollapsed ? 'Job Tracker' : ''}
          >
            <Briefcase size={20} />
            {!sidebarCollapsed && <span className="font-semibold">Job Tracker</span>}
          </button>
          <button 
            onClick={() => handleTabChange('discussion')} 
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'discussion' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
            title={sidebarCollapsed ? 'Discussion' : ''}
          >
            <MessageSquare size={20} />
            {!sidebarCollapsed && <span className="font-semibold">Discussion</span>}
          </button>
          <button 
            onClick={() => handleTabChange('gmail')} 
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3.5'} rounded-xl transition-all duration-300 ${activeTab === 'gmail' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 scale-102' : 'text-gray-700 hover:bg-white/60 hover:shadow-md'}`}
            title={sidebarCollapsed ? 'Gmail' : ''}
          >
            <Mail size={20} />
            {!sidebarCollapsed && <span className="font-semibold">Gmail</span>}
          </button>
        </nav>
        
        <div className={`${sidebarCollapsed ? 'p-2' : 'p-4'} border-t border-gray-100/50`}>
          <button 
            onClick={() => setShowNewResumeModal(true)} 
            className={`w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-3.5'} rounded-xl hover:shadow-lg hover:shadow-blue-500/40 transition-all duration-300 hover:scale-105 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} font-semibold mb-2`}
            title={sidebarCollapsed ? 'New Resume' : ''}
          >
            <Plus size={20} />
            {!sidebarCollapsed && <span>New Resume</span>}
          </button>
          <button 
            onClick={() => setShowImportModal(true)} 
            className={`w-full border-2 border-gray-200 bg-white text-gray-700 ${sidebarCollapsed ? 'px-2 py-3' : 'px-4 py-2.5'} rounded-xl hover:border-green-500 hover:shadow-md transition-all duration-300 hover:scale-105 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-center gap-2'} font-semibold ${sidebarCollapsed ? 'text-base' : 'text-sm'}`}
            title={sidebarCollapsed ? 'Import Resume' : ''}
          >
            <Upload size={18} />
            {!sidebarCollapsed && <span>Import Resume</span>}
          </button>
        </div>
      </div>







      {/* ADD CUSTOM FIELD MODAL */}
      {showAddFieldModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Add Custom Field</h3>
              <button onClick={() => setShowAddFieldModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Field Name</label>
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  placeholder="e.g., Portfolio, Twitter, etc."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Icon Type</label>
                <select
                  value={newFieldIcon}
                  onChange={(e) => setNewFieldIcon(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all cursor-pointer"
                >
                  <option value="link">Link</option>
                  <option value="mail">Email</option>
                  <option value="phone">Phone</option>
                  <option value="globe">Website</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="github">GitHub</option>
                  <option value="twitter">Twitter</option>
                </select>
              </div>
              <button
                onClick={addCustomField}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
              >
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM SECTION MODAL */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Add Custom Section</h3>
              <button onClick={() => setShowAddSectionModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Section Name</label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., Awards, Publications, Volunteer Work"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Initial Content (Optional)</label>
                <textarea
                  value={newSectionContent}
                  onChange={(e) => setNewSectionContent(e.target.value)}
                  placeholder="You can add content now or later..."
                  rows="4"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all resize-none"
                />
              </div>
              <button
                onClick={addCustomSection}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOM FIELD TO ITEM MODAL */}
      {showAddCustomFieldModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Add Custom Field</h3>
              <button onClick={() => {
                setShowAddCustomFieldModal(false);
                setNewCustomFieldName('');
              }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Field Name</label>
                <input
                  type="text"
                  value={newCustomFieldName}
                  onChange={(e) => setNewCustomFieldName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCustomFieldToItem()}
                  placeholder="e.g., Team Size, Technologies Used, Budget"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                  autoFocus
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Examples:</strong> Team Size, Technologies, Budget, Reports To, Duration, Tools Used
                </p>
              </div>
              <button
                onClick={addCustomFieldToItem}
                disabled={!newCustomFieldName.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                <Plus size={18} className="inline mr-2" />
                Add Field
              </button>
            </div>
          </div>
        </div>
      )}


      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Import Resume</h3>
              <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Import Type Selection */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => setImportType('json')}
                className={`p-4 border-2 rounded-xl transition-all ${importType === 'json' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
              >
                <Database size={24} className={`mx-auto mb-2 ${importType === 'json' ? 'text-blue-600' : 'text-gray-400'}`} />
                <p className="text-sm font-semibold">JSON File</p>
                <p className="text-xs text-gray-500 mt-1">Exported resume</p>
              </button>
              
              <button
                onClick={() => setImportType('file')}
                className={`p-4 border-2 rounded-xl transition-all ${importType === 'file' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'}`}
              >
                <FileUp size={24} className={`mx-auto mb-2 ${importType === 'file' ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-sm font-semibold">Upload File</p>
                <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT</p>
              </button>
              
              <button
                onClick={() => setImportType('linkedin')}
                className={`p-4 border-2 rounded-xl transition-all ${importType === 'linkedin' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300'}`}
              >
                <Linkedin size={24} className={`mx-auto mb-2 ${importType === 'linkedin' ? 'text-purple-600' : 'text-gray-400'}`} />
                <p className="text-sm font-semibold">LinkedIn</p>
                <p className="text-xs text-gray-500 mt-1">Import profile</p>
              </button>
            </div>

            {/* Import Content Area */}
            {importType === 'json' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Paste JSON Data</label>
                    <button
                      onClick={() => {
                        const sample = {
                          resumeData: {
                            name: "John Doe",
                            email: "john@example.com",
                            phone: "+1 234 567 8900",
                            summary: "Experienced professional...",
                            skills: ["JavaScript", "React", "Node.js"],
                            experience: [],
                            education: [],
                            projects: [],
                            certifications: []
                          },
                          customFields: [],
                          customSections: [],
                          formatting: {
                            fontSize: "ats11pt",
                            fontFamily: "arial",
                            lineSpacing: "normal",
                            sectionSpacing: "medium",
                            margins: "normal",
                            headingStyle: "bold",
                            bulletStyle: "disc"
                          },
                          aiPreferences: {
                            selectedTone: "professional",
                            selectedLength: "concise"
                          }
                        };
                        setImportData(JSON.stringify(sample, null, 2));
                      }}
                      className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all font-semibold"
                    >
                      Load Sample
                    </button>
                  </div>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='{"resumeData": {...}, "customFields": [...], ...}'
                    rows="10"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all resize-none font-mono text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <AlertCircle size={16} className="text-blue-600 flex-shrink-0" />
                  <p>Paste the JSON data from a previously exported resume file. Click "Load Sample" to see the format.</p>
                </div>
              </div>
            )}

            {importType === 'file' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                  <input
                    type="file"
                    accept=".json,.txt,.pdf,.docx"
                    onChange={handleFileImport}
                    className="hidden"
                    id="file-import"
                  />
                  <label htmlFor="file-import" className="cursor-pointer">
                    <Upload size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-lg font-semibold text-gray-700 mb-1">Click to upload</p>
                    <p className="text-sm text-gray-500">or drag and drop</p>
                    <p className="text-xs text-gray-400 mt-2">JSON, TXT, PDF, or DOCX (up to 10MB)</p>
                  </label>
                </div>
                {importData && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700 font-semibold">✓ File loaded successfully!</p>
                    <p className="text-xs text-gray-600 mt-1">Preview:</p>
                    <pre className="text-xs text-gray-700 mt-2 overflow-auto max-h-32 bg-white p-2 rounded">
                      {importData.substring(0, 200)}...
                    </pre>
                  </div>
                )}
              </div>
            )}

            {importType === 'linkedin' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-purple-200 rounded-xl p-6 text-center">
                  <Linkedin size={48} className="mx-auto text-purple-600 mb-3" />
                  <h4 className="text-lg font-bold text-gray-800 mb-2">LinkedIn Import</h4>
                  <p className="text-sm text-gray-600 mb-4">Connect your LinkedIn profile to automatically import your work experience, education, and skills.</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                    <Linkedin size={18} className="inline mr-2" />
                    Connect LinkedIn
                  </button>
                </div>
                <div className="flex items-start gap-2 text-xs text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <AlertCircle size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                  <p><strong>Coming Soon:</strong> This feature is under development. You'll be able to import your LinkedIn profile data directly into your resume.</p>
                </div>
              </div>
            )}

            {importType === 'text' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Paste Resume Text</label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your resume text here..."
                    rows="12"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all resize-none"
                  />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                  <AlertCircle size={16} className="text-green-600 flex-shrink-0" />
                  <p>We'll parse your text and extract key information. You may need to adjust the formatting afterwards.</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isImporting || (!importData && importType !== 'linkedin')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
              >
                {isImporting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={18} className="inline mr-2" />
                    Import Resume
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT - EDITOR VIEW */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'editor' && (
          <>
            <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 py-4 flex justify-between items-center shadow-sm relative z-50">
              <div className="flex items-center gap-4">
                {isMobile && (
                  <button 
                    onClick={() => setShowMobileMenu(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Menu size={20} />
                  </button>
                )}
              <div>
                <h2 className="font-bold text-xl text-gray-800">Resume Editor</h2>
                <p className="text-sm text-gray-500">Build your perfect resume</p>
                </div>
                {isSaving && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleExport}
                  className="px-4 py-2 border bg-white rounded-lg text-sm hover:bg-gray-50"
                >
                  <Download size={16} className="inline mr-1" />Export
                </button>
                <button 
                  onClick={undo}
                  disabled={!canUndo}
                  className="px-4 py-2 border bg-white rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  <Undo size={16} className="inline mr-1" />Undo
                </button>
                <button 
                  onClick={redo}
                  disabled={!canRedo}
                  className="px-4 py-2 border bg-white rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  <Redo size={16} className="inline mr-1" />Redo
                </button>
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="px-5 py-2.5 border-2 border-gray-200 bg-white rounded-xl text-sm font-semibold hover:border-green-500 hover:shadow-md transition-all duration-300 hover:scale-105 flex items-center gap-2"
                >
                  <Upload size={18} />
                  Import
                </button>
                <button 
                  onClick={() => {
                    if (!showRightPanel) {
                      // Opening AI panel - save current sidebar state and collapse it
                      setPreviousSidebarState(sidebarCollapsed);
                      setSidebarCollapsed(true);
                    } else {
                      // Closing AI panel - restore previous sidebar state
                      setSidebarCollapsed(previousSidebarState);
                    }
                    setShowRightPanel(!showRightPanel);
                  }} 
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 flex items-center gap-2"
                >
                  <Sparkles size={18} />
                  AI Assistant
                </button>
                <button 
                  onClick={saveResume} 
                  className="px-5 py-2.5 border-2 border-gray-200 bg-white rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 hover:border-blue-500 hover:shadow-md hover:scale-105"
                >
                  <Save size={18} />
                  Save
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar - Section Controls */}
              <div className="w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 overflow-y-auto p-6">
                {/* File Name Configuration */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm">
                      <FileText size={16} className="text-blue-600" />
                      File Name
                    </h3>
                    <button
                      onClick={() => setResumeFileName(generateSmartFileName())}
                      className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-110"
                      title="Generate Smart Filename"
                    >
                      <Sparkles size={12} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={resumeFileName}
                    onChange={(e) => setResumeFileName(e.target.value)}
                    placeholder="Enter filename..."
                    className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all bg-white/90"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 AI generates: Name_Title_YYYY-MM format
                  </p>
                </div>

                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                    <Layers size={20} className="text-purple-600" />
                    Sections
                  </h3>
                  <button
                    onClick={() => setShowAddSectionModal(true)}
                    className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-lg transition-all hover:scale-110"
                    title="Add Custom Section"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  {sectionOrder.map((section, index) => {
                    const isCustom = customSections.find(s => s.id === section);
                    const displayName = isCustom ? isCustom.name : section;
                    
                    return (
                      <div key={section} className="p-3 border-2 border-gray-200 rounded-xl flex items-center justify-between group hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:border-purple-300 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleSection(section)} className="transition-transform hover:scale-110">
                            {sectionVisibility[section] ? (
                              <Eye size={18} className="text-blue-600" />
                            ) : (
                              <EyeOff size={18} className="text-gray-400" />
                            )}
                          </button>
                          <span className="text-sm font-semibold capitalize text-gray-700">
                            {displayName}
                            {isCustom && <span className="ml-2 text-xs text-purple-600">(Custom)</span>}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => moveSection(index, 'up')} 
                            disabled={index === 0} 
                            className="p-1.5 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button 
                            onClick={() => moveSection(index, 'down')} 
                            disabled={index === sectionOrder.length - 1} 
                            className="p-1.5 hover:bg-white rounded-lg disabled:opacity-30 transition-all"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-8">
                  <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2 text-lg">
                    <Palette size={20} className="text-purple-600" />
                    Formatting
                  </h3>
                  <div className="space-y-5">
                    {/* Font Family */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wide flex items-center gap-2">
                        <Type size={14} />
                        Font Family
                      </label>
                      <select 
                        value={fontFamily} 
                        onChange={(e) => setFontFamily(e.target.value)} 
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer"
                      >
                        {Object.keys(fontFamilies).map(font => (
                          <option key={font} value={font}>
                            {fontFamilies[font].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wide">
                        Font Size
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(fontSizes).map(size => (
                          <button
                            key={size}
                            onClick={() => setFontSize(size)}
                            className={`p-2 rounded-lg text-left transition-all border-2 ${
                              fontSize === size 
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md border-transparent' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
                            }`}
                          >
                            <div className="text-xs font-semibold leading-tight">
                              {fontSizes[size].label}
                            </div>
                            {fontSizes[size].ats && (
                              <div className="text-xs opacity-80 mt-1">✓ ATS</div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>


                    {/* Line Spacing */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wide">Line Spacing</label>
                      <select 
                        value={lineSpacing} 
                        onChange={(e) => setLineSpacing(e.target.value)} 
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer"
                      >
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="relaxed">Relaxed</option>
                        <option value="loose">Loose</option>
                      </select>
                    </div>

                    {/* Section Spacing */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wide">Section Spacing</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['tight', 'medium', 'loose'].map(spacing => (
                          <button
                            key={spacing}
                            onClick={() => setSectionSpacing(spacing)}
                            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                              sectionSpacing === spacing 
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Margins */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wide">Page Margins</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['narrow', 'normal', 'wide'].map(margin => (
                          <button
                            key={margin}
                            onClick={() => setMargins(margin)}
                            className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                              margins === margin 
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {margin.charAt(0).toUpperCase() + margin.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Heading Style */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wide">Heading Weight</label>
                      <select 
                        value={headingStyle} 
                        onChange={(e) => setHeadingStyle(e.target.value)} 
                        className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all cursor-pointer"
                      >
                        <option value="bold">Extra Bold</option>
                        <option value="semibold">Bold</option>
                        <option value="normal">Semi-Bold</option>
                        <option value="light">Medium</option>
                      </select>
                    </div>

                    {/* Bullet Style */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 mb-2 block uppercase tracking-wide">Bullet Style</label>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(bulletStyles).map(([key, symbol]) => (
                          <button
                            key={key}
                            onClick={() => setBulletStyle(key)}
                            className={`py-3 px-2 rounded-lg text-lg font-semibold transition-all ${
                              bulletStyle === key 
                                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {symbol}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset Button */}
                    <button
                      onClick={() => {
                        setFontFamily('arial');
                        setFontSize('ats11pt');
                        setLineSpacing('normal');
                        setSectionSpacing('medium');
                        setMargins('normal');
                        setHeadingStyle('bold');
                        setBulletStyle('disc');
                      }}
                      className="w-full py-2.5 px-4 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center gap-2"
                    >
                      <History size={16} />
                      Reset to Default
                    </button>
                  </div>
                </div>
              </div>

              {/* Center - Resume */}
              <div className={`flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-10 ${showRightPanel ? (isMobile ? 'mr-0' : 'mr-80') : 'mr-0'}`}>
                <div ref={resumeElementRef} className={`w-full bg-white rounded-2xl shadow-2xl ${currentMargin} border border-gray-100 ${currentFontFamily.class} ${currentLineSpacing}`}>
                  <input 
                    className={`${currentFont.name} ${currentHeadingStyle} text-gray-900 w-full border-none outline-none focus:ring-4 focus:ring-blue-300/50 rounded-xl px-3 py-2 mb-4 transition-all`} 
                    value={resumeData.name} 
                    onChange={(e) => {
                      setResumeData({...resumeData, name: e.target.value});
                      setFieldTouched('name');
                    }}
                    placeholder="Your Name" 
                  />
                  {getFieldError('name') && (
                    <div className="text-red-500 text-sm mb-2">{getFieldError('name')[0]}</div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-3 text-sm mb-10">
                    {['email', 'phone', 'location', 'linkedin', 'github', 'website'].map((field, idx) => (
                      <div key={field} className="flex items-center gap-2 group">
                        {idx === 0 && <Mail size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        {idx === 1 && <Phone size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        {idx === 2 && <MapPin size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        {idx === 3 && <Linkedin size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        {idx === 4 && <Github size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        {idx === 5 && <Globe size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        <input 
                          className="flex-1 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 rounded-lg px-3 py-2 transition-all" 
                          value={resumeData[field]} 
                          onChange={(e) => {
                            setResumeData({...resumeData, [field]: e.target.value});
                            setFieldTouched(field);
                          }}
                          placeholder={field.charAt(0).toUpperCase() + field.slice(1)} 
                        />
                        {getFieldError(field) && (
                          <div className="text-red-500 text-xs mt-1">{getFieldError(field)[0]}</div>
                        )}
                      </div>
                    ))}
                    
                    {/* Custom Fields */}
                    {customFields.map((field) => (
                      <div key={field.id} className="flex items-center gap-2 group">
                        {field.icon === 'link' && <Link size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        {field.icon === 'mail' && <Mail size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        {field.icon === 'phone' && <Phone size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        {field.icon === 'globe' && <Globe size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        {field.icon === 'linkedin' && <Linkedin size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        {field.icon === 'github' && <Github size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />}
                        <input 
                          className="flex-1 border-2 border-gray-200 outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 rounded-lg px-3 py-2 transition-all" 
                          value={resumeData[field.name] || ''} 
                          onChange={(e) => setResumeData({...resumeData, [field.name]: e.target.value})} 
                          placeholder={field.label} 
                        />
                        <button
                          onClick={() => deleteCustomField(field.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded-lg transition-all"
                        >
                          <X size={14} className="text-red-600" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Add Custom Field Button */}
                    <div className="flex items-center gap-2 group">
                      <Plus size={16} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <button
                      onClick={() => setShowAddFieldModal(true)}
                        className="flex-1 border-2 border-dashed border-gray-300 rounded-lg px-3 py-2 hover:border-blue-400 hover:bg-blue-50 transition-all text-gray-600 hover:text-blue-600 text-left"
                    >
                      <span className="text-sm font-medium">Add Field</span>
                    </button>
                    </div>
                  </div>

                  {sectionOrder.map(section => renderSection(section))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'home' && (
          <div className="flex-1 overflow-hidden">
            <Home />
          </div>
        )}

        {activeTab === 'tracker' && (
          <div className="flex-1 overflow-hidden">
            <JobTracker />
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="flex-1 overflow-hidden">
            <Templates />
          </div>
        )}

        {activeTab === 'discussion' && (
          <div className="flex-1 overflow-hidden">
            <Discussion />
          </div>
        )}

        {activeTab !== 'editor' && activeTab !== 'home' && activeTab !== 'tracker' && activeTab !== 'templates' && activeTab !== 'discussion' && (
          <div className="flex-1 p-6 overflow-y-auto flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
                <Sparkles size={40} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Coming Soon</h3>
              <p className="text-gray-500">Other features are being developed</p>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDE AI ASSISTANT PANEL */}
      {showRightPanel && (
        <div className={`fixed right-0 top-0 h-full bg-white/95 backdrop-blur-xl border-l border-gray-200/50 shadow-2xl z-40 ${isMobile ? 'w-full' : 'w-80'}`}>
          <div className="h-full flex flex-col">
            {/* Panel Header */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-purple-50 to-blue-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      AI Assistant
                    </h3>
                    <p className="text-xs text-gray-600">Resume Optimization</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowRightPanel(false)} 
                  className="p-2 hover:bg-gray-100 rounded-xl"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setAiMode('tailor')}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    aiMode === 'tailor'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Tailor for Job
                </button>
                <button
                  onClick={() => setAiMode('chat')}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    aiMode === 'chat'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  AI Chat
                </button>
              </div>

              {/* Tailor Mode */}
              {aiMode === 'tailor' && (
                <div className="space-y-6">
                  {/* Job Description Input */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Job Description</h4>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                      className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 resize-none text-sm"
                      rows={8}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">{jobDescription.length} characters</span>
                      <button
                        onClick={analyzeJobDescription}
                        disabled={!jobDescription.trim() || isAnalyzing}
                        className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Target size={12} />
                            Analyze Job
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* ATS Score Display */}
                  {(showATSScore || matchScore > 0) && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            <Target size={16} className="text-green-600" />
                            ATS Match Score
                          </h4>
                          <p className="text-xs text-gray-600">Resume compatibility with job requirements</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">{matchScore}%</div>
                          <div className="text-xs text-gray-500">Match</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-4">
                          <span className="text-green-600 font-medium">
                            ✓ {matchedKeywords.length} matched keywords
                          </span>
                          <span className="text-orange-600 font-medium">
                            ⚠ {missingKeywords.length} missing keywords
                          </span>
                        </div>
                        <button
                          onClick={() => setShowATSScore(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* AI Recommendations Display */}
                  {aiRecommendations && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                          <Brain size={16} className="text-blue-600" />
                          AI Recommendations
                        </h4>
                        <button
                          onClick={() => setAiRecommendations(null)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {aiRecommendations.recommendations.map((rec, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-white rounded-lg border border-blue-100">
                            <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-xs text-gray-700">{rec}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="text-green-600 font-medium">
                          ✓ {matchedKeywords.length} matched keywords
                        </span>
                        <span className="text-orange-600 font-medium">
                          ⚠ {missingKeywords.length} missing keywords
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={applyAIRecommendations}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-xs font-semibold hover:shadow-lg flex items-center justify-center gap-1"
                        >
                          <CheckCircle size={12} />
                          Apply
                        </button>
                        <button
                          onClick={() => setAiRecommendations(null)}
                          className="px-3 py-2 border border-gray-300 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Analysis Results */}
                  {(matchedKeywords.length > 0 || missingKeywords.length > 0) && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <h5 className="text-sm font-semibold text-gray-800 mb-2">Analysis Results</h5>
                      <div className="space-y-2">
                        <div>
                          <h6 className="text-xs font-semibold text-green-600 mb-1">Matched Keywords ({matchedKeywords.length})</h6>
                          <div className="flex flex-wrap gap-1">
                            {matchedKeywords.slice(0, 6).map((keyword, idx) => (
                              <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h6 className="text-xs font-semibold text-orange-600 mb-1">Missing Keywords ({missingKeywords.length})</h6>
                          <div className="flex flex-wrap gap-1">
                            {missingKeywords.slice(0, 6).map((keyword, idx) => (
                              <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-center">
                        <span className="text-sm font-bold text-gray-800">Match Score: {matchScore}%</span>
                      </div>
                    </div>
                  )}

                  {/* Tailoring Mode Selection */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">Tailoring Mode</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => setTailorEditMode('partial')}
                        className={`w-full p-3 border-2 rounded-xl text-left ${
                          tailorEditMode === 'partial'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <h5 className="text-sm font-semibold text-gray-800">Partial Edit (ATS Optimization)</h5>
                        <p className="text-xs text-gray-600 mt-1">Adds keywords, preserves original content</p>
                      </button>
                      <button
                        onClick={() => setTailorEditMode('full')}
                        className={`w-full p-3 border-2 rounded-xl text-left ${
                          tailorEditMode === 'full'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <h5 className="text-sm font-semibold text-gray-800">Full Edit (Complete Tailoring)</h5>
                        <p className="text-xs text-gray-600 mt-1">Rewrites sections to match job description</p>
                      </button>
                    </div>
                  </div>

                  {/* AI Writing Preferences */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800 mb-3">AI Writing Preferences</h4>
                    
                    {/* Tone Selection */}
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-gray-700 mb-2">Tone</h5>
                      <div className="grid grid-cols-2 gap-2">
                        {toneOptions.map((tone) => (
                          <button
                            key={tone.id}
                            onClick={() => setSelectedTone(tone.id)}
                            className={`p-2 border-2 rounded-lg text-center ${
                              selectedTone === tone.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="text-sm mb-1">{tone.icon}</div>
                            <div className="text-xs font-semibold">{tone.name}</div>
                            <div className="text-xs text-gray-500 mt-1">{tone.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Length Selection */}
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-gray-700 mb-2">Content Length</h5>
                      <div className="grid grid-cols-3 gap-2">
                        {lengthOptions.map((length) => (
                          <button
                            key={length.id}
                            onClick={() => setSelectedLength(length.id)}
                            className={`p-2 border-2 rounded-lg text-center ${
                              selectedLength === length.id
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-purple-300'
                            }`}
                          >
                            <div className="text-xs font-semibold break-words">{length.name}</div>
                            <div className="text-xs text-gray-500 mt-1 break-words leading-tight">{length.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>


                </div>
              )}

              {/* Chat Mode */}
              {aiMode === 'chat' && (
                <div className="space-y-4">
                  {/* Chat Interface */}
                  <div className="bg-gray-50 rounded-xl p-3 h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {aiConversation.map((message, idx) => (
                        <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs px-3 py-2 rounded-xl text-xs ${
                            message.role === 'user' 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                              : 'bg-white text-gray-800 border-2 border-gray-200'
                          }`}>
                            <p className="whitespace-pre-wrap">{message.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                      placeholder="Ask me anything about your resume..."
                      className="flex-1 border-2 border-gray-200 rounded-xl p-2 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 text-sm"
                    />
                    <button
                      onClick={sendAIMessage}
                      disabled={!aiPrompt.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      <Send size={16} />
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Quick Actions</h4>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        'Write Summary',
                        'Improve Bullets',
                        'Suggest Skills',
                        'Review Resume',
                        'Make it ATS-friendly',
                        'Add Achievements',
                        'Optimize for [job title]',
                        'Check for Errors'
                      ].map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setAiPrompt(action);
                            sendAIMessage();
                          }}
                          className="px-2 py-1 text-xs bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 text-left"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NEW RESUME MODAL */}
      {showNewResumeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-550 max-w-lg">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create New Resume</h3>
              <button onClick={() => setShowNewResumeModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={22} />
              </button>
            </div>
            <div className="space-y-4">
              <button onClick={createBlankResume} className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 text-left transition-all duration-300 hover:scale-105 group">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                    <FileText size={28} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-gray-900">Start from Scratch</h4>
                    <p className="text-sm text-gray-600">Create a blank resume and build it your way</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => { 
                  setShowNewResumeModal(false); 
                  setShowImportModal(true); 
                }} 
                className="w-full p-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 text-left transition-all duration-300 hover:scale-105 group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-shadow">
                    <Upload size={28} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-gray-900 flex items-center gap-2">
                      Import Existing Resume
                      <Database size={18} className="text-green-600" />
                    </h4>
                    <p className="text-sm text-gray-600">Upload from file, LinkedIn, or paste JSON</p>
                  </div>
                </div>
              </button>
              
              <button onClick={() => { setShowNewResumeModal(false); setShowAIOptimize(true); setAiMode('writer'); createBlankResume(); }} className="w-full p-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 text-left transition-all duration-300 hover:scale-105 group">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                    <Sparkles size={28} className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-gray-900 flex items-center gap-2">
                      AI Writer
                      <Bot size={18} className="text-purple-600" />
                    </h4>
                    <p className="text-sm text-gray-600">Let AI help you write your resume content</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI OPTIMIZE PANEL */}
      {showAIOptimize && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AI Resume Assistant
              </h3>
              <button onClick={() => setShowAIOptimize(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setAiMode('tailor')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  aiMode === 'tailor'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tailor for Job
              </button>
              <button
                onClick={() => setAiMode('chat')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  aiMode === 'chat'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                AI Chat
              </button>
            </div>

            {/* Tailor Mode */}
            {aiMode === 'tailor' && (
              <div className="space-y-6">
                {/* Job Description Input */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Job Description</h4>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all resize-none"
                    rows={10}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">{jobDescription.length} characters</span>
                    <button
                      onClick={analyzeJobDescription}
                      disabled={!jobDescription.trim() || isAnalyzing}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Target size={16} />
                          Analyze Job
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ATS Score Display */}
                {(showATSScore || matchScore > 0) && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <Target size={20} className="text-green-600" />
                          ATS Match Score
                        </h4>
                        <p className="text-sm text-gray-600">Resume compatibility with job requirements</p>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-bold text-green-600">{matchScore}%</div>
                        <div className="text-sm text-gray-500">Match</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <span className="text-green-600 font-medium flex items-center gap-2">
                          <CheckCircle size={16} />
                          {matchedKeywords.length} matched keywords
                        </span>
                        <span className="text-orange-600 font-medium flex items-center gap-2">
                          <AlertCircle size={16} />
                          {missingKeywords.length} missing keywords
                        </span>
                      </div>
                      <button
                        onClick={() => setShowATSScore(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Recommendations Display */}
                {aiRecommendations && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Brain size={20} className="text-blue-600" />
                        AI Recommendations
                      </h4>
                      <button
                        onClick={() => setAiRecommendations(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      {aiRecommendations.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100">
                          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <span className="text-sm text-gray-700">{rec}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-green-600 font-medium flex items-center gap-2">
                        <CheckCircle size={16} />
                        {matchedKeywords.length} matched keywords
                      </span>
                      <span className="text-orange-600 font-medium flex items-center gap-2">
                        <AlertCircle size={16} />
                        {missingKeywords.length} missing keywords
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={applyAIRecommendations}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Apply Recommendations
                      </button>
                      <button
                        onClick={() => setAiRecommendations(null)}
                        className="px-4 py-3 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Analysis Results */}
                {(matchedKeywords.length > 0 || missingKeywords.length > 0) && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Analysis Results</h5>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h6 className="text-sm font-semibold text-green-600 mb-2">Matched Keywords ({matchedKeywords.length})</h6>
                        <div className="flex flex-wrap gap-1">
                          {matchedKeywords.slice(0, 10).map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h6 className="text-sm font-semibold text-orange-600 mb-2">Missing Keywords ({missingKeywords.length})</h6>
                        <div className="flex flex-wrap gap-1">
                          {missingKeywords.slice(0, 10).map((keyword, idx) => (
                            <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-center">
                      <span className="text-lg font-bold text-gray-800">Match Score: {matchScore}%</span>
                    </div>
                  </div>
                )}

                {/* Tailoring Mode Selection */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Tailoring Mode</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setTailorEditMode('partial')}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        tailorEditMode === 'partial'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <h5 className="font-semibold text-gray-800">Partial Edit (ATS Optimization)</h5>
                      <p className="text-sm text-gray-600 mt-1">Adds keywords, preserves original content</p>
                    </button>
                    <button
                      onClick={() => setTailorEditMode('full')}
                      className={`p-4 border-2 rounded-xl transition-all text-left ${
                        tailorEditMode === 'full'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <h5 className="font-semibold text-gray-800">Full Edit (Complete Tailoring)</h5>
                      <p className="text-sm text-gray-600 mt-1">Rewrites sections to match job description</p>
                    </button>
                  </div>
                </div>

                {/* AI Writing Preferences */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">AI Writing Preferences</h4>
                  
                  {/* Tone Selection */}
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Tone</h5>
                    <div className="grid grid-cols-5 gap-2">
                      {toneOptions.map((tone) => (
                        <button
                          key={tone.id}
                          onClick={() => setSelectedTone(tone.id)}
                          className={`p-3 border-2 rounded-lg transition-all text-center ${
                            selectedTone === tone.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-lg mb-1">{tone.icon}</div>
                          <div className="text-xs font-semibold">{tone.name}</div>
                          <div className="text-xs text-gray-500 mt-1">{tone.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Length Selection */}
                  <div className="mb-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Content Length</h5>
                    <div className="grid grid-cols-3 gap-2">
                      {lengthOptions.map((length) => (
                        <button
                          key={length.id}
                          onClick={() => setSelectedLength(length.id)}
                          className={`p-3 border-2 rounded-lg transition-all text-center ${
                            selectedLength === length.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="text-sm font-semibold break-words">{length.name}</div>
                          <div className="text-xs text-gray-500 mt-1 break-words leading-tight">{length.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>


              </div>
            )}

            {/* Chat Mode */}
            {aiMode === 'chat' && (
              <div className="space-y-6">
                {/* Chat Interface */}
                <div className="bg-gray-50 rounded-xl p-4 h-96 overflow-y-auto">
                  <div className="space-y-4">
                    {aiConversation.map((message, idx) => (
                      <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-xl ${
                          message.role === 'user' 
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white' 
                            : 'bg-white text-gray-800 border-2 border-gray-200'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Input Area */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                    placeholder="Ask me anything about your resume..."
                    className="flex-1 border-2 border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all"
                  />
                  <button
                    onClick={sendAIMessage}
                    disabled={!aiPrompt.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <Send size={20} />
                    Send
                  </button>
                </div>

                {/* Quick Actions */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      'Write Summary',
                      'Improve Bullets',
                      'Suggest Skills',
                      'Review Resume',
                      'Make it ATS-friendly',
                      'Add Achievements',
                      'Optimize for [job title]',
                      'Check for Errors'
                    ].map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setAiPrompt(action);
                          sendAIMessage();
                        }}
                        className="px-3 py-2 text-xs bg-white border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI GENERATE MODAL */}
      {showAIGenerate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                AI Content Generator
              </h3>
              <button onClick={() => setShowAIGenerate(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Content Type Selection */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">What would you like to generate?</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'summary', name: 'Professional Summary', icon: FileText, description: 'Generate a compelling summary' },
                  { id: 'experience', name: 'Experience Description', icon: Briefcase, description: 'Write job experience bullets' },
                  { id: 'skills', name: 'Skills List', icon: Target, description: 'Create relevant skills' },
                  { id: 'projects', name: 'Project Description', icon: Database, description: 'Describe project work' },
                  { id: 'achievements', name: 'Achievements', icon: CheckCircle, description: 'Highlight accomplishments' },
                  { id: 'generic', name: 'Custom Content', icon: Edit, description: 'Generate any content' }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setAiGenerateMode(type.id)}
                    className={`p-4 border-2 rounded-xl transition-all text-left ${
                      aiGenerateMode === type.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <type.icon size={20} className={`mb-2 ${aiGenerateMode === type.id ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className="text-sm font-semibold">{type.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Input */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Describe what you want to generate</h4>
              <textarea
                value={aiGeneratePrompt}
                onChange={(e) => setAiGeneratePrompt(e.target.value)}
                placeholder={`Tell me about your ${aiGenerateMode === 'summary' ? 'background and experience' : 
                  aiGenerateMode === 'experience' ? 'job responsibilities and achievements' :
                  aiGenerateMode === 'skills' ? 'technical skills and expertise' :
                  aiGenerateMode === 'projects' ? 'project details and outcomes' :
                  aiGenerateMode === 'achievements' ? 'accomplishments and results' :
                  'content requirements'}...`}
                className="w-full border-2 border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all resize-none"
                rows={4}
              />
            </div>

            {/* Tone and Length Selection */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Tone</h4>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-green-300 focus:border-green-400"
                >
                  <option value="professional">Professional</option>
                  <option value="creative">Creative</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Length</h4>
                <select
                  value={selectedLength}
                  onChange={(e) => setSelectedLength(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-green-300 focus:border-green-400"
                >
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mb-6">
              <button
                onClick={generateAIContent}
                disabled={!aiGeneratePrompt.trim() || isGenerating}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot size={20} />
                    Generate Content
                  </>
                )}
              </button>
            </div>

            {/* Generated Content */}
            {aiGeneratedContent && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-800">Generated Content</h4>
                  <button
                    onClick={() => applyGeneratedContent(aiGenerateMode)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:scale-105"
                  >
                    Apply to Resume
                  </button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {aiGeneratedContent}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* TAILORING CONFIRMATION MODAL */}
      {showTailorConfirmation && tailoredResume && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Resume Tailored Successfully!
              </h3>
              <button onClick={cancelTailoring} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={22} />
              </button>
            </div>

            {/* Before/After Comparison */}
            <div className="space-y-6">
              {/* Summary Comparison */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-600 mb-2">Original</h5>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      {resumeData.summary || 'No summary provided'}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-600 mb-2">Tailored</h5>
                    <div className="bg-green-50 rounded-lg p-3 text-sm text-gray-700 border-2 border-green-200">
                      {tailoredResume.summary}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Comparison */}
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Skills</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-semibold text-gray-600 mb-2">Original ({resumeData.skills.length})</h5>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                      {resumeData.skills.join(', ')}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-gray-600 mb-2">Enhanced ({tailoredResume.skills.length})</h5>
                    <div className="bg-green-50 rounded-lg p-3 text-sm text-gray-700 border-2 border-green-200">
                      {tailoredResume.skills.map(skill => 
                        !resumeData.skills.includes(skill) ? `✨ ${skill}` : skill
                      ).join(', ')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Changes Summary */}
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <h4 className="text-lg font-semibold text-blue-800 mb-3">Changes Made</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li>• Summary rewritten to match job requirements</li>
                  <li>• {tailoredResume.skills.length - resumeData.skills.length} new skills added</li>
                  <li>• Experience descriptions optimized for ATS</li>
                  <li>• Tone adjusted to {selectedTone}</li>
                  <li>• Content length set to {selectedLength}</li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={applyTailoredResume}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                Apply Changes
              </button>
              <button
                onClick={cancelTailoring}
                className="px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-semibold hover:border-gray-300 hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Modals */}
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resumeData={resumeData}
        resumeElement={resumeElementRef.current}
        />

      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchResults={searchResults}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        highlightText={highlightText}
        />

      {/* Notification Toast */}
      <NotificationToast 
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onClose={() => setNotification({ ...notification, visible: false })}
        />

      {/* Mobile Menu Overlay */}
      {isMobile && showMobileMenu && (
        <div className="mobile-overlay open" onClick={() => setShowMobileMenu(false)} />
      )}

      {/* Mobile Floating Actions */}
      {isMobile && (
        <div className="mobile-floating-actions">
          <button 
            onClick={() => setShowMobileMenu(true)}
            className="mobile-fab"
          >
            <Menu size={24} />
          </button>
          <button 
            onClick={handleExport}
            className="mobile-fab"
          >
            <Download size={24} />
          </button>
          <button 
            onClick={saveResume}
            className="mobile-fab"
          >
            <Save size={24} />
          </button>
        </div>
      )}

      </div>

      {/* Enhanced Modals */}
      <ExportModal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        resumeData={resumeData}
        resumeElement={resumeElementRef.current}
        />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        highlightText={highlightText}
      />

      <NotificationToast
        message={notification.message}
        type={notification.type}
        isVisible={notification.visible}
        onClose={() => setNotification({...notification, visible: false})}
      />

      {/* UNIVERSAL AI GENERATION MODAL */}
      {showAIGenerateModal && targetSection && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    AI Generate for {targetSection.charAt(0).toUpperCase() + targetSection.slice(1)}
                  </h3>
                  <p className="text-sm text-gray-500">Create professional content with AI assistance</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowAIGenerateModal(false);
                  setTargetSection(null);
                  setTargetExperienceId(null);
                  setGeneratedContent('');
                  setAiGeneratePrompt('');
                  setIsTailoringMode(false);
                  setInputType('auto');
                }} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* AI Assistant Tip */}
            <div className="mb-4">
              <div className="text-xs font-medium text-amber-700 bg-amber-100/80 px-3 py-2 rounded-full border border-amber-200 text-center">
                💡 Use AI Assistant for advanced tailoring
              </div>
            </div>

            {/* Smart Input */}
            <div className="mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-bold text-gray-800">
                    What would you like to generate?
                  </label>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse"></div>
                </div>
                
                <div className="relative">
                  <textarea
                    value={aiGeneratePrompt}
                    onChange={(e) => {
                      setAiGeneratePrompt(e.target.value);
                      // Auto-detect input type as user types
                      const detected = detectInputType(e.target.value);
                      setInputType(detected);
                    }}
                    placeholder="Start typing your prompt or paste a job description..."
                    className="w-full p-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 resize-none transition-all duration-200 bg-white/80 backdrop-blur-sm text-gray-800 placeholder-gray-500"
                    rows={3}
                  />
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">AI</span>
                    </div>
                  </div>
                </div>

                {/* Input Examples */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600">📋</span>
                      <span className="text-xs font-semibold text-blue-800">Job Description</span>
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      "Software Engineer with 3+ years experience in React, Node.js, and AWS. Must have experience with microservices..."
                    </p>
                  </div>
                  <div className="p-3 bg-green-50/50 rounded-xl border border-green-200/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-600">✨</span>
                      <span className="text-xs font-semibold text-green-800">Creative Prompt</span>
                    </div>
                    <p className="text-xs text-green-700 leading-relaxed">
                      "Experienced data engineer with expertise in Python, AWS, and machine learning algorithms..."
                    </p>
                  </div>
                </div>

                {/* Detection Status */}
                {aiGeneratePrompt && (
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-600">AI Detection:</span>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                        inputType === 'job' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        inputType === 'prompt' ? 'bg-green-100 text-green-800 border border-green-200' :
                        'bg-gray-100 text-gray-800 border border-gray-200'
                      }`}>
                        {inputType === 'job' ? '📋 Job Description Mode' :
                         inputType === 'prompt' ? '✨ Creative Prompt Mode' :
                         '🤖 Analyzing...'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {inputType === 'job' ? 'Will tailor content to match requirements' :
                       inputType === 'prompt' ? 'Will generate creative content' :
                       'Detecting input type...'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tone and Length Selection */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Tone Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-800">Writing Tone</h4>
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                </div>
                <div className="space-y-2">
                  {toneOptions.slice(0, 3).map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setSelectedTone(tone.id)}
                      className={`w-full p-2 border-2 rounded-xl transition-all duration-200 text-left group ${
                        selectedTone === tone.id 
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md' 
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                          selectedTone === tone.id 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100'
                        }`}>
                          {tone.icon}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800">{tone.name}</div>
                          <div className="text-xs text-gray-500">{tone.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selection */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-gray-800">Content Length</h4>
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                </div>
                <div className="space-y-2">
                  {lengthOptions.map((length) => (
                    <button
                      key={length.id}
                      onClick={() => setSelectedLength(length.id)}
                      className={`w-full p-2 border-2 rounded-xl transition-all duration-200 text-left group ${
                        selectedLength === length.id 
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-md' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                          selectedLength === length.id 
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                            : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100'
                        }`}>
                          {length.id === 'concise' ? 'S' : length.id === 'medium' ? 'M' : 'L'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-800">{length.name}</div>
                          <div className="text-xs text-gray-500 break-words leading-tight">{length.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            {!generatedContent && (
              <div className="flex justify-center mb-3">
                <button
                  onClick={generateContent}
                  disabled={isGenerating || !aiGeneratePrompt.trim()}
                  className="relative overflow-hidden px-5 py-2.5 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                >
                  <div className="relative flex items-center gap-2">
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span className="text-sm">Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-white" />
                        <span className="text-sm">
                          {inputType === 'job' ? 'Tailor Content' : 'Generate Content'}
                        </span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            )}

            {/* Generated Content Preview */}
            {generatedContent && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-sm font-bold text-gray-800">✨ Generated Content</h4>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse"></div>
                </div>
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl max-h-40 overflow-y-auto shadow-inner">
                  {targetSection === 'summary' ? (
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{generatedContent}</p>
                  ) : targetSection === 'skills' ? (
                    <div className="flex flex-wrap gap-1">
                      {generatedContent.map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : targetSection === 'projects' ? (
                    <div className="space-y-2">
                      {generatedContent.map((project, idx) => (
                        <div key={idx} className="p-2 bg-white border border-gray-200 rounded-lg">
                          <h5 className="font-semibold text-gray-800 text-sm">{project.name}</h5>
                          <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : targetSection === 'education' ? (
                    <div className="space-y-2">
                      {generatedContent.map((edu, idx) => (
                        <div key={idx} className="p-2 bg-white border border-gray-200 rounded-lg">
                          <h5 className="font-semibold text-gray-800 text-sm">{edu.degree}</h5>
                          <p className="text-xs text-gray-600">{edu.school} • {edu.year}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-700 text-sm">{generatedContent}</p>
                  )}
                  </div>
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {generatedContent && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={applyGeneratedContent}
                  className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/30 transition-all duration-200 hover:scale-105 flex items-center justify-center gap-1.5 text-xs"
                >
                  <CheckCircle size={12} />
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={showUserProfile} 
        onClose={() => setShowUserProfile(false)} 
      />
    </>
  );
}
