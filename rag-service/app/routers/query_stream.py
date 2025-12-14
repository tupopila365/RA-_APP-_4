"""Router for streaming chatbot query endpoint."""

import logging
import json
from fastapi import APIRouter, status
from fastapi.responses import StreamingResponse
from app.models.schemas import QueryRequest, ErrorResponse
from app.services.embeddings import EmbeddingService, EmbeddingError
from app.services.vector_store import VectorStore, VectorStoreError
from app.services.llm import LLMService, LLMError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/query", tags=["query"])


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
                no_results_data = {
                    "type": "complete",
                    "answer": "I couldn't find any relevant information in the available documents to answer your question.",
                    "sources": [],
                    "confidence": 0.0
                }
                yield f"data: {json.dumps(no_results_data)}\n\n"
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
            
            # Calculate confidence
            if search_results:
                avg_relevance = sum(r.get('relevance', 0.0) for r in search_results[:3]) / min(3, len(search_results))
                confidence = round(avg_relevance, 2)
            else:
                confidence = 0.0
            
            # Send metadata
            metadata_data = {
                "type": "metadata",
                "sources": sources,
                "confidence": confidence
            }
            yield f"data: {json.dumps(metadata_data)}\n\n"
            
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
