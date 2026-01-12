/**
 * Test script to verify that NATIS services are being saved and retrieved correctly
 * Run this in browser console or Node.js
 */

// Configuration
const API_BASE = 'http://localhost:3001/api'; // Admin API
const MOBILE_API = 'http://localhost:5000/api'; // Mobile API

// Test location with services
const testLocationWithServices = {
  name: 'Test NATIS Office - Services Test',
  address: '123 Test Street, Windhoek',
  region: 'Khomas',
  coordinates: {
    latitude: -22.5609,
    longitude: 17.0658
  },
  contactNumber: '+264 61 123456',
  email: 'test@natis.gov.na',
  services: [
    'Vehicle Registration',
    'Driver\'s License Renewal',
    'Learner\'s License',
    'Professional Driving Permit (PDP)',
    'Vehicle License Renewal'
  ],
  operatingHours: {
    weekdays: {
      open: '08:00',
      close: '17:00'
    },
    weekends: {
      open: '09:00',
      close: '13:00'
    },
    publicHolidays: {
      open: '10:00',
      close: '14:00'
    }
  },
  closedDays: ['Sunday'],
  specialHours: [
    {
      date: '2024-12-25',
      reason: 'Christmas Day',
      closed: true
    },
    {
      date: '2024-01-02',
      reason: 'New Year Recovery',
      closed: false,
      hours: {
        open: '10:00',
        close: '15:00'
      }
    }
  ]
};

async function testServicesSaving() {
  console.log('🔍 Testing NATIS Services Saving and Retrieval...');
  
  let createdLocationId = null;
  
  try {
    // Step 1: Create location with services (requires auth)
    console.log('\n📝 Step 1: Creating location with services...');
    console.log('Services to save:', testLocationWithServices.services);
    
    // Note: This will likely fail without proper authentication
    // But we can see the request structure
    console.log('Request payload:', JSON.stringify(testLocationWithServices, null, 2));
    
    // Step 2: Test retrieving locations from mobile API
    console.log('\n📱 Step 2: Testing mobile API retrieval...');
    
    const mobileResponse = await fetch(`${MOBILE_API}/locations`);
    
    if (mobileResponse.ok) {
      const mobileData = await mobileResponse.json();
      console.log('✅ Mobile API response received');
      console.log(`📊 Found ${mobileData.data.locations.length} locations`);
      
      // Check if any locations have services
      const locationsWithServices = mobileData.data.locations.filter(loc => 
        loc.services && loc.services.length > 0
      );
      
      console.log(`📋 Locations with services: ${locationsWithServices.length}`);
      
      if (locationsWithServices.length > 0) {
        console.log('\n📍 Sample location with services:');
        const sample = locationsWithServices[0];
        console.log(`Name: ${sample.name}`);
        console.log(`Services: ${JSON.stringify(sample.services, null, 2)}`);
        console.log(`Operating Hours: ${JSON.stringify(sample.operatingHours, null, 2)}`);
        console.log(`Closed Days: ${JSON.stringify(sample.closedDays, null, 2)}`);
        console.log(`Special Hours: ${JSON.stringify(sample.specialHours, null, 2)}`);
      } else {
        console.log('⚠️ No locations found with services data');
        
        // Show structure of existing locations
        if (mobileData.data.locations.length > 0) {
          console.log('\n📋 Sample location structure:');
          const sample = mobileData.data.locations[0];
          console.log('Available fields:', Object.keys(sample));
          console.log('Services field:', sample.services);
          console.log('Services type:', typeof sample.services);
        }
      }
    } else {
      console.error('❌ Mobile API failed:', mobileResponse.status, mobileResponse.statusText);
    }
    
    // Step 3: Test admin API retrieval
    console.log('\n🔧 Step 3: Testing admin API retrieval...');
    
    const adminResponse = await fetch(`${API_BASE}/locations`);
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin API response received');
      console.log(`📊 Found ${adminData.data.locations.length} locations`);
      
      const adminLocationsWithServices = adminData.data.locations.filter(loc => 
        loc.services && loc.services.length > 0
      );
      
      console.log(`📋 Admin locations with services: ${adminLocationsWithServices.length}`);
      
      if (adminLocationsWithServices.length > 0) {
        console.log('\n📍 Admin sample location with services:');
        const sample = adminLocationsWithServices[0];
        console.log(`Name: ${sample.name}`);
        console.log(`Services: ${JSON.stringify(sample.services, null, 2)}`);
      }
    } else {
      console.error('❌ Admin API failed:', adminResponse.status, adminResponse.statusText);
    }
    
    // Step 4: Compare APIs
    console.log('\n🔄 Step 4: Comparing API responses...');
    
    if (mobileResponse.ok && adminResponse.ok) {
      const mobileData = await mobileResponse.json();
      const adminData = await adminResponse.json();
      
      console.log(`Mobile API locations: ${mobileData.data.locations.length}`);
      console.log(`Admin API locations: ${adminData.data.locations.length}`);
      
      if (mobileData.data.locations.length === adminData.data.locations.length) {
        console.log('✅ Location counts match');
      } else {
        console.log('⚠️ Location counts differ - APIs may be using different databases');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Test form data structure
function testFormDataStructure() {
  console.log('\n🧪 Testing Form Data Structure...');
  
  // Simulate what the admin form should send
  const formData = {
    name: testLocationWithServices.name,
    address: testLocationWithServices.address,
    region: testLocationWithServices.region,
    coordinates: testLocationWithServices.coordinates,
    contactNumber: testLocationWithServices.contactNumber,
    email: testLocationWithServices.email,
    services: testLocationWithServices.services,
    operatingHours: testLocationWithServices.operatingHours,
    closedDays: testLocationWithServices.closedDays,
    specialHours: testLocationWithServices.specialHours,
  };
  
  console.log('Form data structure:');
  console.log(JSON.stringify(formData, null, 2));
  
  // Validate services array
  if (Array.isArray(formData.services)) {
    console.log('✅ Services is an array');
    console.log(`📊 Services count: ${formData.services.length}`);
    formData.services.forEach((service, index) => {
      console.log(`  ${index + 1}. ${service}`);
    });
  } else {
    console.log('❌ Services is not an array:', typeof formData.services);
  }
}

// Test what happens when services are empty
async function testEmptyServices() {
  console.log('\n🔍 Testing locations with empty/null services...');
  
  try {
    const response = await fetch(`${MOBILE_API}/locations`);
    
    if (response.ok) {
      const data = await response.json();
      
      data.data.locations.forEach((location, index) => {
        console.log(`\nLocation ${index + 1}: ${location.name}`);
        console.log(`  Services: ${JSON.stringify(location.services)}`);
        console.log(`  Services type: ${typeof location.services}`);
        console.log(`  Is array: ${Array.isArray(location.services)}`);
        console.log(`  Length: ${location.services ? location.services.length : 'N/A'}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to test empty services:', error);
  }
}

// Main test function
async function runServicesTest() {
  console.log('🚀 Starting NATIS Services Test Suite...\n');
  
  testFormDataStructure();
  await testServicesSaving();
  await testEmptyServices();
  
  console.log('\n✅ Services test completed!');
  
  console.log('\n💡 Troubleshooting checklist:');
  console.log('1. Check if backend is running and accessible');
  console.log('2. Verify admin form is sending services array');
  console.log('3. Check database to see if services are actually saved');
  console.log('4. Ensure mobile API returns services field');
  console.log('5. Check mobile app is reading services correctly');
}

// Run the test
runServicesTest().catch(error => {
  console.error('❌ Test suite failed:', error);
});

// Export for manual use
if (typeof window !== 'undefined') {
  window.testServices = runServicesTest;
  window.testFormData = testFormDataStructure;
  console.log('💡 Functions exported: testServices(), testFormData()');
}