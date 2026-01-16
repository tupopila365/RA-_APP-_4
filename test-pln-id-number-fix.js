const axios = require('axios');

// Test PLN application with Namibia ID-doc
async function testPLNApplication() {
  const baseURL = 'http://localhost:5000';
  
  const testData = {
    idType: "Namibia ID-doc",
    trafficRegisterNumber: "12345678901", // This should now be included
    surname: "Kadhila",
    initials: "TY",
    postalAddress: JSON.stringify({
      line1: "Pobox",
      line2: "",
      line3: ""
    }),
    streetAddress: JSON.stringify({
      line1: "Non",
      line2: "",
      line3: ""
    }),
    telephoneHome: JSON.stringify({
      code: "264",
      number: "816454"
    }),
    cellNumber: JSON.stringify({
      code: "264",
      number: "817649719"
    }),
    email: "kaunamosi@outlook.com",
    plateFormat: "Normal",
    quantity: "1",
    plateChoices: JSON.stringify([
      { text: "OH", meaning: "" },
      { text: "SMITH", meaning: "" },
      { text: "NO", meaning: "" }
    ]),
    declarationAccepted: "true",
    declarationPlace: "Windhoek",
    declarationRole: "applicant"
  };

  try {
    console.log('🧪 Testing PLN application with Namibia ID-doc...');
    console.log('📋 Test data:', JSON.stringify(testData, null, 2));
    
    const response = await axios.post(`${baseURL}/api/pln/applications`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Success! Application created:', response.data);
    
  } catch (error) {
    if (error.response) {
      console.log('❌ Error response:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

// Test with different ID types
async function testAllIdTypes() {
  console.log('🔧 Testing PLN Application ID Number Fix\n');
  
  // Test 1: Namibia ID-doc (should work now)
  console.log('Test 1: Namibia ID-doc');
  await testPLNApplication();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Traffic Register Number (should still work)
  console.log('Test 2: Traffic Register Number');
  const testData2 = {
    idType: "Traffic Register Number",
    trafficRegisterNumber: "TR123456789",
    surname: "Smith",
    initials: "JS",
    postalAddress: JSON.stringify({ line1: "PO Box 123", line2: "", line3: "" }),
    streetAddress: JSON.stringify({ line1: "123 Main St", line2: "", line3: "" }),
    telephoneHome: JSON.stringify({ code: "264", number: "612345" }),
    cellNumber: JSON.stringify({ code: "264", number: "811234567" }),
    email: "john.smith@example.com",
    plateFormat: "Normal",
    quantity: "1",
    plateChoices: JSON.stringify([
      { text: "JOHN", meaning: "" },
      { text: "SMITH", meaning: "" },
      { text: "JS", meaning: "" }
    ]),
    declarationAccepted: "true",
    declarationPlace: "Windhoek",
    declarationRole: "applicant"
  };
  
  try {
    const response = await axios.post('http://localhost:5000/api/pln/applications', testData2, {
      headers: { 'Content-Type': 'application/json' }
    });
    console.log('✅ Success! Traffic Register Number application created:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('❌ Error response:', error.response.status, error.response.data);
    } else {
      console.log('❌ Network error:', error.message);
    }
  }
}

// Run tests
testAllIdTypes().catch(console.error);