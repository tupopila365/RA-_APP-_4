#!/usr/bin/env node

/**
 * Comprehensive diagnostic script for mobile app road status connectivity
 */

const axios = require('axios');

// Test different possible backend URLs
const TEST_URLS = [
  'http://localhost:5001/api/roadworks/public',
  'http://192.168.100.100:5001/api/roadworks/public',
  'http://127.0.0.1:5001/api/roadworks/public',
];

async function testUrl(url) {
  try {
    console.log(`\n🔍 Testing: ${url}`);
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   ✅ Status: ${response.status}`);
    
    let roadworks = [];
    if (response.data.success && Array.isArray(response.data.data)) {
      roadworks = response.data.data;
    } else if (Array.isArray(response.data)) {
      roadworks = response.data;
    }
    
    console.log(`   ✅ Roadworks found: ${roadworks.length}`);
    
    if (roadworks.length > 0) {
      roadworks.forEach((rw, index) => {
        console.log(`   📍 ${index + 1}. "${rw.title}" - ${rw.road} (${rw.status})`);
        console.log(`      Region: ${rw.region}, Published: ${rw.published}`);
      });
    }
    
    return { success: true, count: roadworks.length, data: roadworks };
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    if (error.code) {
      console.log(`   ❌ Code: ${error.code}`);
    }
    return { success: false, error: error.message };
  }
}

async function checkNetworkConnectivity() {
  console.log('🌐 NETWORK CONNECTIVITY CHECK');
  console.log('='.repeat(50));
  
  // Test all possible URLs
  const results = [];
  for (const url of TEST_URLS) {
    const result = await testUrl(url);
    results.push({ url, ...result });
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  console.log('='.repeat(50));
  
  const workingUrls = results.filter(r => r.success);
  const failedUrls = results.filter(r => !r.success);
  
  if (workingUrls.length > 0) {
    console.log(`✅ Working URLs: ${workingUrls.length}/${results.length}`);
    workingUrls.forEach(r => {
      console.log(`   ✅ ${r.url} (${r.count} roadworks)`);
    });
  }
  
  if (failedUrls.length > 0) {
    console.log(`❌ Failed URLs: ${failedUrls.length}/${results.length}`);
    failedUrls.forEach(r => {
      console.log(`   ❌ ${r.url} - ${r.error}`);
    });
  }
  
  return results;
}

async function checkMobileAppConfig() {
  console.log('\n📱 MOBILE APP CONFIGURATION CHECK');
  console.log('='.repeat(50));
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Read mobile app env config
    const envPath = path.join(__dirname, 'app', 'config', 'env.js');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      // Extract API_BASE_URL
      const apiUrlMatch = envContent.match(/API_BASE_URL:\s*['"`]([^'"`]+)['"`]/);
      if (apiUrlMatch) {
        const configuredUrl = apiUrlMatch[1];
        console.log(`📍 Configured API URL: ${configuredUrl}`);
        
        // Test the configured URL
        const fullUrl = `${configuredUrl}/roadworks/public`;
        console.log(`🔍 Testing configured URL: ${fullUrl}`);
        
        const result = await testUrl(fullUrl);
        if (result.success) {
          console.log(`   ✅ Mobile app configuration is correct!`);
          console.log(`   ✅ Found ${result.count} roadworks`);
        } else {
          console.log(`   ❌ Mobile app cannot reach configured URL`);
          console.log(`   ❌ Error: ${result.error}`);
        }
        
        return { configuredUrl, fullUrl, ...result };
      } else {
        console.log('❌ Could not find API_BASE_URL in env.js');
      }
    } else {
      console.log('❌ env.js file not found');
    }
  } catch (error) {
    console.log(`❌ Error reading mobile app config: ${error.message}`);
  }
  
  return null;
}

async function provideTroubleshootingSteps(networkResults, mobileConfig) {
  console.log('\n🔧 TROUBLESHOOTING STEPS');
  console.log('='.repeat(50));
  
  const workingUrls = networkResults.filter(r => r.success);
  
  if (workingUrls.length === 0) {
    console.log('❌ No backend URLs are accessible');
    console.log('\n💡 STEPS TO FIX:');
    console.log('   1. Make sure backend is running: npm run dev (in backend folder)');
    console.log('   2. Check if backend is on port 5001');
    console.log('   3. Verify database connection');
    return;
  }
  
  if (mobileConfig && !mobileConfig.success) {
    console.log('❌ Mobile app cannot reach its configured backend URL');
    console.log('\n💡 POSSIBLE SOLUTIONS:');
    
    const workingUrl = workingUrls[0];
    const baseUrl = workingUrl.url.replace('/roadworks/public', '');
    
    console.log(`\n1. UPDATE MOBILE APP CONFIG:`);
    console.log(`   Edit: app/config/env.js`);
    console.log(`   Change API_BASE_URL to: '${baseUrl}'`);
    
    console.log(`\n2. NETWORK CONNECTION OPTIONS:`);
    if (workingUrls.some(r => r.url.includes('localhost'))) {
      console.log(`   • USB Connection: Use adb reverse tcp:5001 tcp:5001`);
    }
    if (workingUrls.some(r => r.url.includes('192.168'))) {
      console.log(`   • WiFi Connection: Make sure mobile device is on same network`);
    }
    
    console.log(`\n3. ALTERNATIVE - USE NGROK:`);
    console.log(`   • Run: .\\start-backend-with-ngrok.bat`);
    console.log(`   • Copy the ngrok HTTPS URL`);
    console.log(`   • Update API_BASE_URL in env.js`);
  } else {
    console.log('✅ Mobile app configuration looks correct!');
    console.log('\n💡 IF MOBILE APP STILL NOT SHOWING DATA:');
    console.log('   1. Restart the mobile app completely');
    console.log('   2. Clear app cache/data');
    console.log('   3. Check mobile app console logs');
    console.log('   4. Verify mobile device network connectivity');
  }
}

async function main() {
  console.log('🚀 MOBILE APP ROAD STATUS DIAGNOSTICS');
  console.log('='.repeat(50));
  console.log('This script will help diagnose why roadworks aren\'t showing in the mobile app\n');
  
  // Step 1: Check network connectivity
  const networkResults = await checkNetworkConnectivity();
  
  // Step 2: Check mobile app configuration
  const mobileConfig = await checkMobileAppConfig();
  
  // Step 3: Provide troubleshooting steps
  await provideTroubleshootingSteps(networkResults, mobileConfig);
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('='.repeat(50));
  console.log('1. Follow the troubleshooting steps above');
  console.log('2. Restart the mobile app after making changes');
  console.log('3. Check the mobile app console for any error messages');
  console.log('4. Test the Road Status page in the mobile app');
}

// Run the diagnostics
main().catch(console.error);