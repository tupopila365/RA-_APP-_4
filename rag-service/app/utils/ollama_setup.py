"""Ollama model detection and automatic setup utility."""

import os
import logging
import subprocess
import requests
from typing import List, Tuple
from pathlib import Path

logger = logging.getLogger(__name__)


class OllamaModelManager:
    """Manages Ollama model detection and automatic pulling."""
    
    def __init__(self, base_url: str = "http://localhost:11434", custom_model_path: str = None):
        """
        Initialize the Ollama Model Manager.
        
        Args:
            base_url: Ollama API base URL
            custom_model_path: Optional custom path for Ollama models
        """
        self.base_url = base_url.rstrip('/')
        self.custom_model_path = custom_model_path
        
        # Set custom model path if provided
        if custom_model_path:
            os.environ['OLLAMA_MODELS'] = custom_model_path
            logger.info(f"Set OLLAMA_MODELS environment variable to: {custom_model_path}")
    
    def check_ollama_running(self) -> bool:
        """
        Check if Ollama service is running.
        
        Returns:
            True if Ollama is accessible, False otherwise
        """
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to connect to Ollama at {self.base_url}: {str(e)}")
            return False
    
    def list_available_models(self) -> List[str]:
        """
        List all models currently available in Ollama.
        
        Returns:
            List of model names
        """
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=10)
            if response.status_code == 200:
                data = response.json()
                models = [model['name'] for model in data.get('models', [])]
                logger.info(f"Found {len(models)} models in Ollama: {models}")
                return models
            else:
                logger.error(f"Failed to list models: HTTP {response.status_code}")
                return []
        except Exception as e:
            logger.error(f"Error listing models: {str(e)}")
            return []
    
    def is_model_available(self, model_name: str) -> bool:
        """
        Check if a specific model is available.
        
        Args:
            model_name: Name of the model to check
            
        Returns:
            True if model exists, False otherwise
        """
        available_models = self.list_available_models()
        
        # Check exact match or base name match (e.g., 'llama3.2:1b' matches 'llama3.2:1b')
        for available_model in available_models:
            if available_model == model_name or available_model.startswith(model_name.split(':')[0]):
                logger.info(f"Model '{model_name}' is available (matched: {available_model})")
                return True
        
        logger.warning(f"Model '{model_name}' not found in available models")
        return False
    
    def pull_model(self, model_name: str) -> bool:
        """
        Pull a model using the Ollama CLI.
        
        Args:
            model_name: Name of the model to pull
            
        Returns:
            True if pull was successful, False otherwise
        """
        logger.info(f"Pulling model '{model_name}'... This may take several minutes.")
        
        try:
            # Use subprocess to call ollama pull
            result = subprocess.run(
                ['ollama', 'pull', model_name],
                capture_output=True,
                text=True,
                timeout=600  # 10 minute timeout for large models
            )
            
            if result.returncode == 0:
                logger.info(f"✓ Successfully pulled model '{model_name}'")
                return True
            else:
                logger.error(f"✗ Failed to pull model '{model_name}': {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error(f"✗ Timeout while pulling model '{model_name}'")
            return False
        except FileNotFoundError:
            logger.error("✗ 'ollama' command not found. Please ensure Ollama is installed and in PATH")
            return False
        except Exception as e:
            logger.error(f"✗ Error pulling model '{model_name}': {str(e)}")
            return False
    
    def ensure_model_available(self, model_name: str, auto_pull: bool = True) -> bool:
        """
        Ensure a model is available, pulling it if necessary.
        
        Args:
            model_name: Name of the model to ensure
            auto_pull: Whether to automatically pull the model if not found
            
        Returns:
            True if model is available (or was successfully pulled), False otherwise
        """
        # Check if model already exists
        if self.is_model_available(model_name):
            return True
        
        # If auto_pull is disabled, just return False
        if not auto_pull:
            logger.warning(f"Model '{model_name}' not found and auto_pull is disabled")
            return False
        
        # Try to pull the model
        logger.info(f"Model '{model_name}' not found. Attempting to pull...")
        return self.pull_model(model_name)
    
    def setup_models(self, required_models: List[str], auto_pull: bool = True) -> Tuple[bool, List[str]]:
        """
        Setup multiple models, ensuring they are all available.
        
        Args:
            required_models: List of model names to ensure
            auto_pull: Whether to automatically pull missing models
            
        Returns:
            Tuple of (all_available: bool, missing_models: List[str])
        """
        logger.info("=" * 60)
        logger.info("Ollama Model Setup")
        logger.info("=" * 60)
        
        # Check if Ollama is running
        if not self.check_ollama_running():
            logger.error("✗ Ollama service is not running!")
            logger.error(f"  Please start Ollama or check the URL: {self.base_url}")
            return False, required_models
        
        logger.info(f"✓ Ollama service is running at {self.base_url}")
        
        # Check and pull each model
        missing_models = []
        for model_name in required_models:
            logger.info(f"\nChecking model: {model_name}")
            
            if not self.ensure_model_available(model_name, auto_pull):
                missing_models.append(model_name)
                logger.error(f"✗ Model '{model_name}' is not available")
            else:
                logger.info(f"✓ Model '{model_name}' is ready")
        
        # Summary
        logger.info("\n" + "=" * 60)
        if not missing_models:
            logger.info("✓ All required models are available!")
        else:
            logger.warning(f"⚠ {len(missing_models)} model(s) missing: {missing_models}")
            logger.warning("  You can manually pull them with:")
            for model in missing_models:
                logger.warning(f"    ollama pull {model}")
        logger.info("=" * 60)
        
        return len(missing_models) == 0, missing_models


def initialize_ollama_models(
    embedding_model: str,
    llm_model: str,
    base_url: str = "http://localhost:11434",
    custom_model_path: str = None,
    auto_pull: bool = True
) -> bool:
    """
    Initialize Ollama models for RAG service.
    
    This function should be called at application startup to ensure
    all required models are available.
    
    Args:
        embedding_model: Name of the embedding model (e.g., 'nomic-embed-text:latest')
        llm_model: Name of the LLM model (e.g., 'llama3.2:1b')
        base_url: Ollama API base URL
        custom_model_path: Optional custom path for Ollama models
        auto_pull: Whether to automatically pull missing models
        
    Returns:
        True if all models are available, False otherwise
        
    Example:
        >>> from app.utils.ollama_setup import initialize_ollama_models
        >>> success = initialize_ollama_models(
        ...     embedding_model='nomic-embed-text:latest',
        ...     llm_model='llama3.2:1b',
        ...     custom_model_path='D:/ollama-models',
        ...     auto_pull=True
        ... )
        >>> if not success:
        ...     print("Warning: Some models are missing!")
    """
    manager = OllamaModelManager(base_url=base_url, custom_model_path=custom_model_path)
    
    required_models = [embedding_model, llm_model]
    all_available, missing = manager.setup_models(required_models, auto_pull=auto_pull)
    
    return all_available
