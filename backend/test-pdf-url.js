/**
 * Quick script to test if a Cloudinary PDF URL is publicly accessible
 * Usage: node test-pdf-url.js "YOUR_PDF_URL_HERE"
 */

const axios = require('axios');

const url = process.argv[2];

if (!url) {
  console.error('❌ Error: Please provide a PDF URL as an argument');
  console.log('\nUsage:');
  console.log('  node test-pdf-url.js "https://res.cloudinary.com/..."');
  process.exit(1);
}

async function testPDFAccess(url) {
  console.log('\n🔍 Testing PDF URL accessibility...\n');
  console.log('URL:', url);
  console.log('');

  try {
    const response = await axios.head(url, {
      timeout: 10000,
      maxRedirects: 5,
    });

    console.log('✅ SUCCESS! PDF is publicly accessible\n');
    console.log('Status:', response.status, response.statusText);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Content-Length:', response.headers['content-length'], 'bytes');
    
    if (response.headers['content-length']) {
      const sizeInMB = (parseInt(response.headers['content-length']) / 1024 / 1024).toFixed(2);
      console.log('Size:', sizeInMB, 'MB');
    }
    
    console.log('\n✅ The PDF can be downloaded without authentication.');
    console.log('✅ RAG service should be able to process this PDF.');
    return true;
  } catch (error) {
    console.log('❌ FAILED! PDF is NOT publicly accessible\n');
    console.log('Status:', error.response?.status || 'No response');
    console.log('Error:', error.message);
    
    if (error.response?.status === 401) {
      console.log('\n⚠️  401 Unauthorized Error');
      console.log('This PDF requires authentication to access.\n');
      console.log('📋 Solution: Re-upload the PDF with the fixed backend code.');
      console.log('The new upload will include access_mode: "public"');
    } else if (error.response?.status === 404) {
      console.log('\n⚠️  404 Not Found Error');
      console.log('This PDF does not exist on Cloudinary.');
      console.log('Check if the URL is correct or if the file was deleted.');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.log('\n⚠️  Network Error');
      console.log('Could not reach Cloudinary. Check your internet connection.');
    }
    
    return false;
  }
}

testPDFAccess(url)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Unexpected error:', error.message);
    process.exit(1);
  });
