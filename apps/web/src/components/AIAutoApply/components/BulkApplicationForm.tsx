/**
 * Bulk Application Form Component
 * Apply to multiple jobs at once with CSV/manual entry
 */

import React, { useState } from 'react';
import { Upload, Plus, Trash2, Loader, CheckCircle, AlertCircle, FileText, Play } from 'lucide-react';
import { useJobBoardApi } from '../../../hooks/useJobBoardApi';

interface JobEntry {
  id: string;
  jobUrl: string;
  jobTitle: string;
  company: string;
  platform: string;
  credentialId: string;
}

export default function BulkApplicationForm() {
  const { credentials, bulkApplyToJobs, isLoading } = useJobBoardApi();
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [results, setResults] = useState<{
    successful: number;
    failed: number;
    total: number;
  } | null>(null);

  const addJob = () => {
    const newJob: JobEntry = {
      id: `job-${Date.now()}`,
      jobUrl: '',
      jobTitle: '',
      company: '',
      platform: 'LINKEDIN',
      credentialId: ''
    };
    setJobs([...jobs, newJob]);
  };

  const updateJob = (id: string, field: keyof JobEntry, value: string) => {
    setJobs(jobs.map(job =>
      job.id === id ? { ...job, [field]: value } : job
    ));

    // Auto-detect platform from URL
    if (field === 'jobUrl') {
      const detectedPlatform = detectPlatform(value);
      if (detectedPlatform) {
        setJobs(jobs.map(job =>
          job.id === id ? { ...job, platform: detectedPlatform } : job
        ));
      }
    }
  };

  const removeJob = (id: string) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  const detectPlatform = (url: string): string | null => {
    if (url.includes('linkedin.com')) return 'LINKEDIN';
    if (url.includes('indeed.com')) return 'INDEED';
    if (url.includes('glassdoor.com')) return 'GLASSDOOR';
    if (url.includes('ziprecruiter.com')) return 'ZIPRECRUITER';
    return null;
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());

      // Skip header row
      const dataLines = lines.slice(1);

      const parsedJobs: JobEntry[] = dataLines.map((line, index) => {
        const [jobUrl, jobTitle, company] = line.split(',').map(s => s.trim());
        const platform = detectPlatform(jobUrl) || 'LINKEDIN';

        return {
          id: `job-${Date.now()}-${index}`,
          jobUrl: jobUrl || '',
          jobTitle: jobTitle || '',
          company: company || '',
          platform,
          credentialId: ''
        };
      });

      setJobs([...jobs, ...parsedJobs]);
    };

    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    // Validate
    const invalidJobs = jobs.filter(
      job => !job.jobUrl || !job.jobTitle || !job.company || !job.credentialId
    );

    if (invalidJobs.length > 0) {
      alert(`Please fill in all fields for ${invalidJobs.length} job(s)`);
      return;
    }

    setIsProcessing(true);
    setProgress({ completed: 0, total: jobs.length });
    setResults(null);

    try {
      const applications = jobs.map(job => ({
        jobUrl: job.jobUrl,
        platform: job.platform,
        credentialId: job.credentialId,
        jobTitle: job.jobTitle,
        company: job.company
      }));

      const result = await bulkApplyToJobs({ applications });

      setResults({
        successful: result.successful,
        failed: result.failed,
        total: result.total
      });

      // Clear jobs after successful submission
      setJobs([]);
    } catch (err: any) {
      alert(`Failed to submit applications: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'Job URL,Job Title,Company\nhttps://www.linkedin.com/jobs/view/123,Software Engineer,Acme Corp\nhttps://www.indeed.com/viewjob?jk=456,Product Manager,Tech Inc';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk-applications-template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Applications</h2>
          <p className="text-sm text-gray-600 mt-1">
            Apply to multiple jobs at once
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={downloadTemplate}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 text-sm font-medium"
          >
            <FileText size={16} />
            Download Template
          </button>
          <label className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition flex items-center gap-2 text-sm font-medium cursor-pointer">
            <Upload size={16} />
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={addJob}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium"
          >
            <Plus size={16} />
            Add Job
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Bulk Application Tips:</strong> Applications are processed one at a time with
          30-40 second delays to avoid rate limiting. Expect {jobs.length} jobs to take approximately{' '}
          {Math.ceil((jobs.length * 35) / 60)} minutes.
        </p>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="text-green-600" size={32} />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bulk Application Complete</h3>
              <p className="text-sm text-gray-600">Results from your batch submission</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-900">{results.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{results.successful}</p>
              <p className="text-sm text-green-700">Successful</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{results.failed}</p>
              <p className="text-sm text-red-700">Failed</p>
            </div>
          </div>
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Added</h3>
          <p className="text-gray-600 mb-4">
            Add jobs manually or upload a CSV file to get started
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={addJob}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Add First Job
            </button>
            <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer">
              Upload CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <div key={job.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center font-semibold text-blue-600 text-sm">
                  {index + 1}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="url"
                      value={job.jobUrl}
                      onChange={(e) => updateJob(job.id, 'jobUrl', e.target.value)}
                      placeholder="Job URL"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={job.jobTitle}
                      onChange={(e) => updateJob(job.id, 'jobTitle', e.target.value)}
                      placeholder="Job Title"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={job.company}
                      onChange={(e) => updateJob(job.id, 'company', e.target.value)}
                      placeholder="Company"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <select
                      value={job.credentialId}
                      onChange={(e) => updateJob(job.id, 'credentialId', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Account</option>
                      {credentials
                        .filter(c => c.platform === job.platform && c.isActive)
                        .map(cred => (
                          <option key={cred.id} value={cred.id}>
                            {cred.email}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium flex-1 text-center">
                      {job.platform}
                    </span>
                    <button
                      onClick={() => removeJob(job.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
            <div>
              <p className="font-medium text-gray-900">Ready to submit {jobs.length} applications</p>
              <p className="text-sm text-gray-600">
                Estimated time: {Math.ceil((jobs.length * 35) / 60)} minutes
              </p>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isProcessing || jobs.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {isProcessing ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Processing... ({progress.completed}/{progress.total})
                </>
              ) : (
                <>
                  <Play size={20} />
                  Submit All Applications
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
