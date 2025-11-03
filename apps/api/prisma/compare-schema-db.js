/**
 * Compare schema definition with actual database structure
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function compareSchema() {
  try {
    // Check user_profiles table for job board fields
    const profileColumns = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'roleready'
      AND table_name = 'user_profiles'
      ORDER BY column_name
    `;
    
    console.log('\n📋 user_profiles columns in database:');
    console.table(profileColumns);
    
    // Fields that should NOT be in normalized schema (job board specific)
    const jobBoardFields = [
      'successRate',
      'skillMatchRate', 
      'avgResponseTime',
      'experience',
      'industry',
      'jobLevel',
      'employmentType',
      'availability',
      'salaryExpectation',
      'workPreference'
    ];
    
    const foundFields = profileColumns
      .map(c => c.column_name)
      .filter(f => jobBoardFields.includes(f));
    
    if (foundFields.length > 0) {
      console.log('\n⚠️  Job board fields found in user_profiles (should be removed):');
      console.table(foundFields.map(f => ({ field: f, action: 'REMOVE' })));
    } else {
      console.log('\n✅ No job board fields found in user_profiles!');
    }
    
    // Check work_experiences for 'client' field
    const workExpColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'roleready'
      AND table_name = 'work_experiences'
      ORDER BY column_name
    `;
    
    const hasClientField = workExpColumns.some(c => c.column_name === 'client');
    if (hasClientField) {
      console.log('\n⚠️  "client" field found in work_experiences (removed in latest design)');
    } else {
      console.log('\n✅ No "client" field in work_experiences');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

compareSchema();

