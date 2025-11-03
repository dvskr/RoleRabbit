/**
 * Verify normalized tables were created
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyTables() {
  try {
    // Check if new tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'roleready' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('\n📊 Tables in database:');
    console.table(tables);
    
    const expectedTables = [
      'users',
      'user_profiles',
      'work_experiences',
      'education',
      'skills',
      'user_skills',
      'certifications',
      'projects',
      'achievements',
      'volunteer_experiences',
      'recommendations',
      'publications',
      'patents',
      'organizations',
      'test_scores',
      'career_goals',
      'career_timeline',
      'social_links',
      'refresh_tokens',
      'sessions',
      'password_reset_tokens'
    ];
    
    const createdTables = tables.map(t => t.table_name);
    const missing = expectedTables.filter(t => !createdTables.includes(t));
    
    if (missing.length > 0) {
      console.log('\n⚠️  Missing tables:', missing);
    } else {
      console.log('\n✅ All tables created successfully!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyTables();

