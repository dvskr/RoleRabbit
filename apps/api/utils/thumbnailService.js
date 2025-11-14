/**
 * Thumbnail Generation Service
 * Creates thumbnails for images using Sharp library
 */

const sharp = require('sharp');
const storageHandler = require('./storageHandler');
const logger = require('./logger');
const { prisma } = require('./db');

const THUMBNAIL_SIZES = {
  small: { width: 150, height: 150 },
  medium: { width: 300, height: 300 },
  large: { width: 600, height: 600 }
};

/**
 * Generate thumbnail for an image file
 * @param {string} fileId - File ID
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} size - Thumbnail size (small, medium, large)
 */
async function generateThumbnail(fileId, imageBuffer, size = 'medium') {
  try {
    const dimensions = THUMBNAIL_SIZES[size] || THUMBNAIL_SIZES.medium;

    // Generate thumbnail
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(dimensions.width, dimensions.height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Upload thumbnail to storage
    const file = await prisma.storageFile.findUnique({
      where: { id: fileId }
    });

    if (!file) {
      throw new Error('File not found');
    }

    const thumbnailPath = `${file.storagePath}.thumb.${size}.jpg`;
    const { Readable } = require('stream');
    const stream = Readable.from(thumbnailBuffer);

    await storageHandler.upload(
      stream,
      file.userId,
      `thumb_${size}_${file.fileName}`,
      'image/jpeg'
    );

    logger.info(`✅ Generated ${size} thumbnail for file ${fileId}`);

    return {
      size,
      path: thumbnailPath,
      width: dimensions.width,
      height: dimensions.height,
      sizeBytes: thumbnailBuffer.length
    };
  } catch (error) {
    logger.error('Failed to generate thumbnail:', error);
    throw error;
  }
}

/**
 * Generate all thumbnail sizes for an image
 */
async function generateAllThumbnails(fileId, imageBuffer) {
  const thumbnails = {};

  for (const size of ['small', 'medium', 'large']) {
    try {
      thumbnails[size] = await generateThumbnail(fileId, imageBuffer, size);
    } catch (error) {
      logger.error(`Failed to generate ${size} thumbnail:`, error);
    }
  }

  // Store thumbnail paths in file metadata
  await prisma.storageFile.update({
    where: { id: fileId },
    data: {
      // Store thumbnail info in description or add thumbnails field
      description: JSON.stringify({ thumbnails })
    }
  });

  return thumbnails;
}

/**
 * Check if file is an image
 */
function isImage(contentType) {
  return contentType && contentType.startsWith('image/');
}

/**
 * Get thumbnail URL for file
 */
async function getThumbnailUrl(fileId, size = 'medium') {
  try {
    const file = await prisma.storageFile.findUnique({
      where: { id: fileId }
    });

    if (!file) return null;

    // Parse thumbnails from description (temporary solution)
    let thumbnails = {};
    try {
      const metadata = JSON.parse(file.description || '{}');
      thumbnails = metadata.thumbnails || {};
    } catch (e) {
      // Description is not JSON
    }

    if (thumbnails[size]) {
      return await storageHandler.getDownloadUrl(thumbnails[size].path);
    }

    return null;
  } catch (error) {
    logger.error('Failed to get thumbnail URL:', error);
    return null;
  }
}

module.exports = {
  generateThumbnail,
  generateAllThumbnails,
  isImage,
  getThumbnailUrl
};
