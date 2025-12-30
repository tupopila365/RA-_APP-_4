"""Router for chatbot query endpoint."""

import logging
import json
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
from app.models.schemas import QueryRequest, QueryResponse, SourceDocument, ErrorResponse
from app.services.embeddings import EmbeddingService, EmbeddingError
from app.services.vector_store import VectorStore, VectorStoreError
from app.services.llm import LLMService, LLMError
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/query", tags=["query"])


@router.post(
    "",
    response_model=QueryResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Processing error"},
        503: {"model": ErrorResponse, "description": "Service unavailable"}
    },
    summary="Query the RAG system",
    description="Process a user question using RAG: embed question, retrieve relevant chunks, generate answer"
)
async def query_documents(request: QueryRequest):
    """
    Query the RAG system with a question.
    
    This endpoint implements the full query processing pipeline:
    1. Generate embedding for the user's question
    2. Perform similarity search in ChromaDB to find relevant chunks
    3. Retrieve top K most relevant document chunks
    4. Construct prompt with system instructions, context, and question
    5. Generate answer using Ollama LLM
    6. Return answer with source document references
    
    Args:
        request: QueryRequest containing question and optional top_k parameter
        
    Returns:
        QueryResponse with answer, sources, confidence, and timestamp
        
    Raises:
        HTTPException: If any step of the pipeline fails
    """
    logger.info(f"Processing query: {request.question[:100]}...")
    
    try:
        # Step 1: Generate embedding for the question
        logger.info("Step 1: Generating embedding for question")
        embedding_service = EmbeddingService()
        
        try:
            question_embedding = embedding_service.generate_embedding(request.question)
        except EmbeddingError as e:
            logger.error(f"Failed to generate question embedding: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "status": "error",
                    "error": "EMBEDDING_ERROR",
                    "message": f"Failed to generate question embedding: {str(e)}"
                }
            )
        
        logger.info(f"Successfully generated question embedding of dimension {len(question_embedding)}")
        
        # Step 2: Perform similarity search in vector store
        logger.info(f"Step 2: Searching for top {request.top_k} relevant chunks")
        vector_store = VectorStore()
        
        # Check total documents before search
        total_documents = vector_store.count_documents()
        logger.info(f"Total documents in ChromaDB: {total_documents}")
        
        try:
            search_results = vector_store.search(
                query_embedding=question_embedding,
                top_k=request.top_k
            )
            logger.info(f"Vector search returned {len(search_results)} results")
            if search_results:
                logger.debug(f"Top result relevance: {search_results[0].get('relevance', 0.0):.4f}")
        except VectorStoreError as e:
            logger.error(f"Vector store search failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "status": "error",
                    "error": "VECTOR_STORE_ERROR",
                    "message": f"Failed to search vector store: {str(e)}"
                }
            )
        
        if not search_results:
            logger.warning("No relevant documents found for query")
            
            # Use the total_documents we already checked
            if total_documents == 0:
                # Database is empty - provide helpful message
                answer = (
                    "I apologize, but I cannot find relevant information to answer your question. "
                    "This is because no documents have been indexed in the system yet. "
                    "Please contact the administrator to upload and index documents, or try again later."
                )
            else:
                # Database has documents but no matches found
                answer = (
                    "I couldn't find any relevant information in the available documents to answer your question. "
                    "Please try rephrasing your question or contact Roads Authority Namibia directly for assistance."
                )
            
            return QueryResponse(
                answer=answer,
                sources=[],
                confidence=0.0
            )
        
        logger.info(f"Found {len(search_results)} relevant chunks")
        
        # Step 3: Generate answer using LLM with retrieved context
        logger.info("Step 3: Generating answer using LLM")
        llm_service = LLMService()
        
        try:
            answer = llm_service.generate_answer(
                question=request.question,
                context_chunks=search_results,
                temperature=0.7,
                max_tokens=500
            )
        except LLMError as e:
            logger.error(f"Failed to generate answer: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "status": "error",
                    "error": "LLM_ERROR",
                    "message": f"Failed to generate answer: {str(e)}"
                }
            )
        
        logger.info(f"Successfully generated answer of length {len(answer)}")
        
        # Step 4: Format source documents
        logger.info("Step 4: Formatting source document references")
        sources = []
        seen_documents = set()  # Track unique documents
        
        for result in search_results:
            metadata = result.get('metadata', {})
            document_id = metadata.get('document_id', 'unknown')
            
            # Only include each document once in sources
            if document_id not in seen_documents:
                source = SourceDocument(
                    document_id=document_id,
                    title=metadata.get('document_title', 'Unknown Document'),
                    relevance=result.get('relevance', 0.0),
                    chunk_index=metadata.get('chunk_index')
                )
                sources.append(source)
                seen_documents.add(document_id)
        
        # Calculate confidence based on average relevance of top results
        if search_results:
            avg_relevance = sum(r.get('relevance', 0.0) for r in search_results[:3]) / min(3, len(search_results))
            confidence = round(avg_relevance, 2)
        else:
            confidence = 0.0
        
        logger.info(f"Query completed successfully with {len(sources)} source documents, confidence={confidence}")
        
        # Return response
        return QueryResponse(
            answer=answer,
            sources=sources,
            confidence=confidence
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Catch any unexpected errors
        logger.error(f"Unexpected error during query processing: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "error": "INTERNAL_ERROR",
                "message": f"An unexpected error occurred: {str(e)}"
            }
        )


@router.post(
    "/stream",
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Processing error"},
        503: {"model": ErrorResponse, "description": "Service unavailable"}
    },
    summary="Query the RAG system with streaming",
    description="Process a user question using RAG with streaming answer generation"
)
async def query_documents_stream(request: QueryRequest):
    """
    Query the RAG system with a question and stream the answer.
    
    This endpoint implements the full query processing pipeline with streaming:
    1. Generate embedding for the user's question
    2. Perform similarity search in ChromaDB to find relevant chunks
    3. Stream answer generation from Ollama LLM
    4. Return answer chunks as they're generated
    
    Args:
        request: QueryRequest containing question and optional top_k parameter
        
    Returns:
        Streaming response with JSON chunks containing answer parts and metadata
    """
    logger.info(f"Processing streaming query: {request.question[:100]}...")
    
    async def generate_stream():
        try:
            # Step 1: Generate embedding for the question
            logger.info("Step 1: Generating embedding for question")
            embedding_service = EmbeddingService()
            
            try:
                question_embedding = embedding_service.generate_embedding(request.question)
            except EmbeddingError as e:
                error_data = {
                    "type": "error",
                    "error": "EMBEDDING_ERROR",
                    "message": f"Failed to generate question embedding: {str(e)}"
                }
                yield f"data: {json.dumps(error_data)}\n\n"
                return
            
            logger.info(f"Successfully generated question embedding")
            
            # Step 2: Perform similarity search
            logger.info(f"Step 2: Searching for top {request.top_k} relevant chunks")
            vector_store = VectorStore()
            
            try:
                search_results = vector_store.search(
                    query_embedding=question_embedding,
                    top_k=request.top_k
                )
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
                
                # Check if database is empty vs just no matches
                vector_store_check = VectorStore()
                total_documents = vector_store_check.count_documents()
                
                if total_documents == 0:
                    answer = (
                        "I apologize, but I cannot find relevant information to answer your question. "
                        "This is because no documents have been indexed in the system yet. "
                        "Please contact the administrator to upload and index documents, or try again later."
                    )
                else:
                    answer = (
                        "I couldn't find any relevant information in the available documents to answer your question. "
                        "Please try rephrasing your question or contact Roads Authority Namibia directly for assistance."
                    )
                
                no_results_data = {
                    "type": "complete",
                    "answer": answer,
                    "sources": [],
                    "confidence": 0.0
                }
                yield f"data: {json.dumps(no_results_data)}\n\n"
                return
            
            logger.info(f"Found {len(search_results)} relevant chunks")
            
            # Send metadata first
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
            
            # Calculate confidence
            if search_results:
                avg_relevance = sum(r.get('relevance', 0.0) for r in search_results[:3]) / min(3, len(search_results))
                confidence = round(avg_relevance, 2)
            else:
                confidence = 0.0
            
            metadata = {
                "type": "metadata",
                "sources": sources,
                "confidence": confidence
            }
            yield f"data: {json.dumps(metadata)}\n\n"
            
            # Step 3: Stream answer generation
            logger.info("Step 3: Streaming answer generation")
            llm_service = LLMService()
            
            try:
                for chunk in llm_service.generate_answer_streaming(
                    question=request.question,
                    context_chunks=search_results,
                    temperature=0.7
                ):
                    chunk_data = {
                        "type": "chunk",
                        "content": chunk
                    }
                    yield f"data: {json.dumps(chunk_data)}\n\n"
                
                # Send completion signal
                complete_data = {"type": "done"}
                yield f"data: {json.dumps(complete_data)}\n\n"
                
            except LLMError as e:
                error_data = {
                    "type": "error",
                    "error": "LLM_ERROR",
                    "message": f"Failed to generate answer: {str(e)}"
                }
                yield f"data: {json.dumps(error_data)}\n\n"
                return
                
        except Exception as e:
            logger.error(f"Unexpected error during streaming query: {str(e)}", exc_info=True)
            error_data = {
                "type": "error",
                "error": "INTERNAL_ERROR",
                "message": f"An unexpected error occurred: {str(e)}"
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