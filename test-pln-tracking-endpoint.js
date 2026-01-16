/**
 * Test PLN Tracking Endpoint
 * 
 * This script tests the PLN tracking endpoint to verify it's working correctly.
 */

const API_BASE_URL = 'http://192.168.100.101:5000/api';

async function testPLNTracking() {
  console.log('🧪 Testing PLN Tracking Endpoint\n');
  console.log('API Base URL:', API_BASE_URL);
  console.log('-----------------------------------\n');

  // Test 1: Check backend health
  console.log('1️⃣ Testing backend health...');
  try {
    const healthResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Backend is running:', healthData);
  } catch (error) {
    console.error('❌ Backend health check failed:', error.message);
    console.log('\n⚠️  Make sure backend is running:');
    console.log('   cd backend && npm run dev\n');
    return;
  }

  console.log('\n-----------------------------------\n');

  // Test 2: Try tracking with sample data
  console.log('2️⃣ Testing PLN tracking endpoint...');
  
  const testCases = [
    {
      name: 'Valid tracking (if application exists)',
      referenceId: 'PLN-2024-TEST123',
      trackingPin: '12345',
    },
    {
      name: 'Invalid tracking PIN',
      referenceId: 'PLN-2024-TEST123',
      trackingPin: 'wrong',
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log(`   Reference ID: ${testCase.referenceId}`);
    console.log(`   Tracking PIN: ${testCase.trackingPin}`);
    
    try {
      const url = `${API_BASE_URL}/pln/track/${testCase.referenceId}/${testCase.trackingPin}`;
      console.log(`   URL: ${url}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        console.log('   ✅ Status:', response.status);
        console.log('   ✅ Success:', data.success);
        console.log('   ✅ Application found:', data.data?.application?.referenceId);
      } else {
        console.log('   ⚠️  Status:', response.status);
        console.log('   ⚠️  Error:', data.error?.message || data.message);
      }
    } catch (error) {
      console.error('   ❌ Request failed:', error.message);
    }
  }

  console.log('\n-----------------------------------\n');

  // Test 3: Check if any PLN applications exist
  console.log('3️⃣ Checking for existing PLN applications...');
  try {
    const response = await fetch(`${API_BASE_URL}/pln/applications`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      const applications = data.data?.applications || [];
      console.log(`✅ Found ${applications.length} PLN application(s)`);
      
      if (applications.length > 0) {
        console.log('\n📝 Sample application for testing:');
        const sample = applications[0];
        console.log(`   Reference ID: ${sample.referenceId}`);
        console.log(`   Tracking PIN: ${sample.trackingPin || '12345'}`);
        console.log(`   Full Name: ${sample.fullName}`);
        console.log(`   Status: ${sample.status}`);
        console.log('\n💡 Try tracking with these credentials in the app!');
      } else {
        console.log('\n⚠️  No applications found. Submit a test application first.');
      }
    } else {
      console.log('⚠️  Could not fetch applications (might need admin auth)');
    }
  } catch (error) {
    console.error('❌ Failed to check applications:', error.message);
  }

  console.log('\n-----------------------------------\n');
  console.log('✅ Test complete!\n');
}

// Run the test
testPLNTracking().catch(console.error);
