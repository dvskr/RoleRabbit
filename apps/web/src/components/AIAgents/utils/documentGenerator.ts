/**
 * Document Generation Utility
 * Generates PDF and DOCX documents from resume/cover letter data
 */

interface ResumeData {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience?: Array<{
    role: string;
    company: string;
    startDate: string;
    endDate?: string;
    isCurrent?: boolean;
    description?: string;
    achievements?: string[];
  }>;
  skills?: string[];
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
    field?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

/**
 * Generate PDF from resume data
 * Uses jsPDF library for client-side PDF generation
 */
export async function generatePDF(data: ResumeData, filename: string = 'resume.pdf'): Promise<void> {
  // Check if jsPDF is available
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available in browser environment');
  }

  try {
    // Dynamic import jsPDF
    const { jsPDF } = await import('jspdf');

    const doc = new jsPDF();
    let yPosition = 20;
    const lineHeight = 7;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Helper to add text with wrapping
    const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
      doc.setFontSize(fontSize);
      if (isBold) {
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setFont('helvetica', 'normal');
      }

      const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
      doc.text(lines, margin, yPosition);
      yPosition += lines.length * lineHeight;
    };

    const addSpacing = (space: number = 5) => {
      yPosition += space;
    };

    // Header
    if (data.name) {
      addText(data.name, 18, true);
    }
    if (data.title) {
      addText(data.title, 12);
    }

    // Contact Info
    if (data.email || data.phone || data.location) {
      const contactInfo = [data.email, data.phone, data.location].filter(Boolean).join(' | ');
      addText(contactInfo, 10);
    }

    addSpacing(10);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    addSpacing(10);

    // Summary
    if (data.summary) {
      addText('PROFESSIONAL SUMMARY', 12, true);
      addSpacing(3);
      addText(data.summary, 10);
      addSpacing(8);
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
      addText('EXPERIENCE', 12, true);
      addSpacing(3);

      data.experience.forEach((exp) => {
        addText(exp.role, 11, true);
        const dateRange = `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate || ''}`;
        addText(`${exp.company} | ${dateRange}`, 10);

        if (exp.description) {
          addText(exp.description, 10);
        }

        if (exp.achievements && exp.achievements.length > 0) {
          exp.achievements.forEach((achievement) => {
            addText(`• ${achievement}`, 10);
          });
        }

        addSpacing(5);
      });
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
      addText('SKILLS', 12, true);
      addSpacing(3);
      addText(data.skills.join(' • '), 10);
      addSpacing(8);
    }

    // Education
    if (data.education && data.education.length > 0) {
      addText('EDUCATION', 12, true);
      addSpacing(3);

      data.education.forEach((edu) => {
        addText(edu.degree, 11, true);
        addText(`${edu.institution} | ${edu.year}`, 10);
        if (edu.field) {
          addText(edu.field, 10);
        }
        addSpacing(5);
      });
    }

    // Certifications
    if (data.certifications && data.certifications.length > 0) {
      addText('CERTIFICATIONS', 12, true);
      addSpacing(3);

      data.certifications.forEach((cert) => {
        addText(cert.name, 11, true);
        addText(`${cert.issuer} | ${cert.date}`, 10);
        addSpacing(3);
      });
    }

    // Save the PDF
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Make sure jspdf is installed.');
  }
}

/**
 * Generate DOCX from resume data
 * Uses docx library for client-side DOCX generation
 */
export async function generateDOCX(data: ResumeData, filename: string = 'resume.docx'): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('DOCX generation is only available in browser environment');
  }

  try {
    // Dynamic import docx and file-saver
    const { Document, Paragraph, TextRun, AlignmentType, HeadingLevel, Packer } = await import('docx');
    const { saveAs } = await import('file-saver');

    const children: any[] = [];

    // Header
    if (data.name) {
      children.push(
        new Paragraph({
          text: data.name,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        })
      );
    }

    if (data.title) {
      children.push(
        new Paragraph({
          text: data.title,
          alignment: AlignmentType.CENTER,
        })
      );
    }

    // Contact Info
    if (data.email || data.phone || data.location) {
      const contactInfo = [data.email, data.phone, data.location].filter(Boolean).join(' | ');
      children.push(
        new Paragraph({
          text: contactInfo,
          alignment: AlignmentType.CENTER,
        })
      );
    }

    children.push(new Paragraph({ text: '' })); // Spacing

    // Summary
    if (data.summary) {
      children.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: HeadingLevel.HEADING_2,
        })
      );
      children.push(
        new Paragraph({
          text: data.summary,
        })
      );
      children.push(new Paragraph({ text: '' }));
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
      children.push(
        new Paragraph({
          text: 'EXPERIENCE',
          heading: HeadingLevel.HEADING_2,
        })
      );

      data.experience.forEach((exp) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: exp.role,
                bold: true,
              }),
            ],
          })
        );

        const dateRange = `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate || ''}`;
        children.push(
          new Paragraph({
            text: `${exp.company} | ${dateRange}`,
          })
        );

        if (exp.description) {
          children.push(
            new Paragraph({
              text: exp.description,
            })
          );
        }

        if (exp.achievements && exp.achievements.length > 0) {
          exp.achievements.forEach((achievement) => {
            children.push(
              new Paragraph({
                text: achievement,
                bullet: {
                  level: 0,
                },
              })
            );
          });
        }

        children.push(new Paragraph({ text: '' }));
      });
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
      children.push(
        new Paragraph({
          text: 'SKILLS',
          heading: HeadingLevel.HEADING_2,
        })
      );
      children.push(
        new Paragraph({
          text: data.skills.join(' • '),
        })
      );
      children.push(new Paragraph({ text: '' }));
    }

    // Education
    if (data.education && data.education.length > 0) {
      children.push(
        new Paragraph({
          text: 'EDUCATION',
          heading: HeadingLevel.HEADING_2,
        })
      );

      data.education.forEach((edu) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: edu.degree,
                bold: true,
              }),
            ],
          })
        );
        children.push(
          new Paragraph({
            text: `${edu.institution} | ${edu.year}`,
          })
        );
        if (edu.field) {
          children.push(
            new Paragraph({
              text: edu.field,
            })
          );
        }
        children.push(new Paragraph({ text: '' }));
      });
    }

    // Certifications
    if (data.certifications && data.certifications.length > 0) {
      children.push(
        new Paragraph({
          text: 'CERTIFICATIONS',
          heading: HeadingLevel.HEADING_2,
        })
      );

      data.certifications.forEach((cert) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: cert.name,
                bold: true,
              }),
            ],
          })
        );
        children.push(
          new Paragraph({
            text: `${cert.issuer} | ${cert.date}`,
          })
        );
      });
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: children,
        },
      ],
    });

    // Generate and save
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error generating DOCX:', error);
    throw new Error('Failed to generate DOCX. Make sure docx and file-saver are installed.');
  }
}

/**
 * Generate cover letter PDF
 */
export async function generateCoverLetterPDF(
  content: string,
  filename: string = 'cover-letter.pdf'
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available in browser environment');
  }

  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(content, pageWidth - 2 * margin);
    doc.text(lines, margin, 20);

    doc.save(filename);
  } catch (error) {
    console.error('Error generating cover letter PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

/**
 * Generate cover letter DOCX
 */
export async function generateCoverLetterDOCX(
  content: string,
  filename: string = 'cover-letter.docx'
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('DOCX generation is only available in browser environment');
  }

  try {
    const { Document, Paragraph, Packer } = await import('docx');
    const { saveAs } = await import('file-saver');

    const paragraphs = content.split('\n\n').map(
      (para) => new Paragraph({ text: para })
    );

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: paragraphs,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
  } catch (error) {
    console.error('Error generating cover letter DOCX:', error);
    throw new Error('Failed to generate DOCX');
  }
}
