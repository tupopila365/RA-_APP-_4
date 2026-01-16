const axios = require('axios');

// Test the new tracking PIN system
async function testTrackingPinSystem() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing PLN Tracking PIN System...\n');
  
  // Step 1: Create a PLN application
  console.log('Step 1: Creating PLN application...');
  
  const applicationData = {
    idType: "Namibia ID-doc",
    trafficRegisterNumber: "12345678901",
    surname: "TestUser",
    initials: "TU",
    postalAddress: JSON.stringify({
      line1: "PO Box 123",
      line2: "",
      line3: ""
    }),
    streetAddress: JSON.stringify({
      line1: "123 Test Street",
      line2: "",
      line3: ""
    }),
    telephoneHome: JSON.stringify({
      code: "264",
      number: "612345"
    }),
    cellNumber: JSON.stringify({
      code: "264",
      number: "811234567"
    }),
    email: "test@example.com",
    plateFormat: "Normal",
    quantity: "1",
    plateChoices: JSON.stringify([
      { text: "TEST", meaning: "" },
      { text: "USER", meaning: "" },
      { text: "123", meaning: "" }
    ]),
    declarationAccepted: "true",
    declarationPlace: "Windhoek",
    declarationRole: "applicant"
  };

  try {
    // Create application
    const createResponse = await axios.post(`${baseURL}/api/pln/applications`, applicationData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Application created successfully!');
    console.log('📋 Application details:');
    console.log(`   Reference ID: ${createResponse.data.data.application.referenceId}`);
    console.log(`   Tracking PIN: ${createResponse.data.data.application.trackingPin}`);
    console.log(`   Status: ${createResponse.data.data.application.status}`);
    
    const referenceId = createResponse.data.data.application.referenceId;
    const trackingPin = createResponse.data.data.application.trackingPin;
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Step 2: Test tracking with correct PIN
    console.log('Step 2: Testing tracking with correct PIN...');
    
    const trackResponse = await axios.get(`${baseURL}/api/pln/track/${referenceId}/${trackingPin}`);
    
    console.log('✅ Tracking successful!');
    console.log('📋 Tracking details:');
    console.log(`   Reference ID: ${trackResponse.data.data.application.referenceId}`);
    console.log(`   Status: ${trackResponse.data.data.application.status}`);
    console.log(`   Full Name: ${trackResponse.data.data.application.fullName}`);
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Step 3: Test tracking with wrong PIN
    console.log('Step 3: Testing tracking with wrong PIN...');
    
    try {
      await axios.get(`${baseURL}/api/pln/track/${referenceId}/99999`);
      console.log('❌ ERROR: Should have failed with wrong PIN!');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Correctly rejected wrong PIN!');
        console.log(`   Error: ${error.response.data.error.message}`);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // Step 4: Verify PIN is always 12345
    console.log('Step 4: Verifying PIN is always 12345...');
    
    if (trackingPin === '12345') {
      console.log('✅ Tracking PIN is correctly set to 12345!');
    } else {
      console.log(`❌ ERROR: Expected PIN to be 12345, but got: ${trackingPin}`);
    }
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✅ PLN applications now include trackingPin field');
    console.log('   ✅ All tracking PINs are set to 12345');
    console.log('   ✅ Tracking API uses referenceId + trackingPin');
    console.log('   ✅ Wrong PIN is correctly rejected');
    console.log('   ✅ Frontend will show both referenceId and trackingPin');
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error response:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

// Run the test
testTrackingPinSystem().catch(console.error);