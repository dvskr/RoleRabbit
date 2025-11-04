'use client';

import React, { useState, useRef } from 'react';
import { Upload, User, Mail, Briefcase, Linkedin, Github, Globe, X, CheckCircle, FileText } from 'lucide-react';

interface SetupStepProps {
  profileData?: any;
  onComplete: (data: any) => void;
}

export default function SetupStep({ profileData, onComplete }: SetupStepProps) {
  const [name, setName] = useState(profileData ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() : '');
  const [email, setEmail] = useState(profileData?.email || '');
  const [role, setRole] = useState(profileData?.currentRole || '');
  const [company, setCompany] = useState(profileData?.currentCompany || '');
  const [bio, setBio] = useState(profileData?.professionalBio ?? profileData?.bio ?? profileData?.professionalSummary?.overview ?? '');
  const [linkedin, setLinkedin] = useState(profileData?.linkedin || '');
  const [github, setGithub] = useState(profileData?.github || '');
  const [website, setWebsite] = useState(profileData?.website || profileData?.portfolio || '');
  const [profilePic, setProfilePic] = useState(profileData?.profilePicture || null);
  const [template, setTemplate] = useState('modern');
  const fileInputRef = useRef<HTMLInputElement>(null);

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


  const handleContinue = () => {
    const data = {
      name,
      email,
      role: company ? `${role} at ${company}` : role,
      bio,
      professionalBio: bio,
      linkedin,
      github,
      website,
      profilePic,
      template,
      links: [linkedin, github, website].filter(Boolean)
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
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} aria-label="Upload profile picture" />
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

