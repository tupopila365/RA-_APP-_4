"""Diagnostic script to troubleshoot embedding generation issues."""

import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.embeddings import EmbeddingService, EmbeddingError
from app.config import settings

def diagnose_embedding_issue():
    """Run diagnostics to identify embedding generation issues."""
    print("=" * 80)
    print("EMBEDDING SERVICE DIAGNOSTICS")
    print("=" * 80)
    print()
    
    # Check configuration
    print("1. Configuration Check")
    print("-" * 80)
    print(f"   Ollama Base URL: {settings.ollama_base_url}")
    print(f"   Embedding Model: {settings.ollama_embedding_model}")
    print()
    
    # Initialize service
    print("2. Initializing EmbeddingService...")
    print("-" * 80)
    try:
        embedding_service = EmbeddingService()
        print("   ✓ Service initialized successfully")
        print()
    except Exception as e:
        print(f"   ✗ Failed to initialize service: {str(e)}")
        return False
    
    # Check connection
    print("3. Checking Ollama Connection...")
    print("-" * 80)
    is_connected = embedding_service.check_connection()
    if is_connected:
        print("   ✓ Ollama is accessible")
    else:
        print("   ✗ Cannot connect to Ollama")
        print(f"   → Make sure Ollama is running: ollama serve")
        print(f"   → Check if Ollama is accessible at: {settings.ollama_base_url}")
        return False
    print()
    
    # Check model availability
    print("4. Checking Model Availability...")
    print("-" * 80)
    is_available = embedding_service.check_model_available()
    if is_available:
        print(f"   ✓ Model '{settings.ollama_embedding_model}' is available")
    else:
        print(f"   ✗ Model '{settings.ollama_embedding_model}' is not available")
        print(f"   → Install the model: ollama pull {settings.ollama_embedding_model}")
        return False
    print()
    
    # Test single embedding
    print("5. Testing Single Embedding Generation...")
    print("-" * 80)
    try:
        test_text = "This is a test document chunk for embedding generation."
        embedding = embedding_service.generate_embedding(test_text)
        print(f"   ✓ Successfully generated embedding")
        print(f"   → Dimension: {len(embedding)}")
    except EmbeddingError as e:
        print(f"   ✗ Failed to generate embedding: {str(e)}")
        return False
    except Exception as e:
        print(f"   ✗ Unexpected error: {str(e)}")
        return False
    print()
    
    # Test multiple chunks
    print("6. Testing Multiple Chunks...")
    print("-" * 80)
    try:
        test_chunks = [
            {"text": "First chunk of text for testing", "chunk_index": 0},
            {"text": "Second chunk of text for testing", "chunk_index": 1},
            {"text": "Third chunk of text for testing", "chunk_index": 2},
        ]
        embedded_chunks = embedding_service.embed_chunks(test_chunks)
        print(f"   ✓ Successfully embedded {len(embedded_chunks)}/{len(test_chunks)} chunks")
        if len(embedded_chunks) < len(test_chunks):
            print(f"   ⚠ Warning: {len(test_chunks) - len(embedded_chunks)} chunks failed")
    except EmbeddingError as e:
        print(f"   ✗ Failed to embed chunks: {str(e)}")
        return False
    except Exception as e:
        print(f"   ✗ Unexpected error: {str(e)}")
        return False
    print()
    
    # Summary
    print("=" * 80)
    print("✓ ALL DIAGNOSTICS PASSED")
    print("=" * 80)
    print()
    print("The embedding service is working correctly.")
    print("If you're still experiencing issues:")
    print("  1. Restart the RAG service")
    print("  2. Check the RAG service logs for detailed error messages")
    print("  3. Verify the document chunks are not empty")
    print()
    return True

if __name__ == "__main__":
    success = diagnose_embedding_issue()
    sys.exit(0 if success else 1)

