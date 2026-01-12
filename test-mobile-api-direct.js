/**
 * Test Mobile API Direct
 * Test the exact same API call that the mobile app makes
 */

const axios = require('axios');

// Use the same configuration as the mobile app
const API_BASE_URL = 'http://192.168.11.52:5000/api';
const API_TIMEOUT_LONG = 60000;

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

// Simulate the mobile app's API client
class ApiClient {
  static async post(endpoint, body, options = {}) {
    const { timeout = 15000 } = options;
    
    const config = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout,
    };

    if (body) {
      config.data = body;
    }

    try {
      const response = await axios(`${API_BASE_URL}${endpoint}`, config);
      return response.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout / 1000}s`);
      }
      throw error;
    }
  }
}

// Simulate the mobile app's chatbot service query method
async function mobileAppQuery(question, sessionId = null, userLocation = null) {
  try {
    const requestBody = {
      question,
      ...(sessionId && { sessionId }),
      ...(userLocation && { userLocation }),
    };

    const options = { timeout: API_TIMEOUT_LONG };

    const response = await ApiClient.post('/chatbot/query', requestBody, options);
    
    // Extract data from new API response format (same as mobile app)
    return response.data || response;
  } catch (error) {
    throw error;
  }
}

async function testMobileAppAPI() {
  log(`${colors.bold}${colors.blue}📱 Testing Mobile App API Call${colors.reset}\n`);
  
  try {
    const question = "What documents do I need?";
    const sessionId = `mobile_test_${Date.now()}`;
    
    logInfo(`Question: "${question}"`);
    logInfo(`Session ID: ${sessionId}`);
    logInfo(`API Base URL: ${API_BASE_URL}`);
    logInfo(`Timeout: ${API_TIMEOUT_LONG}ms`);
    
    const startTime = Date.now();
    
    // Make the exact same call as the mobile app
    const response = await mobileAppQuery(question, sessionId);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logSuccess(`Response received in ${duration}ms`);
    
    // Analyze the response structure
    log(`\n${colors.bold}📋 Response Structure:${colors.reset}`);
    log(`Type: ${typeof response}`);
    log(`Keys: ${Object.keys(response || {}).join(', ')}`);
    
    if (response) {
      log(`\n${colors.bold}📝 Response Details:${colors.reset}`);
      
      if (response.answer) {
        log(`Answer: "${response.answer.substring(0, 100)}..."`);
        log(`Answer length: ${response.answer.length} characters`);
      } else {
        logError('No answer field found');
      }
      
      if (response.interactionId) {
        log(`Interaction ID: ${response.interactionId}`);
      } else {
        log(`No interaction ID found`);
      }
      
      if (response.sources) {
        log(`Sources: ${response.sources.length} found`);
      } else {
        log(`No sources found`);
      }
      
      if (response.timestamp) {
        log(`Timestamp: ${response.timestamp}`);
      }
      
      // Test the streaming simulation
      log(`\n${colors.bold}🔄 Testing Streaming Simulation:${colors.reset}`);
      
      if (response.answer) {
        const words = response.answer.split(' ');
        log(`Total words: ${words.length}`);
        log(`First 5 words: ${words.slice(0, 5).join(' ')}`);
        log(`Last 5 words: ${words.slice(-5).join(' ')}`);
        
        // Simulate the word-by-word streaming
        let currentText = '';
        for (let i = 0; i < Math.min(10, words.length); i++) {
          const word = words[i];
          currentText += (i > 0 ? ' ' : '') + word;
          log(`Chunk ${i + 1}: "${currentText}"`);
        }
      }
      
    } else {
      logError('Response is null or undefined');
    }
    
  } catch (error) {
    logError(`Mobile app API test failed: ${error.message}`);
    
    if (error.response) {
      log(`Response status: ${error.response.status}`);
      log(`Response headers: ${JSON.stringify(error.response.headers, null, 2)}`);
      log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      log(`Request made but no response received`);
      log(`Request config: ${JSON.stringify(error.config, null, 2)}`);
    } else {
      log(`Error setting up request: ${error.message}`);
    }
    
    // Check specific error types
    if (error.message.includes('timeout')) {
      logError('Request timed out - mobile app would show timeout error');
    } else if (error.message.includes('Network Error')) {
      logError('Network error - mobile app cannot reach backend');
    } else if (error.code === 'ECONNREFUSED') {
      logError('Connection refused - backend not accessible from mobile IP');
    }
  }
}

// Run the test
testMobileAppAPI().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
});