/**
 * Job Board Credentials Management Component
 * Allows users to add, edit, test, and delete job board credentials
 */

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, CheckCircle, XCircle, Loader, AlertCircle, Key } from 'lucide-react';
import { useJobBoardApi, JobBoardCredential } from '../../../hooks/useJobBoardApi';
import { useTheme } from '../../../contexts/ThemeContext';

interface AddCredentialModalProps {
  onClose: () => void;
  onAdd: (platform: string, email: string, password: string) => Promise<void>;
}

function AddCredentialModal({ onClose, onAdd }: AddCredentialModalProps) {
  const [platform, setPlatform] = useState('LINKEDIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onAdd(platform, email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add credential');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add Job Board Credential</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LINKEDIN">LinkedIn</option>
                <option value="INDEED">Indeed</option>
                <option value="GLASSDOOR">Glassdoor (Coming Soon)</option>
                <option value="ZIPRECRUITER">ZipRecruiter (Coming Soon)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Security:</strong> Your credentials are encrypted with AES-256-GCM and
                stored securely. They're only used for automated job applications.
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting && <Loader className="animate-spin" size={16} />}
              {isSubmitting ? 'Adding...' : 'Add Credential'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CredentialCardProps {
  credential: JobBoardCredential;
  onTest: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isTesting: boolean;
}

function CredentialCard({ credential, onTest, onDelete, isTesting }: CredentialCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const { theme } = useTheme();

  const getPlatformColor = (platform: string) => {
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

  const getStatusIcon = () => {
    if (credential.isConnected && credential.verificationStatus === 'verified') {
      return <CheckCircle className="text-green-600" size={20} />;
    }
    if (credential.verificationStatus === 'failed') {
      return <XCircle className="text-red-600" size={20} />;
    }
    return <AlertCircle className="text-yellow-600" size={20} />;
  };

  const getStatusText = () => {
    if (credential.isConnected && credential.verificationStatus === 'verified') {
      return 'Connected';
    }
    if (credential.verificationStatus === 'failed') {
      return 'Connection Failed';
    }
    return 'Not Verified';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Key className="text-blue-600" size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPlatformColor(credential.platform)}`}>
                {credential.platform}
              </span>
              {!credential.isActive && (
                <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{credential.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getStatusIcon()}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <span>{getStatusText()}</span>
        {credential.lastVerified && (
          <span>Last verified: {new Date(credential.lastVerified).toLocaleDateString()}</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onTest(credential.id)}
          disabled={isTesting}
          className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isTesting && <Loader className="animate-spin" size={14} />}
          {isTesting ? 'Testing...' : 'Test Connection'}
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {showDelete && (
        <div className="mt-3 p-3 bg-red-50 rounded-lg">
          <p className="text-sm text-red-800 mb-2">
            Are you sure you want to delete this credential?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDelete(false)}
              className="flex-1 px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded text-sm hover:bg-red-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(credential.id)}
              className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JobBoardCredentials() {
  const { credentials, isLoading, addCredential, deleteCredential, testCredential } = useJobBoardApi();
  const [showAddModal, setShowAddModal] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const { theme } = useTheme();

  const handleAddCredential = async (platform: string, email: string, password: string) => {
    await addCredential(platform, email, password);
  };

  const handleTestCredential = async (id: string) => {
    setTestingId(id);
    try {
      await testCredential(id);
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    await deleteCredential(id);
  };

  if (isLoading && credentials.length === 0) {
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
          <h2 className="text-2xl font-bold text-gray-900">Job Board Credentials</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage your job board login credentials for automated applications
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
        >
          <Plus size={20} />
          Add Credential
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Credentials</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{credentials.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {credentials.filter(c => c.isActive && c.isConnected).length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Need Attention</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {credentials.filter(c => !c.isConnected || c.verificationStatus !== 'verified').length}
          </p>
        </div>
      </div>

      {/* Credentials Grid */}
      {credentials.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <Key className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Credentials Yet</h3>
          <p className="text-gray-600 mb-4">
            Add your first job board credential to start automating applications
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Your First Credential
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {credentials.map((credential) => (
            <CredentialCard
              key={credential.id}
              credential={credential}
              onTest={handleTestCredential}
              onDelete={handleDeleteCredential}
              isTesting={testingId === credential.id}
            />
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddCredentialModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCredential}
        />
      )}
    </div>
  );
}
