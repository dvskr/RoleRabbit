'use client';

import React, { useState } from 'react';
import { Globe, Server, Cloud, Upload, CheckCircle, ExternalLink, Copy } from 'lucide-react';
import { WebsiteConfig } from '../../../types/portfolio';
import { downloadPortfolio } from '../../utils/portfolioExporter';

interface HostingConfigProps {
  onNext: () => void;
  onBack: () => void;
  config: WebsiteConfig;
  onUpdate: (config: Partial<WebsiteConfig>) => void;
  portfolioData: any;
}

type HostingOption = 'subdomain' | 'custom' | 'download';

export default function HostingConfig({ onNext, onBack, config, portfolioData }: HostingConfigProps) {
  const [hostingType, setHostingType] = useState<HostingOption>('subdomain');
  const [subdomain, setSubdomain] = useState<string>('john-doe');
  const [customDomain, setCustomDomain] = useState<string>('johndoe.com');
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const portfolioUrl = hostingType === 'subdomain'
    ? `https://${subdomain}.roleready.portfolio`
    : hostingType === 'custom'
    ? `https://${customDomain}`
    : null;

  const handleDeploy = () => {
    setIsDeploying(true);
    
    // Simulate deployment
    setTimeout(() => {
      setIsDeploying(false);
      setIsDeployed(true);
    }, 2000);
  };

  const handleCopyUrl = () => {
    if (portfolioUrl) {
      navigator.clipboard.writeText(portfolioUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Publish Your Portfolio</h2>
            <p className="text-gray-600 text-sm mt-1">Choose how you want to host your portfolio website</p>
          </div>
          {isDeployed && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle size={20} />
              <span className="font-semibold">Published!</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Hosting Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Subdomain Option */}
            <button
              onClick={() => setHostingType('subdomain')}
              className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                hostingType === 'subdomain'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Globe className="text-blue-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Free Subdomain</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Host your portfolio on RoleReady's platform for free
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
                <span>Instant deployment</span>
              </div>
            </button>

            {/* Custom Domain Option */}
            <button
              onClick={() => setHostingType('custom')}
              className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                hostingType === 'custom'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Server className="text-purple-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Custom Domain</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Use your own domain name for a professional touch
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-purple-600">
                <span>Professional URL</span>
              </div>
            </button>

            {/* Download Option */}
            <button
              onClick={() => setHostingType('download')}
              className={`p-6 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                hostingType === 'download'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Upload className="text-green-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900">Download Files</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Download static files to host anywhere you want
              </p>
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <span>Full control</span>
              </div>
            </button>
          </div>

          {/* Configuration Panel */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4">Configuration</h3>
            
            {hostingType === 'subdomain' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subdomain
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center border border-gray-300 rounded-lg px-4 py-2.5">
                      <span className="text-gray-500">https://</span>
                      <input
                        type="text"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value)}
                        className="flex-1 px-2 py-1 outline-none text-gray-900"
                        placeholder="your-name"
                      />
                      <span className="text-gray-500">.roleready.portfolio</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Your portfolio will be available at this URL
                  </p>
                </div>
              </div>
            )}

            {hostingType === 'custom' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Domain
                  </label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900"
                    placeholder="yourdomain.com"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    You'll need to update your domain's DNS records
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">DNS Configuration</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>Add these DNS records to your domain:</p>
                    <div className="bg-white rounded px-3 py-2 font-mono text-xs">
                      <div>Type: CNAME</div>
                      <div>Name: @</div>
                      <div>Value: portfolio.roleready.io</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {hostingType === 'download' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Download Instructions</h4>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li>✓ Static HTML, CSS, and JavaScript files</li>
                    <li>✓ No database required</li>
                    <li>✓ Compatible with any hosting service</li>
                    <li>✓ Can be hosted on GitHub Pages, Netlify, Vercel, or any web server</li>
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Recommended Hosting Platforms</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['GitHub Pages', 'Netlify', 'Vercel', 'Cloudflare Pages', 'AWS S3'].map((platform) => (
                      <span
                        key={platform}
                        className="px-3 py-1 bg-white rounded-md text-xs font-medium text-blue-900 border border-blue-200"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preview URL */}
            {portfolioUrl && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Portfolio URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={portfolioUrl}
                    readOnly
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Copy URL"
                  >
                    <Copy size={18} />
                  </button>
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <ExternalLink size={18} />
                    Visit
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Deployment Status */}
          {isDeployed && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-1">Deployment Successful!</h4>
                  <p className="text-sm text-green-800 mb-3">
                    Your portfolio has been published and is now live.
                  </p>
                  {portfolioUrl && (
                    <a
                      href={portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      <ExternalLink size={16} />
                      Visit Your Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-between items-center">
        <button
          onClick={onBack}
          className="px-6 py-2.5 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
        >
          Back
        </button>
        <div className="flex items-center gap-4">
          {hostingType === 'download' ? (
            <button
              onClick={() => downloadPortfolio(config, portfolioData)}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-green-500/30 hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Upload size={18} />
              Download Files
            </button>
          ) : (
            <button
              onClick={handleDeploy}
              disabled={isDeploying || isDeployed}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeploying ? (
                <>
                  <Cloud size={18} className="animate-pulse" />
                  Publishing...
                </>
              ) : isDeployed ? (
                <>
                  <CheckCircle size={18} />
                  Published
                </>
              ) : (
                <>
                  <Cloud size={18} />
                  Publish Portfolio
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
