/**
 * Debug script to trace services data flow from admin to mobile app
 * Run this in browser console or Node.js
 */

// API endpoints
const ADMIN_API = 'http://localhost:3001/api';
const MOBILE_API = 'http://localhost:5000/api';

async function debugServicesFlow() {
  console.log('🔍 Debugging Services Data Flow...\n');
  
  try {
    // Step 1: Check what admin API returns
    console.log('📋 Step 1: Testing Admin API...');
    const adminResponse = await fetch(`${ADMIN_API}/locations`);
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin API Response:');
      console.log(`  Total locations: ${adminData.data.locations.length}`);
      
      if (adminData.data.locations.length > 0) {
        const sample = adminData.data.locations[0];
        console.log('  Sample location structure:');
        console.log(`    Name: ${sample.name}`);
        console.log(`    Services: ${JSON.stringify(sample.services)}`);
        console.log(`    Services type: ${typeof sample.services}`);
        console.log(`    Is array: ${Array.isArray(sample.services)}`);
        console.log(`    Length: ${sample.services ? sample.services.length : 'N/A'}`);
        
        // Check all locations for services
        const withServices = adminData.data.locations.filter(loc => 
          loc.services && Array.isArray(loc.services) && loc.services.length > 0
        );
        console.log(`  Locations with services: ${withServices.length}`);
        
        if (withServices.length > 0) {
          console.log('  Locations that have services:');
          withServices.forEach((loc, index) => {
            console.log(`    ${index + 1}. ${loc.name}: ${loc.services.join(', ')}`);
          });
        }
      }
    } else {
      console.error('❌ Admin API failed:', adminResponse.status);
    }
    
    // Step 2: Check what mobile API returns
    console.log('\n📱 Step 2: Testing Mobile API...');
    const mobileResponse = await fetch(`${MOBILE_API}/locations`);
    
    if (mobileResponse.ok) {
      const mobileData = await mobileResponse.json();
      console.log('✅ Mobile API Response:');
      console.log(`  Total locations: ${mobileData.data.locations.length}`);
      
      if (mobileData.data.locations.length > 0) {
        const sample = mobileData.data.locations[0];
        console.log('  Sample location structure:');
        console.log(`    Name: ${sample.name}`);
        console.log(`    Services: ${JSON.stringify(sample.services)}`);
        console.log(`    Services type: ${typeof sample.services}`);
        console.log(`    Is array: ${Array.isArray(sample.services)}`);
        console.log(`    Length: ${sample.services ? sample.services.length : 'N/A'}`);
        
        // Check all locations for services
        const withServices = mobileData.data.locations.filter(loc => 
          loc.services && Array.isArray(loc.services) && loc.services.length > 0
        );
        console.log(`  Locations with services: ${withServices.length}`);
        
        if (withServices.length > 0) {
          console.log('  Locations that have services:');
          withServices.forEach((loc, index) => {
            console.log(`    ${index + 1}. ${loc.name}: ${loc.services.join(', ')}`);
          });
        }
      }
    } else {
      console.error('❌ Mobile API failed:', mobileResponse.status);
    }
    
    // Step 3: Compare responses
    console.log('\n🔄 Step 3: Comparing API Responses...');
    
    if (adminResponse.ok && mobileResponse.ok) {
      const adminData = await adminResponse.json();
      const mobileData = await mobileResponse.json();
      
      console.log('Comparison:');
      console.log(`  Admin locations: ${adminData.data.locations.length}`);
      console.log(`  Mobile locations: ${mobileData.data.locations.length}`);
      
      if (adminData.data.locations.length !== mobileData.data.locations.length) {
        console.log('⚠️ Different number of locations - APIs may use different databases');
      }
      
      // Compare first location if both exist
      if (adminData.data.locations.length > 0 && mobileData.data.locations.length > 0) {
        const adminFirst = adminData.data.locations[0];
        const mobileFirst = mobileData.data.locations[0];
        
        console.log('\nFirst location comparison:');
        console.log(`  Admin: ${adminFirst.name} - Services: ${JSON.stringify(adminFirst.services)}`);
        console.log(`  Mobile: ${mobileFirst.name} - Services: ${JSON.stringify(mobileFirst.services)}`);
        
        if (JSON.stringify(adminFirst.services) === JSON.stringify(mobileFirst.services)) {
          console.log('✅ Services data matches between APIs');
        } else {
          console.log('❌ Services data differs between APIs');
        }
      }
    }
    
    // Step 4: Test specific location creation
    console.log('\n📝 Step 4: Testing Location Creation Structure...');
    
    const testLocation = {
      name: 'Debug Test Office',
      address: '123 Debug Street',
      region: 'Khomas',
      coordinates: { latitude: -22.5609, longitude: 17.0658 },
      services: ['Vehicle Registration', 'Driver\'s License Renewal'],
      operatingHours: {
        weekdays: { open: '08:00', close: '17:00' }
      }
    };
    
    console.log('Test location structure:');
    console.log(JSON.stringify(testLocation, null, 2));
    console.log('Services field check:');
    console.log(`  Type: ${typeof testLocation.services}`);
    console.log(`  Is array: ${Array.isArray(testLocation.services)}`);
    console.log(`  Length: ${testLocation.services.length}`);
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Test mobile app data processing
function testMobileAppDataProcessing() {
  console.log('\n📱 Testing Mobile App Data Processing...');
  
  // Simulate what mobile app receives
  const mockApiResponse = {
    success: true,
    data: {
      locations: [
        {
          id: '1',
          name: 'Test Office',
          address: '123 Test St',
          region: 'Khomas',
          coordinates: { latitude: -22.5609, longitude: 17.0658 },
          services: ['Vehicle Registration', 'Driver\'s License Renewal'],
          operatingHours: {
            weekdays: { open: '08:00', close: '17:00' }
          }
        }
      ]
    }
  };
  
  console.log('Mock API response:');
  console.log(JSON.stringify(mockApiResponse, null, 2));
  
  // Test mobile app logic
  const office = mockApiResponse.data.locations[0];
  
  console.log('\nMobile app processing:');
  console.log(`Office: ${office.name}`);
  console.log(`Services check: office.services = ${JSON.stringify(office.services)}`);
  console.log(`Services exists: ${!!office.services}`);
  console.log(`Services is array: ${Array.isArray(office.services)}`);
  console.log(`Services length > 0: ${office.services && office.services.length > 0}`);
  
  // Test the exact condition used in mobile app
  const shouldShowServices = office.services && office.services.length > 0;
  console.log(`Should show services: ${shouldShowServices}`);
  
  if (shouldShowServices) {
    console.log('✅ Services should display in mobile app');
    console.log('Services to display:');
    office.services.forEach((service, index) => {
      console.log(`  ${index + 1}. ${service}`);
    });
  } else {
    console.log('❌ Services will NOT display in mobile app');
    console.log('Reasons:');
    console.log(`  - services is falsy: ${!office.services}`);
    console.log(`  - services is not array: ${!Array.isArray(office.services)}`);
    console.log(`  - services length is 0: ${office.services && office.services.length === 0}`);
  }
}

// Run all tests
async function runFullDebug() {
  console.log('🚀 Starting Full Services Debug...\n');
  
  await debugServicesFlow();
  testMobileAppDataProcessing();
  
  console.log('\n✅ Debug completed!');
  console.log('\n💡 Next steps:');
  console.log('1. Check if services appear in API responses above');
  console.log('2. If APIs return services but mobile app doesn\'t show them, check mobile app code');
  console.log('3. If APIs don\'t return services, check backend database');
  console.log('4. Create a new location with services and test again');
}

// Export for browser use
if (typeof window !== 'undefined') {
  window.debugServices = runFullDebug;
  window.testMobileProcessing = testMobileAppDataProcessing;
  console.log('💡 Functions available: debugServices(), testMobileProcessing()');
}

// Auto-run if in Node.js
if (typeof window === 'undefined') {
  runFullDebug();
}