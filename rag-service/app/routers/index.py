"""Router for document indexing endpoint."""

import logging
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import IndexRequest, IndexResponse, ErrorResponse
from app.services.pdf_processor import PDFProcessor, PDFProcessingError
from app.services.embeddings import EmbeddingService, EmbeddingError
from app.services.vector_store import VectorStore, VectorStoreError
from app.services.progress_tracker import progress_tracker
from app.utils.chunking import TextChunker
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/index", tags=["indexing"])


@router.post(
    "",
    response_model=IndexResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Processing error"},
        503: {"model": ErrorResponse, "description": "Service unavailable"}
    },
    summary="Index a PDF document",
    description="Download a PDF document, extract text, chunk it, generate embeddings, and store in vector database"
)
async def index_document(request: IndexRequest):
    """
    Index a PDF document for RAG retrieval.
    
    This endpoint implements the full document processing pipeline:
    1. Download PDF from provided URL
    2. Extract text content from PDF
    3. Split text into overlapping chunks
    4. Generate embeddings for each chunk using Ollama
    5. Store embeddings and metadata in ChromaDB
    
    Args:
        request: IndexRequest containing document_url, document_id, and title
        
    Returns:
        IndexResponse with status, chunks_indexed count, and document_id
        
    Raises:
        HTTPException: If any step of the pipeline fails
    """
    logger.info(f"Starting document indexing for document_id={request.document_id}, title={request.title}")
    
    # Initialize progress tracking
    progress_tracker.start_indexing(request.document_id, 0)  # Will update total_chunks later
    
    try:
        # Step 1: Download and extract text from PDF
        logger.info("=" * 80)
        logger.info("📥 STEP 1/4: Downloading and extracting text from PDF")
        logger.info("=" * 80)
        progress_tracker.update_stage(request.document_id, 'downloading', 'Downloading PDF from URL...')
        pdf_processor = PDFProcessor()
        
        try:
            progress_tracker.update_stage(request.document_id, 'extracting', 'Extracting text from PDF...')
            pdf_data = pdf_processor.process_pdf_from_url(request.document_url, document_id=request.document_id)
        except PDFProcessingError as e:
            # Enhanced error logging with detailed context
            error_context = {
                'document_id': request.document_id,
                'document_url': request.document_url,
                'document_title': request.title,
                'error_code': getattr(e, 'error_code', 'UNKNOWN'),
                'status_code': getattr(e, 'status_code', None)
            }
            
            logger.error(
                f"PDF processing failed | "
                f"Document ID: {error_context['document_id']} | "
                f"URL: {error_context['document_url']} | "
                f"Title: {error_context['document_title']} | "
                f"Error Code: {error_context['error_code']} | "
                f"HTTP Status: {error_context['status_code']} | "
                f"Error: {str(e)}"
            )
            
            progress_tracker.fail_indexing(request.document_id, f"PDF processing failed: {str(e)}")
            
            # Provide more specific error messages based on error code
            if hasattr(e, 'error_code'):
                if e.error_code == 'AUTH_REQUIRED':
                    detail_message = (
                        "Authentication required to access the PDF. "
                        "The document URL requires valid credentials. "
                        "Please check Cloudinary access settings."
                    )
                elif e.error_code == 'ACCESS_FORBIDDEN':
                    detail_message = (
                        "Access forbidden for the PDF. "
                        "The credentials or permissions are insufficient. "
                        "Please check Cloudinary permissions."
                    )
                else:
                    detail_message = f"Failed to process PDF: {str(e)}"
            else:
                detail_message = f"Failed to process PDF: {str(e)}"
            
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "status": "error",
                    "error": getattr(e, 'error_code', 'PDF_PROCESSING_ERROR'),
                    "message": detail_message,
                    "document_id": request.document_id,
                    "http_status": getattr(e, 'status_code', None)
                }
            )
        
        extracted_text = pdf_data['text']
        page_texts = pdf_data['page_texts']
        num_pages = pdf_data['num_pages']
        
        logger.info(f"✅ Successfully extracted {len(extracted_text)} characters from {num_pages} pages")
        logger.info("")
        
        # Step 2: Chunk the text
        logger.info("=" * 80)
        logger.info("✂️  STEP 2/4: Chunking text into overlapping segments")
        logger.info("=" * 80)
        progress_tracker.update_stage(request.document_id, 'chunking', 'Splitting document into chunks...')
        chunker = TextChunker(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap
        )
        
        # Create document metadata
        document_metadata = {
            'document_id': request.document_id,
            'document_title': request.title,
            'source_url': request.document_url,
            'num_pages': num_pages
        }
        
        # Chunk the document pages
        chunks = chunker.chunk_document_pages(page_texts, document_metadata)
        
        if not chunks:
            logger.error("No chunks created from document")
            progress_tracker.fail_indexing(request.document_id, "Failed to create chunks from document")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "status": "error",
                    "error": "CHUNKING_ERROR",
                    "message": "Failed to create chunks from document text",
                    "document_id": request.document_id
                }
            )
        
        logger.info(f"✅ Created {len(chunks)} chunks from document")
        logger.info("")
        
        # Update progress tracker with total chunks
        progress_tracker._progress[request.document_id]['total_chunks'] = len(chunks)
        
        # Step 3: Generate embeddings for chunks
        logger.info("=" * 80)
        logger.info(f"🧠 STEP 3/4: Generating embeddings for {len(chunks)} chunks")
        logger.info("=" * 80)
        progress_tracker.update_stage(request.document_id, 'embedding', f'Generating embeddings for {len(chunks)} chunks...')
        embedding_service = EmbeddingService()
        
        try:
            # Create progress callback
            def embedding_progress(current, total):
                progress_tracker.update_chunk_progress(request.document_id, current)
            
            embedded_chunks = embedding_service.embed_chunks(chunks, progress_callback=embedding_progress)
        except EmbeddingError as e:
            error_message = str(e)
            logger.error(f"Embedding generation failed: {error_message}")
            progress_tracker.fail_indexing(request.document_id, f"Embedding failed: {error_message}")
            
            # Provide diagnostic information in the error response
            diagnostic_info = {
                "ollama_base_url": settings.ollama_base_url,
                "embedding_model": settings.ollama_embedding_model,
                "troubleshooting": [
                    "1. Verify Ollama is running: ollama serve",
                    f"2. Check if model is installed: ollama pull {settings.ollama_embedding_model}",
                    "3. Test Ollama connection: curl http://localhost:11434/api/tags",
                    "4. Check RAG service logs for detailed error messages"
                ]
            }
            
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "status": "error",
                    "error": "EMBEDDING_ERROR",
                    "message": error_message,
                    "document_id": request.document_id,
                    "diagnostics": diagnostic_info
                }
            )
        except Exception as e:
            # Catch any unexpected errors
            error_message = f"Unexpected error during embedding generation: {str(e)}"
            logger.error(error_message, exc_info=True)
            progress_tracker.fail_indexing(request.document_id, error_message)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "status": "error",
                    "error": "EMBEDDING_ERROR",
                    "message": error_message,
                    "document_id": request.document_id
                }
            )
        
        # Safety check: This should rarely be hit now since embed_chunks raises exception on total failure
        if not embedded_chunks:
            logger.error("No embeddings generated for chunks (safety check triggered)")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "status": "error",
                    "error": "EMBEDDING_ERROR",
                    "message": "Failed to generate embeddings for any chunks. This may indicate Ollama connection issues or model unavailability.",
                    "document_id": request.document_id,
                    "diagnostics": {
                        "ollama_base_url": settings.ollama_base_url,
                        "embedding_model": settings.ollama_embedding_model
                    }
                }
            )
        
        logger.info(f"✅ Successfully generated embeddings for {len(embedded_chunks)} chunks")
        logger.info("")
        
        # Step 4: Store in ChromaDB
        logger.info("=" * 80)
        logger.info("💾 STEP 4/4: Storing embeddings in vector database")
        logger.info("=" * 80)
        progress_tracker.update_stage(request.document_id, 'storing', 'Storing embeddings in vector database...')
        vector_store = VectorStore()
        
        try:
            chunks_indexed = vector_store.add_documents(
                chunks=embedded_chunks,
                document_id=request.document_id,
                document_title=request.title
            )
        except VectorStoreError as e:
            logger.error(f"Vector store operation failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "status": "error",
                    "error": "VECTOR_STORE_ERROR",
                    "message": f"Failed to store embeddings: {str(e)}",
                    "document_id": request.document_id
                }
            )
        
        logger.info(f"✅ Successfully indexed {chunks_indexed} chunks for document {request.document_id}")
        logger.info("")
        logger.info("=" * 80)
        logger.info("🎉 INDEXING COMPLETE!")
        logger.info(f"📄 Document: {request.title}")
        logger.info(f"🔢 Total chunks indexed: {chunks_indexed}")
        logger.info("=" * 80)
        logger.info("")
        
        # Mark indexing as complete
        progress_tracker.complete_indexing(request.document_id, chunks_indexed)
        
        # Return success response
        return IndexResponse(
            status="success",
            chunks_indexed=chunks_indexed,
            document_id=request.document_id,
            message=f"Document successfully indexed with {chunks_indexed} chunks"
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Catch any unexpected errors
        logger.error(f"Unexpected error during indexing: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "status": "error",
                "error": "INTERNAL_ERROR",
                "message": f"An unexpected error occurred: {str(e)}",
                "document_id": request.document_id
            }
        )



@router.get(
    "/progress/{document_id}",
    status_code=status.HTTP_200_OK,
    summary="Get indexing progress",
    description="Get the current progress of document indexing"
)
async def get_indexing_progress(document_id: str):
    """
    Get the current indexing progress for a document.
    
    Args:
        document_id: Document identifier
        
    Returns:
        Progress information including status, stage, percentage, and message
    """
    progress = progress_tracker.get_progress(document_id)
    
    if not progress:
        # Return a default "not found" response instead of error
        # This allows the frontend to handle gracefully
        return {
            "status": "success",
            "data": {
                "status": "not_found",
                "stage": "unknown",
                "percentage": 0,
                "message": "No indexing progress found. Document may have already completed indexing.",
                "document_id": document_id
            }
        }
    
    return {
        "status": "success",
        "data": progress
    }
