/**
 * Quick test script to verify Supabase Storage connection
 * Run: node apps/api/utils/testStorage.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testStorage() {
  console.log('\n🔍 Testing Supabase Storage Connection...\n');
  
  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'roleready-files';
  
  console.log('Environment Variables:');
  console.log('  SUPABASE_URL:', supabaseUrl ? '✅ SET' : '❌ NOT SET');
  console.log('  SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ SET' : '❌ NOT SET');
  console.log('  SUPABASE_STORAGE_BUCKET:', bucketName);
  console.log('  STORAGE_TYPE:', process.env.STORAGE_TYPE || 'supabase');
  console.log('');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables!');
    console.error('   Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env file');
    process.exit(1);
  }
  
  // Initialize Supabase client
  console.log('Initializing Supabase client...');
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Test bucket access
  console.log(`\n📦 Checking bucket: "${bucketName}"...`);
  try {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      process.exit(1);
    }
    
    console.log(`\nFound ${buckets.length} bucket(s):`);
    buckets.forEach(bucket => {
      const isTarget = bucket.name === bucketName;
      console.log(`  ${isTarget ? '✅' : '  '} ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    const targetBucket = buckets.find(b => b.name === bucketName);
    
    if (!targetBucket) {
      console.error(`\n❌ Bucket "${bucketName}" NOT FOUND!`);
      console.error('   Please create the bucket in Supabase Dashboard:');
      console.error('   1. Go to Storage → Buckets');
      console.error(`   2. Create bucket named: ${bucketName}`);
      console.error('   3. Set it to public (or configure RLS policies)');
      process.exit(1);
    }
    
    console.log(`\n✅ Bucket "${bucketName}" found!`);
    console.log(`   Public: ${targetBucket.public ? 'Yes' : 'No'}`);
    
    // Test upload with a small test file
    console.log('\n🧪 Testing upload...');
    const testContent = Buffer.from('Test file content');
    const testPath = `test/connection-test-${Date.now()}.txt`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(testPath, testContent, {
        contentType: 'text/plain',
        upsert: false
      });
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError.message);
      console.error('   Error details:', uploadError);
      
      if (uploadError.message.includes('new row violates row-level security')) {
        console.error('\n💡 Fix: Run the storage policies SQL in Supabase SQL Editor');
        console.error('   See: docs/storage/STORAGE_POLICIES.md');
      }
      
      process.exit(1);
    }
    
    console.log('✅ Upload test successful!');
    console.log(`   Path: ${testPath}`);
    
    // Clean up test file
    console.log('\n🧹 Cleaning up test file...');
    const { error: deleteError } = await supabase.storage
      .from(bucketName)
      .remove([testPath]);
    
    if (deleteError) {
      console.warn('⚠️  Could not delete test file:', deleteError.message);
      console.warn(`   Please manually delete: ${testPath}`);
    } else {
      console.log('✅ Test file deleted');
    }
    
    console.log('\n✅ All storage tests passed!');
    console.log('   Your Supabase Storage is properly configured.\n');
    
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    console.error('   Stack:', error.stack);
    process.exit(1);
  }
}

testStorage().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});

