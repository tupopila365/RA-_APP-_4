"""
RAG System Debug Script
Checks connectivity to Ollama models and RAG system components
"""
import requests
import sys
from app.config import settings

def check_ollama_connection():
    """Check if Ollama service is accessible"""
    try:
        response = requests.get(f"{settings.ollama_base_url}/api/tags", timeout=5)
        if response.status_code == 200:
            return True, response.json()
        return False, f"Status code: {response.status_code}"
    except Exception as e:
        return False, str(e)

def check_embedding_model():
    """Check if embedding model is accessible"""
    try:
        response = requests.post(
            f"{settings.ollama_base_url}/api/embeddings",
            json={
                "model": settings.ollama_embedding_model,
                "prompt": "test"
            },
            timeout=10
        )
        if response.status_code == 200:
            return True, "Model accessible"
        return False, f"Status code: {response.status_code}, Response: {response.text}"
    except Exception as e:
        return False, str(e)

def check_llm_model():
    """Check if LLM model is accessible"""
    try:
        response = requests.post(
            f"{settings.ollama_base_url}/api/generate",
            json={
                "model": settings.ollama_llm_model,
                "prompt": "Say 'OK'",
                "stream": False
            },
            timeout=60
        )
        if response.status_code == 200:
            return True, response.json().get("response", "No response text")
        return False, f"Status code: {response.status_code}, Response: {response.text}"
    except Exception as e:
        return False, str(e)

def main():
    print("=" * 60)
    print("RAG SYSTEM DEBUG CHECK")
    print("=" * 60)
    print()
    
    # Configuration
    print("Configuration:")
    print(f"  Ollama Base URL: {settings.ollama_base_url}")
    print(f"  Embedding Model: {settings.ollama_embedding_model}")
    print(f"  LLM Model: {settings.ollama_llm_model}")
    print()
    
    # Check Ollama connection
    print("1. Checking Ollama service connection...")
    success, result = check_ollama_connection()
    if success:
        print("   ✓ Ollama service is accessible")
        print(f"   Available models: {[m['name'] for m in result.get('models', [])]}")
    else:
        print(f"   ✗ Failed to connect to Ollama: {result}")
        print("   Make sure Ollama is running: ollama serve")
    print()
    
    # Check embedding model
    print(f"2. Checking embedding model '{settings.ollama_embedding_model}'...")
    success, result = check_embedding_model()
    if success:
        print(f"   ✓ Embedding model is accessible: {result}")
    else:
        print(f"   ✗ Embedding model check failed: {result}")
        print(f"   Try pulling the model: ollama pull {settings.ollama_embedding_model}")
    print()
    
    # Check LLM model
    print(f"3. Checking LLM model '{settings.ollama_llm_model}'...")
    success, result = check_llm_model()
    if success:
        print(f"   ✓ LLM model is accessible")
        print(f"   Test response: {result[:200]}...")
    else:
        print(f"   ✗ LLM model check failed: {result}")
        print(f"   Try pulling the model: ollama pull {settings.ollama_llm_model}")
    print()
    
    print("=" * 60)
    print("DEBUG CHECK COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
