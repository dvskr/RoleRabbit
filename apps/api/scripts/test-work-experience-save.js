const fetch = require('node-fetch');

// Test script to send mock work experience data to the API
async function testWorkExperienceSave() {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  
  // First, we need to get a valid auth token
  // For testing, you'll need to provide your actual credentials
  console.log('🔍 Testing Work Experience Save API\n');
  console.log('Note: This requires authentication. Make sure you\'re logged in.');
  console.log('Or update this script with your auth token.\n');
  
  // Mock work experience data
  const mockWorkExperience = {
    workExperiences: [
      {
        company: 'Test Company Inc',
        role: 'Senior Software Engineer',
        location: 'San Francisco, CA',
        startDate: '2020-01-01',
        endDate: null,
        isCurrent: true,
        description: 'Led development of critical features',
        projectType: 'Full-time'
      },
      {
        company: 'Previous Company',
        role: 'Software Engineer',
        location: 'New York, NY',
        startDate: '2018-06-01',
        endDate: '2019-12-31',
        isCurrent: false,
        description: 'Developed web applications',
        projectType: 'Full-time'
      }
    ]
  };
  
  console.log('📤 Sending mock data:');
  console.log(JSON.stringify(mockWorkExperience, null, 2));
  console.log('\n');
  
  try {
    // Try to get auth token from cookies or use environment variable
    const authToken = process.env.AUTH_TOKEN || null;
    
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (authToken) {
      headers['Cookie'] = `auth_token=${authToken}`;
    }
    
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify(mockWorkExperience),
      credentials: 'include'
    });
    
    console.log('📥 Response Status:', response.status, response.statusText);
    
    const responseData = await response.json();
    console.log('📥 Response Data:');
    console.log(JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Success! Check if work experiences were saved in the database.');
      
      // Try to fetch the profile to verify
      console.log('\n🔍 Fetching profile to verify...');
      const getResponse = await fetch(`${API_URL}/api/users/profile`, {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      
      if (getResponse.ok) {
        const profileData = await getResponse.json();
        console.log('📋 Work Experiences in profile:');
        console.log(JSON.stringify(profileData.user?.workExperiences || [], null, 2));
        console.log('\nCount:', profileData.user?.workExperiences?.length || 0);
      }
    } else {
      console.log('\n❌ Failed to save work experience');
      console.log('Error:', responseData.error || responseData.message);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testWorkExperienceSave();

