"""Unit tests for vector store service."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from app.services.vector_store import VectorStore, VectorStoreError


class TestVectorStore:
    """Test suite for VectorStore class."""
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_initialization_success(self, mock_client_class):
        """Test VectorStore initialization."""
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore(collection_name='test_collection')
        
        assert store.collection_name == 'test_collection'
        assert store.collection is not None
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_add_documents_success(self, mock_client_class, sample_chunks, sample_embeddings):
        """Test adding documents to vector store."""
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client
        
        # Add embeddings to chunks
        for chunk, embedding in zip(sample_chunks, sample_embeddings):
            chunk['embedding'] = embedding
        
        store = VectorStore()
        count = store.add_documents(
            chunks=sample_chunks,
            document_id='doc123',
            document_title='Test Document'
        )
        
        assert count == len(sample_chunks)
        mock_collection.add.assert_called_once()
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_add_documents_empty_list(self, mock_client_class):
        """Test adding empty document list."""
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        count = store.add_documents(
            chunks=[],
            document_id='doc123',
            document_title='Test Document'
        )
        
        assert count == 0
        mock_collection.add.assert_not_called()
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_add_documents_missing_embeddings(self, mock_client_class, sample_chunks):
        """Test adding documents with missing embeddings."""
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client
        
        # Don't add embeddings to chunks
        store = VectorStore()
        
        with pytest.raises(VectorStoreError) as exc_info:
            store.add_documents(
                chunks=sample_chunks,
                document_id='doc123',
                document_title='Test Document'
            )
        
        assert 'No valid embeddings found' in str(exc_info.value)
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_add_documents_chromadb_error(self, mock_client_class, sample_chunks, sample_embeddings):
        """Test handling of ChromaDB errors during add."""
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_collection.add.side_effect = Exception('ChromaDB error')
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client
        
        # Add embeddings to chunks
        for chunk, embedding in zip(sample_chunks, sample_embeddings):
            chunk['embedding'] = embedding
        
        store = VectorStore()
        
        with pytest.raises(VectorStoreError) as exc_info:
            store.add_documents(
                chunks=sample_chunks,
                document_id='doc123',
                document_title='Test Document'
            )
        
        assert 'Failed to add documents' in str(exc_info.value)
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_search_success(self, mock_client_class, mock_chromadb_collection, sample_embedding):
        """Test successful similarity search."""
        mock_client = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_chromadb_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        results = store.search(query_embedding=sample_embedding, top_k=5)
        
        assert len(results) > 0
        assert all('id' in r for r in results)
        assert all('document' in r for r in results)
        assert all('metadata' in r for r in results)
        assert all('distance' in r for r in results)
        assert all('relevance' in r for r in results)
        mock_chromadb_collection.query.assert_called_once()
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_search_empty_embedding(self, mock_client_class, mock_chromadb_collection):
        """Test search with empty embedding."""
        mock_client = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_chromadb_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        
        with pytest.raises(VectorStoreError) as exc_info:
            store.search(query_embedding=[])
        
        assert 'Query embedding cannot be empty' in str(exc_info.value)
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_search_with_filters(self, mock_client_class, mock_chromadb_collection, sample_embedding):
        """Test search with metadata filters."""
        mock_client = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_chromadb_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        filter_metadata = {'document_id': 'doc123'}
        results = store.search(
            query_embedding=sample_embedding,
            top_k=3,
            filter_metadata=filter_metadata
        )
        
        assert len(results) > 0
        # Verify filter was passed to query
        call_args = mock_chromadb_collection.query.call_args
        assert call_args[1]['where'] == filter_metadata
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_search_no_results(self, mock_client_class, sample_embedding):
        """Test search with no results."""
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_collection.query.return_value = {'ids': [[]]}
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        results = store.search(query_embedding=sample_embedding)
        
        assert len(results) == 0
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_delete_document_success(self, mock_client_class, mock_chromadb_collection):
        """Test successful document deletion."""
        mock_client = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_chromadb_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        count = store.delete_document('doc123')
        
        assert count == 2  # Based on mock data
        mock_chromadb_collection.get.assert_called_once()
        mock_chromadb_collection.delete.assert_called_once()
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_delete_document_not_found(self, mock_client_class):
        """Test deleting non-existent document."""
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_collection.get.return_value = {'ids': []}
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        count = store.delete_document('nonexistent')
        
        assert count == 0
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_get_document_chunks_success(self, mock_client_class, mock_chromadb_collection):
        """Test retrieving document chunks."""
        mock_client = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_chromadb_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        chunks = store.get_document_chunks('doc1')
        
        assert len(chunks) > 0
        assert all('id' in chunk for chunk in chunks)
        assert all('text' in chunk for chunk in chunks)
        assert all('metadata' in chunk for chunk in chunks)
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_get_document_chunks_not_found(self, mock_client_class):
        """Test retrieving chunks for non-existent document."""
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_collection.get.return_value = {'ids': []}
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        chunks = store.get_document_chunks('nonexistent')
        
        assert len(chunks) == 0
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_count_documents(self, mock_client_class, mock_chromadb_collection):
        """Test counting documents in collection."""
        mock_client = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_chromadb_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        count = store.count_documents()
        
        assert count == 10  # Based on mock data
        mock_chromadb_collection.count.assert_called()
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_check_connection_success(self, mock_client_class, mock_chromadb_collection):
        """Test successful connection check."""
        mock_client = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_chromadb_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        result = store.check_connection()
        
        assert result is True
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_check_connection_failure(self, mock_client_class):
        """Test connection check failure."""
        mock_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.side_effect = Exception('Connection failed')
        mock_client.get_or_create_collection.return_value = mock_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        result = store.check_connection()
        
        assert result is False
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_clear_collection(self, mock_client_class, mock_chromadb_collection):
        """Test clearing collection."""
        mock_client = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_chromadb_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        result = store.clear_collection()
        
        assert result is True
        mock_chromadb_collection.get.assert_called_once()
        mock_chromadb_collection.delete.assert_called_once()
    
    @patch('app.services.vector_store.chromadb.PersistentClient')
    def test_relevance_score_calculation(self, mock_client_class, mock_chromadb_collection, sample_embedding):
        """Test that relevance scores are calculated correctly."""
        mock_client = MagicMock()
        mock_client.get_or_create_collection.return_value = mock_chromadb_collection
        mock_client_class.return_value = mock_client
        
        store = VectorStore()
        results = store.search(query_embedding=sample_embedding)
        
        # Relevance should be 1 - distance
        for result in results:
            expected_relevance = 1.0 - result['distance']
            assert abs(result['relevance'] - expected_relevance) < 0.001
