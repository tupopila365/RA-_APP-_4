/**
 * Test script to check if locations are being saved and retrieved properly
 * Run this in Node.js or browser console
 */

// Configuration - update these URLs based on your setup
const ADMIN_API_BASE = 'http://localhost:3001/api'; // Admin backend
const MOBILE_API_BASE = 'http://localhost:3001/api'; // Mobile app API (usually same)

// Test data
const testLocation = {
  name: 'Test NATIS Office Windhoek',
  address: '123 Independence Avenue, Windhoek',
  region: 'Khomas',
  coordinates: {
    latitude: -22.5609,
    longitude: 17.0658
  },
  contactNumber: '+264 61 123456',
  email: 'test@natis.gov.na',
  services: ['Vehicle Registration', 'Driver\'s License Renewal'],
  operatingHours: {
    weekdays: {
      open: '08:00',
      close: '17:00'
    }
  }
};

async function testLocationsAPI() {
  console.log('🔍 Testing Locations API...');
  
  try {
    // Test 1: Get existing locations (public endpoint)
    console.log('\n📋 Test 1: Fetching existing locations...');
    const listResponse = await fetch(`${MOBILE_API_BASE}/locations`);
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log('✅ Locations retrieved successfully');
      console.log(`📊 Found ${listData.data.locations.length} locations`);
      
      if (listData.data.locations.length > 0) {
        console.log('📍 Sample location:', listData.data.locations[0]);
      } else {
        console.log('⚠️ No locations found in database');
      }
    } else {
      console.error('❌ Failed to fetch locations:', listResponse.status, listResponse.statusText);
      const errorData = await listResponse.text();
      console.error('Error details:', errorData);
    }
    
    // Test 2: Check if we can create a location (requires auth)
    console.log('\n🔐 Test 2: Testing location creation (requires admin auth)...');
    console.log('Note: This will likely fail without proper authentication');
    
    const createResponse = await fetch(`${ADMIN_API_BASE}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real scenario, you'd need to add Authorization header
      },
      body: JSON.stringify(testLocation)
    });
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log('✅ Location created successfully:', createData.data.location.id);
    } else {
      console.log('⚠️ Location creation failed (expected without auth):', createResponse.status);
      if (createResponse.status === 401) {
        console.log('💡 This is expected - creation requires admin authentication');
      }
    }
    
    // Test 3: Check API connectivity
    console.log('\n🌐 Test 3: Checking API connectivity...');
    
    try {
      const healthResponse = await fetch(`${MOBILE_API_BASE}/health`);
      if (healthResponse.ok) {
        console.log('✅ API server is responding');
      } else {
        console.log('⚠️ API health check failed');
      }
    } catch (error) {
      console.log('❌ Cannot connect to API server');
      console.log('🔧 Possible issues:');
      console.log('  - Backend server is not running');
      console.log('  - Wrong API URL');
      console.log('  - CORS issues');
      console.log('  - Network connectivity problems');
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      console.log('\n🔧 Troubleshooting steps:');
      console.log('1. Check if backend server is running');
      console.log('2. Verify API URL is correct');
      console.log('3. Check for CORS configuration');
      console.log('4. Ensure network connectivity');
    }
  }
}

// Test mobile app API specifically
async function testMobileAppAPI() {
  console.log('\n📱 Testing Mobile App API Access...');
  
  try {
    // Test the exact endpoint the mobile app uses
    const response = await fetch(`${MOBILE_API_BASE}/locations`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Mobile API working correctly');
      console.log('📊 Response structure:', {
        success: data.success,
        locationsCount: data.data?.locations?.length || 0,
        timestamp: data.timestamp
      });
      
      // Check if locations have required fields for mobile app
      if (data.data?.locations?.length > 0) {
        const sampleLocation = data.data.locations[0];
        console.log('📍 Sample location structure:');
        console.log('  - Has ID:', !!sampleLocation.id);
        console.log('  - Has name:', !!sampleLocation.name);
        console.log('  - Has coordinates:', !!sampleLocation.coordinates);
        console.log('  - Has address:', !!sampleLocation.address);
        console.log('  - Has region:', !!sampleLocation.region);
      }
    } else {
      console.error('❌ Mobile API failed:', response.status, response.statusText);
    }
    
  } catch (error) {
    console.error('❌ Mobile API test failed:', error);
  }
}

// Run tests
console.log('🚀 Starting Locations API Tests...');
testLocationsAPI().then(() => {
  return testMobileAppAPI();
}).then(() => {
  console.log('\n✅ All tests completed!');
}).catch(error => {
  console.error('❌ Test suite failed:', error);
});

// Export for manual testing
if (typeof window !== 'undefined') {
  window.testLocationsAPI = testLocationsAPI;
  window.testMobileAppAPI = testMobileAppAPI;
  console.log('💡 Functions exported to window: testLocationsAPI(), testMobileAppAPI()');
}