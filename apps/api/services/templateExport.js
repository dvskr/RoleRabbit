/**
 * Template Export Service
 * Handles exporting templates to various formats
 *
 * Supported formats:
 * - PDF (high quality)
 * - DOCX (Microsoft Word)
 * - LaTeX
 * - JSON (template data)
 * - HTML
 */

const { PrismaClient } = require('@prisma/client');
const PDFDocument = require('pdfkit');
const { Document, Packer, Paragraph, TextRun } = require('docx');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

/**
 * Export template to specified format
 */
async function exportTemplate(templateId, userId, format, options = {}) {
  try {
    // Verify access
    const hasAccess = await verifyExportAccess(templateId, userId, format);
    if (!hasAccess.allowed) {
      throw new Error(hasAccess.reason);
    }

    const template = await prisma.resumeTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new Error('Template not found');
    }

    let exportResult;

    switch (format.toUpperCase()) {
      case 'PDF':
        exportResult = await exportToPDF(template, options);
        break;
      case 'DOCX':
        exportResult = await exportToDOCX(template, options);
        break;
      case 'LATEX':
        exportResult = await exportToLaTeX(template, options);
        break;
      case 'JSON':
        exportResult = await exportToJSON(template, options);
        break;
      case 'HTML':
        exportResult = await exportToHTML(template, options);
        break;
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }

    // Track export
    await trackExport(templateId, userId, format);

    // Increment download count
    await prisma.resumeTemplate.update({
      where: { id: templateId },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });

    return {
      success: true,
      format,
      ...exportResult,
    };
  } catch (error) {
    console.error('Error exporting template:', error);
    throw error;
  }
}

/**
 * Export to PDF
 */
async function exportToPDF(template, options = {}) {
  const { quality = 'high', includeMetadata = true } = options;

  try {
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50,
      },
    });

    const filename = `${sanitizeFilename(template.name)}.pdf`;
    const filepath = path.join('/tmp', filename);
    const stream = fs.createWriteStream(filepath);

    doc.pipe(stream);

    // Add metadata
    if (includeMetadata) {
      doc.info['Title'] = template.name;
      doc.info['Author'] = 'RoleRabbit';
      doc.info['Subject'] = `Resume Template - ${template.category}`;
      doc.info['Keywords'] = template.tags?.join(', ') || '';
    }

    // Title
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .text(template.name, { align: 'center' });

    doc.moveDown();

    // Category and Difficulty
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Category: ${template.category}`, { align: 'center' });

    doc.text(`Difficulty: ${template.difficulty}`, { align: 'center' });

    doc.moveDown(2);

    // Description
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .text('Description');

    doc.moveDown(0.5);

    doc.fontSize(11)
       .font('Helvetica')
       .text(template.description, { align: 'justify' });

    doc.moveDown();

    // Features
    if (template.features && template.features.length > 0) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Features');

      doc.moveDown(0.5);

      template.features.forEach((feature) => {
        doc.fontSize(11)
           .font('Helvetica')
           .text(`• ${feature}`, { indent: 20 });
      });

      doc.moveDown();
    }

    // Tags
    if (template.tags && template.tags.length > 0) {
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Tags');

      doc.moveDown(0.5);

      doc.fontSize(11)
         .font('Helvetica')
         .text(template.tags.join(', '));
    }

    // Footer
    doc.fontSize(8)
       .font('Helvetica')
       .text(
         `Downloaded from RoleRabbit - ${new Date().toLocaleDateString()}`,
         50,
         doc.page.height - 50,
         { align: 'center' }
       );

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        const buffer = fs.readFileSync(filepath);
        fs.unlinkSync(filepath); // Clean up

        resolve({
          filename,
          buffer,
          mimeType: 'application/pdf',
        });
      });

      stream.on('error', reject);
    });
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}

/**
 * Export to DOCX
 */
async function exportToDOCX(template, options = {}) {
  try {
    const sections = [];

    // Title
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: template.name,
            bold: true,
            size: 32,
          }),
        ],
        spacing: { after: 200 },
        alignment: 'center',
      })
    );

    // Category and Difficulty
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Category: ${template.category} | Difficulty: ${template.difficulty}`,
            size: 22,
          }),
        ],
        spacing: { after: 400 },
        alignment: 'center',
      })
    );

    // Description
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Description',
            bold: true,
            size: 28,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: template.description,
            size: 22,
          }),
        ],
        spacing: { after: 400 },
      })
    );

    // Features
    if (template.features && template.features.length > 0) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'Features',
              bold: true,
              size: 28,
            }),
          ],
          spacing: { after: 200 },
        })
      );

      template.features.forEach((feature) => {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `• ${feature}`,
                size: 22,
              }),
            ],
            spacing: { after: 100 },
            indent: { left: 720 },
          })
        );
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: sections,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${sanitizeFilename(template.name)}.docx`;

    return {
      filename,
      buffer,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };
  } catch (error) {
    console.error('Error exporting to DOCX:', error);
    throw error;
  }
}

/**
 * Export to LaTeX
 */
async function exportToLaTeX(template, options = {}) {
  try {
    let latex = `\\documentclass[11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{a4paper, margin=1in}

\\title{${escapeLatex(template.name)}}
\\author{RoleRabbit}
\\date{${new Date().toLocaleDateString()}}

\\begin{document}

\\maketitle

\\section*{Template Information}

\\textbf{Category:} ${escapeLatex(template.category)}

\\textbf{Difficulty:} ${escapeLatex(template.difficulty)}

\\section*{Description}

${escapeLatex(template.description)}

`;

    if (template.features && template.features.length > 0) {
      latex += `\\section*{Features}

\\begin{itemize}
`;
      template.features.forEach((feature) => {
        latex += `  \\item ${escapeLatex(feature)}\n`;
      });

      latex += `\\end{itemize}

`;
    }

    if (template.tags && template.tags.length > 0) {
      latex += `\\section*{Tags}

${template.tags.map(escapeLatex).join(', ')}

`;
    }

    latex += `\\end{document}`;

    const filename = `${sanitizeFilename(template.name)}.tex`;
    const buffer = Buffer.from(latex, 'utf8');

    return {
      filename,
      buffer,
      mimeType: 'application/x-tex',
    };
  } catch (error) {
    console.error('Error exporting to LaTeX:', error);
    throw error;
  }
}

/**
 * Export to JSON
 */
async function exportToJSON(template, options = {}) {
  try {
    const { includeMetadata = true } = options;

    const data = {
      name: template.name,
      description: template.description,
      category: template.category,
      difficulty: template.difficulty,
      layout: template.layout,
      colorScheme: template.colorScheme,
      features: template.features,
      tags: template.tags,
      industry: template.industry,
      isPremium: template.isPremium,
    };

    if (includeMetadata) {
      data.metadata = {
        rating: template.rating,
        downloads: template.downloads,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
        exportedAt: new Date(),
      };
    }

    const filename = `${sanitizeFilename(template.name)}.json`;
    const buffer = Buffer.from(JSON.stringify(data, null, 2), 'utf8');

    return {
      filename,
      buffer,
      mimeType: 'application/json',
    };
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw error;
  }
}

/**
 * Export to HTML
 */
async function exportToHTML(template, options = {}) {
  try {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(template.name)}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: #f4f4f4;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
            border-bottom: 3px solid #007bff;
            padding-bottom: 10px;
        }
        .meta {
            text-align: center;
            color: #666;
            margin: 20px 0;
        }
        .section {
            margin: 20px 0;
        }
        .section h2 {
            color: #007bff;
            border-bottom: 2px solid #eee;
            padding-bottom: 5px;
        }
        ul {
            list-style-type: none;
            padding-left: 20px;
        }
        ul li:before {
            content: "✓ ";
            color: #007bff;
            font-weight: bold;
        }
        .tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        .tag {
            background: #007bff;
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${escapeHtml(template.name)}</h1>

        <div class="meta">
            <strong>Category:</strong> ${escapeHtml(template.category)} |
            <strong>Difficulty:</strong> ${escapeHtml(template.difficulty)}
        </div>

        <div class="section">
            <h2>Description</h2>
            <p>${escapeHtml(template.description)}</p>
        </div>

        ${
          template.features && template.features.length > 0
            ? `
        <div class="section">
            <h2>Features</h2>
            <ul>
                ${template.features.map((f) => `<li>${escapeHtml(f)}</li>`).join('\n                ')}
            </ul>
        </div>
        `
            : ''
        }

        ${
          template.tags && template.tags.length > 0
            ? `
        <div class="section">
            <h2>Tags</h2>
            <div class="tags">
                ${template.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('\n                ')}
            </div>
        </div>
        `
            : ''
        }

        <div class="footer">
            Downloaded from RoleRabbit | ${new Date().toLocaleDateString()}
        </div>
    </div>
</body>
</html>`;

    const filename = `${sanitizeFilename(template.name)}.html`;
    const buffer = Buffer.from(html, 'utf8');

    return {
      filename,
      buffer,
      mimeType: 'text/html',
    };
  } catch (error) {
    console.error('Error exporting to HTML:', error);
    throw error;
  }
}

/**
 * Verify user has permission to export in specified format
 */
async function verifyExportAccess(templateId, userId, format) {
  try {
    const { getUserSubscription, hasFeatureAccess } = require('../middleware/premiumAccessControl');

    const subscription = await getUserSubscription(userId);

    // Check format-specific permissions
    const formatPermissions = {
      PDF: 'canExportPDF',
      DOCX: 'canExportDOCX',
      LATEX: 'canExportLaTeX',
      JSON: 'canExportPDF', // Basic export
      HTML: 'canExportPDF', // Basic export
    };

    const requiredPermission = formatPermissions[format.toUpperCase()];

    if (!requiredPermission || !hasFeatureAccess(subscription.tier, requiredPermission)) {
      return {
        allowed: false,
        reason: `${format} export requires ${subscription.tier === 'FREE' ? 'premium' : 'higher'} subscription`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error verifying export access:', error);
    return { allowed: false, reason: 'Error verifying access' };
  }
}

/**
 * Track template export
 */
async function trackExport(templateId, userId, format) {
  try {
    await prisma.templateDownload.create({
      data: {
        templateId,
        userId,
        format: format.toUpperCase(),
        downloadedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error tracking export:', error);
  }
}

/**
 * Get export history for user
 */
async function getExportHistory(userId, options = {}) {
  try {
    const { limit = 50, offset = 0 } = options;

    const [exports, total] = await Promise.all([
      prisma.templateDownload.findMany({
        where: { userId },
        include: {
          template: {
            select: {
              id: true,
              name: true,
              category: true,
              preview: true,
            },
          },
        },
        orderBy: { downloadedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.templateDownload.count({ where: { userId } }),
    ]);

    return {
      exports,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error fetching export history:', error);
    throw error;
  }
}

/**
 * Helper: Sanitize filename
 */
function sanitizeFilename(filename) {
  return filename
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
}

/**
 * Helper: Escape HTML
 */
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Helper: Escape LaTeX special characters
 */
function escapeLatex(text) {
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}]/g, '\\$&')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

module.exports = {
  exportTemplate,
  getExportHistory,
};
