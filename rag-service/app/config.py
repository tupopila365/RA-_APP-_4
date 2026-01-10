"""Configuration management for the RAG service."""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8001
    
    # Ollama Configuration
    ollama_base_url: str = "http://localhost:11434"
    ollama_embedding_model: str = "nomic-embed-text:latest"
    ollama_llm_model: str = "mistral:7b"
    ollama_models_path: Optional[str] = None  # Custom path for Ollama models
    ollama_auto_pull: bool = True  # Automatically pull missing models
    
    # ChromaDB Configuration
    chromadb_host: str = "localhost"
    chromadb_port: int = 8000
    chromadb_collection_name: str = "document_chunks"
    
    # Processing Configuration
    chunk_size: int = 500
    chunk_overlap: int = 50
    top_k_results: int = 5
    
    # RAG Retrieval Settings (NEW)
    min_similarity_threshold: float = 0.4  # Filter out low-quality matches
    max_context_length: int = 3000  # Prevent overwhelming the LLM
    
    # LLM Generation Settings (NEW)
    temperature: float = 0.3  # Lower for more consistent, factual answers
    max_tokens: int = 800  # Allow for more detailed answers
    

    # Logging
    log_level: str = "INFO"
    
    class Config:
        """Pydantic configuration."""
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
