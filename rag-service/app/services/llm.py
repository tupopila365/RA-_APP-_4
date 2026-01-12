"""LLM service for answer generation using Ollama."""

import logging
import re
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
        Build an optimized prompt with better context organization.
        
        Args:
            question: User's question
            context_chunks: List of relevant document chunks with metadata
            
        Returns:
            Formatted prompt string
        """
        # System instructions
        system_instruction = (
            "You are an official AI customer support assistant for the Roads Authority of Namibia.\n\n"
            
            "YOUR MISSION:\n"
            "Provide accurate, helpful, and professional responses to help Namibians with Roads Authority services.\n\n"
            
            "STRICT RULES:\n"
            "1. USE ONLY information from the provided official documents\n"
            "2. If information is NOT in the documents, say EXACTLY:\n"
            "   'This information is not available in our official documents. Please contact us at:\n"
            "   📞 Phone: 061-284-7000\n"
            "   ✉️ Email: info@ra.org.na\n"
            "   🏢 Visit your nearest Roads Authority office'\n"
            "3. NEVER guess, assume, or use external knowledge\n"
            "4. NEVER provide outdated fees or dates - always reference current information\n\n"
            
            "ANSWER STRUCTURE (Follow this format):\n"
            "1. Start with a DIRECT answer to the question (1-2 sentences)\n"
            "2. Provide KEY DETAILS with bullet points (•) for clarity\n"
            "3. Include STEP-BY-STEP instructions when applicable\n"
            "4. End with HELPFUL CONTEXT (requirements, contacts, or next steps)\n\n"
            
            "COMMUNICATION EXCELLENCE:\n"
            "• Use clear, simple language (8th-grade reading level)\n"
            "• Break complex information into digestible parts\n"
            "• Use emojis sparingly for emphasis (✓, •, 📍, 📞, ✉️)\n"
            "• Format lists for easy scanning\n"
            "• Highlight important numbers, dates, and fees\n"
            "• Be conversational yet professional\n"
            "• Show empathy - people often contact support when frustrated\n\n"
            
            "SPECIFIC INSTRUCTIONS:\n"
            "• For PROCEDURES: Number each step (1, 2, 3...)\n"
            "• For REQUIREMENTS: Use bullet points with clear labels\n"
            "• For FEES: Always include currency (NAD) and specify if fees may change\n"
            "• For LOCATIONS: Include full address, contact info, and operating hours\n"
            "• For TIMELINES: Be specific (e.g., '5-7 business days' not 'soon')\n\n"
            
            "ERROR HANDLING:\n"
            "• If question is unclear: Ask ONE specific clarifying question\n"
            "• If partially answered: Provide what you know, then offer to clarify\n"
            "• If multiple interpretations: Address the most common interpretation first\n\n"
            
            "PROHIBITED BEHAVIORS:\n"
            "❌ Don't use phrases like 'According to the document...'\n"
            "❌ Don't mention source limitations unless no info is found\n"
            "❌ Don't be overly formal or bureaucratic\n"
            "❌ Don't provide legal or financial advice beyond stated facts\n"
            "❌ Don't request sensitive personal information\n\n"
            
            "FOLLOW-UP GUIDANCE:\n"
            "When appropriate, end your answer with 1-2 related suggestions like:\n"
            "'You might also want to know about: [related topic]'\n"
            "'Related services: [relevant service]'\n\n"
            
            "GOAL:\n"
            "Every answer should leave the user feeling helped, informed, and confident about their next steps."
        )
        
        # Group chunks by document to avoid repetition
        chunks_by_doc = {}
        for chunk in context_chunks:
            doc_title = chunk.get('metadata', {}).get('document_title', 'Unknown Document')
            if doc_title not in chunks_by_doc:
                chunks_by_doc[doc_title] = []
            chunks_by_doc[doc_title].append(chunk.get('document', ''))
        
        # Build organized context
        context_parts = []
        for doc_title, chunks in chunks_by_doc.items():
            combined_text = "\n".join(chunks)
            context_parts.append(f"[Document: {doc_title}]\n{combined_text}")
        
        context = "\n\n---\n\n".join(context_parts)
        
        # Construct full prompt
        prompt = f"""{system_instruction}

OFFICIAL DOCUMENTS PROVIDED:
{context}

USER QUESTION: {question}

HELPFUL ANSWER (Remember to be direct, clear, and structured):"""
        
        return prompt
    
    def _format_answer(self, raw_answer: str) -> str:
        """
        Post-process the generated answer for better readability.
        
        Args:
            raw_answer: Raw answer from LLM
            
        Returns:
            Formatted answer
        """
        answer = raw_answer.strip()
        
        # Ensure proper spacing around bullet points
        answer = answer.replace('\n•', '\n\n•')
        answer = answer.replace('\n-', '\n\n-')
        
        # Ensure proper spacing around numbered lists
        answer = re.sub(r'\n(\d+\.)', r'\n\n\1', answer)
        
        # Remove multiple blank lines
        answer = re.sub(r'\n{3,}', '\n\n', answer)
        
        # Ensure contact info is properly formatted
        if 'contact' in answer.lower() or 'phone' in answer.lower():
            # Add extra emphasis to contact information
            answer = answer.replace('Phone:', '📞 Phone:')
            answer = answer.replace('Email:', '✉️ Email:')
            answer = answer.replace('Office:', '🏢 Office:')
        
        return answer.strip()
    
    def _validate_answer_quality(self, answer: str, question: str) -> tuple:
        """
        Validate answer quality before returning.
        
        Args:
            answer: Generated answer text
            question: Original user question
            
        Returns:
            (is_valid, error_message)
        """
        # Check minimum length
        if len(answer.strip()) < 20:
            return False, "Answer too short"
        
        # Check if answer is just repeating the question
        question_words = set(question.lower().split())
        answer_words = set(answer.lower().split())
        if len(answer_words - question_words) < 5:
            return False, "Answer not informative enough"
        
        # Check for generic non-answers
        generic_phrases = [
            "i don't know",
            "i cannot help",
            "i'm not sure",
            "i apologize but"
        ]
        answer_lower = answer.lower()
        if any(phrase in answer_lower for phrase in generic_phrases):
            # These are acceptable if followed by proper fallback
            if "contact" not in answer_lower and "phone" not in answer_lower:
                return False, "Generic answer without proper fallback"
        
        return True, ""
    
    def generate_answer(
        self,
        question: str,
        context_chunks: List[Dict[str, Any]],
        temperature: float = 0.3,
        max_tokens: int = 800
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
            
            # Validate quality
            is_valid, error_msg = self._validate_answer_quality(answer, question)
            if not is_valid:
                logger.warning(f"Answer quality check failed: {error_msg}")
                # Continue anyway but log the warning
            
            # Format the answer for better readability
            formatted_answer = self._format_answer(answer)
            
            logger.info(f"Successfully generated and formatted answer of length {len(formatted_answer)}")
            logger.debug(f"Answer: {formatted_answer[:200]}...")
            
            return formatted_answer
            
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
    
    async def generate_answer_streaming_async(
        self,
        question: str,
        context_chunks: List[Dict[str, Any]],
        temperature: float = 0.7
    ):
        """
        Generate an answer with async streaming response for character-level streaming.
        
        Args:
            question: User's question
            context_chunks: List of relevant document chunks
            temperature: Sampling temperature (0.0 to 1.0)
            
        Yields:
            Individual characters or small chunks of generated text
            
        Raises:
            LLMError: If answer generation fails
        """
        if not question or not question.strip():
            raise LLMError("Question cannot be empty")
        
        try:
            logger.info(f"Generating async streaming answer for question: {question[:100]}...")
            
            # Build the prompt
            prompt = self._build_prompt(question, context_chunks)
            
            # Generate streaming response in a thread to avoid blocking
            import asyncio
            
            def generate_sync():
                return self.client.generate(
                    model=self.model,
                    prompt=prompt,
                    stream=True,
                    options={
                        'temperature': temperature
                    }
                )
            
            # Run the synchronous generator in a thread
            stream = await asyncio.to_thread(generate_sync)
            
            # Buffer for character-level streaming
            buffer = ""
            
            for chunk in stream:
                response_text = chunk.get('response', '')
                if response_text:
                    buffer += response_text
                    
                    # Stream character by character for smoother UX
                    while buffer:
                        # Send 1-3 characters at a time for natural typing effect
                        chunk_size = min(3, len(buffer))
                        char_chunk = buffer[:chunk_size]
                        buffer = buffer[chunk_size:]
                        
                        yield char_chunk
                        
                        # Small delay for natural typing effect
                        await asyncio.sleep(0.02)
            
            # Send any remaining buffer
            if buffer:
                yield buffer
            
            logger.info("Completed async streaming answer generation")
            
        except Exception as e:
            logger.error(f"Failed to generate async streaming answer: {str(e)}")
            raise LLMError(f"Async streaming answer generation failed: {str(e)}")
    
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


