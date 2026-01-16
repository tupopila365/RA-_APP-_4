const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

async function testRoadworkAPI() {
  console.log('🔍 Testing Roadwork API Endpoints...\n');

  try {
    // Test 1: Check if backend is running
    console.log('1. Testing backend connectivity...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
      console.log('✅ Backend is running');
    } catch (error) {
      console.log('❌ Backend is not responding');
      console.log('Error:', error.message);
      return;
    }

    // Test 2: Test public roadworks endpoint (no auth required)
    console.log('\n2. Testing public roadworks endpoint...');
    try {
      const publicResponse = await axios.get(`${BASE_URL}/roadworks/public`, { timeout: 10000 });
      console.log('✅ Public roadworks endpoint working');
      console.log('Response format:', {
        success: publicResponse.data.success,
        dataType: Array.isArray(publicResponse.data.data) ? 'array' : typeof publicResponse.data.data,
        count: Array.isArray(publicResponse.data.data) ? publicResponse.data.data.length : 'N/A'
      });
    } catch (error) {
      console.log('❌ Public roadworks endpoint failed');
      console.log('Error:', error.response?.data || error.message);
    }

    // Test 3: Test road-status alias endpoint
    console.log('\n3. Testing road-status alias endpoint...');
    try {
      const aliasResponse = await axios.get(`${BASE_URL}/road-status/public`, { timeout: 10000 });
      console.log('✅ Road-status alias endpoint working');
      console.log('Response format:', {
        success: aliasResponse.data.success,
        dataType: Array.isArray(aliasResponse.data.data) ? 'array' : typeof aliasResponse.data.data,
        count: Array.isArray(aliasResponse.data.data) ? aliasResponse.data.data.length : 'N/A'
      });
    } catch (error) {
      console.log('❌ Road-status alias endpoint failed');
      console.log('Error:', error.response?.data || error.message);
    }

    // Test 4: Test creating a roadwork (will fail without auth, but should show validation)
    console.log('\n4. Testing roadwork creation (without auth - should show validation errors)...');
    try {
      const createData = {
        title: 'Test Roadwork',
        road: 'B1',
        section: 'Windhoek to Okahandja',
        region: 'Khomas',
        status: 'Planned',
        description: 'Test roadwork for API validation'
      };
      
      const createResponse = await axios.post(`${BASE_URL}/road-status`, createData, { timeout: 10000 });
      console.log('❌ Unexpected success - should require authentication');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication required (expected)');
      } else if (error.response?.status === 400) {
        console.log('✅ Validation working (expected error)');
        console.log('Validation errors:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }

    // Test 5: Test database connection by checking if we get any data
    console.log('\n5. Testing database connection...');
    try {
      const dbTestResponse = await axios.get(`${BASE_URL}/roadworks/public?limit=1`, { timeout: 10000 });
      if (dbTestResponse.data.success && Array.isArray(dbTestResponse.data.data)) {
        console.log('✅ Database connection working');
        console.log('Sample data available:', dbTestResponse.data.data.length > 0 ? 'Yes' : 'No');
      } else {
        console.log('⚠️ Database connection unclear - unexpected response format');
      }
    } catch (error) {
      console.log('❌ Database connection issue');
      console.log('Error:', error.response?.data || error.message);
    }

  } catch (error) {
    console.log('❌ General test error:', error.message);
  }
}

// Run the test
testRoadworkAPI().then(() => {
  console.log('\n🏁 API test completed');
}).catch(error => {
  console.log('❌ Test failed:', error.message);
});