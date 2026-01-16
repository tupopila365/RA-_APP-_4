const axios = require('axios');

async function testRoadworkCreation() {
  const BASE_URL = 'http://localhost:5001/api';
  
  console.log('🔍 Testing Roadwork Creation Process...\n');
  
  // First, let's see what data we currently have
  console.log('1. Checking existing roadworks...');
  try {
    const existingResponse = await axios.get(`${BASE_URL}/roadworks/public`);
    console.log('✅ Current roadworks count:', existingResponse.data.data.length);
    if (existingResponse.data.data.length > 0) {
      console.log('   Sample roadwork:', {
        id: existingResponse.data.data[0]._id,
        title: existingResponse.data.data[0].title,
        status: existingResponse.data.data[0].status,
        region: existingResponse.data.data[0].region
      });
    }
  } catch (error) {
    console.log('❌ Failed to get existing roadworks:', error.message);
  }
  
  // Test roadwork creation without authentication (should fail with 401)
  console.log('\n2. Testing roadwork creation without auth...');
  try {
    const testData = {
      title: 'Test Road Maintenance',
      road: 'B1',
      section: 'Windhoek to Okahandja - km 15-25',
      region: 'Khomas',
      status: 'Planned',
      description: 'Routine road maintenance and pothole repairs',
      priority: 'medium',
      published: false
    };
    
    const createResponse = await axios.post(`${BASE_URL}/road-status`, testData, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    console.log(`Status: ${createResponse.status}`);
    console.log('Response:', createResponse.data);
    
    if (createResponse.status === 401) {
      console.log('✅ Authentication required (expected)');
    } else if (createResponse.status === 400) {
      console.log('⚠️ Validation error (check required fields)');
    } else if (createResponse.status === 201) {
      console.log('❌ Unexpected success - should require auth');
    } else {
      console.log('❌ Unexpected status code');
    }
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
  
  // Test with missing required fields
  console.log('\n3. Testing validation with missing fields...');
  try {
    const invalidData = {
      title: 'Test Road Maintenance'
      // Missing required fields: road, section, region
    };
    
    const validationResponse = await axios.post(`${BASE_URL}/road-status`, invalidData, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'Authorization': 'Bearer fake-token-for-testing'
      }
    });
    
    console.log(`Status: ${validationResponse.status}`);
    console.log('Response:', validationResponse.data);
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
  
  // Test coordinate validation
  console.log('\n4. Testing coordinate validation...');
  try {
    const coordData = {
      title: 'Test Road with Coordinates',
      road: 'B1',
      section: 'Test section',
      region: 'Khomas',
      status: 'Closed',
      coordinates: {
        latitude: -22.5609, // Windhoek coordinates (valid)
        longitude: 17.0658
      }
    };
    
    const coordResponse = await axios.post(`${BASE_URL}/road-status`, coordData, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'Authorization': 'Bearer fake-token-for-testing'
      }
    });
    
    console.log(`Status: ${coordResponse.status}`);
    console.log('Response:', coordResponse.data);
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
  
  // Test invalid coordinates (outside Namibia)
  console.log('\n5. Testing invalid coordinates...');
  try {
    const invalidCoordData = {
      title: 'Test Road with Invalid Coordinates',
      road: 'B1',
      section: 'Test section',
      region: 'Khomas',
      status: 'Closed',
      coordinates: {
        latitude: 40.7128, // New York coordinates (invalid for Namibia)
        longitude: -74.0060
      }
    };
    
    const invalidCoordResponse = await axios.post(`${BASE_URL}/road-status`, invalidCoordData, {
      timeout: 10000,
      validateStatus: () => true,
      headers: {
        'Authorization': 'Bearer fake-token-for-testing'
      }
    });
    
    console.log(`Status: ${invalidCoordResponse.status}`);
    console.log('Response:', invalidCoordResponse.data);
    
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

testRoadworkCreation().then(() => {
  console.log('\n🏁 Roadwork creation test completed');
}).catch(error => {
  console.log('❌ Test failed:', error.message);
});