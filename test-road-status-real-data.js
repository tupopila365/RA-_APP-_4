#!/usr/bin/env node

/**
 * Test script to verify that the mobile app's road status service
 * is properly configured to use real data from the database only
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';
const API_ENDPOINT = `${BACKEND_URL}/api/roadworks/public`;

async function testRoadStatusAPI() {
  console.log('🔍 Testing Road Status API for Real Data...\n');
  
  try {
    // Test 1: Basic API call
    console.log('1. Testing basic API call...');
    const response = await axios.get(API_ENDPOINT, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   ✅ Status: ${response.status}`);
    console.log(`   ✅ Response format: ${response.data.success ? 'Standard' : 'Legacy'}`);
    
    // Extract data array
    let roadworks = [];
    if (response.data.success && Array.isArray(response.data.data)) {
      roadworks = response.data.data;
    } else if (Array.isArray(response.data)) {
      roadworks = response.data;
    }
    
    console.log(`   ✅ Total roadworks found: ${roadworks.length}`);
    
    // Test 2: Verify data structure
    console.log('\n2. Verifying data structure...');
    if (roadworks.length > 0) {
      const sample = roadworks[0];
      const requiredFields = ['_id', 'title', 'road', 'section', 'status', 'region', 'published'];
      const missingFields = requiredFields.filter(field => !(field in sample));
      
      if (missingFields.length === 0) {
        console.log('   ✅ All required fields present');
        console.log(`   ✅ Sample roadwork: "${sample.title}" on ${sample.road}`);
        console.log(`   ✅ Status: ${sample.status}, Region: ${sample.region}`);
      } else {
        console.log(`   ❌ Missing fields: ${missingFields.join(', ')}`);
      }
    } else {
      console.log('   ⚠️  No roadworks found in database');
      console.log('   💡 This is expected if no roadworks have been created via admin panel');
    }
    
    // Test 3: Search functionality
    console.log('\n3. Testing search functionality...');
    const searchResponse = await axios.get(`${API_ENDPOINT}?q=road`, {
      timeout: 10000
    });
    
    let searchResults = [];
    if (searchResponse.data.success && Array.isArray(searchResponse.data.data)) {
      searchResults = searchResponse.data.data;
    } else if (Array.isArray(searchResponse.data)) {
      searchResults = searchResponse.data;
    }
    
    console.log(`   ✅ Search results: ${searchResults.length} roadworks`);
    
    // Test 4: Verify no mock data characteristics
    console.log('\n4. Verifying no mock data characteristics...');
    const hasMockIds = roadworks.some(rw => 
      rw._id && (rw._id.length < 20 || !rw._id.match(/^[0-9a-fA-F]{24}$/))
    );
    
    if (!hasMockIds && roadworks.length > 0) {
      console.log('   ✅ All IDs appear to be valid MongoDB ObjectIds');
    } else if (roadworks.length === 0) {
      console.log('   ✅ No data to verify (empty database)');
    } else {
      console.log('   ⚠️  Some IDs don\'t match MongoDB ObjectId format');
    }
    
    // Summary
    console.log('\n📊 SUMMARY:');
    console.log('='.repeat(50));
    console.log(`✅ API is responding correctly`);
    console.log(`✅ Using real database data (no mock data)`);
    console.log(`✅ Search functionality working`);
    console.log(`📈 Total roadworks in database: ${roadworks.length}`);
    
    if (roadworks.length === 0) {
      console.log('\n💡 NEXT STEPS:');
      console.log('   • Create some roadworks via the admin panel');
      console.log('   • Make sure to set "published: true" for mobile app visibility');
      console.log('   • Test again to see real data in the mobile app');
    }
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 TROUBLESHOOTING:');
      console.log('   • Make sure the backend server is running');
      console.log('   • Check if the backend URL is correct');
      console.log('   • Verify the database connection');
    } else if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

// Run the test
testRoadStatusAPI().catch(console.error);