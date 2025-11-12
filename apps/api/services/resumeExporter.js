/**
 * Resume Exporter Service
 * Exports resume data to PDF, DOCX, and plain text formats
 */

const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const fs = require('fs');
const path = require('path');
const { prisma } = require('../utils/db');
const logger = require('../utils/logger');

/**
 * Export resume to PDF format
 * @param {Object} resumeData - Resume data object
 * @param {string} outputPath - File path to save PDF
 * @returns {Promise<string>} - Path to generated PDF
 */
async function exportToPDF(resumeData, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // Helper function to add section
      const addSection = (title) => {
        doc.moveDown(0.5);
        doc.fontSize(14).font('Helvetica-Bold').text(title);
        doc.moveDown(0.3);
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica');
      };

      // Header - Name
      if (resumeData.personalInfo?.name) {
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text(resumeData.personalInfo.name, { align: 'center' });
        doc.moveDown(0.5);
      }

      // Contact Information
      if (resumeData.personalInfo) {
        const contact = [];
        if (resumeData.personalInfo.email) contact.push(resumeData.personalInfo.email);
        if (resumeData.personalInfo.phone) contact.push(resumeData.personalInfo.phone);
        if (resumeData.personalInfo.location) contact.push(resumeData.personalInfo.location);

        if (contact.length > 0) {
          doc.fontSize(10)
             .font('Helvetica')
             .text(contact.join(' | '), { align: 'center' });
        }

        // Links
        const links = [];
        if (resumeData.personalInfo.linkedin) links.push(resumeData.personalInfo.linkedin);
        if (resumeData.personalInfo.github) links.push(resumeData.personalInfo.github);
        if (resumeData.personalInfo.portfolio) links.push(resumeData.personalInfo.portfolio);

        if (links.length > 0) {
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor('blue')
             .text(links.join(' | '), { align: 'center' });
          doc.fillColor('black');
        }
      }

      // Professional Summary
      if (resumeData.summary) {
        addSection('PROFESSIONAL SUMMARY');
        doc.text(resumeData.summary, { align: 'justify' });
      }

      // Work Experience
      if (resumeData.workExperience && resumeData.workExperience.length > 0) {
        addSection('WORK EXPERIENCE');

        resumeData.workExperience.forEach((job, index) => {
          if (index > 0) doc.moveDown(0.5);

          // Company and Position
          doc.font('Helvetica-Bold').fontSize(11);
          doc.text(job.position || 'Position');

          // Company, Location, Dates
          doc.font('Helvetica').fontSize(10);
          const details = [];
          if (job.company) details.push(job.company);
          if (job.location) details.push(job.location);
          if (job.startDate || job.endDate) {
            const dateRange = `${job.startDate || ''} - ${job.endDate || 'Present'}`;
            details.push(dateRange);
          }
          doc.text(details.join(' | '), { italic: true });

          // Responsibilities
          if (job.responsibilities && job.responsibilities.length > 0) {
            doc.moveDown(0.2);
            job.responsibilities.forEach(resp => {
              doc.text(`• ${resp}`, { indent: 10 });
            });
          }
        });
      }

      // Education
      if (resumeData.education && resumeData.education.length > 0) {
        addSection('EDUCATION');

        resumeData.education.forEach((edu, index) => {
          if (index > 0) doc.moveDown(0.5);

          doc.font('Helvetica-Bold').fontSize(11);
          doc.text(edu.degree || 'Degree');

          doc.font('Helvetica').fontSize(10);
          const details = [];
          if (edu.institution) details.push(edu.institution);
          if (edu.location) details.push(edu.location);
          if (edu.graduationDate) details.push(edu.graduationDate);
          doc.text(details.join(' | '), { italic: true });

          if (edu.gpa) {
            doc.text(`GPA: ${edu.gpa}`);
          }
        });
      }

      // Skills
      if (resumeData.skills && resumeData.skills.length > 0) {
        addSection('SKILLS');

        // Group skills by category if available
        const categorized = {};
        resumeData.skills.forEach(skill => {
          const category = skill.category || 'General';
          if (!categorized[category]) categorized[category] = [];
          categorized[category].push(skill.name || skill);
        });

        Object.entries(categorized).forEach(([category, skills]) => {
          if (Object.keys(categorized).length > 1) {
            doc.font('Helvetica-Bold').text(`${category}: `, { continued: true });
          }
          doc.font('Helvetica').text(skills.join(', '));
          doc.moveDown(0.3);
        });
      }

      // Projects
      if (resumeData.projects && resumeData.projects.length > 0) {
        addSection('PROJECTS');

        resumeData.projects.forEach((project, index) => {
          if (index > 0) doc.moveDown(0.5);

          doc.font('Helvetica-Bold').fontSize(11);
          doc.text(project.name || 'Project Name');

          if (project.description) {
            doc.font('Helvetica').fontSize(10);
            doc.text(project.description);
          }

          if (project.technologies && project.technologies.length > 0) {
            doc.text(`Technologies: ${project.technologies.join(', ')}`, { italic: true });
          }
        });
      }

      // Certifications
      if (resumeData.certifications && resumeData.certifications.length > 0) {
        addSection('CERTIFICATIONS');

        resumeData.certifications.forEach(cert => {
          doc.text(`• ${cert.name || cert}${cert.issuer ? ` - ${cert.issuer}` : ''}${cert.date ? ` (${cert.date})` : ''}`);
        });
      }

      doc.end();

      writeStream.on('finish', () => {
        logger.info('PDF export completed', { outputPath });
        resolve(outputPath);
      });

      writeStream.on('error', (error) => {
        logger.error('PDF export failed', { error: error.message });
        reject(error);
      });

    } catch (error) {
      logger.error('PDF generation error', { error: error.message });
      reject(error);
    }
  });
}

/**
 * Export resume to DOCX format
 * @param {Object} resumeData - Resume data object
 * @param {string} outputPath - File path to save DOCX
 * @returns {Promise<string>} - Path to generated DOCX
 */
async function exportToDOCX(resumeData, outputPath) {
  try {
    const sections = [];

    // Helper to create heading
    const createHeading = (text, level = HeadingLevel.HEADING_1) => {
      return new Paragraph({
        text,
        heading: level,
        spacing: { before: 200, after: 100 }
      });
    };

    // Helper to create bullet point
    const createBullet = (text) => {
      return new Paragraph({
        text,
        bullet: { level: 0 }
      });
    };

    // Header - Name
    if (resumeData.personalInfo?.name) {
      sections.push(new Paragraph({
        children: [
          new TextRun({
            text: resumeData.personalInfo.name,
            bold: true,
            size: 32
          })
        ],
        alignment: 'center',
        spacing: { after: 100 }
      }));
    }

    // Contact Info
    if (resumeData.personalInfo) {
      const contact = [];
      if (resumeData.personalInfo.email) contact.push(resumeData.personalInfo.email);
      if (resumeData.personalInfo.phone) contact.push(resumeData.personalInfo.phone);
      if (resumeData.personalInfo.location) contact.push(resumeData.personalInfo.location);

      if (contact.length > 0) {
        sections.push(new Paragraph({
          text: contact.join(' | '),
          alignment: 'center',
          spacing: { after: 200 }
        }));
      }
    }

    // Professional Summary
    if (resumeData.summary) {
      sections.push(createHeading('PROFESSIONAL SUMMARY'));
      sections.push(new Paragraph({
        text: resumeData.summary,
        spacing: { after: 200 }
      }));
    }

    // Work Experience
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
      sections.push(createHeading('WORK EXPERIENCE'));

      resumeData.workExperience.forEach(job => {
        sections.push(new Paragraph({
          children: [
            new TextRun({ text: job.position || 'Position', bold: true, size: 22 })
          ],
          spacing: { before: 100 }
        }));

        const details = [];
        if (job.company) details.push(job.company);
        if (job.location) details.push(job.location);
        if (job.startDate || job.endDate) {
          details.push(`${job.startDate || ''} - ${job.endDate || 'Present'}`);
        }

        sections.push(new Paragraph({
          children: [
            new TextRun({ text: details.join(' | '), italics: true })
          ]
        }));

        if (job.responsibilities && job.responsibilities.length > 0) {
          job.responsibilities.forEach(resp => {
            sections.push(createBullet(resp));
          });
        }
      });
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      sections.push(createHeading('EDUCATION'));

      resumeData.education.forEach(edu => {
        sections.push(new Paragraph({
          children: [
            new TextRun({ text: edu.degree || 'Degree', bold: true, size: 22 })
          ],
          spacing: { before: 100 }
        }));

        const details = [];
        if (edu.institution) details.push(edu.institution);
        if (edu.location) details.push(edu.location);
        if (edu.graduationDate) details.push(edu.graduationDate);

        sections.push(new Paragraph({
          children: [
            new TextRun({ text: details.join(' | '), italics: true })
          ]
        }));

        if (edu.gpa) {
          sections.push(new Paragraph({ text: `GPA: ${edu.gpa}` }));
        }
      });
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      sections.push(createHeading('SKILLS'));

      const skillsList = resumeData.skills.map(s => s.name || s).join(', ');
      sections.push(new Paragraph({ text: skillsList }));
    }

    // Projects
    if (resumeData.projects && resumeData.projects.length > 0) {
      sections.push(createHeading('PROJECTS'));

      resumeData.projects.forEach(project => {
        sections.push(new Paragraph({
          children: [
            new TextRun({ text: project.name || 'Project', bold: true, size: 22 })
          ],
          spacing: { before: 100 }
        }));

        if (project.description) {
          sections.push(new Paragraph({ text: project.description }));
        }
      });
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: sections
      }]
    });

    // Generate and save
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);

    logger.info('DOCX export completed', { outputPath });
    return outputPath;

  } catch (error) {
    logger.error('DOCX generation error', { error: error.message });
    throw error;
  }
}

/**
 * Export resume to plain text format (ATS-friendly)
 * @param {Object} resumeData - Resume data object
 * @param {string} outputPath - File path to save text file
 * @returns {Promise<string>} - Path to generated text file
 */
async function exportToPlainText(resumeData, outputPath) {
  try {
    let text = '';

    // Name
    if (resumeData.personalInfo?.name) {
      text += `${resumeData.personalInfo.name}\n`;
      text += '='.repeat(resumeData.personalInfo.name.length) + '\n\n';
    }

    // Contact
    if (resumeData.personalInfo) {
      if (resumeData.personalInfo.email) text += `Email: ${resumeData.personalInfo.email}\n`;
      if (resumeData.personalInfo.phone) text += `Phone: ${resumeData.personalInfo.phone}\n`;
      if (resumeData.personalInfo.location) text += `Location: ${resumeData.personalInfo.location}\n`;
      if (resumeData.personalInfo.linkedin) text += `LinkedIn: ${resumeData.personalInfo.linkedin}\n`;
      text += '\n';
    }

    // Summary
    if (resumeData.summary) {
      text += 'PROFESSIONAL SUMMARY\n';
      text += '-'.repeat(20) + '\n';
      text += `${resumeData.summary}\n\n`;
    }

    // Work Experience
    if (resumeData.workExperience && resumeData.workExperience.length > 0) {
      text += 'WORK EXPERIENCE\n';
      text += '-'.repeat(20) + '\n';

      resumeData.workExperience.forEach(job => {
        text += `\n${job.position || 'Position'}\n`;
        text += `${job.company || ''} | ${job.location || ''} | ${job.startDate || ''} - ${job.endDate || 'Present'}\n`;

        if (job.responsibilities && job.responsibilities.length > 0) {
          job.responsibilities.forEach(resp => {
            text += `  • ${resp}\n`;
          });
        }
        text += '\n';
      });
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      text += 'EDUCATION\n';
      text += '-'.repeat(20) + '\n';

      resumeData.education.forEach(edu => {
        text += `\n${edu.degree || 'Degree'}\n`;
        text += `${edu.institution || ''} | ${edu.graduationDate || ''}\n`;
        if (edu.gpa) text += `GPA: ${edu.gpa}\n`;
        text += '\n';
      });
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      text += 'SKILLS\n';
      text += '-'.repeat(20) + '\n';
      text += resumeData.skills.map(s => s.name || s).join(', ') + '\n\n';
    }

    fs.writeFileSync(outputPath, text, 'utf8');
    logger.info('Plain text export completed', { outputPath });
    return outputPath;

  } catch (error) {
    logger.error('Plain text generation error', { error: error.message });
    throw error;
  }
}

/**
 * Export resume and save to storage
 * @param {string} taskId - AIAgentTask ID
 * @param {string} format - Export format ('pdf', 'docx', 'txt')
 * @returns {Promise<Object>} - StorageFile record
 */
async function exportAndSaveResume(taskId, format = 'pdf') {
  try {
    // Get task with result data
    const task = await prisma.aIAgentTask.findUnique({
      where: { id: taskId },
      include: { user: true }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    if (!task.resultData || !task.resultData.data) {
      throw new Error('No resume data available for this task');
    }

    const resumeData = task.resultData.data;
    const userId = task.userId;

    // Create temp file path
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `resume_${task.company || 'untitled'}_${timestamp}.${format}`;
    const tempPath = path.join(tempDir, filename);

    // Export based on format
    let filePath;
    switch (format.toLowerCase()) {
      case 'pdf':
        filePath = await exportToPDF(resumeData, tempPath);
        break;
      case 'docx':
        filePath = await exportToDOCX(resumeData, tempPath);
        break;
      case 'txt':
        filePath = await exportToPlainText(resumeData, tempPath);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    // Read file and create StorageFile record
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;

    // Determine MIME type
    const mimeTypes = {
      pdf: 'application/pdf',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      txt: 'text/plain'
    };

    const storageFile = await prisma.storageFile.create({
      data: {
        userId,
        name: filename,
        originalName: filename,
        mimeType: mimeTypes[format],
        size: fileSize,
        path: `/temp/${filename}`, // This would be S3/storage path in production
        folderId: null,
        metadata: {
          taskId,
          company: task.company,
          jobTitle: task.jobTitle,
          atsScore: task.atsScore,
          generatedAt: new Date().toISOString()
        }
      }
    });

    logger.info('Resume exported and saved', {
      taskId,
      format,
      fileId: storageFile.id,
      filename
    });

    // Clean up temp file after some time (optional)
    // setTimeout(() => fs.unlinkSync(filePath), 60000);

    return storageFile;

  } catch (error) {
    logger.error('Export and save failed', { error: error.message, taskId });
    throw error;
  }
}

module.exports = {
  exportToPDF,
  exportToDOCX,
  exportToPlainText,
  exportAndSaveResume
};
