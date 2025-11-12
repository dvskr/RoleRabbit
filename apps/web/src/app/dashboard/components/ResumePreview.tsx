'use client';

import React, { useMemo } from 'react';
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
  sectionSpacing?: string;
  margins?: string;
  headingStyle?: string;
  bulletStyle?: string;
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
  sectionSpacing = 'medium',
  margins = 'normal',
  headingStyle = 'bold',
  bulletStyle = 'disc',
  onExitPreview,
}: ResumePreviewProps) {
  const templateClasses = getTemplateClasses(selectedTemplateId);

  // Convert formatting values to CSS styles (matching ResumeEditor logic)
  const formattingStyles = useMemo(() => {
    const fontMap: Record<string, string> = {
      arial: 'Arial, sans-serif',
      calibri: 'Calibri, sans-serif',
      times: 'Times New Roman, serif',
      helvetica: 'Helvetica, Arial, sans-serif',
      verdana: 'Verdana, sans-serif',
    };
    
    const fontSizeMap: Record<string, string> = {
      ats10pt: '10pt',
      ats11pt: '11pt',
      ats12pt: '12pt',
    };
    
    const lineSpacingMap: Record<string, string> = {
      tight: '1.2',
      normal: '1.5',
      loose: '1.8',
    };
    
    const sectionSpacingMap: Record<string, string> = {
      tight: '0.5rem',
      medium: '1rem',
      loose: '1.5rem',
    };
    
    const marginsMap: Record<string, string> = {
      narrow: '0.5in',
      normal: '1in',
      wide: '1.5in',
    };

    const headingStyleMap: Record<string, string> = {
      bold: '700',
      semibold: '600',
      extrabold: '800',
    };

    const bulletStyleMap: Record<string, { listStyleType: string; bulletChar: string }> = {
      disc: { listStyleType: 'disc', bulletChar: '•' },
      circle: { listStyleType: 'circle', bulletChar: '○' },
      square: { listStyleType: 'square', bulletChar: '▪' },
      arrow: { listStyleType: 'none', bulletChar: '→' },
      check: { listStyleType: 'none', bulletChar: '✓' },
      dash: { listStyleType: 'none', bulletChar: '–' },
    };

    return {
      fontFamily: fontMap[fontFamily.toLowerCase()] || 'Arial, sans-serif',
      fontSize: fontSizeMap[fontSize.toLowerCase()] || '11pt',
      lineHeight: lineSpacingMap[lineSpacing.toLowerCase()] || '1.5',
      sectionSpacing: sectionSpacingMap[sectionSpacing.toLowerCase()] || '1rem',
      padding: marginsMap[margins.toLowerCase()] || '1in',
      headingWeight: headingStyleMap[headingStyle.toLowerCase()] || '700',
      bulletStyle: bulletStyleMap[bulletStyle.toLowerCase()] || bulletStyleMap.disc,
    };
  }, [fontFamily, fontSize, lineSpacing, sectionSpacing, margins, headingStyle, bulletStyle]);

  const contactItems = useMemo(() => {
    return [
      resumeData.email,
      resumeData.phone,
      resumeData.location,
      resumeData.linkedin,
      resumeData.github,
      resumeData.website,
    ]
      .map((value) => (typeof value === 'string' ? value.trim() : ''))
      .filter(Boolean);
  }, [
    resumeData.email,
    resumeData.phone,
    resumeData.location,
    resumeData.linkedin,
    resumeData.github,
    resumeData.website,
  ]);

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
        className={`max-w-[8.5in] mx-auto mt-8 mb-12 shadow-2xl print:p-0 ${templateClasses.container}`} 
        style={{ 
          minHeight: '11in',
          padding: formattingStyles.padding,
          fontFamily: formattingStyles.fontFamily,
          fontSize: formattingStyles.fontSize,
          lineHeight: formattingStyles.lineHeight,
        }}
      >
        {/* Document Header */}
        <div className={`pb-4 ${templateClasses.header}`} style={{ marginBottom: formattingStyles.sectionSpacing }}>
          <h1 
            className={`text-3xl mb-1 ${templateClasses.nameColor}`} 
            style={{ 
              fontFamily: formattingStyles.fontFamily,
              fontWeight: formattingStyles.headingWeight,
            }}
          >
            {resumeData.name}
          </h1>
          <p 
            className={`text-lg ${templateClasses.titleColor}`}
            style={{ fontFamily: formattingStyles.fontFamily }}
          >
            {resumeData.title}
          </p>
          {contactItems.length > 0 && (
            <div
              className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600"
              style={{ fontFamily: formattingStyles.fontFamily }}
            >
              {contactItems.map((item, index) => (
                <React.Fragment key={`${item}-${index}`}>
                  {index > 0 && <span>•</span>}
                  <span>{item}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Render sections based on sectionOrder */}
        {sectionOrder.map((sectionId) => {
          if (!sectionVisibility[sectionId]) return null;
          
          const sectionMap: Record<string, React.ReactNode> = {
            summary: (
              <div style={{ marginBottom: formattingStyles.sectionSpacing }}>
                <h2 
                  className={`text-xl uppercase mb-1 ${templateClasses.sectionColor}`} 
                  style={{ 
                    fontSize: formattingStyles.fontSize,
                    fontWeight: formattingStyles.headingWeight,
                    fontFamily: formattingStyles.fontFamily,
                  }}
                >
                  {resumeData.summary ? 'Professional Summary' : 'Summary'}
                </h2>
                <p 
                  className="text-gray-800" 
                  style={{ 
                    lineHeight: formattingStyles.lineHeight, 
                    fontSize: formattingStyles.fontSize,
                    fontFamily: formattingStyles.fontFamily,
                  }}
                >
                  {resumeData.summary}
                </p>
              </div>
            ),
            skills: (
              <div style={{ marginBottom: formattingStyles.sectionSpacing }}>
                <h2 
                  className={`text-xl uppercase mb-2 ${templateClasses.sectionColor}`} 
                  style={{ 
                    fontSize: formattingStyles.fontSize,
                    fontWeight: formattingStyles.headingWeight,
                    fontFamily: formattingStyles.fontFamily,
                  }}
                >
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {resumeData.skills?.map((skill: string, idx: number) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1 bg-gray-100 rounded text-sm text-gray-800"
                      style={{ fontFamily: formattingStyles.fontFamily }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ),
            experience: (
              <div style={{ marginBottom: formattingStyles.sectionSpacing }}>
                <h2 
                  className={`text-xl uppercase mb-2 ${templateClasses.sectionColor}`} 
                  style={{ 
                    fontSize: formattingStyles.fontSize,
                    fontWeight: formattingStyles.headingWeight,
                    fontFamily: formattingStyles.fontFamily,
                  }}
                >
                  Professional Experience
                </h2>
                <div className="space-y-3">
                  {resumeData.experience?.map((exp: any, idx: number) => (
                    <div key={idx} className="mb-3">
                      <div className="flex justify-between items-start mb-1">
                        <span 
                          className="font-semibold text-gray-900" 
                          style={{ 
                            fontSize: formattingStyles.fontSize,
                            fontFamily: formattingStyles.fontFamily,
                          }}
                        >
                          {exp.position || exp.jobTitle}
                        </span>
                        <span 
                          className="text-sm text-gray-600"
                          style={{ fontFamily: formattingStyles.fontFamily }}
                        >
                          {exp.startDate || exp.period} {exp.endDate || exp.endPeriod ? `- ${exp.endDate || exp.endPeriod}` : ''}
                        </span>
                      </div>
                      <p 
                        className="text-gray-700 mb-1" 
                        style={{ 
                          fontSize: formattingStyles.fontSize,
                          fontFamily: formattingStyles.fontFamily,
                        }}
                      >
                        {exp.company || exp.companyName} {exp.location && `• ${exp.location}`}
                      </p>
                      {((exp.bullets && exp.bullets.length > 0) || (exp.responsibilities && exp.responsibilities.length > 0)) && (
                        <ul 
                          className="ml-2 text-gray-700" 
                          style={{ 
                            fontSize: formattingStyles.fontSize,
                            fontFamily: formattingStyles.fontFamily,
                            listStyleType: formattingStyles.bulletStyle.listStyleType as any,
                            paddingLeft: formattingStyles.bulletStyle.listStyleType === 'none' ? '1rem' : undefined,
                          }}
                        >
                          {(exp.bullets || exp.responsibilities || []).map((bullet: string, i: number) => (
                            <li key={i} className="mb-1">
                              {formattingStyles.bulletStyle.listStyleType === 'none' && (
                                <span className="mr-2">{formattingStyles.bulletStyle.bulletChar}</span>
                              )}
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
            education: (
              <div style={{ marginBottom: formattingStyles.sectionSpacing }}>
                <h2 
                  className={`text-xl uppercase mb-2 ${templateClasses.sectionColor}`} 
                  style={{ 
                    fontSize: formattingStyles.fontSize,
                    fontWeight: formattingStyles.headingWeight,
                    fontFamily: formattingStyles.fontFamily,
                  }}
                >
                  Education
                </h2>
                <div className="space-y-2">
                  {resumeData.education?.map((edu: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between">
                        <span 
                          className="font-semibold text-gray-900" 
                          style={{ 
                            fontSize: formattingStyles.fontSize,
                            fontFamily: formattingStyles.fontFamily,
                          }}
                        >
                          {edu.degree}
                        </span>
                        <span 
                          className="text-sm text-gray-600"
                          style={{ fontFamily: formattingStyles.fontFamily }}
                        >
                          {edu.startDate} - {edu.endDate}
                        </span>
                      </div>
                      <p 
                        className="text-gray-700" 
                        style={{ 
                          fontSize: formattingStyles.fontSize,
                          fontFamily: formattingStyles.fontFamily,
                        }}
                      >
                        {edu.school}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ),
            projects: (
              <div style={{ marginBottom: formattingStyles.sectionSpacing }}>
                <h2 
                  className={`text-xl uppercase mb-2 ${templateClasses.sectionColor}`} 
                  style={{ 
                    fontSize: formattingStyles.fontSize,
                    fontWeight: formattingStyles.headingWeight,
                    fontFamily: formattingStyles.fontFamily,
                  }}
                >
                  Projects
                </h2>
                <div className="space-y-3">
                  {resumeData.projects?.map((project: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between items-start mb-1">
                        <span 
                          className="font-semibold text-gray-900" 
                          style={{ 
                            fontSize: formattingStyles.fontSize,
                            fontFamily: formattingStyles.fontFamily,
                          }}
                        >
                          {project.name}
                        </span>
                        {project.link && (
                          <a 
                            href={project.link} 
                            className="text-sm text-blue-600 hover:underline"
                            style={{ fontFamily: formattingStyles.fontFamily }}
                          >
                            View Project
                          </a>
                        )}
                      </div>
                      <p 
                        className="text-gray-700 mb-1" 
                        style={{ 
                          fontSize: formattingStyles.fontSize,
                          fontFamily: formattingStyles.fontFamily,
                        }}
                      >
                        {project.description}
                      </p>
                      {project.bullets && project.bullets.length > 0 && (
                        <ul 
                          className="ml-2 text-gray-700" 
                          style={{ 
                            fontSize: formattingStyles.fontSize,
                            fontFamily: formattingStyles.fontFamily,
                            listStyleType: formattingStyles.bulletStyle.listStyleType as any,
                            paddingLeft: formattingStyles.bulletStyle.listStyleType === 'none' ? '1rem' : undefined,
                          }}
                        >
                          {project.bullets.map((bullet: string, i: number) => (
                            <li key={i} className="mb-1">
                              {formattingStyles.bulletStyle.listStyleType === 'none' && (
                                <span className="mr-2">{formattingStyles.bulletStyle.bulletChar}</span>
                              )}
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ),
            certifications: (
              <div style={{ marginBottom: formattingStyles.sectionSpacing }}>
                <h2 
                  className={`text-xl uppercase mb-2 ${templateClasses.sectionColor}`} 
                  style={{ 
                    fontSize: formattingStyles.fontSize,
                    fontWeight: formattingStyles.headingWeight,
                    fontFamily: formattingStyles.fontFamily,
                  }}
                >
                  Certifications
                </h2>
                <div className="space-y-2">
                  {resumeData.certifications?.map((cert: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between">
                        <span 
                          className="font-semibold text-gray-900" 
                          style={{ 
                            fontSize: formattingStyles.fontSize,
                            fontFamily: formattingStyles.fontFamily,
                          }}
                        >
                          {cert.name}
                        </span>
                        {cert.link && (
                          <a 
                            href={cert.link} 
                            className="text-sm text-blue-600 hover:underline"
                            style={{ fontFamily: formattingStyles.fontFamily }}
                          >
                            Verify
                          </a>
                        )}
                      </div>
                      <p 
                        className="text-gray-700" 
                        style={{ 
                          fontSize: formattingStyles.fontSize,
                          fontFamily: formattingStyles.fontFamily,
                        }}
                      >
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

