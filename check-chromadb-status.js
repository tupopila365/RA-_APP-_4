// Quick script to check ChromaDB status
const fs = require('fs');
const path = require('path');

const chromaDbPath = path.join(__dirname, 'rag-service', 'chroma_db');

console.log('Checking ChromaDB status...\n');

if (fs.existsSync(chromaDbPath)) {
  console.log('✅ ChromaDB directory exists at:', chromaDbPath);
  
  // Check if there are any files
  const files = fs.readdirSync(chromaDbPath, { recursive: true });
  console.log(`📁 Found ${files.length} files in ChromaDB directory`);
  
  if (files.length > 0) {
    console.log('\n✅ ChromaDB appears to have data');
  } else {
    console.log('\n⚠️  ChromaDB directory is empty - no documents indexed yet');
  }
} else {
  console.log('❌ ChromaDB directory not found');
  console.log('   This means no documents have been indexed yet');
}

console.log('\nTo index documents:');
console.log('1. Start the backend and RAG service');
console.log('2. Upload a PDF through the admin panel');
console.log('3. Wait for indexing to complete');
