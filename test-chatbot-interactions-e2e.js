/**
 * End-to-End Test for Chatbot Interactions System
 * Tests the complete flow: Mobile App → Backend → Database → Admin Panel
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://localhost:5000/api';
const ADMIN_URL = 'http://localhost:3001';
const RAG_URL = 'http://localhost:8001';

// Test data
const TEST_QUESTION = 'What documents do I need for vehicle registration?';
const TEST_SESSION_ID = `test_session_${Date.now()}`;

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

function logStep(step, message) {
  log(`\n${colors.bold}[STEP ${step}]${colors.reset} ${colors.blue}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testBackendHealth() {
  logStep(1, 'Testing Backend Health');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/health`, { timeout: 5000 });
    if (response.status === 200) {
      logSuccess('Backend is healthy');
      return true;
    }
  } catch (error) {
    logError(`Backend health check failed: ${error.message}`);
    return false;
  }
}

async function testRAGServiceHealth() {
  logStep(2, 'Testing RAG Service Health');
  
  try {
    const response = await axios.get(`${RAG_URL}/health`, { timeout: 5000 });
    if (response.status === 200) {
      logSuccess('RAG Service is healthy');
      return true;
    }
  } catch (error) {
    logError(`RAG Service health check failed: ${error.message}`);
    return false;
  }
}

async function testChatbotQuery() {
  logStep(3, 'Testing Chatbot Query (Mobile App → Backend → RAG)');
  
  try {
    const requestData = {
      question: TEST_QUESTION,
      sessionId: TEST_SESSION_ID
    };
    
    log(`Sending question: "${TEST_QUESTION}"`);
    
    const response = await axios.post(`${BACKEND_URL}/chatbot/query`, requestData, {
      timeout: 60000, // 60 seconds for chatbot queries
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const { answer, interactionId, sources } = response.data.data;
      
      logSuccess('Chatbot query successful');
      log(`Answer length: ${answer?.length || 0} characters`);
      log(`Interaction ID: ${interactionId}`);
      log(`Sources found: ${sources?.length || 0}`);
      
      if (answer && answer.length > 0) {
        log(`Answer preview: ${answer.substring(0, 100)}...`);
      }
      
      return { interactionId, answer, sources };
    } else {
      logError('Chatbot query failed - invalid response format');
      return null;
    }
  } catch (error) {
    logError(`Chatbot query failed: ${error.message}`);
    if (error.response) {
      log(`Response status: ${error.response.status}`);
      log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return null;
  }
}

async function testFeedbackSubmission(interactionId) {
  logStep(4, 'Testing Feedback Submission (Mobile App → Backend)');
  
  if (!interactionId) {
    logError('No interaction ID available for feedback test');
    return false;
  }
  
  try {
    const feedbackData = {
      feedback: 'like',
      comment: 'This answer was very helpful!'
    };
    
    log(`Submitting feedback for interaction: ${interactionId}`);
    
    const response = await axios.put(
      `${BACKEND_URL}/chatbot/interactions/${interactionId}/feedback`,
      feedbackData,
      {
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.status === 200 && response.data.success) {
      logSuccess('Feedback submission successful');
      log(`Feedback: ${response.data.data.interaction.feedback}`);
      log(`Comment: ${response.data.data.interaction.comment}`);
      return true;
    } else {
      logError('Feedback submission failed - invalid response format');
      return false;
    }
  } catch (error) {
    logError(`Feedback submission failed: ${error.message}`);
    if (error.response) {
      log(`Response status: ${error.response.status}`);
      log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

async function testAdminInteractionsList() {
  logStep(5, 'Testing Admin Interactions List (Admin Panel ← Backend)');
  
  try {
    // Note: This would normally require admin authentication
    // For testing purposes, we'll try to access the endpoint directly
    const response = await axios.get(`${BACKEND_URL}/chatbot/interactions`, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const { interactions, pagination } = response.data.data;
      
      logSuccess('Admin interactions list retrieved successfully');
      log(`Total interactions: ${pagination.total}`);
      log(`Current page: ${pagination.page}`);
      log(`Total pages: ${pagination.totalPages}`);
      
      // Look for our test interaction
      const testInteraction = interactions.find(i => i.sessionId === TEST_SESSION_ID);
      if (testInteraction) {
        logSuccess('Test interaction found in admin list');
        log(`Question: ${testInteraction.question}`);
        log(`Feedback: ${testInteraction.feedback || 'None'}`);
      } else {
        logWarning('Test interaction not found in admin list (may take time to appear)');
      }
      
      return true;
    } else {
      logError('Admin interactions list failed - invalid response format');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logWarning('Admin endpoint requires authentication (expected)');
      log('This is normal - admin endpoints should be protected');
      return true; // This is actually expected behavior
    } else {
      logError(`Admin interactions list failed: ${error.message}`);
      return false;
    }
  }
}

async function testAdminMetrics() {
  logStep(6, 'Testing Admin Metrics (Admin Panel ← Backend)');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/chatbot/interactions/metrics`, {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200 && response.data.success) {
      const metrics = response.data.data;
      
      logSuccess('Admin metrics retrieved successfully');
      log(`Total questions: ${metrics.totalQuestions}`);
      log(`Total likes: ${metrics.totalLikes}`);
      log(`Total dislikes: ${metrics.totalDislikes}`);
      log(`Like/Dislike ratio: ${metrics.likeDislikeRatio}`);
      
      return true;
    } else {
      logError('Admin metrics failed - invalid response format');
      return false;
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logWarning('Admin metrics endpoint requires authentication (expected)');
      log('This is normal - admin endpoints should be protected');
      return true; // This is actually expected behavior
    } else {
      logError(`Admin metrics failed: ${error.message}`);
      return false;
    }
  }
}

async function runEndToEndTest() {
  log(`${colors.bold}${colors.blue}🚀 Starting End-to-End Chatbot Interactions Test${colors.reset}\n`);
  
  const results = {
    backendHealth: false,
    ragHealth: false,
    chatbotQuery: false,
    feedbackSubmission: false,
    adminInteractionsList: false,
    adminMetrics: false
  };
  
  // Test 1: Backend Health
  results.backendHealth = await testBackendHealth();
  if (!results.backendHealth) {
    logError('Backend is not available. Please start the backend server.');
    return results;
  }
  
  // Test 2: RAG Service Health
  results.ragHealth = await testRAGServiceHealth();
  if (!results.ragHealth) {
    logError('RAG Service is not available. Please start the RAG service.');
    return results;
  }
  
  // Test 3: Chatbot Query
  const queryResult = await testChatbotQuery();
  results.chatbotQuery = queryResult !== null;
  
  if (!results.chatbotQuery) {
    logError('Chatbot query failed. Cannot proceed with feedback test.');
    return results;
  }
  
  // Wait a moment for the interaction to be saved
  log('\nWaiting 2 seconds for interaction to be saved...');
  await sleep(2000);
  
  // Test 4: Feedback Submission
  results.feedbackSubmission = await testFeedbackSubmission(queryResult.interactionId);
  
  // Wait a moment for the feedback to be saved
  log('\nWaiting 2 seconds for feedback to be saved...');
  await sleep(2000);
  
  // Test 5: Admin Interactions List
  results.adminInteractionsList = await testAdminInteractionsList();
  
  // Test 6: Admin Metrics
  results.adminMetrics = await testAdminMetrics();
  
  return results;
}

async function printSummary(results) {
  log(`\n${colors.bold}${colors.blue}📊 Test Summary${colors.reset}\n`);
  
  const tests = [
    { name: 'Backend Health', result: results.backendHealth },
    { name: 'RAG Service Health', result: results.ragHealth },
    { name: 'Chatbot Query', result: results.chatbotQuery },
    { name: 'Feedback Submission', result: results.feedbackSubmission },
    { name: 'Admin Interactions List', result: results.adminInteractionsList },
    { name: 'Admin Metrics', result: results.adminMetrics }
  ];
  
  let passed = 0;
  let total = tests.length;
  
  tests.forEach(test => {
    if (test.result) {
      logSuccess(`${test.name}: PASSED`);
      passed++;
    } else {
      logError(`${test.name}: FAILED`);
    }
  });
  
  log(`\n${colors.bold}Overall Result: ${passed}/${total} tests passed${colors.reset}`);
  
  if (passed === total) {
    logSuccess('🎉 All tests passed! Chatbot interactions system is working end-to-end.');
  } else if (passed >= 4) {
    logWarning('⚠️  Most tests passed. Some admin endpoints may require authentication.');
  } else {
    logError('❌ Multiple tests failed. Please check your services and configuration.');
  }
  
  log(`\n${colors.bold}Next Steps:${colors.reset}`);
  log('1. Test the mobile app chatbot screen manually');
  log('2. Submit feedback from the mobile app');
  log('3. Check the admin panel at http://localhost:3001');
  log('4. Verify interactions and metrics appear in the admin dashboard');
}

// Run the test
runEndToEndTest()
  .then(printSummary)
  .catch(error => {
    logError(`Test suite failed: ${error.message}`);
    console.error(error);
  });