"""Router for model management and status endpoints."""

import logging
from fastapi import APIRouter, status
from fastapi.responses import JSONResponse
from app.services.embeddings import EmbeddingService
from app.services.llm import LLMService
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["models"])


@router.get(
    "/models/status",
    status_code=status.HTTP_200_OK,
    summary="Check model availability",
    description="Check if required Ollama models are installed and available"
)
async def check_models_status():
    """
    Check the availability of required Ollama models.
    
    Returns detailed information about:
    - Embedding model status
    - LLM model status
    - Available models in Ollama
    - Installation instructions for missing models
    """
    logger.info("Checking model status")
    
    result = {
        "ollama_url": settings.ollama_base_url,
        "required_models": {
            "embedding": settings.ollama_embedding_model,
            "llm": settings.ollama_llm_model
        },
        "status": {},
        "available_models": [],
        "missing_models": [],
        "instructions": []
    }
    
    try:
        # Check embedding model
        embedding_service = EmbeddingService()
        embedding_available = embedding_service.check_model_available()
        
        result["status"]["embedding_model"] = {
            "name": settings.ollama_embedding_model,
            "available": embedding_available,
            "status": "ready" if embedding_available else "missing"
        }
        
        if not embedding_available:
            result["missing_models"].append(settings.ollama_embedding_model)
            result["instructions"].append(
                f"Install embedding model: ollama pull {settings.ollama_embedding_model}"
            )
        
        # Check LLM model
        llm_service = LLMService()
        llm_available = llm_service.check_model_available()
        
        result["status"]["llm_model"] = {
            "name": settings.ollama_llm_model,
            "available": llm_available,
            "status": "ready" if llm_available else "missing"
        }
        
        if not llm_available:
            result["missing_models"].append(settings.ollama_llm_model)
            result["instructions"].append(
                f"Install LLM model: ollama pull {settings.ollama_llm_model}"
            )
        
        # Get list of available models
        try:
            models_response = embedding_service.client.list()
            models = models_response.get('models', [])
            
            result["available_models"] = [
                {
                    "name": model.get('name', 'unknown'),
                    "size": model.get('size', 0),
                    "modified_at": model.get('modified_at', '')
                }
                for model in models
                if model.get('name')  # Filter out empty names
            ]
            
            logger.info(f"Found {len(result['available_models'])} available models")
            
        except Exception as e:
            logger.error(f"Failed to list available models: {str(e)}")
            result["available_models"] = []
        
        # Determine overall status
        all_ready = embedding_available and llm_available
        result["overall_status"] = "ready" if all_ready else "incomplete"
        
        if not all_ready:
            result["message"] = "Some required models are missing. Please install them using the provided instructions."
        else:
            result["message"] = "All required models are available and ready."
        
        logger.info(f"Model status check complete: {result['overall_status']}")
        
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=result
        )
        
    except Exception as e:
        logger.error(f"Failed to check model status: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": "MODEL_CHECK_FAILED",
                "message": f"Failed to check model status: {str(e)}",
                "instructions": [
                    "1. Verify Ollama is running: ollama list",
                    "2. Check Ollama service: curl http://localhost:11434/api/tags",
                    f"3. Install models: ollama pull {settings.ollama_embedding_model}",
                    f"4. Install models: ollama pull {settings.ollama_llm_model}"
                ]
            }
        )


@router.post(
    "/models/verify",
    status_code=status.HTTP_200_OK,
    summary="Verify models are functional",
    description="Test that models can actually generate embeddings and responses"
)
async def verify_models():
    """
    Verify that models are not only installed but actually functional.
    
    Performs test operations:
    - Generate a test embedding
    - Generate a test LLM response
    """
    logger.info("Verifying model functionality")
    
    result = {
        "embedding_test": {"status": "not_tested"},
        "llm_test": {"status": "not_tested"},
        "overall_status": "unknown"
    }
    
    # Test embedding model
    try:
        embedding_service = EmbeddingService()
        test_embedding = embedding_service.generate_embedding("test")
        
        result["embedding_test"] = {
            "status": "success",
            "model": settings.ollama_embedding_model,
            "embedding_dimension": len(test_embedding),
            "message": "Embedding model is functional"
        }
        logger.info("✓ Embedding model test passed")
        
    except Exception as e:
        result["embedding_test"] = {
            "status": "failed",
            "model": settings.ollama_embedding_model,
            "error": str(e),
            "message": "Embedding model test failed"
        }
        logger.error(f"✗ Embedding model test failed: {str(e)}")
    
    # Test LLM model
    try:
        llm_service = LLMService()
        test_answer = llm_service.generate_answer(
            question="What is 2+2?",
            context_chunks=[],
            max_tokens=50
        )
        
        result["llm_test"] = {
            "status": "success",
            "model": settings.ollama_llm_model,
            "response_length": len(test_answer),
            "message": "LLM model is functional"
        }
        logger.info("✓ LLM model test passed")
        
    except Exception as e:
        result["llm_test"] = {
            "status": "failed",
            "model": settings.ollama_llm_model,
            "error": str(e),
            "message": "LLM model test failed"
        }
        logger.error(f"✗ LLM model test failed: {str(e)}")
    
    # Determine overall status
    embedding_ok = result["embedding_test"]["status"] == "success"
    llm_ok = result["llm_test"]["status"] == "success"
    
    if embedding_ok and llm_ok:
        result["overall_status"] = "fully_functional"
        result["message"] = "All models are installed and functional"
    elif embedding_ok or llm_ok:
        result["overall_status"] = "partially_functional"
        result["message"] = "Some models are functional, but not all"
    else:
        result["overall_status"] = "not_functional"
        result["message"] = "Models are not functional. Check installation and Ollama service."
    
    logger.info(f"Model verification complete: {result['overall_status']}")
    
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content=result
    )
