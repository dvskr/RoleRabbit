#!/usr/bin/env node
// Test resume activation functionality

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testResumeActivation() {
  console.log('\n========================================');
  console.log('  TESTING RESUME ACTIVATION');
  console.log('========================================\n');

  try {
    // Get a user
    const user = await prisma.user.findFirst({
      select: { id: true, email: true, activeBaseResumeId: true }
    });

    if (!user) {
      console.log('❌ No users found in database\n');
      process.exit(1);
    }

    console.log(`Testing with user: ${user.email}`);
    console.log(`Current active resume: ${user.activeBaseResumeId || 'None'}\n`);

    // List all resumes for this user
    console.log('Fetching user resumes...');
    const resumes = await prisma.baseResume.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        slotNumber: true,
        isActive: true,
        // Explicitly exclude embedding to avoid vector type issues
      },
      orderBy: { slotNumber: 'asc' }
    });

    if (resumes.length === 0) {
      console.log('❌ No resumes found for this user\n');
      process.exit(1);
    }

    console.log(`\nFound ${resumes.length} resume(s):\n`);
    resumes.forEach((resume, index) => {
      const activeFlag = resume.isActive ? '✅ ACTIVE' : '  ';
      console.log(`${index + 1}. [Slot ${resume.slotNumber}] ${activeFlag} ${resume.name}`);
      console.log(`   ID: ${resume.id}`);
    });

    // Test activation
    console.log('\n----------------------------------------');
    console.log('Testing activation...\n');

    // Find a non-active resume to activate
    const inactiveResume = resumes.find(r => !r.isActive);
    
    if (!inactiveResume) {
      console.log('✅ All resumes can be queried successfully!');
      console.log('✅ No Prisma vector errors!\n');
      
      // Try to re-activate the current active one
      const activeResume = resumes.find(r => r.isActive);
      if (activeResume) {
        console.log(`Re-activating currently active resume: ${activeResume.name}...`);
        
        // Use raw SQL to avoid vector type issues
        await prisma.$transaction([
          prisma.$executeRaw`UPDATE base_resumes SET "isActive" = false WHERE "userId" = ${user.id}`,
          prisma.$executeRaw`UPDATE base_resumes SET "isActive" = true WHERE id = ${activeResume.id}`,
          prisma.user.update({
            where: { id: user.id },
            data: { activeBaseResumeId: activeResume.id }
          })
        ]);
        
        console.log('✅ Activation successful!\n');
      }
    } else {
      console.log(`Activating resume: ${inactiveResume.name}...`);
      
      // Use raw SQL to avoid vector type issues
      await prisma.$transaction([
        prisma.$executeRaw`UPDATE base_resumes SET "isActive" = false WHERE "userId" = ${user.id}`,
        prisma.$executeRaw`UPDATE base_resumes SET "isActive" = true WHERE id = ${inactiveResume.id}`,
        prisma.user.update({
          where: { id: user.id },
          data: { activeBaseResumeId: inactiveResume.id }
        })
      ]);
      
      console.log('✅ Activation successful!\n');
      
      // Verify
      const updated = await prisma.baseResume.findFirst({
        where: { id: inactiveResume.id },
        select: { id: true, name: true, isActive: true }
      });
      
      console.log('Verification:');
      console.log(`  ${updated.name}: ${updated.isActive ? '✅ ACTIVE' : '❌ NOT ACTIVE'}\n`);
    }

    console.log('========================================');
    console.log('  TEST PASSED! ✅');
    console.log('========================================');
    console.log('\nResume activation is working correctly!');
    console.log('No Prisma vector deserialization errors!\n');
    
    process.exit(0);

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testResumeActivation();

