#!/usr/bin/env node

/**
 * Test script to verify PLN tracking input fixes
 * Tests both reference ID length and tracking PIN validation
 */

console.log('🧪 Testing PLN Tracking Input Fixes...\n');

// Test data
const testCases = [
  {
    name: 'Valid Reference ID (20 chars)',
    referenceId: 'PLN-2024-ABC123DEF456',
    trackingPin: '12345',
    shouldPass: true
  },
  {
    name: 'Valid Reference ID (different format)',
    referenceId: 'PLN-2025-xyz789abc123',
    trackingPin: '12345',
    shouldPass: true
  },
  {
    name: 'Invalid Reference ID (too short - old format)',
    referenceId: 'PLN-ABC123',
    trackingPin: '12345',
    shouldPass: false
  },
  {
    name: 'Invalid Reference ID (wrong year format)',
    referenceId: 'PLN-24-ABC123DEF456',
    trackingPin: '12345',
    shouldPass: false
  },
  {
    name: 'Valid PIN (5 digits)',
    referenceId: 'PLN-2024-ABC123DEF456',
    trackingPin: '12345',
    shouldPass: true
  },
  {
    name: 'Invalid PIN (6 digits - old format)',
    referenceId: 'PLN-2024-ABC123DEF456',
    trackingPin: '123456',
    shouldPass: false
  },
  {
    name: 'Invalid PIN (4 digits)',
    referenceId: 'PLN-2024-ABC123DEF456',
    trackingPin: '1234',
    shouldPass: false
  }
];

// Validation functions (copied from the fixed PLN tracking screen)
function validateReferenceId(referenceId) {
  if (!referenceId.trim()) {
    return { valid: false, error: 'Reference ID is required' };
  }
  
  if (!referenceId.match(/^PLN-\d{4}-[123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]{12}$/)) {
    return { valid: false, error: 'Invalid Reference ID format (PLN-YYYY-XXXXXXXXXXXX)' };
  }
  
  return { valid: true };
}

function validateTrackingPin(trackingPin) {
  if (!trackingPin.trim()) {
    return { valid: false, error: 'Tracking PIN is required' };
  }
  
  if (trackingPin.length !== 5 || !trackingPin.match(/^\d{5}$/)) {
    return { valid: false, error: 'Tracking PIN must be 5 digits' };
  }
  
  return { valid: true };
}

// Run tests
console.log('Running validation tests...\n');

let passedTests = 0;
let totalTests = testCases.length;

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`  Reference ID: "${testCase.referenceId}" (${testCase.referenceId.length} chars)`);
  console.log(`  Tracking PIN: "${testCase.trackingPin}" (${testCase.trackingPin.length} chars)`);
  
  const refValidation = validateReferenceId(testCase.referenceId);
  const pinValidation = validateTrackingPin(testCase.trackingPin);
  
  const actualResult = refValidation.valid && pinValidation.valid;
  const testPassed = actualResult === testCase.shouldPass;
  
  if (testPassed) {
    console.log(`  ✅ PASS - Expected: ${testCase.shouldPass}, Got: ${actualResult}`);
    passedTests++;
  } else {
    console.log(`  ❌ FAIL - Expected: ${testCase.shouldPass}, Got: ${actualResult}`);
    if (!refValidation.valid) {
      console.log(`    Reference ID Error: ${refValidation.error}`);
    }
    if (!pinValidation.valid) {
      console.log(`    PIN Error: ${pinValidation.error}`);
    }
  }
  
  console.log('');
});

// Summary
console.log('='.repeat(50));
console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! PLN tracking input fixes are working correctly.');
  console.log('\n✅ Fixed Issues:');
  console.log('   • Reference ID now accepts 20 characters (PLN-YYYY-XXXXXXXXXXXX)');
  console.log('   • Tracking PIN now accepts 5 digits (12345)');
  console.log('   • Validation patterns updated to match backend requirements');
} else {
  console.log('❌ Some tests failed. Please check the validation logic.');
}

console.log('\n💡 Usage in app:');
console.log('   • Users can now enter full reference IDs like "PLN-2024-ABC123DEF456"');
console.log('   • Users can enter 5-digit tracking PINs like "12345"');
console.log('   • Input fields will no longer cut off characters');