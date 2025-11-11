/**
 * Apply to Job Form Component
 * Single job application interface with platform auto-detection
 */

import React, { useState, useEffect } from 'react';
import { Send, Loader, CheckCircle, XCircle, AlertCircle, ExternalLink, Briefcase } from 'lucide-react';
import { useJobBoardApi, ApplyToJobData } from '../../../hooks/useJobBoardApi';
import { useTheme } from '../../../contexts/ThemeContext';

interface ApplyToJobFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function ApplyToJobForm({ onSuccess, onError }: ApplyToJobFormProps) {
  const {
    credentials,
    applyToLinkedInJob,
    applyToIndeedJob,
    isLoading
  } = useJobBoardApi();

  const [jobUrl, setJobUrl] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [selectedCredentialId, setSelectedCredentialId] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Auto-detect platform from URL
  useEffect(() => {
    if (!jobUrl) {
      setDetectedPlatform(null);
      return;
    }

    if (jobUrl.includes('linkedin.com')) {
      setDetectedPlatform('LINKEDIN');
    } else if (jobUrl.includes('indeed.com')) {
      setDetectedPlatform('INDEED');
    } else if (jobUrl.includes('glassdoor.com')) {
      setDetectedPlatform('GLASSDOOR');
    } else if (jobUrl.includes('ziprecruiter.com')) {
      setDetectedPlatform('ZIPRECRUITER');
    } else {
      setDetectedPlatform(null);
    }
  }, [jobUrl]);

  // Filter credentials by detected platform
  const availableCredentials = detectedPlatform
    ? credentials.filter(c => c.platform === detectedPlatform && c.isActive)
    : [];

  // Auto-select credential if only one available
  useEffect(() => {
    if (availableCredentials.length === 1 && !selectedCredentialId) {
      setSelectedCredentialId(availableCredentials[0].id);
    }
  }, [availableCredentials, selectedCredentialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      // Validate
      if (!jobUrl || !jobTitle || !company || !selectedCredentialId) {
        throw new Error('Please fill in all required fields');
      }

      if (!detectedPlatform) {
        throw new Error('Could not detect job board platform from URL');
      }

      if (availableCredentials.length === 0) {
        throw new Error(`No active credentials found for ${detectedPlatform}`);
      }

      // Load user profile data for auto-filling
      let userProfile: any = {};
      try {
        const profileData = await fetch('/api/user/profile', {
          credentials: 'include'
        });
        if (profileData.ok) {
          const json = await profileData.json();
          userProfile = json.profile || {};
        }
      } catch (err) {
        console.warn('Could not load user profile, using defaults');
      }

      // Prepare application data
      const applicationData: ApplyToJobData = {
        credentialId: selectedCredentialId,
        jobUrl,
        jobTitle,
        company,
        jobDescription: jobDescription || undefined,
        userData: {
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          email: userProfile.email || credentials.find(c => c.id === selectedCredentialId)?.email || '',
          phone: userProfile.phone || '',
          linkedin: userProfile.linkedinUrl || '',
          github: userProfile.githubUrl || '',
          portfolio: userProfile.portfolioUrl || ''
        }
      };

      // Apply to job based on platform
      let result;
      if (detectedPlatform === 'LINKEDIN') {
        result = await applyToLinkedInJob(applicationData);
      } else if (detectedPlatform === 'INDEED') {
        result = await applyToIndeedJob(applicationData);
      } else {
        throw new Error(`Platform ${detectedPlatform} is not yet supported`);
      }

      setSubmitStatus({
        type: 'success',
        message: result.message || 'Application submitted successfully!'
      });

      // Reset form
      setJobUrl('');
      setJobTitle('');
      setCompany('');
      setJobDescription('');
      setSelectedCredentialId('');
      setDetectedPlatform(null);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to submit application';
      setSubmitStatus({
        type: 'error',
        message: errorMessage
      });

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case 'LINKEDIN':
        return 'bg-blue-100 text-blue-800';
      case 'INDEED':
        return 'bg-green-100 text-green-800';
      case 'GLASSDOOR':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Briefcase className="text-blue-600" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Apply to Job</h3>
          <p className="text-sm text-gray-600">Automated application with AI</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Job URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job URL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="url"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.linkedin.com/jobs/view/..."
              required
            />
            {detectedPlatform && (
              <span className={`absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded text-xs font-medium ${getPlatformBadgeColor(detectedPlatform)}`}>
                {detectedPlatform}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Paste the full URL from LinkedIn or Indeed
          </p>
        </div>

        {/* Platform Detection Warning */}
        {jobUrl && !detectedPlatform && (
          <div className="flex items-center gap-2 text-yellow-700 text-sm bg-yellow-50 p-3 rounded-lg">
            <AlertCircle size={16} />
            <span>Could not detect platform. Make sure the URL is from LinkedIn or Indeed.</span>
          </div>
        )}

        {/* No Credentials Warning */}
        {detectedPlatform && availableCredentials.length === 0 && (
          <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 p-3 rounded-lg">
            <AlertCircle size={16} />
            <span>
              No active credentials found for {detectedPlatform}.{' '}
              <a href="#" className="underline font-medium">Add one now</a>
            </span>
          </div>
        )}

        {/* Credential Selection */}
        {availableCredentials.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedCredentialId}
              onChange={(e) => setSelectedCredentialId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select an account</option>
              {availableCredentials.map((cred) => (
                <option key={cred.id} value={cred.id}>
                  {cred.email} {cred.isConnected ? '✓' : '(Not Verified)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Software Engineer"
            required
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Acme Corp"
            required
          />
        </div>

        {/* Job Description (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job Description (Optional)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Paste job description for better tracking..."
          />
        </div>

        {/* Status Messages */}
        {submitStatus.type === 'success' && (
          <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-3 rounded-lg">
            <CheckCircle size={16} />
            <span>{submitStatus.message}</span>
          </div>
        )}

        {submitStatus.type === 'error' && (
          <div className="flex items-center gap-2 text-red-700 text-sm bg-red-50 p-3 rounded-lg">
            <XCircle size={16} />
            <span>{submitStatus.message}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !detectedPlatform || availableCredentials.length === 0}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader className="animate-spin" size={20} />
              Applying...
            </>
          ) : (
            <>
              <Send size={20} />
              Apply to Job
            </>
          )}
        </button>

        {/* Info */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>How it works:</strong> Our AI will open the job page, log into your account,
            and automatically fill out the application form. This usually takes 30-60 seconds.
          </p>
        </div>
      </form>
    </div>
  );
}
