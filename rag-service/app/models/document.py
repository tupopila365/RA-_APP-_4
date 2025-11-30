"""Document data model for internal use."""

from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime


@dataclass
class DocumentChunk:
    """Represents a chunk of text from a document."""
    
    chunk_id: str
    document_id: str
    document_title: str
    content: str
    chunk_index: int
    total_chunks: int
    page_number: Optional[int] = None
    embedding: Optional[List[float]] = None
    
    def to_metadata(self) -> dict:
        """Convert chunk to metadata dictionary for vector storage."""
        return {
            "document_id": self.document_id,
            "document_title": self.document_title,
            "chunk_index": self.chunk_index,
            "total_chunks": self.total_chunks,
            "page_number": self.page_number,
        }


@dataclass
class Document:
    """Represents a complete document."""
    
    document_id: str
    title: str
    url: str
    content: str
    chunks: List[DocumentChunk]
    created_at: datetime
    total_pages: Optional[int] = None
    file_size: Optional[int] = None
    
    def __post_init__(self):
        """Initialize created_at if not provided."""
        if not isinstance(self.created_at, datetime):
            self.created_at = datetime.utcnow()


@dataclass
class RetrievedChunk:
    """Represents a chunk retrieved from vector search."""
    
    chunk_id: str
    document_id: str
    document_title: str
    content: str
    chunk_index: int
    relevance_score: float
    page_number: Optional[int] = None
    
    @classmethod
    def from_search_result(cls, result: dict, score: float) -> "RetrievedChunk":
        """Create RetrievedChunk from ChromaDB search result."""
        metadata = result.get("metadata", {})
        return cls(
            chunk_id=result.get("id", ""),
            document_id=metadata.get("document_id", ""),
            document_title=metadata.get("document_title", ""),
            content=result.get("document", ""),
            chunk_index=metadata.get("chunk_index", 0),
            relevance_score=score,
            page_number=metadata.get("page_number"),
        )
