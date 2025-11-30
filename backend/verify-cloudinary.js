require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('=== Cloudinary Configuration Verification ===\n');

// Load credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('Loaded credentials:');
console.log('Cloud Name:', cloudName ? `"${cloudName}" (length: ${cloudName.length})` : 'NOT SET');
console.log('API Key:', apiKey ? `"${apiKey}" (length: ${apiKey.length})` : 'NOT SET');
console.log('API Secret:', apiSecret ? `"${apiSecret.substring(0, 5)}..." (length: ${apiSecret.length})` : 'NOT SET');

// Check for whitespace
if (cloudName && (cloudName !== cloudName.trim())) {
  console.log('\n⚠️  WARNING: Cloud Name has leading/trailing whitespace!');
}
if (apiKey && (apiKey !== apiKey.trim())) {
  console.log('\n⚠️  WARNING: API Key has leading/trailing whitespace!');
}
if (apiSecret && (apiSecret !== apiSecret.trim())) {
  console.log('\n⚠️  WARNING: API Secret has leading/trailing whitespace!');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: cloudName?.trim(),
  api_key: apiKey?.trim(),
  api_secret: apiSecret?.trim(),
});

console.log('\n=== Testing Cloudinary Connection ===\n');

// Test with a simple API call
cloudinary.api.ping()
  .then(result => {
    console.log('✅ SUCCESS: Cloudinary connection is working!');
    console.log('Response:', result);
    
    // Test signature generation
    console.log('\n=== Testing Signature Generation ===\n');
    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      folder: 'roads-authority/pdfs',
      format: 'pdf',
      timestamp: timestamp
    };
    
    const signature = cloudinary.utils.api_sign_request(params, apiSecret?.trim());
    console.log('Generated signature for test params:', signature);
    console.log('Params used:', params);
  })
  .catch(error => {
    console.log('❌ ERROR: Cloudinary connection failed!');
    console.log('Error message:', error.message);
    if (error.http_code) {
      console.log('HTTP Code:', error.http_code);
    }
    
    console.log('\n=== Troubleshooting Steps ===');
    console.log('1. Verify your credentials at: https://console.cloudinary.com/settings/c-' + cloudName);
    console.log('2. Make sure you copied the API Secret correctly (it\'s case-sensitive)');
    console.log('3. Check if there are any spaces before or after the values in your .env file');
    console.log('4. Try regenerating your API Secret in the Cloudinary dashboard');
  });
