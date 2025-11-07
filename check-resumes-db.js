/**
 * Quick script to check if resumes are being saved to the database
 * Run with: node check-resumes-db.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkResumes() {
  try {
    console.log('🔍 Checking resumes in database...\n');
    
    const count = await prisma.resume.count();
    console.log(`📊 Total resumes in database: ${count}\n`);
    
    if (count > 0) {
      const recentResumes = await prisma.resume.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        select: {
          id: true,
          fileName: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          data: {
            select: {
              resumeData: {
                select: {
                  name: true,
                  email: true,
                  summary: true
                }
              }
            }
          }
        }
      });
      
      console.log('📋 Recent resumes:');
      recentResumes.forEach((resume, index) => {
        console.log(`\n${index + 1}. ${resume.fileName}`);
        console.log(`   ID: ${resume.id}`);
        console.log(`   User ID: ${resume.userId}`);
        console.log(`   Created: ${resume.createdAt}`);
        console.log(`   Updated: ${resume.updatedAt}`);
        if (resume.data?.resumeData) {
          console.log(`   Name: ${resume.data.resumeData.name || 'N/A'}`);
          console.log(`   Email: ${resume.data.resumeData.email || 'N/A'}`);
          console.log(`   Summary: ${resume.data.resumeData.summary ? resume.data.resumeData.summary.substring(0, 50) + '...' : 'N/A'}`);
        }
      });
    } else {
      console.log('⚠️  No resumes found in database.');
      console.log('   This could mean:');
      console.log('   1. Auto-save is not working');
      console.log('   2. Authentication is failing');
      console.log('   3. Data is not being sent correctly');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkResumes();

