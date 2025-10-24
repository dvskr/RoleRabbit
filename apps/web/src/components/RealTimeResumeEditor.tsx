import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useResumeCollaboration } from '../services/webSocketService';
import { CollaborationIndicator, TypingIndicator, RealTimeCursor, RealTimeSelection } from './RealTimeCollaboration';

interface RealTimeResumeEditorProps {
  resumeId: string;
  userId: string;
  initialData?: any;
  onSave?: (data: any) => void;
  className?: string;
}

export const RealTimeResumeEditor: React.FC<RealTimeResumeEditorProps> = ({
  resumeId,
  userId,
  initialData,
  onSave,
  className = ''
}) => {
  const [resumeData, setResumeData] = useState(initialData || {
    title: '',
    summary: '',
    experience: [],
    education: [],
    skills: []
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { 
    collaborators, 
    updateResume, 
    sendCursorPosition, 
    sendSelection,
    setTyping 
  } = useResumeCollaboration(resumeId, userId);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      saveTimeoutRef.current = setTimeout(() => {
        handleSave();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges]);

  // Handle real-time updates from other collaborators
  useEffect(() => {
    const handleResumeUpdate = (changes: any) => {
      setResumeData(prevData => ({
        ...prevData,
        ...changes
      }));
    };

    // In a real implementation, you would listen to WebSocket events here
    // For now, we'll simulate it
    return () => {
      // Cleanup listeners
    };
  }, []);

  const handleFieldChange = useCallback((field: string, value: any) => {
    setResumeData(prevData => ({
      ...prevData,
      [field]: value
    }));
    
    setHasUnsavedChanges(true);
    setIsEditing(true);
    
    // Notify other collaborators of the change
    updateResume({ [field]: value });
    
    // Set typing indicator
    setTyping(true);
    
    // Clear typing indicator after delay
    setTimeout(() => {
      setTyping(false);
    }, 1000);
  }, [updateResume, setTyping]);

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave(resumeData);
    }
    
    setLastSaved(new Date());
    setHasUnsavedChanges(false);
    setIsEditing(false);
    
    console.log('Resume saved:', resumeData);
  }, [resumeData, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Save on Ctrl+S
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  }, [handleSave]);

  return (
    <div className={`real-time-resume-editor ${className}`}>
      {/* Collaboration Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Resume Editor</h2>
          <CollaborationIndicator resumeId={resumeId} userId={userId} />
        </div>
        
        <div className="flex items-center gap-4">
          <TypingIndicator resumeId={resumeId} userId={userId} />
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 text-orange-600">
              <div className="w-2 h-2 bg-orange-600 rounded-full" />
              <span className="text-sm">Unsaved changes</span>
            </div>
          )}
          
          {lastSaved && (
            <div className="text-sm text-gray-500">
              Last saved: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            Save
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div 
        ref={editorRef}
        className="relative p-6 space-y-6"
        onKeyDown={handleKeyDown}
      >
        {/* Real-time cursors and selections */}
        <RealTimeCursor 
          resumeId={resumeId} 
          userId={userId} 
          containerRef={editorRef} 
        />
        <RealTimeSelection 
          resumeId={resumeId} 
          userId={userId} 
          containerRef={editorRef} 
        />

        {/* Resume Title */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Resume Title
          </label>
          <input
            type="text"
            value={resumeData.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter resume title..."
          />
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Professional Summary
          </label>
          <textarea
            value={resumeData.summary}
            onChange={(e) => handleFieldChange('summary', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Write a compelling professional summary..."
          />
        </div>

        {/* Experience */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Experience</h3>
            <button
              onClick={() => handleFieldChange('experience', [
                ...resumeData.experience,
                { id: Date.now(), company: '', position: '', period: '', description: '' }
              ])}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
            >
              Add Experience
            </button>
          </div>
          
          {resumeData.experience.map((exp: any, index: number) => (
            <div key={exp.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => {
                      const newExperience = [...resumeData.experience];
                      newExperience[index] = { ...exp, company: e.target.value };
                      handleFieldChange('experience', newExperience);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => {
                      const newExperience = [...resumeData.experience];
                      newExperience[index] = { ...exp, position: e.target.value };
                      handleFieldChange('experience', newExperience);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Job title"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Period</label>
                <input
                  type="text"
                  value={exp.period}
                  onChange={(e) => {
                    const newExperience = [...resumeData.experience];
                    newExperience[index] = { ...exp, period: e.target.value };
                    handleFieldChange('experience', newExperience);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Jan 2020 - Present"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => {
                    const newExperience = [...resumeData.experience];
                    newExperience[index] = { ...exp, description: e.target.value };
                    handleFieldChange('experience', newExperience);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>
              
              <button
                onClick={() => {
                  const newExperience = resumeData.experience.filter((_: any, i: number) => i !== index);
                  handleFieldChange('experience', newExperience);
                }}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Skills</label>
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {skill}
                <button
                  onClick={() => {
                    const newSkills = resumeData.skills.filter((_: string, i: number) => i !== index);
                    handleFieldChange('skills', newSkills);
                  }}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a skill..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const input = e.target as HTMLInputElement;
                  const skill = input.value.trim();
                  if (skill && !resumeData.skills.includes(skill)) {
                    handleFieldChange('skills', [...resumeData.skills, skill]);
                    input.value = '';
                  }
                }
              }}
            />
            <button
              onClick={() => {
                const input = document.querySelector('input[placeholder="Add a skill..."]') as HTMLInputElement;
                const skill = input.value.trim();
                if (skill && !resumeData.skills.includes(skill)) {
                  handleFieldChange('skills', [...resumeData.skills, skill]);
                  input.value = '';
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-sm text-gray-600">
          <strong>Keyboard Shortcuts:</strong> Ctrl+S to save, Tab to navigate fields
        </div>
      </div>
    </div>
  );
};

export default RealTimeResumeEditor;
