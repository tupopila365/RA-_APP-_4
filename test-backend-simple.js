const axios = require('axios');

async function testBackend() {
  const BASE_URL = 'http://localhost:5001';
  
  console.log('Testing backend endpoints...\n');
  
  // Test different possible endpoints
  const endpoints = [
    '/api/health',
    '/health', 
    '/api/roadworks/public',
    '/api/road-status/public',
    '/roadworks/public',
    '/road-status/public'
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${BASE_URL}${endpoint}`);
      const response = await axios.get(`${BASE_URL}${endpoint}`, { 
        timeout: 5000,
        validateStatus: () => true // Accept any status code
      });
      console.log(`✅ Status: ${response.status}`);
      if (response.data) {
        console.log(`   Response type: ${typeof response.data}`);
        if (typeof response.data === 'object') {
          console.log(`   Keys: ${Object.keys(response.data).join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

testBackend();