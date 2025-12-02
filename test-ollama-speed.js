// Test Ollama response time
const axios = require('axios');

const OLLAMA_URL = 'http://localhost:11434';

async function testOllama() {
  console.log('Testing Ollama response time...\n');
  
  try {
    // Test 1: Check if Ollama is running
    console.log('1. Checking if Ollama is running...');
    const startCheck = Date.now();
    await axios.get(`${OLLAMA_URL}/api/tags`);
    const checkTime = Date.now() - startCheck;
    console.log(`   ✅ Ollama is running (${checkTime}ms)\n`);
    
    // Test 2: Simple generation test
    console.log('2. Testing text generation (this may take 30-60 seconds on first run)...');
    const startGen = Date.now();
    
    const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
      model: 'llama3.2:1b',
      prompt: 'Say hello in one word',
      stream: false
    }, {
      timeout: 120000 // 2 minute timeout
    });
    
    const genTime = Date.now() - startGen;
    console.log(`   ✅ Generation completed in ${(genTime / 1000).toFixed(1)} seconds`);
    console.log(`   Response: ${response.data.response.trim()}\n`);
    
    if (genTime > 30000) {
      console.log('⚠️  WARNING: Generation took over 30 seconds');
      console.log('   This is normal for the first query after starting Ollama');
      console.log('   Subsequent queries should be much faster (2-5 seconds)\n');
      console.log('   Consider using a smaller model for faster responses:');
      console.log('   - ollama pull llama3.2:3b (faster, smaller)');
      console.log('   - Update OLLAMA_LLM_MODEL in rag-service/.env');
    } else {
      console.log('✅ Response time is good!');
    }
    
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Cannot connect to Ollama');
      console.log('   Make sure Ollama is running: ollama serve');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.log('❌ Request timed out');
      console.log('   Ollama is taking too long to respond');
      console.log('   This usually means:');
      console.log('   1. Model is loading for the first time (wait and try again)');
      console.log('   2. Your hardware is too slow for this model size');
      console.log('   3. Consider using a smaller model (llama3.2:3b)');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testOllama();
