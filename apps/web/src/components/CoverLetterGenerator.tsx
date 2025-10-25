'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Save, 
  Edit, 
  RefreshCw,
  Target,
  User,
  Building,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Briefcase,
  Award,
  BookOpen,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  Eye,
  Settings,
  Zap,
  Brain,
  Send,
  FileUp,
  History,
  Star,
  Heart,
  ThumbsUp,
  MessageSquare,
  Share2,
  Lock,
  Unlock,
  ArrowRight,
  Clock,
  TrendingUp,
  Palette,
  Wand2,
  FileCheck,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Type,
  AlignLeft,
  AlignCenter,
  Bold,
  Italic,
  Underline,
  Link,
  Image,
  Smile,
  MoreHorizontal
} from 'lucide-react';

interface CoverLetterTemplate {
  id: string;
  name: string;
  category: 'professional' | 'creative' | 'academic' | 'entry-level';
  content: string;
  description: string;
  isPremium: boolean;
}

interface JobDetails {
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  location: string;
  salary?: string;
  requirements: string[];
  benefits: string[];
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  linkedin?: string;
  portfolio?: string;
}

interface CoverLetterProps {
  onClose?: () => void;
}

export default function CoverLetterGenerator({ onClose }: CoverLetterProps) {
  const [activeTab, setActiveTab] = useState<'generator' | 'templates' | 'history'>('generator');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  
  // Job Details
  const [jobDetails, setJobDetails] = useState<JobDetails>({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    location: '',
    salary: '',
    requirements: [],
    benefits: []
  });

  // Personal Info
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    portfolio: ''
  });

  // Templates
  const [templates] = useState<CoverLetterTemplate[]>([
    {
      id: '1',
      name: 'Professional Standard',
      category: 'professional',
      description: 'Clean, professional format suitable for most industries',
      content: `Dear Hiring Manager,

I am writing to express my strong interest in the [Job Title] position at [Company Name]. With my background in [Relevant Experience] and passion for [Industry/Field], I am confident that I would be a valuable addition to your team.

In my current role as [Current Position] at [Current Company], I have successfully [Key Achievement 1] and [Key Achievement 2]. These experiences have equipped me with the skills necessary to excel in this position, including [Relevant Skill 1], [Relevant Skill 2], and [Relevant Skill 3].

What particularly excites me about this opportunity is [Specific Reason for Interest]. I am drawn to [Company Name]'s commitment to [Company Value/Mission] and believe my [Relevant Quality] would contribute to your continued success.

I would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application.

Sincerely,
[Your Name]`,
      isPremium: false
    },
    {
      id: '2',
      name: 'Creative Industry',
      category: 'creative',
      description: 'Dynamic format for creative and design roles',
      content: `Dear [Hiring Manager Name],

I'm thrilled to apply for the [Job Title] position at [Company Name]. As a creative professional with [X] years of experience in [Creative Field], I'm excited about the opportunity to bring my unique perspective and skills to your innovative team.

My portfolio showcases a diverse range of projects, from [Project Type 1] to [Project Type 2], each demonstrating my ability to [Creative Skill 1] and [Creative Skill 2]. I'm particularly proud of [Specific Project], which [Project Impact/Result].

What sets me apart is my ability to [Unique Creative Ability] while maintaining [Professional Quality]. I'm drawn to [Company Name] because of [Specific Company Reason] and would love to contribute to [Specific Company Project/Goal].

I'd love to discuss how my creative vision can help [Company Name] achieve its goals. Let's create something amazing together!

Best regards,
[Your Name]`,
      isPremium: false
    },
    {
      id: '3',
      name: 'Tech Professional',
      category: 'professional',
      description: 'Technical format for software and engineering roles',
      content: `Dear [Hiring Manager],

I am excited to apply for the [Job Title] position at [Company Name]. As a [Technical Role] with expertise in [Technical Skills], I am eager to contribute to your team's mission of [Company Mission/Goal].

Throughout my career, I have developed proficiency in [Technical Skill 1], [Technical Skill 2], and [Technical Skill 3]. My recent work on [Project Name] resulted in [Quantifiable Result], demonstrating my ability to [Technical Achievement].

I am particularly interested in this role because of [Specific Technical Reason]. The opportunity to work with [Specific Technology/Team] aligns perfectly with my career goals and technical interests.

I would appreciate the opportunity to discuss how my technical expertise can contribute to [Company Name]'s continued innovation and growth.

Sincerely,
[Your Name]`,
      isPremium: true
    },
    {
      id: '4',
      name: 'Entry Level',
      category: 'entry-level',
      description: 'Perfect for recent graduates and career changers',
      content: `Dear Hiring Manager,

I am writing to express my enthusiasm for the [Job Title] position at [Company Name]. As a recent graduate with a degree in [Field of Study] and a strong passion for [Industry/Field], I am eager to begin my career with an organization that values innovation and growth.

During my academic career, I have developed strong skills in [Relevant Skill 1], [Relevant Skill 2], and [Relevant Skill 3]. My coursework in [Relevant Course] and experience with [Relevant Project/Internship] have prepared me to contribute meaningfully to your team.

What excites me most about this opportunity is [Specific Reason]. I am particularly drawn to [Company Name]'s commitment to [Company Value] and would be honored to contribute to your mission.

I am confident that my fresh perspective, strong work ethic, and eagerness to learn would make me a valuable addition to your team. I would welcome the opportunity to discuss how I can contribute to [Company Name]'s success.

Thank you for your consideration.

Best regards,
[Your Name]`,
      isPremium: false
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<CoverLetterTemplate | null>(null);
  const [coverLetterHistory, setCoverLetterHistory] = useState<any[]>([]);

  // Update word and character count
  useEffect(() => {
    const words = coverLetter.trim().split(/\s+/).filter(word => word.length > 0).length;
    const chars = coverLetter.length;
    setWordCount(words);
    setCharCount(chars);
  }, [coverLetter]);

  // AI Generation
  const generateCoverLetter = async () => {
    setIsGenerating(true);
    setCurrentStep(2);
    
    // Simulate AI generation with progress
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentStep(3);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const generatedContent = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobDetails.jobTitle} position at ${jobDetails.companyName}. With my background in software development and passion for creating innovative solutions, I am confident that I would be a valuable addition to your team.

In my current role as a Software Engineer, I have successfully developed scalable web applications and implemented efficient database solutions. These experiences have equipped me with the skills necessary to excel in this position, including JavaScript, React, Node.js, and Python.

What particularly excites me about this opportunity is the chance to work on cutting-edge projects that make a real impact. I am drawn to ${jobDetails.companyName}'s commitment to innovation and believe my problem-solving abilities would contribute to your continued success.

I would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for considering my application.

Sincerely,
${personalInfo.name}`;

    setCoverLetter(generatedContent);
    setIsGenerating(false);
    setCurrentStep(4);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const applyTemplate = (template: CoverLetterTemplate) => {
    let content = template.content;
    
    // Replace placeholders with actual data
    content = content.replace(/\[Job Title\]/g, jobDetails.jobTitle || '[Job Title]');
    content = content.replace(/\[Company Name\]/g, jobDetails.companyName || '[Company Name]');
    content = content.replace(/\[Your Name\]/g, personalInfo.name || '[Your Name]');
    content = content.replace(/\[Hiring Manager\]/g, '[Hiring Manager]');
    content = content.replace(/\[Hiring Manager Name\]/g, '[Hiring Manager Name]');
    
    setCoverLetter(content);
    setSelectedTemplate(template);
  };

  const saveCoverLetter = () => {
    const newLetter = {
      id: Date.now().toString(),
      title: `${jobDetails.jobTitle} - ${jobDetails.companyName}`,
      content: coverLetter,
      template: selectedTemplate?.name || 'Custom',
      createdAt: new Date().toISOString(),
      jobDetails,
      personalInfo
    };
    
    setCoverLetterHistory(prev => [newLetter, ...prev]);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
  };

  const downloadCoverLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${jobDetails.companyName}-${jobDetails.jobTitle}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'professional':
        return <Briefcase className="w-4 h-4" />;
      case 'creative':
        return <Lightbulb className="w-4 h-4" />;
      case 'academic':
        return <BookOpen className="w-4 h-4" />;
      case 'entry-level':
        return <Star className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'creative':
        return 'bg-purple-100 text-purple-800';
      case 'academic':
        return 'bg-green-100 text-green-800';
      case 'entry-level':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`h-full flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-gray-600 mt-1">AI-powered cover letter creation with professional templates</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {coverLetter && (
              <div className="flex items-center space-x-4 px-4 py-2 bg-gray-100 rounded-full">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Type className="w-4 h-4" />
                  <span>{wordCount} words</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <FileCheck className="w-4 h-4" />
                  <span>{charCount} chars</span>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="flex space-x-2 bg-gray-100/50 rounded-xl p-1 backdrop-blur-sm">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'generator'
                ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/20 scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>AI Generator</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'templates'
                ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/20 scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Palette className="w-4 h-4" />
              <span>Templates</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
              activeTab === 'history'
                ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/20 scale-105'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'generator' && (
          <div className="p-6 space-y-8">
            {/* Progress Steps */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Step {currentStep} of 4</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                      step <= currentStep 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                    </div>
                    {step < 4 && (
                      <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-300 ${
                        step < currentStep ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {currentStep === 1 && "Fill in your job details and personal information"}
                {currentStep === 2 && "AI is analyzing your information..."}
                {currentStep === 3 && "Generating your personalized cover letter..."}
                {currentStep === 4 && "Cover letter generated successfully!"}
              </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 animate-in slide-in-from-top duration-500">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-green-900">Cover Letter Generated!</h4>
                    <p className="text-green-700 text-sm">Your AI-powered cover letter is ready for review and customization.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Job Details - Enhanced */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Job Details</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={jobDetails.companyName}
                        onChange={(e) => setJobDetails(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Google, Microsoft"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Title *
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={jobDetails.jobTitle}
                        onChange={(e) => setJobDetails(prev => ({ ...prev, jobTitle: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., Software Engineer"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={jobDetails.location}
                        onChange={(e) => setJobDetails(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salary Range
                    </label>
                    <div className="relative">
                      <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={jobDetails.salary}
                        onChange={(e) => setJobDetails(prev => ({ ...prev, salary: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="e.g., $80,000 - $100,000"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Job Description
                    </label>
                    <textarea
                      value={jobDetails.jobDescription}
                      onChange={(e) => setJobDetails(prev => ({ ...prev, jobDescription: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Paste the job description here..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information - Enhanced */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={personalInfo.name}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn Profile
                    </label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url"
                        value={personalInfo.linkedin}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, linkedin: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button - Enhanced */}
            <div className="flex items-center justify-center">
              <button
                onClick={generateCoverLetter}
                disabled={!jobDetails.companyName || !jobDetails.jobTitle || !personalInfo.name || isGenerating}
                className="group relative flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-12 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span className="text-lg font-semibold">Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6 group-hover:animate-pulse" />
                    <span className="text-lg font-semibold">Generate Cover Letter</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>

            {/* Generated Cover Letter - Enhanced */}
            {coverLetter && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <FileCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Generated Cover Letter</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className={`p-2 rounded-lg transition-colors ${
                        showPreview ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={downloadCoverLetter}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={saveCoverLetter}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {showPreview ? (
                  <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
                        {coverLetter}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={15}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none transition-all duration-200"
                      placeholder="Your generated cover letter will appear here..."
                    />
                    <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-xs text-gray-500">
                      <span>{wordCount} words</span>
                      <span>•</span>
                      <span>{charCount} characters</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="p-6">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Cover Letter Templates</h3>
              <p className="text-gray-600">Choose from professionally designed templates tailored for different industries</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="group bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl ${getCategoryColor(template.category).replace('text-', 'bg-').replace('-800', '-100')}`}>
                        {getCategoryIcon(template.category)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{template.name}</h4>
                        <p className="text-gray-600 text-sm">{template.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                        {template.category}
                      </span>
                      {template.isPremium && (
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-medium flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Premium</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => applyTemplate(template)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Wand2 className="w-4 h-4" />
                        <span>Use Template</span>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setCoverLetter(template.content);
                        setShowPreview(true);
                        setActiveTab('generator');
                      }}
                      className="p-3 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Cover Letter History</h3>
              <p className="text-gray-600">Your previously generated cover letters</p>
            </div>

            {coverLetterHistory.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl mx-auto mb-6 flex items-center justify-center">
                  <FileText className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No cover letters yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">Generate your first AI-powered cover letter to see it here. All your cover letters will be saved automatically.</p>
                <button
                  onClick={() => setActiveTab('generator')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5" />
                    <span>Generate Cover Letter</span>
                  </div>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {coverLetterHistory.map((letter) => (
                  <div
                    key={letter.id}
                    className="bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-102"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-lg mb-2">{letter.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Palette className="w-4 h-4" />
                            <span>Template: {letter.template}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(letter.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Type className="w-4 h-4" />
                            <span>{letter.content.split(' ').length} words</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setCoverLetter(letter.content);
                            setJobDetails(letter.jobDetails);
                            setPersonalInfo(letter.personalInfo);
                            setActiveTab('generator');
                          }}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const element = document.createElement('a');
                            const file = new Blob([letter.content], { type: 'text/plain' });
                            element.href = URL.createObjectURL(file);
                            element.download = `${letter.title}.txt`;
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-4 rounded-xl">
                      {letter.content.substring(0, 200)}...
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
