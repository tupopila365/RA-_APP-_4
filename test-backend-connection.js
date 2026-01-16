/**
 * Backend Connection Test
 * 
 * This script tests the connection to the backend API
 * Run with: node test-backend-connection.js
 */

const https = require('https');
const http = require('http');

// Test configuration
const API_BASE_URL = 'http://192.168.108.1:5000/api';
const ENDPOINTS_TO_TEST = [
  '/health',
  '/banners',
  '/roadworks/public',
  '/news'
];

console.log('🔍 Testing Backend Connection...');
console.log(`📡 API Base URL: ${API_BASE_URL}`);
console.log('');

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const protocol = url.startsWith('https') ? https : http;
    
    const startTime = Date.now();
    
    const req = protocol.get(url, (res) => {
      const duration = Date.now() - startTime;
      const success = res.statusCode >= 200 && res.statusCode < 400;
      
      resolve({
        endpoint,
        success,
        statusCode: res.statusCode,
        duration,
        error: null
      });
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        endpoint,
        success: false,
        statusCode: null,
        duration,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      const duration = Date.now() - startTime;
      resolve({
        endpoint,
        success: false,
        statusCode: null,
        duration,
        error: 'Request timeout (10s)'
      });
    });
  });
}

async function runTests() {
  console.log('Testing endpoints...\n');
  
  const results = [];
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    process.stdout.write(`Testing ${endpoint}... `);
    
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    if (result.success) {
      console.log(`✅ ${result.statusCode} (${result.duration}ms)`);
    } else {
      console.log(`❌ ${result.error || 'Failed'} (${result.duration}ms)`);
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`✅ Successful: ${successful}/${total}`);
  console.log(`❌ Failed: ${total - successful}/${total}`);
  
  if (successful === 0) {
    console.log('\n🚨 BACKEND NOT ACCESSIBLE');
    console.log('');
    console.log('Possible solutions:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Check if port 5001 is in use: netstat -an | findstr :5001');
    console.log('3. Run the quick fix: QUICK-FIX-NETWORK-ISSUE.bat');
    console.log('4. Check firewall settings');
  } else if (successful < total) {
    console.log('\n⚠️  PARTIAL SUCCESS');
    console.log('Backend is running but some endpoints failed.');
    console.log('This might be normal if database is not connected.');
  } else {
    console.log('\n🎉 ALL TESTS PASSED');
    console.log('Backend is running and accessible!');
  }
  
  console.log('\n💡 Next steps:');
  console.log('- If backend is working, restart your mobile app');
  console.log('- If using physical device, ensure network connectivity');
  console.log('- For USB connection: adb reverse tcp:5001 tcp:5001');
  console.log('- For WiFi: Update API_BASE_URL in app/config/env.js');
}

runTests().catch(console.error);