/**
 * Automation Settings Component
 * Configure how AI Auto Apply behaves during job applications
 */

import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import apiService from '../../../services/apiService';

interface AutomationPreferences {
  // Timing & Speed
  applicationDelay: number; // seconds between bulk applications
  formFillDelay: number; // milliseconds between form fields
  pageLoadTimeout: number; // seconds to wait for pages

  // Behavior
  skipOptionalQuestions: boolean;
  autoAnswerStandardQuestions: boolean;
  uploadResumeAutomatically: boolean;
  saveCoverLetter: boolean;

  // Verification
  verifyBeforeSubmit: boolean;
  takeScreenshots: boolean;
  logAllActions: boolean;

  // Error Handling
  retryOnFailure: boolean;
  maxRetries: number;
  continueOnError: boolean; // for bulk operations

  // Platform Specific
  linkedinEasyApplyOnly: boolean;
  indeedQuickApplyOnly: boolean;
  skipJobsRequiringCoverLetter: boolean;
  skipJobsRequiringAssessments: boolean;

  // Notifications
  notifyOnSuccess: boolean;
  notifyOnFailure: boolean;
  emailDailySummary: boolean;
}

interface CommonQuestion {
  id: string;
  question: string;
  answer: string;
  category: 'EXPERIENCE' | 'AVAILABILITY' | 'SALARY' | 'RELOCATION' | 'OTHER';
}

export default function AutomationSettings() {
  const { theme } = useTheme();
  const [preferences, setPreferences] = useState<AutomationPreferences>({
    applicationDelay: 35,
    formFillDelay: 150,
    pageLoadTimeout: 30,
    skipOptionalQuestions: false,
    autoAnswerStandardQuestions: true,
    uploadResumeAutomatically: true,
    saveCoverLetter: false,
    verifyBeforeSubmit: true,
    takeScreenshots: true,
    logAllActions: true,
    retryOnFailure: true,
    maxRetries: 3,
    continueOnError: true,
    linkedinEasyApplyOnly: true,
    indeedQuickApplyOnly: true,
    skipJobsRequiringCoverLetter: false,
    skipJobsRequiringAssessments: true,
    notifyOnSuccess: false,
    notifyOnFailure: true,
    emailDailySummary: true
  });

  const [commonQuestions, setCommonQuestions] = useState<CommonQuestion[]>([
    {
      id: '1',
      question: 'How many years of experience do you have?',
      answer: '5 years',
      category: 'EXPERIENCE'
    },
    {
      id: '2',
      question: 'What is your expected salary?',
      answer: '$120,000 - $150,000',
      category: 'SALARY'
    },
    {
      id: '3',
      question: 'When can you start?',
      answer: '2 weeks notice',
      category: 'AVAILABILITY'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ question: '', answer: '', category: 'OTHER' as const });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.get<{
        preferences: AutomationPreferences;
        commonQuestions: CommonQuestion[];
      }>('/api/job-board/settings');

      if (data.preferences) {
        setPreferences(data.preferences);
      }
      if (data.commonQuestions) {
        setCommonQuestions(data.commonQuestions);
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      await apiService.put('/api/job-board/settings', {
        preferences,
        commonQuestions
      });

      setSaveStatus({
        type: 'success',
        message: 'Settings saved successfully!'
      });
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err.message || 'Failed to save settings'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (field: keyof AutomationPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  const addCommonQuestion = () => {
    if (!newQuestion.question || !newQuestion.answer) return;

    const question: CommonQuestion = {
      id: `q-${Date.now()}`,
      question: newQuestion.question,
      answer: newQuestion.answer,
      category: newQuestion.category
    };

    setCommonQuestions([...commonQuestions, question]);
    setNewQuestion({ question: '', answer: '', category: 'OTHER' });
    setShowAddQuestion(false);
  };

  const removeQuestion = (id: string) => {
    setCommonQuestions(commonQuestions.filter(q => q.id !== id));
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
          <h2 className="text-2xl font-bold text-gray-900">Automation Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure how AI Auto Apply behaves during job applications
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
              Save Settings
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

      {/* Timing & Speed */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Timing & Speed</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Delay (seconds)
            </label>
            <input
              type="number"
              value={preferences.applicationDelay}
              onChange={(e) => updatePreference('applicationDelay', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="10"
              max="120"
            />
            <p className="text-xs text-gray-500 mt-1">Wait time between bulk applications (10-120s)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Form Fill Delay (milliseconds)
            </label>
            <input
              type="number"
              value={preferences.formFillDelay}
              onChange={(e) => updatePreference('formFillDelay', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="50"
              max="500"
            />
            <p className="text-xs text-gray-500 mt-1">Delay between typing in fields (50-500ms)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page Load Timeout (seconds)
            </label>
            <input
              type="number"
              value={preferences.pageLoadTimeout}
              onChange={(e) => updatePreference('pageLoadTimeout', parseInt(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="10"
              max="60"
            />
            <p className="text-xs text-gray-500 mt-1">Max wait for pages to load (10-60s)</p>
          </div>
        </div>
      </div>

      {/* Behavior */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Behavior</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.skipOptionalQuestions}
              onChange={(e) => updatePreference('skipOptionalQuestions', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Skip optional questions (only fill required fields)
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.autoAnswerStandardQuestions}
              onChange={(e) => updatePreference('autoAnswerStandardQuestions', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Auto-answer standard questions (from saved responses below)
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.uploadResumeAutomatically}
              onChange={(e) => updatePreference('uploadResumeAutomatically', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Upload resume automatically when prompted
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.saveCoverLetter}
              onChange={(e) => updatePreference('saveCoverLetter', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Save cover letter for each application
            </span>
          </label>
        </div>
      </div>

      {/* Verification */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification & Logging</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.verifyBeforeSubmit}
              onChange={(e) => updatePreference('verifyBeforeSubmit', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Verify application completion before submitting
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.takeScreenshots}
              onChange={(e) => updatePreference('takeScreenshots', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Take screenshots during application process
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.logAllActions}
              onChange={(e) => updatePreference('logAllActions', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Log all automation actions for debugging
            </span>
          </label>
        </div>
      </div>

      {/* Error Handling */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Handling</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.retryOnFailure}
              onChange={(e) => updatePreference('retryOnFailure', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Retry failed applications
            </span>
          </label>

          {preferences.retryOnFailure && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Retries
              </label>
              <input
                type="number"
                value={preferences.maxRetries}
                onChange={(e) => updatePreference('maxRetries', parseInt(e.target.value))}
                className="w-32 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                max="5"
              />
            </div>
          )}

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.continueOnError}
              onChange={(e) => updatePreference('continueOnError', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Continue bulk operations even if some applications fail
            </span>
          </label>
        </div>
      </div>

      {/* Platform Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Filters</h3>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.linkedinEasyApplyOnly}
              onChange={(e) => updatePreference('linkedinEasyApplyOnly', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              LinkedIn: Only apply to Easy Apply jobs
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.indeedQuickApplyOnly}
              onChange={(e) => updatePreference('indeedQuickApplyOnly', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Indeed: Only apply to Quick Apply jobs
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.skipJobsRequiringCoverLetter}
              onChange={(e) => updatePreference('skipJobsRequiringCoverLetter', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Skip jobs requiring cover letter
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={preferences.skipJobsRequiringAssessments}
              onChange={(e) => updatePreference('skipJobsRequiringAssessments', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Skip jobs requiring skill assessments
            </span>
          </label>
        </div>
      </div>

      {/* Common Questions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Common Application Questions</h3>
          <button
            onClick={() => setShowAddQuestion(!showAddQuestion)}
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
          >
            Add Question
          </button>
        </div>

        {showAddQuestion && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                <input
                  type="text"
                  value={newQuestion.question}
                  onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., How many years of Python experience do you have?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                <input
                  type="text"
                  value={newQuestion.answer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5 years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={newQuestion.category}
                  onChange={(e) => setNewQuestion({ ...newQuestion, category: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EXPERIENCE">Experience</option>
                  <option value="AVAILABILITY">Availability</option>
                  <option value="SALARY">Salary</option>
                  <option value="RELOCATION">Relocation</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={addCommonQuestion}
                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  Save Question
                </button>
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {commonQuestions.map((q) => (
            <div key={q.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                    {q.category}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">{q.question}</p>
                <p className="text-sm text-gray-600 mt-1">→ {q.answer}</p>
              </div>
              <button
                onClick={() => removeQuestion(q.id)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> These settings control automation behavior. Longer delays reduce
          detection risk but increase application time. Recommended defaults are already set.
        </p>
      </div>
    </div>
  );
}
