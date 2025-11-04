const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkWorkExperiences() {
  console.log('🔍 Checking Work Experiences in Database\n');
  
  try {
    const workExp = await prisma.workExperience.findMany({
      include: {
        profile: {
          include: {
            user: {
              select: {
                email: true,
                id: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });
    
    console.log(`📊 Total work experiences found: ${workExp.length}\n`);
    
    if (workExp.length === 0) {
      console.log('⚠️  No work experiences found in database.');
      console.log('   This confirms the issue - data is not being saved.\n');
    } else {
      console.log('✅ Work experiences in database:\n');
      workExp.forEach((exp, i) => {
        console.log(`${i + 1}. ${exp.role} at ${exp.company}`);
        console.log(`   User: ${exp.profile.user.email}`);
        console.log(`   Profile ID: ${exp.profileId}`);
        console.log(`   Record ID: ${exp.id}`);
        console.log(`   Dates: ${exp.startDate} - ${exp.endDate || 'Current'}`);
        console.log(`   Created: ${exp.createdAt}`);
        console.log('');
      });
    }
    
    // Check by user
    const users = await prisma.user.findMany({
      include: {
        profile: {
          include: {
            workExperiences: true
          }
        }
      },
      take: 5
    });
    
    console.log('\n📋 Work experiences by user:');
    users.forEach(user => {
      const count = user.profile?.workExperiences?.length || 0;
      console.log(`  ${user.email}: ${count} work experience(s)`);
      if (count > 0) {
        user.profile.workExperiences.forEach(exp => {
          console.log(`    - ${exp.role} at ${exp.company}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkWorkExperiences();

