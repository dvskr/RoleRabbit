'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, Linkedin, Database, Paste } from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFile: (file: File) => void;
  onImportLinkedIn: () => void;
  onImportJSON: (jsonData: string) => void;
}

export default function ImportModal({
  isOpen,
  onClose,
  onImportFile,
  onImportLinkedIn,
  onImportJSON
}: ImportModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImportJSON(content);
        onClose();
      };
      reader.readAsText(file);
    } else {
      onImportFile(file);
      onClose();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleJSONSubmit = () => {
    if (jsonInput.trim()) {
      onImportJSON(jsonInput.trim());
      setJsonInput('');
      onClose();
    }
  };

  const handleClose = () => {
    setJsonInput('');
    setDragActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Import Resume
          </h3>
          <button 
            onClick={handleClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Upload File</label>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <Upload size={32} className="mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-2">Drag and drop your resume file here</p>
              <p className="text-sm text-gray-500 mb-4">or</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt,.json"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
              >
                Choose File
              </label>
            </div>
          </div>

          {/* LinkedIn Import */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">LinkedIn Import</label>
            <button
              onClick={() => {
                onImportLinkedIn();
                onClose();
              }}
              className="w-full p-4 border-2 border-blue-200 bg-blue-50 rounded-xl hover:border-blue-300 hover:bg-blue-100 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                  <Linkedin size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Import from LinkedIn</h4>
                  <p className="text-sm text-gray-600">Connect your LinkedIn profile</p>
                </div>
              </div>
            </button>
          </div>

          {/* JSON Import */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Paste JSON Data</label>
            <div className="space-y-3">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Paste your resume JSON data here..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all resize-none"
              />
              <button
                onClick={handleJSONSubmit}
                disabled={!jsonInput.trim()}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Paste size={16} />
                Import JSON
              </button>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Supported Formats</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <FileText size={12} />
                <span>PDF, DOC, DOCX</span>
              </div>
              <div className="flex items-center gap-2">
                <Database size={12} />
                <span>JSON</span>
              </div>
              <div className="flex items-center gap-2">
                <Linkedin size={12} />
                <span>LinkedIn</span>
              </div>
              <div className="flex items-center gap-2">
                <Paste size={12} />
                <span>Plain Text</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
