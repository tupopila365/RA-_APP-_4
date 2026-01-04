"""LLM service for answer generation using Ollama."""

import logging
from typing import List, Dict, Any, Optional
import ollama
import requests
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
    "You are an official AI customer support assistant for the Roads Authority of Namibia.\n\n"
    "Your role is to provide accurate, clear, and professional responses to users based ONLY on the provided official Roads Authority documents and approved content.\n\n"
    "STRICT RULES:\n"
    "- Use ONLY the information available in the provided official documents.\n"
    "- Do NOT guess, assume, or add external knowledge.\n"
    "- If the requested information is not found in the provided documents, respond exactly with:\n"
    "  “This information is not available in the provided official documents.”\n"
    "- Do NOT provide personal opinions or unofficial advice.\n"
    "- Do NOT generate legal, financial, or policy interpretations beyond what is explicitly stated.\n"
    "- Do NOT ask for sensitive personal information unless it is explicitly required by the official process described.\n\n"
    "COMMUNICATION STYLE:\n"
    "- Use clear, simple, and professional language.\n"
    "- Keep responses short, direct, and easy to understand.\n"
    "- Maintain a calm, respectful, government-level tone.\n"
    "- Explain steps clearly when procedures are involved.\n"
    "- Avoid unnecessary details or long explanations.\n\n"
    "BEHAVIOR GUIDELINES:\n"
    "- Be polite and patient at all times.\n"
    "- Treat all users respectfully.\n"
    "- Provide step-by-step guidance when applicable.\n"
    "- Remain neutral and factual.\n"
    "- Be consistent in answers for similar questions.\n\n"
    "ERROR HANDLING:\n"
    "- If a question is unclear, politely ask for clarification.\n"
    "- If information is missing, use the exact fallback sentence provided.\n"
    "- Never fabricate details.\n\n"
    "GOAL:\n"
    "To assist the public by providing trustworthy, official, and easy-to-understand information "
    "about Roads Authority of Namibia services, processes, and public information."
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
        
        # Validate model availability before attempting generation
        if not self.check_model_available():
            error_msg = (
                f"Model '{self.model}' is not available or may be corrupted. "
                f"Please verify the model is installed correctly by running: "
                f"ollama pull {self.model}"
            )
            logger.error(error_msg)
            raise LLMError(error_msg)
        
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
            error_str = str(e)
            logger.error(f"Failed to generate answer: {error_str}")
            
            # Provide specific guidance for common errors
            if "llama runner process has terminated" in error_str or "exit status" in error_str:
                error_msg = (
                    f"Ollama model process crashed. This usually means:\n"
                    f"1. Model '{self.model}' is corrupted or incomplete\n"
                    f"2. Insufficient memory/disk space\n"
                    f"3. Model file is missing\n\n"
                    f"Try these solutions:\n"
                    f"- Reinstall the model: ollama pull {self.model}\n"
                    f"- Check Ollama logs for details\n"
                    f"- Verify you have enough disk space and RAM\n"
                    f"- Try a different model if the issue persists"
                )
            elif "connection" in error_str.lower() or "refused" in error_str.lower() or "connect" in error_str.lower():
                error_msg = (
                    f"Cannot connect to Ollama at {self.base_url}. "
                    f"Please ensure Ollama is running."
                )
            elif "500" in error_str or "Internal Server Error" in error_str:
                error_msg = (
                    f"Ollama server error. The model '{self.model}' may be corrupted or unavailable. "
                    f"Try: ollama pull {self.model}"
                )
            else:
                error_msg = f"Answer generation failed: {error_str}"
            
            raise LLMError(error_msg)
    
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
        Check if the configured LLM model is available and valid.
        
        Returns:
            True if model is available, False otherwise
        """
        try:
            # Use direct HTTP call to /api/tags for reliable parsing
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code != 200:
                logger.error(f"Failed to list models: HTTP {response.status_code}")
                return False
            
            data = response.json()
            # Correctly parse the response: Ollama returns {"models": [...]}
            models_list = data.get('models', [])
            model_names = [model.get('name', '') for model in models_list if isinstance(model, dict)]
            
            # Filter out empty names (corrupted model entries)
            valid_model_names = [name for name in model_names if name and name.strip()]
            
            # Check if our model is in the list
            is_available = any(
                self.model == name or 
                name.startswith(self.model.split(':')[0]) or
                self.model in name
                for name in valid_model_names
            )
            
            if is_available:
                logger.debug(f"Model {self.model} is available")
            else:
                logger.warning(f"Model {self.model} not found. Available models: {valid_model_names}")
                if not valid_model_names:
                    logger.error("No valid models found in Ollama. Model registry may be corrupted.")
                    logger.error(f"Try: ollama pull {self.model}")
                else:
                    logger.info(f"To install the model, run: ollama pull {self.model}")
            
            return is_available
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to connect to Ollama for model check: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"Failed to check model availability: {str(e)}")
            return False


