/**
 * Quick script to check document indexing status
 * Run with: node check-indexing-status.js <document-id>
 */

const axios = require('axios');

const BACKEND_URL = 'http://localhost:3000';
const RAG_SERVICE_URL = 'http://localhost:8001';

async function checkStatus(documentId) {
  console.log('Checking indexing status for document:', documentId);
  console.log('='.repeat(60));

  try {
    // Check RAG service health
    console.log('\n1. Checking RAG Service Health...');
    try {
      const ragHealth = await axios.get(`${RAG_SERVICE_URL}/health`);
      console.log('✅ RAG Service Status:', ragHealth.data.status);
      console.log('   Ollama Connected:', ragHealth.data.ollama_connected);
      console.log('   ChromaDB Connected:', ragHealth.data.chromadb_connected);
    } catch (error) {
      console.log('❌ RAG Service is not responding!');
      console.log('   Make sure RAG service is running on port 8001');
      return;
    }

    // Check indexing progress
    console.log('\n2. Checking Indexing Progress...');
    try {
      const progress = await axios.get(`${RAG_SERVICE_URL}/index/progress/${documentId}`);
      console.log('Progress Data:', JSON.stringify(progress.data, null, 2));
    } catch (error) {
      console.log('⚠️  No progress data found');
      console.log('   This might mean indexing hasn\'t started or already completed');
    }

    // Check document in backend
    console.log('\n3. Checking Document in Backend...');
    try {
      const doc = await axios.get(`${BACKEND_URL}/api/documents/${documentId}`);
      console.log('Document Status:');
      console.log('   Title:', doc.data.data.title);
      console.log('   Indexed:', doc.data.data.indexed ? '✅ Yes' : '❌ No (still processing)');
      console.log('   Created:', doc.data.data.createdAt);
    } catch (error) {
      console.log('❌ Could not fetch document from backend');
    }

    console.log('\n' + '='.repeat(60));
    console.log('\nRecommendations:');
    console.log('1. If RAG service is down, restart it');
    console.log('2. If Ollama is not connected, start Ollama: ollama serve');
    console.log('3. If indexing is stuck, check RAG service logs for errors');
    console.log('4. Large PDFs can take 5-10 minutes to index');
    console.log('5. Check system resources (CPU/RAM) - Ollama is resource-intensive');

  } catch (error) {
    console.error('Error checking status:', error.message);
  }
}

// Get document ID from command line
const documentId = process.argv[2];

if (!documentId) {
  console.log('Usage: node check-indexing-status.js <document-id>');
  console.log('Example: node check-indexing-status.js 507f1f77bcf86cd799439011');
  process.exit(1);
}

checkStatus(documentId);
