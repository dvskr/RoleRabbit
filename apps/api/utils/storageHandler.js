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

// Determine storage type from environment
// Default to Supabase Storage (works for both dev and production)
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'supabase'; // 'supabase' (recommended) or 'local'
const STORAGE_PATH = process.env.STORAGE_PATH || './uploads';

// Supabase Storage Configuration
let supabaseClient = null;
let supabaseStorageBucket = null;

/**
 * Initialize Supabase Storage client
 */
function initializeSupabase() {
  try {
    // Only load @supabase/supabase-js if using Supabase
    if (STORAGE_TYPE === 'supabase') {
      const { createClient } = require('@supabase/supabase-js');
      
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'roleready-file';
      
      if (!supabaseUrl || !supabaseServiceKey) {
        logger.warn('Supabase Storage credentials not found. Falling back to local storage.');
        return false;
      }
      
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
      supabaseStorageBucket = bucketName;
      
      logger.info(`✅ Supabase Storage initialized with bucket: ${bucketName}`);
      return true;
    }
  } catch (error) {
    logger.error('Failed to initialize Supabase Storage:', error);
    logger.warn('Falling back to local storage.');
    return false;
  }
  
  return false;
}

/**
 * Initialize local storage directory
 */
async function initializeLocalStorage() {
  try {
    const storagePath = path.resolve(STORAGE_PATH);
    await fs.mkdir(storagePath, { recursive: true });
    logger.info(`✅ Local storage initialized at: ${storagePath}`);
    return true;
  } catch (error) {
    logger.error('Failed to initialize local storage:', error);
    return false;
  }
}

// Initialize storage on module load
let storageInitialized = false;

async function initializeStorage() {
  if (storageInitialized) return;
  
  if (STORAGE_TYPE === 'supabase') {
    storageInitialized = initializeSupabase();
    if (!storageInitialized) {
      // Fallback to local if Supabase init fails
      await initializeLocalStorage();
    }
  } else {
    await initializeLocalStorage();
    storageInitialized = true;
  }
}

// Initialize immediately
initializeStorage().catch(err => {
  logger.error('Storage initialization error:', err);
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
    const { data, error } = await supabaseClient.storage
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
 * Upload file to local filesystem
 */
async function uploadToLocal(fileStream, userId, fileName, contentType) {
  try {
    const fileExtension = path.extname(fileName);
    const { storagePath, displayName } = generateFilePath(userId, fileName, fileExtension);
    
    // Create user directory structure
    const fullPath = path.join(STORAGE_PATH, userId);
    await fs.mkdir(fullPath, { recursive: true });
    
    // Create year/month directories
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const datePath = path.join(fullPath, String(year), month);
    await fs.mkdir(datePath, { recursive: true });
    
    // Extract filename from storagePath
    const finalFileName = storagePath.split('/').pop();
    const filePath = path.join(datePath, finalFileName);
    
    // Write file to disk
    const writeStream = require('fs').createWriteStream(filePath);
    await pipeline(fileStream, writeStream);
    
    // Get file size
    const stats = await fs.stat(filePath);
    
    // Generate public URL (relative path for local dev)
    const publicUrl = `/api/storage/files/${userId}/${year}/${month}/${finalFileName}`;
    
    return {
      path: storagePath,
      fullPath: filePath,
      publicUrl,
      displayName,
      size: stats.size
    };
  } catch (error) {
    logger.error('Local upload error:', error);
    throw error;
  }
}

/**
 * Upload file (main method)
 */
async function upload(fileStream, userId, fileName, contentType) {
  await initializeStorage();
  
  if (STORAGE_TYPE === 'supabase' && supabaseClient) {
    return await uploadToSupabase(fileStream, userId, fileName, contentType);
  } else {
    return await uploadToLocal(fileStream, userId, fileName, contentType);
  }
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
 * Download file from local filesystem
 */
async function downloadFromLocal(storagePath) {
  try {
    const fullPath = path.join(STORAGE_PATH, storagePath);
    
    // Security: Prevent directory traversal
    const resolvedPath = path.resolve(fullPath);
    const resolvedStorage = path.resolve(STORAGE_PATH);
    if (!resolvedPath.startsWith(resolvedStorage)) {
      throw new Error('Invalid file path');
    }
    
    // Check if file exists
    await fs.access(fullPath);
    
    // Read file
    return await fs.readFile(fullPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error('File not found');
    }
    logger.error('Local download error:', error);
    throw error;
  }
}

/**
 * Download file (main method)
 * Returns a readable stream or buffer
 */
async function download(storagePath) {
  await initializeStorage();
  
  if (STORAGE_TYPE === 'supabase' && supabaseClient) {
    const buffer = await downloadFromSupabase(storagePath);
    // Convert buffer to stream for consistency
    const { Readable } = require('stream');
    return Readable.from(buffer);
  } else {
    const buffer = await downloadFromLocal(storagePath);
    const { Readable } = require('stream');
    return Readable.from(buffer);
  }
}

/**
 * Get download URL (for direct browser access)
 */
async function getDownloadUrl(storagePath, expiresIn = 3600) {
  await initializeStorage();
  
  if (STORAGE_TYPE === 'supabase' && supabaseClient) {
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
  } else {
    // Local storage - return relative URL
    return `/api/storage/files/${storagePath}`;
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
 * Delete file from local filesystem
 */
async function deleteFromLocal(storagePath) {
  try {
    const fullPath = path.join(STORAGE_PATH, storagePath);
    
    // Security: Prevent directory traversal
    const resolvedPath = path.resolve(fullPath);
    const resolvedStorage = path.resolve(STORAGE_PATH);
    if (!resolvedPath.startsWith(resolvedStorage)) {
      throw new Error('Invalid file path');
    }
    
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File already deleted, consider it success
      return true;
    }
    logger.error('Local delete error:', error);
    throw error;
  }
}

/**
 * Delete file (main method)
 */
async function deleteFile(storagePath) {
  await initializeStorage();
  
  if (STORAGE_TYPE === 'supabase' && supabaseClient) {
    return await deleteFromSupabase(storagePath);
  } else {
    return await deleteFromLocal(storagePath);
  }
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
 * Check if file exists in local filesystem
 */
async function existsInLocal(storagePath) {
  try {
    const fullPath = path.join(STORAGE_PATH, storagePath);
    await fs.access(fullPath);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check if file exists
 */
async function fileExists(storagePath) {
  await initializeStorage();
  
  if (STORAGE_TYPE === 'supabase' && supabaseClient) {
    return await existsInSupabase(storagePath);
  } else {
    return await existsInLocal(storagePath);
  }
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
 * Get file metadata from local filesystem
 */
async function getMetadataFromLocal(storagePath) {
  try {
    const fullPath = path.join(STORAGE_PATH, storagePath);
    const stats = await fs.stat(fullPath);
    
    return {
      size: stats.size,
      contentType: null, // Would need to determine from extension
      lastModified: stats.mtime,
      etag: null
    };
  } catch (error) {
    return null;
  }
}

/**
 * Get file metadata
 */
async function getMetadata(storagePath) {
  await initializeStorage();
  
  if (STORAGE_TYPE === 'supabase' && supabaseClient) {
    return await getMetadataFromSupabase(storagePath);
  } else {
    return await getMetadataFromLocal(storagePath);
  }
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
  deleteFile,
  fileExists,
  getMetadata,
  getDownloadUrl,
  generateThumbnail,
  // Expose storage type for info
  getStorageType: () => STORAGE_TYPE,
  isSupabase: () => STORAGE_TYPE === 'supabase' && supabaseClient !== null
};

