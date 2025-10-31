'use client';

import React from 'react';
import { EyeOff } from 'lucide-react';
import { ResumeData, SectionVisibility } from '../../../types/resume';
import { getTemplateClasses } from '../utils/templateClassesHelper';

interface ResumePreviewProps {
  resumeFileName: string;
  resumeData: ResumeData;
  sectionOrder: string[];
  sectionVisibility: SectionVisibility;
  selectedTemplateId: string;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
  onExitPreview: () => void;
}

export function ResumePreview({
  resumeFileName,
  resumeData,
  sectionOrder,
  sectionVisibility,
  selectedTemplateId,
  fontFamily,
  fontSize,
  lineSpacing,
  onExitPreview,
}: ResumePreviewProps) {
  const templateClasses = getTemplateClasses(selectedTemplateId);

  const fontMap: Record<string, string> = {
    arial: 'Arial',
    times: 'Times New Roman',
    verdana: 'Verdana',
  };
  const selectedFont = fontMap[fontFamily] || 'Arial';

  return (
    <div className="h-full bg-gray-100 overflow-auto">
      {/* Sticky Preview Header */}
      <div className="sticky top-0 bg-white border-b border-gray-300 px-6 py-3 z-10 flex items-center justify-between shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Preview: {resumeFileName}</h2>
        <button
          onClick={onExitPreview}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          <EyeOff size={16} />
          Exit Preview
        </button>
      </div>
      
      {/* Document Preview */}
      <div 
        className={`max-w-[8.5in] mx-auto mt-8 mb-12 shadow-2xl p-[1in] print:p-0 ${templateClasses.container}`} 
        style={{ minHeight: '11in' }}
      >
        {/* Document Header */}
        <div className={`mb-6 pb-4 ${templateClasses.header}`}>
          <h1 
            className={`text-3xl font-bold mb-1 ${templateClasses.nameColor}`} 
            style={{ fontFamily: selectedFont }}
          >
            {resumeData.name}
          </h1>
          <p className={`text-lg font-medium ${templateClasses.titleColor}`}>{resumeData.title}</p>
          <div className="flex gap-3 mt-2 text-sm text-gray-600">
            <span>{resumeData.email}</span>
            <span>•</span>
            <span>{resumeData.phone}</span>
            <span>•</span>
            <span>{resumeData.location}</span>
          </div>
        </div>

        {/* Render sections based on sectionOrder */}
        {sectionOrder.map((sectionId) => {
          if (!sectionVisibility[sectionId]) return null;
          
          const sectionMap: Record<string, React.ReactNode> = {
            summary: (
              <div className="mb-4">
                <h2 className={`text-xl font-bold uppercase mb-1 ${templateClasses.sectionColor}`} style={{ fontSize }}>
                  {resumeData.summary ? 'Professional Summary' : 'Summary'}
                </h2>
                <p className="text-gray-800" style={{ lineHeight: lineSpacing, fontSize }}>
                  {resumeData.summary}
                </p>
              </div>
            ),
            skills: (
              <div className="mb-4">
                <h2 className={`text-xl font-bold uppercase mb-2 ${templateClasses.sectionColor}`} style={{ fontSize }}>
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills?.map((skill: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ),
            experience: (
              <div className="mb-4">
                <h2 className={`text-xl font-bold uppercase mb-2 ${templateClasses.sectionColor}`} style={{ fontSize }}>
                  Professional Experience
                </h2>
                <div className="space-y-3">
                  {resumeData.experience?.map((exp: any, idx: number) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-gray-900" style={{ fontSize }}>
                          {exp.position}
                        </span>
                        <span className="text-sm text-gray-600">{exp.period} - {exp.endPeriod}</span>
                      </div>
                      <p className="text-gray-700 mb-1" style={{ fontSize }}>
                        {exp.company} {exp.location && `• ${exp.location}`}
                      </p>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <ul className="list-disc list-inside ml-2 text-gray-700" style={{ fontSize }}>
                          {exp.bullets.map((bullet: string, i: number) => (
                            <li key={i} className="mb-1">{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
            education: (
              <div className="mb-4">
                <h2 className={`text-xl font-bold uppercase mb-2 ${templateClasses.sectionColor}`} style={{ fontSize }}>
                  Education
                </h2>
                <div className="space-y-2">
                  {resumeData.education?.map((edu: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900" style={{ fontSize }}>
                          {edu.degree}
                        </span>
                        <span className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</span>
                      </div>
                      <p className="text-gray-700" style={{ fontSize }}>
                        {edu.school}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ),
            projects: (
              <div className="mb-4">
                <h2 className={`text-xl font-bold uppercase mb-2 ${templateClasses.sectionColor}`} style={{ fontSize }}>
                  Projects
                </h2>
                <div className="space-y-3">
                  {resumeData.projects?.map((project: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-gray-900" style={{ fontSize }}>
                          {project.name}
                        </span>
                        {project.link && (
                          <a href={project.link} className="text-sm text-blue-600 hover:underline">
                            View Project
                          </a>
                        )}
                      </div>
                      <p className="text-gray-700 mb-1" style={{ fontSize }}>
                        {project.description}
                      </p>
                      {project.bullets && project.bullets.length > 0 && (
                        <ul className="list-disc list-inside ml-2 text-gray-700" style={{ fontSize }}>
                          {project.bullets.map((bullet: string, i: number) => (
                            <li key={i} className="mb-1">{bullet}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
            certifications: (
              <div className="mb-4">
                <h2 className={`text-xl font-bold uppercase mb-2 ${templateClasses.sectionColor}`} style={{ fontSize }}>
                  Certifications
                </h2>
                <div className="space-y-2">
                  {resumeData.certifications?.map((cert: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900" style={{ fontSize }}>
                          {cert.name}
                        </span>
                        {cert.link && (
                          <a href={cert.link} className="text-sm text-blue-600 hover:underline">
                            Verify
                          </a>
                        )}
                      </div>
                      <p className="text-gray-700" style={{ fontSize }}>
                        {cert.issuer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ),
          };
          
          return (
            <React.Fragment key={sectionId}>
              {sectionMap[sectionId] || null}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

