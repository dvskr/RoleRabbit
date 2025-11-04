const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Direct database test - bypasses API to test Prisma directly
async function testDirectDatabaseSave() {
  console.log('🔍 Testing Work Experience Save Directly to Database\n');
  
  try {
    // First, get a user to test with
    const user = await prisma.user.findFirst({
      include: {
        profile: true
      }
    });
    
    if (!user) {
      console.log('❌ No users found in database. Please create a user first.');
      return;
    }
    
    console.log('✅ Found user:', user.email);
    console.log('   User ID:', user.id);
    
    if (!user.profile) {
      console.log('⚠️  User has no profile. Creating one...');
      const profile = await prisma.userProfile.create({
        data: {
          userId: user.id,
          firstName: 'Test',
          lastName: 'User'
        }
      });
      console.log('✅ Created profile:', profile.id);
    }
    
    const profileId = user.profile?.id || (await prisma.userProfile.findUnique({
      where: { userId: user.id }
    })).id;
    
    console.log('📋 Profile ID:', profileId);
    console.log('\n');
    
    // Delete existing work experiences for this profile
    const deleteResult = await prisma.workExperience.deleteMany({
      where: { profileId: profileId }
    });
    console.log('🗑️  Deleted existing work experiences:', deleteResult.count);
    
    // Create mock work experiences
    const mockWorkExperiences = [
      {
        profileId: profileId,
        company: 'Test Company Inc',
        role: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2020-01-01',
        endDate: null,
        isCurrent: true,
        description: 'Led development of critical features using React and Node.js',
        projectType: 'Full-time'
      },
      {
        profileId: profileId,
        company: 'Previous Company',
        role: 'Software Engineer',
        location: 'New York, NY',
        startDate: '2018-06-01',
        endDate: '2019-12-31',
        isCurrent: false,
        description: 'Developed web applications and APIs',
        projectType: 'Full-time'
      }
    ];
    
    console.log('📤 Creating work experiences...');
    console.log(JSON.stringify(mockWorkExperiences, null, 2));
    console.log('\n');
    
    const createResult = await prisma.workExperience.createMany({
      data: mockWorkExperiences
    });
    
    console.log('✅ Created work experiences:', createResult.count);
    
    // Verify the data was saved
    const savedWorkExp = await prisma.workExperience.findMany({
      where: { profileId: profileId },
      orderBy: { startDate: 'desc' }
    });
    
    console.log('\n📋 Verifying saved data:');
    console.log('Total work experiences:', savedWorkExp.length);
    console.log('\nSaved work experiences:');
    savedWorkExp.forEach((exp, index) => {
      console.log(`\n${index + 1}. ${exp.role} at ${exp.company}`);
      console.log(`   Location: ${exp.location || 'N/A'}`);
      console.log(`   Dates: ${exp.startDate} - ${exp.endDate || 'Current'}`);
      console.log(`   Current: ${exp.isCurrent}`);
      console.log(`   ID: ${exp.id}`);
    });
    
    // Test fetching via the profile relation
    console.log('\n🔍 Testing profile relation fetch...');
    const profileWithWorkExp = await prisma.userProfile.findUnique({
      where: { id: profileId },
      include: {
        workExperiences: {
          orderBy: { startDate: 'desc' }
        }
      }
    });
    
    console.log('Work experiences via profile relation:', profileWithWorkExp?.workExperiences?.length || 0);
    
    console.log('\n✅ Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    
    if (error.code) {
      console.error('Error code:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDirectDatabaseSave();

