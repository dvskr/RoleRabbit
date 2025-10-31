const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

/**
 * Generate PDF from resume data
 */
async function generatePDF(resumeData) {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Collect PDF data in chunks
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      if (resumeData.personalInfo) {
        doc.fontSize(24).font('Helvetica-Bold')
           .text(resumeData.personalInfo.name || 'Your Name', {
             align: 'center'
           });
        
        doc.moveDown(0.5);
        
        if (resumeData.personalInfo.email) {
          doc.fontSize(10).font('Helvetica')
             .text(`Email: ${resumeData.personalInfo.email}`, {
               align: 'center'
             });
        }
        
        if (resumeData.personalInfo.phone) {
          doc.fontSize(10).font('Helvetica')
             .text(`Phone: ${resumeData.personalInfo.phone}`, {
               align: 'center'
             });
        }
        
        if (resumeData.personalInfo.location) {
          doc.fontSize(10).font('Helvetica')
             .text(`Location: ${resumeData.personalInfo.location}`, {
               align: 'center'
             });
        }
        
        if (resumeData.personalInfo.linkedIn || resumeData.personalInfo.github) {
          const links = [];
          if (resumeData.personalInfo.linkedIn) links.push(`LinkedIn: ${resumeData.personalInfo.linkedIn}`);
          if (resumeData.personalInfo.github) links.push(`GitHub: ${resumeData.personalInfo.github}`);
          doc.fontSize(10).font('Helvetica')
             .text(links.join(' | '), {
               align: 'center'
             });
        }
        
        doc.moveDown(1);
      }

      // Professional Summary
      if (resumeData.summary && resumeData.summary.trim()) {
        doc.fontSize(14).font('Helvetica-Bold')
           .text('PROFESSIONAL SUMMARY', {
             underline: true
           });
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica')
           .text(resumeData.summary, {
             align: 'justify'
           });
        doc.moveDown(0.8);
      }

      // Professional Experience
      if (resumeData.experience && resumeData.experience.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold')
           .text('PROFESSIONAL EXPERIENCE', {
             underline: true
           });
        doc.moveDown(0.3);

        resumeData.experience.forEach((exp, index) => {
          doc.fontSize(11).font('Helvetica-Bold')
             .text(`${exp.title || 'Job Title'} - ${exp.company || 'Company'}`, {
               continued: false
             });
          
          if (exp.dateStart || exp.dateEnd) {
            doc.fontSize(9).font('Helvetica-Italic')
               .text(`${exp.dateStart || ''} - ${exp.dateEnd || 'Present'}`, {
                 align: 'right'
               });
          }
          
          if (exp.location) {
            doc.fontSize(9).font('Helvetica-Italic')
               .text(`Location: ${exp.location}`);
          }
          
          doc.moveDown(0.2);
          
          if (exp.description) {
            doc.fontSize(9).font('Helvetica')
               .text(exp.description, {
                 indent: 10,
                 align: 'justify'
               });
          }
          
          if (exp.bulletPoints && exp.bulletPoints.length > 0) {
            exp.bulletPoints.forEach(bullet => {
              doc.fontSize(9).font('Helvetica')
                 .text(`• ${bullet}`, {
                   indent: 15
                 });
            });
          }
          
          if (index < resumeData.experience.length - 1) {
            doc.moveDown(0.5);
          }
        });
        
        doc.moveDown(0.8);
      }

      // Education
      if (resumeData.education && resumeData.education.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold')
           .text('EDUCATION', {
             underline: true
           });
        doc.moveDown(0.3);

        resumeData.education.forEach(edu => {
          doc.fontSize(11).font('Helvetica-Bold')
             .text(`${edu.degree || 'Degree'} in ${edu.field || 'Field of Study'}`, {
               continued: false
             });
          
          doc.fontSize(9).font('Helvetica-Italic')
             .text(`${edu.school || 'School'} - ${edu.dateGraduated || edu.dateEnd || ''}`, {
               align: 'right'
             });
          
          if (edu.gpa) {
            doc.fontSize(9).font('Helvetica')
               .text(`GPA: ${edu.gpa}`);
          }
          
          doc.moveDown(0.3);
        });
        
        doc.moveDown(0.8);
      }

      // Skills
      if (resumeData.skills && resumeData.skills.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold')
           .text('SKILLS', {
             underline: true
           });
        doc.moveDown(0.3);

        const skillsPerLine = 3;
        for (let i = 0; i < resumeData.skills.length; i += skillsPerLine) {
          const skillChunk = resumeData.skills.slice(i, i + skillsPerLine);
          const skillText = skillChunk.map(skill => 
            typeof skill === 'string' ? skill : skill.name
          ).join(' • ');
          
          doc.fontSize(9).font('Helvetica')
             .text(skillText);
        }
        
        doc.moveDown(0.8);
      }

      // Certifications
      if (resumeData.certifications && resumeData.certifications.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold')
           .text('CERTIFICATIONS', {
             underline: true
           });
        doc.moveDown(0.3);

        resumeData.certifications.forEach(cert => {
          doc.fontSize(11).font('Helvetica-Bold')
             .text(cert.name || cert.title || 'Certification', {
               continued: false
             });
          
          if (cert.issuer) {
            doc.fontSize(9).font('Helvetica-Italic')
               .text(cert.issuer, {
                 align: 'right'
               });
          }
          
          if (cert.date) {
            doc.fontSize(9).font('Helvetica')
               .text(`Issued: ${cert.date}`);
          }
          
          doc.moveDown(0.3);
        });
      }

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate Word document from resume data
 */
async function generateWord(resumeData) {
  try {
    const sections = [];

    // Title
    if (resumeData.personalInfo && resumeData.personalInfo.name) {
      sections.push(
        new Paragraph({
          text: resumeData.personalInfo.name,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Contact Information
    const contactInfo = [];
    if (resumeData.personalInfo?.email) {
      contactInfo.push(`Email: ${resumeData.personalInfo.email}`);
    }
    if (resumeData.personalInfo?.phone) {
      contactInfo.push(`Phone: ${resumeData.personalInfo.phone}`);
    }
    if (resumeData.personalInfo?.location) {
      contactInfo.push(`Location: ${resumeData.personalInfo.location}`);
    }
    
    if (contactInfo.length > 0) {
      sections.push(
        new Paragraph({
          text: contactInfo.join(' | '),
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }

    // Professional Summary
    if (resumeData.summary && resumeData.summary.trim()) {
      sections.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 100 },
        })
      );
      sections.push(
        new Paragraph({
          text: resumeData.summary,
          spacing: { after: 200 },
        })
      );
    }

    // Professional Experience
    if (resumeData.experience && resumeData.experience.length > 0) {
      sections.push(
        new Paragraph({
          text: 'PROFESSIONAL EXPERIENCE',
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 100 },
        })
      );

      resumeData.experience.forEach(exp => {
        const jobTitle = new TextRun({
          text: `${exp.title || 'Job Title'} - ${exp.company || 'Company'}`,
          bold: true,
          size: 22,
        });
        
        sections.push(
          new Paragraph({
            children: [jobTitle],
            spacing: { after: 50 },
          })
        );

        if (exp.dateStart || exp.dateEnd || exp.location) {
          const details = [];
          if (exp.dateStart || exp.dateEnd) {
            details.push(`${exp.dateStart || ''} - ${exp.dateEnd || 'Present'}`);
          }
          if (exp.location) {
            details.push(exp.location);
          }

          sections.push(
            new Paragraph({
              text: details.join(' | '),
              italics: true,
              spacing: { after: 50 },
            })
          );
        }

        if (exp.description) {
          sections.push(
            new Paragraph({
              text: exp.description,
              spacing: { after: 50 },
            })
          );
        }

        if (exp.bulletPoints && exp.bulletPoints.length > 0) {
          exp.bulletPoints.forEach(bullet => {
            sections.push(
              new Paragraph({
                text: `• ${bullet}`,
                indent: { left: 283 },
                spacing: { after: 50 },
              })
            );
          });
        }
      });
    }

    // Education
    if (resumeData.education && resumeData.education.length > 0) {
      sections.push(
        new Paragraph({
          text: 'EDUCATION',
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 100 },
        })
      );

      resumeData.education.forEach(edu => {
        sections.push(
          new Paragraph({
            text: `${edu.degree || 'Degree'} in ${edu.field || 'Field of Study'}`,
            bold: true,
            spacing: { after: 25 },
          })
        );

        const eduDetails = [];
        if (edu.school) eduDetails.push(edu.school);
        if (edu.dateGraduated || edu.dateEnd) {
          eduDetails.push(edu.dateGraduated || edu.dateEnd);
        }
        if (edu.gpa) eduDetails.push(`GPA: ${edu.gpa}`);

        if (eduDetails.length > 0) {
          sections.push(
            new Paragraph({
              text: eduDetails.join(' | '),
              spacing: { after: 50 },
            })
          );
        }
      });
    }

    // Skills
    if (resumeData.skills && resumeData.skills.length > 0) {
      sections.push(
        new Paragraph({
          text: 'SKILLS',
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 100 },
        })
      );

      const skillsText = resumeData.skills
        .map(skill => typeof skill === 'string' ? skill : skill.name)
        .join(' • ');

      sections.push(
        new Paragraph({
          text: skillsText,
          spacing: { after: 200 },
        })
      );
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: sections,
      }],
    });

    // Generate document as buffer
    const buffer = await Packer.toBuffer(doc);
    return buffer;

  } catch (error) {
    throw new Error(`Failed to generate Word document: ${error.message}`);
  }
}

/**
 * Export resume to the specified format
 */
async function exportResume(resumeData, format = 'pdf') {
  try {
    switch (format.toLowerCase()) {
      case 'pdf':
        return await generatePDF(resumeData);
      
      case 'docx':
      case 'word':
        return await generateWord(resumeData);
      
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  } catch (error) {
    logger.error('Export error:', error);
    throw error;
  }
}

module.exports = {
  exportResume,
  generatePDF,
  generateWord,
};

