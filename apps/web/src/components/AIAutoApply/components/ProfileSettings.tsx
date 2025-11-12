/**
 * User Profile Settings for AI Auto Apply
 * Manages user data that auto-fills job application forms
 */

import React, { useState, useEffect } from 'react';
import { User, Save, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import apiService from '../../../services/apiService';

interface UserProfileData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Professional Links
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  websiteUrl: string;

  // Work Authorization
  workAuthorization: 'US_CITIZEN' | 'GREEN_CARD' | 'VISA' | 'NEED_SPONSORSHIP' | '';
  requiresSponsorship: boolean;

  // Preferences
  desiredSalary: string;
  earliestStartDate: string;
  willingToRelocate: boolean;
  preferredWorkType: 'ONSITE' | 'REMOTE' | 'HYBRID' | 'ANY' | '';

  // Default Resume
  defaultResumeId: string;

  // Years of Experience
  yearsOfExperience: number;
}

export default function ProfileSettings() {
  const { theme } = useTheme();
  const [profile, setProfile] = useState<UserProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    websiteUrl: '',
    workAuthorization: '',
    requiresSponsorship: false,
    desiredSalary: '',
    earliestStartDate: '',
    willingToRelocate: false,
    preferredWorkType: '',
    defaultResumeId: '',
    yearsOfExperience: 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.get<{ profile: UserProfileData }>('/api/user/profile');
      if (data.profile) {
        setProfile(data.profile);
      }
    } catch (err: any) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      await apiService.put('/api/user/profile', profile);
      setSaveStatus({
        type: 'success',
        message: 'Profile saved successfully! This data will auto-fill job applications.'
      });
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err.message || 'Failed to save profile'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: keyof UserProfileData, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure your information for auto-filling job applications
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2 font-medium"
        >
          {isSaving ? (
            <>
              <Loader className="animate-spin" size={20} />
              Saving...
            </>
          ) : (
            <>
              <Save size={20} />
              Save Profile
            </>
          )}
        </button>
      </div>

      {/* Save Status */}
      {saveStatus.type && (
        <div className={`flex items-center gap-2 p-3 rounded-lg ${
          saveStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {saveStatus.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span className="text-sm">{saveStatus.message}</span>
        </div>
      )}

      {/* Personal Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john.doe@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={profile.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={profile.city}
              onChange={(e) => updateField('city', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="San Francisco"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <input
              type="text"
              value={profile.state}
              onChange={(e) => updateField('state', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="CA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
            <input
              type="text"
              value={profile.zipCode}
              onChange={(e) => updateField('zipCode', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="94102"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={profile.country}
              onChange={(e) => updateField('country', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="United States"
            />
          </div>
        </div>
      </div>

      {/* Professional Links */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={profile.linkedinUrl}
              onChange={(e) => updateField('linkedinUrl', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://linkedin.com/in/johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
            <input
              type="url"
              value={profile.githubUrl}
              onChange={(e) => updateField('githubUrl', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://github.com/johndoe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
            <input
              type="url"
              value={profile.portfolioUrl}
              onChange={(e) => updateField('portfolioUrl', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://portfolio.johndoe.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
            <input
              type="url"
              value={profile.websiteUrl}
              onChange={(e) => updateField('websiteUrl', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://johndoe.com"
            />
          </div>
        </div>
      </div>

      {/* Work Authorization */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Authorization</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Authorization Status</label>
            <select
              value={profile.workAuthorization}
              onChange={(e) => updateField('workAuthorization', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="US_CITIZEN">U.S. Citizen</option>
              <option value="GREEN_CARD">Green Card Holder</option>
              <option value="VISA">Work Visa (H1B, etc.)</option>
              <option value="NEED_SPONSORSHIP">Need Sponsorship</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <input
              type="number"
              value={profile.yearsOfExperience}
              onChange={(e) => updateField('yearsOfExperience', parseInt(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5"
              min="0"
              max="50"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiresSponsorship"
              checked={profile.requiresSponsorship}
              onChange={(e) => updateField('requiresSponsorship', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="requiresSponsorship" className="ml-2 text-sm text-gray-700">
              Requires visa sponsorship
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="willingToRelocate"
              checked={profile.willingToRelocate}
              onChange={(e) => updateField('willingToRelocate', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="willingToRelocate" className="ml-2 text-sm text-gray-700">
              Willing to relocate
            </label>
          </div>
        </div>
      </div>

      {/* Job Preferences */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Work Type</label>
            <select
              value={profile.preferredWorkType}
              onChange={(e) => updateField('preferredWorkType', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select...</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
              <option value="ONSITE">On-site</option>
              <option value="ANY">Any</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desired Salary</label>
            <input
              type="text"
              value={profile.desiredSalary}
              onChange={(e) => updateField('desiredSalary', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="$120,000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Earliest Start Date</label>
            <input
              type="date"
              value={profile.earliestStartDate}
              onChange={(e) => updateField('earliestStartDate', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Auto-Fill:</strong> This information will automatically fill job application forms
          when you use AI Auto Apply. Make sure all required fields (*) are completed for best results.
        </p>
      </div>
    </div>
  );
}
