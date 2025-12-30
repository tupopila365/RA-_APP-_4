"""Pydantic models for request and response schemas."""

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
from datetime import datetime


class IndexRequest(BaseModel):
    """Request model for document indexing."""
    
    document_url: str = Field(..., description="URL of the PDF document to index")
    document_id: str = Field(..., description="Unique identifier for the document")
    title: str = Field(..., description="Title of the document")
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_url": "https://example.com/document.pdf",
                "document_id": "doc_123",
                "title": "Roads Authority Policy Document"
            }
        }


class IndexResponse(BaseModel):
    """Response model for document indexing."""
    
    status: str = Field(..., description="Status of the indexing operation")
    chunks_indexed: int = Field(..., description="Number of chunks successfully indexed")
    document_id: str = Field(..., description="Document identifier")
    message: Optional[str] = Field(None, description="Additional information")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "success",
                "chunks_indexed": 42,
                "document_id": "doc_123",
                "message": "Document successfully indexed"
            }
        }


class QueryRequest(BaseModel):
    """Request model for chatbot queries."""
    
    question: str = Field(..., description="User's question")
    top_k: int = Field(5, description="Number of relevant chunks to retrieve", ge=1, le=10)
    
    class Config:
        json_schema_extra = {
            "example": {
                "question": "What are the requirements for a driver's license?",
                "top_k": 5
            }
        }


class SourceDocument(BaseModel):
    """Model for source document reference."""
    
    document_id: str = Field(..., description="Document identifier")
    title: str = Field(..., description="Document title")
    relevance: float = Field(..., description="Relevance score", ge=0.0, le=1.0)
    chunk_index: Optional[int] = Field(None, description="Index of the relevant chunk")
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "doc_123",
                "title": "Driver's License Requirements",
                "relevance": 0.92,
                "chunk_index": 5
            }
        }


class QueryResponse(BaseModel):
    """Response model for chatbot queries."""
    
    answer: str = Field(..., description="Generated answer to the question")
    sources: List[SourceDocument] = Field(..., description="Source documents used")
    confidence: Optional[float] = Field(None, description="Confidence score", ge=0.0, le=1.0)
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Response timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "answer": "To obtain a driver's license in Namibia, you must...",
                "sources": [
                    {
                        "document_id": "doc_123",
                        "title": "Driver's License Requirements",
                        "relevance": 0.92,
                        "chunk_index": 5
                    }
                ],
                "confidence": 0.88,
                "timestamp": "2025-11-21T09:00:00Z"
            }
        }


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    
    status: str = Field(..., description="Overall service status")
    ollama_connected: bool = Field(..., description="Ollama connection status")
    chromadb_connected: bool = Field(..., description="ChromaDB connection status")
    document_count: int = Field(default=0, description="Number of document chunks indexed in ChromaDB")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Check timestamp")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "ollama_connected": True,
                "chromadb_connected": True,
                "timestamp": "2025-11-21T09:00:00Z"
            }
        }


class ErrorResponse(BaseModel):
    """Response model for errors."""
    
    status: str = Field("error", description="Status indicator")
    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Error message")
    details: Optional[dict] = Field(None, description="Additional error details")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "error",
                "error": "PDF_PROCESSING_ERROR",
                "message": "Failed to extract text from PDF",
                "details": {"reason": "Invalid PDF format"}
            }
        }
