"""Debug script to test the chatbot query flow step by step."""

import sys
import time
import requests
from datetime import datetime

RAG_SERVICE_URL = "http://localhost:8001"
BACKEND_URL = "http://localhost:5000"

def log(message):
    """Print timestamped log message."""
    timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
    print(f"[{timestamp}] {message}")

def test_rag_health():
    """Test RAG service health."""
    log("Step 1: Testing RAG service health...")
    try:
        response = requests.get(f"{RAG_SERVICE_URL}/health", timeout=5)
        data = response.json()
        log(f"  ✅ RAG service is {data['status']}")
        log(f"  - Ollama connected: {data['ollama_connected']}")
        log(f"  - ChromaDB connected: {data['chromadb_connected']}")
        return True
    except Exception as e:
        log(f"  ❌ RAG service health check failed: {e}")
        return False

def test_ollama_direct():
    """Test Ollama directly."""
    log("\nStep 2: Testing Ollama directly...")
    try:
        start = time.time()
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3.2:1b",
                "prompt": "Say 'Hello' in one word only.",
                "stream": False
            },
            timeout=120
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            result = response.json()
            log(f"  ✅ Ollama responded in {elapsed:.1f} seconds")
            log(f"  Response: {result.get('response', '').strip()[:50]}")
            
            if elapsed > 30:
                log(f"  ⚠️  WARNING: Ollama took {elapsed:.1f}s - this is slow!")
                log(f"     First query after startup is always slow (model loading)")
                log(f"     Subsequent queries should be faster")
            return True
        else:
            log(f"  ❌ Ollama returned status {response.status_code}")
            return False
    except requests.exceptions.Timeout:
        log(f"  ❌ Ollama timed out after 120 seconds")
        log(f"     This means the model is too slow for your hardware")
        return False
    except Exception as e:
        log(f"  ❌ Ollama test failed: {e}")
        return False

def test_rag_query():
    """Test RAG service query endpoint."""
    log("\nStep 3: Testing RAG service query endpoint...")
    try:
        start = time.time()
        response = requests.post(
            f"{RAG_SERVICE_URL}/api/query",
            json={
                "question": "Hello, can you hear me?",
                "top_k": 3
            },
            timeout=120
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log(f"  ✅ RAG query completed in {elapsed:.1f} seconds")
            log(f"  Answer length: {len(data.get('answer', ''))} characters")
            log(f"  Sources found: {len(data.get('sources', []))}")
            log(f"  Confidence: {data.get('confidence', 0)}")
            
            if elapsed > 30:
                log(f"  ⚠️  Query took {elapsed:.1f}s - this is slow")
            
            # Show first 100 chars of answer
            answer = data.get('answer', '')
            if answer:
                log(f"  Answer preview: {answer[:100]}...")
            
            return True
        else:
            log(f"  ❌ RAG query returned status {response.status_code}")
            log(f"  Response: {response.text[:200]}")
            return False
    except requests.exceptions.Timeout:
        log(f"  ❌ RAG query timed out after 120 seconds")
        log(f"     The query is taking too long - likely Ollama is slow")
        return False
    except Exception as e:
        log(f"  ❌ RAG query failed: {e}")
        return False

def test_backend_chatbot():
    """Test backend chatbot endpoint."""
    log("\nStep 4: Testing backend chatbot endpoint...")
    try:
        start = time.time()
        response = requests.post(
            f"{BACKEND_URL}/api/chatbot/query",
            json={
                "question": "Hello, can you hear me?",
                "sessionId": "debug_session"
            },
            timeout=120
        )
        elapsed = time.time() - start
        
        if response.status_code == 200:
            data = response.json()
            log(f"  ✅ Backend chatbot responded in {elapsed:.1f} seconds")
            
            if data.get('success'):
                answer_data = data.get('data', {})
                log(f"  Answer length: {len(answer_data.get('answer', ''))} characters")
                log(f"  Sources: {len(answer_data.get('sources', []))}")
                
                # Show answer preview
                answer = answer_data.get('answer', '')
                if answer:
                    log(f"  Answer preview: {answer[:100]}...")
            else:
                log(f"  ❌ Backend returned success=false")
                log(f"  Error: {data.get('error', {})}")
            
            return True
        else:
            log(f"  ❌ Backend returned status {response.status_code}")
            log(f"  Response: {response.text[:200]}")
            return False
    except requests.exceptions.Timeout:
        log(f"  ❌ Backend chatbot timed out after 120 seconds")
        return False
    except Exception as e:
        log(f"  ❌ Backend chatbot failed: {e}")
        return False

def main():
    """Run all debug tests."""
    log("=" * 60)
    log("CHATBOT DEBUG FLOW")
    log("=" * 60)
    
    # Test each component
    results = []
    
    results.append(("RAG Health", test_rag_health()))
    results.append(("Ollama Direct", test_ollama_direct()))
    results.append(("RAG Query", test_rag_query()))
    results.append(("Backend Chatbot", test_backend_chatbot()))
    
    # Summary
    log("\n" + "=" * 60)
    log("SUMMARY")
    log("=" * 60)
    
    for name, passed in results:
        status = "✅ PASS" if passed else "❌ FAIL"
        log(f"{status} - {name}")
    
    all_passed = all(result[1] for result in results)
    
    if all_passed:
        log("\n🎉 All tests passed! Chatbot should be working.")
    else:
        log("\n⚠️  Some tests failed. Check the logs above for details.")
        
        # Provide specific guidance
        if not results[0][1]:
            log("\n💡 RAG service is not healthy. Make sure it's running:")
            log("   cd rag-service")
            log("   python -m uvicorn app.main:app --host 0.0.0.0 --port 8001")
        
        if not results[1][1]:
            log("\n💡 Ollama is not responding or too slow:")
            log("   1. Make sure Ollama is running: ollama serve")
            log("   2. Model might be loading (wait 1-2 minutes and try again)")
            log("   3. Consider using a smaller model: ollama pull llama3.2:3b")

if __name__ == "__main__":
    main()
