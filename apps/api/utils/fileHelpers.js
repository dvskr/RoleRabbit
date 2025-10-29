/**
 * File Helper Utilities
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Read file safely
 */
async function readFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

/**
 * Write file safely
 */
async function writeFile(filePath, data) {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete file safely
 */
async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file stats
 */
async function getFileStats(filePath) {
  try {
    return await fs.stat(filePath);
  } catch {
    return null;
  }
}

module.exports = {
  readFile,
  writeFile,
  fileExists,
  deleteFile,
  getFileStats
};
