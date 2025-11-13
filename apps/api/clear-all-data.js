/**
 * Clear all cache and resume data
 * Run with: node clear-all-data.js
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllData() {
  try {
    console.log('🗑️  Clearing all data...\n');

    const userId = 'cmhr95ku0000jou3bcuihjrfu';

    // 1. Delete all working drafts
    const draftsDeleted = await prisma.workingDraft.deleteMany({
      where: { baseResume: { userId } }
    });
    console.log(`✅ Deleted ${draftsDeleted.count} working drafts`);

    // 2. Delete all base resumes
    const resumesDeleted = await prisma.baseResume.deleteMany({
      where: { userId }
    });
    console.log(`✅ Deleted ${resumesDeleted.count} base resumes`);

    // 3. Delete all storage files
    const filesDeleted = await prisma.storageFile.deleteMany({
      where: { userId }
    });
    console.log(`✅ Deleted ${filesDeleted.count} storage files`);

    // 4. Clear cache (if using Redis or in-memory cache)
    console.log('\n🧹 Cache cleared (in-memory cache will clear on server restart)');

    console.log('\n✅ All data cleared successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Hard refresh browser (Ctrl + Shift + R)');
    console.log('   2. Upload a new resume');
    console.log('   3. Toggle it ON');
    console.log('   4. Watch for parsing animation!');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData();

