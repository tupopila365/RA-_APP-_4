#!/usr/bin/env node

/**
 * Test script to check mobile app environment configuration
 */

const fs = require('fs');
const path = require('path');

function testMobileAppConfig() {
  console.log('📱 MOBILE APP CONFIGURATION TEST');
  console.log('='.repeat(50));
  
  try {
    // Read the env.js file
    const envPath = path.join(__dirname, 'app', 'config', 'env.js');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    console.log('📄 Reading app/config/env.js...\n');
    
    // Find all API_BASE_URL lines
    const lines = envContent.split('\n');
    const apiUrlLines = lines
      .map((line, index) => ({ line: line.trim(), number: index + 1 }))
      .filter(({ line }) => line.includes('API_BASE_URL') && !line.startsWith('//') && !line.startsWith('*'));
    
    console.log('🔍 Active API_BASE_URL configurations found:');
    apiUrlLines.forEach(({ line, number }) => {
      console.log(`   Line ${number}: ${line}`);
      
      // Extract the URL
      const urlMatch = line.match(/API_BASE_URL:\s*['"`]([^'"`]+)['"`]/);
      if (urlMatch) {
        console.log(`   📍 URL: ${urlMatch[1]}`);
      }
    });
    
    // Simulate the environment selection logic
    console.log('\n🎯 Environment Selection Logic:');
    console.log('   In React Native: __DEV__ determines development vs production');
    console.log('   Development mode will use the development configuration');
    console.log('   Production mode will use the production configuration');
    
    // Extract development and production URLs
    const devSection = envContent.match(/development:\s*{([^}]+)}/s);
    const prodSection = envContent.match(/production:\s*{([^}]+)}/s);
    
    if (devSection) {
      const devUrlMatch = devSection[1].match(/API_BASE_URL:\s*['"`]([^'"`]+)['"`]/);
      if (devUrlMatch) {
        console.log(`   📱 Development URL: ${devUrlMatch[1]}`);
      }
    }
    
    if (prodSection) {
      const prodUrlMatch = prodSection[1].match(/API_BASE_URL:\s*['"`]([^'"`]+)['"`]/);
      if (prodUrlMatch) {
        console.log(`   🏭 Production URL: ${prodUrlMatch[1]}`);
      }
    }
    
    return {
      developmentUrl: devSection ? devSection[1].match(/API_BASE_URL:\s*['"`]([^'"`]+)['"`]/)?.[1] : null,
      productionUrl: prodSection ? prodSection[1].match(/API_BASE_URL:\s*['"`]([^'"`]+)['"`]/)?.[1] : null
    };
    
  } catch (error) {
    console.error('❌ Error reading mobile app config:', error.message);
    return null;
  }
}

async function testConfiguredUrls(config) {
  if (!config) return;
  
  console.log('\n🌐 TESTING CONFIGURED URLS');
  console.log('='.repeat(50));
  
  const axios = require('axios');
  
  const urlsToTest = [];
  if (config.developmentUrl) {
    urlsToTest.push({ name: 'Development', url: `${config.developmentUrl}/roadworks/public` });
  }
  if (config.productionUrl) {
    urlsToTest.push({ name: 'Production', url: `${config.productionUrl}/roadworks/public` });
  }
  
  for (const { name, url } of urlsToTest) {
    try {
      console.log(`\n🔍 Testing ${name} URL: ${url}`);
      const response = await axios.get(url, { timeout: 10000 });
      
      let roadworks = [];
      if (response.data.success && Array.isArray(response.data.data)) {
        roadworks = response.data.data;
      } else if (Array.isArray(response.data)) {
        roadworks = response.data;
      }
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ✅ Roadworks found: ${roadworks.length}`);
      
      if (roadworks.length > 0) {
        console.log(`   📍 Sample: "${roadworks[0].title}" - ${roadworks[0].road}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.log(`   💡 Backend not accessible at this URL`);
      }
    }
  }
}

async function main() {
  const config = testMobileAppConfig();
  await testConfiguredUrls(config);
  
  console.log('\n🎯 RECOMMENDATIONS:');
  console.log('='.repeat(50));
  console.log('1. Make sure you\'re testing in development mode (__DEV__ = true)');
  console.log('2. Verify the development API_BASE_URL points to the correct backend');
  console.log('3. If using WiFi connection, ensure mobile device is on same network');
  console.log('4. If using USB connection, run: adb reverse tcp:5001 tcp:5001');
  console.log('5. Consider using ngrok for easier testing across networks');
}

main().catch(console.error);