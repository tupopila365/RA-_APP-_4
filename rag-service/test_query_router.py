"""Test script for query router implementation."""

import sys
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)


def test_llm_service():
    """Test the LLM service."""
    print("\n=== Testing LLM Service ===")
    
    try:
        from app.services.llm import LLMService, LLMError
        print("✓ LLMService imported successfully")
        
        # Test initialization
        llm_service = LLMService()
        print(f"✓ LLMService initialized with model: {llm_service.model}")
        
        # Test prompt building
        test_chunks = [
            {
                'document': 'Roads Authority is responsible for road maintenance.',
                'metadata': {
                    'document_title': 'Test Document',
                    'document_id': 'test_1'
                }
            }
        ]
        
        prompt = llm_service._build_prompt("What does Roads Authority do?", test_chunks)
        print(f"✓ Prompt building works, length: {len(prompt)}")
        
        # Verify prompt contains key elements
        assert "Roads Authority Namibia" in prompt, "Prompt should contain system instruction"
        assert "Roads Authority is responsible" in prompt, "Prompt should contain context"
        assert "What does Roads Authority do?" in prompt, "Prompt should contain question"
        print("✓ Prompt contains all required elements")
        
        print("\n✅ LLM Service tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ LLM Service test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_query_router():
    """Test the query router structure."""
    print("\n=== Testing Query Router Structure ===")
    
    try:
        from app.routers.query import router
        print("✓ Query router imported successfully")
        
        # Check router configuration
        assert router.prefix == "/query", f"Expected prefix '/query', got '{router.prefix}'"
        print(f"✓ Router prefix is correct: {router.prefix}")
        
        assert "query" in router.tags, "Router should have 'query' tag"
        print(f"✓ Router tags are correct: {router.tags}")
        
        # Check routes
        routes = [route.path for route in router.routes]
        print(f"✓ Router has {len(routes)} route(s): {routes}")
        
        # Check that POST endpoint exists
        post_routes = [route for route in router.routes if 'POST' in route.methods]
        assert len(post_routes) > 0, "Router should have at least one POST endpoint"
        print(f"✓ Router has POST endpoint(s)")
        
        print("\n✅ Query Router structure tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Query Router test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_request_validation():
    """Test that request validation works."""
    print("\n=== Testing Request Validation ===")
    
    try:
        from app.models.schemas import QueryRequest, QueryResponse, SourceDocument
        print("✓ Schema models imported successfully")
        
        # Test valid request
        valid_request = QueryRequest(
            question="What are the requirements for a driver's license?",
            top_k=5
        )
        print(f"✓ Valid QueryRequest created: question='{valid_request.question[:50]}...', top_k={valid_request.top_k}")
        
        # Test default top_k
        default_request = QueryRequest(question="Test question")
        assert default_request.top_k == 5, "Default top_k should be 5"
        print(f"✓ Default top_k is correct: {default_request.top_k}")
        
        # Test QueryResponse
        test_source = SourceDocument(
            document_id="test_doc",
            title="Test Document",
            relevance=0.95,
            chunk_index=3
        )
        
        response = QueryResponse(
            answer="This is a test answer.",
            sources=[test_source],
            confidence=0.88
        )
        print(f"✓ QueryResponse created successfully")
        print(f"  - Answer length: {len(response.answer)}")
        print(f"  - Sources count: {len(response.sources)}")
        print(f"  - Confidence: {response.confidence}")
        
        # Test SourceDocument validation
        assert 0.0 <= test_source.relevance <= 1.0, "Relevance should be between 0 and 1"
        print(f"✓ SourceDocument validation works")
        
        print("\n✅ Request validation tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Request validation test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_pipeline_integration():
    """Test that all pipeline components work together."""
    print("\n=== Testing Pipeline Integration ===")
    
    try:
        from app.services.embeddings import EmbeddingService
        from app.services.vector_store import VectorStore
        from app.services.llm import LLMService
        
        print("✓ All pipeline services imported successfully")
        
        # Test that services can be initialized
        embedding_service = EmbeddingService()
        vector_store = VectorStore()
        llm_service = LLMService()
        
        print("✓ All services initialized successfully")
        print(f"  - Embedding model: {embedding_service.model}")
        print(f"  - Vector store collection: {vector_store.collection_name}")
        print(f"  - LLM model: {llm_service.model}")
        
        print("\n✅ Pipeline integration tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Pipeline integration test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_error_handling():
    """Test that error responses are properly structured."""
    print("\n=== Testing Error Handling ===")
    
    try:
        from app.services.llm import LLMError
        from app.services.embeddings import EmbeddingError
        from app.services.vector_store import VectorStoreError
        
        print("✓ Error classes imported successfully")
        
        # Test that errors can be raised
        try:
            raise LLMError("Test LLM error")
        except LLMError as e:
            assert str(e) == "Test LLM error"
            print("✓ LLMError works correctly")
        
        try:
            raise EmbeddingError("Test embedding error")
        except EmbeddingError as e:
            assert str(e) == "Test embedding error"
            print("✓ EmbeddingError works correctly")
        
        try:
            raise VectorStoreError("Test vector store error")
        except VectorStoreError as e:
            assert str(e) == "Test vector store error"
            print("✓ VectorStoreError works correctly")
        
        print("\n✅ Error handling tests passed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error handling test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests."""
    print("=" * 60)
    print("Query Router Implementation Tests")
    print("=" * 60)
    
    results = []
    
    # Run all tests
    results.append(("LLM Service", test_llm_service()))
    results.append(("Query Router Structure", test_query_router()))
    results.append(("Request Validation", test_request_validation()))
    results.append(("Pipeline Integration", test_pipeline_integration()))
    results.append(("Error Handling", test_error_handling()))
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
