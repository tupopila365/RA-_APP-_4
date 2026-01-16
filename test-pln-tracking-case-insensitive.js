/**
 * Test PLN Tracking with Case-Insensitive Reference ID
 * 
 * This script tests that the tracking endpoint works with:
 * - Exact case match
 * - Uppercase
 * - Lowercase
 * - Mixed case
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5001';
const REFERENCE_ID = 'PLN-2026-4efMbEiQDNxX'; // Your actual reference ID from database
const PIN = '12345';

async function testTracking(testReferenceId, testName) {
  try {
    console.log(`\n🧪 Testing: ${testName}`);
    console.log(`   Reference ID: ${testReferenceId}`);
    console.log(`   PIN: ${PIN}`);
    
    const response = await axios.get(
      `${BACKEND_URL}/api/pln/track/${testReferenceId}/${PIN}`,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      console.log(`   ✅ SUCCESS - Found application`);
      console.log(`   Reference ID in DB: ${response.data.data.application.referenceId}`);
      console.log(`   Applicant: ${response.data.data.application.fullName}`);
      console.log(`   Status: ${response.data.data.application.status}`);
      return true;
    } else {
      console.log(`   ❌ FAILED - ${response.data.error?.message}`);
      return false;
    }
  } catch (error) {
    if (error.response) {
      console.log(`   ❌ FAILED - ${error.response.status}: ${error.response.data.error?.message}`);
    } else if (error.code === 'ECONNREFUSED') {
      console.log(`   ❌ FAILED - Backend not running at ${BACKEND_URL}`);
    } else {
      console.log(`   ❌ FAILED - ${error.message}`);
    }
    return false;
  }
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 PLN Tracking Case-Insensitive Test');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`Backend: ${BACKEND_URL}`);
  console.log(`Database Reference ID: ${REFERENCE_ID}`);
  console.log('═══════════════════════════════════════════════════════════');

  const tests = [
    { id: REFERENCE_ID, name: 'Exact Case (as stored in DB)' },
    { id: REFERENCE_ID.toUpperCase(), name: 'All Uppercase' },
    { id: REFERENCE_ID.toLowerCase(), name: 'All Lowercase' },
    { id: 'pln-2026-4EFMBEIQDN XX', name: 'Mixed Case Variation' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testTracking(test.id, test.name);
    if (result) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 Test Results');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${passed}/${tests.length}`);
  console.log(`❌ Failed: ${failed}/${tests.length}`);
  console.log('═══════════════════════════════════════════════════════════');

  if (passed === tests.length) {
    console.log('\n🎉 All tests passed! Case-insensitive matching is working.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the backend implementation.');
  }
}

// Run tests
runTests().catch(console.error);
