/**
 * Storage Handler for RoleReady
 * Uses Supabase Storage for both development and production (recommended)
 * Falls back to local filesystem if Supabase not configured
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream/promises');
const logger = require('./logger');

// 🔒 PRODUCTION: Supabase Storage ONLY (no local storage fallback)
const STORAGE_TYPE = 'supabase'; // Enforced to Supabase only

// Supabase Storage Configuration
let supabaseClient = null;
let supabaseStorageBucket = null;

/**
 * Initialize Supabase Storage client
 * 🆕 PRODUCTION: Throws error if Supabase credentials missing
 */
function initializeSupabase() {
  try {
    const { createClient } = require('@supabase/supabase-js');

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'roleready-file';

    // 🆕 PRODUCTION: Fail fast if credentials missing
    if (!supabaseUrl || !supabaseServiceKey) {
      const errorMessage = 'CRITICAL: Supabase Storage credentials not configured. ' +
        'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
        'Local storage fallback has been removed for production.';
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    supabaseStorageBucket = bucketName;

    logger.info(`✅ Supabase Storage initialized with bucket: ${bucketName}`);
    return true;
  } catch (error) {
    logger.error('Failed to initialize Supabase Storage:', error);
    throw error; // 🆕 Don't fallback, throw error
  }
}

// Initialize storage on module load
let storageInitialized = false;

async function initializeStorage() {
  if (storageInitialized) return;

  // 🆕 PRODUCTION: Only Supabase, no fallback
  storageInitialized = initializeSupabase();
}

// Initialize immediately and fail fast if misconfigured
initializeStorage().catch(err => {
  logger.error('FATAL: Storage initialization failed:', err);
  // 🆕 Exit process if storage can't be initialized (fail fast)
  if (process.env.NODE_ENV === 'production') {
    logger.error('Exiting process due to storage initialization failure in production');
    process.exit(1);
  }
});

/**
 * Generate unique file path for user
 */
function generateFilePath(userId, fileName, fileExtension) {
  const fileId = crypto.randomUUID();
  const sanitizedFileName = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 100); // Limit filename length
  
  const timestamp = Date.now();
  const finalFileName = `${fileId}-${timestamp}${fileExtension}`;
  
  // Organize by user ID and date (YYYY/MM)
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return {
    storagePath: `${userId}/${year}/${month}/${finalFileName}`,
    displayName: sanitizedFileName
  };
}

/**
 * Upload file to Supabase Storage
 */
async function uploadToSupabase(fileStream, userId, fileName, contentType) {
  try {
    const fileExtension = path.extname(fileName);
    const { storagePath, displayName } = generateFilePath(userId, fileName, fileExtension);
    
    // Convert stream to buffer for Supabase
    const chunks = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const fileBuffer = Buffer.concat(chunks);
    
    // Upload to Supabase Storage
    const { error } = await supabaseClient.storage
      .from(supabaseStorageBucket)
      .upload(storagePath, fileBuffer, {
        contentType: contentType || 'application/octet-stream',
        upsert: false,
        cacheControl: '3600'
      });
    
    if (error) {
      throw new Error(`Supabase upload failed: ${error.message}`);
    }
    
    // Get public URL (if bucket is public) or signed URL
    let publicUrl = null;
    try {
      const { data: urlData } = supabaseClient.storage
        .from(supabaseStorageBucket)
        .getPublicUrl(storagePath);
      publicUrl = urlData?.publicUrl || null;
    } catch (urlError) {
      logger.warn('Could not get public URL:', urlError.message);
    }
    
    return {
      path: storagePath,
      fullPath: storagePath,
      publicUrl,
      displayName,
      size: fileBuffer.length
    };
  } catch (error) {
    logger.error('Supabase upload error:', error);
    throw error;
  }
}

/**
 * Upload file (main method)
 * 🆕 PRODUCTION: Supabase only
 */
async function upload(fileStream, userId, fileName, contentType) {
  await initializeStorage();

  // 🆕 PRODUCTION: Only Supabase
  if (!supabaseClient) {
    throw new Error('Storage not initialized. Supabase client is required.');
  }

  return await uploadToSupabase(fileStream, userId, fileName, contentType);
}

/**
 * Download file from Supabase Storage
 */
async function downloadFromSupabase(storagePath) {
  try {
    const { data, error } = await supabaseClient.storage
      .from(supabaseStorageBucket)
      .download(storagePath);
    
    if (error) {
      throw new Error(`Supabase download failed: ${error.message}`);
    }
    
    // Convert Blob to Buffer/Stream
    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    logger.error('Supabase download error:', error);
    throw error;
  }
}

/**
 * Download file (main method)
 * 🆕 PRODUCTION: Supabase only
 * Returns a readable stream
 */
async function download(storagePath) {
  await initializeStorage();

  if (!supabaseClient) {
    throw new Error('Storage not initialized. Supabase client is required.');
  }

  const buffer = await downloadFromSupabase(storagePath);
  // Convert buffer to stream for consistency
  const { Readable } = require('stream');
  return Readable.from(buffer);
}

/**
 * Download file as buffer (for resume parsing)
 * 🆕 PRODUCTION: Supabase only
 */
async function downloadAsBuffer(storagePath) {
  await initializeStorage();

  if (!supabaseClient) {
    throw new Error('Storage not initialized. Supabase client is required.');
  }

  return await downloadFromSupabase(storagePath);
}

/**
 * Get download URL (for direct browser access)
 * 🆕 PRODUCTION: Supabase only
 */
async function getDownloadUrl(storagePath, expiresIn = 3600) {
  await initializeStorage();

  if (!supabaseClient) {
    throw new Error('Storage not initialized. Supabase client is required.');
  }

  try {
    // Get signed URL for private files
    const { data, error } = await supabaseClient.storage
      .from(supabaseStorageBucket)
      .createSignedUrl(storagePath, expiresIn);

    if (error) {
      // Try public URL as fallback
      const { data: publicData } = supabaseClient.storage
        .from(supabaseStorageBucket)
        .getPublicUrl(storagePath);
      return publicData?.publicUrl || null;
    }

    return data?.signedUrl || null;
  } catch (error) {
    logger.error('Failed to generate download URL:', error);
    return null;
  }
}

/**
 * Delete file from Supabase Storage
 */
async function deleteFromSupabase(storagePath) {
  try {
    const { error } = await supabaseClient.storage
      .from(supabaseStorageBucket)
      .remove([storagePath]);
    
    if (error) {
      throw new Error(`Supabase delete failed: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    logger.error('Supabase delete error:', error);
    throw error;
  }
}

/**
 * Delete file (main method)
 * 🆕 PRODUCTION: Supabase only
 */
async function deleteFile(storagePath) {
  await initializeStorage();

  if (!supabaseClient) {
    throw new Error('Storage not initialized. Supabase client is required.');
  }

  return await deleteFromSupabase(storagePath);
}

/**
 * Check if file exists in Supabase Storage
 */
async function existsInSupabase(storagePath) {
  try {
    const { data, error } = await supabaseClient.storage
      .from(supabaseStorageBucket)
      .list(path.dirname(storagePath));
    
    if (error) {
      return false;
    }
    
    const fileName = path.basename(storagePath);
    return data?.some(file => file.name === fileName) || false;
  } catch (error) {
    return false;
  }
}

/**
 * Check if file exists
 * 🆕 PRODUCTION: Supabase only
 */
async function fileExists(storagePath) {
  await initializeStorage();

  if (!supabaseClient) {
    throw new Error('Storage not initialized. Supabase client is required.');
  }

  return await existsInSupabase(storagePath);
}

/**
 * Get file metadata from Supabase Storage
 */
async function getMetadataFromSupabase(storagePath) {
  try {
    const { data, error } = await supabaseClient.storage
      .from(supabaseStorageBucket)
      .list(path.dirname(storagePath));
    
    if (error) {
      throw error;
    }
    
    const fileName = path.basename(storagePath);
    const file = data?.find(f => f.name === fileName);
    
    if (!file) {
      return null;
    }
    
    return {
      size: file.metadata?.size || 0,
      contentType: file.metadata?.mimetype || 'application/octet-stream',
      lastModified: file.updated_at || file.created_at,
      etag: file.id
    };
  } catch (error) {
    logger.error('Failed to get metadata from Supabase:', error);
    return null;
  }
}

/**
 * Get file metadata
 * 🆕 PRODUCTION: Supabase only
 */
async function getMetadata(storagePath) {
  await initializeStorage();

  if (!supabaseClient) {
    throw new Error('Storage not initialized. Supabase client is required.');
  }

  return await getMetadataFromSupabase(storagePath);
}

/**
 * Generate thumbnail (placeholder - can be implemented with sharp library)
 */
async function generateThumbnail(storagePath, contentType) {
  // Only generate thumbnails for images
  if (!contentType || !contentType.startsWith('image/')) {
    return null;
  }
  
  try {
    // TODO: Implement thumbnail generation using sharp or similar
    // For now, return null
    logger.debug('Thumbnail generation not yet implemented');
    return null;
  } catch (error) {
    logger.error('Thumbnail generation error:', error);
    return null;
  }
}

module.exports = {
  upload,
  download,
  downloadAsBuffer,  // ✅ ADD: For resume parsing
  deleteFile,
  fileExists,
  getMetadata,
  getDownloadUrl,
  generateThumbnail,
  // Expose storage type for info
  getStorageType: () => STORAGE_TYPE,
  isSupabase: () => STORAGE_TYPE === 'supabase' && supabaseClient !== null
};

