/**
 * Check users table structure to ensure old columns are removed
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsersTable() {
  try {
    // Get columns from users table
    const columns = await prisma.$queryRaw`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'roleready'
      AND table_name = 'users'
      ORDER BY ordinal_position
    `;
    
    console.log('\n📋 Columns in users table:');
    console.table(columns);
    
    // Expected columns (authentication only)
    const expectedColumns = [
      'id', 'email', 'name', 'password', 'provider', 'providerId',
      'twoFactorEnabled', 'twoFactorSecret', 'twoFactorBackupCodes',
      'emailNotifications',
      'createdAt', 'updatedAt'
    ];
    
    const columnNames = columns.map(c => c.column_name);
    const unexpected = columnNames.filter(c => !expectedColumns.includes(c));
    
    if (unexpected.length > 0) {
      console.log('\n⚠️  Unexpected columns (old profile columns that should be removed):');
      console.table(unexpected.map(c => ({ column_name: c, action: 'SHOULD BE REMOVED' })));
    } else {
      console.log('\n✅ Users table structure is correct!');
      console.log('   All old profile columns have been removed.');
      console.log('   Profile data is now in user_profiles table.');
    }
    
    // Check user_profiles table
    const profileColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'roleready'
      AND table_name = 'user_profiles'
      ORDER BY ordinal_position
    `;
    
    console.log(`\n📋 user_profiles table has ${profileColumns.length} columns (profile data)`);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsersTable();

