/**
 * Thumbnail Generator
 * INFRA-007: Generate thumbnails for image files
 */

const sharp = require('sharp');
const logger = require('./logger');
const fs = require('fs').promises;
const path = require('path');

const THUMBNAIL_SIZE = 200; // 200x200 pixels
const THUMBNAIL_QUALITY = 80;

/**
 * Generate thumbnail for image file
 */
async function generateThumbnail(filePath, contentType, outputPath = null) {
  try {
    // Only generate thumbnails for images
    if (!contentType?.startsWith('image/')) {
      logger.debug(`Skipping thumbnail generation for non-image: ${contentType}`);
      return null;
    }

    // Read file buffer
    let fileBuffer;
    if (typeof filePath === 'string') {
      fileBuffer = await fs.readFile(filePath);
    } else {
      fileBuffer = filePath; // Assume it's already a buffer
    }

    // Generate thumbnail
    const thumbnailBuffer = await sharp(fileBuffer)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: THUMBNAIL_QUALITY })
      .toBuffer();

    // Save thumbnail
    if (!outputPath) {
      // Generate output path based on file path
      const dir = path.dirname(filePath);
      const ext = path.extname(filePath);
      const name = path.basename(filePath, ext);
      outputPath = path.join(dir, `${name}_thumb.jpg`);
    }

    await fs.writeFile(outputPath, thumbnailBuffer);
    logger.info(`Thumbnail generated: ${outputPath}`);
    
    return outputPath;
  } catch (error) {
    logger.error('Error generating thumbnail:', error);
    throw error;
  }
}

module.exports = {
  generateThumbnail
};

