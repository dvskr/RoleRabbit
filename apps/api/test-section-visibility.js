/**
 * Test sectionVisibility and formatting fields
 */

const API_BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'testresume@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestResume123!';

async function testFields() {
  let authCookies = '';
  
  try {
    // Login
    const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      credentials: 'include'
    });
    
    const setCookieHeaders = loginRes.headers.getSetCookie();
    authCookies = setCookieHeaders ? setCookieHeaders.join('; ') : '';
    
    // Test with sectionVisibility
    console.log('Test 1: With sectionVisibility...');
    let testData = {
      fileName: 'Test Section Visibility',
      data: {
        resumeData: { name: 'Test' },
        sectionVisibility: { summary: true, skills: true }
      }
    };
    
    let res = await fetch(`${API_BASE_URL}/api/resumes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': authCookies },
      credentials: 'include',
      body: JSON.stringify(testData)
    });
    
    if (res.ok) {
      console.log('✅ sectionVisibility works\n');
      
      // Test with formatting
      console.log('Test 2: With formatting...');
      testData.data.formatting = {
        fontFamily: 'arial',
        fontSize: 'ats11pt'
      };
      
      res = await fetch(`${API_BASE_URL}/api/resumes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Cookie': authCookies },
        credentials: 'include',
        body: JSON.stringify(testData)
      });
      
      if (res.ok) {
        console.log('✅ formatting works\n');
        console.log('✅ Both fields work individually');
      } else {
        const error = await res.json();
        console.error('❌ formatting FAILED:', error);
      }
    } else {
      const error = await res.json();
      console.error('❌ sectionVisibility FAILED:', error);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFields();

