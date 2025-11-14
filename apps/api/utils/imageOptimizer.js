/**
 * Image Optimization Utility
 * Converts images to WebP format and generates thumbnails for better performance
 */

const sharp = require('sharp');
const logger = require('./logger');
const path = require('path');
const fs = require('fs').promises;

// Image size configurations
const SIZES = {
  thumbnail: { width: 200, height: 200, fit: 'cover' },
  small: { width: 400, height: 400, fit: 'inside' },
  medium: { width: 800, height: 800, fit: 'inside' },
  large: { width: 1600, height: 1600, fit: 'inside' }
};

// WebP quality settings
const WEBP_QUALITY = {
  thumbnail: 75,
  small: 80,
  medium: 85,
  large: 90
};

/**
 * Check if file is an image
 * @param {string} mimeType - File MIME type
 * @returns {boolean}
 */
function isImage(mimeType) {
  return mimeType && (
    mimeType.startsWith('image/') &&
    !mimeType.includes('svg') // Skip SVG (not supported by sharp)
  );
}

/**
 * Get output filename for optimized image
 * @param {string} originalFilename - Original filename
 * @param {string} size - Size variant (thumbnail, small, medium, large)
 * @returns {string}
 */
function getOptimizedFilename(originalFilename, size = null) {
  const ext = path.extname(originalFilename);
  const basename = path.basename(originalFilename, ext);

  if (size) {
    return `${basename}_${size}.webp`;
  }

  return `${basename}.webp`;
}

/**
 * Optimize image and generate WebP thumbnails
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} options - Optimization options
 * @returns {Promise<Object>} - Optimized image data
 */
async function optimizeImage(imageBuffer, options = {}) {
  const {
    generateThumbnail = true,
    generateSizes = ['thumbnail', 'small', 'medium'],
    preserveOriginal = false,
    quality = 85
  } = options;

  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();

    logger.debug('Optimizing image:', {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      size: imageBuffer.length
    });

    const results = {};

    // Generate different sizes
    for (const sizeName of generateSizes) {
      const sizeConfig = SIZES[sizeName];

      if (!sizeConfig) {
        logger.warn(`Unknown size configuration: ${sizeName}`);
        continue;
      }

      try {
        const optimized = await sharp(imageBuffer)
          .resize(sizeConfig.width, sizeConfig.height, {
            fit: sizeConfig.fit,
            withoutEnlargement: true // Don't upscale images
          })
          .webp({ quality: WEBP_QUALITY[sizeName] || quality })
          .toBuffer();

        results[sizeName] = {
          buffer: optimized,
          size: optimized.length,
          width: sizeConfig.width,
          height: sizeConfig.height,
          format: 'webp'
        };

        logger.debug(`Generated ${sizeName} variant:`, {
          originalSize: imageBuffer.length,
          optimizedSize: optimized.length,
          reduction: ((1 - optimized.length / imageBuffer.length) * 100).toFixed(2) + '%'
        });
      } catch (sizeError) {
        logger.error(`Failed to generate ${sizeName} variant:`, sizeError.message);
      }
    }

    // Optionally keep original
    if (preserveOriginal) {
      results.original = {
        buffer: imageBuffer,
        size: imageBuffer.length,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      };
    }

    // Generate full-size WebP version
    if (!generateSizes.includes('large') && !preserveOriginal) {
      try {
        const fullWebp = await sharp(imageBuffer)
          .webp({ quality })
          .toBuffer();

        results.full = {
          buffer: fullWebp,
          size: fullWebp.length,
          width: metadata.width,
          height: metadata.height,
          format: 'webp'
        };
      } catch (fullError) {
        logger.error('Failed to generate full WebP version:', fullError.message);
      }
    }

    const totalOriginalSize = imageBuffer.length;
    const totalOptimizedSize = Object.values(results).reduce((sum, r) => sum + r.size, 0);
    const reduction = ((1 - totalOptimizedSize / totalOriginalSize) * 100).toFixed(2);

    logger.info('Image optimization complete:', {
      variants: Object.keys(results).length,
      originalSize: totalOriginalSize,
      optimizedSize: totalOptimizedSize,
      reduction: `${reduction}%`
    });

    return {
      success: true,
      variants: results,
      metadata: {
        originalWidth: metadata.width,
        originalHeight: metadata.height,
        originalFormat: metadata.format,
        originalSize: totalOriginalSize,
        optimizedSize: totalOptimizedSize,
        reduction: reduction
      }
    };
  } catch (error) {
    logger.error('Image optimization failed:', error);
    return {
      success: false,
      error: error.message,
      variants: {},
      metadata: {}
    };
  }
}

/**
 * Generate thumbnail only (faster for previews)
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {Object} options - Thumbnail options
 * @returns {Promise<Buffer>} - Thumbnail buffer
 */
async function generateThumbnail(imageBuffer, options = {}) {
  const {
    width = SIZES.thumbnail.width,
    height = SIZES.thumbnail.height,
    quality = WEBP_QUALITY.thumbnail
  } = options;

  try {
    const thumbnail = await sharp(imageBuffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality })
      .toBuffer();

    logger.debug('Generated thumbnail:', {
      width,
      height,
      size: thumbnail.length
    });

    return thumbnail;
  } catch (error) {
    logger.error('Thumbnail generation failed:', error);
    throw error;
  }
}

/**
 * Optimize image file and save variants
 * @param {string} inputPath - Input file path
 * @param {string} outputDir - Output directory
 * @param {Object} options - Optimization options
 * @returns {Promise<Object>} - Saved file paths
 */
async function optimizeImageFile(inputPath, outputDir, options = {}) {
  try {
    // Read image file
    const imageBuffer = await fs.readFile(inputPath);

    // Optimize image
    const result = await optimizeImage(imageBuffer, options);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Save variants
    const savedPaths = {};
    const basename = path.basename(inputPath, path.extname(inputPath));

    for (const [sizeName, variant] of Object.entries(result.variants)) {
      const filename = `${basename}_${sizeName}.webp`;
      const outputPath = path.join(outputDir, filename);

      await fs.writeFile(outputPath, variant.buffer);
      savedPaths[sizeName] = outputPath;

      logger.debug(`Saved ${sizeName} variant:`, outputPath);
    }

    return {
      success: true,
      paths: savedPaths,
      metadata: result.metadata
    };
  } catch (error) {
    logger.error('Image file optimization failed:', error);
    return {
      success: false,
      error: error.message,
      paths: {}
    };
  }
}

/**
 * Get image dimensions without loading full image
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<Object>} - Image dimensions
 */
async function getImageDimensions(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: imageBuffer.length
    };
  } catch (error) {
    logger.error('Failed to get image dimensions:', error);
    return null;
  }
}

/**
 * Convert image to WebP format (simple conversion)
 * @param {Buffer} imageBuffer - Original image buffer
 * @param {number} quality - WebP quality (1-100)
 * @returns {Promise<Buffer>} - WebP buffer
 */
async function convertToWebP(imageBuffer, quality = 85) {
  try {
    const webp = await sharp(imageBuffer)
      .webp({ quality })
      .toBuffer();

    logger.debug('Converted to WebP:', {
      originalSize: imageBuffer.length,
      webpSize: webp.length,
      reduction: ((1 - webp.length / imageBuffer.length) * 100).toFixed(2) + '%'
    });

    return webp;
  } catch (error) {
    logger.error('WebP conversion failed:', error);
    throw error;
  }
}

/**
 * Check if image optimization is enabled
 * @returns {boolean}
 */
function isEnabled() {
  return process.env.IMAGE_OPTIMIZATION_ENABLED !== 'false';
}

/**
 * Get recommended size variant for a given use case
 * @param {string} useCase - Use case (list, card, modal, full)
 * @returns {string} - Size name
 */
function getRecommendedSize(useCase) {
  const sizeMap = {
    'list': 'thumbnail',
    'card': 'small',
    'modal': 'medium',
    'full': 'large',
    'preview': 'thumbnail'
  };

  return sizeMap[useCase] || 'medium';
}

module.exports = {
  isImage,
  isEnabled,
  optimizeImage,
  generateThumbnail,
  optimizeImageFile,
  getImageDimensions,
  convertToWebP,
  getOptimizedFilename,
  getRecommendedSize,
  SIZES,
  WEBP_QUALITY
};
