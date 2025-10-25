'use client';

import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Settings, 
  CreditCard, 
  HelpCircle, 
  Save, 
  Eye, 
  Lock,
  Key,
  Smartphone,
  Calendar,
  CheckCircle,
  Trash2,
  Edit,
  Briefcase,
  Award,
  Target,
  Star,
  Heart,
  Share2,
  FileText,
  Camera,
  Link,
  Zap,
  DollarSign,
  Globe2,
  Languages,
  Workflow,
  BarChart3,
  PieChart,
  Activity,
  BookOpen,
  Video,
  Mic,
  Headphones,
  Monitor,
  Laptop,
  Tablet,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  List,
  Hash,
  AtSign,
  Tag,
  TrendingUp,
  Globe
} from 'lucide-react';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Comprehensive user data for career platform
  const [userData, setUserData] = useState({
    // Basic Info
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    bio: 'Experienced software engineer with 5+ years of experience in full-stack development.',
    profilePicture: null,
    
    // Professional Info
    currentRole: 'Senior Software Engineer',
    currentCompany: 'Tech Corp',
    experience: '5+ years',
    industry: 'Technology',
    jobLevel: 'Senior',
    employmentType: 'Full-time',
    availability: 'Open to opportunities',
    salaryExpectation: '$120,000 - $150,000',
    workPreference: 'Hybrid',
    
    // Skills & Expertise
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker'],
    certifications: ['AWS Certified Developer', 'Google Cloud Professional'],
    languages: ['English (Native)', 'Spanish (Fluent)', 'French (Conversational)'],
    
    // Career Goals
    careerGoals: 'Looking to transition into a tech lead role',
    targetRoles: ['Tech Lead', 'Senior Developer', 'Architect'],
    targetCompanies: ['Google', 'Microsoft', 'Apple'],
    relocationWillingness: 'Open to relocation',
    
    // Portfolio & Links
    portfolio: 'https://johndoe.dev',
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    website: 'https://johndoe.com',
    
    // Preferences
    jobAlerts: true,
    emailNotifications: true,
    smsNotifications: false,
    privacyLevel: 'Professional',
    profileVisibility: 'Public',
    
    // Analytics & Insights
    profileViews: 1247,
    applicationsSent: 23,
    interviewsScheduled: 8,
    offersReceived: 2,
    successRate: 8.7
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'skills', label: 'Skills & Expertise', icon: Award },
    { id: 'career', label: 'Career Goals', icon: Target },
    { id: 'portfolio', label: 'Portfolio', icon: FileText },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'support', label: 'Help & Support', icon: HelpCircle }
  ];

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  const renderProfileTab = () => (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Personal Information
        </h2>
        <p className="text-gray-600">Update your personal details and profile information</p>
      </div>
      
      <div className="space-y-8">
        {/* Enhanced Profile Picture */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {userData.firstName[0]}{userData.lastName[0]}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <CheckCircle size={16} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Picture</h3>
              <p className="text-gray-600 mb-4">Upload a professional photo to make your profile stand out</p>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                <Camera size={18} />
                Change Photo
              </button>
              <p className="text-sm text-gray-500 mt-2">JPG, PNG up to 5MB • Recommended: 400x400px</p>
            </div>
          </div>
        </div>

        {/* Enhanced Basic Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">First Name</label>
              <input
                type="text"
                value={userData.firstName}
                onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Last Name</label>
              <input
                type="text"
                value={userData.lastName}
                onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="Enter your email address"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData({...userData, phone: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="mt-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Location</label>
              <input
                type="text"
                value={userData.location}
                onChange={(e) => setUserData({...userData, location: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="Enter your location"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Bio Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Professional Bio</h3>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Tell us about yourself</label>
            <textarea
              value={userData.bio}
              onChange={(e) => setUserData({...userData, bio: e.target.value})}
              disabled={!isEditing}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400 resize-none"
              placeholder="Write a compelling bio that highlights your experience, skills, and career goals..."
            />
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>This will be visible to recruiters and potential employers</span>
              <span>{userData.bio.length}/500 characters</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfessionalTab = () => (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Professional Information
        </h2>
        <p className="text-gray-600">Manage your professional details and career information</p>
      </div>
      
      <div className="space-y-8">
        {/* Current Role & Company */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Current Position</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Current Role</label>
              <input
                type="text"
                value={userData.currentRole}
                onChange={(e) => setUserData({...userData, currentRole: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Current Company</label>
              <input
                type="text"
                value={userData.currentCompany}
                onChange={(e) => setUserData({...userData, currentCompany: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="e.g., Tech Corp"
              />
            </div>
          </div>
        </div>

        {/* Experience & Industry */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Experience & Background</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Experience Level</label>
              <select
                value={userData.experience}
                onChange={(e) => setUserData({...userData, experience: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
              >
                <option value="0-1 years">0-1 years</option>
                <option value="1-3 years">1-3 years</option>
                <option value="3-5 years">3-5 years</option>
                <option value="5+ years">5+ years</option>
                <option value="10+ years">10+ years</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Industry</label>
              <select
                value={userData.industry}
                onChange={(e) => setUserData({...userData, industry: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
              >
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Consulting">Consulting</option>
                <option value="Media">Media</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Job Level</label>
              <select
                value={userData.jobLevel}
                onChange={(e) => setUserData({...userData, jobLevel: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead/Principal</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Compensation & Preferences */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Compensation & Work Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Salary Expectation</label>
              <input
                type="text"
                value={userData.salaryExpectation}
                onChange={(e) => setUserData({...userData, salaryExpectation: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
                placeholder="e.g., $120,000 - $150,000"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Work Preference</label>
              <select
                value={userData.workPreference}
                onChange={(e) => setUserData({...userData, workPreference: e.target.value})}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 hover:border-gray-400"
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkillsTab = () => (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Skills & Expertise
        </h2>
        <p className="text-gray-600">Showcase your technical skills, certifications, and language abilities</p>
      </div>
      
      <div className="space-y-8">
        {/* Technical Skills */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Technical Skills</h3>
          <div className="flex flex-wrap gap-3 mb-6">
            {userData.skills.map((skill, index) => (
              <span key={index} className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm border border-blue-200/50">
                {skill}
                {isEditing && (
                  <button
                    onClick={() => setUserData({
                      ...userData,
                      skills: userData.skills.filter((_, i) => i !== index)
                    })}
                    className="text-blue-600 hover:text-blue-800 transition-colors ml-1"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Add a technical skill"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const skill = target.value.trim();
                    if (skill && !userData.skills.includes(skill)) {
                      setUserData({...userData, skills: [...userData.skills, skill]});
                      target.value = '';
                    }
                  }
                }}
              />
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Add Skill
              </button>
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Certifications</h3>
          <div className="space-y-4">
            {userData.certifications.map((cert, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200/50">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award size={20} className="text-yellow-600" />
                </div>
                <span className="text-gray-900 font-medium flex-1">{cert}</span>
                {isEditing && (
                  <button
                    onClick={() => setUserData({
                      ...userData,
                      certifications: userData.certifications.filter((_, i) => i !== index)
                    })}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-3 mt-4">
              <input
                type="text"
                placeholder="Add certification"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const cert = target.value.trim();
                    if (cert && !userData.certifications.includes(cert)) {
                      setUserData({...userData, certifications: [...userData.certifications, cert]});
                      target.value = '';
                    }
                  }
                }}
              />
              <button className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Add Certification
              </button>
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Languages</h3>
          <div className="space-y-4">
            {userData.languages.map((lang, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/50">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe size={20} className="text-green-600" />
                </div>
                <span className="text-gray-900 font-medium flex-1">{lang}</span>
                {isEditing && (
                  <button
                    onClick={() => setUserData({
                      ...userData,
                      languages: userData.languages.filter((_, i) => i !== index)
                    })}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-3 mt-4">
              <input
                type="text"
                placeholder="Add language"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const lang = target.value.trim();
                    if (lang && !userData.languages.includes(lang)) {
                      setUserData({...userData, languages: [...userData.languages, lang]});
                      target.value = '';
                    }
                  }
                }}
              />
              <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                Add Language
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCareerTab = () => (
    <div className="max-w-4xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Career Goals & Preferences</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Career Goals</label>
          <textarea
            value={userData.careerGoals}
            onChange={(e) => setUserData({...userData, careerGoals: e.target.value})}
            disabled={!isEditing}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            placeholder="Describe your career aspirations..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Roles</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {userData.targetRoles.map((role, index) => (
              <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center gap-2">
                {role}
                {isEditing && (
                  <button
                    onClick={() => setUserData({
                      ...userData,
                      targetRoles: userData.targetRoles.filter((_, i) => i !== index)
                    })}
                    className="text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add target role"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const role = target.value.trim();
                    if (role && !userData.targetRoles.includes(role)) {
                      setUserData({...userData, targetRoles: [...userData.targetRoles, role]});
                      target.value = '';
                    }
                  }
                }}
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Companies</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {userData.targetCompanies.map((company, index) => (
              <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm flex items-center gap-2">
                {company}
                {isEditing && (
                  <button
                    onClick={() => setUserData({
                      ...userData,
                      targetCompanies: userData.targetCompanies.filter((_, i) => i !== index)
                    })}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add target company"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    const company = target.value.trim();
                    if (company && !userData.targetCompanies.includes(company)) {
                      setUserData({...userData, targetCompanies: [...userData.targetCompanies, company]});
                      target.value = '';
                    }
                  }
                }}
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Relocation Willingness</label>
          <select
            value={userData.relocationWillingness}
            onChange={(e) => setUserData({...userData, relocationWillingness: e.target.value})}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="Not willing to relocate">Not willing to relocate</option>
            <option value="Open to relocation">Open to relocation</option>
            <option value="Actively seeking relocation">Actively seeking relocation</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderPortfolioTab = () => (
    <div className="max-w-4xl">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Portfolio & Links</h2>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Website</label>
            <input
              type="url"
              value={userData.portfolio}
              onChange={(e) => setUserData({...userData, portfolio: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="https://yourportfolio.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input
              type="url"
              value={userData.linkedin}
              onChange={(e) => setUserData({...userData, linkedin: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
            <input
              type="url"
              value={userData.github}
              onChange={(e) => setUserData({...userData, github: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="https://github.com/yourusername"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Personal Website</label>
            <input
              type="url"
              value={userData.website}
              onChange={(e) => setUserData({...userData, website: e.target.value})}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsTab = () => (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Profile Analytics
        </h2>
        <p className="text-gray-600">Track your profile performance and job search metrics</p>
      </div>
      
      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl border border-blue-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Eye size={24} className="text-blue-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-900">{userData.profileViews.toLocaleString()}</p>
              <p className="text-sm text-blue-600 font-medium">+12% this month</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700">Profile Views</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-2xl border border-green-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <FileText size={24} className="text-green-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-900">{userData.applicationsSent}</p>
              <p className="text-sm text-green-600 font-medium">+3 this week</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700">Applications Sent</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-2xl border border-yellow-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <Calendar size={24} className="text-yellow-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-yellow-900">{userData.interviewsScheduled}</p>
              <p className="text-sm text-yellow-600 font-medium">2 upcoming</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700">Interviews</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 p-6 rounded-2xl border border-purple-200/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingUp size={24} className="text-purple-600" />
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-900">{userData.successRate}%</p>
              <p className="text-sm text-purple-600 font-medium">Above average</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700">Success Rate</p>
        </div>
      </div>

      {/* Enhanced Performance Metrics */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Profile Performance</h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Profile Completeness</span>
              <span className="text-sm font-bold text-blue-600">85%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000" style={{ width: '85%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Complete your profile to increase visibility by 40%</p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Skills Match Rate</span>
              <span className="text-sm font-bold text-green-600">92%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000" style={{ width: '92%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Your skills match well with current job openings</p>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Response Rate</span>
              <span className="text-sm font-bold text-yellow-600">78%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000" style={{ width: '78%' }}></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Recruiters respond to your applications frequently</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200/50">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Eye size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Profile viewed by TechCorp recruiter</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200/50">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Application sent to Google</p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200/50">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar size={16} className="text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Interview scheduled with Microsoft</p>
              <p className="text-xs text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Security Settings
        </h2>
        <p className="text-gray-600">Manage your account security and privacy settings</p>
      </div>
      
      <div className="space-y-8">
        {/* Password Management */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Password & Authentication</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200/50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Lock size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Password</p>
                  <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Change Password
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200/50">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Key size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-600">Add an extra layer of security</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>
        </div>

        {/* Login Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Recent Login Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={16} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Current Session</p>
                <p className="text-sm text-gray-600">Chrome on Windows • San Francisco, CA</p>
              </div>
              <span className="text-sm text-green-600 font-medium">Active</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Smartphone size={16} className="text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Mobile App</p>
                <p className="text-sm text-gray-600">iOS Safari • San Francisco, CA</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Profile Visibility</p>
                <p className="text-sm text-gray-600">Control who can see your profile</p>
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="public">Public</option>
                <option value="recruiters">Recruiters Only</option>
                <option value="private">Private</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Contact Information</p>
                <p className="text-sm text-gray-600">Show contact details to recruiters</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
          Billing & Subscription
        </h2>
        <p className="text-gray-600">Manage your subscription and billing information</p>
      </div>
      
      <div className="space-y-8">
        {/* Current Plan */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Current Plan</h3>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-lg font-bold text-blue-900">Professional Plan</h4>
                <p className="text-blue-700">$29/month • Billed monthly</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-900">$29</p>
                <p className="text-sm text-blue-600">per month</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Unlimited job applications</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Advanced analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" />
                <span>Resume templates</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Upgrade Plan
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h3>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Visa ending in 4242</p>
                <p className="text-sm text-gray-600">Expires 12/25</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Update
            </button>
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Billing History</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Professional Plan</p>
                <p className="text-sm text-gray-600">December 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">$29.00</p>
                <button className="text-sm text-blue-600 hover:text-blue-800">Download</button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">Professional Plan</p>
                <p className="text-sm text-gray-600">November 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">$29.00</p>
                <button className="text-sm text-blue-600 hover:text-blue-800">Download</button>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Usage This Month</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-900">23</p>
              <p className="text-sm text-blue-600">Applications Sent</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-900">8</p>
              <p className="text-sm text-green-600">Interviews</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-900">2</p>
              <p className="text-sm text-purple-600">Offers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return renderProfileTab();
      case 'professional':
        return renderProfessionalTab();
      case 'skills':
        return renderSkillsTab();
      case 'career':
        return renderCareerTab();
      case 'portfolio':
        return renderPortfolioTab();
      case 'analytics':
        return renderAnalyticsTab();
      case 'security':
        return renderSecurityTab();
      case 'billing':
        return renderBillingTab();
      default:
        return (
          <div className="max-w-4xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            <p className="text-gray-600">This section is coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 flex flex-col overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 flex-shrink-0 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mt-1 text-sm">Manage your account settings and preferences</p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-all duration-200 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Save size={16} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Enhanced Sidebar with Proper Spacing */}
        <div className="w-72 bg-white/70 backdrop-blur-sm border-r border-gray-200/50 flex-shrink-0 shadow-lg flex flex-col">
          <nav className="flex-1 overflow-y-auto p-6 pb-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <ul className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.id}>
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 shadow-md transform scale-[1.02]'
                          : 'text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:shadow-sm hover:transform hover:scale-[1.01]'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${
                        activeTab === tab.id 
                          ? 'bg-blue-100 text-blue-600' 
                          : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'
                      }`}>
                        <Icon size={16} />
                      </div>
                      <span className="font-medium text-sm truncate">{tab.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        {/* Enhanced Main Content */}
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="p-8">
            <div className="max-w-5xl mx-auto">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}