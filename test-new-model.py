"""Quick test of the new smaller model."""

import time
import requests

print("Testing llama3.2:1b model speed...")
print("=" * 60)

start = time.time()

try:
    response = requests.post(
        "http://localhost:11434/api/generate",
        json={
            "model": "llama3.2:1b",
            "prompt": "Say hello in one word.",
            "stream": False
        },
        timeout=60
    )
    
    elapsed = time.time() - start
    
    if response.status_code == 200:
        result = response.json()
        answer = result.get('response', '').strip()
        
        print(f"✅ Model responded in {elapsed:.1f} seconds")
        print(f"Response: {answer}")
        
        if elapsed < 10:
            print("\n🎉 Great! This model is fast enough for production use.")
        elif elapsed < 30:
            print("\n✅ Good! This model should work well.")
        else:
            print("\n⚠️  Still slow, but better than before.")
    else:
        print(f"❌ Error: Status {response.status_code}")
        
except requests.exceptions.Timeout:
    elapsed = time.time() - start
    print(f"❌ Timed out after {elapsed:.1f} seconds")
    print("Even the 1B model is too slow. Your CPU might be overloaded.")
except Exception as e:
    print(f"❌ Error: {e}")

print("=" * 60)
