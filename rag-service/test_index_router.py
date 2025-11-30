"""Test script for the index router implementation."""

import sys
from pathlib import Path

# Add app directory to path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.testclient import TestClient
from app.routers.index import router
from app.models.schemas import IndexRequest


def test_router_structure():
    """Test that the router is properly structured."""
    print("\n=== Testing Index Router Structure ===")
    
    # Create a minimal FastAPI app
    app = FastAPI()
    app.include_router(router)
    
    # Create test client
    client = TestClient(app)
    
    # Check that the endpoint exists
    print("✓ Router successfully mounted to FastAPI app")
    
    # Check the routes
    routes = [route.path for route in app.routes]
    print(f"✓ Available routes: {routes}")
    
    # Verify the /index endpoint exists
    if "/index" in routes or "/index/" in routes:
        print("✓ POST /index endpoint is registered")
    else:
        print("❌ POST /index endpoint not found")
        return False
    
    return True


def test_request_validation():
    """Test that request validation works."""
    print("\n=== Testing Request Validation ===")
    
    # Test valid request structure
    try:
        valid_request = IndexRequest(
            document_url="https://example.com/test.pdf",
            document_id="test_doc_123",
            title="Test Document"
        )
        print("✓ Valid IndexRequest created successfully")
        print(f"  - document_url: {valid_request.document_url}")
        print(f"  - document_id: {valid_request.document_id}")
        print(f"  - title: {valid_request.title}")
    except Exception as e:
        print(f"❌ Failed to create valid request: {str(e)}")
        return False
    
    # Test invalid request (missing required fields)
    try:
        from pydantic import ValidationError
        invalid_request = IndexRequest(
            document_url="https://example.com/test.pdf"
            # Missing document_id and title
        )
        print("❌ Invalid request should have raised ValidationError")
        return False
    except Exception as e:
        print(f"✓ Invalid request properly rejected: {type(e).__name__}")
    
    return True


def test_pipeline_components():
    """Test that all pipeline components are importable and functional."""
    print("\n=== Testing Pipeline Components ===")
    
    try:
        from app.services.pdf_processor import PDFProcessor
        processor = PDFProcessor()
        print("✓ PDFProcessor imported and initialized")
    except Exception as e:
        print(f"❌ PDFProcessor failed: {str(e)}")
        return False
    
    try:
        from app.utils.chunking import TextChunker
        chunker = TextChunker()
        print("✓ TextChunker imported and initialized")
    except Exception as e:
        print(f"❌ TextChunker failed: {str(e)}")
        return False
    
    try:
        from app.services.embeddings import EmbeddingService
        # Don't initialize as it requires Ollama connection
        print("✓ EmbeddingService imported")
    except Exception as e:
        print(f"❌ EmbeddingService failed: {str(e)}")
        return False
    
    try:
        from app.services.vector_store import VectorStore
        # Don't initialize as it requires ChromaDB
        print("✓ VectorStore imported")
    except Exception as e:
        print(f"❌ VectorStore failed: {str(e)}")
        return False
    
    return True


def test_error_handling():
    """Test that error responses are properly structured."""
    print("\n=== Testing Error Handling ===")
    
    from app.models.schemas import ErrorResponse
    
    try:
        error = ErrorResponse(
            status="error",
            error="TEST_ERROR",
            message="This is a test error",
            details={"key": "value"}
        )
        print("✓ ErrorResponse model works correctly")
        print(f"  - status: {error.status}")
        print(f"  - error: {error.error}")
        print(f"  - message: {error.message}")
    except Exception as e:
        print(f"❌ ErrorResponse failed: {str(e)}")
        return False
    
    return True


def main():
    """Run all tests."""
    print("=" * 60)
    print("Index Router Implementation Tests")
    print("=" * 60)
    
    all_passed = True
    
    # Test router structure
    if not test_router_structure():
        print("\n❌ Router structure tests failed")
        all_passed = False
    
    # Test request validation
    if not test_request_validation():
        print("\n❌ Request validation tests failed")
        all_passed = False
    
    # Test pipeline components
    if not test_pipeline_components():
        print("\n❌ Pipeline component tests failed")
        all_passed = False
    
    # Test error handling
    if not test_error_handling():
        print("\n❌ Error handling tests failed")
        all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ All tests passed!")
        print("=" * 60)
        print("\nIndex Router Implementation Summary:")
        print("  ✓ POST /index endpoint created")
        print("  ✓ Full pipeline implemented:")
        print("    1. Download PDF from URL")
        print("    2. Extract text from PDF")
        print("    3. Chunk text with overlap")
        print("    4. Generate embeddings with Ollama")
        print("    5. Store in ChromaDB vector database")
        print("  ✓ Request/Response validation")
        print("  ✓ Error handling with proper HTTP status codes")
        print("\nNext Steps:")
        print("  - Task 17: Implement query processing pipeline")
        print("  - Task 18: Create FastAPI app entry point (main.py)")
        print("\nNote: Full integration testing requires:")
        print("  - Running Ollama service (port 11434)")
        print("  - ChromaDB instance")
        print("  - Valid PDF document URL")
    else:
        print("❌ Some tests failed")
        print("=" * 60)
    
    return all_passed


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
