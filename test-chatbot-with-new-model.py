"""Test the full chatbot flow with the new model."""

import time
import requests

print("Testing Full Chatbot Flow with llama3.2:1b")
print("=" * 60)

# Test 1: RAG Service Query
print("\n1. Testing RAG service directly...")
start = time.time()

try:
    response = requests.post(
        "http://localhost:8001/api/query",
        json={
            "question": "Hello, how are you?",
            "top_k": 3
        },
        timeout=30
    )
    
    elapsed = time.time() - start
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ RAG service responded in {elapsed:.1f} seconds")
        print(f"   Answer: {data.get('answer', '')[:100]}...")
        print(f"   Sources: {len(data.get('sources', []))}")
    else:
        print(f"   ❌ RAG service error: {response.status_code}")
        print(f"   {response.text[:200]}")
        
except requests.exceptions.Timeout:
    print(f"   ❌ RAG service timed out after 30 seconds")
    print(f"   Make sure RAG service is restarted with new model")
except requests.exceptions.ConnectionError:
    print(f"   ❌ Cannot connect to RAG service")
    print(f"   Make sure it's running on port 8001")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Backend Chatbot
print("\n2. Testing backend chatbot endpoint...")
start = time.time()

try:
    response = requests.post(
        "http://localhost:5000/api/chatbot/query",
        json={
            "question": "Hello, how are you?",
            "sessionId": "test_session"
        },
        timeout=30
    )
    
    elapsed = time.time() - start
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            answer_data = data.get('data', {})
            print(f"   ✅ Backend responded in {elapsed:.1f} seconds")
            print(f"   Answer: {answer_data.get('answer', '')[:100]}...")
            print(f"   Sources: {len(answer_data.get('sources', []))}")
        else:
            print(f"   ❌ Backend returned error:")
            print(f"   {data.get('error', {})}")
    else:
        print(f"   ❌ Backend error: {response.status_code}")
        print(f"   {response.text[:200]}")
        
except requests.exceptions.Timeout:
    print(f"   ❌ Backend timed out after 30 seconds")
except requests.exceptions.ConnectionError:
    print(f"   ❌ Cannot connect to backend")
    print(f"   Make sure it's running on port 5000")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "=" * 60)
print("NEXT STEPS:")
print("1. If RAG service failed, restart it:")
print("   cd rag-service")
print("   python -m uvicorn app.main:app --host 0.0.0.0 --port 8001")
print("\n2. If backend failed, restart it:")
print("   cd backend")
print("   npm run dev")
print("\n3. Then test from your mobile app!")
print("=" * 60)
