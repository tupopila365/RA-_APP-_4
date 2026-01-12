"""Redis caching service for query results and embeddings."""

import json
import hashlib
import logging
from typing import Optional, List, Dict, Any, Union
import redis
from app.config import settings

logger = logging.getLogger(__name__)


class CacheError(Exception):
    """Custom exception for cache operations."""
    pass


class CacheService:
    """Service for caching query results, embeddings, and context."""
    
    def __init__(self):
        """Initialize Redis connection."""
        self.redis_client = None
        self.enabled = settings.enable_caching
        
        if not self.enabled:
            logger.info("Caching is disabled")
            return
            
        try:
            self.redis_client = redis.Redis(
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
            self.redis_client.ping()
            logger.info(f"Connected to Redis at {settings.redis_host}:{settings.redis_port}")
            
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Caching disabled.")
            self.redis_client = None
            self.enabled = False
    
    def _generate_cache_key(self, prefix: str, data: Union[str, Dict[str, Any]]) -> str:
        """
        Generate a consistent cache key from data.
        
        Args:
            prefix: Key prefix (e.g., 'query', 'embedding', 'context')
            data: Data to hash (string or dict)
            
        Returns:
            Cache key string
        """
        if isinstance(data, dict):
            # Sort dict keys for consistent hashing
            data_str = json.dumps(data, sort_keys=True)
        else:
            data_str = str(data)
        
        # Create hash of the data
        hash_obj = hashlib.sha256(data_str.encode('utf-8'))
        hash_hex = hash_obj.hexdigest()[:16]  # Use first 16 chars
        
        return f"rag:{prefix}:{hash_hex}"
    
    def get_query_result(self, question: str, context_hash: str = None) -> Optional[Dict[str, Any]]:
        """
        Get cached query result.
        
        Args:
            question: User's question
            context_hash: Optional hash of context used
            
        Returns:
            Cached result dict or None if not found
        """
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            cache_data = {
                'question': question.lower().strip(),
                'context_hash': context_hash
            }
            cache_key = self._generate_cache_key('query', cache_data)
            
            result = self.redis_client.get(cache_key)
            if result:
                logger.debug(f"Cache hit for query: {question[:50]}...")
                return json.loads(result)
            
            logger.debug(f"Cache miss for query: {question[:50]}...")
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached query result: {e}")
            return None
    
    def cache_query_result(
        self, 
        question: str, 
        answer: str, 
        sources: List[Dict[str, Any]], 
        confidence: float,
        context_hash: str = None,
        ttl: int = None
    ) -> bool:
        """
        Cache query result.
        
        Args:
            question: User's question
            answer: Generated answer
            sources: Source documents used
            confidence: Answer confidence score
            context_hash: Optional hash of context used
            ttl: Time to live in seconds (defaults to settings.cache_ttl)
            
        Returns:
            True if cached successfully, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            cache_data = {
                'question': question.lower().strip(),
                'context_hash': context_hash
            }
            cache_key = self._generate_cache_key('query', cache_data)
            
            result_data = {
                'answer': answer,
                'sources': sources,
                'confidence': confidence,
                'cached_at': json.dumps(None)  # Will be set by Redis
            }
            
            ttl = ttl or settings.cache_ttl
            success = self.redis_client.setex(
                cache_key, 
                ttl, 
                json.dumps(result_data)
            )
            
            if success:
                logger.debug(f"Cached query result for: {question[:50]}...")
            
            return bool(success)
            
        except Exception as e:
            logger.error(f"Error caching query result: {e}")
            return False
    
    def get_embedding(self, text: str) -> Optional[List[float]]:
        """
        Get cached embedding for text.
        
        Args:
            text: Text to get embedding for
            
        Returns:
            Embedding vector or None if not found
        """
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            cache_key = self._generate_cache_key('embedding', text.strip())
            
            result = self.redis_client.get(cache_key)
            if result:
                logger.debug(f"Cache hit for embedding: {text[:30]}...")
                return json.loads(result)
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached embedding: {e}")
            return None
    
    def cache_embedding(self, text: str, embedding: List[float], ttl: int = None) -> bool:
        """
        Cache embedding for text.
        
        Args:
            text: Text the embedding was generated for
            embedding: Embedding vector
            ttl: Time to live in seconds (defaults to 24 hours)
            
        Returns:
            True if cached successfully, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            cache_key = self._generate_cache_key('embedding', text.strip())
            
            # Cache embeddings for 24 hours by default
            ttl = ttl or (24 * 3600)
            
            success = self.redis_client.setex(
                cache_key,
                ttl,
                json.dumps(embedding)
            )
            
            if success:
                logger.debug(f"Cached embedding for: {text[:30]}...")
            
            return bool(success)
            
        except Exception as e:
            logger.error(f"Error caching embedding: {e}")
            return False
    
    def get_context(self, question: str, search_results: List[Dict[str, Any]]) -> Optional[str]:
        """
        Get cached assembled context.
        
        Args:
            question: User's question
            search_results: Search results used to build context
            
        Returns:
            Cached context string or None if not found
        """
        if not self.enabled or not self.redis_client:
            return None
        
        try:
            # Create hash from question + search result IDs
            context_data = {
                'question': question.lower().strip(),
                'result_ids': [r.get('id', '') for r in search_results]
            }
            cache_key = self._generate_cache_key('context', context_data)
            
            result = self.redis_client.get(cache_key)
            if result:
                logger.debug(f"Cache hit for context: {question[:30]}...")
                return result
            
            return None
            
        except Exception as e:
            logger.error(f"Error getting cached context: {e}")
            return None
    
    def cache_context(
        self, 
        question: str, 
        search_results: List[Dict[str, Any]], 
        context: str, 
        ttl: int = None
    ) -> bool:
        """
        Cache assembled context.
        
        Args:
            question: User's question
            search_results: Search results used to build context
            context: Assembled context string
            ttl: Time to live in seconds (defaults to 1 hour)
            
        Returns:
            True if cached successfully, False otherwise
        """
        if not self.enabled or not self.redis_client:
            return False
        
        try:
            context_data = {
                'question': question.lower().strip(),
                'result_ids': [r.get('id', '') for r in search_results]
            }
            cache_key = self._generate_cache_key('context', context_data)
            
            # Cache context for 1 hour by default
            ttl = ttl or 3600
            
            success = self.redis_client.setex(cache_key, ttl, context)
            
            if success:
                logger.debug(f"Cached context for: {question[:30]}...")
            
            return bool(success)
            
        except Exception as e:
            logger.error(f"Error caching context: {e}")
            return False
    
    def clear_cache(self, pattern: str = "rag:*") -> int:
        """
        Clear cache entries matching pattern.
        
        Args:
            pattern: Redis key pattern to match
            
        Returns:
            Number of keys deleted
        """
        if not self.enabled or not self.redis_client:
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                deleted = self.redis_client.delete(*keys)
                logger.info(f"Cleared {deleted} cache entries matching '{pattern}'")
                return deleted
            return 0
            
        except Exception as e:
            logger.error(f"Error clearing cache: {e}")
            return 0
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.
        
        Returns:
            Dict with cache statistics
        """
        if not self.enabled or not self.redis_client:
            return {'enabled': False}
        
        try:
            info = self.redis_client.info()
            
            # Count our keys
            query_keys = len(self.redis_client.keys("rag:query:*"))
            embedding_keys = len(self.redis_client.keys("rag:embedding:*"))
            context_keys = len(self.redis_client.keys("rag:context:*"))
            
            return {
                'enabled': True,
                'connected': True,
                'total_keys': query_keys + embedding_keys + context_keys,
                'query_cache_keys': query_keys,
                'embedding_cache_keys': embedding_keys,
                'context_cache_keys': context_keys,
                'memory_usage': info.get('used_memory_human', 'Unknown'),
                'hits': info.get('keyspace_hits', 0),
                'misses': info.get('keyspace_misses', 0)
            }
            
        except Exception as e:
            logger.error(f"Error getting cache stats: {e}")
            return {'enabled': True, 'connected': False, 'error': str(e)}


# Global cache service instance
cache_service = CacheService()