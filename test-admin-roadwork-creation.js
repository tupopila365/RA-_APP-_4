const axios = require('axios');

async function testAdminRoadworkCreation() {
  const BACKEND_URL = 'http://localhost:5001/api';
  
  console.log('🔍 Testing Admin Panel Roadwork Creation Process...\n');
  
  // Step 1: Test login to get authentication token
  console.log('1. Testing admin login...');
  let authToken = null;
  
  try {
    const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
      email: 'admin@roadsauthority.gov.na',
      password: 'admin123'
    }, { timeout: 10000 });
    
    if (loginResponse.data.success && loginResponse.data.data.accessToken) {
      authToken = loginResponse.data.data.accessToken;
      console.log('✅ Login successful');
      console.log('   User role:', loginResponse.data.data.user.role);
      console.log('   Permissions:', loginResponse.data.data.user.permissions.slice(0, 3).join(', ') + '...');
    } else {
      console.log('❌ Login failed - unexpected response format');
      return;
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data?.error?.message || error.message);
    console.log('   This might be why roadwork saving is failing - authentication issue');
    return;
  }
  
  // Step 2: Test roadwork creation with valid authentication
  console.log('\n2. Testing roadwork creation with authentication...');
  
  try {
    const roadworkData = {
      title: 'B1 Highway Maintenance - Test',
      road: 'B1',
      section: 'Windhoek to Okahandja - km 15-25',
      area: 'Windhoek',
      region: 'Khomas',
      status: 'Planned',
      description: 'Routine road maintenance including pothole repairs and road marking renewal',
      startDate: '2026-02-01',
      expectedCompletion: '2026-02-15',
      alternativeRoute: 'Use C28 via Dordabis',
      coordinates: {
        latitude: -22.5609,
        longitude: 17.0658
      },
      affectedLanes: 'Both lanes',
      contractor: 'Namibian Road Construction Ltd',
      estimatedDuration: '2 weeks',
      priority: 'medium',
      published: false
    };
    
    const createResponse = await axios.post(`${BACKEND_URL}/road-status`, roadworkData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    if (createResponse.status === 201 && createResponse.data.success) {
      console.log('✅ Roadwork created successfully!');
      console.log('   ID:', createResponse.data.data._id);
      console.log('   Title:', createResponse.data.data.title);
      console.log('   Status:', createResponse.data.data.status);
      console.log('   Region:', createResponse.data.data.region);
    } else {
      console.log('❌ Unexpected response:', createResponse.status, createResponse.data);
    }
    
  } catch (error) {
    console.log('❌ Roadwork creation failed');
    console.log('   Status:', error.response?.status);
    console.log('   Error:', error.response?.data?.error?.message || error.message);
    
    if (error.response?.data?.error?.details) {
      console.log('   Details:', error.response.data.error.details);
    }
    
    // This is likely the root cause of the roadwork saving failure
    if (error.response?.status === 400) {
      console.log('\n🔍 VALIDATION ERROR DETECTED:');
      console.log('   This suggests the form data is not meeting backend validation requirements');
    } else if (error.response?.status === 401) {
      console.log('\n🔍 AUTHENTICATION ERROR DETECTED:');
      console.log('   The user is not properly authenticated or lacks permissions');
    } else if (error.response?.status === 403) {
      console.log('\n🔍 PERMISSION ERROR DETECTED:');
      console.log('   The user lacks the required "roadworks:manage" permission');
    }
  }
  
  // Step 3: Test with missing required fields (common validation issue)
  console.log('\n3. Testing validation with missing required fields...');
  
  try {
    const invalidData = {
      title: 'Test Road',
      road: 'B1'
      // Missing: section, region (required fields)
    };
    
    const validationResponse = await axios.post(`${BACKEND_URL}/road-status`, invalidData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: () => true
    });
    
    console.log('   Status:', validationResponse.status);
    if (validationResponse.status === 400) {
      console.log('✅ Validation working correctly');
      console.log('   Errors:', validationResponse.data.error?.message || validationResponse.data.message);
    }
    
  } catch (error) {
    console.log('❌ Validation test failed:', error.message);
  }
  
  // Step 4: Test coordinate validation (common issue)
  console.log('\n4. Testing coordinate validation...');
  
  try {
    const coordData = {
      title: 'Test Road with Invalid Coordinates',
      road: 'B1',
      section: 'Test section',
      region: 'Khomas',
      status: 'Closed',
      coordinates: {
        latitude: 50.0, // Outside Namibia bounds
        longitude: 10.0
      }
    };
    
    const coordResponse = await axios.post(`${BACKEND_URL}/road-status`, coordData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000,
      validateStatus: () => true
    });
    
    console.log('   Status:', coordResponse.status);
    if (coordResponse.status === 400) {
      console.log('✅ Coordinate validation working');
      console.log('   Error:', coordResponse.data.error?.message || coordResponse.data.message);
    }
    
  } catch (error) {
    console.log('❌ Coordinate validation test failed:', error.message);
  }
  
  // Step 5: Verify the roadwork was saved by checking public endpoint
  console.log('\n5. Verifying roadwork appears in public list...');
  
  try {
    const publicResponse = await axios.get(`${BACKEND_URL}/roadworks/public`);
    const roadworks = publicResponse.data.data;
    const testRoadwork = roadworks.find(r => r.title.includes('B1 Highway Maintenance - Test'));
    
    if (testRoadwork) {
      console.log('✅ Roadwork appears in public list');
      console.log('   Published status:', testRoadwork.published);
    } else {
      console.log('⚠️ Roadwork not found in public list (might be unpublished)');
    }
    
  } catch (error) {
    console.log('❌ Failed to verify roadwork in public list:', error.message);
  }
}

testAdminRoadworkCreation().then(() => {
  console.log('\n🏁 Admin roadwork creation test completed');
  console.log('\nIf roadwork creation failed above, that explains why "Failed to save roadwork" occurs.');
  console.log('The most common causes are:');
  console.log('1. Authentication/permission issues');
  console.log('2. Missing required fields (title, road, section, region)');
  console.log('3. Invalid coordinates (outside Namibia bounds)');
  console.log('4. Invalid status or priority values');
  console.log('5. Backend validation middleware rejecting the data');
}).catch(error => {
  console.log('❌ Test failed:', error.message);
});