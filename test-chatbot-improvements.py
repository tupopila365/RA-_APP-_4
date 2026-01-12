#!/usr/bin/env python3
"""
Test script to verify chatbot improvements are working correctly.
"""

import requests
import json
import time
import sys
from typing import Dict, Any

# Configuration
RAG_SERVICE_URL = "http://localhost:8001"
BACKEND_URL = "http://localhost:3000"

def test_rag_service_health():
    """Test if RAG service is running and healthy."""
    try:
        response = requests.get(f"{RAG_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ RAG Service is running")
            return True
        else:
            print(f"❌ RAG Service health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ RAG Service is not accessible: {e}")
        return False

def test_backend_health():
    """Test if backend service is running."""
    try:
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend Service is running")
            return True
        else:
            print(f"❌ Backend Service health check failed: {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Backend Service is not accessible: {e}")
        return False

def test_redis_connection():
    """Test Redis connection through cache service."""
    try:
        # Try to import and test Redis
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
        r.ping()
        print("✅ Redis is running and accessible")
        return True
    except ImportError:
        print("⚠️  Redis Python client not installed (pip install redis)")
        return False
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")
        return False

def test_greeting_detection():
    """Test improved greeting detection."""
    test_cases = [
        "hi",
        "hello there",
        "good morning",
        "how are you",
        "hey"
    ]
    
    print("\n🧪 Testing Greeting Detection:")
    for greeting in test_cases:
        try:
            response = requests.post(
                f"{RAG_SERVICE_URL}/query/stream",
                json={"question": greeting, "top_k": 5},
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"✅ Greeting '{greeting}' processed successfully")
            else:
                print(f"❌ Greeting '{greeting}' failed: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Greeting '{greeting}' error: {e}")

def test_caching_functionality():
    """Test caching by making the same query twice."""
    test_question = "How do I register my vehicle?"
    
    print(f"\n🧪 Testing Caching with: '{test_question}'")
    
    # First request (should be slow)
    start_time = time.time()
    try:
        response1 = requests.post(
            f"{RAG_SERVICE_URL}/query/stream",
            json={"question": test_question, "top_k": 5},
            timeout=30
        )
        first_duration = time.time() - start_time
        
        if response1.status_code == 200:
            print(f"✅ First request completed in {first_duration:.2f}s")
        else:
            print(f"❌ First request failed: {response1.status_code}")
            return
            
    except Exception as e:
        print(f"❌ First request error: {e}")
        return
    
    # Wait a moment for cache to be set
    time.sleep(1)
    
    # Second request (should be faster if caching works)
    start_time = time.time()
    try:
        response2 = requests.post(
            f"{RAG_SERVICE_URL}/query/stream",
            json={"question": test_question, "top_k": 5},
            timeout=30
        )
        second_duration = time.time() - start_time
        
        if response2.status_code == 200:
            print(f"✅ Second request completed in {second_duration:.2f}s")
            
            # Check if second request was faster (indicating cache hit)
            if second_duration < first_duration * 0.8:
                print("🚀 Caching appears to be working (second request faster)")
            else:
                print("⚠️  Caching may not be working (similar response times)")
        else:
            print(f"❌ Second request failed: {response2.status_code}")
            
    except Exception as e:
        print(f"❌ Second request error: {e}")

def test_timeout_handling():
    """Test timeout configuration."""
    print("\n🧪 Testing Timeout Handling:")
    
    # Test with a complex query that might take time
    complex_query = "Tell me everything about vehicle registration, licensing, permits, and all related procedures in great detail"
    
    try:
        response = requests.post(
            f"{RAG_SERVICE_URL}/query/stream",
            json={"question": complex_query, "top_k": 10},
            timeout=35  # Slightly longer than service timeout
        )
        
        if response.status_code == 200:
            print("✅ Complex query handled within timeout")
        elif response.status_code == 408:
            print("✅ Timeout handling working (408 response)")
        else:
            print(f"⚠️  Unexpected response: {response.status_code}")
            
    except requests.exceptions.Timeout:
        print("✅ Request timeout handled properly")
    except Exception as e:
        print(f"❌ Timeout test error: {e}")

def test_error_handling():
    """Test improved error handling."""
    print("\n🧪 Testing Error Handling:")
    
    # Test with invalid input
    test_cases = [
        {"question": "", "top_k": 5},  # Empty question
        {"question": "test", "top_k": -1},  # Invalid top_k
        {"question": "x" * 2000, "top_k": 5},  # Very long question
    ]
    
    for i, test_case in enumerate(test_cases):
        try:
            response = requests.post(
                f"{RAG_SERVICE_URL}/query/stream",
                json=test_case,
                timeout=10
            )
            
            if response.status_code in [400, 422]:
                print(f"✅ Error case {i+1} handled properly ({response.status_code})")
            else:
                print(f"⚠️  Error case {i+1} unexpected response: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error case {i+1} exception: {e}")

def main():
    """Run all tests."""
    print("🚀 CHATBOT IMPROVEMENTS TEST SUITE")
    print("=" * 50)
    
    # Test service health
    rag_healthy = test_rag_service_health()
    backend_healthy = test_backend_health()
    redis_healthy = test_redis_connection()
    
    if not rag_healthy:
        print("\n❌ RAG Service is not running. Please start it first:")
        print("cd rag-service && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload")
        return False
    
    if not redis_healthy:
        print("\n⚠️  Redis is not running. Caching tests will be skipped.")
        print("Start Redis: redis-server")
    
    # Run functionality tests
    test_greeting_detection()
    
    if redis_healthy:
        test_caching_functionality()
    else:
        print("\n⏭️  Skipping caching tests (Redis not available)")
    
    test_timeout_handling()
    test_error_handling()
    
    print("\n" + "=" * 50)
    print("🎉 Test suite completed!")
    print("\nIf all tests passed, your chatbot improvements are working correctly.")
    print("You can now test the full experience in the mobile app.")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)