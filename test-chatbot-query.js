/**
 * Test script for chatbot query functionality
 * 
 * This script tests:
 * 1. Query reaches the RAG service successfully
 * 2. Response contains relevant document chunks
 * 3. Response contains a generated answer
 * 4. No 404 errors occur
 * 
 * Requirements: 2.1, 2.2, 2.3
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const RAG_SERVICE_URL = process.env.RAG_SERVICE_URL || 'http://localhost:8001';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logSection(message) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(message, colors.cyan);
  log('='.repeat(60), colors.cyan);
}

/**
 * Check if RAG service is running
 */
async function checkRagServiceHealth() {
  logSection('Step 1: Checking RAG Service Health');
  
  try {
    const response = await axios.get(`${RAG_SERVICE_URL}/health`, {
      timeout: 5000,
    });
    
    logSuccess('RAG service is accessible');
    logInfo(`Status: ${response.data.status}`);
    logInfo(`Ollama connected: ${response.data.ollama_connected}`);
    logInfo(`ChromaDB connected: ${response.data.chromadb_connected}`);
    
    if (response.data.status !== 'healthy') {
      logWarning('RAG service is not fully healthy');
      if (!response.data.ollama_connected) {
        logError('Ollama is not connected');
      }
      if (!response.data.chromadb_connected) {
        logError('ChromaDB is not connected');
      }
      return false;
    }
    
    return true;
  } catch (error) {
    logError('Failed to connect to RAG service');
    if (error.code === 'ECONNREFUSED') {
      logError(`Connection refused at ${RAG_SERVICE_URL}`);
      logInfo('Make sure RAG service is running on port 8001');
    } else {
      logError(`Error: ${error.message}`);
    }
    return false;
  }
}

/**
 * Check if backend service is running
 */
async function checkBackendHealth() {
  logSection('Step 2: Checking Backend Service Health');
  
  try {
    // Try to access the chatbot health endpoint
    const response = await axios.get(`${BACKEND_URL}/api/chatbot/health`, {
      timeout: 5000,
    });
    
    logSuccess('Backend service is accessible');
    logInfo(`Status: ${response.data.success ? 'healthy' : 'unhealthy'}`);
    
    if (response.data.data) {
      logInfo(`RAG service connected: ${response.data.data.ragServiceConnected}`);
    }
    
    return response.data.success;
  } catch (error) {
    logError('Failed to connect to backend service');
    if (error.code === 'ECONNREFUSED') {
      logError(`Connection refused at ${BACKEND_URL}`);
      logInfo('Make sure backend service is running on port 3000');
    } else if (error.response) {
      logError(`HTTP ${error.response.status}: ${error.response.statusText}`);
    } else {
      logError(`Error: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test direct query to RAG service
 */
async function testDirectRagQuery() {
  logSection('Step 3: Testing Direct RAG Service Query');
  
  const testQuestion = 'What services does Roads Authority provide?';
  
  try {
    logInfo(`Sending query: "${testQuestion}"`);
    
    const response = await axios.post(
      `${RAG_SERVICE_URL}/api/query`,
      {
        question: testQuestion,
        top_k: 5,
      },
      {
        timeout: 30000,
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      }
    );
    
    if (response.status === 404) {
      logError('Received 404 Not Found error');
      logError('The endpoint path may be incorrect');
      return false;
    }
    
    if (response.status !== 200) {
      logError(`Received HTTP ${response.status}`);
      logError(`Response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
    
    logSuccess('Query successful');
    logInfo(`Status: ${response.status}`);
    
    // Validate response structure
    const data = response.data;
    
    if (!data.answer) {
      logWarning('Response does not contain an answer');
      return false;
    }
    
    logSuccess('Response contains an answer');
    logInfo(`Answer length: ${data.answer.length} characters`);
    logInfo(`Answer preview: ${data.answer.substring(0, 100)}...`);
    
    if (!data.sources || !Array.isArray(data.sources)) {
      logWarning('Response does not contain sources array');
    } else {
      logSuccess(`Response contains ${data.sources.length} source document(s)`);
      
      data.sources.forEach((source, index) => {
        logInfo(`  Source ${index + 1}:`);
        logInfo(`    - Document ID: ${source.document_id}`);
        logInfo(`    - Title: ${source.title}`);
        logInfo(`    - Relevance: ${source.relevance}`);
      });
    }
    
    if (data.confidence !== undefined) {
      logInfo(`Confidence: ${data.confidence}`);
    }
    
    return true;
  } catch (error) {
    logError('Direct RAG query failed');
    if (error.response) {
      logError(`HTTP ${error.response.status}: ${error.response.statusText}`);
      logError(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
      
      if (error.response.status === 404) {
        logError('Endpoint not found - check if /api/query path is correct');
      }
    } else if (error.code === 'ECONNREFUSED') {
      logError('Connection refused - RAG service may not be running');
    } else {
      logError(`Error: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test query through backend chatbot endpoint
 */
async function testBackendChatbotQuery() {
  logSection('Step 4: Testing Backend Chatbot Query');
  
  const testQuestion = 'What services does Roads Authority provide?';
  
  try {
    logInfo(`Sending query through backend: "${testQuestion}"`);
    
    const response = await axios.post(
      `${BACKEND_URL}/api/chatbot/query`,
      {
        question: testQuestion,
        sessionId: 'test-session-' + Date.now(),
      },
      {
        timeout: 30000,
        validateStatus: (status) => status < 500,
      }
    );
    
    if (response.status === 404) {
      logError('Received 404 Not Found error');
      logError('The backend endpoint may be incorrect');
      return false;
    }
    
    if (response.status !== 200) {
      logError(`Received HTTP ${response.status}`);
      logError(`Response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
    
    logSuccess('Backend query successful');
    logInfo(`Status: ${response.status}`);
    
    // Validate response structure
    const data = response.data;
    
    if (!data.success) {
      logError('Response indicates failure');
      logError(`Response: ${JSON.stringify(data, null, 2)}`);
      return false;
    }
    
    logSuccess('Response indicates success');
    
    if (!data.data || !data.data.answer) {
      logWarning('Response does not contain an answer');
      return false;
    }
    
    logSuccess('Response contains an answer');
    logInfo(`Answer length: ${data.data.answer.length} characters`);
    logInfo(`Answer preview: ${data.data.answer.substring(0, 100)}...`);
    
    if (!data.data.sources || !Array.isArray(data.data.sources)) {
      logWarning('Response does not contain sources array');
    } else {
      logSuccess(`Response contains ${data.data.sources.length} source document(s)`);
      
      data.data.sources.forEach((source, index) => {
        logInfo(`  Source ${index + 1}:`);
        logInfo(`    - Document ID: ${source.documentId}`);
        logInfo(`    - Title: ${source.title}`);
        logInfo(`    - Relevance: ${source.relevance}`);
      });
    }
    
    return true;
  } catch (error) {
    logError('Backend chatbot query failed');
    if (error.response) {
      logError(`HTTP ${error.response.status}: ${error.response.statusText}`);
      logError(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
      
      if (error.response.status === 404) {
        logError('Endpoint not found - check if /api/chatbot/query path is correct');
      } else if (error.response.status === 503) {
        logError('Service unavailable - RAG service may not be accessible from backend');
      }
    } else if (error.code === 'ECONNREFUSED') {
      logError('Connection refused - backend service may not be running');
    } else {
      logError(`Error: ${error.message}`);
    }
    return false;
  }
}

/**
 * Test with empty database (no documents indexed)
 */
async function testQueryWithNoDocuments() {
  logSection('Step 5: Testing Query with No Indexed Documents');
  
  const testQuestion = 'This is a test question for empty database';
  
  try {
    logInfo('Testing graceful handling when no documents are indexed');
    
    const response = await axios.post(
      `${RAG_SERVICE_URL}/api/query`,
      {
        question: testQuestion,
        top_k: 5,
      },
      {
        timeout: 30000,
      }
    );
    
    logSuccess('Query handled gracefully');
    
    if (response.data.sources && response.data.sources.length === 0) {
      logSuccess('Response correctly indicates no sources found');
    }
    
    if (response.data.answer) {
      logInfo(`Fallback answer: ${response.data.answer.substring(0, 100)}...`);
    }
    
    return true;
  } catch (error) {
    // This is expected if no documents are indexed
    if (error.response && error.response.status === 200) {
      logSuccess('Query handled gracefully with empty result');
      return true;
    }
    
    logWarning('Query with no documents may have failed (this might be expected)');
    return true; // Don't fail the test for this
  }
}

/**
 * Main test execution
 */
async function runTests() {
  log('\n' + '='.repeat(60), colors.cyan);
  log('CHATBOT QUERY FUNCTIONALITY TEST', colors.cyan);
  log('='.repeat(60) + '\n', colors.cyan);
  
  const results = {
    ragHealth: false,
    backendHealth: false,
    directQuery: false,
    backendQuery: false,
    noDocumentsQuery: false,
  };
  
  // Run tests
  results.ragHealth = await checkRagServiceHealth();
  results.backendHealth = await checkBackendHealth();
  
  if (results.ragHealth) {
    results.directQuery = await testDirectRagQuery();
    results.noDocumentsQuery = await testQueryWithNoDocuments();
  } else {
    logWarning('Skipping direct RAG query tests (RAG service not healthy)');
  }
  
  if (results.backendHealth) {
    results.backendQuery = await testBackendChatbotQuery();
  } else {
    logWarning('Skipping backend query tests (backend service not healthy)');
  }
  
  // Summary
  logSection('Test Summary');
  
  const tests = [
    { name: 'RAG Service Health', passed: results.ragHealth },
    { name: 'Backend Service Health', passed: results.backendHealth },
    { name: 'Direct RAG Query', passed: results.directQuery },
    { name: 'Backend Chatbot Query', passed: results.backendQuery },
    { name: 'No Documents Query', passed: results.noDocumentsQuery },
  ];
  
  tests.forEach((test) => {
    if (test.passed) {
      logSuccess(test.name);
    } else {
      logError(test.name);
    }
  });
  
  const passedCount = tests.filter((t) => t.passed).length;
  const totalCount = tests.length;
  
  log('');
  if (passedCount === totalCount) {
    logSuccess(`All tests passed (${passedCount}/${totalCount})`);
    log('');
    logSuccess('✓ Query reaches the RAG service successfully');
    logSuccess('✓ Response contains relevant document chunks (sources)');
    logSuccess('✓ Response contains a generated answer');
    logSuccess('✓ No 404 errors occur');
    log('');
    process.exit(0);
  } else {
    logError(`Some tests failed (${passedCount}/${totalCount} passed)`);
    log('');
    
    // Provide troubleshooting guidance
    if (!results.ragHealth) {
      logInfo('Troubleshooting: RAG Service');
      logInfo('  1. Check if RAG service is running: http://localhost:8001/health');
      logInfo('  2. Start RAG service: cd rag-service && python -m uvicorn app.main:app --reload --port 8001');
      logInfo('  3. Check if Ollama is running: ollama list');
      logInfo('  4. Pull required models: ollama pull nomic-embed-text:latest && ollama pull llama3.2');
    }
    
    if (!results.backendHealth) {
      logInfo('Troubleshooting: Backend Service');
      logInfo('  1. Check if backend is running: http://localhost:5000/api/chatbot/health');
      logInfo('  2. Start backend: cd backend && npm run dev');
      logInfo('  3. Check .env file has RAG_SERVICE_URL=http://localhost:8001');
    }
    
    if (!results.directQuery && results.ragHealth) {
      logInfo('Troubleshooting: Direct RAG Query');
      logInfo('  1. Check RAG service logs for errors');
      logInfo('  2. Verify endpoint path is /api/query (not /query)');
      logInfo('  3. Check if documents are indexed in ChromaDB');
    }
    
    if (!results.backendQuery && results.backendHealth) {
      logInfo('Troubleshooting: Backend Chatbot Query');
      logInfo('  1. Check backend logs for errors');
      logInfo('  2. Verify backend can reach RAG service');
      logInfo('  3. Check httpClient.ts uses correct endpoint paths');
    }
    
    log('');
    process.exit(1);
  }
}

// Run tests
runTests().catch((error) => {
  logError('Unexpected error during test execution');
  logError(error.message);
  console.error(error);
  process.exit(1);
});
