/**
 * Test script to debug news deletion
 * 
 * Usage:
 * 1. Get your access token from browser localStorage (ra_admin_access_token)
 * 2. Get a news article ID from the news list
 * 3. Run: node test-news-delete.js YOUR_TOKEN NEWS_ID
 */

const https = require('https');
const http = require('http');

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error('Usage: node test-news-delete.js <ACCESS_TOKEN> <NEWS_ID>');
  console.error('');
  console.error('Example:');
  console.error('  node test-news-delete.js eyJhbGc... 674a1b2c3d4e5f6g7h8i9j0k');
  process.exit(1);
}

const [accessToken, newsId] = args;
const baseUrl = process.env.API_URL || 'http://localhost:5000';
const url = new URL(`${baseUrl}/api/news/${newsId}`);

console.log('Testing news deletion...');
console.log('URL:', url.href);
console.log('News ID:', newsId);
console.log('Token:', accessToken.substring(0, 20) + '...');
console.log('');

const options = {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
};

const client = url.protocol === 'https:' ? https : http;

const req = client.request(url, options, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Status Message:', res.statusMessage);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  console.log('');

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response Body:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ SUCCESS: News article deleted successfully!');
      } else if (res.statusCode === 401) {
        console.log('\n❌ ERROR: Authentication failed. Your token might be expired or invalid.');
        console.log('   Try logging out and back in to get a fresh token.');
      } else if (res.statusCode === 403) {
        console.log('\n❌ ERROR: Permission denied. You need the "news:manage" permission.');
        console.log('   Check your user permissions in the database.');
      } else if (res.statusCode === 404) {
        console.log('\n❌ ERROR: News article not found. Check the ID is correct.');
      } else {
        console.log('\n❌ ERROR: Unexpected error occurred.');
      }
    } catch (e) {
      console.log(data);
      console.log('\n❌ ERROR: Could not parse response as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.error('');
  console.error('Possible causes:');
  console.error('  - Backend server is not running');
  console.error('  - Wrong URL (check API_URL environment variable)');
  console.error('  - Network connectivity issues');
});

req.end();
