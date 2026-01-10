const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:3001/api';
const TEST_ADMIN_TOKEN = 'your-admin-token'; // Replace with actual admin token

// Test data for new structure
const newStructureTestData = {
  // Section A - Owner/Transferor
  idType: 'Namibia ID-doc',
  trafficRegisterNumber: '12345678901',
  surname: 'Doe',
  initials: 'J.A.',
  postalAddress: JSON.stringify({
    line1: '123 Main Street',
    line2: 'Windhoek',
    line3: 'Namibia'
  }),
  streetAddress: JSON.stringify({
    line1: '456 Oak Avenue',
    line2: 'Klein Windhoek',
    line3: 'Windhoek'
  }),
  telephoneHome: JSON.stringify({
    code: '264',
    number: '61234567'
  }),
  cellNumber: JSON.stringify({
    code: '264',
    number: '81234567'
  }),
  email: 'john.doe@example.com',
  
  // Section B - Personalised Number Plate
  plateFormat: 'Normal',
  quantity: '1',
  plateChoices: JSON.stringify([
    { text: 'JOHNDOE', meaning: 'My name' },
    { text: 'CHOICE2', meaning: 'Second choice' },
    { text: 'CHOICE3', meaning: 'Third choice' }
  ]),
  
  // Section E - Declaration
  declarationAccepted: 'true',
  declarationPlace: 'Windhoek',
  declarationRole: 'applicant'
};

// Test data for legacy structure
const legacyTestData = {
  fullName: 'John Doe',
  idNumber: '12345678901',
  phoneNumber: '+264812345678',
  plateChoices: JSON.stringify([
    { text: 'LEGACY1', meaning: 'Legacy choice 1' },
    { text: 'LEGACY2', meaning: 'Legacy choice 2' },
    { text: 'LEGACY3', meaning: 'Legacy choice 3' }
  ])
};

async function createTestDocument() {
  const testPdfPath = path.join(__dirname, 'test-document.pdf');
  
  // Create a simple test PDF content (this is just placeholder text)
  const testContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Document) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;

  fs.writeFileSync(testPdfPath, testContent);
  return testPdfPath;
}

async function testCreateApplication(testData, testName) {
  console.log(`\n=== Testing ${testName} ===`);
  
  try {
    const testDocPath = await createTestDocument();
    const formData = new FormData();
    
    // Add all form fields
    Object.entries(testData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // Add test document
    formData.append('document', fs.createReadStream(testDocPath));
    
    const response = await axios.post(`${BASE_URL}/pln/applications`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
    });
    
    console.log('✅ Application created successfully');
    console.log('Reference ID:', response.data.data.application.referenceId);
    console.log('Application ID:', response.data.data.application.id);
    
    // Clean up test file
    fs.unlinkSync(testDocPath);
    
    return response.data.data.application;
    
  } catch (error) {
    console.error('❌ Failed to create application:', error.response?.data || error.message);
    return null;
  }
}

async function testTrackApplication(referenceId, idNumber) {
  console.log(`\n=== Testing Track Application ===`);
  
  try {
    const response = await axios.get(`${BASE_URL}/pln/track/${referenceId}/${idNumber}`);
    
    console.log('✅ Application tracked successfully');
    console.log('Status:', response.data.data.application.status);
    console.log('Reference ID:', response.data.data.application.referenceId);
    
    return response.data.data.application;
    
  } catch (error) {
    console.error('❌ Failed to track application:', error.response?.data || error.message);
    return null;
  }
}

async function testAdminEndpoints(applicationId) {
  console.log(`\n=== Testing Admin Endpoints ===`);
  
  const headers = {
    'Authorization': `Bearer ${TEST_ADMIN_TOKEN}`,
    'Content-Type': 'application/json'
  };
  
  try {
    // Test get application by ID
    console.log('Testing get application by ID...');
    const getResponse = await axios.get(`${BASE_URL}/pln/applications/${applicationId}`, { headers });
    console.log('✅ Get application successful');
    
    // Test list applications
    console.log('Testing list applications...');
    const listResponse = await axios.get(`${BASE_URL}/pln/applications`, { headers });
    console.log('✅ List applications successful');
    console.log('Total applications:', listResponse.data.data.pagination.total);
    
    // Test update admin comments
    console.log('Testing update admin comments...');
    await axios.put(`${BASE_URL}/pln/applications/${applicationId}/comments`, {
      comments: 'Test admin comment from automated test'
    }, { headers });
    console.log('✅ Update admin comments successful');
    
    // Test assign to admin
    console.log('Testing assign to admin...');
    await axios.put(`${BASE_URL}/pln/applications/${applicationId}/assign`, {
      assignedTo: 'test-admin@example.com'
    }, { headers });
    console.log('✅ Assign to admin successful');
    
    // Test set priority
    console.log('Testing set priority...');
    await axios.put(`${BASE_URL}/pln/applications/${applicationId}/priority`, {
      priority: 'HIGH'
    }, { headers });
    console.log('✅ Set priority successful');
    
    // Test update status
    console.log('Testing update status...');
    await axios.put(`${BASE_URL}/pln/applications/${applicationId}/status`, {
      status: 'UNDER_REVIEW',
      comment: 'Application under review by automated test'
    }, { headers });
    console.log('✅ Update status successful');
    
    // Test dashboard stats
    console.log('Testing dashboard stats...');
    const statsResponse = await axios.get(`${BASE_URL}/pln/dashboard/stats`, { headers });
    console.log('✅ Dashboard stats successful');
    console.log('Total applications:', statsResponse.data.data.stats.total);
    
    return true;
    
  } catch (error) {
    console.error('❌ Admin endpoint test failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 Starting PLN Backend Enhanced Structure Tests');
  console.log('================================================');
  
  // Test 1: Create application with new structure
  const newStructureApp = await testCreateApplication(newStructureTestData, 'New Structure Application');
  
  if (newStructureApp) {
    // Test tracking for new structure
    const idNumber = newStructureTestData.trafficRegisterNumber;
    await testTrackApplication(newStructureApp.referenceId, idNumber);
  }
  
  // Test 2: Create application with legacy structure
  const legacyApp = await testCreateApplication(legacyTestData, 'Legacy Structure Application');
  
  if (legacyApp) {
    // Test tracking for legacy structure
    const idNumber = legacyTestData.idNumber;
    await testTrackApplication(legacyApp.referenceId, idNumber);
  }
  
  // Test 3: Admin endpoints (use the first successful application)
  const testAppId = newStructureApp?.id || legacyApp?.id;
  if (testAppId && TEST_ADMIN_TOKEN !== 'your-admin-token') {
    await testAdminEndpoints(testAppId);
  } else {
    console.log('\n⚠️  Skipping admin endpoint tests - no admin token provided or no application created');
    console.log('To test admin endpoints, replace TEST_ADMIN_TOKEN with a valid admin JWT token');
  }
  
  console.log('\n🎉 Test suite completed!');
  console.log('================================================');
}

// Run the tests
runTests().catch(console.error);