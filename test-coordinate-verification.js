// Use global fetch (available in Node.js 18+) or install node-fetch
const fetch = globalThis.fetch || require('node-fetch');

async function testCoordinateVerification() {
  console.log('🔍 Testing coordinate verification with real Namibian coordinates...');
  
  // Test with Windhoek coordinates
  const testCoords = [
    { name: 'Windhoek', lat: -22.5609, lon: 17.0658 },
    { name: 'Swakopmund', lat: -22.6792, lon: 14.5272 },
    { name: 'Walvis Bay', lat: -22.9576, lon: 14.5053 }
  ];
  
  for (const coord of testCoords) {
    console.log(`\n📍 Testing ${coord.name}: ${coord.lat}, ${coord.lon}`);
    
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${coord.lat}&lon=${coord.lon}&format=json&addressdetails=1&zoom=18`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'RoadsAuthority-Admin/1.0',
          'Accept': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          console.log(`✅ Success: ${data.display_name}`);
        } else {
          console.log('⚠️ No location data returned');
        }
      } else {
        console.log(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

testCoordinateVerification();