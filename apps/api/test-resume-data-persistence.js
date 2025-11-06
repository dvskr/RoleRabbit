/**
 * Direct test of resume save/load to debug data persistence issue
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testResumePersistence() {
  console.log('\n=== Testing Resume Data Persistence ===\n');

  try {
    // 1. Find existing test user
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      console.error('❌ Test user not found. Run seeder first.');
      return;
    }

    console.log('✅ Found test user:', { id: user.id, email: user.email });

    // 2. Find existing resume
    const existingResumes = await prisma.resume.findMany({
      where: { userId: user.id }
    });

    console.log(`\n📋 Found ${existingResumes.length} existing resumes`);

    if (existingResumes.length > 0) {
      const resume = existingResumes[0];
      console.log('\n=== Existing Resume Details ===');
      console.log('ID:', resume.id);
      console.log('FileName:', resume.fileName);
      console.log('Data type:', typeof resume.data);
      console.log('Data keys:', resume.data ? Object.keys(resume.data) : 'null');
      
      if (resume.data && resume.data.resumeData) {
        console.log('\n=== Resume Data Content ===');
        const rd = resume.data.resumeData;
        console.log('Name:', rd.name || '(empty)');
        console.log('Email:', rd.email || '(empty)');
        console.log('Phone:', rd.phone || '(empty)');
        console.log('Location:', rd.location || '(empty)');
        console.log('LinkedIn:', rd.linkedin || '(empty)');
        console.log('Github:', rd.github || '(empty)');
        console.log('Website:', rd.website || '(empty)');
        console.log('Summary:', rd.summary ? `${rd.summary.substring(0, 50)}...` : '(empty)');
        console.log('Skills count:', Array.isArray(rd.skills) ? rd.skills.length : 0);
        console.log('Skills:', rd.skills || []);
        console.log('Experience count:', Array.isArray(rd.experience) ? rd.experience.length : 0);
      } else {
        console.log('\n⚠️  No resumeData found in data object');
        console.log('Full data:', JSON.stringify(resume.data, null, 2));
      }

      // 3. Test UPDATE with new data
      console.log('\n=== Testing UPDATE ===');
      
      const testData = {
        resumeData: {
          name: 'Test User Update',
          email: 'test@example.com',
          phone: '+1 (555) 999-8888',
          location: 'Test City, TS',
          linkedin: 'linkedin.com/in/testuser',
          github: 'github.com/testuser',
          website: 'testuser.com',
          summary: 'This is a test summary to verify data persistence.',
          skills: ['JavaScript', 'React', 'Node.js', 'Testing'],
          experience: [],
          education: [],
          projects: [],
          certifications: []
        },
        sectionVisibility: {
          summary: true,
          skills: true,
          experience: true,
          education: true,
          projects: true,
          certifications: true
        },
        customSections: [],
        customFields: [],
        formatting: {
          fontFamily: 'arial',
          fontSize: 'ats11pt',
          lineSpacing: 'normal',
          sectionSpacing: 'medium',
          margins: 'normal',
          headingStyle: 'bold',
          bulletStyle: 'disc'
        }
      };

      const updatedResume = await prisma.resume.update({
        where: { id: resume.id },
        data: {
          data: testData,
          updatedAt: new Date()
        }
      });

      console.log('✅ Resume updated successfully');
      console.log('Updated at:', updatedResume.updatedAt);

      // 4. IMMEDIATELY re-read to verify
      console.log('\n=== Verifying Persisted Data ===');
      
      const verifyResume = await prisma.resume.findFirst({
        where: { id: resume.id }
      });

      if (!verifyResume) {
        console.error('❌ Resume not found after update!');
        return;
      }

      console.log('Resume ID:', verifyResume.id);
      console.log('Data exists:', !!verifyResume.data);
      console.log('Data type:', typeof verifyResume.data);
      
      if (verifyResume.data && verifyResume.data.resumeData) {
        const rd = verifyResume.data.resumeData;
        console.log('\n✅ VERIFICATION RESULTS:');
        console.log('Name:', rd.name === 'Test User Update' ? '✅' : '❌', rd.name);
        console.log('Email:', rd.email === 'test@example.com' ? '✅' : '❌', rd.email);
        console.log('Phone:', rd.phone === '+1 (555) 999-8888' ? '✅' : '❌', rd.phone);
        console.log('Location:', rd.location === 'Test City, TS' ? '✅' : '❌', rd.location);
        console.log('LinkedIn:', rd.linkedin === 'linkedin.com/in/testuser' ? '✅' : '❌', rd.linkedin);
        console.log('Github:', rd.github === 'github.com/testuser' ? '✅' : '❌', rd.github);
        console.log('Website:', rd.website === 'testuser.com' ? '✅' : '❌', rd.website);
        console.log('Summary:', rd.summary?.includes('test summary') ? '✅' : '❌', rd.summary);
        console.log('Skills:', rd.skills?.length === 4 ? '✅' : '❌', rd.skills);
        
        const allFieldsCorrect = 
          rd.name === 'Test User Update' &&
          rd.phone === '+1 (555) 999-8888' &&
          rd.location === 'Test City, TS' &&
          rd.linkedin === 'linkedin.com/in/testuser' &&
          rd.github === 'github.com/testuser' &&
          rd.website === 'testuser.com' &&
          rd.summary?.includes('test summary') &&
          rd.skills?.length === 4;

        if (allFieldsCorrect) {
          console.log('\n🎉 SUCCESS: All fields persisted correctly!');
        } else {
          console.log('\n❌ FAILURE: Some fields were not persisted correctly');
        }
      } else {
        console.error('❌ Resume data structure is incorrect');
        console.log('Full data:', JSON.stringify(verifyResume.data, null, 2));
      }

    } else {
      console.log('⚠️  No existing resumes found. Creating test resume...');
      
      // Create test resume
      const newResume = await prisma.resume.create({
        data: {
          userId: user.id,
          fileName: 'Test Resume',
          templateId: null,
          data: {
            resumeData: {
              name: 'Test User',
              email: 'test@example.com',
              phone: '+1 (555) 123-4567',
              location: 'Test City, TS',
              summary: 'Test summary',
              skills: ['JavaScript', 'React'],
              experience: [],
              education: [],
              projects: [],
              certifications: []
            }
          },
          sectionOrder: ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'],
          sectionVisibility: {},
          customSections: [],
          customFields: [],
          formatting: {}
        }
      });

      console.log('✅ Created test resume:', newResume.id);
      console.log('📝 Re-run this script to test update');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testResumePersistence();

