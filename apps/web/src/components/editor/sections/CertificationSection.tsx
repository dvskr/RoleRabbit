'use client';

import React, { useState } from 'react';
import { Plus, Edit, Save, X, Trash2 } from 'lucide-react';
import { Certification } from '../../../types/resume';

interface CertificationSectionProps {
  certifications: Certification[];
  onAddCertification: (certification: Certification) => void;
  onUpdateCertification: (id: number, updates: Partial<Certification>) => void;
  onRemoveCertification: (id: number) => void;
}

export default function CertificationSection({
  certifications,
  onAddCertification,
  onUpdateCertification,
  onRemoveCertification
}: CertificationSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCertification, setNewCertification] = useState<Partial<Certification>>({
    name: '',
    issuer: '',
    link: '',
    skills: []
  });

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      onAddCertification({
        id: Date.now(),
        name: newCertification.name!,
        issuer: newCertification.issuer!,
        link: newCertification.link || '',
        skills: newCertification.skills || []
      });
      setNewCertification({
        name: '',
        issuer: '',
        link: '',
        skills: []
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus size={16} />
            Add Certification
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit size={16} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Add Certification Form */}
      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="text-md font-semibold text-gray-900 mb-4">Add New Certification</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                <input
                  type="text"
                  value={newCertification.name}
                  onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                <input
                  type="text"
                  value={newCertification.issuer}
                  onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certificate Link</label>
              <input
                type="url"
                value={newCertification.link}
                onChange={(e) => setNewCertification({ ...newCertification, link: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleAddCertification}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Add Certification
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certifications List */}
      <div className="space-y-4">
        {certifications.map((cert) => (
          <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-gray-900">{cert.name}</h4>
                <p className="text-gray-700">{cert.issuer}</p>
                {cert.link && (
                  <a href={cert.link} className="text-blue-600 text-sm hover:underline">
                    View Certificate
                  </a>
                )}
              </div>
              {isEditing && (
                <button
                  onClick={() => onRemoveCertification(cert.id)}
                  className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                >
                  <Trash2 size={16} className="text-red-600" />
                </button>
              )}
            </div>

            {/* Skills */}
            {cert.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {cert.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {certifications.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No certifications added yet</p>
          <p className="text-sm">Click "Add Certification" to get started</p>
        </div>
      )}
    </div>
  );
}
