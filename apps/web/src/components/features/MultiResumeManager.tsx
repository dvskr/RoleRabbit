'use client';

import React from 'react';
import { X, Plus, Trash2, FileText, Layout, Crown, CheckCircle } from 'lucide-react';
import { resumeTemplates } from '../../data/templates';

interface ResumeListItem {
  id: string;
  name: string;
  fileName?: string | null;
  templateId?: string | null;
  createdAt?: string;
}

interface MultiResumeManagerProps {
  resumes?: ResumeListItem[];
  activeResumeId?: string | null;
  onSwitchResume?: (resumeId: string) => void | Promise<void>;
  onCreateResume?: () => void | Promise<void>;
  onDeleteResume?: (resumeId: string) => void | Promise<void>;
  maxResumes?: number;
  isLoadingResumes?: boolean;
  showHorizontalScroller?: boolean;
  addedTemplates?: string[];
  onRemoveTemplate?: (templateId: string) => void;
  onAddTemplates?: (templateIds: string[]) => void;
  onNavigateToTemplates?: () => void;
  onSelectTemplate?: (templateId: string) => void;
  selectedTemplateId?: string | null;
}

export default function MultiResumeManager({
  resumes = [],
  activeResumeId,
  onSwitchResume,
  onCreateResume,
  onDeleteResume,
  maxResumes = 10,
  isLoadingResumes = false,
  showHorizontalScroller = false,
  addedTemplates = [],
  onRemoveTemplate,
  onAddTemplates,
  onNavigateToTemplates,
  onSelectTemplate,
  selectedTemplateId,
}: MultiResumeManagerProps) {
  if (showHorizontalScroller) {
    const addedTemplatesData = resumeTemplates.filter(t => addedTemplates.includes(t.id));
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm">
            <Layout size={16} className="text-purple-600" />
            Templates ({addedTemplates.length}/10)
          </h3>
        </div>
        <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 template-scroller">
          {addedTemplatesData.map(template => (
            <div key={template.id} className="flex-shrink-0 w-36 relative group">
              <button
                onClick={() => onSelectTemplate?.(template.id)}
                className={`w-full border-2 rounded-lg overflow-hidden hover:shadow-lg transition-all relative ${
                  selectedTemplateId === template.id
                    ? 'border-gray-300'
                    : 'border-gray-300 hover:border-purple-400'
                }`}
              >
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
                  <div className="w-28 h-40 bg-white rounded shadow-lg transform rotate-[0.5deg] group-hover:rotate-0 transition-transform border border-gray-200">
                    <div className="p-2 h-full flex flex-col space-y-1">
                      <div className={`h-2 rounded ${
                        template.colorScheme === 'blue' ? 'bg-blue-600' :
                        template.colorScheme === 'green' ? 'bg-green-600' :
                        template.colorScheme === 'monochrome' ? 'bg-gray-700' :
                        'bg-gradient-to-r from-purple-500 to-pink-500'
                      }`}></div>
                      <div className="h-1 bg-gray-200 rounded w-10/12"></div>
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
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="h-1 bg-gray-100 rounded flex-1"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <div className="h-1 bg-gray-100 rounded flex-1"></div>
                      </div>
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
                  {selectedTemplateId === template.id && (
                    <div className="absolute top-1 left-1 bg-purple-600 text-white px-1.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 z-10">
                      <CheckCircle size={10} />
                      Active
                    </div>
                  )}
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

          {addedTemplates.length < 10 && (
            <button
              onClick={() => onNavigateToTemplates?.()}
              className="flex-shrink-0 w-36 h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center">
                <Plus size={24} className="text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-gray-700 text-center">
                Add Templates
                <br />
                <span className="text-gray-500">({10 - addedTemplates.length} slots left)</span>
              </p>
            </button>
          )}
        </div>
      </div>
    );
  }

  const canCreateMore = (resumes?.length ?? 0) < maxResumes;
  const canDelete = (resumes?.length ?? 0) > 1;
  const createDisabled = !canCreateMore || isLoadingResumes;
  const deleteDisabled = !canDelete || isLoadingResumes;

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-white/80 backdrop-blur-xl px-4 py-2 overflow-x-auto">
      {isLoadingResumes ? (
        <div className="text-xs text-gray-500">Loading resumes...</div>
      ) : resumes && resumes.length > 0 ? (
        resumes.map((resume) => (
          <button
            key={resume.id}
            type="button"
            onClick={() => onSwitchResume?.(resume.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all border ${
              activeResumeId === resume.id
                ? 'bg-blue-50 border-blue-200'
                : 'bg-gray-50 border-transparent hover:bg-gray-100'
            }`}
          >
            <FileText size={16} className="text-gray-600" />
            <span className="text-sm font-medium text-gray-800 whitespace-nowrap">
              {resume.name || 'Untitled Resume'}
            </span>
            {onDeleteResume && canDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteResume(resume.id);
                }}
                disabled={deleteDisabled}
                className={`p-1 rounded transition-colors ${
                  deleteDisabled ? 'cursor-not-allowed text-gray-300' : 'hover:bg-red-50'
                }`}
                aria-label={`Delete resume ${resume.name}`}
                title="Delete resume"
              >
                <Trash2 size={14} className={deleteDisabled ? 'text-gray-300' : 'text-red-500'} />
              </button>
            )}
          </button>
        ))
      ) : (
        <div className="text-xs text-gray-500">No resumes yet</div>
      )}

      {onCreateResume && (
        <button
          onClick={onCreateResume}
          disabled={createDisabled}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            !createDisabled
              ? 'text-blue-600 hover:bg-blue-50'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          title={createDisabled ? (isLoadingResumes ? 'Please wait…' : 'Resume limit reached') : 'Create new resume'}
        >
          <Plus size={16} />
          New Resume
        </button>
      )}

      {onNavigateToTemplates && (
        <button
          onClick={onNavigateToTemplates}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ml-auto"
        >
          <Layout size={16} />
          Templates
        </button>
      )}
    </div>
  );
}

