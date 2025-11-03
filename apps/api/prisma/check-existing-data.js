/**
 * Check existing data before migration
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const userCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM users`;
    console.log('Current users:', userCount[0].count);
    
    const usersWithData = await prisma.$queryRaw`
      SELECT 
        id, 
        email,
        CASE WHEN "firstName" IS NOT NULL THEN 1 ELSE 0 END as has_profile,
        CASE WHEN "workExperiences" IS NOT NULL THEN 1 ELSE 0 END as has_work,
        CASE WHEN "skills" IS NOT NULL THEN 1 ELSE 0 END as has_skills
      FROM users
      LIMIT 10
    `;
    
    console.log('\nSample users:');
    console.table(usersWithData);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();

