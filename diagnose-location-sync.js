/**
 * Comprehensive diagnostic for location sync between admin and mobile app
 * This script checks the entire flow from admin creation to mobile app display
 */

// Configuration
const ADMIN_API = 'http://localhost:3001/api'; // Admin backend (usually port 3001)
const MOBILE_API = 'http://192.168.1.198:5001/api'; // Mobile API from env.js
const MOBILE_API_ALT = 'http://localhost:5001/api'; // Alternative mobile API

console.log('🔍 Comprehensive Location Sync Diagnostic');
console.log('==========================================');

async function testAPIEndpoint(url, description) {
  console.log(`\n🌐 Testing ${description}: ${url}`);
  
  try {
    const response = await fetch(`${url}/locations`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ Success: Found ${data.data?.locations?.length || 0} locations`);
      
      if (data.data?.locations?.length > 0) {
        const sample = data.data.locations[0];
        console.log(`   📍 Sample location: ${sample.name} (${sample.region})`);
        console.log(`   📊 Has coordinates: ${!!sample.coordinates}`);
        console.log(`   📊 Has services: ${!!sample.services}`);
      }
      
      return { success: true, count: data.data?.locations?.length || 0, data: data.data };
    } else {
      const errorText = await response.text();
      console.log(`   ❌ Failed: ${errorText}`);
      return { success: false, error: errorText };
    }
    
  } catch (error) {
    console.log(`   ❌ Connection failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function checkDatabaseConnection() {
  console.log('\n💾 Checking Database Connection...');
  
  try {
    // Try to hit a health endpoint or any endpoint that would indicate DB connectivity
    const response = await fetch(`${ADMIN_API}/health`);
    if (response.ok) {
      console.log('   ✅ Database connection appears healthy');
    } else {
      console.log('   ⚠️ Health endpoint not available');
    }
  } catch (error) {
    console.log('   ❌ Cannot check database health');
  }
}

async function checkNetworkConnectivity() {
  console.log('\n🌐 Checking Network Connectivity...');
  
  const endpoints = [
    { url: 'http://localhost:3001', name: 'Admin Backend (localhost:3001)' },
    { url: 'http://localhost:5001', name: 'Mobile Backend (localhost:5001)' },
    { url: 'http://192.168.1.198:5001', name: 'Mobile Backend (WiFi IP)' },
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${endpoint.url}/api/locations`, { 
        method: 'HEAD',
        timeout: 5000 
      });
      console.log(`   ✅ ${endpoint.name}: Reachable`);
    } catch (error) {
      console.log(`   ❌ ${endpoint.name}: ${error.message}`);
    }
  }
}

async function compareAPIs() {
  console.log('\n🔄 Comparing API Responses...');
  
  const adminResult = await testAPIEndpoint(ADMIN_API, 'Admin API');
  const mobileResult = await testAPIEndpoint(MOBILE_API, 'Mobile API (WiFi)');
  const mobileAltResult = await testAPIEndpoint(MOBILE_API_ALT, 'Mobile API (localhost)');
  
  console.log('\n📊 Comparison Results:');
  console.log(`   Admin API: ${adminResult.success ? `${adminResult.count} locations` : 'Failed'}`);
  console.log(`   Mobile API (WiFi): ${mobileResult.success ? `${mobileResult.count} locations` : 'Failed'}`);
  console.log(`   Mobile API (localhost): ${mobileAltResult.success ? `${mobileAltResult.count} locations` : 'Failed'}`);
  
  // Check if data matches
  if (adminResult.success && mobileResult.success) {
    if (adminResult.count === mobileResult.count) {
      console.log('   ✅ Location counts match between admin and mobile APIs');
    } else {
      console.log('   ⚠️ Location counts differ between admin and mobile APIs');
      console.log(`      Admin: ${adminResult.count}, Mobile: ${mobileResult.count}`);
    }
  }
  
  return { adminResult, mobileResult, mobileAltResult };
}

async function checkMobileAppConfiguration() {
  console.log('\n📱 Checking Mobile App Configuration...');
  
  console.log(`   Current mobile API URL: ${MOBILE_API}`);
  console.log(`   Alternative API URL: ${MOBILE_API_ALT}`);
  
  // Check if the mobile app is using the correct API
  const currentIP = MOBILE_API.match(/(\d+\.\d+\.\d+\.\d+)/);
  if (currentIP) {
    console.log(`   📍 Using WiFi IP: ${currentIP[1]}`);
    console.log('   💡 If mobile app shows no locations, try:');
    console.log('      1. Check if backend is running on this IP');
    console.log('      2. Try USB connection (localhost)');
    console.log('      3. Use ngrok tunnel');
  }
}

async function suggestSolutions(results) {
  console.log('\n🔧 Troubleshooting Suggestions:');
  
  const { adminResult, mobileResult, mobileAltResult } = results;
  
  if (!adminResult.success) {
    console.log('❌ Admin API Issues:');
    console.log('   - Check if admin backend is running (npm run dev in backend folder)');
    console.log('   - Verify admin backend port (usually 3001)');
    console.log('   - Check for any error logs in admin backend console');
  }
  
  if (!mobileResult.success && !mobileAltResult.success) {
    console.log('❌ Mobile API Issues:');
    console.log('   - Check if backend is running (npm run dev in backend folder)');
    console.log('   - Verify backend port (usually 5001)');
    console.log('   - Check firewall settings');
    console.log('   - Try USB connection: adb reverse tcp:5001 tcp:5001');
    console.log('   - Consider using ngrok tunnel');
  }
  
  if (adminResult.success && adminResult.count === 0) {
    console.log('⚠️ No Locations in Database:');
    console.log('   - Create locations through admin panel');
    console.log('   - Check if location creation is working');
    console.log('   - Verify database connection');
  }
  
  if (adminResult.success && mobileResult.success && adminResult.count !== mobileResult.count) {
    console.log('⚠️ Data Sync Issues:');
    console.log('   - APIs are pointing to different databases');
    console.log('   - Check database configuration in both backends');
    console.log('   - Verify both are using the same MongoDB instance');
  }
  
  if (adminResult.success && adminResult.count > 0 && mobileResult.success && mobileResult.count > 0) {
    console.log('✅ Everything looks good! If mobile app still shows no locations:');
    console.log('   - Check mobile app cache/refresh');
    console.log('   - Verify mobile app is using correct API URL');
    console.log('   - Check mobile app error logs');
    console.log('   - Try restarting the mobile app');
  }
}

// Main diagnostic function
async function runDiagnostic() {
  console.log('🚀 Starting comprehensive diagnostic...\n');
  
  await checkNetworkConnectivity();
  await checkDatabaseConnection();
  const results = await compareAPIs();
  await checkMobileAppConfiguration();
  await suggestSolutions(results);
  
  console.log('\n✅ Diagnostic completed!');
  console.log('\n💡 Quick Actions:');
  console.log('   1. Ensure backend is running: cd backend && npm run dev');
  console.log('   2. Check admin panel: http://localhost:3000/locations');
  console.log('   3. Test mobile API: http://localhost:5001/api/locations');
  console.log('   4. Refresh mobile app and check for locations');
}

// Run the diagnostic
runDiagnostic().catch(error => {
  console.error('❌ Diagnostic failed:', error);
});

// Export for manual use
if (typeof window !== 'undefined') {
  window.runLocationDiagnostic = runDiagnostic;
  console.log('💡 Function exported: runLocationDiagnostic()');
}