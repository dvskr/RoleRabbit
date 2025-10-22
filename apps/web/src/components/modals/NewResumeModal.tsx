'use client';

import React from 'react';
import { X, FileText, Upload, Sparkles, Bot, Database } from 'lucide-react';

interface NewResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBlank: () => void;
  onImportResume: () => void;
  onAIAssist: () => void;
}

export default function NewResumeModal({
  isOpen,
  onClose,
  onCreateBlank,
  onImportResume,
  onAIAssist
}: NewResumeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-550 max-w-lg">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Resume
          </h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Start from Scratch */}
          <button 
            onClick={() => {
              onCreateBlank();
              onClose();
            }} 
            className="w-full p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 text-left transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg group-hover:shadow-blue-500/50 transition-shadow">
                <FileText size={28} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1 text-gray-900">Start from Scratch</h4>
                <p className="text-sm text-gray-600">Create a blank resume and build it your way</p>
              </div>
            </div>
          </button>
          
          {/* Import Existing Resume */}
          <button 
            onClick={() => {
              onImportResume();
              onClose();
            }} 
            className="w-full p-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 text-left transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:shadow-green-500/50 transition-shadow">
                <Upload size={28} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1 text-gray-900 flex items-center gap-2">
                  Import Existing Resume
                  <Database size={18} className="text-green-600" />
                </h4>
                <p className="text-sm text-gray-600">Upload from file, LinkedIn, or paste JSON</p>
              </div>
            </div>
          </button>
          
          {/* AI Writer */}
          <button 
            onClick={() => {
              onAIAssist();
              onClose();
            }} 
            className="w-full p-6 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 text-left transition-all duration-300 hover:scale-105 group"
          >
            <div className="flex items-start gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg group-hover:shadow-purple-500/50 transition-shadow">
                <Sparkles size={28} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-lg mb-1 text-gray-900 flex items-center gap-2">
                  AI Writer
                  <Bot size={18} className="text-purple-600" />
                </h4>
                <p className="text-sm text-gray-600">Let AI help you write your resume content</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
