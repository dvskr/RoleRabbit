/**
 * Minimal test to create a resume with the simplest possible data
 */

const API_BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'testresume@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestResume123!';

async function testMinimal() {
  console.log('🧪 Testing Minimal Resume Creation...\n');
  
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
    const authCookies = setCookieHeaders ? setCookieHeaders.join('; ') : '';
    
    // Try creating with absolute minimal data
    const minimalData = {
      fileName: 'Minimal Test',
      data: {
        resumeData: {}
      }
    };
    
    console.log('Creating with minimal data:', JSON.stringify(minimalData, null, 2));
    
    const createRes = await fetch(`${API_BASE_URL}/api/resumes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': authCookies
      },
      credentials: 'include',
      body: JSON.stringify(minimalData)
    });
    
    const result = await createRes.json();
    console.log('Status:', createRes.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (createRes.ok) {
      console.log('\n✅ SUCCESS! Minimal resume created.');
      console.log('Resume ID:', result.resume?.id);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMinimal();

