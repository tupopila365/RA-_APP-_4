/**
 * Check Cloudinary configuration
 * Run this to verify your Cloudinary credentials are set correctly
 */

require('dotenv').config({ path: './backend/.env' });

console.log('🔍 Checking Cloudinary Configuration...\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Cloud Name:', cloudName || '❌ NOT SET');
console.log('API Key:   ', apiKey || '❌ NOT SET');
console.log('API Secret:', apiSecret ? (apiSecret.includes('REPLACE') ? '❌ NOT SET (placeholder)' : '✅ SET') : '❌ NOT SET');

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (!cloudName || !apiKey || !apiSecret) {
  console.log('❌ CLOUDINARY NOT CONFIGURED\n');
  console.log('Missing credentials. Please add them to backend/.env:\n');
  console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('CLOUDINARY_API_KEY=your_api_key');
  console.log('CLOUDINARY_API_SECRET=your_api_secret\n');
  console.log('Get these from: https://cloudinary.com/console\n');
  process.exit(1);
}

if (apiSecret.includes('REPLACE') || apiSecret.includes('*')) {
  console.log('❌ API SECRET IS PLACEHOLDER\n');
  console.log('You need to replace the placeholder with your actual API secret.\n');
  console.log('Steps:');
  console.log('1. Go to https://cloudinary.com/console');
  console.log('2. Log in');
  console.log('3. On Dashboard, click the eye icon (👁️) next to "API Secret"');
  console.log('4. Copy the revealed secret');
  console.log('5. Update backend/.env with the actual secret\n');
  process.exit(1);
}

console.log('✅ CLOUDINARY CONFIGURED\n');
console.log('All credentials are set. Upload should work!\n');
console.log('If upload still fails:');
console.log('1. Restart backend server');
console.log('2. Check backend logs for detailed error');
console.log('3. Verify credentials are correct at https://cloudinary.com/console\n');
