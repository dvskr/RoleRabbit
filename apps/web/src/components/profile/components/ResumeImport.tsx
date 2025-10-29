'use client';

import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';

interface ResumeImportProps {
  onResumeImport: (data: any) => void;
}

export default function ResumeImport({ onResumeImport }: ResumeImportProps) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processResume(file);
    }
  };

  const processResume = async (file: File) => {
    setIsUploading(true);

    try {
      // Simulate resume parsing (in production, this would call an API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockParsedData = {
        personalInfo: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          location: 'San Francisco, CA'
        },
        professionalSummary: {
          overview: 'Seasoned full-stack engineer with expertise in modern web technologies, cloud infrastructure, and scalable system design.',
          keyStrengths: ['Full-stack development', 'System architecture', 'Cloud infrastructure', 'Team leadership'],
          currentFocus: 'Leading migration to microservices architecture',
          achievements: ['Reduced app load time by 60%', 'Led team of 5 engineers', 'Deployed 100+ production releases']
        },
        skills: [
          { name: 'JavaScript', proficiency: 'Expert', yearsOfExperience: 5 },
          { name: 'React', proficiency: 'Advanced', yearsOfExperience: 4 },
          { name: 'Node.js', proficiency: 'Advanced', yearsOfExperience: 4 },
          { name: 'Python', proficiency: 'Intermediate', yearsOfExperience: 3 },
          { name: 'AWS', proficiency: 'Advanced', yearsOfExperience: 3 }
        ],
        workExperience: [
          {
            company: 'Tech Corp',
            role: 'Senior Software Engineer',
            startDate: '2023-01',
            endDate: 'Present'
          }
        ],
        education: [
          {
            institution: 'Stanford University',
            degree: 'Bachelor of Science',
            field: 'Computer Science',
            startDate: '2015-09',
            endDate: '2019-06'
          }
        ],
        certifications: [
          {
            name: 'AWS Certified Developer',
            issuer: 'Amazon Web Services',
            date: '2023-01-15'
          }
        ]
      };

      onResumeImport(mockParsedData);
      setIsUploading(false);
    } catch (error) {
      setIsUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Import resume file"
        title="Import resume file"
      />
      
      <button
        onClick={handleButtonClick}
        disabled={isUploading}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: colors.inputBackground,
          color: colors.primaryText,
          border: `1px solid ${colors.border}`,
        }}
        onMouseEnter={(e) => {
          if (!isUploading) {
            e.currentTarget.style.background = colors.hoverBackgroundStrong;
            e.currentTarget.style.borderColor = colors.borderFocused;
          }
        }}
        onMouseLeave={(e) => {
          if (!isUploading) {
            e.currentTarget.style.background = colors.inputBackground;
            e.currentTarget.style.borderColor = colors.border;
          }
        }}
      >
        {isUploading ? (
          <div 
            className="animate-spin rounded-full h-5 w-5 border-b-2"
            style={{ borderColor: colors.primaryBlue, borderTopColor: 'transparent' }}
          ></div>
        ) : (
          <>
            <Upload size={16} />
            <span>Import Resume</span>
          </>
        )}
      </button>
    </>
  );
}

