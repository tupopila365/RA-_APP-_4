/**
 * Quick test to run in the admin panel browser console
 * This will help identify why coordinate verification isn't working
 */

console.log('🔍 Testing Admin Panel Geocoding...');

// Test the exact same function used in the admin
async function testAdminGeocode() {
  // Test coordinates (Windhoek)
  const testLat = -22.5609;
  const testLon = 17.0658;
  
  console.log(`Testing coordinates: ${testLat}, ${testLon}`);
  
  // Step 1: Test coordinate validation
  console.log('\n📏 Step 1: Testing coordinate validation...');
  
  function validateCoordinates(latitude, longitude) {
    if (latitude === undefined || latitude === '' || longitude === undefined || longitude === '') {
      return { valid: false, error: 'Both latitude and longitude are required' };
    }

    const lat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
    const lon = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

    if (isNaN(lat) || isNaN(lon)) {
      return { valid: false, error: 'Coordinates must be valid numbers' };
    }

    if (lat < -30 || lat > -16 || lon < 10 || lon > 27) {
      return {
        valid: false,
        error: 'Coordinates are outside Namibia. Please verify the location.',
      };
    }

    return { valid: true };
  }
  
  const validation = validateCoordinates(testLat, testLon);
  console.log('Validation result:', validation);
  
  if (!validation.valid) {
    console.error('❌ Coordinates failed validation:', validation.error);
    return;
  }
  
  console.log('✅ Coordinates passed validation');
  
  // Step 2: Test reverse geocoding
  console.log('\n🌐 Step 2: Testing reverse geocoding...');
  
  async function reverseGeocode(latitude, longitude) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'RoadsAuthority-Admin/1.0',
          },
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data && data.display_name) {
        return {
          success: true,
          latitude,
          longitude,
          displayName: data.display_name,
        };
      }

      return {
        success: false,
        error: 'Location not found',
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        success: false,
        error: error.message || 'Reverse geocoding failed',
      };
    }
  }
  
  try {
    const result = await reverseGeocode(testLat, testLon);
    console.log('Geocoding result:', result);
    
    if (result.success) {
      console.log('✅ SUCCESS: Location found:', result.displayName);
    } else {
      console.log('❌ FAILED:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Exception during geocoding:', error);
    return null;
  }
}

// Step 3: Check for common issues
console.log('\n🔧 Step 3: Checking for common issues...');

// Check protocol
console.log('Current protocol:', window.location.protocol);
if (window.location.protocol === 'http:') {
  console.warn('⚠️ Running on HTTP - this may cause mixed content issues with HTTPS APIs');
}

// Check if fetch is available
if (typeof fetch === 'undefined') {
  console.error('❌ fetch() is not available');
} else {
  console.log('✅ fetch() is available');
}

// Check CORS
console.log('Testing CORS...');
fetch('https://nominatim.openstreetmap.org/status', {
  method: 'HEAD',
  headers: {
    'User-Agent': 'RoadsAuthority-Admin/1.0',
  }
}).then(response => {
  console.log('✅ CORS test passed:', response.status);
}).catch(error => {
  console.error('❌ CORS test failed:', error);
});

// Run the main test
testAdminGeocode().then(result => {
  console.log('\n🏁 Test completed. Result:', result);
  
  if (!result || !result.success) {
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check browser console for network errors');
    console.log('2. Verify internet connection');
    console.log('3. Check if ad blockers are blocking the request');
    console.log('4. Try opening https://nominatim.openstreetmap.org in a new tab');
    console.log('5. Check if the admin panel is running on HTTPS');
  }
}).catch(error => {
  console.error('❌ Test failed with exception:', error);
});

// Export for manual testing
window.testGeocode = testAdminGeocode;