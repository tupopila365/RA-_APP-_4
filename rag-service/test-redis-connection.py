#!/usr/bin/env python3
"""Test Redis connection for RAG service."""

import sys
import redis
from app.config import settings

def test_redis_connection():
    """Test Redis connection with the same settings as the RAG service."""
    print("Testing Redis connection...")
    print(f"Host: {settings.redis_host}")
    print(f"Port: {settings.redis_port}")
    print(f"DB: {settings.redis_db}")
    print(f"Caching enabled: {settings.enable_caching}")
    print()
    
    if not settings.enable_caching:
        print("❌ Caching is disabled in settings")
        return False
    
    try:
        # Create Redis client with same settings as cache service
        client = redis.Redis(
            host=settings.redis_host,
            port=settings.redis_port,
            db=settings.redis_db,
            password=settings.redis_password,
            decode_responses=True,
            socket_timeout=5,
            socket_connect_timeout=5,
            retry_on_timeout=True,
            health_check_interval=30
        )
        
        # Test connection
        result = client.ping()
        if result:
            print("✅ Redis connection successful!")
            
            # Test basic operations
            client.set("test_key", "test_value", ex=10)
            value = client.get("test_key")
            
            if value == "test_value":
                print("✅ Redis read/write operations working")
                client.delete("test_key")
                print("✅ Redis delete operation working")
                
                # Get Redis info
                info = client.info()
                print(f"✅ Redis version: {info.get('redis_version', 'Unknown')}")
                print(f"✅ Memory usage: {info.get('used_memory_human', 'Unknown')}")
                
                return True
            else:
                print("❌ Redis read/write test failed")
                return False
        else:
            print("❌ Redis ping failed")
            return False
            
    except redis.ConnectionError as e:
        print(f"❌ Redis connection error: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure Redis server is running")
        print("2. Check if Redis is installed: redis-server --version")
        print("3. Start Redis: redis-server")
        print("4. Or run: SETUP-REDIS.bat")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    success = test_redis_connection()
    sys.exit(0 if success else 1)