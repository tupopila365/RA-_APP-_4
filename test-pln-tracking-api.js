/**
 * PLN Tracking API Tester
 * 
 * Tests the PLN tracking API endpoint directly
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/road-authority';

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(80));
  log(title, 'bright');
  console.log('='.repeat(80) + '\n');
}

// PLN Model
const plnSchema = new mongoose.Schema({
  referenceId: String,
  trackingPin: String,
  idNumber: String,
  fullName: String,
  surname: String,
  initials: String,
  status: String,
  plateChoices: Array,
  createdAt: Date,
}, { collection: 'plns' });

const PLN = mongoose.model('PLN', plnSchema);

async function testPLNTrackingAPI() {
  try {
    section('🧪 PLN TRACKING API TESTER');

    // Connect to MongoDB to get test data
    log('📡 Connecting to MongoDB...', 'cyan');
    await mongoose.connect(MONGODB_URI);
    log('✅ Connected to MongoDB', 'green');

    // Get a test application
    const testApp = await PLN.findOne({}).sort({ createdAt: -1 });
    
    if (!testApp) {
      log('❌ No PLN applications found in database!', 'red');
      log('   Create an application first before testing tracking.', 'yellow');
      await mongoose.disconnect();
      return;
    }

    const referenceId = testApp.referenceId;
    const correctPin = testApp.trackingPin || '12345';

    log(`\nTest Application:`, 'cyan');
    log(`  Reference ID: ${colors.bright}${referenceId}${colors.reset}`);
    log(`  Full Name: ${testApp.fullName || `${testApp.surname} ${testApp.initials}` || 'N/A'}`);
    log(`  Status: ${testApp.status}`);
    log(`  Tracking PIN: ${colors.yellow}${correctPin}${colors.reset}`);

    await mongoose.disconnect();
    log('📡 Disconnected from MongoDB\n', 'cyan');

    // Test 1: Valid tracking request
    section('✅ TEST 1: Valid Tracking Request');
    log(`URL: ${API_BASE_URL}/pln/track/${referenceId}/12345`, 'cyan');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/pln/track/${referenceId}/12345`);
      
      if (response.data.success) {
        log('✅ SUCCESS: Application found!', 'green');
        log(`\nResponse Data:`, 'cyan');
        console.log(JSON.stringify(response.data, null, 2));
        
        const app = response.data.data.application;
        log(`\nApplication Details:`, 'cyan');
        log(`  Reference ID: ${app.referenceId}`, 'green');
        log(`  Full Name: ${app.fullName}`, 'green');
        log(`  Status: ${app.status}`, 'green');
        log(`  Created: ${new Date(app.createdAt).toLocaleString()}`, 'green');
      } else {
        log('❌ FAILED: API returned success=false', 'red');
        console.log(response.data);
      }
    } catch (error) {
      log('❌ FAILED: Request error', 'red');
      if (error.response) {
        log(`  Status: ${error.response.status}`, 'red');
        log(`  Message: ${error.response.data?.error?.message || error.response.data?.message || 'Unknown error'}`, 'red');
        console.log('\nFull error response:', error.response.data);
      } else if (error.request) {
        log('  No response received from server', 'red');
        log(`  Is the backend running on ${API_BASE_URL}?`, 'yellow');
      } else {
        log(`  Error: ${error.message}`, 'red');
      }
    }

    // Test 2: Invalid PIN
    section('❌ TEST 2: Invalid PIN (should fail with 401)');
    log(`URL: ${API_BASE_URL}/pln/track/${referenceId}/99999`, 'cyan');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/pln/track/${referenceId}/99999`);
      log('❌ UNEXPECTED: Request succeeded (should have failed)', 'red');
      console.log(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        log('✅ EXPECTED: Got 401 Unauthorized', 'green');
        log(`  Message: ${error.response.data?.error?.message || error.response.data?.message}`, 'green');
      } else {
        log('❌ UNEXPECTED: Got different error', 'red');
        if (error.response) {
          log(`  Status: ${error.response.status}`, 'red');
          log(`  Message: ${error.response.data?.error?.message || error.response.data?.message}`, 'red');
        }
      }
    }

    // Test 3: Invalid Reference ID
    section('❌ TEST 3: Invalid Reference ID (should fail with 404)');
    log(`URL: ${API_BASE_URL}/pln/track/PLN-2024-INVALID123/12345`, 'cyan');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/pln/track/PLN-2024-INVALID123/12345`);
      log('❌ UNEXPECTED: Request succeeded (should have failed)', 'red');
      console.log(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        log('✅ EXPECTED: Got 404 Not Found', 'green');
        log(`  Message: ${error.response.data?.error?.message || error.response.data?.message}`, 'green');
      } else {
        log('❌ UNEXPECTED: Got different error', 'red');
        if (error.response) {
          log(`  Status: ${error.response.status}`, 'red');
          log(`  Message: ${error.response.data?.error?.message || error.response.data?.message}`, 'red');
        }
      }
    }

    // Test 4: Missing parameters
    section('❌ TEST 4: Missing PIN (should fail with 400)');
    log(`URL: ${API_BASE_URL}/pln/track/${referenceId}/`, 'cyan');
    
    try {
      const response = await axios.get(`${API_BASE_URL}/pln/track/${referenceId}/`);
      log('❌ UNEXPECTED: Request succeeded (should have failed)', 'red');
      console.log(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        log('✅ Route not found (expected - missing parameter)', 'green');
      } else if (error.response && error.response.status === 400) {
        log('✅ EXPECTED: Got 400 Bad Request', 'green');
        log(`  Message: ${error.response.data?.error?.message || error.response.data?.message}`, 'green');
      } else {
        log('⚠️  Got different error (acceptable)', 'yellow');
        if (error.response) {
          log(`  Status: ${error.response.status}`, 'yellow');
        }
      }
    }

    // Summary
    section('📊 TEST SUMMARY');
    log('Backend API Endpoint: ' + API_BASE_URL, 'cyan');
    log('Test Reference ID: ' + referenceId, 'cyan');
    log('Expected PIN: 12345', 'cyan');
    
    log('\n✅ If all tests passed:', 'green');
    log('  - Backend is working correctly', 'green');
    log('  - Tracking API is functional', 'green');
    log('  - PIN validation is working', 'green');
    
    log('\n❌ If tests failed:', 'red');
    log('  - Check if backend is running', 'red');
    log('  - Verify API_BASE_URL is correct', 'red');
    log('  - Check backend logs for errors', 'red');
    log('  - Ensure MongoDB is running', 'red');

    section('🎯 NEXT STEPS');
    log('1. If backend tests pass but mobile app fails:', 'cyan');
    log('   - Check mobile app API_BASE_URL configuration', 'bright');
    log('   - Verify network connectivity (WiFi/USB)', 'bright');
    log('   - Check if using correct IP address', 'bright');
    
    log('\n2. Test in mobile app with these credentials:', 'cyan');
    log(`   Reference ID: ${colors.bright}${referenceId}${colors.reset}`, 'green');
    log(`   PIN: ${colors.bright}12345${colors.reset}`, 'green');

  } catch (error) {
    log(`\n❌ Fatal Error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run the tests
testPLNTrackingAPI().catch(console.error);
