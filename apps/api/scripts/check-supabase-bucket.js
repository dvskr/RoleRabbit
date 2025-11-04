/**
 * Check if Supabase Storage Bucket exists
 * Helper script to verify bucket configuration
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

async function checkBucket() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'roleready-file';

    if (!supabaseUrl || !supabaseServiceKey) {
      logger.error('❌ Missing Supabase credentials in .env file');
      logger.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
      return;
    }

    logger.info(`🔍 Checking Supabase Storage configuration...`);
    logger.info(`📦 Bucket name: ${bucketName}`);
    logger.info(`🔗 Supabase URL: ${supabaseUrl.substring(0, 30)}...`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      logger.error('❌ Failed to list buckets:', listError.message);
      return;
    }

    logger.info(`\n📋 Available buckets (${buckets.length}):`);
    buckets.forEach(bucket => {
      const isMatch = bucket.name === bucketName;
      logger.info(`   ${isMatch ? '✅' : '  '} ${bucket.name}${isMatch ? ' ← MATCH!' : ''}`);
    });

    // Check if our bucket exists
    const bucketExists = buckets.some(b => b.name === bucketName);

    if (bucketExists) {
      logger.info(`\n✅ Bucket "${bucketName}" exists!`);
      
      // Test upload access
      const testPath = `test/test-${Date.now()}.txt`;
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(testPath, 'test', { upsert: true });

      if (uploadError) {
        logger.error(`❌ Cannot upload to bucket: ${uploadError.message}`);
      } else {
        logger.info(`✅ Upload test successful!`);
        
        // Clean up test file
        await supabase.storage.from(bucketName).remove([testPath]);
        logger.info(`🧹 Test file cleaned up`);
      }
    } else {
      logger.error(`\n❌ Bucket "${bucketName}" NOT FOUND!`);
      logger.info(`\n📝 To create the bucket:`);
      logger.info(`1. Go to: https://supabase.com/dashboard`);
      logger.info(`2. Select your project`);
      logger.info(`3. Navigate to Storage → New bucket`);
      logger.info(`4. Name: ${bucketName}`);
      logger.info(`5. Public: No (recommended)`);
      logger.info(`6. Click "Create bucket"`);
    }
  } catch (error) {
    logger.error('❌ Error checking bucket:', error.message);
  }
}

checkBucket()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error('Failed:', error);
    process.exit(1);
  });

