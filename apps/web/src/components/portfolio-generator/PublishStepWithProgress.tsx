/**
 * Enhanced PublishStep with Deployment Progress
 * Section 1.6 requirement #5: Progress bar showing deployment stages
 * Shows: "Validating data..." → "Building site..." → "Uploading files..." → "Provisioning SSL..." → "Done!"
 */

'use client';

import React, { useState } from 'react';
import { Download, Globe, Share2, CheckCircle, Package, ExternalLink, Rocket } from 'lucide-react';
import { DeploymentProgress, useDeploymentProgress } from '../loading/ProgressBar';
import { toast } from '../../utils/toast';

interface ProjectExportData {
  title?: string;
  description?: string;
  technologies?: string[];
}

interface PortfolioExportData {
  name?: string;
  profilePic?: string;
  role?: string;
  professionalBio?: string;
  bio?: string;
  email?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  projects?: ProjectExportData[];
  [key: string]: unknown;
}

type HostingOption = 'export' | 'roleready' | 'custom';

interface PublishStepWithProgressProps {
  portfolioData: PortfolioExportData | null;
  onExport?: () => void;
  onPublish?: () => void;
}

export default function PublishStepWithProgress({
  portfolioData,
  onExport,
  onPublish,
}: PublishStepWithProgressProps) {
  const [hostingOption, setHostingOption] = useState<HostingOption>('roleready');
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');

  // Deployment progress hook (Section 1.6 requirement #5)
  const { currentStage, isDeploying, isDone, startDeployment, reset } = useDeploymentProgress();

  const handleDeploy = async () => {
    if (!portfolioData) {
      toast.error('No portfolio data', 'Please complete the previous steps first.');
      return;
    }

    // Start deployment with progress tracking
    await startDeployment(
      () => {
        // On complete
        toast.success('Portfolio published!', 'Your portfolio is now live.');
        if (onPublish) {
          onPublish();
        }
      },
      (error) => {
        // On error
        toast.error('Deployment failed', error.message);
      }
    );
  };

  const handleExport = () => {
    if (!portfolioData) {
      toast.error('No portfolio data', 'Please complete the previous steps first.');
      return;
    }

    toast.success('Portfolio downloaded', 'Your portfolio files have been downloaded.');
    if (onExport) {
      onExport();
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Publish Your Portfolio</h2>
          <p className="text-gray-600 mb-8">Choose how you want to publish your portfolio</p>

          {/* Hosting Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* RoleReady Hosting */}
            <button
              type="button"
              onClick={() => setHostingOption('roleready')}
              disabled={isDeploying}
              className={`p-6 border-2 rounded-xl text-left transition-all ${
                hostingOption === 'roleready'
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="text-purple-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">RoleReady Hosting</h3>
              </div>
              <p className="text-sm text-gray-600">Instant deployment with free SSL</p>
            </button>

            {/* Custom Domain */}
            <button
              type="button"
              onClick={() => setHostingOption('custom')}
              disabled={isDeploying}
              className={`p-6 border-2 rounded-xl text-left transition-all ${
                hostingOption === 'custom'
                  ? 'border-blue-500 bg-blue-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Share2 className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Custom Domain</h3>
              </div>
              <p className="text-sm text-gray-600">Use your own domain name</p>
            </button>

            {/* Download Files */}
            <button
              type="button"
              onClick={() => setHostingOption('export')}
              disabled={isDeploying}
              className={`p-6 border-2 rounded-xl text-left transition-all ${
                hostingOption === 'export'
                  ? 'border-green-500 bg-green-50 shadow-lg'
                  : 'border-gray-200 hover:border-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Download className="text-green-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Download Files</h3>
              </div>
              <p className="text-sm text-gray-600">Host on your own server</p>
            </button>
          </div>

          {/* Deployment Progress (Section 1.6 requirement #5) */}
          {isDeploying && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <DeploymentProgress currentStage={currentStage} />
            </div>
          )}

          {/* Success State */}
          {isDone && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={32} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    Portfolio Published Successfully!
                  </h3>
                  <p className="text-green-800 mb-4">
                    Your portfolio is now live and accessible to everyone.
                  </p>
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://${subdomain || 'your-portfolio'}.roleready.portfolio`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink size={16} />
                      View Portfolio
                    </a>
                    <button
                      type="button"
                      onClick={reset}
                      className="px-4 py-2 border border-green-600 text-green-700 rounded-lg font-medium hover:bg-green-50 transition-colors"
                    >
                      Publish Another
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuration */}
          {!isDone && (
            <div className="space-y-6 mb-8">
              {hostingOption === 'roleready' && (
                <div>
                  <label htmlFor="publish-subdomain" className="block text-sm font-medium text-gray-700 mb-2">
                    Choose Subdomain
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">https://</span>
                    <input
                      id="publish-subdomain"
                      type="text"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                      disabled={isDeploying}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder="your-name"
                    />
                    <span className="text-gray-500">.roleready.portfolio</span>
                  </div>
                </div>
              )}

              {hostingOption === 'custom' && (
                <div>
                  <label htmlFor="publish-custom-domain" className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Domain
                  </label>
                  <input
                    id="publish-custom-domain"
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    disabled={isDeploying}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="yourdomain.com"
                  />
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {!isDone && (
            <div className="flex justify-end gap-3">
              {hostingOption === 'export' ? (
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={isDeploying}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Download size={20} />
                  Download Files
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDeploy}
                  disabled={isDeploying || !portfolioData}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Rocket size={20} />
                  {isDeploying ? 'Deploying...' : 'Deploy Portfolio'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
