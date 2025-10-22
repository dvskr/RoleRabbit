'use client';

import React from 'react';
import { ResumeData } from '../../types/resume';

interface ResumePreviewProps {
  resumeData: ResumeData;
  template: string;
  layoutMode: string;
}

export default function ResumePreview({ resumeData, template, layoutMode }: ResumePreviewProps) {
  const getTemplateStyles = () => {
    switch (template) {
      case 'ats':
        return 'font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4;';
      case 'modern':
        return 'font-family: "Segoe UI", sans-serif; font-size: 10pt; line-height: 1.5;';
      case 'creative':
        return 'font-family: "Helvetica Neue", sans-serif; font-size: 10pt; line-height: 1.6;';
      case 'executive':
        return 'font-family: "Times New Roman", serif; font-size: 11pt; line-height: 1.3;';
      default:
        return 'font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.4;';
    }
  };

  const getLayoutClasses = () => {
    switch (layoutMode) {
      case 'two-column':
        return 'grid grid-cols-2 gap-6';
      case 'hybrid':
        return 'space-y-6';
      default:
        return 'space-y-6';
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl mx-auto">
        <div style={getTemplateStyles()} className={getLayoutClasses()}>
          {/* Header Section */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{resumeData.name}</h1>
            <h2 className="text-lg text-gray-700 mb-3">{resumeData.title}</h2>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
              <span>{resumeData.email}</span>
              <span>{resumeData.phone}</span>
              <span>{resumeData.location}</span>
              {resumeData.linkedin && <span>{resumeData.linkedin}</span>}
              {resumeData.github && <span>{resumeData.github}</span>}
              {resumeData.website && <span>{resumeData.website}</span>}
            </div>
          </div>

          {/* Summary Section */}
          {resumeData.summary && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                PROFESSIONAL SUMMARY
              </h3>
              <p className="text-gray-700 leading-relaxed">{resumeData.summary}</p>
            </div>
          )}

          {/* Skills Section */}
          {resumeData.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-300 pb-1">
                TECHNICAL SKILLS
              </h3>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Section */}
          {resumeData.experience.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                PROFESSIONAL EXPERIENCE
              </h3>
              <div className="space-y-4">
                {resumeData.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-semibold text-gray-900">{exp.role}</h4>
                        <p className="text-gray-700">{exp.company}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>{exp.period} - {exp.endPeriod}</p>
                        <p>{exp.location}</p>
                      </div>
                    </div>
                    {exp.skills.length > 0 && (
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                          {exp.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {exp.bullets.map((bullet, index) => (
                        <li key={index}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {resumeData.projects.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                PROJECTS
              </h3>
              <div className="space-y-4">
                {resumeData.projects.map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h4 className="font-semibold text-gray-900">{project.name}</h4>
                        <p className="text-gray-700">{project.subtitle}</p>
                        {project.link && (
                          <a href={project.link} className="text-blue-600 text-sm hover:underline">
                            {project.link}
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mb-2">{project.description}</p>
                    {project.skills.length > 0 && (
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                          {project.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {project.bullets.map((bullet, index) => (
                        <li key={index}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education Section */}
          {resumeData.education.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                EDUCATION
              </h3>
              <div className="space-y-3">
                {resumeData.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                        <p className="text-gray-700">{edu.school}</p>
                        <p className="text-gray-600 text-sm">{edu.location}</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>{edu.startDate} - {edu.endDate}</p>
                        {edu.gpa && <p>GPA: {edu.gpa}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications Section */}
          {resumeData.certifications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b border-gray-300 pb-1">
                CERTIFICATIONS
              </h3>
              <div className="space-y-3">
                {resumeData.certifications.map((cert) => (
                  <div key={cert.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                        <p className="text-gray-700">{cert.issuer}</p>
                        {cert.link && (
                          <a href={cert.link} className="text-blue-600 text-sm hover:underline">
                            View Certificate
                          </a>
                        )}
                      </div>
                    </div>
                    {cert.skills.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {cert.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
