/**
 * Mobile App Connection Test
 * Tests if the mobile app can reach the backend API
 */

const axios = require('axios');

// Test different IP addresses
const TEST_IPS = [
  'http://localhost:5000/api',
  'http://192.168.11.52:5000/api',
  'http://192.168.108.1:5000/api'
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function testConnection(baseUrl) {
  try {
    logInfo(`Testing: ${baseUrl}`);
    
    // Test health endpoint (root level)
    const healthResponse = await axios.get(`${baseUrl.replace('/api', '')}/health`, { 
      timeout: 5000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (healthResponse.status === 200) {
      logSuccess(`Health check passed: ${baseUrl}`);
      
      // Test a real API endpoint
      try {
        const newsResponse = await axios.get(`${baseUrl}/news`, { 
          timeout: 10000,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (newsResponse.status === 200) {
          logSuccess(`News API works: ${baseUrl}`);
          return { success: true, url: baseUrl, data: newsResponse.data };
        }
      } catch (newsError) {
        log(`⚠️  Health OK but News API failed: ${newsError.message}`, 'yellow');
        return { success: true, url: baseUrl, healthOnly: true };
      }
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      logError(`Connection refused: ${baseUrl} (server not running or firewall blocking)`);
    } else if (error.code === 'ETIMEDOUT') {
      logError(`Timeout: ${baseUrl} (network issue or firewall)`);
    } else if (error.code === 'ENOTFOUND') {
      logError(`Host not found: ${baseUrl} (DNS/IP issue)`);
    } else {
      logError(`Failed: ${baseUrl} - ${error.message}`);
    }
    return { success: false, url: baseUrl, error: error.message };
  }
}

async function runConnectionTests() {
  log(`${colors.bold}${colors.blue}📱 Mobile App Connection Test${colors.reset}\n`);
  
  const results = [];
  
  for (const baseUrl of TEST_IPS) {
    const result = await testConnection(baseUrl);
    results.push(result);
    console.log(''); // Add spacing
  }
  
  // Summary
  log(`${colors.bold}📊 Test Results Summary${colors.reset}\n`);
  
  const workingUrls = results.filter(r => r.success);
  const failedUrls = results.filter(r => !r.success);
  
  if (workingUrls.length > 0) {
    logSuccess(`Found ${workingUrls.length} working connection(s):`);
    workingUrls.forEach(result => {
      log(`  ✅ ${result.url}${result.healthOnly ? ' (health only)' : ' (full API)'}`, 'green');
    });
    
    log(`\n${colors.bold}📱 Mobile App Configuration:${colors.reset}`);
    log(`Update your app/config/env.js file:`);
    log(`${colors.yellow}API_BASE_URL: '${workingUrls[0].url}',${colors.reset}`);
    
  } else {
    logError('No working connections found!');
    
    log(`\n${colors.bold}🔧 Troubleshooting Steps:${colors.reset}`);
    log('1. Make sure backend is running: npm run dev (in backend folder)');
    log('2. Check Windows Firewall settings');
    log('3. Ensure phone and computer are on same WiFi network');
    log('4. Try USB connection with adb port forwarding');
  }
  
  if (failedUrls.length > 0) {
    log(`\n${colors.bold}❌ Failed Connections:${colors.reset}`);
    failedUrls.forEach(result => {
      log(`  ❌ ${result.url} - ${result.error}`, 'red');
    });
  }
  
  // Network info
  log(`\n${colors.bold}🌐 Network Information:${colors.reset}`);
  log('Computer WiFi IP: 192.168.11.52');
  log('Computer VMware IP: 192.168.108.1');
  log('Backend listening on: 0.0.0.0:5000 (all interfaces)');
  
  log(`\n${colors.bold}📋 Next Steps:${colors.reset}`);
  if (workingUrls.length > 0) {
    log('1. Update mobile app config with working URL above');
    log('2. Restart Expo app (press R in terminal or shake device)');
    log('3. Test chatbot functionality in mobile app');
  } else {
    log('1. Check if backend is running: npm run dev');
    log('2. Check Windows Firewall (allow Node.js)');
    log('3. Try ngrok tunnel: .\\start-backend-with-ngrok.bat');
  }
}

// Run the tests
runConnectionTests().catch(error => {
  logError(`Test failed: ${error.message}`);
  console.error(error);
});