/**
 * Custom Domain Setup Component
 * Requirements #9-12: Custom domain, subdomain check, DNS verification, SSL status
 */

'use client';

import React, { useState } from 'react';
import {
  Globe,
  Check,
  X,
  Loader2,
  AlertCircle,
  Copy,
  Clock,
  Shield,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { useDebouncedCallback } from '../../hooks/usePerformance';

type SubdomainStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
type DNSStatus = 'pending' | 'verifying' | 'verified' | 'failed';
type SSLStatus = 'provisioning' | 'active' | 'expiring' | 'expired' | 'failed';

export interface DNSRecord {
  type: string;
  name: string;
  value: string;
  ttl?: number;
}

export interface SSLCertificate {
  status: SSLStatus;
  issuedAt?: Date;
  expiresAt?: Date;
  autoRenew: boolean;
  error?: string;
}

interface CustomDomainSetupProps {
  portfolioId: string;
  currentDomain?: string;
  currentSubdomain?: string;
  dnsRecords?: DNSRecord[];
  dnsStatus?: DNSStatus;
  sslCertificate?: SSLCertificate;
  onCheckSubdomain?: (subdomain: string) => Promise<boolean>;
  onAddDomain?: (domain: string) => Promise<DNSRecord[]>;
  onVerifyDNS?: () => Promise<boolean>;
  onRemoveDomain?: () => Promise<void>;
}

export function CustomDomainSetup({
  portfolioId,
  currentDomain,
  currentSubdomain,
  dnsRecords = [],
  dnsStatus = 'pending',
  sslCertificate,
  onCheckSubdomain,
  onAddDomain,
  onVerifyDNS,
  onRemoveDomain,
}: CustomDomainSetupProps) {
  const [domainType, setDomainType] = useState<'subdomain' | 'custom'>('subdomain');
  const [subdomain, setSubdomain] = useState(currentSubdomain || '');
  const [customDomain, setCustomDomain] = useState(currentDomain || '');
  const [subdomainStatus, setSubdomainStatus] = useState<SubdomainStatus>('idle');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Debounced subdomain availability check
  const checkAvailability = useDebouncedCallback(
    async (value: string) => {
      if (!value || !onCheckSubdomain) {
        setSubdomainStatus('idle');
        return;
      }

      // Validate format
      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(value)) {
        setSubdomainStatus('invalid');
        return;
      }

      setSubdomainStatus('checking');
      try {
        const available = await onCheckSubdomain(value);
        setSubdomainStatus(available ? 'available' : 'taken');
      } catch (error) {
        setSubdomainStatus('invalid');
      }
    },
    500
  );

  const handleSubdomainChange = (value: string) => {
    setSubdomain(value.toLowerCase());
    checkAvailability(value.toLowerCase());
  };

  const handleAddDomain = async () => {
    if (!onAddDomain) return;

    const domain = domainType === 'subdomain'
      ? `${subdomain}.rolerabbit.com`
      : customDomain;

    setIsAdding(true);
    try {
      await onAddDomain(domain);
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDNS = async () => {
    if (!onVerifyDNS) return;

    setIsVerifying(true);
    try {
      await onVerifyDNS();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemoveDomain = async () => {
    if (!onRemoveDomain) return;

    const confirmed = window.confirm(
      'Remove custom domain? Your portfolio will be accessible via the default URL.'
    );
    if (!confirmed) return;

    setIsRemoving(true);
    try {
      await onRemoveDomain();
    } finally {
      setIsRemoving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const daysUntilExpiry = sslCertificate?.expiresAt
    ? Math.floor((new Date(sslCertificate.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="w-full max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Custom Domain
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Connect your own domain or choose a subdomain
        </p>
      </div>

      {/* Current Domain */}
      {(currentDomain || currentSubdomain) && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="text-green-600 dark:text-green-400" size={20} />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-300">
                  Active Domain
                </p>
                <p className="text-lg font-semibold text-green-700 dark:text-green-400">
                  {currentDomain || `${currentSubdomain}.rolerabbit.com`}
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveDomain}
              disabled={isRemoving}
              className="px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      )}

      {/* Domain Type Toggle */}
      <div className="flex gap-3 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => setDomainType('subdomain')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            domainType === 'subdomain'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Subdomain
        </button>
        <button
          onClick={() => setDomainType('custom')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
            domainType === 'custom'
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          Custom Domain
        </button>
      </div>

      {/* Subdomain Input */}
      {domainType === 'subdomain' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Choose Your Subdomain
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => handleSubdomainChange(e.target.value)}
                placeholder="yourname"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white pr-10"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {subdomainStatus === 'checking' && (
                  <Loader2 className="animate-spin text-gray-400" size={20} />
                )}
                {subdomainStatus === 'available' && (
                  <Check className="text-green-600" size={20} />
                )}
                {subdomainStatus === 'taken' && (
                  <X className="text-red-600" size={20} />
                )}
                {subdomainStatus === 'invalid' && (
                  <AlertCircle className="text-orange-600" size={20} />
                )}
              </div>
            </div>
            <span className="text-gray-600 dark:text-gray-400">.rolerabbit.com</span>
          </div>
          {subdomainStatus === 'available' && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">
              ✓ {subdomain}.rolerabbit.com is available
            </p>
          )}
          {subdomainStatus === 'taken' && (
            <p className="text-sm text-red-600 dark:text-red-400 mt-2">
              ✗ This subdomain is already taken
            </p>
          )}
          {subdomainStatus === 'invalid' && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
              ⚠ Invalid format. Use lowercase letters, numbers, and hyphens only
            </p>
          )}
        </div>
      )}

      {/* Custom Domain Input */}
      {domainType === 'custom' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Custom Domain
          </label>
          <input
            type="text"
            value={customDomain}
            onChange={(e) => setCustomDomain(e.target.value)}
            placeholder="example.com"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Enter your domain without http:// or www
          </p>
        </div>
      )}

      {/* Add Domain Button */}
      <button
        onClick={handleAddDomain}
        disabled={
          isAdding ||
          (domainType === 'subdomain' && subdomainStatus !== 'available') ||
          (domainType === 'custom' && !customDomain)
        }
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isAdding ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Adding Domain...
          </>
        ) : (
          <>
            <Globe size={20} />
            Add Domain
          </>
        )}
      </button>

      {/* DNS Configuration (only for custom domains) */}
      {domainType === 'custom' && dnsRecords.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              DNS Configuration
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Add these DNS records to your domain provider
            </p>
          </div>

          {/* DNS Records */}
          <div className="space-y-3">
            {dnsRecords.map((record, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm"
              >
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-500 text-xs">Type</span>
                    <p className="text-gray-900 dark:text-white font-medium">{record.type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Name</span>
                    <p className="text-gray-900 dark:text-white font-medium truncate">
                      {record.name}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-end justify-between">
                    <div className="flex-1 mr-2">
                      <span className="text-gray-500 text-xs">Value</span>
                      <p className="text-gray-900 dark:text-white font-medium truncate">
                        {record.value}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(record.value)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
                      title="Copy value"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DNS Status */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Verification Status
            </h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {dnsStatus === 'pending' && (
                  <>
                    <Clock className="text-gray-400" size={20} />
                    <span className="text-gray-600 dark:text-gray-400">
                      Waiting for DNS records...
                    </span>
                  </>
                )}
                {dnsStatus === 'verifying' && (
                  <>
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                    <span className="text-blue-600">Verification in progress...</span>
                  </>
                )}
                {dnsStatus === 'verified' && (
                  <>
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="text-green-600">Verified ✓</span>
                  </>
                )}
                {dnsStatus === 'failed' && (
                  <>
                    <X className="text-red-600" size={20} />
                    <span className="text-red-600">Verification failed</span>
                  </>
                )}
              </div>
              {dnsStatus === 'pending' && (
                <button
                  onClick={handleVerifyDNS}
                  disabled={isVerifying}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isVerifying ? 'Checking...' : 'Verify Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SSL Certificate Status */}
      {sslCertificate && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Shield
                className={
                  sslCertificate.status === 'active'
                    ? 'text-green-600'
                    : sslCertificate.status === 'provisioning'
                    ? 'text-blue-600'
                    : 'text-orange-600'
                }
                size={24}
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  SSL Certificate
                </h3>
                {sslCertificate.status === 'provisioning' && (
                  <p className="text-blue-600 dark:text-blue-400">
                    Provisioning SSL certificate...
                  </p>
                )}
                {sslCertificate.status === 'active' && (
                  <div className="space-y-1">
                    <p className="text-green-600 dark:text-green-400 font-medium">
                      Active ✓
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Expires on {formatDate(sslCertificate.expiresAt!)} ({daysUntilExpiry} days)
                    </p>
                    {sslCertificate.autoRenew && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                        <Check size={12} />
                        Auto-renewal enabled
                      </span>
                    )}
                  </div>
                )}
                {sslCertificate.status === 'expiring' && (
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="text-orange-600" size={16} />
                    <p className="text-orange-600 dark:text-orange-400">
                      Certificate expiring soon ({daysUntilExpiry} days)
                    </p>
                  </div>
                )}
                {sslCertificate.status === 'failed' && (
                  <p className="text-red-600 dark:text-red-400">
                    Failed to provision: {sslCertificate.error}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
