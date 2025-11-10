import React, { useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAIAgentsContext } from '../index';
import {
  generatePDF,
  generateDOCX,
  generateCoverLetterPDF,
  generateCoverLetterDOCX,
} from '../utils/documentGenerator';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  title?: string;
  type?: 'resume' | 'cover-letter' | 'research' | 'interview-prep';
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  title = 'Preview',
  type = 'resume',
}) => {
  const { theme } = useTheme();
  const colors = theme?.colors;
  const { showSuccess, showError } = useAIAgentsContext();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !colors || !data) return null;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const filename = `${title.replace(/\s+/g, '-').toLowerCase()}.pdf`;

      if (type === 'resume') {
        await generatePDF(data, filename);
        showSuccess('Resume PDF downloaded successfully!');
      } else if (type === 'cover-letter') {
        const content = typeof data === 'string' ? data : data.content || JSON.stringify(data);
        await generateCoverLetterPDF(content, filename);
        showSuccess('Cover letter PDF downloaded successfully!');
      } else {
        // For research/interview-prep, convert to text and generate PDF
        const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        await generateCoverLetterPDF(content, filename);
        showSuccess('Document downloaded as PDF!');
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      showError('Failed to download PDF. Make sure your browser allows downloads.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDOCX = async () => {
    setIsDownloading(true);
    try {
      const filename = `${title.replace(/\s+/g, '-').toLowerCase()}.docx`;

      if (type === 'resume') {
        await generateDOCX(data, filename);
        showSuccess('Resume DOCX downloaded successfully!');
      } else if (type === 'cover-letter') {
        const content = typeof data === 'string' ? data : data.content || JSON.stringify(data);
        await generateCoverLetterDOCX(content, filename);
        showSuccess('Cover letter DOCX downloaded successfully!');
      } else {
        // For research/interview-prep
        const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        await generateCoverLetterDOCX(content, filename);
        showSuccess('Document downloaded as DOCX!');
      }
    } catch (error) {
      console.error('Error downloading DOCX:', error);
      showError('Failed to download DOCX. Make sure your browser allows downloads.');
    } finally {
      setIsDownloading(false);
    }
  };

  const renderResumePreview = (resumeData: any) => {
    return (
      <div className="space-y-6">
        {/* Header */}
        {resumeData.name && (
          <div className="text-center pb-4" style={{ borderBottom: `2px solid ${colors.border}` }}>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.primaryText }}>
              {resumeData.name}
            </h1>
            {resumeData.title && (
              <p className="text-lg" style={{ color: colors.secondaryText }}>
                {resumeData.title}
              </p>
            )}
            <div className="flex justify-center gap-4 mt-3 text-sm" style={{ color: colors.secondaryText }}>
              {resumeData.email && <span>{resumeData.email}</span>}
              {resumeData.phone && <span>•</span>}
              {resumeData.phone && <span>{resumeData.phone}</span>}
              {resumeData.location && <span>•</span>}
              {resumeData.location && <span>{resumeData.location}</span>}
            </div>
          </div>
        )}

        {/* Summary */}
        {resumeData.summary && (
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: colors.primaryText }}>
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: colors.secondaryText }}>
              {resumeData.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {resumeData.experience && resumeData.experience.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: colors.primaryText }}>
              Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold" style={{ color: colors.primaryText }}>
                        {exp.role}
                      </h3>
                      <p className="text-sm" style={{ color: colors.secondaryText }}>
                        {exp.company}
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: colors.secondaryText }}>
                      {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-sm leading-relaxed" style={{ color: colors.secondaryText }}>
                      {exp.description}
                    </p>
                  )}
                  {exp.achievements && exp.achievements.length > 0 && (
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {exp.achievements.map((achievement: string, i: number) => (
                        <li key={i} className="text-sm" style={{ color: colors.secondaryText }}>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: colors.primaryText }}>
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-lg text-sm"
                  style={{
                    background: colors.badgePurpleBg,
                    color: colors.badgePurpleText,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {resumeData.education && resumeData.education.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: colors.primaryText }}>
              Education
            </h2>
            <div className="space-y-3">
              {resumeData.education.map((edu: any, index: number) => (
                <div key={index}>
                  <h3 className="font-semibold" style={{ color: colors.primaryText }}>
                    {edu.degree}
                  </h3>
                  <p className="text-sm" style={{ color: colors.secondaryText }}>
                    {edu.institution} • {edu.year}
                  </p>
                  {edu.field && (
                    <p className="text-sm" style={{ color: colors.secondaryText }}>
                      {edu.field}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {resumeData.certifications && resumeData.certifications.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-3" style={{ color: colors.primaryText }}>
              Certifications
            </h2>
            <div className="space-y-2">
              {resumeData.certifications.map((cert: any, index: number) => (
                <div key={index}>
                  <p className="font-semibold" style={{ color: colors.primaryText }}>
                    {cert.name}
                  </p>
                  <p className="text-sm" style={{ color: colors.secondaryText }}>
                    {cert.issuer} • {cert.date}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCoverLetterPreview = (letterData: any) => {
    return (
      <div className="space-y-6">
        <div className="text-sm space-y-4" style={{ color: colors.secondaryText }}>
          {letterData.content?.split('\n\n').map((paragraph: string, index: number) => (
            <p key={index} className="leading-relaxed">
              {paragraph}
            </p>
          )) || <p>{typeof letterData === 'string' ? letterData : JSON.stringify(letterData, null, 2)}</p>}
        </div>
      </div>
    );
  };

  const renderGenericPreview = (data: any) => {
    if (typeof data === 'string') {
      return (
        <div className="whitespace-pre-wrap text-sm" style={{ color: colors.secondaryText }}>
          {data}
        </div>
      );
    }

    return (
      <pre
        className="text-sm overflow-x-auto p-4 rounded-lg"
        style={{
          background: colors.background,
          color: colors.secondaryText,
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.6)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: colors.backgroundSecondary,
          border: `1px solid ${colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-shrink-0"
          style={{
            background: colors.background,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ background: colors.badgePurpleBg }}
            >
              <FileText size={20} style={{ color: colors.badgePurpleText }} />
            </div>
            <div>
              <h2
                className="text-lg font-semibold"
                style={{ color: colors.primaryText }}
              >
                {title}
              </h2>
              <p className="text-sm" style={{ color: colors.secondaryText }}>
                Preview your generated document
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: isDownloading ? colors.inputBackground : colors.badgePurpleBg,
                color: isDownloading ? colors.secondaryText : colors.badgePurpleText,
                border: `1px solid ${colors.badgePurpleText}`,
                opacity: isDownloading ? 0.6 : 1,
                cursor: isDownloading ? 'not-allowed' : 'pointer',
              }}
            >
              <Download size={16} />
              {isDownloading ? 'Downloading...' : 'PDF'}
            </button>
            <button
              onClick={handleDownloadDOCX}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                background: colors.inputBackground,
                border: `1px solid ${colors.border}`,
                color: colors.primaryText,
                opacity: isDownloading ? 0.6 : 1,
                cursor: isDownloading ? 'not-allowed' : 'pointer',
              }}
            >
              <Download size={16} />
              {isDownloading ? 'Downloading...' : 'DOCX'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors ml-2"
              style={{ color: colors.secondaryText }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = colors.inputBackground;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto p-8"
          style={{
            background: '#ffffff',
            color: '#000000',
          }}
        >
          <div className="max-w-3xl mx-auto">
            {type === 'resume' && renderResumePreview(data)}
            {type === 'cover-letter' && renderCoverLetterPreview(data)}
            {(type === 'research' || type === 'interview-prep') && renderGenericPreview(data)}
          </div>
        </div>
      </div>
    </div>
  );
};
