"""Router for streaming chatbot query endpoint."""

import logging
import json
import re
import asyncio
from fastapi import APIRouter, status, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import QueryRequest, ErrorResponse
from app.services.embeddings import EmbeddingService, EmbeddingError
from app.services.vector_store import VectorStore, VectorStoreError
from app.services.llm import LLMService, LLMError
from app.services.cache import cache_service
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/query", tags=["query"])


def is_greeting(question: str) -> bool:
    """
    Detect if the user input is a greeting.
    
    Args:
        question: User's input text
        
    Returns:
        True if input is detected as a greeting, False otherwise
    """
    if not question or not question.strip():
        return False
    
    # Normalize the question: lowercase and remove extra spaces
    normalized = question.lower().strip()
    
    # Remove punctuation for matching
    normalized_no_punct = re.sub(r'[^\w\s]', '', normalized)
    
    # Common greeting patterns
    greeting_patterns = [
        # Simple greetings
        r'^(hi|hello|hey|greetings|hiya|hallo|hullo)\s*$',
        r'^(hi|hello|hey|greetings|hiya|hallo|hullo)\s+(there|you|everyone|all|guys|folks|people|friend|friends)\s*$',
        
        # Time-based greetings
        r'^(good\s+(morning|afternoon|evening|day|night))\s*$',
        r'^(good\s+(morning|afternoon|evening|day|night)\s*(to\s+you|there|everyone|all|guys|folks|people|sir|madam|ma\'?am)?)\s*$',
        
        # Casual greetings
        r'^(sup|what\'?s\s+up|whatsup|wassup|yo|howdy|g\'?day|gidday)\s*$',
        r'^(sup|what\'?s\s+up|whatsup|wassup|yo|howdy)\s+(there|you|man|dude|buddy|friend)\s*$',
        
        # How are you variations (without other content)
        r'^(how\s+are\s+you\s*(\?|$))',
        r'^(how\s+are\s+you\s+(doing|today|going|feeling)?\s*(\?|$))',
        r'^(how\s+do\s+you\s+do\s*(\?|$))',
        r'^(how\'?s\s+it\s+going\s*(\?|$))',
        r'^(how\'?s\s+everything\s*(\?|$))',
        r'^(how\'?s\s+life\s*(\?|$))',
        
        # Combined greetings
        r'^(hi|hello|hey)\s*[,!]?\s*(how\s+are\s+you|how\'?s\s+it\s+going|how\s+are\s+things)\s*(\?|$)|^(how\s+are\s+you|how\'?s\s+it\s+going)\s*[,!]?\s*(hi|hello|hey)\s*(\?|$)',
    ]
    
    # Check against patterns
    for pattern in greeting_patterns:
        if re.match(pattern, normalized_no_punct, re.IGNORECASE):
            return True
    
    # Check if it's a very short input (1-2 words) that matches common greetings
    words = normalized_no_punct.split()
    if len(words) <= 3:
        common_greetings = [
            'hi', 'hello', 'hey', 'sup', 'yo', 'howdy', 'greetings',
            'good morning', 'good afternoon', 'good evening', 'good day', 'good night',
            'how are you', 'hows it going', 'how are things',
            'gday', 'gidday', 'hiya', 'hallo', 'hullo'
        ]
        question_phrase = ' '.join(words)
        if question_phrase in common_greetings or any(q.startswith(question_phrase) or question_phrase.startswith(q) for q in common_greetings if len(question_phrase) <= 15):
            return True
    
    return False


def get_greeting_response(question: str) -> str:
    """
    Generate an appropriate greeting response with personality.
    
    Args:
        question: The user's greeting input
        
    Returns:
        A friendly greeting response followed by "How can I help you today?"
    """
    normalized = question.lower().strip()
    normalized_no_punct = re.sub(r'[^\w\s]', '', normalized)
    
    # Detect greeting type to provide appropriate response
    if re.search(r'good\s+(morning|afternoon|evening)', normalized_no_punct):
        if 'morning' in normalized_no_punct:
            greeting = "Good morning! ☀️"
        elif 'afternoon' in normalized_no_punct:
            greeting = "Good afternoon! 🌤️"
        else:
            greeting = "Good evening! 🌙"
    elif re.search(r'(hi|hello|hey)', normalized_no_punct):
        greetings = [
            "Hello there! 👋",
            "Hi! Great to see you! 😊", 
            "Hey! Welcome to Roads Authority support! 🚗",
            "Hello! I'm here to help! ✨"
        ]
        import random
        greeting = random.choice(greetings)
    elif re.search(r'(howdy|sup|yo)', normalized_no_punct):
        greeting = "Hey there! 🤠"
    elif re.search(r'how\s+are\s+you', normalized_no_punct):
        responses = [
            "I'm doing great, thank you for asking! 😊",
            "I'm here and ready to help! 💪",
            "Fantastic! Thanks for asking! 🌟"
        ]
        import random
        greeting = random.choice(responses)
    else:
        greeting = "Hello! Welcome to Roads Authority Namibia! 🇳🇦"
    
    # Add helpful context and personality
    helpful_messages = [
        "I'm your AI assistant for all Roads Authority services and information.",
        "I'm here to help with vehicle registration, licenses, permits, and more!",
        "I can assist you with Roads Authority services, office locations, and procedures.",
        "I'm ready to help with your Roads Authority questions and services!"
    ]
    
    import random
    helpful_msg = random.choice(helpful_messages)
    
    return f"{greeting}\n\n{helpful_msg}\n\nHow can I help you today? 🤔"


def enhance_query(question: str) -> str:
    """
    Enhance user query for better retrieval.
    
    Args:
        question: Original user question
        
    Returns:
        Enhanced query string
    """
    # Common abbreviations and their expansions
    expansions = {
        'pln': 'personalized license number plates',
        'nta': 'namibian transport authority',
        'mvf': 'motor vehicle fund',
        'ra': 'roads authority',
    }
    
    enhanced = question.lower()
    for abbr, expansion in expansions.items():
        if abbr in enhanced:
            enhanced = enhanced.replace(abbr, f"{abbr} {expansion}")
    
    return enhanced


@router.post(
    "/stream",
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Processing error"},
        503: {"model": ErrorResponse, "description": "Service unavailable"}
    },
    summary="Query the RAG system with streaming response",
    description="Process a user question using RAG with streaming answer generation"
)
async def query_documents_stream(request: QueryRequest):
    """
    Query the RAG system with streaming response.
    
    This endpoint implements the full query processing pipeline with streaming:
    1. Generate embedding for the user's question
    2. Perform similarity search in ChromaDB to find relevant chunks
    3. Stream the answer generation from Ollama LLM
    4. Return answer chunks as they're generated
    
    Args:
        request: QueryRequest containing question and optional top_k parameter
        
    Returns:
        StreamingResponse with JSON chunks containing answer parts and metadata
    """
    logger.info(f"Processing streaming query: {request.question[:100]}...")
    
    # Check for greetings first - handle them without RAG processing
    if is_greeting(request.question):
        logger.info("Detected greeting, returning greeting response")
        greeting_answer = get_greeting_response(request.question)
        
        async def greeting_stream():
            # Send metadata first (empty sources for greeting)
            metadata = {
                "type": "metadata",
                "sources": [],
                "confidence": 1.0
            }
            yield f"data: {json.dumps(metadata)}\n\n"
            
            # Stream the greeting answer word by word for natural feel
            words = greeting_answer.split()
            for i, word in enumerate(words):
                chunk_data = {
                    "type": "chunk",
                    "content": word + (" " if i < len(words) - 1 else "")
                }
                yield f"data: {json.dumps(chunk_data)}\n\n"
            
            # Send completion signal
            complete_data = {"type": "done"}
            yield f"data: {json.dumps(complete_data)}\n\n"
        
        return StreamingResponse(
            greeting_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no"
            }
        )
    
    async def generate_stream():
        try:
            # Check cache first for non-greeting queries
            cache_key_data = {
                'question': request.question.lower().strip(),
                'top_k': request.top_k
            }
            
            cached_result = cache_service.get_query_result(request.question)
            if cached_result:
                logger.info("Using cached result for query")
                
                # Send cached metadata
                metadata_data = {
                    "type": "metadata",
                    "sources": cached_result.get('sources', []),
                    "confidence": cached_result.get('confidence', 0.0),
                    "cached": True
                }
                yield f"data: {json.dumps(metadata_data)}\n\n"
                
                # Stream cached answer word by word for consistency
                words = cached_result['answer'].split()
                for i, word in enumerate(words):
                    chunk_data = {
                        "type": "chunk",
                        "content": word + (" " if i < len(words) - 1 else "")
                    }
                    yield f"data: {json.dumps(chunk_data)}\n\n"
                    # Small delay to simulate natural typing
                    await asyncio.sleep(0.05)
                
                # Send completion signal
                complete_data = {"type": "done"}
                yield f"data: {json.dumps(complete_data)}\n\n"
                return
            
            # Step 1: Generate embedding for the question
            logger.info("Step 1: Generating embedding for question")
            embedding_service = EmbeddingService()
            
            # Enhance query for better retrieval
            enhanced_question = enhance_query(request.question)
            logger.debug(f"Enhanced question: {enhanced_question}")
            
            try:
                # Add timeout for embedding generation
                question_embedding = await asyncio.wait_for(
                    asyncio.to_thread(embedding_service.generate_embedding, enhanced_question),
                    timeout=settings.request_timeout
                )
            except asyncio.TimeoutError:
                error_data = {
                    "type": "error",
                    "error": "TIMEOUT_ERROR",
                    "message": "Request timed out while generating embedding. Please try again."
                }
                yield f"data: {json.dumps(error_data)}\n\n"
                return
            except EmbeddingError as e:
                error_data = {
                    "type": "error",
                    "error": "EMBEDDING_ERROR",
                    "message": f"Failed to generate question embedding: {str(e)}"
                }
                yield f"data: {json.dumps(error_data)}\n\n"
                return
            
            logger.info(f"Successfully generated question embedding")
            
            # Step 2: Perform similarity search with relevance filtering
            logger.info(f"Step 2: Searching for top {request.top_k} relevant chunks")
            vector_store = VectorStore()
            
            try:
                search_results = await asyncio.wait_for(
                    asyncio.to_thread(
                        vector_store.search,
                        query_embedding=question_embedding,
                        top_k=request.top_k
                    ),
                    timeout=settings.request_timeout
                )
                
                # Filter results by relevance threshold
                filtered_results = [
                    result for result in search_results 
                    if result.get('relevance', 0.0) >= settings.min_similarity_threshold
                ]
                
                if filtered_results:
                    search_results = filtered_results
                    logger.info(f"Filtered to {len(search_results)} high-relevance chunks")
                else:
                    logger.warning(f"No chunks above relevance threshold {settings.min_similarity_threshold}")
                
            except asyncio.TimeoutError:
                error_data = {
                    "type": "error",
                    "error": "TIMEOUT_ERROR",
                    "message": "Request timed out while searching documents. Please try again."
                }
                yield f"data: {json.dumps(error_data)}\n\n"
                return
            except VectorStoreError as e:
                error_data = {
                    "type": "error",
                    "error": "VECTOR_STORE_ERROR",
                    "message": f"Failed to search vector store: {str(e)}"
                }
                yield f"data: {json.dumps(error_data)}\n\n"
                return
            
            if not search_results:
                logger.warning("No relevant documents found for query")
                no_results_answer = (
                    "I couldn't find any relevant information in our official documents to answer your question. 🤔\n\n"
                    "For assistance, please contact us:\n"
                    "📞 Phone: 061-284-7000\n"
                    "✉️ Email: info@ra.org.na\n"
                    "🏢 Visit your nearest Roads Authority office"
                )
                
                # Send metadata for no results
                metadata_data = {
                    "type": "metadata",
                    "sources": [],
                    "confidence": 0.0
                }
                yield f"data: {json.dumps(metadata_data)}\n\n"
                
                # Stream no results answer
                words = no_results_answer.split()
                for i, word in enumerate(words):
                    chunk_data = {
                        "type": "chunk",
                        "content": word + (" " if i < len(words) - 1 else "")
                    }
                    yield f"data: {json.dumps(chunk_data)}\n\n"
                    await asyncio.sleep(0.05)
                
                complete_data = {"type": "done"}
                yield f"data: {json.dumps(complete_data)}\n\n"
                return
            
            logger.info(f"Found {len(search_results)} relevant chunks")
            
            # Send sources first
            sources = []
            seen_documents = set()
            
            for result in search_results:
                metadata = result.get('metadata', {})
                document_id = metadata.get('document_id', 'unknown')
                
                if document_id not in seen_documents:
                    source = {
                        "document_id": document_id,
                        "title": metadata.get('document_title', 'Unknown Document'),
                        "relevance": result.get('relevance', 0.0),
                        "chunk_index": metadata.get('chunk_index')
                    }
                    sources.append(source)
                    seen_documents.add(document_id)
            
            # Calculate confidence based on top results
            if search_results:
                top_relevances = [r.get('relevance', 0.0) for r in search_results[:3]]
                avg_relevance = sum(top_relevances) / len(top_relevances)
                confidence = round(min(avg_relevance * 1.2, 1.0), 2)  # Boost confidence slightly
            else:
                confidence = 0.0
            
            # Send metadata
            metadata_data = {
                "type": "metadata",
                "sources": sources,
                "confidence": confidence
            }
            yield f"data: {json.dumps(metadata_data)}\n\n"
            
            # Step 3: Stream answer generation with timeout
            logger.info("Step 3: Streaming answer generation")
            llm_service = LLMService()
            
            full_answer = ""
            
            try:
                async def stream_with_timeout():
                    nonlocal full_answer
                    async for chunk in llm_service.generate_answer_streaming_async(
                        question=request.question,
                        context_chunks=search_results,
                        temperature=settings.temperature
                    ):
                        full_answer += chunk
                        chunk_data = {
                            "type": "chunk",
                            "content": chunk
                        }
                        yield f"data: {json.dumps(chunk_data)}\n\n"
                
                async for chunk_response in asyncio.wait_for(
                    stream_with_timeout(),
                    timeout=settings.streaming_timeout
                ):
                    yield chunk_response
                
                # Cache the complete result
                if full_answer and sources:
                    cache_service.cache_query_result(
                        question=request.question,
                        answer=full_answer,
                        sources=sources,
                        confidence=confidence
                    )
                
                # Send completion signal
                complete_data = {"type": "done"}
                yield f"data: {json.dumps(complete_data)}\n\n"
                
            except asyncio.TimeoutError:
                error_data = {
                    "type": "error",
                    "error": "TIMEOUT_ERROR",
                    "message": "Response generation timed out. Please try asking a more specific question."
                }
                yield f"data: {json.dumps(error_data)}\n\n"
                return
            except LLMError as e:
                error_data = {
                    "type": "error",
                    "error": "LLM_ERROR",
                    "message": f"I'm having trouble generating an answer right now. Please try again in a moment. 🤖"
                }
                yield f"data: {json.dumps(error_data)}\n\n"
                return
            
        except Exception as e:
            logger.error(f"Unexpected error during streaming query: {str(e)}", exc_info=True)
            error_data = {
                "type": "error",
                "error": "INTERNAL_ERROR",
                "message": "I encountered an unexpected issue. Please try again or contact support if the problem persists. 🛠️"
            }
            yield f"data: {json.dumps(error_data)}\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
