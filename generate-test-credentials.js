#!/usr/bin/env node

/**
 * Generate test credentials for PLN tracking
 */

// Generate a valid reference ID using the same format as the backend
function generateTestReferenceId() {
  const alphabet = '123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  const year = new Date().getFullYear();
  
  // Generate 12-character secure random string
  let secureRandom = '';
  for (let i = 0; i < 12; i++) {
    secureRandom += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  
  return `PLN-${year}-${secureRandom}`;
}

console.log('🧪 PLN Tracking Test Credentials\n');

// Generate test credentials
const testReferenceId = generateTestReferenceId();
const testTrackingPin = '12345'; // Standard PIN used in the system

console.log('📋 Test Credentials for PLN Tracking:');
console.log('=====================================');
console.log(`Reference ID: ${testReferenceId}`);
console.log(`Tracking PIN: ${testTrackingPin}`);
console.log('');

console.log('📏 Validation Check:');
console.log(`Reference ID Length: ${testReferenceId.length} characters (should be 20)`);
console.log(`Tracking PIN Length: ${testTrackingPin.length} characters (should be 5)`);
console.log('');

// Validate the generated credentials
const refPattern = /^PLN-\d{4}-[123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz]{12}$/;
const pinPattern = /^\d{5}$/;

const refValid = refPattern.test(testReferenceId);
const pinValid = pinPattern.test(testTrackingPin);

console.log('✅ Validation Results:');
console.log(`Reference ID Format: ${refValid ? '✅ Valid' : '❌ Invalid'}`);
console.log(`Tracking PIN Format: ${pinValid ? '✅ Valid' : '❌ Invalid'}`);
console.log('');

console.log('📱 How to Test:');
console.log('1. Open the PLN Tracking screen in your app');
console.log('2. Enter the Reference ID above (all 20 characters should fit)');
console.log('3. Enter the Tracking PIN above (5 digits)');
console.log('4. Tap "Track Application"');
console.log('');

console.log('⚠️  Note:');
console.log('These are generated test credentials. The tracking will likely');
console.log('return "Application Not Found" since this is not a real application.');
console.log('The purpose is to test that the input fields accept the full');
console.log('reference ID and PIN without character cutoff.');
console.log('');

console.log('🔍 Alternative Test Options:');
console.log('1. Check if there are existing applications in your database');
console.log('2. Create a real PLN application first, then use those credentials');
console.log('3. Use these credentials to verify input field functionality only');