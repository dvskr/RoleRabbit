/**
 * PDF Generator Utility
 * Generates professional PDF documents
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate PDF from resume data
 */
async function generateResumePDF(resumeData, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 50, bottom: 50, left: 50, right: 50 }
      });

      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', reject);

      // Parse resume data
      const resume = typeof resumeData === 'string' ? JSON.parse(resumeData) : resumeData;

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text(resume.name || 'Resume', { align: 'center' });
      doc.moveDown(0.5);

      // Contact info
      if (resume.contact) {
        doc.fontSize(10).font('Helvetica');
        const contactInfo = [
          resume.contact.email,
          resume.contact.phone,
          resume.contact.location,
          resume.contact.linkedIn
        ].filter(Boolean).join(' | ');
        doc.text(contactInfo, { align: 'center' });
        doc.moveDown(1);
      }

      // Summary
      if (resume.summary) {
        doc.fontSize(12).font('Helvetica-Bold').text('SUMMARY');
        doc.fontSize(10).font('Helvetica').text(resume.summary);
        doc.moveDown(1);
      }

      // Experience
      if (resume.experience && resume.experience.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('EXPERIENCE');
        resume.experience.forEach(exp => {
          doc.fontSize(10).font('Helvetica-Bold')
            .text(`${exp.title} - ${exp.company}`, { continued: true });
          doc.fontSize(9).font('Helvetica').text(` ${exp.startDate} - ${exp.endDate || 'Present'}`, { align: 'right' });
          
          if (exp.description) {
            doc.fontSize(9).font('Helvetica')
              .text(exp.description, { indent: 20 });
          }
          doc.moveDown(0.5);
        });
        doc.moveDown(1);
      }

      // Education
      if (resume.education && resume.education.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('EDUCATION');
        resume.education.forEach(edu => {
          doc.fontSize(10).font('Helvetica-Bold').text(`${edu.degree} - ${edu.school}`);
          doc.fontSize(9).font('Helvetica').text(`${edu.startDate} - ${edu.endDate || 'Present'}`);
          doc.moveDown(0.5);
        });
      }

      // Skills
      if (resume.skills && resume.skills.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').text('SKILLS');
        doc.fontSize(10).font('Helvetica').text(resume.skills.join(', '));
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Save PDF to file
 */
async function savePDFToFile(pdfBuffer, filePath) {
  return fs.promises.writeFile(filePath, pdfBuffer);
}

/**
 * Generate PDF from HTML
 */
async function generatePDFFromHTML(htmlContent) {
  // This would use a library like puppeteer or html-pdf
  // For now, return placeholder
  throw new Error('HTML to PDF not yet implemented');
}

module.exports = {
  generateResumePDF,
  savePDFToFile,
  generatePDFFromHTML
};

