// Simple coordinate verification test - paste this in browser console
console.log('🔍 Testing coordinate verification...');

// Test coordinates (Windhoek)
const testLat = -22.5609;
const testLon = 17.0658;

async function testCoordinateVerification() {
  console.log(`Testing: ${testLat}, ${testLon}`);
  
  try {
    // Test 1: Basic fetch to Nominatim
    console.log('📡 Making request to Nominatim...');
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${testLat}&lon=${testLon}&format=json&addressdetails=1`;
    console.log('URL:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RoadsAuthority-Admin/1.0',
      }
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Response data:', data);
    
    if (data && data.display_name) {
      console.log('✅ SUCCESS: Location found:', data.display_name);
    } else {
      console.log('⚠️ No location data in response');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    
    // Check common issues
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      console.log('🔧 This looks like a CORS or network issue');
      console.log('Try:');
      console.log('1. Check if you have an ad blocker blocking the request');
      console.log('2. Check if your network blocks external APIs');
      console.log('3. Try opening https://nominatim.openstreetmap.org in a new tab');
    }
  }
}

// Run the test
testCoordinateVerification();

// Also test if the admin form functions exist
console.log('🔍 Checking if admin functions are available...');
if (typeof window !== 'undefined') {
  console.log('Window object available');
  
  // Check if React form is loaded
  const latInput = document.querySelector('input[name*="latitude"]');
  const lonInput = document.querySelector('input[name*="longitude"]');
  
  if (latInput && lonInput) {
    console.log('✅ Coordinate inputs found');
    console.log('Current latitude:', latInput.value);
    console.log('Current longitude:', lonInput.value);
  } else {
    console.log('❌ Coordinate inputs not found - form may not be loaded');
  }
}