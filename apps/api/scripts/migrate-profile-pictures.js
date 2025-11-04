/**
 * Migration Script: Convert Base64 Profile Pictures to Supabase Storage
 * 
 * This script:
 * 1. Finds all UserProfile records with base64 profile pictures
 * 2. Converts base64 to file buffer
 * 3. Uploads to Supabase Storage
 * 4. Updates database with Supabase URL
 * 5. Removes base64 data from database
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const storageHandler = require('../utils/storageHandler');
const { Readable } = require('stream');
const logger = require('../utils/logger');

/**
 * Convert base64 data URL to Buffer
 */
function base64ToBuffer(base64String) {
  try {
    // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = base64String.replace(/^data:image\/[a-z]+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    throw new Error(`Failed to convert base64 to buffer: ${error.message}`);
  }
}

/**
 * Extract MIME type from base64 data URL
 */
function getMimeTypeFromBase64(base64String) {
  const match = base64String.match(/^data:image\/([a-z]+);base64,/);
  if (match) {
    const extension = match[1];
    const mimeTypes = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp'
    };
    return mimeTypes[extension] || 'image/jpeg';
  }
  return 'image/jpeg'; // Default
}

/**
 * Migrate a single profile picture
 */
async function migrateProfilePicture(userId, base64Data) {
  try {
    // Convert base64 to buffer
    const fileBuffer = base64ToBuffer(base64Data);
    const mimeType = getMimeTypeFromBase64(base64Data);
    
    // Determine file extension from MIME type
    const extension = mimeType.split('/')[1] || 'jpg';
    const fileName = `profile-picture.${extension}`;
    
    // Convert buffer to stream
    const fileStream = Readable.from(fileBuffer);
    
    // Upload to Supabase Storage
    const uploadResult = await storageHandler.upload(
      fileStream,
      userId,
      fileName,
      mimeType
    );
    
    // Get public URL for the uploaded file
    let profilePictureUrl = uploadResult.publicUrl;
    
    // If no public URL, generate a signed/download URL
    if (!profilePictureUrl) {
      profilePictureUrl = await storageHandler.getDownloadUrl(uploadResult.path, 31536000); // 1 year expiry
    }
    
    // If still no URL, use the path (for local storage)
    if (!profilePictureUrl) {
      profilePictureUrl = uploadResult.path;
    }
    
    // Update database with Supabase URL
    await prisma.userProfile.update({
      where: { userId: userId },
      data: {
        profilePicture: profilePictureUrl
      }
    });
    
    return {
      success: true,
      userId,
      newUrl: profilePictureUrl,
      size: fileBuffer.length
    };
  } catch (error) {
    logger.error(`Failed to migrate profile picture for user ${userId}:`, error);
    return {
      success: false,
      userId,
      error: error.message
    };
  }
}

/**
 * Main migration function
 */
async function migrateAllProfilePictures() {
  try {
    logger.info('🚀 Starting profile picture migration...');
    
    // Verify storage handler is available
    const storageType = storageHandler.getStorageType();
    logger.info(`📦 Storage type: ${storageType}`);
    
    if (storageType === 'supabase') {
      const isSupabase = storageHandler.isSupabase();
      if (!isSupabase) {
        logger.error('❌ Supabase Storage is not properly configured. Please check your environment variables.');
        logger.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_STORAGE_BUCKET');
        throw new Error('Supabase Storage not configured');
      }
      logger.info('✅ Supabase Storage is configured and ready');
    }
    
    // Find all profiles with base64 profile pictures
    const profiles = await prisma.userProfile.findMany({
      where: {
        profilePicture: {
          not: null
        }
      },
      select: {
        userId: true,
        profilePicture: true
      }
    });
    
    logger.info(`📊 Found ${profiles.length} profiles with profile pictures`);
    
    let base64Count = 0;
    const base64Profiles = [];
    
    // Identify base64 profile pictures
    for (const profile of profiles) {
      if (profile.profilePicture && profile.profilePicture.startsWith('data:image')) {
        base64Count++;
        base64Profiles.push(profile);
      }
    }
    
    logger.info(`📸 Found ${base64Count} base64 profile pictures to migrate`);
    
    if (base64Count === 0) {
      logger.info('✅ No base64 profile pictures found. Migration not needed.');
      return;
    }
    
    // Migrate each profile picture
    let successCount = 0;
    let errorCount = 0;
    const results = [];
    
    for (let i = 0; i < base64Profiles.length; i++) {
      const profile = base64Profiles[i];
      logger.info(`🔄 Migrating profile picture ${i + 1}/${base64Count} for user ${profile.userId}...`);
      
      const result = await migrateProfilePicture(profile.userId, profile.profilePicture);
      results.push(result);
      
      if (result.success) {
        successCount++;
        logger.info(`✅ Migrated profile picture for user ${profile.userId} (${(result.size / 1024).toFixed(2)} KB)`);
      } else {
        errorCount++;
        logger.error(`❌ Failed to migrate profile picture for user ${profile.userId}: ${result.error}`);
      }
      
      // Add small delay to avoid overwhelming Supabase
      if (i < base64Profiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Summary
    logger.info('\n📊 Migration Summary:');
    logger.info(`✅ Successfully migrated: ${successCount}/${base64Count}`);
    logger.info(`❌ Failed: ${errorCount}/${base64Count}`);
    
    if (successCount > 0) {
      const totalSaved = results
        .filter(r => r.success)
        .reduce((sum, r) => sum + (r.size || 0), 0);
      logger.info(`💾 Approximate database space saved: ${(totalSaved * 0.33 / 1024 / 1024).toFixed(2)} MB (33% base64 overhead removed)`);
    }
    
    if (errorCount > 0) {
      logger.warn('\n⚠️  Some migrations failed. Check logs above for details.');
      logger.warn('You can run this script again - it will only migrate remaining base64 pictures.');
    }
    
    return {
      total: base64Count,
      success: successCount,
      failed: errorCount,
      results
    };
  } catch (error) {
    logger.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration if script is executed directly
if (require.main === module) {
  migrateAllProfilePictures()
    .then(() => {
      logger.info('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('❌ Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateAllProfilePictures, migrateProfilePicture };

