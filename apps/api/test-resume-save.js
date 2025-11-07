/**
 * Test script to login, create a resume, and verify it's saved
 * Run with: node test-resume-save.js
 */

const API_BASE_URL = 'http://localhost:3001';

// Test credentials - UPDATE THESE with your actual login credentials
// Or set via environment variables: TEST_EMAIL and TEST_PASSWORD
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com'; // CHANGE THIS
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test123!'; // CHANGE THIS

async function testResumeSave() {
  console.log('🧪 Testing Resume Save Flow...\n');
  
  let authCookies = '';
  
  try {
    // Step 1: Login to get auth token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      }),
      credentials: 'include'
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('❌ Login failed:', loginData);
      console.log('\n💡 Please update TEST_EMAIL and TEST_PASSWORD in this script with your actual credentials.');
      return;
    }
    
    // Extract cookies from response
    const setCookieHeaders = loginResponse.headers.getSetCookie();
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      authCookies = setCookieHeaders.join('; ');
      console.log('✅ Login successful!');
      console.log('   Cookies received:', setCookieHeaders.length, 'cookies');
    } else {
      console.log('⚠️  Login successful but no cookies received');
    }
    
    // Step 2: Create a test resume
    console.log('\n2️⃣ Creating test resume...');
    
    const testResumeData = {
      fileName: 'Test Resume ' + new Date().toISOString(),
      templateId: null,
      data: {
        resumeData: {
          name: 'Test User',
          title: 'Software Engineer',
          email: 'test@example.com',
          phone: '+1-234-567-8900',
          location: 'San Francisco, CA',
          summary: 'This is a test resume created by the test script to verify the save functionality.',
          skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
          experience: [
            {
              id: '1', // Ensure ID is string, not number
              company: 'Test Company',
              position: 'Senior Software Engineer',
              period: '2020-01',
              endPeriod: '2024-12',
              location: 'San Francisco, CA',
              bullets: [
                'Led development of microservices architecture',
                'Improved application performance by 40%',
                'Mentored junior developers'
              ]
            }
          ],
          education: [
            {
              id: '1', // Ensure ID is string, not number
              degree: 'Bachelor of Science',
              school: 'Test University',
              startDate: '2016-09',
              endDate: '2020-05',
              field: 'Computer Science'
            }
          ],
          projects: [],
          certifications: []
        },
        sectionOrder: ['summary', 'skills', 'experience', 'education', 'projects', 'certifications'],
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
      }
    };
    
    console.log('   Payload:', JSON.stringify({
      fileName: testResumeData.fileName,
      hasData: !!testResumeData.data,
      dataKeys: Object.keys(testResumeData.data)
    }, null, 2));
    
    const createResponse = await fetch(`${API_BASE_URL}/api/resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookies // Send cookies from login
      },
      credentials: 'include',
      body: JSON.stringify(testResumeData)
    });
    
    const createData = await createResponse.json();
    
    console.log('   Status:', createResponse.status);
    console.log('   Response:', JSON.stringify(createData, null, 2));
    
    if (createResponse.ok && createData.success) {
      console.log('\n✅ Resume created successfully!');
      console.log('   Resume ID:', createData.resume?.id);
      console.log('   File Name:', createData.resume?.fileName);
      console.log('   Last Updated:', createData.resume?.lastUpdated);
      
      // Step 3: Verify it's in the database
      console.log('\n3️⃣ Verifying in database...');
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      try {
        const savedResume = await prisma.resume.findUnique({
          where: { id: createData.resume.id },
          select: {
            id: true,
            fileName: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
            data: true
          }
        });
        
        if (savedResume) {
          console.log('✅ Resume found in database!');
          console.log('   ID:', savedResume.id);
          console.log('   File Name:', savedResume.fileName);
          console.log('   User ID:', savedResume.userId);
          console.log('   Created:', savedResume.createdAt);
          console.log('   Updated:', savedResume.updatedAt);
          console.log('   Has Data:', !!savedResume.data);
          if (savedResume.data?.resumeData) {
            console.log('   Name:', savedResume.data.resumeData.name);
            console.log('   Email:', savedResume.data.resumeData.email);
          }
        } else {
          console.log('❌ Resume NOT found in database!');
        }
        
        await prisma.$disconnect();
      } catch (dbError) {
        console.error('❌ Database check failed:', dbError.message);
        await prisma.$disconnect();
      }
      
    } else {
      console.error('\n❌ Failed to create resume');
      if (createResponse.status === 401) {
        console.error('   Authentication failed - cookies may not be working correctly');
      }
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Check if credentials are set
if (TEST_EMAIL === 'test@example.com' || TEST_PASSWORD === 'Test123!') {
  console.log('⚠️  WARNING: Using default test credentials!');
  console.log('   Please update TEST_EMAIL and TEST_PASSWORD in this script.');
  console.log('   Or pass them as environment variables:\n');
  console.log('   TEST_EMAIL=your@email.com TEST_PASSWORD=YourPass123! node test-resume-save.js\n');
}

testResumeSave();

