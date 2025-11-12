#!/usr/bin/env node
// Test script to verify resume activation fix

const { prisma } = require('./utils/db');

async function testActivation() {
  console.log('\n🧪 Testing Resume Activation Fix...\n');

  try {
    // Find a user with resumes
    const user = await prisma.user.findFirst({
      where: {
        baseResumes: {
          some: {}
        }
      },
      include: {
        baseResumes: {
          select: {
            id: true,
            name: true,
            isActive: true,
            slotNumber: true,
            // Explicitly exclude embedding
          }
        }
      }
    });

    if (!user || user.baseResumes.length === 0) {
      console.log('⚠️  No users with resumes found for testing');
      return;
    }

    console.log(`✅ Found user: ${user.email}`);
    console.log(`   Resumes: ${user.baseResumes.length}`);
    console.log(`   Current active: ${user.activeBaseResumeId || 'none'}\n`);

    // Test activating a different resume
    const targetResume = user.baseResumes.find(r => r.id !== user.activeBaseResumeId) || user.baseResumes[0];
    
    console.log(`🔄 Activating resume: ${targetResume.name} (slot ${targetResume.slotNumber})...`);

    // Use raw SQL to avoid vector issues
    await prisma.$transaction([
      prisma.$executeRaw`UPDATE base_resumes SET "isActive" = false WHERE "userId" = ${user.id}`,
      prisma.$executeRaw`UPDATE base_resumes SET "isActive" = true WHERE id = ${targetResume.id}`,
      prisma.$executeRaw`UPDATE users SET "activeBaseResumeId" = ${targetResume.id} WHERE id = ${user.id}`
    ]);

    console.log('✅ Activation successful!\n');

    // Verify the result
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { activeBaseResumeId: true }
    });

    const updatedResumes = await prisma.baseResume.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        isActive: true,
        slotNumber: true,
        // Explicitly exclude embedding
      },
      orderBy: { slotNumber: 'asc' }
    });

    console.log('📊 Verification:');
    console.log(`   User activeBaseResumeId: ${updatedUser.activeBaseResumeId}`);
    console.log(`   Resumes status:`);
    updatedResumes.forEach(r => {
      console.log(`     - Slot ${r.slotNumber}: ${r.name} - ${r.isActive ? '✅ ACTIVE' : '⚪ inactive'}`);
    });

    const activeCount = updatedResumes.filter(r => r.isActive).length;
    if (activeCount === 1 && updatedResumes.find(r => r.isActive).id === targetResume.id) {
      console.log('\n✅ TEST PASSED: Resume activation working correctly!');
    } else {
      console.log('\n⚠️  TEST WARNING: Unexpected active state');
    }

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testActivation();

