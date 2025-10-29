/**
 * Data Export Utilities
 * Handles exporting user data to various formats
 */

const fs = require('fs').promises;

/**
 * Export user data to JSON
 */
async function exportUserDataJSON(userId, outputPath) {
  // Get all user data
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const resumes = await prisma.resume.findMany({ where: { userId } });
  const jobs = await prisma.job.findMany({ where: { userId } });
  const emails = await prisma.email.findMany({ where: { userId } });
  
  const exportData = {
    user,
    resumes,
    jobs,
    emails,
    exportedAt: new Date().toISOString()
  };

  await fs.writeFile(outputPath, JSON.stringify(exportData, null, 2));
  
  return outputPath;
}

/**
 * Export user data to CSV
 */
async function exportUserDataCSV(userId, outputPath) {
  const jobs = await prisma.job.findMany({ where: { userId } });
  
  const csvHeader = 'Title,Company,Status,Applied Date,Source\n';
  const csvRows = jobs.map(job => 
    `${job.title},${job.company},${job.status},${job.appliedDate},${job.source}`
  ).join('\n');
  
  const csv = csvHeader + csvRows;
  await fs.writeFile(outputPath, csv);
  
  return outputPath;
}

module.exports = {
  exportUserDataJSON,
  exportUserDataCSV
};

