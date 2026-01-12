/**
 * Test script to create a location with services and verify it appears in mobile app
 */

const fetch = globalThis.fetch || require('node-fetch');

const ADMIN_API = 'http://localhost:3001/api';
const MOBILE_API = 'http://localhost:5000/api';

async function testServicesCreation() {
  console.log('🧪 Testing Services Creation and Display...\n');
  
  // Test location data with services
  const testLocation = {
    name: 'Test NATIS Office with Services',
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
      'Professional Driving Permit (PDP)'
    ],
    operatingHours: {
      weekdays: {
        open: '08:00',
        close: '17:00'
      }
    }
  };

  try {
    console.log('📝 Step 1: Creating test location with services...');
    console.log('Location data:', JSON.stringify(testLocation, null, 2));
    
    // Create location via admin API
    const createResponse = await fetch(`${ADMIN_API}/locations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In real usage, you'd need authentication headers
      },
      body: JSON.stringify(testLocation)
    });
    
    if (createResponse.ok) {
      const createResult = await createResponse.json();
      console.log('✅ Location created successfully');
      console.log('Created location ID:', createResult.data.location.id);
      console.log('Services saved:', createResult.data.location.services);
      
      const locationId = createResult.data.location.id;
      
      // Wait a moment for database to sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('\n📱 Step 2: Checking mobile API response...');
      
      // Check mobile API
      const mobileResponse = await fetch(`${MOBILE_API}/locations`);
      if (mobileResponse.ok) {
        const mobileData = await mobileResponse.json();
        const testLocationInMobile = mobileData.data.locations.find(
          loc => loc.id === locationId
        );
        
        if (testLocationInMobile) {
          console.log('✅ Location found in mobile API');
          console.log('Mobile services:', testLocationInMobile.services);
          console.log('Services match:', 
            JSON.stringify(testLocationInMobile.services) === JSON.stringify(testLocation.services)
          );
          
          // Test mobile app display logic
          const shouldShowServices = testLocationInMobile.services && 
                                   testLocationInMobile.services.length > 0;
          console.log('Should show in mobile app:', shouldShowServices);
          
          if (shouldShowServices) {
            console.log('✅ Services will display in mobile app');
            console.log('Services to display:');
            testLocationInMobile.services.forEach((service, index) => {
              console.log(`  ${index + 1}. ${service}`);
            });
          } else {
            console.log('❌ Services will NOT display in mobile app');
          }
        } else {
          console.log('❌ Test location not found in mobile API');
        }
      } else {
        console.log('❌ Mobile API request failed:', mobileResponse.status);
      }
      
      console.log('\n🧹 Step 3: Cleaning up test location...');
      
      // Clean up - delete test location
      const deleteResponse = await fetch(`${ADMIN_API}/locations/${locationId}`, {
        method: 'DELETE',
        headers: {
          // Note: In real usage, you'd need authentication headers
        }
      });
      
      if (deleteResponse.ok) {
        console.log('✅ Test location cleaned up successfully');
      } else {
        console.log('⚠️ Failed to clean up test location - you may need to delete it manually');
      }
      
    } else {
      const errorData = await createResponse.text();
      console.log('❌ Failed to create location:', createResponse.status);
      console.log('Error:', errorData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testServicesCreation().then(() => {
  console.log('\n✅ Test completed!');
}).catch(error => {
  console.error('❌ Test error:', error);
});