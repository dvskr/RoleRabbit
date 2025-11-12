// Test script to verify resume slots functionality
const { prisma } = require('./utils/db');

async function testResumeSlots() {
  console.log('\n🧪 Testing Resume Slots Functionality\n');
  
  // Get a test user
  const user = await prisma.user.findFirst({
    select: { id: true, email: true, subscriptionTier: true, activeBaseResumeId: true }
  });
  
  if (!user) {
    console.log('❌ No user found');
    return;
  }
  
  console.log(`✅ Testing with user: ${user.email}`);
  console.log(`   Tier: ${user.subscriptionTier}`);
  console.log(`   Active Resume ID: ${user.activeBaseResumeId || 'none'}\n`);
  
  // Get all resumes for this user
  const resumes = await prisma.baseResume.findMany({
    where: { userId: user.id },
    orderBy: { slotNumber: 'asc' },
    select: {
      id: true,
      slotNumber: true,
      name: true,
      isActive: true,
      createdAt: true
    }
  });
  
  console.log(`📋 Found ${resumes.length} resume(s):\n`);
  
  resumes.forEach((r, i) => {
    const marker = r.isActive ? '🟢 ACTIVE' : '⚪ Inactive';
    console.log(`   ${i + 1}. Slot ${r.slotNumber}: "${r.name}"`);
    console.log(`      ${marker} | ID: ${r.id.substring(0, 8)}...`);
    console.log(`      Created: ${r.createdAt.toLocaleString()}\n`);
  });
  
  // Check for duplicates
  const slotNumbers = resumes.map(r => r.slotNumber);
  const duplicates = slotNumbers.filter((item, index) => slotNumbers.indexOf(item) !== index);
  
  if (duplicates.length > 0) {
    console.log(`⚠️  WARNING: Found duplicate slot numbers: ${[...new Set(duplicates)].join(', ')}\n`);
  } else {
    console.log(`✅ No duplicate slot numbers\n`);
  }
  
  // Check active status
  const activeResumes = resumes.filter(r => r.isActive);
  
  if (activeResumes.length === 0) {
    console.log(`⚠️  WARNING: No active resume set\n`);
  } else if (activeResumes.length > 1) {
    console.log(`❌ ERROR: Multiple active resumes found!\n`);
    activeResumes.forEach(r => {
      console.log(`   - Slot ${r.slotNumber}: "${r.name}" (ID: ${r.id.substring(0, 8)}...)`);
    });
    console.log();
  } else {
    console.log(`✅ Exactly one active resume: "${activeResumes[0].name}"\n`);
  }
  
  // Check if user's activeBaseResumeId matches
  if (user.activeBaseResumeId) {
    const matchingResume = resumes.find(r => r.id === user.activeBaseResumeId);
    if (!matchingResume) {
      console.log(`❌ ERROR: User's activeBaseResumeId (${user.activeBaseResumeId.substring(0, 8)}...) doesn't match any resume!\n`);
    } else if (!matchingResume.isActive) {
      console.log(`❌ ERROR: User's activeBaseResumeId points to resume "${matchingResume.name}" but it's marked as inactive!\n`);
    } else {
      console.log(`✅ User's activeBaseResumeId correctly matches active resume\n`);
    }
  } else if (resumes.length > 0) {
    console.log(`⚠️  WARNING: User has resumes but no activeBaseResumeId set\n`);
  }
  
  // Summary
  console.log('─'.repeat(50));
  console.log('\n📊 Summary:');
  console.log(`   Total Resumes: ${resumes.length}`);
  console.log(`   Slot Range: ${resumes.length > 0 ? `${Math.min(...slotNumbers)} - ${Math.max(...slotNumbers)}` : 'N/A'}`);
  console.log(`   Active Resumes: ${activeResumes.length}`);
  console.log(`   Duplicate Slots: ${duplicates.length > 0 ? 'YES ❌' : 'NO ✅'}`);
  console.log(`   DB Consistency: ${
    activeResumes.length === 1 && 
    (!user.activeBaseResumeId || user.activeBaseResumeId === activeResumes[0].id)
      ? 'GOOD ✅'
      : 'ISSUES ❌'
  }\n`);
}

testResumeSlots()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

