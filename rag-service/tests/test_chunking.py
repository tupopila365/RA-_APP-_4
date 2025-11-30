"""Unit tests for text chunking utilities."""

import pytest
from app.utils.chunking import TextChunker


class TestTextChunker:
    """Test suite for TextChunker class."""
    
    def test_initialization_default(self):
        """Test TextChunker initialization with default parameters."""
        chunker = TextChunker()
        assert chunker.chunk_size == 500
        assert chunker.chunk_overlap == 50
    
    def test_initialization_custom(self):
        """Test TextChunker initialization with custom parameters."""
        chunker = TextChunker(chunk_size=300, chunk_overlap=30)
        assert chunker.chunk_size == 300
        assert chunker.chunk_overlap == 30
    
    def test_initialization_invalid_overlap(self):
        """Test that initialization fails when overlap >= chunk_size."""
        with pytest.raises(ValueError) as exc_info:
            TextChunker(chunk_size=100, chunk_overlap=100)
        
        assert 'chunk_overlap must be less than chunk_size' in str(exc_info.value)
    
    def test_estimate_tokens_simple(self):
        """Test token estimation for simple text."""
        chunker = TextChunker()
        text = "This is a simple test sentence."
        tokens = chunker.estimate_tokens(text)
        
        # Should have 6 words + 1 period
        assert tokens >= 6
    
    def test_estimate_tokens_with_punctuation(self):
        """Test token estimation with punctuation."""
        chunker = TextChunker()
        text = "Hello, world! How are you?"
        tokens = chunker.estimate_tokens(text)
        
        # Should count words and punctuation
        assert tokens >= 5
    
    def test_estimate_tokens_empty(self):
        """Test token estimation for empty text."""
        chunker = TextChunker()
        tokens = chunker.estimate_tokens("")
        assert tokens == 0
    
    def test_split_text_by_tokens_simple(self):
        """Test splitting text into token-based segments."""
        chunker = TextChunker()
        text = "First sentence. Second sentence. Third sentence. Fourth sentence."
        segments = chunker.split_text_by_tokens(text, max_tokens=10)
        
        assert len(segments) > 0
        assert all(isinstance(seg, str) for seg in segments)
    
    def test_split_text_by_tokens_long_sentence(self):
        """Test splitting when a single sentence exceeds max_tokens."""
        chunker = TextChunker()
        # Create a very long sentence
        text = "This is a very long sentence with many words " * 20
        segments = chunker.split_text_by_tokens(text, max_tokens=20)
        
        assert len(segments) > 1
        # Each segment should be reasonably sized
        for seg in segments:
            assert chunker.estimate_tokens(seg) <= 25  # Allow some tolerance
    
    def test_create_chunks_simple(self, sample_pdf_content):
        """Test creating chunks from simple text."""
        chunker = TextChunker(chunk_size=50, chunk_overlap=10)
        chunks = chunker.create_chunks(sample_pdf_content)
        
        assert len(chunks) > 0
        assert all('text' in chunk for chunk in chunks)
        assert all('chunk_index' in chunk for chunk in chunks)
        assert all('total_chunks' in chunk for chunk in chunks)
        assert all('token_count' in chunk for chunk in chunks)
    
    def test_create_chunks_empty_text(self):
        """Test creating chunks from empty text."""
        chunker = TextChunker()
        chunks = chunker.create_chunks("")
        
        assert len(chunks) == 0
    
    def test_create_chunks_whitespace_only(self):
        """Test creating chunks from whitespace-only text."""
        chunker = TextChunker()
        chunks = chunker.create_chunks("   \n\n   \t  ")
        
        assert len(chunks) == 0
    
    def test_create_chunks_with_metadata(self):
        """Test creating chunks with metadata."""
        chunker = TextChunker(chunk_size=50, chunk_overlap=10)
        metadata = {'document_id': 'doc123', 'page_number': 1}
        text = "This is a test document with some content that needs to be chunked."
        
        chunks = chunker.create_chunks(text, metadata=metadata)
        
        assert len(chunks) > 0
        for chunk in chunks:
            assert 'metadata' in chunk
            assert chunk['metadata']['document_id'] == 'doc123'
            assert chunk['metadata']['page_number'] == 1
    
    def test_create_chunks_indices(self):
        """Test that chunk indices are sequential."""
        chunker = TextChunker(chunk_size=30, chunk_overlap=5)
        text = "First part. Second part. Third part. Fourth part. Fifth part."
        
        chunks = chunker.create_chunks(text)
        
        for i, chunk in enumerate(chunks):
            assert chunk['chunk_index'] == i
            assert chunk['total_chunks'] == len(chunks)
    
    def test_create_chunks_overlap(self):
        """Test that chunks have overlap when specified."""
        chunker = TextChunker(chunk_size=30, chunk_overlap=10)
        # Create text with enough tokens to generate multiple chunks
        # With 50 tokens, chunk_size=30, and overlap=10, we should get at least 2 chunks
        text = ' '.join(['word'] * 50)
        
        chunks = chunker.create_chunks(text)
        
        # With overlap and text longer than chunk_size, we should have multiple chunks
        assert len(chunks) >= 2
        
        # Check that consecutive chunks share some content (overlap)
        if len(chunks) > 1:
            # Verify that chunks have overlapping content
            chunk1_tokens = chunks[0]['text'].split()
            chunk2_tokens = chunks[1]['text'].split()
            
            # Last tokens of chunk 1 should match first tokens of chunk 2 (overlap)
            overlap_size = min(10, len(chunk1_tokens), len(chunk2_tokens))
            overlap1 = chunk1_tokens[-overlap_size:]
            overlap2 = chunk2_tokens[:overlap_size]
            
            # The overlap should cause some text to appear in consecutive chunks
            assert overlap1 == overlap2, "Consecutive chunks should have overlapping content"
    
    def test_chunk_document_pages(self, sample_page_texts):
        """Test chunking document pages."""
        chunker = TextChunker(chunk_size=50, chunk_overlap=10)
        document_metadata = {'document_id': 'doc123', 'title': 'Test Doc'}
        
        chunks = chunker.chunk_document_pages(sample_page_texts, document_metadata)
        
        assert len(chunks) > 0
        
        # Check that page numbers are preserved
        for chunk in chunks:
            assert 'metadata' in chunk
            assert 'page_number' in chunk['metadata']
            assert 'document_id' in chunk['metadata']
            assert chunk['metadata']['document_id'] == 'doc123'
    
    def test_chunk_document_pages_empty_pages(self):
        """Test chunking with empty pages."""
        chunker = TextChunker()
        page_texts = [
            {'page_number': 1, 'text': 'Some content'},
            {'page_number': 2, 'text': ''},  # Empty page
            {'page_number': 3, 'text': 'More content'}
        ]
        
        chunks = chunker.chunk_document_pages(page_texts)
        
        # Should skip empty pages
        assert len(chunks) > 0
        # All chunks should have non-empty text
        assert all(chunk['text'].strip() for chunk in chunks)
    
    def test_chunk_document_pages_global_indices(self, sample_page_texts):
        """Test that chunk indices are global across all pages."""
        chunker = TextChunker(chunk_size=50, chunk_overlap=10)
        
        chunks = chunker.chunk_document_pages(sample_page_texts)
        
        # Check that indices are sequential across all pages
        for i, chunk in enumerate(chunks):
            assert chunk['chunk_index'] == i
            assert chunk['total_chunks'] == len(chunks)
    
    def test_token_count_accuracy(self):
        """Test that token count is reasonably accurate."""
        chunker = TextChunker()
        text = "The quick brown fox jumps over the lazy dog."
        
        chunks = chunker.create_chunks(text)
        
        assert len(chunks) > 0
        for chunk in chunks:
            # Token count should be positive
            assert chunk['token_count'] > 0
            # Token count should be reasonable for the text length
            assert chunk['token_count'] <= len(chunk['text'].split()) * 2
    
    def test_chunk_size_respected(self):
        """Test that chunks respect the maximum size."""
        chunk_size = 50
        chunker = TextChunker(chunk_size=chunk_size, chunk_overlap=10)
        
        # Create a long text
        text = "This is a sentence. " * 100
        
        chunks = chunker.create_chunks(text)
        
        # Most chunks should be close to chunk_size (allowing for overlap)
        for chunk in chunks:
            # Token count should not exceed chunk_size by much
            # (overlap can make it slightly larger)
            assert chunk['token_count'] <= chunk_size * 1.5
