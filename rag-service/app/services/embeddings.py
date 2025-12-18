"""Embedding generation service using Ollama."""

import logging
from typing import List, Dict, Any
import ollama
from app.config import settings

logger = logging.getLogger(__name__)


class EmbeddingError(Exception):
    """Custom exception for embedding generation errors."""
    pass


class EmbeddingService:
    """Service for generating embeddings using Ollama."""
    
    def __init__(self, base_url: str = None, model: str = None):
        """
        Initialize the embedding service.
        
        Args:
            base_url: Ollama API base URL (defaults to settings)
            model: Embedding model name (defaults to settings)
        """
        self.base_url = base_url or settings.ollama_base_url
        self.model = model or settings.ollama_embedding_model
        self.client = ollama.Client(host=self.base_url)
        
        logger.info(f"Initialized EmbeddingService with model={self.model}, base_url={self.base_url}")
    
    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding vector for a single text.
        
        Args:
            text: Input text to embed
            
        Returns:
            Embedding vector as list of floats
            
        Raises:
            EmbeddingError: If embedding generation fails
        """
        if not text or not text.strip():
            raise EmbeddingError("Cannot generate embedding for empty text")
        
        try:
            logger.debug(f"Generating embedding for text of length {len(text)}")
            
            response = self.client.embeddings(
                model=self.model,
                prompt=text
            )
            
            embedding = response.get('embedding')
            
            if not embedding:
                raise EmbeddingError("No embedding returned from Ollama")
            
            logger.debug(f"Generated embedding of dimension {len(embedding)}")
            
            return embedding
            
        except Exception as e:
            logger.error(f"Failed to generate embedding: {str(e)}")
            raise EmbeddingError(f"Embedding generation failed: {str(e)}")
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for multiple texts.
        
        Args:
            texts: List of input texts to embed
            
        Returns:
            List of embedding vectors
            
        Raises:
            EmbeddingError: If embedding generation fails
        """
        if not texts:
            return []
        
        logger.info(f"Generating embeddings for {len(texts)} texts")
        
        embeddings = []
        failed_count = 0
        
        for i, text in enumerate(texts):
            try:
                embedding = self.generate_embedding(text)
                embeddings.append(embedding)
                
                if (i + 1) % 10 == 0:
                    logger.info(f"Generated {i + 1}/{len(texts)} embeddings")
                    
            except EmbeddingError as e:
                logger.warning(f"Failed to generate embedding for text {i}: {str(e)}")
                failed_count += 1
                # Add None as placeholder for failed embeddings
                embeddings.append(None)
        
        if failed_count > 0:
            logger.warning(f"Failed to generate {failed_count}/{len(texts)} embeddings")
        
        logger.info(f"Successfully generated {len(texts) - failed_count}/{len(texts)} embeddings")
        
        return embeddings
    
    def embed_chunks(self, chunks: List[Dict[str, Any]], progress_callback=None) -> List[Dict[str, Any]]:
        """
        Generate embeddings for a list of text chunks.
        
        Args:
            chunks: List of chunk dictionaries with 'text' key
            progress_callback: Optional callback function(current, total) for progress updates
            
        Returns:
            List of chunks with 'embedding' key added
            
        Raises:
            EmbeddingError: If embedding generation fails or all chunks fail
        """
        if not chunks:
            return []
        
        logger.info(f"Embedding {len(chunks)} chunks")
        
        # Pre-flight checks: Verify Ollama connection and model availability
        logger.info("Checking Ollama connection and model availability...")
        if not self.check_connection():
            error_msg = (
                f"Cannot connect to Ollama at {self.base_url}. "
                f"Please ensure Ollama is running (ollama serve) and accessible."
            )
            logger.error(error_msg)
            raise EmbeddingError(error_msg)
        
        if not self.check_model_available():
            error_msg = (
                f"Embedding model '{self.model}' is not available. "
                f"Please install it using: ollama pull {self.model}"
            )
            logger.error(error_msg)
            raise EmbeddingError(error_msg)
        
        logger.info("✓ Ollama connection and model availability verified")
        
        # Extract texts from chunks
        texts = [chunk.get('text', '') for chunk in chunks]
        
        # Validate that we have non-empty texts
        empty_texts = sum(1 for text in texts if not text or not text.strip())
        if empty_texts == len(texts):
            error_msg = "All chunks have empty text. Cannot generate embeddings."
            logger.error(error_msg)
            raise EmbeddingError(error_msg)
        elif empty_texts > 0:
            logger.warning(f"Warning: {empty_texts} chunks have empty text and will be skipped")
        
        # Generate embeddings with progress tracking
        embeddings = []
        failed_count = 0
        error_messages = []
        
        for i, text in enumerate(texts):
            # Skip empty texts
            if not text or not text.strip():
                logger.warning(f"Skipping chunk {i} - empty text")
                embeddings.append(None)
                failed_count += 1
                continue
                
            try:
                embedding = self.generate_embedding(text)
                embeddings.append(embedding)
                
                # Report progress
                if progress_callback:
                    progress_callback(i + 1, len(texts))
                
                # Show progress every chunk for better visibility
                percentage = ((i + 1) / len(texts)) * 100
                logger.info(f"📊 Embedding progress: {i + 1}/{len(texts)} ({percentage:.1f}%) - Chunk {i + 1} embedded")
                    
            except EmbeddingError as e:
                error_msg = f"Chunk {i}: {str(e)}"
                logger.warning(f"Failed to generate embedding for chunk {i}: {str(e)}")
                error_messages.append(error_msg)
                failed_count += 1
                embeddings.append(None)
            except Exception as e:
                error_msg = f"Chunk {i}: Unexpected error - {str(e)}"
                logger.error(error_msg)
                error_messages.append(error_msg)
                failed_count += 1
                embeddings.append(None)
        
        # Add embeddings to chunks
        embedded_chunks = []
        for chunk, embedding in zip(chunks, embeddings):
            if embedding is not None:
                chunk_with_embedding = chunk.copy()
                chunk_with_embedding['embedding'] = embedding
                embedded_chunks.append(chunk_with_embedding)
            else:
                logger.warning(f"Skipping chunk {chunk.get('chunk_index')} due to embedding failure")
        
        logger.info(f"Successfully embedded {len(embedded_chunks)}/{len(chunks)} chunks")
        
        # If all chunks failed, raise an exception with detailed error information
        if len(embedded_chunks) == 0:
            error_details = "\n".join(error_messages[:5])  # Show first 5 errors
            if len(error_messages) > 5:
                error_details += f"\n... and {len(error_messages) - 5} more errors"
            
            error_msg = (
                f"Failed to generate embeddings for all {len(chunks)} chunks. "
                f"Ollama connection: {self.base_url}, Model: {self.model}. "
                f"Errors: {error_details}"
            )
            logger.error(error_msg)
            raise EmbeddingError(error_msg)
        
        # If too many chunks failed, log a warning but continue
        failure_rate = failed_count / len(chunks)
        if failure_rate > 0.5:  # More than 50% failed
            logger.warning(
                f"High failure rate: {failed_count}/{len(chunks)} chunks failed to generate embeddings. "
                f"Only {len(embedded_chunks)} chunks will be indexed."
            )
        
        return embedded_chunks
    
    def check_connection(self) -> bool:
        """
        Check if Ollama service is accessible.
        
        Returns:
            True if connection is successful, False otherwise
        """
        try:
            # Try to list models as a connection check
            self.client.list()
            logger.info("Successfully connected to Ollama")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Ollama: {str(e)}")
            return False
    
    def check_model_available(self) -> bool:
        """
        Check if the configured embedding model is available.
        
        Returns:
            True if model is available, False otherwise
        """
        try:
            models = self.client.list()
            model_names = [model.get('name', '') for model in models.get('models', [])]
            
            # Check if our model is in the list
            is_available = any(self.model in name for name in model_names)
            
            if is_available:
                logger.info(f"Model {self.model} is available")
            else:
                logger.warning(f"Model {self.model} not found. Available models: {model_names}")
                logger.info(f"To install the model, run: ollama pull {self.model}")
            
            return is_available
            
        except Exception as e:
            logger.error(f"Failed to check model availability: {str(e)}")
            return False
