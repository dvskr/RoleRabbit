/**
 * Test with full structure to find the issue
 */

const API_BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'testresume@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestResume123!';

async function testFull() {
  console.log('🧪 Testing Full Resume Structure...\n');
  
  let authCookies = '';
  
  try {
    // Login
    const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      credentials: 'include'
    });
    
    if (!loginRes.ok) {
      console.error('Login failed');
      return;
    }
    
    const setCookieHeaders = loginRes.headers.getSetCookie();
    authCookies = setCookieHeaders ? setCookieHeaders.join('; ') : '';
    
    // Test with full structure matching what frontend sends
    // IMPORTANT: sectionOrder should be at the top level, not inside data
    const fullData = {
      fileName: 'Full Test Resume',
      data: {
        resumeData: {
          name: 'Test User',
          title: 'Software Engineer',
          email: 'test@example.com',
          phone: '+1-234-567-8900',
          location: 'San Francisco, CA',
          summary: 'Test summary',
          skills: ['JavaScript', 'React'],
          experience: [{
            id: '1',
            company: 'Test Company',
            position: 'Engineer',
            period: '2020-01',
            endPeriod: '2024-12',
            location: 'SF',
            bullets: ['Did stuff']
          }],
          education: [{
            id: '1',
            degree: 'BS',
            school: 'University',
            startDate: '2016-09',
            endDate: '2020-05',
            field: 'CS'
          }],
          projects: [],
          certifications: []
        },
        // sectionOrder is extracted separately, but can be in data for frontend compatibility
        sectionOrder: ['summary', 'skills', 'experience', 'education'],
        sectionVisibility: {
          summary: true,
          skills: true,
          experience: true,
          education: true
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
    
    console.log('Creating resume with full structure...');
    const res = await fetch(`${API_BASE_URL}/api/resumes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': authCookies },
      credentials: 'include',
      body: JSON.stringify(fullData)
    });
    
    const result = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (res.ok) {
      console.log('\n✅ SUCCESS! Full resume created.');
      console.log('Resume ID:', result.resume?.id);
    } else {
      console.log('\n❌ FAILED');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFull();

