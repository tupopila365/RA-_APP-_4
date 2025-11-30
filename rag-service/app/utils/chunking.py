"""Text chunking utilities for splitting documents into manageable pieces."""

import logging
from typing import List, Dict, Any
import re

logger = logging.getLogger(__name__)


class TextChunker:
    """Service for splitting text into overlapping chunks."""
    
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        """
        Initialize the text chunker.
        
        Args:
            chunk_size: Target size of each chunk in tokens (approximate)
            chunk_overlap: Number of tokens to overlap between chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
        if chunk_overlap >= chunk_size:
            raise ValueError("chunk_overlap must be less than chunk_size")
    
    def estimate_tokens(self, text: str) -> int:
        """
        Estimate the number of tokens in text.
        
        Uses a simple heuristic: split on whitespace and punctuation.
        This is an approximation - actual tokenization may differ.
        
        Args:
            text: Input text
            
        Returns:
            Estimated token count
        """
        # Split on whitespace and common punctuation
        tokens = re.findall(r'\b\w+\b|[^\w\s]', text)
        return len(tokens)
    
    def split_text_by_tokens(self, text: str, max_tokens: int) -> List[str]:
        """
        Split text into segments of approximately max_tokens.
        
        Args:
            text: Input text to split
            max_tokens: Maximum tokens per segment
            
        Returns:
            List of text segments
        """
        # Split into sentences (simple approach)
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        segments = []
        current_segment = []
        current_token_count = 0
        
        for sentence in sentences:
            sentence_tokens = self.estimate_tokens(sentence)
            
            # If single sentence exceeds max_tokens, split it further
            if sentence_tokens > max_tokens:
                # If we have accumulated sentences, save them first
                if current_segment:
                    segments.append(' '.join(current_segment))
                    current_segment = []
                    current_token_count = 0
                
                # Split long sentence by words
                words = sentence.split()
                temp_segment = []
                temp_count = 0
                
                for word in words:
                    word_tokens = self.estimate_tokens(word)
                    if temp_count + word_tokens > max_tokens and temp_segment:
                        segments.append(' '.join(temp_segment))
                        temp_segment = []
                        temp_count = 0
                    temp_segment.append(word)
                    temp_count += word_tokens
                
                if temp_segment:
                    segments.append(' '.join(temp_segment))
                
            elif current_token_count + sentence_tokens > max_tokens:
                # Current segment is full, save it and start new one
                if current_segment:
                    segments.append(' '.join(current_segment))
                current_segment = [sentence]
                current_token_count = sentence_tokens
            else:
                # Add sentence to current segment
                current_segment.append(sentence)
                current_token_count += sentence_tokens
        
        # Add remaining segment
        if current_segment:
            segments.append(' '.join(current_segment))
        
        return segments
    
    def create_chunks(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Split text into overlapping chunks with metadata.
        
        Args:
            text: Input text to chunk
            metadata: Optional metadata to attach to each chunk
            
        Returns:
            List of chunk dictionaries containing:
                - text: Chunk text content
                - chunk_index: Index of this chunk
                - total_chunks: Total number of chunks
                - start_char: Starting character position in original text
                - end_char: Ending character position in original text
                - metadata: Any additional metadata
        """
        if not text or not text.strip():
            logger.warning("Empty text provided for chunking")
            return []
        
        logger.info(f"Chunking text of {len(text)} characters with chunk_size={self.chunk_size}, overlap={self.chunk_overlap}")
        
        # If overlap is enabled, use sliding window approach
        if self.chunk_overlap > 0:
            chunks = self._create_overlapping_chunks(text, metadata)
        else:
            # Original non-overlapping approach
            segments = self.split_text_by_tokens(text, self.chunk_size)
            
            chunks = []
            char_position = 0
            
            for i, segment in enumerate(segments):
                # Find the actual position of this segment in the original text
                # This is approximate due to sentence splitting
                start_char = text.find(segment[:50], char_position) if len(segment) >= 50 else text.find(segment, char_position)
                if start_char == -1:
                    start_char = char_position
                
                end_char = start_char + len(segment)
                
                chunk = {
                    'text': segment,
                    'chunk_index': i,
                    'start_char': start_char,
                    'end_char': end_char,
                    'token_count': self.estimate_tokens(segment)
                }
                
                # Add metadata if provided
                if metadata:
                    chunk['metadata'] = metadata.copy()
                
                chunks.append(chunk)
                char_position = end_char
            
            # Add total_chunks to each chunk
            total_chunks = len(chunks)
            for chunk in chunks:
                chunk['total_chunks'] = total_chunks
        
        logger.info(f"Created {len(chunks)} chunks from text")
        
        return chunks
    
    def _create_overlapping_chunks(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Create overlapping chunks using a sliding window approach.
        
        Args:
            text: Input text to chunk
            metadata: Optional metadata to attach to each chunk
            
        Returns:
            List of chunk dictionaries with proper overlap
        """
        # Split text into tokens (words and punctuation)
        tokens = re.findall(r'\b\w+\b|[^\w\s]', text)
        total_tokens = len(tokens)
        
        if total_tokens == 0:
            return []
        
        chunks = []
        chunk_index = 0
        start_token = 0
        
        # Calculate step size (how many tokens to advance for each chunk)
        step_size = self.chunk_size - self.chunk_overlap
        if step_size <= 0:
            step_size = 1  # Ensure we make progress
        
        while start_token < total_tokens:
            # Determine end token for this chunk
            end_token = min(start_token + self.chunk_size, total_tokens)
            
            # Extract tokens for this chunk
            chunk_tokens = tokens[start_token:end_token]
            chunk_text = ' '.join(chunk_tokens)
            
            # Find character positions in original text
            # This is approximate but works for most cases
            start_char = 0
            if start_token > 0:
                # Find where this chunk starts in the original text
                prefix_tokens = tokens[:start_token]
                prefix_text = ' '.join(prefix_tokens)
                start_char = len(prefix_text) + 1  # +1 for space
            
            end_char = start_char + len(chunk_text)
            
            chunk = {
                'text': chunk_text,
                'chunk_index': chunk_index,
                'start_char': start_char,
                'end_char': end_char,
                'token_count': len(chunk_tokens)
            }
            
            # Add metadata if provided
            if metadata:
                chunk['metadata'] = metadata.copy()
            
            chunks.append(chunk)
            chunk_index += 1
            
            # Move to next chunk position
            start_token += step_size
            
            # If we've covered all tokens, break
            if end_token >= total_tokens:
                break
        
        # Add total_chunks to each chunk
        total_chunks = len(chunks)
        for chunk in chunks:
            chunk['total_chunks'] = total_chunks
        
        return chunks
    
    def _add_overlap(self, chunks: List[Dict[str, Any]], original_text: str) -> List[Dict[str, Any]]:
        """
        Add overlap between consecutive chunks.
        
        Args:
            chunks: List of chunk dictionaries
            original_text: Original text for extracting overlap
            
        Returns:
            List of chunks with overlap added
        """
        overlapped_chunks = []
        
        for i, chunk in enumerate(chunks):
            chunk_text = chunk['text']
            
            # Add overlap from previous chunk
            if i > 0:
                prev_chunk = chunks[i - 1]
                prev_words = prev_chunk['text'].split()
                
                # Take last N tokens from previous chunk
                overlap_words = prev_words[-self.chunk_overlap:] if len(prev_words) > self.chunk_overlap else prev_words
                overlap_text = ' '.join(overlap_words)
                
                # Prepend overlap to current chunk
                chunk_text = overlap_text + ' ' + chunk_text
            
            # Update chunk with overlapped text
            overlapped_chunk = chunk.copy()
            overlapped_chunk['text'] = chunk_text
            overlapped_chunk['token_count'] = self.estimate_tokens(chunk_text)
            
            overlapped_chunks.append(overlapped_chunk)
        
        return overlapped_chunks
    
    def chunk_document_pages(self, page_texts: List[Dict[str, Any]], document_metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Chunk a document that has been split into pages.
        
        Args:
            page_texts: List of dictionaries with 'page_number' and 'text' keys
            document_metadata: Metadata to attach to all chunks
            
        Returns:
            List of chunks with page information in metadata
        """
        all_chunks = []
        
        for page_info in page_texts:
            page_number = page_info.get('page_number', 0)
            page_text = page_info.get('text', '')
            
            if not page_text.strip():
                continue
            
            # Create metadata for this page
            page_metadata = document_metadata.copy() if document_metadata else {}
            page_metadata['page_number'] = page_number
            
            # Chunk the page text
            page_chunks = self.create_chunks(page_text, page_metadata)
            
            all_chunks.extend(page_chunks)
        
        # Update chunk indices to be global across all pages
        for i, chunk in enumerate(all_chunks):
            chunk['chunk_index'] = i
            chunk['total_chunks'] = len(all_chunks)
        
        logger.info(f"Created {len(all_chunks)} chunks from {len(page_texts)} pages")
        
        return all_chunks
