/**
 * Test Road Status Validation System
 * 
 * Tests all validation rules for road status creation/update
 */

const axios = require('axios');

const API_URL = 'http://localhost:5001/api';
let authToken = '';

// Test admin credentials
const ADMIN_EMAIL = 'admin@ra.gov.na';
const ADMIN_PASSWORD = 'Admin@123';

/**
 * Login and get auth token
 */
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    authToken = response.data.data.token;
    console.log('✅ Logged in successfully');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test: Create roadwork with coordinates outside Namibia
 */
async function testCoordinatesOutsideNamibia() {
  console.log('\n📍 Test: Coordinates Outside Namibia');
  
  try {
    await axios.post(`${API_URL}/roadworks`, {
      title: 'Test Roadwork',
      road: 'B1',
      section: 'Test Section',
      area: 'Windhoek',
      region: 'Khomas',
      status: 'Closed',
      coordinates: {
        latitude: -30.0, // Outside Namibia (too far south)
        longitude: 17.0
      }
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ FAILED: Should have rejected coordinates outside Namibia');
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.error?.details?.includes('outside Namibia')) {
      console.log('✅ PASSED: Correctly rejected coordinates outside Namibia');
      console.log('   Error:', error.response.data.error.details);
    } else {
      console.log('❌ FAILED: Wrong error response');
      console.log('   Error:', error.response?.data || error.message);
    }
  }
}

/**
 * Test: Create closed road without coordinates
 */
async function testClosedRoadWithoutCoordinates() {
  console.log('\n📍 Test: Closed Road Without Coordinates');
  
  try {
    await axios.post(`${API_URL}/roadworks`, {
      title: 'Test Closed Road',
      road: 'B1',
      section: 'Test Section',
      area: 'Windhoek',
      region: 'Khomas',
      status: 'Closed'
      // No coordinates provided
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ FAILED: Should have required coordinates for Closed status');
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.error?.details?.includes('required')) {
      console.log('✅ PASSED: Correctly required coordinates for Closed status');
      console.log('   Error:', error.response.data.error.details);
    } else {
      console.log('❌ FAILED: Wrong error response');
      console.log('   Error:', error.response?.data || error.message);
    }
  }
}

/**
 * Test: Invalid date logic (start > completion)
 */
async function testInvalidDateLogic() {
  console.log('\n📅 Test: Invalid Date Logic (Start > Completion)');
  
  try {
    await axios.post(`${API_URL}/roadworks`, {
      title: 'Test Date Logic',
      road: 'B1',
      section: 'Test Section',
      area: 'Windhoek',
      region: 'Khomas',
      status: 'Planned',
      startDate: '2025-12-31',
      expectedCompletion: '2025-01-01' // Before start date
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ FAILED: Should have rejected invalid date logic');
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.error?.details?.includes('after')) {
      console.log('✅ PASSED: Correctly rejected invalid date logic');
      console.log('   Error:', error.response.data.error.details);
    } else {
      console.log('❌ FAILED: Wrong error response');
      console.log('   Error:', error.response?.data || error.message);
    }
  }
}

/**
 * Test: Planned job with past start date cannot be published
 */
async function testPlannedPastDatePublished() {
  console.log('\n📅 Test: Planned Job with Past Start Date Published');
  
  try {
    await axios.post(`${API_URL}/roadworks`, {
      title: 'Test Past Planned',
      road: 'B1',
      section: 'Test Section',
      area: 'Windhoek',
      region: 'Khomas',
      status: 'Planned',
      startDate: '2020-01-01', // Past date
      published: true
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ FAILED: Should have rejected published planned job with past date');
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.error?.details?.includes('past')) {
      console.log('✅ PASSED: Correctly rejected published planned job with past date');
      console.log('   Error:', error.response.data.error.details);
    } else {
      console.log('❌ FAILED: Wrong error response');
      console.log('   Error:', error.response?.data || error.message);
    }
  }
}

/**
 * Test: Valid roadwork creation with change history
 */
async function testValidRoadworkCreation() {
  console.log('\n✅ Test: Valid Roadwork Creation');
  
  try {
    const response = await axios.post(`${API_URL}/roadworks`, {
      title: 'Test Valid Roadwork',
      road: 'B1',
      section: 'Windhoek to Okahandja',
      area: 'Windhoek',
      region: 'Khomas',
      status: 'Closed',
      description: 'Test roadwork for validation',
      coordinates: {
        latitude: -22.5597, // Valid Windhoek coordinates
        longitude: 17.0832
      },
      startDate: '2025-02-01',
      expectedCompletion: '2025-03-01',
      published: true
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const roadwork = response.data.data;
    console.log('✅ PASSED: Successfully created valid roadwork');
    console.log('   ID:', roadwork._id);
    console.log('   Created by:', roadwork.createdByEmail);
    console.log('   Change history entries:', roadwork.changeHistory?.length || 0);
    
    if (roadwork.changeHistory && roadwork.changeHistory.length > 0) {
      console.log('   First entry:', {
        action: roadwork.changeHistory[0].action,
        userEmail: roadwork.changeHistory[0].userEmail,
        changes: roadwork.changeHistory[0].changes.length
      });
    }
    
    return roadwork._id;
  } catch (error) {
    console.log('❌ FAILED: Should have created valid roadwork');
    console.log('   Error:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Test: Update roadwork and verify change history
 */
async function testRoadworkUpdateHistory(roadworkId) {
  if (!roadworkId) {
    console.log('\n⏭️  Skipping update test (no roadwork ID)');
    return;
  }
  
  console.log('\n📝 Test: Update Roadwork and Verify Change History');
  
  try {
    const response = await axios.put(`${API_URL}/roadworks/${roadworkId}`, {
      status: 'Ongoing',
      priority: 'high',
      contractor: 'Test Contractor Ltd'
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    const roadwork = response.data.data;
    console.log('✅ PASSED: Successfully updated roadwork');
    console.log('   Updated by:', roadwork.updatedByEmail);
    console.log('   Change history entries:', roadwork.changeHistory?.length || 0);
    
    if (roadwork.changeHistory && roadwork.changeHistory.length > 1) {
      const latestChange = roadwork.changeHistory[roadwork.changeHistory.length - 1];
      console.log('   Latest change:', {
        action: latestChange.action,
        userEmail: latestChange.userEmail,
        changedFields: latestChange.changes.map(c => c.field).join(', ')
      });
      
      // Verify status change was tracked
      const statusChange = latestChange.changes.find(c => c.field === 'status');
      if (statusChange) {
        console.log('   Status change tracked:', {
          from: statusChange.oldValue,
          to: statusChange.newValue
        });
      }
    }
    
    // Clean up - delete test roadwork
    await axios.delete(`${API_URL}/roadworks/${roadworkId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('   🗑️  Test roadwork deleted');
    
  } catch (error) {
    console.log('❌ FAILED: Update or history tracking failed');
    console.log('   Error:', error.response?.data || error.message);
  }
}

/**
 * Test: Coordinates far from selected region
 */
async function testCoordinatesFarFromRegion() {
  console.log('\n📍 Test: Coordinates Far From Selected Region');
  
  try {
    await axios.post(`${API_URL}/roadworks`, {
      title: 'Test Region Mismatch',
      road: 'B1',
      section: 'Test Section',
      area: 'Windhoek',
      region: 'Khomas', // Khomas region
      status: 'Closed',
      coordinates: {
        latitude: -17.8, // Far north (Zambezi region coordinates)
        longitude: 24.3
      }
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('❌ FAILED: Should have rejected coordinates far from region');
  } catch (error) {
    if (error.response?.status === 400 && 
        error.response?.data?.error?.details?.includes('region')) {
      console.log('✅ PASSED: Correctly rejected coordinates far from region');
      console.log('   Error:', error.response.data.error.details);
    } else {
      console.log('❌ FAILED: Wrong error response');
      console.log('   Error:', error.response?.data || error.message);
    }
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🧪 Road Status Validation System Tests');
  console.log('=====================================\n');
  
  // Login first
  const loggedIn = await login();
  if (!loggedIn) {
    console.log('\n❌ Cannot run tests without authentication');
    return;
  }
  
  // Run validation tests
  await testCoordinatesOutsideNamibia();
  await testClosedRoadWithoutCoordinates();
  await testInvalidDateLogic();
  await testPlannedPastDatePublished();
  await testCoordinatesFarFromRegion();
  
  // Run creation and update tests
  const roadworkId = await testValidRoadworkCreation();
  await testRoadworkUpdateHistory(roadworkId);
  
  console.log('\n=====================================');
  console.log('🏁 All tests completed');
}

// Run tests
runAllTests().catch(console.error);
