'use client';

import React, { useState } from 'react';
import { GraduationCap, Clock, CheckCircle, XCircle, QrCode, FileText } from 'lucide-react';
import { CredentialInfo, CredentialReminder } from '../../types/cloudStorage';
import { logger } from '../../utils/logger';

interface CredentialManagerProps {
  credentials: CredentialInfo[];
  reminders: CredentialReminder[];
  onAddCredential: (credential: Partial<CredentialInfo>) => void;
  onUpdateCredential: (id: string, updates: Partial<CredentialInfo>) => void;
  onDeleteCredential: (id: string) => void;
  onGenerateQRCode: (id: string) => string;
}

export default function CredentialManager({
  credentials,
  reminders,
  onAddCredential,
  onUpdateCredential,
  onDeleteCredential,
  onGenerateQRCode
}: CredentialManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<CredentialInfo | null>(null);

  const getStatusColor = (status: CredentialInfo['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50';
      case 'expired':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'revoked':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: CredentialInfo['verificationStatus']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'expired':
        return <XCircle size={16} className="text-red-600" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'revoked':
        return <XCircle size={16} className="text-gray-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  const getReminderPriorityColor = (priority: CredentialReminder['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Credential Management</h2>
          <p className="text-sm text-gray-600 mt-1">Track certifications, licenses, and credentials</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <GraduationCap size={18} />
          Add Credential
        </button>
      </div>

      {/* Active Reminders */}
      {reminders.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="text-yellow-600 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900 mb-2">Upcoming Expirations</h3>
              <div className="space-y-2">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className={`border rounded-lg p-3 ${getReminderPriorityColor(reminder.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{reminder.credentialName}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Expires: {new Date(reminder.expirationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                        reminder.priority === 'high' ? 'bg-red-100 text-red-700' :
                        reminder.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {reminder.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Grid */}
      {credentials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {credentials.map((credential) => (
            <div
              key={credential.credentialId}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCredential(credential)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="text-blue-600" size={24} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{credential.issuer}</h3>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {credential.credentialType.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                </div>
                {getStatusIcon(credential.verificationStatus)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Issued:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(credential.issuedDate).toLocaleDateString()}
                  </span>
                </div>
                {credential.expirationDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(credential.expirationDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(credential.verificationStatus)}`}>
                    {credential.verificationStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {credential.qrCode && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const qrUrl = onGenerateQRCode(credential.credentialId || '');
                      window.open(qrUrl, '_blank');
                    }}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <QrCode size={16} />
                    View QR Code
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <GraduationCap size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Credentials Added</h3>
          <p className="text-gray-600 mb-4">
            Start tracking your certifications, licenses, and credentials
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Your First Credential
          </button>
        </div>
      )}

      {/* Add Credential Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Credential</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credential Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="certification">Certification</option>
                  <option value="license">License</option>
                  <option value="visa">Visa</option>
                  <option value="degree">Degree</option>
                  <option value="badge">Badge</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Issuer
                </label>
                <input
                  type="text"
                  placeholder="e.g., AWS, Microsoft, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Credential ID
                </label>
                <input
                  type="text"
                  placeholder="Optional"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issued Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    logger.debug('Adding credential');
                    setShowAddModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Credential
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Credential Modal */}
      {selectedCredential && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <GraduationCap className="text-blue-600" size={32} />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedCredential.issuer}</h3>
                  <p className="text-sm text-gray-600">
                    {selectedCredential.credentialType.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCredential(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {selectedCredential.credentialId && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Credential ID:</span>
                  <span className="font-medium text-gray-900">{selectedCredential.credentialId}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedCredential.verificationStatus)}`}>
                  {selectedCredential.verificationStatus.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Issued Date:</span>
                <span className="font-medium text-gray-900">
                  {new Date(selectedCredential.issuedDate).toLocaleDateString()}
                </span>
              </div>
              {selectedCredential.expirationDate && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Expiration Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(selectedCredential.expirationDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              {selectedCredential.verificationUrl && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Verification:</span>
                  <a
                    href={selectedCredential.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Verify Certificate
                  </a>
                </div>
              )}
            </div>

            {selectedCredential.qrCode && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode size={20} />
                  <span className="font-medium text-gray-900">QR Code</span>
                </div>
                <img src={selectedCredential.qrCode} alt="QR Code" className="w-32 h-32 mx-auto" />
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedCredential(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

