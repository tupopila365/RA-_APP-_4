#!/usr/bin/env node

/**
 * Check the actual length of PLN reference IDs
 */

console.log('🔍 Checking PLN Reference ID Length...\n');

// Test the format we thought was correct
const testId = 'PLN-2024-ABC123DEF456';
console.log('Expected format: PLN-YYYY-XXXXXXXXXXXX');
console.log('Test ID:', testId);
console.log('Length:', testId.length);
console.log('');

// Generate using backend format (21 characters)
const year = new Date().getFullYear();
const alphabet = '123456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
let secureRandom12 = '';
for (let i = 0; i < 12; i++) {
  secureRandom12 += alphabet[Math.floor(Math.random() * alphabet.length)];
}
const id21 = `PLN-${year}-${secureRandom12}`;
console.log('Backend format (21 chars):', id21);
console.log('Length:', id21.length);
console.log('');

// If user says 22 characters, maybe it's 13 random chars
let secureRandom13 = '';
for (let i = 0; i < 13; i++) {
  secureRandom13 += alphabet[Math.floor(Math.random() * alphabet.length)];
}
const id22 = `PLN-${year}-${secureRandom13}`;
console.log('Possible 22-char format:', id22);
console.log('Length:', id22.length);
console.log('');

// Break down the formats
console.log('📏 Format Analysis:');
console.log('==================');
console.log('');
console.log('21-character format (current backend):');
console.log('  PLN-     = 4 characters');
console.log('  2024-    = 5 characters (year + hyphen)');
console.log('  12chars  = 12 characters (secure random)');
console.log('  Total    = 21 characters');
console.log('  Example: PLN-2024-ABC123DEF456');
console.log('');
console.log('22-character format (if user is correct):');
console.log('  PLN-     = 4 characters');
console.log('  2024-    = 5 characters (year + hyphen)');
console.log('  13chars  = 13 characters (secure random)');
console.log('  Total    = 22 characters');
console.log('  Example: PLN-2024-ABC123DEF4567');
console.log('');

console.log('🎯 Recommendation:');
console.log('==================');
console.log('');
console.log('To be safe, we should:');
console.log('1. Set maxLength to 25 (allows for future expansion)');
console.log('2. Update validation pattern to be more flexible');
console.log('3. Test with actual reference IDs from your system');
console.log('');

console.log('💡 Next Steps:');
console.log('==============');
console.log('');
console.log('1. Check an actual reference ID from your PLN application');
console.log('2. Count the exact characters');
console.log('3. Update maxLength to accommodate the real format');
console.log('4. Update validation pattern if needed');
console.log('');

console.log('Can you share an example reference ID from your system?');
console.log('(You can replace some characters with X for privacy)');