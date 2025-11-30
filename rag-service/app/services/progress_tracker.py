"""Progress tracking for document indexing."""

import logging
from typing import Dict, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class ProgressTracker:
    """Track progress of document indexing operations."""
    
    def __init__(self):
        """Initialize progress tracker with in-memory storage."""
        self._progress: Dict[str, Dict] = {}
        self._cleanup_interval = timedelta(hours=1)
    
    def start_indexing(self, document_id: str, total_chunks: int) -> None:
        """
        Start tracking progress for a document.
        
        Args:
            document_id: Unique identifier for the document
            total_chunks: Total number of chunks to process
        """
        self._progress[document_id] = {
            'status': 'processing',
            'stage': 'downloading',
            'current_chunk': 0,
            'total_chunks': total_chunks,
            'percentage': 0,
            'message': 'Downloading PDF...',
            'started_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
        }
        logger.info(f"Started tracking progress for document {document_id}")
    
    def update_stage(self, document_id: str, stage: str, message: str) -> None:
        """
        Update the current processing stage.
        
        Args:
            document_id: Document identifier
            stage: Current stage (downloading, extracting, chunking, embedding, storing)
            message: Human-readable message
        """
        if document_id in self._progress:
            self._progress[document_id]['stage'] = stage
            self._progress[document_id]['message'] = message
            self._progress[document_id]['updated_at'] = datetime.utcnow().isoformat()
            self._update_percentage(document_id)
            logger.debug(f"Document {document_id} - Stage: {stage}, Message: {message}")
    
    def update_chunk_progress(self, document_id: str, current_chunk: int) -> None:
        """
        Update progress for chunk processing.
        
        Args:
            document_id: Document identifier
            current_chunk: Number of chunks processed so far
        """
        if document_id in self._progress:
            self._progress[document_id]['current_chunk'] = current_chunk
            self._progress[document_id]['updated_at'] = datetime.utcnow().isoformat()
            self._update_percentage(document_id)
    
    def _update_percentage(self, document_id: str) -> None:
        """Calculate and update the overall percentage."""
        if document_id not in self._progress:
            return
        
        progress = self._progress[document_id]
        stage = progress['stage']
        
        # Stage weights (total = 100%)
        stage_weights = {
            'downloading': (0, 10),      # 0-10%
            'extracting': (10, 20),       # 10-20%
            'chunking': (20, 30),         # 20-30%
            'embedding': (30, 85),        # 30-85% (most time-consuming)
            'storing': (85, 95),          # 85-95%
            'complete': (95, 100),        # 95-100%
        }
        
        if stage not in stage_weights:
            return
        
        start_pct, end_pct = stage_weights[stage]
        
        # For embedding and storing stages, calculate based on chunk progress
        if stage in ['embedding', 'storing'] and progress['total_chunks'] > 0:
            chunk_progress = progress['current_chunk'] / progress['total_chunks']
            percentage = start_pct + (chunk_progress * (end_pct - start_pct))
        else:
            # For other stages, use the start percentage
            percentage = start_pct
        
        progress['percentage'] = min(100, int(percentage))
    
    def complete_indexing(self, document_id: str, chunks_indexed: int) -> None:
        """
        Mark indexing as complete.
        
        Args:
            document_id: Document identifier
            chunks_indexed: Total number of chunks successfully indexed
        """
        if document_id in self._progress:
            self._progress[document_id].update({
                'status': 'completed',
                'stage': 'complete',
                'current_chunk': chunks_indexed,
                'percentage': 100,
                'message': f'Successfully indexed {chunks_indexed} chunks',
                'updated_at': datetime.utcnow().isoformat(),
                'completed_at': datetime.utcnow().isoformat(),
            })
            logger.info(f"Completed tracking for document {document_id}")
    
    def fail_indexing(self, document_id: str, error_message: str) -> None:
        """
        Mark indexing as failed.
        
        Args:
            document_id: Document identifier
            error_message: Error description
        """
        if document_id in self._progress:
            self._progress[document_id].update({
                'status': 'failed',
                'message': error_message,
                'updated_at': datetime.utcnow().isoformat(),
                'failed_at': datetime.utcnow().isoformat(),
            })
            logger.error(f"Failed tracking for document {document_id}: {error_message}")
    
    def get_progress(self, document_id: str) -> Optional[Dict]:
        """
        Get current progress for a document.
        
        Args:
            document_id: Document identifier
            
        Returns:
            Progress dictionary or None if not found
        """
        return self._progress.get(document_id)
    
    def cleanup_old_progress(self) -> None:
        """Remove progress entries older than cleanup_interval."""
        cutoff_time = datetime.utcnow() - self._cleanup_interval
        to_remove = []
        
        for doc_id, progress in self._progress.items():
            updated_at = datetime.fromisoformat(progress['updated_at'])
            if updated_at < cutoff_time:
                to_remove.append(doc_id)
        
        for doc_id in to_remove:
            del self._progress[doc_id]
            logger.info(f"Cleaned up old progress for document {doc_id}")


# Global progress tracker instance
progress_tracker = ProgressTracker()
