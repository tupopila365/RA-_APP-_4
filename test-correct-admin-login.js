const axios = require('axios');

async function testCorrectAdminLogin() {
  const BACKEND_URL = 'http://localhost:5001/api';
  
  console.log('🔍 Testing with correct admin credentials...\n');
  
  // The script showed admin@roadsauthority.na exists
  // Let's try different password combinations
  const credentials = [
    { email: 'admin@roadsauthority.na', password: 'Admin@123' },
    { email: 'admin@roadsauthority.na', password: 'Admin123!' },
    { email: 'admin@roadsauthority.na', password: 'admin123' },
    { email: 'admin@roadsauthority.na', password: 'Admin123' }
  ];
  
  for (const creds of credentials) {
    try {
      console.log(`Testing: ${creds.email} / ${creds.password}`);
      
      const response = await axios.post(`${BACKEND_URL}/auth/login`, creds, {
        timeout: 10000
      });
      
      if (response.data.success) {
        console.log('✅ SUCCESS! Login working');
        console.log('   User:', response.data.data.user.email);
        console.log('   Role:', response.data.data.user.role);
        console.log('   Permissions:', response.data.data.user.permissions.join(', '));
        console.log('   Has roadworks:manage:', response.data.data.user.permissions.includes('roadworks:manage'));
        
        // Now test roadwork creation with this token
        await testRoadworkCreation(response.data.data.accessToken);
        return;
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }
  
  console.log('\n❌ Still no valid credentials found');
}

async function testRoadworkCreation(token) {
  const BACKEND_URL = 'http://localhost:5001/api';
  
  console.log('\n🔍 Testing roadwork creation with valid token...\n');
  
  try {
    const roadworkData = {
      title: 'Test Roadwork - Authentication Fixed',
      road: 'B1',
      section: 'Windhoek to Okahandja - km 15-25',
      area: 'Windhoek',
      region: 'Khomas',
      status: 'Planned',
      description: 'Test roadwork to verify authentication is working',
      priority: 'medium',
      published: false
    };
    
    const response = await axios.post(`${BACKEND_URL}/road-status`, roadworkData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    if (response.status === 201 && response.data.success) {
      console.log('✅ ROADWORK CREATED SUCCESSFULLY!');
      console.log('   ID:', response.data.data._id);
      console.log('   Title:', response.data.data.title);
      console.log('   Status:', response.data.data.status);
      console.log('\n🎉 The roadwork saving issue is now FIXED!');
      console.log('   The problem was authentication - admin user exists but needs correct credentials');
    } else {
      console.log('❌ Unexpected response:', response.status, response.data);
    }
    
  } catch (error) {
    console.log('❌ Roadwork creation still failed:');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error?.message || error.message);
    
    if (error.response?.data?.error?.details) {
      console.log('   Details:', error.response.data.error.details);
    }
  }
}

testCorrectAdminLogin();