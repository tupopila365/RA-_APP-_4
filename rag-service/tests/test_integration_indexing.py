"""Integration tests for the full indexing pipeline."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from app.services.pdf_processor import PDFProcessor
from app.utils.chunking import TextChunker
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStore


class TestIndexingPipeline:
    """Integration tests for the complete document indexing pipeline."""
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    @patch('app.services.pdf_processor.requests.get')
    def test_full_indexing_pipeline(
        self,
        mock_requests_get,
        mock_ollama_client_class,
        mock_chromadb_client_class,
        temp_pdf_file
    ):
        """Test the complete indexing pipeline from PDF URL to vector storage."""
        # Setup mocks
        # 1. PDF download
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_requests_get.return_value = mock_response
        
        # 2. Ollama embeddings
        mock_ollama_client = MagicMock()
        mock_ollama_client.embeddings.return_value = {'embedding': [0.1] * 768}
        mock_ollama_client_class.return_value = mock_ollama_client
        
        # 3. ChromaDB
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_collection.add.return_value = None
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        # Execute pipeline
        # Step 1: Download and extract PDF
        pdf_processor = PDFProcessor()
        pdf_result = pdf_processor.process_pdf_from_url('http://example.com/test.pdf')
        
        assert 'text' in pdf_result
        assert 'page_texts' in pdf_result
        assert len(pdf_result['text']) > 0
        
        # Step 2: Chunk the text
        chunker = TextChunker(chunk_size=100, chunk_overlap=20)
        chunks = chunker.chunk_document_pages(
            pdf_result['page_texts'],
            document_metadata={'document_id': 'doc123', 'title': 'Test Doc'}
        )
        
        assert len(chunks) > 0
        assert all('text' in chunk for chunk in chunks)
        
        # Step 3: Generate embeddings
        embedding_service = EmbeddingService()
        embedded_chunks = embedding_service.embed_chunks(chunks)
        
        assert len(embedded_chunks) > 0
        assert all('embedding' in chunk for chunk in embedded_chunks)
        
        # Step 4: Store in vector database
        vector_store = VectorStore()
        count = vector_store.add_documents(
            chunks=embedded_chunks,
            document_id='doc123',
            document_title='Test Document'
        )
        
        assert count == len(embedded_chunks)
        
        # Verify all components were called
        mock_requests_get.assert_called_once()
        assert mock_ollama_client.embeddings.call_count == len(chunks)
        mock_collection.add.assert_called_once()
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_chunking_preserves_metadata(
        self,
        mock_ollama_client_class,
        mock_chromadb_client_class,
        sample_page_texts
    ):
        """Test that metadata is preserved through the chunking pipeline."""
        # Setup mocks
        mock_ollama_client = MagicMock()
        mock_ollama_client.embeddings.return_value = {'embedding': [0.1] * 768}
        mock_ollama_client_class.return_value = mock_ollama_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        # Execute pipeline
        chunker = TextChunker(chunk_size=50, chunk_overlap=10)
        document_metadata = {
            'document_id': 'doc123',
            'title': 'Test Document',
            'category': 'report'
        }
        
        chunks = chunker.chunk_document_pages(sample_page_texts, document_metadata)
        
        # Verify metadata is preserved
        for chunk in chunks:
            assert 'metadata' in chunk
            assert chunk['metadata']['document_id'] == 'doc123'
            assert chunk['metadata']['title'] == 'Test Document'
            assert chunk['metadata']['category'] == 'report'
            assert 'page_number' in chunk['metadata']
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_embedding_batch_processing(
        self,
        mock_ollama_client_class,
        mock_chromadb_client_class,
        sample_chunks
    ):
        """Test that embeddings are generated for all chunks."""
        # Setup mocks
        mock_ollama_client = MagicMock()
        mock_ollama_client.embeddings.return_value = {'embedding': [0.1] * 768}
        mock_ollama_client_class.return_value = mock_ollama_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        # Execute
        embedding_service = EmbeddingService()
        embedded_chunks = embedding_service.embed_chunks(sample_chunks)
        
        # Verify
        assert len(embedded_chunks) == len(sample_chunks)
        assert mock_ollama_client.embeddings.call_count == len(sample_chunks)
        
        for original, embedded in zip(sample_chunks, embedded_chunks):
            assert embedded['text'] == original['text']
            assert 'embedding' in embedded
            assert len(embedded['embedding']) == 768
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_vector_store_chunk_ids(
        self,
        mock_ollama_client_class,
        mock_chromadb_client_class,
        sample_chunks,
        sample_embeddings
    ):
        """Test that vector store generates correct chunk IDs."""
        # Setup mocks
        mock_ollama_client = MagicMock()
        mock_ollama_client_class.return_value = mock_ollama_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        # Add embeddings to chunks
        for chunk, embedding in zip(sample_chunks, sample_embeddings):
            chunk['embedding'] = embedding
        
        # Execute
        vector_store = VectorStore()
        vector_store.add_documents(
            chunks=sample_chunks,
            document_id='doc123',
            document_title='Test Document'
        )
        
        # Verify chunk IDs
        call_args = mock_collection.add.call_args
        ids = call_args[1]['ids']
        
        assert len(ids) == len(sample_chunks)
        for i, chunk_id in enumerate(ids):
            assert chunk_id == f'doc123_chunk_{i}'
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    @patch('app.services.pdf_processor.requests.get')
    def test_pipeline_error_handling_pdf_download(
        self,
        mock_requests_get,
        mock_ollama_client_class,
        mock_chromadb_client_class
    ):
        """Test pipeline handles PDF download errors gracefully."""
        # Setup mock to fail
        mock_requests_get.side_effect = Exception('Network error')
        
        # Execute
        pdf_processor = PDFProcessor(max_retries=2)
        
        with pytest.raises(Exception) as exc_info:
            pdf_processor.process_pdf_from_url('http://example.com/test.pdf')
        
        assert 'Failed to download PDF' in str(exc_info.value)
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_pipeline_error_handling_embedding_failure(
        self,
        mock_ollama_client_class,
        mock_chromadb_client_class,
        sample_chunks
    ):
        """Test pipeline handles embedding failures gracefully."""
        # Setup mock to fail
        mock_ollama_client = MagicMock()
        mock_ollama_client.embeddings.side_effect = Exception('Ollama error')
        mock_ollama_client_class.return_value = mock_ollama_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        # Execute
        embedding_service = EmbeddingService()
        embedded_chunks = embedding_service.embed_chunks(sample_chunks)
        
        # Should return empty list when all fail
        assert len(embedded_chunks) == 0
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_pipeline_partial_embedding_failure(
        self,
        mock_ollama_client_class,
        mock_chromadb_client_class,
        sample_chunks
    ):
        """Test pipeline handles partial embedding failures."""
        # Setup mock to fail on second chunk
        mock_ollama_client = MagicMock()
        mock_ollama_client.embeddings.side_effect = [
            {'embedding': [0.1] * 768},
            Exception('Ollama error'),
            {'embedding': [0.3] * 768}
        ]
        mock_ollama_client_class.return_value = mock_ollama_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        # Execute
        embedding_service = EmbeddingService()
        embedded_chunks = embedding_service.embed_chunks(sample_chunks)
        
        # Should skip failed chunk
        assert len(embedded_chunks) == 2
        assert embedded_chunks[0]['chunk_index'] == 0
        assert embedded_chunks[1]['chunk_index'] == 2
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_chunk_overlap_functionality(
        self,
        mock_ollama_client_class,
        mock_chromadb_client_class
    ):
        """Test that chunk overlap works correctly in the pipeline."""
        # Setup mocks
        mock_ollama_client = MagicMock()
        mock_ollama_client_class.return_value = mock_ollama_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        # Create text that will be split into multiple chunks
        text = "First sentence. " * 20 + "Second sentence. " * 20
        
        # Execute with overlap
        chunker = TextChunker(chunk_size=30, chunk_overlap=10)
        chunks = chunker.create_chunks(text)
        
        # Verify overlap exists
        assert len(chunks) > 1
        
        # Check that chunks have reasonable sizes
        for chunk in chunks:
            assert chunk['token_count'] > 0
