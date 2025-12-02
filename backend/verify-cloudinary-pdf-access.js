/**
 * Verification script to test Cloudinary PDF access
 * This script tests if PDFs uploaded to Cloudinary are publicly accessible
 */

const axios = require('axios');

// The failing URL from the user's report
const testURL = 'https://res.cloudinary.com/dmsgvrkp5/raw/upload/v1764616213/documents/doc_1764616065760_Industry%20Visit%20Planner%20-%20Group%202%202025%20Sem%202%20%281%29.pdf';

async function verifyPDFAccess(url) {
  console.log('\n=== Cloudinary PDF Access Verification ===\n');
  console.log('Testing URL:', url);
  console.log('\nAttempting HEAD request...\n');

  try {
    const response = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
    });

    console.log('✅ SUCCESS! PDF is publicly accessible');
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Content-Length:', response.headers['content-length']);
    console.log('\nThe PDF can be downloaded without authentication.');
    return true;
  } catch (error) {
    console.log('❌ FAILED! PDF is NOT publicly accessible');
    console.log('Status:', error.response?.status || 'No response');
    console.log('Error:', error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  401 Unauthorized Error Detected');
      console.log('This means the PDF requires authentication to access.');
      console.log('\nPossible causes:');
      console.log('1. The PDF was uploaded with type: "authenticated" instead of type: "upload"');
      console.log('2. The access_mode was not explicitly set to "public"');
      console.log('3. The Cloudinary account has default security settings that require authentication');
      console.log('\n📋 Solution:');
      console.log('Re-upload the PDF with the following Cloudinary options:');
      console.log('  - resource_type: "raw"');
      console.log('  - type: "upload"');
      console.log('  - access_mode: "public"');
    }
    
    return false;
  }
}

// Run the verification
verifyPDFAccess(testURL)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
