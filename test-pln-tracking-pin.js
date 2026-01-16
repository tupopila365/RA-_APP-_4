/**
 * Test PLN Tracking with Universal PIN (12345)
 * 
 * This script tests the new PIN-based tracking system where:
 * 1. Users enter their Reference ID (PLN-YYYY-XXXXXXXXXXXX)
 * 2. Everyone uses the same PIN: 12345
 * 3. System validates both Reference ID exists and PIN is correct
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test tracking with correct PIN
 */
async function testTrackingWithCorrectPIN(referenceId) {
  log('\n=== Test 1: Tracking with Correct PIN (12345) ===', 'cyan');
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/pln/track/${referenceId}/12345`
    );

    if (response.data.success) {
      log('✓ SUCCESS: Application found with correct PIN', 'green');
      log(`  Reference ID: ${response.data.data.application.referenceId}`, 'blue');
      log(`  Applicant: ${response.data.data.application.fullName}`, 'blue');
      log(`  Status: ${response.data.data.application.status}`, 'blue');
      return true;
    } else {
      log('✗ FAILED: Unexpected response format', 'red');
      return false;
    }
  } catch (error) {
    log('✗ FAILED: Error tracking application', 'red');
    if (error.response) {
      log(`  Status: ${error.response.status}`, 'red');
      log(`  Message: ${error.response.data.error?.message || 'Unknown error'}`, 'red');
    } else {
      log(`  Error: ${error.message}`, 'red');
    }
    return false;
  }
}

/**
 * Test tracking with incorrect PIN
 */
async function testTrackingWithIncorrectPIN(referenceId) {
  log('\n=== Test 2: Tracking with Incorrect PIN (99999) ===', 'cyan');
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/pln/track/${referenceId}/99999`
    );

    log('✗ FAILED: Should have rejected incorrect PIN', 'red');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      log('✓ SUCCESS: Correctly rejected incorrect PIN', 'green');
      log(`  Message: ${error.response.data.error?.message}`, 'blue');
      return true;
    } else {
      log('✗ FAILED: Wrong error response', 'red');
      if (error.response) {
        log(`  Status: ${error.response.status}`, 'red');
        log(`  Message: ${error.response.data.error?.message || 'Unknown error'}`, 'red');
      }
      return false;
    }
  }
}

/**
 * Test tracking with non-existent reference ID
 */
async function testTrackingWithInvalidReferenceId() {
  log('\n=== Test 3: Tracking with Invalid Reference ID ===', 'cyan');
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/pln/track/PLN-2024-INVALID123/12345`
    );

    log('✗ FAILED: Should have returned 404 for invalid reference ID', 'red');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      log('✓ SUCCESS: Correctly returned 404 for invalid reference ID', 'green');
      log(`  Message: ${error.response.data.error?.message}`, 'blue');
      return true;
    } else {
      log('✗ FAILED: Wrong error response', 'red');
      if (error.response) {
        log(`  Status: ${error.response.status}`, 'red');
        log(`  Message: ${error.response.data.error?.message || 'Unknown error'}`, 'red');
      }
      return false;
    }
  }
}

/**
 * Test tracking with empty PIN
 */
async function testTrackingWithEmptyPIN(referenceId) {
  log('\n=== Test 4: Tracking with Empty PIN ===', 'cyan');
  
  try {
    const response = await axios.get(
      `${API_BASE_URL}/pln/track/${referenceId}/`
    );

    log('✗ FAILED: Should have rejected empty PIN', 'red');
    return false;
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 404)) {
      log('✓ SUCCESS: Correctly rejected empty PIN', 'green');
      log(`  Status: ${error.response.status}`, 'blue');
      return true;
    } else {
      log('✗ FAILED: Wrong error response', 'red');
      if (error.response) {
        log(`  Status: ${error.response.status}`, 'red');
      }
      return false;
    }
  }
}

/**
 * Get a test reference ID from existing applications
 */
async function getTestReferenceId() {
  log('\n=== Getting Test Reference ID ===', 'cyan');
  
  try {
    // Try to get existing applications (this requires admin auth, so we'll use a workaround)
    // For testing, we'll use a known reference ID or create one
    
    // Check if there are any existing applications by trying a common pattern
    log('Note: Using a test reference ID. Make sure you have at least one PLN application in the database.', 'yellow');
    log('You can create one through the mobile app or admin panel.', 'yellow');
    
    // Return null to indicate we need a manual reference ID
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   PLN Tracking with Universal PIN (12345) - Test Suite    ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  log('\nBackend URL: ' + API_BASE_URL, 'blue');
  log('Universal PIN: 12345', 'blue');
  
  // Get test reference ID
  let referenceId = await getTestReferenceId();
  
  if (!referenceId) {
    // Prompt for manual reference ID
    log('\n⚠ Please provide a test Reference ID:', 'yellow');
    log('  You can find one by:', 'yellow');
    log('  1. Creating a PLN application through the mobile app', 'yellow');
    log('  2. Checking the admin panel for existing applications', 'yellow');
    log('  3. Looking at the MongoDB database', 'yellow');
    
    // For automated testing, use a placeholder
    referenceId = process.argv[2];
    
    if (!referenceId) {
      log('\n✗ No reference ID provided. Usage:', 'red');
      log('  node test-pln-tracking-pin.js PLN-2024-XXXXXXXXXXXX', 'yellow');
      process.exit(1);
    }
  }
  
  log(`\nUsing Reference ID: ${referenceId}`, 'blue');
  
  // Run tests
  const results = [];
  
  results.push(await testTrackingWithCorrectPIN(referenceId));
  results.push(await testTrackingWithIncorrectPIN(referenceId));
  results.push(await testTrackingWithInvalidReferenceId());
  results.push(await testTrackingWithEmptyPIN(referenceId));
  
  // Summary
  log('\n╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                      Test Summary                          ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  log(`\nTests Passed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n✓ All tests passed! The PIN-based tracking system is working correctly.', 'green');
    log('\nKey Features Verified:', 'green');
    log('  ✓ Users can track with Reference ID + PIN (12345)', 'green');
    log('  ✓ Invalid PINs are rejected', 'green');
    log('  ✓ Invalid Reference IDs return 404', 'green');
    log('  ✓ Empty PINs are rejected', 'green');
  } else {
    log('\n✗ Some tests failed. Please check the errors above.', 'red');
  }
  
  log('\n');
}

// Run tests
runTests().catch(error => {
  log('\n✗ Fatal error running tests:', 'red');
  console.error(error);
  process.exit(1);
});
