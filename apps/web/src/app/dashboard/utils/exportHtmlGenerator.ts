/**
 * Utility function for generating HTML content for resume export
 */

import { ResumeData, SectionVisibility, CustomSection } from '../../../types/resume';
import { resumeTemplates } from '../../../data/templates';

interface ExportOptions {
  resumeFileName: string;
  resumeData: ResumeData;
  customSections: CustomSection[];
  sectionOrder: string[];
  sectionVisibility: SectionVisibility;
  selectedTemplateId: string | null;
  fontFamily: string;
  fontSize: string;
  lineSpacing: string;
}

/**
 * Get template-specific CSS classes for export HTML
 */
function getTemplateClassesForExport(templateId: string | null) {
  const template = resumeTemplates.find(t => t.id === templateId);
  if (!template) {
    return {
      container: 'bg-white border-gray-300',
      header: 'border-b border-gray-300',
      nameColor: 'text-gray-900',
      titleColor: 'text-gray-700',
      sectionColor: 'text-gray-900',
      accentColor: 'text-gray-700'
    };
  }

  const colorScheme = template.colorScheme;
  let containerClass = 'bg-white';
  let headerClass = 'border-b-2';
  const nameColor = 'text-gray-900';
  let titleColor = 'text-gray-700';
  let sectionColor = 'text-gray-900';
  let accentColor = 'text-gray-700';

  switch (colorScheme) {
    case 'blue':
      containerClass = 'bg-white';
      headerClass = 'border-b-2 border-blue-500';
      titleColor = 'text-blue-600';
      sectionColor = 'text-blue-600';
      accentColor = 'text-blue-600';
      break;
    case 'green':
      containerClass = 'bg-white';
      headerClass = 'border-b-2 border-green-500';
      titleColor = 'text-green-600';
      sectionColor = 'text-green-600';
      accentColor = 'text-green-600';
      break;
    default:
      containerClass = 'bg-white';
      headerClass = 'border-b border-gray-300';
      break;
  }

  return {
    container: containerClass,
    header: headerClass,
    nameColor,
    titleColor,
    sectionColor,
    accentColor
  };
}

/**
 * Generate HTML content for resume export
 */
export function generateResumeHTML(options: ExportOptions): string {
  const {
    resumeFileName,
    resumeData,
    sectionOrder,
    sectionVisibility,
    selectedTemplateId,
    fontFamily,
    fontSize,
    lineSpacing,
  } = options;

  const classes = getTemplateClassesForExport(selectedTemplateId);
  const fontMap: Record<string, string> = {
    arial: 'Arial',
    calibri: 'Calibri',
    times: 'Times New Roman',
    helvetica: 'Helvetica'
  };
  const selectedFont = fontMap[fontFamily] || 'Arial';

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${resumeFileName}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: '${selectedFont}', sans-serif;
          font-size: ${fontSize};
          line-height: ${lineSpacing};
          color: #333;
          max-width: 8.5in;
          margin: 0 auto;
          padding: 1in;
          background: white;
        }
        .header {
          border-bottom: 2px solid #ddd;
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }
        .name {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }
        .title {
          font-size: 1.2em;
          margin-bottom: 0.5rem;
        }
        .contact {
          display: flex;
          gap: 1rem;
          font-size: 0.9em;
          margin-top: 0.5rem;
        }
        .section {
          margin-bottom: 1.5rem;
        }
        .section-title {
          font-size: 1.2em;
          font-weight: bold;
          text-transform: uppercase;
          border-bottom: 1px solid #ddd;
          padding-bottom: 0.5rem;
          margin-bottom: 1rem;
        }
        .experience-item, .project-item, .education-item, .cert-item {
          margin-bottom: 1rem;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
        }
        .item-date {
          color: #666;
          font-weight: normal;
        }
        .bullets {
          margin-left: 1.5rem;
          margin-top: 0.5rem;
        }
        .skills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .skill-tag {
          background: #f0f0f0;
          padding: 0.3rem 0.8rem;
          border-radius: 4px;
        }
        @media print {
          body { padding: 0; }
        }
      </style>
    </head>
    <body>
  `;

  // Header
  html += `
    <div class="header">
      <div class="name">${resumeData.name || 'Your Name'}</div>
      <div class="title">${resumeData.title || 'Your Title'}</div>
      <div class="contact">
        <span>${resumeData.email || ''}</span>
        <span>${resumeData.phone || ''}</span>
        <span>${resumeData.location || ''}</span>
      </div>
    </div>
  `;

  // Render visible sections
  sectionOrder.forEach(sectionId => {
    if (!sectionVisibility[sectionId]) return;

    switch(sectionId) {
      case 'summary':
        if (resumeData.summary) {
          html += `
            <div class="section">
              <div class="section-title">Professional Summary</div>
              <p>${resumeData.summary}</p>
            </div>
          `;
        }
        break;

      case 'skills':
        if (resumeData.skills && resumeData.skills.length > 0) {
          html += `
            <div class="section">
              <div class="section-title">Skills</div>
              <div class="skills">
                ${resumeData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
              </div>
            </div>
          `;
        }
        break;

      case 'experience':
        if (resumeData.experience && resumeData.experience.length > 0) {
          html += `
            <div class="section">
              <div class="section-title">Experience</div>
              ${resumeData.experience.map(exp => `
                <div class="experience-item">
                  <div class="item-header">
                    <span>${exp.position}</span>
                    <span class="item-date">${exp.period}</span>
                  </div>
                  <div>${exp.company} ${exp.location ? `• ${exp.location}` : ''}</div>
                  ${exp.bullets && exp.bullets.length > 0 ? `
                    <div class="bullets">
                      ${exp.bullets.map(bullet => `• ${bullet}<br>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;
        }
        break;

      case 'education':
        if (resumeData.education && resumeData.education.length > 0) {
          html += `
            <div class="section">
              <div class="section-title">Education</div>
              ${resumeData.education.map(edu => `
                <div class="education-item">
                  <div class="item-header">
                    <span>${edu.degree}</span>
                    <span class="item-date">${edu.startDate} - ${edu.endDate}</span>
                  </div>
                  <div>${edu.school}</div>
                </div>
              `).join('')}
            </div>
          `;
        }
        break;

      case 'projects':
        if (resumeData.projects && resumeData.projects.length > 0) {
          html += `
            <div class="section">
              <div class="section-title">Projects</div>
              ${resumeData.projects.map(project => `
                <div class="project-item">
                  <div class="item-header">
                    <span>${project.name}</span>
                    ${project.link ? `<a href="${project.link}">View Project</a>` : ''}
                  </div>
                  <div>${project.description}</div>
                  ${project.bullets && project.bullets.length > 0 ? `
                    <div class="bullets">
                      ${project.bullets.map(bullet => `• ${bullet}<br>`).join('')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;
        }
        break;

      case 'certifications':
        if (resumeData.certifications && resumeData.certifications.length > 0) {
          html += `
            <div class="section">
              <div class="section-title">Certifications</div>
              ${resumeData.certifications.map(cert => `
                <div class="cert-item">
                  <div class="item-header">
                    <span>${cert.name}</span>
                    ${cert.link ? `<a href="${cert.link}">Verify</a>` : ''}
                  </div>
                  <div>${cert.issuer}</div>
                </div>
              `).join('')}
            </div>
          `;
        }
        break;

      default:
        // Handle custom sections
        const customSection = options.customSections.find(s => s.id === sectionId);
        if (customSection) {
          html += `
            <div class="section">
              <div class="section-title">${customSection.name}</div>
              <div>${customSection.content || ''}</div>
            </div>
          `;
        }
        break;
    }
  });

  // Close HTML
  html += `
      </body>
    </html>
  `;

  return html;
}

