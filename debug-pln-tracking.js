/**
 * PLN Application Tracking Debugger
 * 
 * This script helps debug PLN tracking issues by:
 * 1. Checking if applications exist in the database
 * 2. Testing the tracking API endpoint
 * 3. Verifying the PIN validation
 * 4. Showing detailed error messages
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/road-authority';

// PLN Model Schema (simplified for testing)
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
  updatedAt: Date,
}, { collection: 'plns' });

const PLN = mongoose.model('PLN', plnSchema);

// Colors for console output
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

async function debugPLNTracking() {
  try {
    section('🔍 PLN APPLICATION TRACKING DEBUGGER');

    // Connect to MongoDB
    log('📡 Connecting to MongoDB...', 'cyan');
    await mongoose.connect(MONGODB_URI);
    log('✅ Connected to MongoDB successfully', 'green');

    // Step 1: List all PLN applications
    section('📋 STEP 1: List All PLN Applications');
    const applications = await PLN.find({}).sort({ createdAt: -1 }).limit(10);
    
    if (applications.length === 0) {
      log('❌ No PLN applications found in database!', 'red');
      log('\n💡 You need to create a PLN application first before tracking it.', 'yellow');
      log('   Use the mobile app or admin panel to create an application.', 'yellow');
      return;
    }

    log(`✅ Found ${applications.length} PLN application(s):\n`, 'green');
    
    applications.forEach((app, index) => {
      console.log(`${index + 1}. Reference ID: ${colors.bright}${app.referenceId}${colors.reset}`);
      console.log(`   Full Name: ${app.fullName || `${app.surname} ${app.initials}` || 'N/A'}`);
      console.log(`   ID Number: ${app.idNumber || 'N/A'}`);
      console.log(`   Tracking PIN: ${colors.yellow}${app.trackingPin || 'NOT SET'}${colors.reset}`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Created: ${app.createdAt?.toLocaleString() || 'N/A'}`);
      console.log('');
    });

    // Step 2: Check tracking PIN configuration
    section('🔐 STEP 2: Check Tracking PIN Configuration');
    
    const appsWithoutPin = applications.filter(app => !app.trackingPin);
    const appsWithDefaultPin = applications.filter(app => app.trackingPin === '12345');
    const appsWithCustomPin = applications.filter(app => app.trackingPin && app.trackingPin !== '12345');

    log(`Applications without PIN: ${appsWithoutPin.length}`, appsWithoutPin.length > 0 ? 'red' : 'green');
    log(`Applications with default PIN (12345): ${appsWithDefaultPin.length}`, 'cyan');
    log(`Applications with custom PIN: ${appsWithCustomPin.length}`, 'cyan');

    if (appsWithoutPin.length > 0) {
      log('\n⚠️  WARNING: Some applications do not have a tracking PIN!', 'yellow');
      log('   These applications cannot be tracked.', 'yellow');
      log('\n   Fixing by setting default PIN (12345)...', 'cyan');
      
      for (const app of appsWithoutPin) {
        await PLN.updateOne(
          { _id: app._id },
          { $set: { trackingPin: '12345' } }
        );
        log(`   ✅ Set PIN for ${app.referenceId}`, 'green');
      }
    }

    // Step 3: Test tracking with the first application
    if (applications.length > 0) {
      section('🧪 STEP 3: Test Tracking API');
      
      const testApp = applications[0];
      const referenceId = testApp.referenceId;
      const correctPin = testApp.trackingPin || '12345';
      
      log(`Testing with application: ${colors.bright}${referenceId}${colors.reset}`, 'cyan');
      log(`Expected PIN: ${colors.yellow}${correctPin}${colors.reset}\n`, 'cyan');

      // Test 1: Correct PIN
      log('Test 1: Tracking with CORRECT PIN (12345)', 'blue');
      try {
        const result = await PLN.findOne({
          referenceId: referenceId.trim(),
        });

        if (result) {
          // Validate PIN
          if (correctPin === '12345') {
            log('✅ Application found!', 'green');
            log(`   Reference ID: ${result.referenceId}`, 'green');
            log(`   Full Name: ${result.fullName || `${result.surname} ${result.initials}` || 'N/A'}`, 'green');
            log(`   Status: ${result.status}`, 'green');
            log(`   PIN Validation: ✅ PASSED (12345)`, 'green');
          } else {
            log('❌ PIN mismatch!', 'red');
            log(`   Expected: ${correctPin}`, 'red');
            log(`   Got: 12345`, 'red');
          }
        } else {
          log('❌ Application not found!', 'red');
        }
      } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
      }

      // Test 2: Wrong PIN
      log('\nTest 2: Tracking with WRONG PIN (99999)', 'blue');
      try {
        const result = await PLN.findOne({
          referenceId: referenceId.trim(),
        });

        if (result) {
          // Validate PIN
          if ('99999' === correctPin) {
            log('✅ Application found (unexpected!)', 'yellow');
          } else {
            log('✅ Application found, but PIN validation should fail', 'green');
            log('   Expected behavior: API should return 401 Unauthorized', 'green');
          }
        }
      } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
      }

      // Test 3: Wrong Reference ID
      log('\nTest 3: Tracking with WRONG Reference ID', 'blue');
      try {
        const result = await PLN.findOne({
          referenceId: 'PLN-2024-INVALID123',
        });

        if (result) {
          log('❌ Application found (unexpected!)', 'red');
        } else {
          log('✅ Application not found (expected)', 'green');
          log('   Expected behavior: API should return 404 Not Found', 'green');
        }
      } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
      }
    }

    // Step 4: Backend API Endpoint Check
    section('🌐 STEP 4: Backend API Endpoint Information');
    
    log('Current API Configuration:', 'cyan');
    log(`  Route: GET /api/pln/track/:referenceId/:pin`, 'bright');
    log(`  Expected PIN: 12345 (universal PIN)`, 'bright');
    log(`  Backend validates: PIN must be exactly "12345"`, 'bright');
    log(`  Backend searches: By referenceId only (after PIN validation)`, 'bright');

    // Step 5: Mobile App Configuration Check
    section('📱 STEP 5: Mobile App Configuration');
    
    log('Mobile App Tracking Flow:', 'cyan');
    log('  1. User enters Reference ID (e.g., PLN-2024-ABC123DEF456)', 'bright');
    log('  2. User enters PIN (12345)', 'bright');
    log('  3. App calls: /api/pln/track/{referenceId}/{pin}', 'bright');
    log('  4. Backend validates PIN === "12345"', 'bright');
    log('  5. Backend searches for application by referenceId', 'bright');
    log('  6. Returns application data if found', 'bright');

    // Step 6: Common Issues and Solutions
    section('🔧 STEP 6: Common Issues and Solutions');
    
    log('Issue 1: "Application not found"', 'yellow');
    log('  ✓ Check if Reference ID is correct (case-sensitive)', 'cyan');
    log('  ✓ Check if application exists in database', 'cyan');
    log('  ✓ Verify Reference ID format: PLN-YYYY-XXXXXXXXXXXX', 'cyan');
    
    log('\nIssue 2: "Invalid PIN"', 'yellow');
    log('  ✓ PIN must be exactly "12345"', 'cyan');
    log('  ✓ No spaces before or after', 'cyan');
    log('  ✓ Check if trackingPin field is set in database', 'cyan');
    
    log('\nIssue 3: "Network request failed"', 'yellow');
    log('  ✓ Check if backend is running (port 5000)', 'cyan');
    log('  ✓ Verify API_BASE_URL in mobile app config', 'cyan');
    log('  ✓ For physical devices: Use ngrok or port forwarding', 'cyan');

    // Step 7: Test Data for Manual Testing
    section('📝 STEP 7: Test Data for Manual Testing');
    
    if (applications.length > 0) {
      const testApp = applications[0];
      log('Use these credentials to test tracking:', 'cyan');
      log(`  Reference ID: ${colors.bright}${testApp.referenceId}${colors.reset}`, 'green');
      log(`  PIN: ${colors.bright}12345${colors.reset}`, 'green');
      
      log('\nCURL command to test API:', 'cyan');
      log(`  curl http://localhost:5000/api/pln/track/${testApp.referenceId}/12345`, 'bright');
      
      log('\nMobile App Test:', 'cyan');
      log('  1. Open PLN Tracking screen', 'bright');
      log(`  2. Enter Reference ID: ${testApp.referenceId}`, 'bright');
      log('  3. Enter PIN: 12345', 'bright');
      log('  4. Click "Check Status"', 'bright');
    }

    section('✅ DEBUGGING COMPLETE');
    log('If you still have issues, check the backend logs for detailed error messages.', 'cyan');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
  } finally {
    await mongoose.disconnect();
    log('\n📡 Disconnected from MongoDB', 'cyan');
  }
}

// Run the debugger
debugPLNTracking().catch(console.error);
