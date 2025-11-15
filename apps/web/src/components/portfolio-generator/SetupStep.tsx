'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Upload, User, Briefcase, Linkedin, Github, Globe } from 'lucide-react';
import {
  validateName,
  validateEmail,
  validateURL,
  validateBio,
  validateImageFile,
  sanitizeText,
  collectFormErrors,
  isFormValid,
  VALIDATION_LIMITS,
} from '../../utils/formValidation';
import { ValidationMessage } from '../validation/ValidationMessage';
import { CharacterCount } from '../validation/CharacterCount';
import { FormValidationSummary } from '../validation/FormValidationSummary';
import { LoadingOverlay, ButtonSpinner } from '../loading/LoadingSpinner';

interface SetupProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentRole?: string;
  currentCompany?: string;
  professionalBio?: string;
  bio?: string;
  professionalSummary?: {
    overview?: string;
  };
  linkedin?: string;
  github?: string;
  website?: string;
  portfolio?: string;
  profilePicture?: string;
}

interface SetupFormData {
  name: string;
  email: string;
  role: string;
  bio: string;
  professionalBio: string;
  linkedin: string;
  github: string;
  website: string;
  profilePic: string | null;
  template: string;
  links: string[];
}

interface SetupStepProps {
  profileData?: SetupProfileData;
  onComplete: (data: SetupFormData) => void;
}

interface FieldState {
  value: string;
  touched: boolean;
}

export default function SetupStep({ profileData, onComplete }: SetupStepProps) {
  const initialName = profileData ? `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() : '';

  // Loading states (Section 1.6)
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Field states
  const [name, setName] = useState<FieldState>({ value: initialName, touched: false });
  const [email, setEmail] = useState<FieldState>({ value: profileData?.email ?? '', touched: false });
  const [role, setRole] = useState<FieldState>({ value: profileData?.currentRole ?? '', touched: false });
  const [company, setCompany] = useState<string>(profileData?.currentCompany ?? '');
  const [bio, setBio] = useState<FieldState>({
    value: profileData?.professionalBio ?? profileData?.bio ?? profileData?.professionalSummary?.overview ?? '',
    touched: false,
  });
  const [linkedin, setLinkedin] = useState<FieldState>({ value: profileData?.linkedin ?? '', touched: false });
  const [github, setGithub] = useState<FieldState>({ value: profileData?.github ?? '', touched: false });
  const [website, setWebsite] = useState<FieldState>({
    value: profileData?.website ?? profileData?.portfolio ?? '',
    touched: false,
  });
  const [profilePic, setProfilePic] = useState<string | null>(profileData?.profilePicture ?? null);
  const [template, setTemplate] = useState<string>('modern');

  // Validation state
  const [imageError, setImageError] = useState<string>('');
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate loading profile data on mount (Section 1.6 requirement #1)
  useEffect(() => {
    const loadProfileData = async () => {
      // Simulate fetching profile data
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsInitialLoading(false);
    };

    loadProfileData();
  }, []);

  const templates = [
    {
      id: 'modern',
      name: 'Modern Designer',
      preview: 'Futuristic with glassmorphism',
    },
    {
      id: 'minimal',
      name: 'Minimalist',
      preview: 'Clean typography focused',
    },
    {
      id: 'creative',
      name: 'Creative Showcase',
      preview: 'Bold gradients & animations',
    },
    {
      id: 'professional',
      name: 'Executive Professional',
      preview: 'Corporate & sophisticated',
    },
  ];

  // Validation
  const nameValidation = validateName(name.value);
  const emailValidation = validateEmail(email.value);
  const roleValidation = validateName(role.value); // Uses same validation as name
  const bioValidation = validateBio(bio.value);
  const linkedinValidation = validateURL(linkedin.value, 'LinkedIn URL', false);
  const githubValidation = validateURL(github.value, 'GitHub URL', false);
  const websiteValidation = validateURL(website.value, 'Website URL', false);

  const validations = {
    name: nameValidation,
    email: emailValidation,
    role: roleValidation,
    bio: bioValidation,
    linkedin: linkedinValidation,
    github: githubValidation,
    website: websiteValidation,
  };

  const formErrors = collectFormErrors(validations);
  const formValid = isFormValid(validations);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate image file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setImageError(validation.error || '');
      return;
    }

    setImageError('');

    // Read and set image
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePic(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleContinue = async () => {
    setAttemptedSubmit(true);

    // Mark all fields as touched
    setName(prev => ({ ...prev, touched: true }));
    setEmail(prev => ({ ...prev, touched: true }));
    setRole(prev => ({ ...prev, touched: true }));
    setBio(prev => ({ ...prev, touched: true }));
    setLinkedin(prev => ({ ...prev, touched: true }));
    setGithub(prev => ({ ...prev, touched: true }));
    setWebsite(prev => ({ ...prev, touched: true }));

    if (!formValid) {
      // Scroll to top to show errors
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Set saving state (Section 1.6 requirement #2)
    setIsSaving(true);

    try {
      // Sanitize all text inputs before submitting
      const data: SetupFormData = {
        name: sanitizeText(name.value),
        email: email.value.trim(),
        role: company ? `${sanitizeText(role.value)} at ${sanitizeText(company)}` : sanitizeText(role.value),
        bio: sanitizeText(bio.value),
        professionalBio: sanitizeText(bio.value),
        linkedin: linkedin.value.trim(),
        github: github.value.trim(),
        website: website.value.trim(),
        profilePic,
        template,
        links: [linkedin.value, github.value, website.value].filter(Boolean),
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      onComplete(data);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 relative">
          {/* Loading overlay when fetching profile data (Section 1.6 requirement #1) */}
          {isInitialLoading && <LoadingOverlay text="Loading your profile..." />}

          <h2 className="text-3xl font-bold text-gray-900 mb-6">Setup Your Portfolio</h2>
          <p className="text-gray-600 mb-8">Let's start by gathering your basic information</p>

          {/* Form Validation Summary */}
          <FormValidationSummary errors={formErrors} show={attemptedSubmit && !formValid} />

          {/* Profile Picture Upload */}
          <div className="mb-8">
            <p className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</p>
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-purple-500 hover:text-purple-600 transition-all"
                >
                  <Upload size={16} className="inline mr-2" />
                  Upload Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={VALIDATION_LIMITS.ALLOWED_FILE_TYPES?.IMAGE?.join(',') || 'image/*'}
                  className="hidden"
                  onChange={handleImageUpload}
                  aria-label="Upload profile picture"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Max size: 5MB. Allowed: JPG, PNG, WebP
                </p>
                <ValidationMessage error={imageError} />
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Name Field */}
            <div>
              <label htmlFor="setup-full-name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                id="setup-full-name"
                type="text"
                value={name.value}
                onChange={e => setName({ value: e.target.value, touched: name.touched })}
                onBlur={() => setName(prev => ({ ...prev, touched: true }))}
                placeholder="John Doe"
                maxLength={VALIDATION_LIMITS.NAME.MAX}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  !nameValidation.isValid && (name.touched || attemptedSubmit)
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                <ValidationMessage error={nameValidation.error} show={name.touched || attemptedSubmit} />
                <CharacterCount
                  current={nameValidation.charCount || 0}
                  max={nameValidation.maxChars || VALIDATION_LIMITS.NAME.MAX}
                  className="ml-auto"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="setup-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <input
                id="setup-email"
                type="email"
                value={email.value}
                onChange={e => setEmail({ value: e.target.value, touched: email.touched })}
                onBlur={() => setEmail(prev => ({ ...prev, touched: true }))}
                placeholder="john@example.com"
                maxLength={VALIDATION_LIMITS.EMAIL.MAX}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  !emailValidation.isValid && (email.touched || attemptedSubmit)
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <ValidationMessage error={emailValidation.error} show={email.touched || attemptedSubmit} />
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="setup-role" className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-600">*</span>
              </label>
              <input
                id="setup-role"
                type="text"
                value={role.value}
                onChange={e => setRole({ value: e.target.value, touched: role.touched })}
                onBlur={() => setRole(prev => ({ ...prev, touched: true }))}
                placeholder="Software Engineer"
                maxLength={VALIDATION_LIMITS.ROLE.MAX}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  !roleValidation.isValid && (role.touched || attemptedSubmit)
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              <div className="flex items-center justify-between mt-1">
                <ValidationMessage error={roleValidation.error} show={role.touched || attemptedSubmit} />
                <CharacterCount
                  current={roleValidation.charCount || 0}
                  max={roleValidation.maxChars || VALIDATION_LIMITS.ROLE.MAX}
                  className="ml-auto"
                />
              </div>
            </div>

            {/* Company Field */}
            <div>
              <label htmlFor="setup-company" className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                id="setup-company"
                type="text"
                value={company}
                onChange={e => setCompany(e.target.value)}
                placeholder="Tech Corp"
                maxLength={100}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label htmlFor="setup-bio" className="block text-sm font-medium text-gray-700 mb-2">
              Professional Bio
            </label>
            <textarea
              id="setup-bio"
              value={bio.value}
              onChange={e => setBio({ value: e.target.value, touched: bio.touched })}
              onBlur={() => setBio(prev => ({ ...prev, touched: true }))}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={VALIDATION_LIMITS.BIO.MAX}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                !bioValidation.isValid && (bio.touched || attemptedSubmit)
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
            />
            <div className="flex items-center justify-between mt-1">
              <ValidationMessage error={bioValidation.error} show={bio.touched || attemptedSubmit} />
              <CharacterCount
                current={bioValidation.charCount || 0}
                max={bioValidation.maxChars || VALIDATION_LIMITS.BIO.MAX}
                className="ml-auto"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="mb-8">
            <p className="block text-sm font-medium text-gray-700 mb-3">Social Links</p>
            <div className="space-y-3">
              {/* LinkedIn */}
              <div>
                <div className="flex items-center gap-3">
                  <Linkedin size={20} className="text-blue-600 flex-shrink-0" />
                  <div className="flex-1">
                    <input
                      type="url"
                      value={linkedin.value}
                      onChange={e => setLinkedin({ value: e.target.value, touched: linkedin.touched })}
                      onBlur={() => setLinkedin(prev => ({ ...prev, touched: true }))}
                      placeholder="https://linkedin.com/in/yourname"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        !linkedinValidation.isValid && (linkedin.touched || attemptedSubmit)
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <ValidationMessage error={linkedinValidation.error} show={linkedin.touched || attemptedSubmit} />
              </div>

              {/* GitHub */}
              <div>
                <div className="flex items-center gap-3">
                  <Github size={20} className="text-gray-800 flex-shrink-0" />
                  <div className="flex-1">
                    <input
                      type="url"
                      value={github.value}
                      onChange={e => setGithub({ value: e.target.value, touched: github.touched })}
                      onBlur={() => setGithub(prev => ({ ...prev, touched: true }))}
                      placeholder="https://github.com/yourname"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        !githubValidation.isValid && (github.touched || attemptedSubmit)
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <ValidationMessage error={githubValidation.error} show={github.touched || attemptedSubmit} />
              </div>

              {/* Website */}
              <div>
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-purple-600 flex-shrink-0" />
                  <div className="flex-1">
                    <input
                      type="url"
                      value={website.value}
                      onChange={e => setWebsite({ value: e.target.value, touched: website.touched })}
                      onBlur={() => setWebsite(prev => ({ ...prev, touched: true }))}
                      placeholder="https://yourwebsite.com"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        !websiteValidation.isValid && (website.touched || attemptedSubmit)
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <ValidationMessage error={websiteValidation.error} show={website.touched || attemptedSubmit} />
              </div>
            </div>
          </div>

          {/* Template Selection */}
          <div className="mb-8">
            <p className="block text-sm font-medium text-gray-700 mb-3">Choose Template</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {templates.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t.id)}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    template === t.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
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
              type="button"
              onClick={handleContinue}
              disabled={(!formValid && attemptedSubmit) || isSaving}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              title={!formValid ? 'Please fix validation errors' : isSaving ? 'Saving...' : ''}
            >
              {isSaving ? (
                <>
                  <ButtonSpinner size="sm" variant="white" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <Briefcase size={20} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
