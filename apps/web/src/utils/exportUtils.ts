// Export-related utility functions
import { ResumeData } from '../types/resume';

export interface ExportOptions {
  fileName?: string;
  includePreview?: boolean;
  format?: 'pdf' | 'docx' | 'html' | 'json';
  template?: string;
  layout?: string;
}

/**
 * Export resume to JSON format
 */
export const exportToJSON = (resumeData: ResumeData, options: ExportOptions = {}): string => {
  const exportData = {
    resume: resumeData,
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      format: 'json',
      fileName: options.fileName || generateFileName(resumeData, 'json')
    }
  };
  
  return JSON.stringify(exportData, null, 2);
};

/**
 * Export resume to HTML format
 */
export const exportToHTML = (resumeData: ResumeData, options: ExportOptions = {}): string => {
  const template = options.template || 'ats';
  const layout = options.layout || 'one-column';
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${resumeData.name} - Resume</title>
    <style>
        ${getTemplateStyles(template)}
        ${getLayoutStyles(layout)}
    </style>
</head>
<body>
    ${generateHTMLContent(resumeData, template, layout)}
</body>
</html>`;
  
  return html;
};

/**
 * Generate PDF export (placeholder - would integrate with PDF library)
 */
export const exportToPDF = async (resumeData: ResumeData, options: ExportOptions = {}): Promise<Blob> => {
  // This would typically use a library like jsPDF or Puppeteer
  // For now, we'll return a placeholder
  const html = exportToHTML(resumeData, options);
  
  // In a real implementation, you would:
  // 1. Convert HTML to PDF using a library
  // 2. Return the PDF blob
  
  return new Blob([html], { type: 'text/html' });
};

/**
 * Export to Word document format (placeholder)
 */
export const exportToDOCX = async (resumeData: ResumeData, options: ExportOptions = {}): Promise<Blob> => {
  // This would typically use a library like docx
  // For now, we'll return a placeholder
  
  const content = generateWordContent(resumeData);
  
  // In a real implementation, you would:
  // 1. Create a Word document using docx library
  // 2. Return the DOCX blob
  
  return new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
};

/**
 * Download file with specified name and content
 */
export const downloadFile = (content: string | Blob, fileName: string, mimeType: string = 'text/plain') => {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Generate filename for export
 */
const generateFileName = (resumeData: ResumeData, extension: string): string => {
  const name = resumeData.name?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Resume';
  const title = resumeData.title?.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_') || 'Professional';
  const date = new Date().toISOString().slice(0, 7);
  
  return `${name}_${title}_${date}.${extension}`;
};

/**
 * Get CSS styles for different templates
 */
const getTemplateStyles = (template: string): string => {
  const baseStyles = `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; }
    .resume { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .name { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
    .title { font-size: 18px; color: #666; margin-bottom: 10px; }
    .contact { font-size: 14px; color: #666; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #333; padding-bottom: 5px; }
    .item { margin-bottom: 15px; }
    .item-title { font-weight: bold; font-size: 16px; }
    .item-subtitle { color: #666; font-size: 14px; }
    .item-date { color: #666; font-size: 12px; }
    .skills { display: flex; flex-wrap: wrap; gap: 5px; }
    .skill { background: #f0f0f0; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
    .bullets { margin-left: 20px; }
    .bullet { margin-bottom: 5px; }
  `;
  
  switch (template) {
    case 'modern':
      return baseStyles + `
        body { font-family: 'Segoe UI', sans-serif; }
        .section-title { color: #2563eb; border-bottom-color: #2563eb; }
        .skill { background: #dbeafe; color: #1e40af; }
      `;
    case 'creative':
      return baseStyles + `
        body { font-family: 'Helvetica Neue', sans-serif; }
        .section-title { color: #7c3aed; border-bottom-color: #7c3aed; }
        .skill { background: #f3e8ff; color: #6b21a8; }
      `;
    case 'executive':
      return baseStyles + `
        body { font-family: 'Times New Roman', serif; }
        .section-title { color: #1f2937; border-bottom-color: #1f2937; }
        .skill { background: #f9fafb; color: #374151; }
      `;
    default: // ATS
      return baseStyles;
  }
};

/**
 * Get CSS styles for different layouts
 */
const getLayoutStyles = (layout: string): string => {
  switch (layout) {
    case 'two-column':
      return `
        .resume { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .header { grid-column: 1 / -1; }
        .contact { grid-column: 1 / -1; }
      `;
    case 'hybrid':
      return `
        .resume { display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
        .header { grid-column: 1 / -1; }
        .main-content { grid-column: 1; }
        .sidebar { grid-column: 2; }
      `;
    default: // one-column
      return '';
  }
};

/**
 * Generate HTML content for resume
 */
const generateHTMLContent = (resumeData: ResumeData, template: string, layout: string): string => {
  return `
    <div class="resume">
      <div class="header">
        <div class="name">${resumeData.name}</div>
        <div class="title">${resumeData.title}</div>
        <div class="contact">
          ${resumeData.email} | ${resumeData.phone} | ${resumeData.location}
          ${resumeData.linkedin ? ` | ${resumeData.linkedin}` : ''}
          ${resumeData.github ? ` | ${resumeData.github}` : ''}
          ${resumeData.website ? ` | ${resumeData.website}` : ''}
        </div>
      </div>
      
      ${resumeData.summary ? `
        <div class="section">
          <div class="section-title">Professional Summary</div>
          <p>${resumeData.summary}</p>
        </div>
      ` : ''}
      
      ${resumeData.skills.length > 0 ? `
        <div class="section">
          <div class="section-title">Technical Skills</div>
          <div class="skills">
            ${resumeData.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
          </div>
        </div>
      ` : ''}
      
      ${resumeData.experience.length > 0 ? `
        <div class="section">
          <div class="section-title">Professional Experience</div>
          ${resumeData.experience.map(exp => `
            <div class="item">
              <div class="item-title">${exp.role}</div>
              <div class="item-subtitle">${exp.company}</div>
              <div class="item-date">${exp.period} - ${exp.endPeriod} | ${exp.location}</div>
              ${exp.skills.length > 0 ? `
                <div class="skills" style="margin: 10px 0;">
                  ${exp.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
                </div>
              ` : ''}
              ${exp.bullets.length > 0 ? `
                <div class="bullets">
                  ${exp.bullets.map(bullet => `<div class="bullet">• ${bullet}</div>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${resumeData.projects.length > 0 ? `
        <div class="section">
          <div class="section-title">Projects</div>
          ${resumeData.projects.map(project => `
            <div class="item">
              <div class="item-title">${project.name}</div>
              ${project.subtitle ? `<div class="item-subtitle">${project.subtitle}</div>` : ''}
              ${project.link ? `<div class="item-date">${project.link}</div>` : ''}
              <p>${project.description}</p>
              ${project.skills.length > 0 ? `
                <div class="skills" style="margin: 10px 0;">
                  ${project.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
                </div>
              ` : ''}
              ${project.bullets.length > 0 ? `
                <div class="bullets">
                  ${project.bullets.map(bullet => `<div class="bullet">• ${bullet}</div>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${resumeData.education.length > 0 ? `
        <div class="section">
          <div class="section-title">Education</div>
          ${resumeData.education.map(edu => `
            <div class="item">
              <div class="item-title">${edu.degree}</div>
              <div class="item-subtitle">${edu.school}</div>
              <div class="item-date">${edu.startDate} - ${edu.endDate} | ${edu.location}</div>
              ${edu.gpa ? `<div class="item-date">GPA: ${edu.gpa}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${resumeData.certifications.length > 0 ? `
        <div class="section">
          <div class="section-title">Certifications</div>
          ${resumeData.certifications.map(cert => `
            <div class="item">
              <div class="item-title">${cert.name}</div>
              <div class="item-subtitle">${cert.issuer}</div>
              ${cert.link ? `<div class="item-date">${cert.link}</div>` : ''}
              ${cert.skills.length > 0 ? `
                <div class="skills" style="margin: 10px 0;">
                  ${cert.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
};

/**
 * Generate Word document content (simplified)
 */
const generateWordContent = (resumeData: ResumeData): string => {
  // This is a simplified version - in reality, you'd use the docx library
  return `
    ${resumeData.name}
    ${resumeData.title}
    
    Contact Information:
    ${resumeData.email} | ${resumeData.phone} | ${resumeData.location}
    
    ${resumeData.summary ? `Professional Summary:\n${resumeData.summary}\n` : ''}
    
    ${resumeData.skills.length > 0 ? `Skills:\n${resumeData.skills.join(', ')}\n` : ''}
    
    ${resumeData.experience.length > 0 ? `Experience:\n${resumeData.experience.map(exp => 
      `${exp.role} at ${exp.company}\n${exp.period} - ${exp.endPeriod}\n${exp.bullets.join('\n')}\n`
    ).join('\n')}` : ''}
  `;
};

/**
 * Validate export options
 */
export const validateExportOptions = (options: ExportOptions): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (options.fileName && !/^[a-zA-Z0-9\s\-_\.]+$/.test(options.fileName)) {
    errors.push('File name contains invalid characters');
  }
  
  if (options.format && !['pdf', 'docx', 'html', 'json'].includes(options.format)) {
    errors.push('Invalid export format');
  }
  
  if (options.template && !['ats', 'modern', 'creative', 'executive'].includes(options.template)) {
    errors.push('Invalid template');
  }
  
  if (options.layout && !['one-column', 'two-column', 'hybrid'].includes(options.layout)) {
    errors.push('Invalid layout');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
