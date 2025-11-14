/**
 * Unit Tests for Image Optimizer
 * Tests image processing, WebP conversion, and thumbnail generation
 */

const imageOptimizer = require('../utils/imageOptimizer');
const sharp = require('sharp');

describe('Image Optimizer Unit Tests', () => {
  // Sample test image buffer (1x1 red pixel PNG)
  const testImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==',
    'base64'
  );

  describe('isImage()', () => {
    test('should return true for image MIME types', () => {
      expect(imageOptimizer.isImage('image/jpeg')).toBe(true);
      expect(imageOptimizer.isImage('image/png')).toBe(true);
      expect(imageOptimizer.isImage('image/webp')).toBe(true);
      expect(imageOptimizer.isImage('image/gif')).toBe(true);
    });

    test('should return false for non-image MIME types', () => {
      expect(imageOptimizer.isImage('text/plain')).toBe(false);
      expect(imageOptimizer.isImage('application/pdf')).toBe(false);
      expect(imageOptimizer.isImage('video/mp4')).toBe(false);
    });

    test('should return false for SVG images', () => {
      expect(imageOptimizer.isImage('image/svg+xml')).toBe(false);
    });

    test('should return false for null or undefined', () => {
      expect(imageOptimizer.isImage(null)).toBe(false);
      expect(imageOptimizer.isImage(undefined)).toBe(false);
    });
  });

  describe('getOptimizedFilename()', () => {
    test('should generate correct thumbnail filename', () => {
      const result = imageOptimizer.getOptimizedFilename('photo.jpg', 'thumbnail');
      expect(result).toBe('photo_thumbnail.webp');
    });

    test('should generate correct small filename', () => {
      const result = imageOptimizer.getOptimizedFilename('image.png', 'small');
      expect(result).toBe('image_small.webp');
    });

    test('should handle filenames with multiple dots', () => {
      const result = imageOptimizer.getOptimizedFilename('my.photo.2024.jpg', 'medium');
      expect(result).toBe('my.photo.2024_medium.webp');
    });

    test('should generate WebP filename without size suffix', () => {
      const result = imageOptimizer.getOptimizedFilename('photo.jpg');
      expect(result).toBe('photo.webp');
    });
  });

  describe('getImageDimensions()', () => {
    test('should return image dimensions', async () => {
      const dimensions = await imageOptimizer.getImageDimensions(testImageBuffer);

      expect(dimensions).toBeDefined();
      expect(dimensions.width).toBe(1);
      expect(dimensions.height).toBe(1);
      expect(dimensions.format).toBe('png');
      expect(dimensions.size).toBeGreaterThan(0);
    });

    test('should return null for invalid image', async () => {
      const invalidBuffer = Buffer.from('not an image');
      const dimensions = await imageOptimizer.getImageDimensions(invalidBuffer);

      expect(dimensions).toBeNull();
    });
  });

  describe('convertToWebP()', () => {
    test('should convert image to WebP format', async () => {
      const webpBuffer = await imageOptimizer.convertToWebP(testImageBuffer, 85);

      expect(webpBuffer).toBeInstanceOf(Buffer);
      expect(webpBuffer.length).toBeGreaterThan(0);

      // Verify it's actually WebP
      const metadata = await sharp(webpBuffer).metadata();
      expect(metadata.format).toBe('webp');
    });

    test('should respect quality parameter', async () => {
      const highQuality = await imageOptimizer.convertToWebP(testImageBuffer, 95);
      const lowQuality = await imageOptimizer.convertToWebP(testImageBuffer, 50);

      // High quality should be larger (usually)
      expect(highQuality.length).toBeGreaterThanOrEqual(lowQuality.length);
    });

    test('should throw error for invalid image', async () => {
      const invalidBuffer = Buffer.from('not an image');

      await expect(
        imageOptimizer.convertToWebP(invalidBuffer)
      ).rejects.toThrow();
    });
  });

  describe('generateThumbnail()', () => {
    test('should generate thumbnail with default size', async () => {
      const thumbnail = await imageOptimizer.generateThumbnail(testImageBuffer);

      expect(thumbnail).toBeInstanceOf(Buffer);
      expect(thumbnail.length).toBeGreaterThan(0);

      const metadata = await sharp(thumbnail).metadata();
      expect(metadata.format).toBe('webp');
      expect(metadata.width).toBeLessThanOrEqual(200);
      expect(metadata.height).toBeLessThanOrEqual(200);
    });

    test('should generate thumbnail with custom size', async () => {
      const thumbnail = await imageOptimizer.generateThumbnail(testImageBuffer, {
        width: 100,
        height: 100,
        quality: 80
      });

      const metadata = await sharp(thumbnail).metadata();
      expect(metadata.width).toBeLessThanOrEqual(100);
      expect(metadata.height).toBeLessThanOrEqual(100);
    });

    test('should throw error for invalid image', async () => {
      const invalidBuffer = Buffer.from('not an image');

      await expect(
        imageOptimizer.generateThumbnail(invalidBuffer)
      ).rejects.toThrow();
    });
  });

  describe('optimizeImage()', () => {
    test('should optimize image and generate variants', async () => {
      const result = await imageOptimizer.optimizeImage(testImageBuffer, {
        generateSizes: ['thumbnail', 'small'],
        preserveOriginal: false,
        quality: 85
      });

      expect(result.success).toBe(true);
      expect(result.variants).toHaveProperty('thumbnail');
      expect(result.variants).toHaveProperty('small');
      expect(result.metadata).toHaveProperty('originalWidth');
      expect(result.metadata).toHaveProperty('reduction');
    });

    test('should generate thumbnail variant', async () => {
      const result = await imageOptimizer.optimizeImage(testImageBuffer, {
        generateSizes: ['thumbnail']
      });

      const thumbnail = result.variants.thumbnail;
      expect(thumbnail).toBeDefined();
      expect(thumbnail.buffer).toBeInstanceOf(Buffer);
      expect(thumbnail.format).toBe('webp');
      expect(thumbnail.width).toBe(200);
      expect(thumbnail.height).toBe(200);
    });

    test('should preserve original when requested', async () => {
      const result = await imageOptimizer.optimizeImage(testImageBuffer, {
        generateSizes: ['thumbnail'],
        preserveOriginal: true
      });

      expect(result.variants).toHaveProperty('original');
      expect(result.variants.original.buffer).toEqual(testImageBuffer);
    });

    test('should handle invalid image gracefully', async () => {
      const invalidBuffer = Buffer.from('not an image');
      const result = await imageOptimizer.optimizeImage(invalidBuffer);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.variants).toEqual({});
    });

    test('should calculate size reduction correctly', async () => {
      const result = await imageOptimizer.optimizeImage(testImageBuffer, {
        generateSizes: ['thumbnail']
      });

      expect(result.metadata).toHaveProperty('reduction');
      expect(result.metadata.originalSize).toBeGreaterThan(0);
      expect(result.metadata.optimizedSize).toBeGreaterThan(0);
    });
  });

  describe('getRecommendedSize()', () => {
    test('should return correct size for use cases', () => {
      expect(imageOptimizer.getRecommendedSize('list')).toBe('thumbnail');
      expect(imageOptimizer.getRecommendedSize('card')).toBe('small');
      expect(imageOptimizer.getRecommendedSize('modal')).toBe('medium');
      expect(imageOptimizer.getRecommendedSize('full')).toBe('large');
      expect(imageOptimizer.getRecommendedSize('preview')).toBe('thumbnail');
    });

    test('should return default size for unknown use case', () => {
      expect(imageOptimizer.getRecommendedSize('unknown')).toBe('medium');
    });
  });

  describe('isEnabled()', () => {
    test('should check if optimization is enabled', () => {
      const originalValue = process.env.IMAGE_OPTIMIZATION_ENABLED;

      // Test enabled
      process.env.IMAGE_OPTIMIZATION_ENABLED = 'true';
      expect(imageOptimizer.isEnabled()).toBe(true);

      // Test disabled
      process.env.IMAGE_OPTIMIZATION_ENABLED = 'false';
      expect(imageOptimizer.isEnabled()).toBe(false);

      // Restore original
      process.env.IMAGE_OPTIMIZATION_ENABLED = originalValue;
    });

    test('should default to enabled when not set', () => {
      const originalValue = process.env.IMAGE_OPTIMIZATION_ENABLED;
      delete process.env.IMAGE_OPTIMIZATION_ENABLED;

      expect(imageOptimizer.isEnabled()).toBe(true);

      process.env.IMAGE_OPTIMIZATION_ENABLED = originalValue;
    });
  });

  describe('SIZES constants', () => {
    test('should have correct thumbnail size', () => {
      expect(imageOptimizer.SIZES.thumbnail).toEqual({
        width: 200,
        height: 200,
        fit: 'cover'
      });
    });

    test('should have all required sizes', () => {
      expect(imageOptimizer.SIZES).toHaveProperty('thumbnail');
      expect(imageOptimizer.SIZES).toHaveProperty('small');
      expect(imageOptimizer.SIZES).toHaveProperty('medium');
      expect(imageOptimizer.SIZES).toHaveProperty('large');
    });
  });

  describe('WEBP_QUALITY constants', () => {
    test('should have correct quality settings', () => {
      expect(imageOptimizer.WEBP_QUALITY.thumbnail).toBe(75);
      expect(imageOptimizer.WEBP_QUALITY.small).toBe(80);
      expect(imageOptimizer.WEBP_QUALITY.medium).toBe(85);
      expect(imageOptimizer.WEBP_QUALITY.large).toBe(90);
    });
  });
});
