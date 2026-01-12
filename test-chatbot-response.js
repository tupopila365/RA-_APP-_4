/**
 * Test Chatbot Response
 * Direct test of the chatbot API to see what's being returned
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:5000/api';

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

async function testChatbotResponse() {
  log(`${colors.bold}${colors.blue}🤖 Testing Chatbot Response${colors.reset}\n`);
  
  try {
    const question = "What documents do I need?";
    const sessionId = `test_session_${Date.now()}`;
    
    logInfo(`Sending question: "${question}"`);
    logInfo(`Session ID: ${sessionId}`);
    logInfo(`Backend URL: ${BACKEND_URL}/chatbot/query`);
    
    const startTime = Date.now();
    
    const response = await axios.post(`${BACKEND_URL}/chatbot/query`, {
      question: question,
      sessionId: sessionId
    }, {
      timeout: 60000, // 60 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    logSuccess(`Response received in ${duration}ms`);
    
    // Check response structure
    log(`\n${colors.bold}📋 Response Analysis:${colors.reset}`);
    log(`Status: ${response.status}`);
    log(`Success: ${response.data?.success}`);
    
    if (response.data?.data) {
      const data = response.data.data;
      
      log(`\n${colors.bold}📝 Answer Details:${colors.reset}`);
      log(`Answer length: ${data.answer?.length || 0} characters`);
      log(`Interaction ID: ${data.interactionId || 'Not provided'}`);
      log(`Sources count: ${data.sources?.length || 0}`);
      log(`Timestamp: ${data.timestamp || 'Not provided'}`);
      
      if (data.answer) {
        log(`\n${colors.bold}💬 Full Answer:${colors.reset}`);
        log(`"${data.answer}"`);
        
        // Check if answer is truncated
        if (data.answer.endsWith('O') || data.answer.length < 50) {
          log(`\n⚠️  Answer appears to be truncated!`, 'yellow');
        }
      }
      
      if (data.sources && data.sources.length > 0) {
        log(`\n${colors.bold}📚 Sources:${colors.reset}`);
        data.sources.forEach((source, index) => {
          log(`${index + 1}. ${source.title || 'Unknown'} (Relevance: ${source.relevance || 'N/A'})`);
        });
      }
      
      // Test the exact same format as mobile app
      log(`\n${colors.bold}📱 Mobile App Format Test:${colors.reset}`);
      const mobileResponse = response.data || response;
      log(`Mobile response structure: ${JSON.stringify(Object.keys(mobileResponse), null, 2)}`);
      
    } else {
      logError('No data field in response');
      log(`Full response: ${JSON.stringify(response.data, null, 2)}`);
    }
    
  } catch (error) {
    logError(`Request failed: ${error.message}`);
    
    if (error.response) {
      log(`Response status: ${error.response.status}`);
      log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      log(`No response received. Request details:`);
      log(`URL: ${error.config?.url}`);
      log(`Method: ${error.config?.method}`);
      log(`Timeout: ${error.config?.timeout}ms`);
    }
  }
}

// Run the test
testChatbotResponse().catch(error => {
  logError(`Test failed: ${error.message}`);
  console.error(error);
});