"""Test script to verify FastAPI app functionality."""

import sys
from fastapi.testclient import TestClient

# Add app to path
sys.path.insert(0, '.')

from app.main import app

# Create test client
client = TestClient(app)


def test_root_endpoint():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "Roads Authority RAG Service"
    assert data["status"] == "running"
    print("✓ Root endpoint test passed")


def test_health_endpoint():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "ollama_connected" in data
    assert "chromadb_connected" in data
    assert "timestamp" in data
    print("✓ Health endpoint test passed")
    print(f"  Status: {data['status']}")
    print(f"  Ollama connected: {data['ollama_connected']}")
    print(f"  ChromaDB connected: {data['chromadb_connected']}")


def test_docs_available():
    """Test that API docs are available."""
    response = client.get("/docs")
    assert response.status_code == 200
    print("✓ API docs endpoint test passed")


def test_routers_registered():
    """Test that routers are properly registered."""
    # Test index endpoint exists
    response = client.post("/api/index", json={
        "document_url": "http://example.com/test.pdf",
        "document_id": "test_doc",
        "title": "Test Document"
    })
    # We expect it to fail with a processing error, but the endpoint should exist
    assert response.status_code in [400, 500, 503]
    print("✓ Index router registered")
    
    # Test query endpoint exists
    response = client.post("/api/query", json={
        "question": "Test question",
        "top_k": 5
    })
    # We expect it to work or fail gracefully
    assert response.status_code in [200, 500, 503]
    print("✓ Query router registered")


if __name__ == "__main__":
    print("Testing FastAPI application...")
    print()
    
    try:
        test_root_endpoint()
        test_health_endpoint()
        test_docs_available()
        test_routers_registered()
        
        print()
        print("=" * 60)
        print("All tests passed! ✓")
        print("=" * 60)
        
    except AssertionError as e:
        print(f"\n✗ Test failed: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Unexpected error: {e}")
        sys.exit(1)
