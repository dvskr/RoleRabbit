import { ResumeFile } from '../types/cloudStorage';

/**
 * Generates HTML content for file download
 * Creates a formatted HTML document with file information, description, tags, and comments
 */
export const generateFileHTML = (file: ResumeFile): string => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${file.name}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .header { border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #4CAF50; margin: 0; }
    .meta { color: #666; font-size: 0.9em; }
    .section { margin-bottom: 25px; }
    .section h2 { color: #2196F3; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .tag { background: #e3f2fd; color: #1976D2; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; }
    .description { line-height: 1.6; color: #555; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 0.85em; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${file.name}</h1>
    <div class="meta">
      <p><strong>Type:</strong> ${file.type} | <strong>Size:</strong> ${file.size} | <strong>Modified:</strong> ${file.lastModified}</p>
    </div>
  </div>
  
  <div class="section">
    <h2>Description</h2>
    <p class="description">${file.description || 'No description provided'}</p>
  </div>
  
  ${file.tags.length > 0 ? `
  <div class="section">
    <h2>Tags</h2>
    <div class="tags">
      ${file.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
    </div>
  </div>
  ` : ''}
  
  ${file.comments && file.comments.length > 0 ? `
  <div class="section">
    <h2>Comments (${file.comments.length})</h2>
    ${file.comments.map(comment => `
      <div style="margin-bottom: 15px; padding: 15px; background: #f9f9f9; border-left: 3px solid #4CAF50;">
        <strong>${comment.userName}</strong> - <em>${new Date(comment.timestamp).toLocaleDateString()}</em>
        <p style="margin-top: 5px;">${comment.content}</p>
      </div>
    `).join('')}
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Downloaded from RoleReady Cloud Storage</p>
    <p>Status: ${file.isPublic ? 'Public' : 'Private'} | Version: ${file.version}</p>
  </div>
</body>
</html>
  `.trim();
};

