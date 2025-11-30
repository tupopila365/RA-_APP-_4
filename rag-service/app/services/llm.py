"""LLM service for answer generation using Ollama."""

import logging
from typing import List, Dict, Any, Optional
import ollama
from app.config import settings

logger = logging.getLogger(__name__)


class LLMError(Exception):
    """Custom exception for LLM generation errors."""
    pass


class LLMService:
    """Service for generating answers using Ollama LLM."""
    
    def __init__(self, base_url: str = None, model: str = None):
        """
        Initialize the LLM service.
        
        Args:
            base_url: Ollama API base URL (defaults to settings)
            model: LLM model name (defaults to settings)
        """
        self.base_url = base_url or settings.ollama_base_url
        self.model = model or settings.ollama_llm_model
        self.client = ollama.Client(host=self.base_url)
        
        logger.info(f"Initialized LLMService with model={self.model}, base_url={self.base_url}")
    
    def _build_prompt(
        self,
        question: str,
        context_chunks: List[Dict[str, Any]]
    ) -> str:
        """
        Build a prompt with system instructions, context, and question.
        
        Args:
            question: User's question
            context_chunks: List of relevant document chunks with metadata
            
        Returns:
            Formatted prompt string
        """
        # System instructions
        system_instruction = (
            "You are a helpful assistant for Roads Authority Namibia. "
            "Answer the question based on the provided context from official documents. "
            "If the answer is not in the context, say so clearly. "
            "Be concise and accurate in your responses."
        )
        
        # Build context from chunks
        context_parts = []
        for i, chunk in enumerate(context_chunks, 1):
            document_title = chunk.get('metadata', {}).get('document_title', 'Unknown Document')
            chunk_text = chunk.get('document', '')
            
            context_parts.append(f"[Source {i}: {document_title}]\n{chunk_text}")
        
        context = "\n\n".join(context_parts)
        
        # Construct full prompt
        prompt = f"""{system_instruction}

Context:
{context}

Question: {question}

Answer:"""
        
        return prompt
    
    def generate_answer(
        self,
        question: str,
        context_chunks: List[Dict[str, Any]],
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """
        Generate an answer to a question using provided context.
        
        Args:
            question: User's question
            context_chunks: List of relevant document chunks
            temperature: Sampling temperature (0.0 to 1.0)
            max_tokens: Maximum tokens in response
            
        Returns:
            Generated answer text
            
        Raises:
            LLMError: If answer generation fails
        """
        if not question or not question.strip():
            raise LLMError("Question cannot be empty")
        
        if not context_chunks:
            logger.warning("No context chunks provided, generating answer without context")
        
        try:
            logger.info(f"Generating answer for question: {question[:100]}...")
            
            # Build the prompt
            prompt = self._build_prompt(question, context_chunks)
            
            logger.debug(f"Prompt length: {len(prompt)} characters")
            
            # Generate response using Ollama
            response = self.client.generate(
                model=self.model,
                prompt=prompt,
                options={
                    'temperature': temperature,
                    'num_predict': max_tokens
                }
            )
            
            answer = response.get('response', '').strip()
            
            if not answer:
                raise LLMError("No answer generated from LLM")
            
            logger.info(f"Successfully generated answer of length {len(answer)}")
            logger.debug(f"Answer: {answer[:200]}...")
            
            return answer
            
        except Exception as e:
            logger.error(f"Failed to generate answer: {str(e)}")
            raise LLMError(f"Answer generation failed: {str(e)}")
    
    def generate_answer_streaming(
        self,
        question: str,
        context_chunks: List[Dict[str, Any]],
        temperature: float = 0.7
    ):
        """
        Generate an answer with streaming response.
        
        Args:
            question: User's question
            context_chunks: List of relevant document chunks
            temperature: Sampling temperature (0.0 to 1.0)
            
        Yields:
            Chunks of generated text
            
        Raises:
            LLMError: If answer generation fails
        """
        if not question or not question.strip():
            raise LLMError("Question cannot be empty")
        
        try:
            logger.info(f"Generating streaming answer for question: {question[:100]}...")
            
            # Build the prompt
            prompt = self._build_prompt(question, context_chunks)
            
            # Generate streaming response
            stream = self.client.generate(
                model=self.model,
                prompt=prompt,
                stream=True,
                options={
                    'temperature': temperature
                }
            )
            
            for chunk in stream:
                response_text = chunk.get('response', '')
                if response_text:
                    yield response_text
            
            logger.info("Completed streaming answer generation")
            
        except Exception as e:
            logger.error(f"Failed to generate streaming answer: {str(e)}")
            raise LLMError(f"Streaming answer generation failed: {str(e)}")
    
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
        Check if the configured LLM model is available.
        
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
