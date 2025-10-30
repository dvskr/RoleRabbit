'use client';

import React, { useState } from 'react';
import { X, Plus, Trash2, FileText, Layout, Folder, Crown, CheckCircle } from 'lucide-react';
import { logger } from '../../utils/logger';
import { resumeTemplates } from '../../data/templates';

interface Resume {
  id: string;
  name: string;
  fileName: string;
  data: any;
  template?: string;
}

interface MultiResumeManagerProps {
  onSwitchResume: (resume: Resume) => void;
  onSelectTemplate: (templateId: string) => void;
  showHorizontalScroller?: boolean;
  addedTemplates?: string[];
  onRemoveTemplate?: (templateId: string) => void;
  onAddTemplates?: (templateIds: string[]) => void;
  onNavigateToTemplates?: () => void;
  selectedTemplateId?: string | null;
}

export default function MultiResumeManager({ onSwitchResume, onSelectTemplate, showHorizontalScroller = false, addedTemplates = [], onRemoveTemplate, onAddTemplates, onNavigateToTemplates, selectedTemplateId }: MultiResumeManagerProps) {
  const [resumes, setResumes] = useState<Resume[]>([
    {
      id: '1',
      name: 'Software Engineer Resume',
      fileName: 'resume_software_engineer',
      data: {}
    }
  ]);
  const [activeResumeId, setActiveResumeId] = useState('1');
  const [newResumeName, setNewResumeName] = useState('');

  const handleAddResume = () => {
    if (resumes.length >= 5) {
      alert('Maximum of 5 resumes allowed');
      return;
    }
    
    const newResume: Resume = {
      id: Date.now().toString(),
      name: newResumeName || `Resume ${resumes.length + 1}`,
      fileName: `resume_${resumes.length + 1}`,
      data: {}
    };
    
    setResumes([...resumes, newResume]);
    setNewResumeName('');
  };

  const handleDeleteResume = (id: string) => {
    if (resumes.length === 1) {
      alert('Cannot delete the last resume');
      return;
    }
    
    const newResumes = resumes.filter(r => r.id !== id);
    setResumes(newResumes);
    
    if (activeResumeId === id) {
      setActiveResumeId(newResumes[0].id);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
  };

  // Filter out templates that are already added
  const addedTemplatesData = resumeTemplates.filter(t => addedTemplates.includes(t.id));

  return (
    <>
      {/* Resume Tabs Bar */}
      {!showHorizontalScroller && (
        <div className="flex items-center gap-2 border-b border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2 overflow-x-auto">
        {resumes.map(resume => (
          <div
            key={resume.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all ${
              activeResumeId === resume.id
                ? 'bg-blue-50 border-t border-l border-r border-blue-200'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <FileText size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
              {resume.name}
            </span>
            {resumes.length > 1 && (
              <button
                onClick={() => handleDeleteResume(resume.id)}
                className="p-1 hover:bg-red-50 rounded transition-colors"
                aria-label={`Delete resume ${resume.name}`}
                title="Delete resume"
              >
                <Trash2 size={14} className="text-red-500" />
              </button>
            )}
          </div>
        ))}
        
        {resumes.length < 5 && (
          <button
            onClick={() => {
              const name = prompt('Enter resume name:');
              if (name) {
                setNewResumeName(name);
                handleAddResume();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Plus size={16} />
            New Resume
          </button>
        )}
        
        <button
          onClick={() => onNavigateToTemplates?.()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ml-auto"
        >
          <Layout size={16} />
          Templates
        </button>
      </div>
      )}

      {/* Horizontal Template Scroller (for Sections sidebar) */}
      {showHorizontalScroller && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-white flex items-center gap-2 text-sm">
              <Layout size={16} className="text-purple-600" />
              Templates ({addedTemplates.length}/10)
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {/* Show added templates */}
            {addedTemplatesData.map(template => (
              <div
                key={template.id}
                className="flex-shrink-0 w-36 relative group"
              >
                <button
                  onClick={() => onSelectTemplate(template.id)}
                  className={`w-full border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all relative ${
                    selectedTemplateId === template.id
                      ? 'border-gray-300'
                      : 'border-gray-300 hover:border-purple-400'
                  }`}
                >
                  {/* X button inside the box */}
                  {onRemoveTemplate && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (addedTemplates.length > 1) {
                          onRemoveTemplate(template.id);
                        }
                      }}
                      className={`absolute top-1 right-1 p-1 text-white rounded-full transition-all z-30 opacity-0 group-hover:opacity-100 shadow-lg ${
                        addedTemplates.length === 1
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-red-500 hover:bg-red-600'
                      }`}
                      title={addedTemplates.length === 1 ? 'Keep at least one template' : 'Remove from editor'}
                      disabled={addedTemplates.length === 1}
                    >
                      <X size={14} />
                    </button>
                  )}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-3 flex flex-col items-center h-48 relative">
                    {/* Mini Resume Preview */}
                    <div className="w-28 h-40 bg-white rounded shadow-lg transform rotate-[0.5deg] group-hover:rotate-0 transition-transform border border-gray-200">
                      <div className="p-2 h-full flex flex-col space-y-1">
                        {/* Name/Header Bar */}
                        <div className={`h-2 rounded ${
                          template.colorScheme === 'blue' ? 'bg-blue-600' :
                          template.colorScheme === 'green' ? 'bg-green-600' :
                          template.colorScheme === 'monochrome' ? 'bg-gray-700' :
                          'bg-gradient-to-r from-purple-500 to-pink-500'
                        }`}></div>
                        
                        {/* Contact Line */}
                        <div className="h-1 bg-gray-200 rounded w-10/12"></div>
                        
                        {/* Summary Section */}
                        <div className="space-y-0.5">
                          <div className={`h-1 rounded w-8 ${
                            template.colorScheme === 'blue' ? 'bg-blue-500' :
                            template.colorScheme === 'green' ? 'bg-green-500' :
                            template.colorScheme === 'monochrome' ? 'bg-gray-600' :
                            'bg-purple-400'
                          }`}></div>
                          <div className="h-1 bg-gray-100 rounded w-full"></div>
                          <div className="h-1 bg-gray-100 rounded w-5/6"></div>
                        </div>
                        
                        {/* Experience Section */}
                        <div className="space-y-0.5">
                          <div className={`h-1 rounded w-7 ${
                            template.colorScheme === 'blue' ? 'bg-blue-500' :
                            template.colorScheme === 'green' ? 'bg-green-500' :
                            template.colorScheme === 'monochrome' ? 'bg-gray-600' :
                            'bg-purple-400'
                          }`}></div>
                          <div className="h-1 bg-gray-100 rounded w-full"></div>
                          <div className="h-1 bg-gray-100 rounded w-4/5"></div>
                        </div>
                        
                        {/* Bullet Points */}
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="h-1 bg-gray-100 rounded flex-1"></div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <div className="h-1 bg-gray-100 rounded flex-1"></div>
                        </div>
                        
                        {/* Skills Tags */}
                        <div className="flex gap-1">
                          <div className="h-1 bg-gray-100 rounded flex-1"></div>
                          <div className="h-1 bg-gray-100 rounded flex-1"></div>
                        </div>
                      </div>
                    </div>
                    {template.isPremium && (
                      <div className="absolute top-1 right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-1 py-0.5 rounded-full">
                        <Crown size={8} />
                      </div>
                    )}
                    {/* Selection indicator */}
                    {selectedTemplateId === template.id && (
                      <div className="absolute top-1 left-1 bg-purple-600 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 z-10">
                        <CheckCircle size={10} />
                        Active
                      </div>
                    )}
                    {/* Template Name */}
                    <div className="mt-2 text-center">
                      <p className="text-xs font-semibold text-gray-900 truncate">{template.name}</p>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <span className="text-xs text-yellow-600">★</span>
                        <span className="text-xs text-gray-600">{template.rating}</span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            ))}
            
            {/* Add Templates Button (only if less than 10) */}
            {addedTemplates.length < 10 && (
              <button
                onClick={() => {
                  if (onNavigateToTemplates) {
                    onNavigateToTemplates();
                  }
                }}
                className="flex-shrink-0 w-36 h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                  <Plus size={24} className="text-purple-600" />
                </div>
                <p className="text-xs font-semibold text-gray-700 text-center">
                  Add Templates<br/>
                  <span className="text-gray-500">({10 - addedTemplates.length} slots left)</span>
                </p>
              </button>
            )}
          </div>
        </div>
      )}

    </>
  );
}

