/**
 * Capture API server error to file
 */

const fs = require('fs');
const API_BASE_URL = 'http://localhost:3001';
const TEST_EMAIL = process.env.TEST_EMAIL || 'testresume@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'TestResume123!';

async function captureError() {
  try {
    // Login
    const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
      credentials: 'include'
    });
    
    const setCookieHeaders = loginRes.headers.getSetCookie();
    const authCookies = setCookieHeaders ? setCookieHeaders.join('; ') : '';
    
    // Full payload
    const fullData = {
      fileName: 'Error Test',
      data: {
        resumeData: {
          name: 'Test',
          email: 'test@example.com',
          skills: ['JS'],
          experience: [{ id: '1', company: 'Test', position: 'Eng', period: '2020-01', endPeriod: '2024-12', location: 'SF', bullets: ['Did stuff'] }],
          education: [{ id: '1', degree: 'BS', school: 'Uni', startDate: '2016-09', endDate: '2020-05', field: 'CS' }]
        },
        sectionOrder: ['summary', 'skills'],
        sectionVisibility: { summary: true },
        customSections: [],
        customFields: [],
        formatting: { fontFamily: 'arial', fontSize: 'ats11pt' }
      }
    };
    
    console.log('Sending request...');
    const res = await fetch(`${API_BASE_URL}/api/resumes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Cookie': authCookies },
      credentials: 'include',
      body: JSON.stringify(fullData)
    });
    
    const result = await res.json();
    
    // Write to file
    fs.writeFileSync('error-output.json', JSON.stringify({
      status: res.status,
      response: result,
      payload: fullData
    }, null, 2));
    
    console.log('Error captured in error-output.json');
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    fs.writeFileSync('error-output.json', JSON.stringify({
      error: error.message,
      stack: error.stack
    }, null, 2));
    console.error('Error:', error.message);
  }
}

captureError();

