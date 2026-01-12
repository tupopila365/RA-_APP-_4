/**
 * Simple Chatbot Interactions Test
 * Tests the components individually to verify the system is properly connected
 */

const axios = require('axios');

// Configuration
const RAG_URL = 'http://localhost:8001';

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

async function testRAGService() {
  log(`${colors.bold}${colors.blue}🚀 Testing RAG Service${colors.reset}\n`);
  
  try {
    // Test health endpoint
    log('Testing RAG Service health...');
    const healthResponse = await axios.get(`${RAG_URL}/health`, { timeout: 5000 });
    
    if (healthResponse.status === 200) {
      logSuccess('RAG Service is healthy');
      log(`Status: ${JSON.stringify(healthResponse.data, null, 2)}`);
    }
    
    // Test query endpoint
    log('\nTesting RAG Service query...');
    const queryResponse = await axios.post(`${RAG_URL}/api/query`, {
      question: 'What documents do I need for vehicle registration?',
      top_k: 5
    }, { timeout: 60000 });
    
    if (queryResponse.status === 200) {
      logSuccess('RAG Service query successful');
      const { answer, sources, metadata } = queryResponse.data;
      log(`Answer length: ${answer?.length || 0} characters`);
      log(`Sources found: ${sources?.length || 0}`);
      
      if (answer && answer.length > 0) {
        log(`Answer preview: ${answer.substring(0, 200)}...`);
      }
      
      if (sources && sources.length > 0) {
        log(`First source: ${sources[0].document_title || 'Unknown'}`);
      }
      
      return true;
    }
    
  } catch (error) {
    logError(`RAG Service test failed: ${error.message}`);
    if (error.response) {
      log(`Response status: ${error.response.status}`);
      log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
}

async function testMobileAppComponents() {
  log(`\n${colors.bold}${colors.blue}🚀 Testing Mobile App Components${colors.reset}\n`);
  
  try {
    // Check if the mobile app files exist and have the right structure
    const fs = require('fs');
    const path = require('path');
    
    const chatbotScreenPath = path.join(__dirname, 'app', 'screens', 'ChatbotScreen.js');
    const chatbotServicePath = path.join(__dirname, 'app', 'services', 'chatbotService.js');
    const apiServicePath = path.join(__dirname, 'app', 'services', 'api.js');
    
    // Check ChatbotScreen.js
    if (fs.existsSync(chatbotScreenPath)) {
      const chatbotScreenContent = fs.readFileSync(chatbotScreenPath, 'utf8');
      
      if (chatbotScreenContent.includes('handleFeedback') && 
          chatbotScreenContent.includes('feedbackButtons') &&
          chatbotScreenContent.includes('interactionId')) {
        logSuccess('ChatbotScreen.js has feedback functionality');
      } else {
        logError('ChatbotScreen.js missing feedback functionality');
        return false;
      }
    } else {
      logError('ChatbotScreen.js not found');
      return false;
    }
    
    // Check chatbotService.js
    if (fs.existsSync(chatbotServicePath)) {
      const chatbotServiceContent = fs.readFileSync(chatbotServicePath, 'utf8');
      
      if (chatbotServiceContent.includes('submitFeedback') && 
          chatbotServiceContent.includes('CHATBOT_FEEDBACK')) {
        logSuccess('chatbotService.js has feedback submission');
      } else {
        logError('chatbotService.js missing feedback submission');
        return false;
      }
    } else {
      logError('chatbotService.js not found');
      return false;
    }
    
    // Check api.js
    if (fs.existsSync(apiServicePath)) {
      const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');
      
      if (apiServiceContent.includes('CHATBOT_FEEDBACK')) {
        logSuccess('api.js has CHATBOT_FEEDBACK endpoint');
      } else {
        logError('api.js missing CHATBOT_FEEDBACK endpoint');
        return false;
      }
    } else {
      logError('api.js not found');
      return false;
    }
    
    return true;
    
  } catch (error) {
    logError(`Mobile app components test failed: ${error.message}`);
    return false;
  }
}

async function testBackendComponents() {
  log(`\n${colors.bold}${colors.blue}🚀 Testing Backend Components${colors.reset}\n`);
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const interactionsControllerPath = path.join(__dirname, 'backend', 'src', 'modules', 'chatbot', 'interactions.controller.ts');
    const interactionsServicePath = path.join(__dirname, 'backend', 'src', 'modules', 'chatbot', 'interactions.service.ts');
    
    // Check interactions controller
    if (fs.existsSync(interactionsControllerPath)) {
      const controllerContent = fs.readFileSync(interactionsControllerPath, 'utf8');
      
      if (controllerContent.includes('updateFeedback') && 
          controllerContent.includes('listInteractions') &&
          controllerContent.includes('getMetrics')) {
        logSuccess('Backend interactions controller has all required methods');
      } else {
        logError('Backend interactions controller missing required methods');
        return false;
      }
    } else {
      logError('Backend interactions controller not found');
      return false;
    }
    
    // Check interactions service
    if (fs.existsSync(interactionsServicePath)) {
      logSuccess('Backend interactions service exists');
    } else {
      logError('Backend interactions service not found');
      return false;
    }
    
    return true;
    
  } catch (error) {
    logError(`Backend components test failed: ${error.message}`);
    return false;
  }
}

async function testAdminComponents() {
  log(`\n${colors.bold}${colors.blue}🚀 Testing Admin Components${colors.reset}\n`);
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    const adminInteractionsPath = path.join(__dirname, 'admin', 'src', 'pages', 'ChatbotInteractions', 'index.tsx');
    const adminServicePath = path.join(__dirname, 'admin', 'src', 'services', 'interactions.service.ts');
    
    // Check admin interactions page
    if (fs.existsSync(adminInteractionsPath)) {
      const adminContent = fs.readFileSync(adminInteractionsPath, 'utf8');
      
      if (adminContent.includes('InteractionsList') && 
          adminContent.includes('MetricsDashboard')) {
        logSuccess('Admin interactions page has required components');
      } else {
        logError('Admin interactions page missing required components');
        return false;
      }
    } else {
      logError('Admin interactions page not found');
      return false;
    }
    
    // Check admin service
    if (fs.existsSync(adminServicePath)) {
      const serviceContent = fs.readFileSync(adminServicePath, 'utf8');
      
      if (serviceContent.includes('getInteractions') && 
          serviceContent.includes('getMetrics')) {
        logSuccess('Admin interactions service has required methods');
      } else {
        logError('Admin interactions service missing required methods');
        return false;
      }
    } else {
      logError('Admin interactions service not found');
      return false;
    }
    
    return true;
    
  } catch (error) {
    logError(`Admin components test failed: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log(`${colors.bold}${colors.blue}🔍 Chatbot Interactions System Component Test${colors.reset}\n`);
  
  const results = {
    ragService: false,
    mobileApp: false,
    backend: false,
    admin: false
  };
  
  // Test RAG Service (if running)
  results.ragService = await testRAGService();
  
  // Test Mobile App Components
  results.mobileApp = await testMobileAppComponents();
  
  // Test Backend Components
  results.backend = await testBackendComponents();
  
  // Test Admin Components
  results.admin = await testAdminComponents();
  
  // Summary
  log(`\n${colors.bold}${colors.blue}📊 Component Test Summary${colors.reset}\n`);
  
  const tests = [
    { name: 'RAG Service', result: results.ragService },
    { name: 'Mobile App Components', result: results.mobileApp },
    { name: 'Backend Components', result: results.backend },
    { name: 'Admin Components', result: results.admin }
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
  
  log(`\n${colors.bold}Overall Result: ${passed}/${total} components verified${colors.reset}`);
  
  if (passed === total) {
    logSuccess('🎉 All components are properly configured!');
    log('\n📋 System Status:');
    log('✅ Mobile App: Feedback buttons implemented in ChatbotScreen');
    log('✅ Mobile App: submitFeedback method in chatbotService');
    log('✅ Mobile App: CHATBOT_FEEDBACK endpoint configured');
    log('✅ Backend: Interactions controller with feedback endpoints');
    log('✅ Backend: Interactions service for data management');
    log('✅ Admin: Interactions page with list and metrics');
    log('✅ Admin: Interactions service for API calls');
    log('✅ RAG Service: Running and responding to queries');
    
    log('\n🔄 End-to-End Flow:');
    log('1. User asks question in mobile app');
    log('2. Mobile app → Backend → RAG Service');
    log('3. RAG Service returns answer with interactionId');
    log('4. User can submit feedback (like/dislike)');
    log('5. Feedback stored in database');
    log('6. Admin can view interactions and metrics');
    
  } else {
    logError('❌ Some components need attention. Check the failed tests above.');
  }
  
  log(`\n${colors.bold}Next Steps:${colors.reset}`);
  log('1. Start all services: Backend, RAG Service, Admin Panel');
  log('2. Test mobile app chatbot manually');
  log('3. Submit feedback from mobile app');
  log('4. Check admin panel for interactions and metrics');
}

// Run the tests
runTests().catch(error => {
  logError(`Test suite failed: ${error.message}`);
  console.error(error);
});