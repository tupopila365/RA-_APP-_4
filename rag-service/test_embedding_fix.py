"""Test script to verify embedding service is working after config fix."""

import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.embeddings import EmbeddingService
from app.config import settings

def test_embedding_service():
    print("=" * 60)
    print("Testing Embedding Service")
    print("=" * 60)
    print()
    
    print(f"Configuration:")
    print(f"  Base URL: {settings.ollama_base_url}")
    print(f"  Embedding Model: {settings.ollama_embedding_model}")
    print()
    
    try:
        # Initialize service
        print("1. Initializing EmbeddingService...")
        es = EmbeddingService()
        print(f"   ✓ Service initialized")
        print(f"   Model: {es.model}")
        print(f"   Base URL: {es.base_url}")
        print()
        
        # Test single embedding
        print("2. Testing single embedding generation...")
        test_text = "This is a test document chunk for embedding."
        embedding = es.generate_embedding(test_text)
        print(f"   ✓ Embedding generated successfully!")
        print(f"   Dimension: {len(embedding)}")
        print()
        
        # Test multiple chunks
        print("3. Testing multiple chunks...")
        chunks = [
            {"text": "First chunk of text", "chunk_index": 0},
            {"text": "Second chunk of text", "chunk_index": 1},
            {"text": "Third chunk of text", "chunk_index": 2},
        ]
        embedded_chunks = es.embed_chunks(chunks)
        print(f"   ✓ Embedded {len(embedded_chunks)}/{len(chunks)} chunks")
        print()
        
        print("=" * 60)
        print("✓ ALL TESTS PASSED!")
        print("=" * 60)
        print()
        print("The embedding service is working correctly.")
        print("If you're still getting errors, make sure:")
        print("  1. The RAG service has been restarted")
        print("  2. Ollama is running (ollama serve)")
        print("  3. The model is available (ollama list)")
        
    except Exception as e:
        print()
        print("=" * 60)
        print("✗ TEST FAILED")
        print("=" * 60)
        print(f"Error: {str(e)}")
        print()
        print("Troubleshooting:")
        print("  1. Make sure Ollama is running: ollama serve")
        print("  2. Check if model exists: ollama list")
        print("  3. Try pulling the model: ollama pull nomic-embed-text:latest")
        sys.exit(1)

if __name__ == "__main__":
    test_embedding_service()

