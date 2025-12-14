"""FastAPI application entry point for RAG service."""

import logging
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.models.schemas import HealthResponse
from app.routers import index, query, models
from app.services.embeddings import EmbeddingService
from app.services.llm import LLMService
from app.services.vector_store import VectorStore
from app.utils.ollama_setup import initialize_ollama_models

# Configure logging with enhanced formatting
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

# Set uvicorn access log to WARNING to reduce noise
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Roads Authority RAG Service",
    description="RAG (Retrieval-Augmented Generation) service for document indexing and chatbot queries",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS middleware for backend API access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(index.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(models.router, prefix="/api")

# Import and include streaming router
from app.routers import query_stream
app.include_router(query_stream.router, prefix="/api")

logger.info("FastAPI application initialized")


@app.get("/", tags=["root"])
async def root():
    """Root endpoint."""
    return {
        "service": "Roads Authority RAG Service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    tags=["health"],
    summary="Health check endpoint",
    description="Check connectivity to Ollama and ChromaDB services"
)
async def health_check():
    """
    Health check endpoint to verify service connectivity.
    
    Checks:
    - Ollama service connectivity
    - ChromaDB connectivity
    
    Returns:
        HealthResponse with status and connectivity information
    """
    logger.info("Performing health check")
    
    # Check Ollama connectivity
    ollama_connected = False
    try:
        embedding_service = EmbeddingService()
        ollama_connected = embedding_service.check_connection()
        logger.info(f"Ollama connection check: {'success' if ollama_connected else 'failed'}")
    except Exception as e:
        logger.error(f"Ollama health check failed: {str(e)}")
    
    # Check ChromaDB connectivity
    chromadb_connected = False
    try:
        vector_store = VectorStore()
        chromadb_connected = vector_store.check_connection()
        logger.info(f"ChromaDB connection check: {'success' if chromadb_connected else 'failed'}")
    except Exception as e:
        logger.error(f"ChromaDB health check failed: {str(e)}")
    
    # Determine overall status
    overall_status = "healthy" if (ollama_connected and chromadb_connected) else "degraded"
    
    if not ollama_connected and not chromadb_connected:
        overall_status = "unhealthy"
    
    logger.info(f"Health check completed: {overall_status}")
    
    return HealthResponse(
        status=overall_status,
        ollama_connected=ollama_connected,
        chromadb_connected=chromadb_connected
    )


@app.on_event("startup")
async def startup_event():
    """Execute on application startup."""
    logger.info("=" * 60)
    logger.info("Starting Roads Authority RAG Service")
    logger.info(f"Ollama Base URL: {settings.ollama_base_url}")
    logger.info(f"Embedding Model: {settings.ollama_embedding_model}")
    logger.info(f"LLM Model: {settings.ollama_llm_model}")
    if settings.ollama_models_path:
        logger.info(f"Custom Models Path: {settings.ollama_models_path}")
    logger.info(f"Auto-pull Models: {settings.ollama_auto_pull}")
    logger.info(f"ChromaDB Collection: {settings.chromadb_collection_name}")
    logger.info(f"Chunk Size: {settings.chunk_size} tokens")
    logger.info(f"Chunk Overlap: {settings.chunk_overlap} tokens")
    logger.info("=" * 60)
    
    # Initialize Ollama models (detect and auto-pull if needed)
    try:
        logger.info("\nInitializing Ollama models...")
        models_ready = initialize_ollama_models(
            embedding_model=settings.ollama_embedding_model,
            llm_model=settings.ollama_llm_model,
            base_url=settings.ollama_base_url,
            custom_model_path=settings.ollama_models_path,
            auto_pull=settings.ollama_auto_pull
        )
        
        if not models_ready:
            logger.warning("⚠ Some Ollama models are not available. Service may not function correctly.")
        
    except Exception as e:
        logger.error(f"Failed to initialize Ollama models: {str(e)}")
    
    # Check ChromaDB
    try:
        logger.info("\nChecking ChromaDB connection...")
        vector_store = VectorStore()
        if vector_store.check_connection():
            count = vector_store.count_documents()
            logger.info(f"✓ ChromaDB is accessible ({count} chunks indexed)")
        else:
            logger.error("✗ Failed to connect to ChromaDB")
        
    except Exception as e:
        logger.error(f"ChromaDB check failed: {str(e)}")
    
    # Warm up models to avoid first-request delays
    try:
        logger.info("\nWarming up models...")
        embedding_service = EmbeddingService()
        llm_service = LLMService()
        
        # Generate a test embedding to load the embedding model
        test_embedding = embedding_service.generate_embedding("test warmup query")
        logger.info(f"✓ Embedding model warmed up (dimension: {len(test_embedding)})")
        
        # Generate a test response to load the LLM model
        test_response = llm_service.generate_answer(
            question="What is Roads Authority?",
            context_chunks=[{"document": "Roads Authority is a government organization.", "metadata": {}}],
            temperature=0.7,
            max_tokens=50
        )
        logger.info(f"✓ LLM model warmed up (response length: {len(test_response)})")
        
    except Exception as e:
        logger.warning(f"Model warmup failed (non-critical): {str(e)}")
    
    logger.info("\n" + "=" * 60)
    logger.info("RAG Service startup complete and ready to serve requests")
    logger.info("=" * 60)


@app.on_event("shutdown")
async def shutdown_event():
    """Execute on application shutdown."""
    logger.info("Shutting down Roads Authority RAG Service")


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors."""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "status": "error",
            "error": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected error occurred",
            "details": str(exc)
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    logger.info(f"Starting server on {settings.host}:{settings.port}")
    
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=True,
        log_level=settings.log_level.lower()
    )
