const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Test the API endpoint with mock data
async function testAPIEndpoint() {
  const API_URL = process.env.API_URL || 'http://localhost:3001';
  
  console.log('🔍 Testing API Endpoint with Mock Data\n');
  
  try {
    // Get a user and create a session/token for testing
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }
    
    console.log('✅ Found user:', user.email);
    console.log('   User ID:', user.id);
    
    // Create a session for testing (or use existing auth mechanism)
    // For now, we'll test by logging in first or using existing auth
    
    // Mock work experience data (exactly as frontend would send)
    const mockData = {
      workExperiences: [
        {
          company: 'API Test Company',
          role: 'Test Engineer',
          location: 'Remote',
          startDate: '2023-01-01',
          endDate: null,
          isCurrent: true,
          description: 'Testing the API endpoint',
          projectType: 'Full-time'
        }
      ],
      // Include other fields that might be sent
      firstName: user.profile?.firstName || 'Test',
      lastName: user.profile?.lastName || 'User'
    };
    
    console.log('📤 Sending to API:', `${API_URL}/api/users/profile`);
    console.log('📤 Payload:');
    console.log(JSON.stringify(mockData, null, 2));
    console.log('\n');
    
    // Note: This requires authentication
    // In a real scenario, you'd need to log in first and get the auth token
    console.log('⚠️  Note: This requires authentication.');
    console.log('   You need to be logged in or provide auth token.\n');
    
    // Try without auth first to see what error we get
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockData),
      credentials: 'include'
    });
    
    console.log('📥 Response Status:', response.status, response.statusText);
    
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = { raw: responseText };
    }
    
    console.log('📥 Response:');
    console.log(JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('\n✅ API call successful!');
      
      // Verify data was saved
      const profile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
        include: {
          workExperiences: {
            orderBy: { startDate: 'desc' }
          }
        }
      });
      
      console.log('\n📋 Work experiences in database:');
      console.log('Count:', profile?.workExperiences?.length || 0);
      if (profile?.workExperiences) {
        profile.workExperiences.forEach((exp, i) => {
          console.log(`  ${i + 1}. ${exp.role} at ${exp.company}`);
        });
      }
    } else {
      console.log('\n❌ API call failed');
      if (response.status === 401) {
        console.log('   Authentication required. Please log in first.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Cannot connect to API server. Is it running on port 3001?');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testAPIEndpoint();

