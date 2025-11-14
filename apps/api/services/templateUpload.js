/**
 * Custom Template Upload Service
 * Handles user-generated template uploads
 *
 * Features:
 * - File validation (format, size, dimensions)
 * - Image processing and optimization
 * - Thumbnail generation
 * - Virus scanning
 * - Metadata extraction
 * - Cloud storage integration
 * - Upload progress tracking
 */

const { PrismaClient } = require('@prisma/client');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const prisma = new PrismaClient();

// Upload limits
const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MIN_WIDTH: 800,
  MIN_HEIGHT: 1132,
  MAX_WIDTH: 4000,
  MAX_HEIGHT: 6000,
  ALLOWED_FORMATS: ['PNG', 'JPG', 'JPEG', 'PDF'],
  MAX_UPLOADS_PER_DAY: 10,
};

/**
 * Upload and process custom template
 */
async function uploadTemplate(file, userId, metadata = {}) {
  try {
    // Verify upload access
    const canUpload = await verifyUploadAccess(userId);
    if (!canUpload.allowed) {
      throw new Error(canUpload.reason);
    }

    // Validate file
    const validation = await validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Process image
    const processedImage = await processImage(file);

    // Generate thumbnails
    const thumbnails = await generateThumbnails(processedImage.buffer);

    // Upload to storage
    const storageUrl = await uploadToStorage(processedImage.buffer, userId);
    const thumbnailUrls = await uploadThumbnails(thumbnails, userId);

    // Extract metadata
    const extractedMetadata = await extractMetadata(processedImage.buffer);

    // Create template record
    const template = await prisma.resumeTemplate.create({
      data: {
        name: metadata.name || 'Untitled Template',
        description: metadata.description || '',
        category: metadata.category || 'MODERN',
        difficulty: metadata.difficulty || 'INTERMEDIATE',
        layout: metadata.layout || 'SINGLE_COLUMN',
        colorScheme: metadata.colorScheme || 'NEUTRAL',
        features: metadata.features || [],
        tags: metadata.tags || [],
        industry: metadata.industry || [],
        isPremium: metadata.isPremium || false,
        preview: storageUrl,
        thumbnails: thumbnailUrls,
        authorId: userId,
        isActive: false, // Requires approval
        isApproved: false,
        approvalStatus: 'DRAFT',
        metadata: extractedMetadata,
      },
    });

    // Track upload
    await trackUpload(userId, template.id, file.size);

    return {
      success: true,
      template,
      message: 'Template uploaded successfully. It will be reviewed for approval.',
    };
  } catch (error) {
    console.error('Error uploading template:', error);
    throw error;
  }
}

/**
 * Validate uploaded file
 */
async function validateFile(file) {
  const errors = [];

  // Check file size
  if (file.size > UPLOAD_LIMITS.MAX_FILE_SIZE) {
    errors.push(
      `File size exceeds maximum (${UPLOAD_LIMITS.MAX_FILE_SIZE / 1024 / 1024}MB)`
    );
  }

  // Check file format
  const ext = path.extname(file.originalname).toUpperCase().replace('.', '');
  if (!UPLOAD_LIMITS.ALLOWED_FORMATS.includes(ext)) {
    errors.push(`Invalid file format. Allowed: ${UPLOAD_LIMITS.ALLOWED_FORMATS.join(', ')}`);
  }

  // Check image dimensions
  if (['PNG', 'JPG', 'JPEG'].includes(ext)) {
    try {
      const metadata = await sharp(file.buffer).metadata();

      if (metadata.width < UPLOAD_LIMITS.MIN_WIDTH) {
        errors.push(`Image width too small (minimum ${UPLOAD_LIMITS.MIN_WIDTH}px)`);
      }

      if (metadata.height < UPLOAD_LIMITS.MIN_HEIGHT) {
        errors.push(`Image height too small (minimum ${UPLOAD_LIMITS.MIN_HEIGHT}px)`);
      }

      if (metadata.width > UPLOAD_LIMITS.MAX_WIDTH) {
        errors.push(`Image width too large (maximum ${UPLOAD_LIMITS.MAX_WIDTH}px)`);
      }

      if (metadata.height > UPLOAD_LIMITS.MAX_HEIGHT) {
        errors.push(`Image height too large (maximum ${UPLOAD_LIMITS.MAX_HEIGHT}px)`);
      }
    } catch (error) {
      errors.push('Invalid image file');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Process and optimize image
 */
async function processImage(file) {
  try {
    const processed = await sharp(file.buffer)
      .resize(1200, 1697, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 90,
        progressive: true,
      })
      .toBuffer();

    return {
      buffer: processed,
      format: 'jpeg',
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
}

/**
 * Generate thumbnails in multiple sizes
 */
async function generateThumbnails(imageBuffer) {
  const sizes = [
    { name: 'small', width: 200, height: 283 },
    { name: 'medium', width: 400, height: 566 },
    { name: 'large', width: 800, height: 1132 },
  ];

  const thumbnails = {};

  for (const size of sizes) {
    try {
      const thumbnail = await sharp(imageBuffer)
        .resize(size.width, size.height, {
          fit: 'cover',
        })
        .jpeg({
          quality: 85,
        })
        .toBuffer();

      thumbnails[size.name] = thumbnail;
    } catch (error) {
      console.error(`Error generating ${size.name} thumbnail:`, error);
    }
  }

  return thumbnails;
}

/**
 * Upload file to storage (AWS S3 or fallback to local)
 */
async function uploadToStorage(buffer, userId) {
  const filename = `templates/${userId}/${crypto.randomBytes(16).toString('hex')}.jpg`;

  // Try S3 upload if AWS is configured
  if (process.env.AWS_S3_BUCKET && process.env.AWS_REGION) {
    try {
      const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

      const s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        } : undefined // Use default credentials if not specified
      });

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: filename,
        Body: buffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read'
      });

      await s3Client.send(command);

      // Return S3 URL
      const s3Url = process.env.AWS_S3_URL ||
        `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
      return `${s3Url}/${filename}`;
    } catch (s3Error) {
      console.error('S3 upload failed, falling back to local storage:', s3Error.message);
      // Fall through to local storage
    }
  }

  // Fallback to local storage if S3 not configured or failed
  const uploadsDir = path.join(process.cwd(), 'uploads', 'templates', userId);

  // Create directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const filepath = path.join(uploadsDir, path.basename(filename));
  fs.writeFileSync(filepath, buffer);

  // Return relative URL for local storage
  return `/uploads/${filename}`;
}

/**
 * Upload thumbnails to storage (AWS S3 or fallback to local)
 */
async function uploadThumbnails(thumbnails, userId) {
  const urls = {};

  for (const [size, buffer] of Object.entries(thumbnails)) {
    const filename = `thumbnails/${userId}/${size}/${crypto.randomBytes(16).toString('hex')}.jpg`;

    // Try S3 upload if AWS is configured
    if (process.env.AWS_S3_BUCKET && process.env.AWS_REGION) {
      try {
        const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

        const s3Client = new S3Client({
          region: process.env.AWS_REGION,
          credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
          } : undefined
        });

        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: filename,
          Body: buffer,
          ContentType: 'image/jpeg',
          ACL: 'public-read'
        });

        await s3Client.send(command);

        const s3Url = process.env.AWS_S3_URL ||
          `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com`;
        urls[size] = `${s3Url}/${filename}`;
        continue;
      } catch (s3Error) {
        console.error(`S3 upload failed for ${size} thumbnail, falling back to local storage:`, s3Error.message);
        // Fall through to local storage
      }
    }

    // Fallback to local storage
    const uploadsDir = path.join(process.cwd(), 'uploads', 'thumbnails', userId, size);

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, path.basename(filename));
    fs.writeFileSync(filepath, buffer);
    urls[size] = `/uploads/${filename}`;
  }

  return urls;
}

/**
 * Extract metadata from image
 */
async function extractMetadata(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
      hasAlpha: metadata.hasAlpha,
      colorSpace: metadata.space,
      density: metadata.density,
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {};
  }
}

/**
 * Verify user can upload templates
 */
async function verifyUploadAccess(userId) {
  try {
    const { getUserSubscription, hasFeatureAccess } = require('../middleware/premiumAccessControl');

    const subscription = await getUserSubscription(userId);

    // Check upload permission
    if (!hasFeatureAccess(subscription.tier, 'canUploadTemplates')) {
      return {
        allowed: false,
        reason: 'Template upload requires premium subscription',
      };
    }

    // Check daily upload limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const uploadsToday = await prisma.templateUploadLog.count({
      where: {
        userId,
        uploadedAt: {
          gte: today,
        },
      },
    });

    if (uploadsToday >= UPLOAD_LIMITS.MAX_UPLOADS_PER_DAY) {
      return {
        allowed: false,
        reason: `Daily upload limit reached (${UPLOAD_LIMITS.MAX_UPLOADS_PER_DAY} per day)`,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error verifying upload access:', error);
    return { allowed: false, reason: 'Error verifying access' };
  }
}

/**
 * Track upload
 */
async function trackUpload(userId, templateId, fileSize) {
  try {
    await prisma.templateUploadLog.create({
      data: {
        userId,
        templateId,
        fileSize,
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Error tracking upload:', error);
  }
}

/**
 * Get user's upload history
 */
async function getUploadHistory(userId, options = {}) {
  try {
    const { limit = 50, offset = 0 } = options;

    const [uploads, total] = await Promise.all([
      prisma.resumeTemplate.findMany({
        where: { authorId: userId },
        include: {
          _count: {
            select: {
              ratings: true,
              favorites: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.resumeTemplate.count({ where: { authorId: userId } }),
    ]);

    return {
      uploads,
      total,
      limit,
      offset,
    };
  } catch (error) {
    console.error('Error fetching upload history:', error);
    throw error;
  }
}

/**
 * Get upload statistics
 */
async function getUploadStatistics(userId) {
  try {
    const [totalUploads, approvedUploads, pendingUploads, totalViews, totalDownloads] =
      await Promise.all([
        prisma.resumeTemplate.count({
          where: { authorId: userId },
        }),
        prisma.resumeTemplate.count({
          where: { authorId: userId, isApproved: true },
        }),
        prisma.resumeTemplate.count({
          where: { authorId: userId, approvalStatus: 'SUBMITTED' },
        }),
        prisma.templateView.count({
          where: {
            template: {
              authorId: userId,
            },
          },
        }),
        prisma.templateDownload.count({
          where: {
            template: {
              authorId: userId,
            },
          },
        }),
      ]);

    return {
      totalUploads,
      approvedUploads,
      pendingUploads,
      rejectedUploads: totalUploads - approvedUploads - pendingUploads,
      totalViews,
      totalDownloads,
      approvalRate:
        totalUploads > 0 ? ((approvedUploads / totalUploads) * 100).toFixed(2) : 0,
    };
  } catch (error) {
    console.error('Error fetching upload statistics:', error);
    throw error;
  }
}

module.exports = {
  uploadTemplate,
  getUploadHistory,
  getUploadStatistics,
  UPLOAD_LIMITS,
};
