'use client';

import React, { useState, useRef } from 'react';
import { Upload, Camera, User, Mail, Briefcase, Linkedin, Github, Globe, X, Check, CheckCircle, FileText } from 'lucide-react';
import { resumeParser } from '../../services/resumeParser';

interface SetupStepProps {
  profileData?: any;
  onComplete: (data: any) => void;
}

export default function SetupStep({ profileData, onComplete }: SetupStepProps) {
  const [name, setName] = useState(profileData ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() : '');
  const [email, setEmail] = useState(profileData?.email || '');
  const [role, setRole] = useState(profileData?.currentRole || '');
  const [company, setCompany] = useState(profileData?.currentCompany || '');
  const [bio, setBio] = useState(profileData?.bio || profileData?.professionalSummary?.overview || '');
  const [linkedin, setLinkedin] = useState(profileData?.linkedin || '');
  const [github, setGithub] = useState(profileData?.github || '');
  const [website, setWebsite] = useState(profileData?.website || profileData?.portfolio || '');
  const [profilePic, setProfilePic] = useState(profileData?.profilePicture || null);
  const [template, setTemplate] = useState('modern');
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<string | null>(null);
  const [resumeContent, setResumeContent] = useState<string>(''); // Store full resume text for LLM
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const templates = [
    { 
      id: 'modern', 
      name: 'Modern Designer', 
      preview: 'Futuristic with glassmorphism' 
    },
    { 
      id: 'minimal', 
      name: 'Minimalist', 
      preview: 'Clean typography focused' 
    },
    { 
      id: 'creative', 
      name: 'Creative Showcase', 
      preview: 'Bold gradients & animations' 
    },
    { 
      id: 'professional', 
      name: 'Executive Professional', 
      preview: 'Corporate & sophisticated' 
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploadingResume(true);
      setUploadedResume(file.name);
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        setResumeContent(text); // Store full resume content for LLM
        
        // Use AI-powered parsing
        try {
          const parsed = await resumeParser.parseResumeText(text);
          
          // Auto-fill form fields
          if (parsed.name && !name) setName(parsed.name);
          if (parsed.email && !email) setEmail(parsed.email);
          if (parsed.title && !role) setRole(parsed.title);
          if (parsed.summary && !bio) setBio(parsed.summary);
          if (parsed.links.linkedin && !linkedin) setLinkedin(parsed.links.linkedin);
          if (parsed.links.github && !github) setGithub(parsed.links.github);
          if (parsed.links.website && !website) setWebsite(parsed.links.website);
          if (parsed.location && !company) setCompany(parsed.location);
        } catch (error) {
          console.error('Error parsing resume with AI:', error);
          // Fallback to basic parsing
          parseResumeText(text);
        }
        
        setIsUploadingResume(false);
      };
      reader.readAsText(file);
    }
  };

  const parseResumeText = (text: string) => {
    // Parse name (first capitalized words at top)
    const nameMatch = text.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);
    if (nameMatch && !name) {
      const fullName = nameMatch[1].trim();
      setName(fullName);
    }

    // Parse email
    const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch && !email) {
      setEmail(emailMatch[0]);
    }

    // Parse phone
    const phoneMatch = text.match(/[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}/);
    // Could add phone field if needed

    // Parse current role/job title
    const rolePatterns = [
      /(Senior|Junior|Lead|Staff|Principal|Chief)\s+([A-Z][a-z\s]+Engineer|Developer|Designer|Analyst|Manager)/i,
      /([A-Z][a-z\s]+Engineer|Developer|Designer|Analyst|Manager)/i,
      /Software\s+Engineer/i,
      /Developer/i
    ];
    
    for (const pattern of rolePatterns) {
      const roleMatch = text.match(pattern);
      if (roleMatch && !role) {
        setRole(roleMatch[0]);
        break;
      }
    }

    // Parse company
    const companyPatterns = [
      /(?:at|works? at|working at)\s+([A-Z][a-zA-Z\s&]+?)(?:\.|,|\n|$)/i,
      /([A-Z][a-zA-Z\s&]+\s+(?:Inc|LLC|Corp|Co|Technologies|Systems))/i
    ];
    
    for (const pattern of companyPatterns) {
      const companyMatch = text.match(pattern);
      if (companyMatch && !company) {
        setCompany(companyMatch[1].trim());
        break;
      }
    }

    // Parse bio/summary (usually after name)
    const summaryMatch = text.match(/(?:SUMMARY|PROFILE|OBJECTIVE)[:\s]+\s*([^\n]+(?:\n[^\n]+){0,5})/i);
    if (summaryMatch && !bio) {
      setBio(summaryMatch[1].trim());
    }

    // Parse social links
    const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/i);
    if (linkedinMatch && !linkedin) {
      setLinkedin(`https://linkedin.com/in/${linkedinMatch[1]}`);
    }

    const githubMatch = text.match(/github\.com\/([a-zA-Z0-9-]+)/i);
    if (githubMatch && !github) {
      setGithub(`https://github.com/${githubMatch[1]}`);
    }

    const websiteMatch = text.match(/(?:website|portfolio|site):\s*(https?:\/\/[^\s]+)/i);
    if (websiteMatch && !website) {
      setWebsite(websiteMatch[1]);
    }
  };

  const handleContinue = () => {
    const data = {
      name,
      email,
      role: company ? `${role} at ${company}` : role,
      bio,
      linkedin,
      github,
      website,
      profilePic,
      template,
      links: [linkedin, github, website].filter(Boolean),
      resumeContent // Pass full resume text to LLM in chat step
    };
    onComplete(data);
  };

  const isFormValid = name.trim() && email.trim() && role.trim();

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Setup Your Portfolio</h2>
          <p className="text-gray-600 mb-8">Let's start by gathering your basic information</p>

          {/* Resume Upload Section */}
          <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText size={24} className="text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Import Resume</h3>
                  <p className="text-sm text-gray-600">Upload your resume to auto-fill information</p>
                </div>
              </div>
                <div>
                  <button
                    onClick={() => resumeInputRef.current?.click()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all"
                  >
                    {uploadedResume ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        {uploadedResume}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Upload size={16} />
                        {isUploadingResume ? 'Processing...' : 'Upload'}
                      </span>
                    )}
                  </button>
                  <input
                    ref={resumeInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleResumeUpload}
                    className="hidden"
                  />
                </div>
            </div>
          </div>

          {/* Profile Picture Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
              <div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-all"
                >
                  <Upload size={16} className="inline mr-2" />
                  Upload Photo
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Software Engineer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Tech Corp"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Professional Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Social Links */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Social Links</label>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Linkedin size={20} className="text-blue-600" />
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/yourname"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <Github size={20} className="text-gray-800" />
                <input
                  type="url"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                  placeholder="https://github.com/yourname"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-purple-600" />
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Choose Template</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    template === t.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Template Preview */}
                  <div className="mb-3">
                    {t.id === 'modern' && (
                      <div className="w-full h-40 bg-gradient-to-br from-purple-600 via-blue-600 to-pink-600 rounded-lg p-3 relative overflow-hidden">
                        <div className="absolute top-2 left-2 right-2 h-2 bg-white/20 rounded"></div>
                        <div className="absolute top-6 left-2 w-8 h-8 bg-white/30 rounded-full"></div>
                        <div className="absolute top-6 right-2 w-12 h-2 bg-white/20 rounded"></div>
                        <div className="absolute bottom-6 left-2 w-16 h-2 bg-white/30 rounded"></div>
                        <div className="absolute bottom-3 right-2 w-8 h-8 bg-white/20 rounded-lg"></div>
                        <div className="absolute bottom-10 left-2 right-2 h-2 bg-white/20 rounded"></div>
                      </div>
                    )}
                    {t.id === 'minimal' && (
                      <div className="w-full h-40 bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 relative overflow-hidden">
                        <div className="absolute top-3 left-3 right-3 h-1 bg-gray-300 rounded"></div>
                        <div className="absolute top-6 left-3 w-20 h-1 bg-gray-700 rounded"></div>
                        <div className="absolute top-10 left-3 w-16 h-1 bg-gray-400 rounded"></div>
                        <div className="absolute bottom-8 left-3 right-3 grid grid-cols-3 gap-2">
                          <div className="h-12 bg-gray-100 rounded"></div>
                          <div className="h-12 bg-gray-100 rounded"></div>
                          <div className="h-12 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                    )}
                    {t.id === 'creative' && (
                      <div className="w-full h-40 bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600 rounded-lg p-3 relative overflow-hidden">
                        <div className="absolute top-2 left-2 right-2 grid grid-cols-2 gap-2">
                          <div className="h-8 bg-white/30 rounded-lg"></div>
                          <div className="h-8 bg-white/30 rounded-lg"></div>
                        </div>
                        <div className="absolute top-14 left-2 w-20 h-3 bg-white/40 rounded"></div>
                        <div className="absolute top-20 left-2 w-16 h-2 bg-white/30 rounded"></div>
                        <div className="absolute bottom-6 left-2 right-2 grid grid-cols-2 gap-1">
                          <div className="h-12 bg-white/20 rounded"></div>
                          <div className="h-12 bg-white/20 rounded"></div>
                        </div>
                        <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/30 rounded-lg rotate-12"></div>
                      </div>
                    )}
                    {t.id === 'professional' && (
                      <div className="w-full h-40 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-lg p-3 relative overflow-hidden">
                        <div className="absolute top-3 left-3 right-3 border-b border-gray-600 pb-2">
                          <div className="h-1 bg-gray-400 rounded w-3/4"></div>
                        </div>
                        <div className="absolute top-10 left-3 w-12 h-12 bg-blue-600 rounded-lg"></div>
                        <div className="absolute top-10 left-16 right-3">
                          <div className="h-1.5 bg-gray-400 rounded mb-1"></div>
                          <div className="h-1 bg-gray-500 rounded w-2/3"></div>
                        </div>
                        <div className="absolute bottom-6 left-3 right-3">
                          <div className="h-1 bg-gray-500 rounded mb-1"></div>
                          <div className="h-1 bg-gray-600 rounded w-3/4"></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{t.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">{t.preview}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <div className="flex justify-end">
            <button
              onClick={handleContinue}
              disabled={!isFormValid}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Continue
              <Briefcase size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

