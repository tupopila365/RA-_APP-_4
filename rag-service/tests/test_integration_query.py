"""Integration tests for the full query pipeline."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStore
from app.services.llm import LLMService


class TestQueryPipeline:
    """Integration tests for the complete query processing pipeline."""
    
    def test_full_query_pipeline(self, mock_ollama_client, mock_chromadb_collection):
        """Test the complete query pipeline from question to answer."""
        # Setup mocks using fixtures
        # 1. Embedding service - mock is already configured in fixture
        # 2. Vector store - configure collection mock
        mock_chromadb_collection.count.return_value = 10
        mock_chromadb_collection.query.return_value = {
            'ids': [['doc1_chunk_0', 'doc1_chunk_1', 'doc1_chunk_2']],
            'documents': [[
                'Roads Authority manages the national road network.',
                'Total budget was N$500 million in 2023.',
                'We completed 150km of road rehabilitation.'
            ]],
            'metadatas': [[
                {'document_id': 'doc1', 'document_title': 'Annual Report', 'chunk_index': 0},
                {'document_id': 'doc1', 'document_title': 'Annual Report', 'chunk_index': 1},
                {'document_id': 'doc1', 'document_title': 'Annual Report', 'chunk_index': 2}
            ]],
            'distances': [[0.2, 0.3, 0.4]]
        }
        
        # Execute pipeline with patched services
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            with patch('app.services.vector_store.chromadb.PersistentClient') as mock_chromadb_client_class:
                mock_chromadb_client = MagicMock()
                mock_chromadb_client.get_or_create_collection.return_value = mock_chromadb_collection
                mock_chromadb_client_class.return_value = mock_chromadb_client
                
                with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
                    # Step 1: Generate embedding for question
                    embedding_service = EmbeddingService()
                    question = "What was the budget in 2023?"
                    question_embedding = embedding_service.generate_embedding(question)
                    
                    assert len(question_embedding) == 768
                    
                    # Step 2: Search for relevant chunks
                    vector_store = VectorStore()
                    search_results = vector_store.search(question_embedding, top_k=5)
                    
                    assert len(search_results) > 0
                    assert all('document' in r for r in search_results)
                    assert all('metadata' in r for r in search_results)
                    
                    # Step 3: Generate answer using LLM
                    llm_service = LLMService()
                    answer = llm_service.generate_answer(question, search_results)
                    
                    assert isinstance(answer, str)
                    assert len(answer) > 0
                    
                    # Verify all components were called
                    mock_ollama_client.embeddings.assert_called()
                    mock_chromadb_collection.query.assert_called_once()
                    mock_ollama_client.generate.assert_called_once()
    
    @patch('app.services.llm.ollama.Client')
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_query_with_no_results(
        self,
        mock_embedding_client_class,
        mock_chromadb_client_class,
        mock_llm_client_class
    ):
        """Test query pipeline when no relevant documents are found."""
        # Setup mocks
        mock_embedding_client = MagicMock()
        mock_embedding_client.embeddings.return_value = {'embedding': [0.1] * 768}
        mock_embedding_client_class.return_value = mock_embedding_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 0
        mock_collection.query.return_value = {'ids': [[]]}
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        mock_llm_client = MagicMock()
        mock_llm_client.generate.return_value = {
            'response': 'I cannot find information about that in the documents.'
        }
        mock_llm_client_class.return_value = mock_llm_client
        
        # Execute
        embedding_service = EmbeddingService()
        question_embedding = embedding_service.generate_embedding("What is the weather?")
        
        vector_store = VectorStore()
        search_results = vector_store.search(question_embedding, top_k=5)
        
        assert len(search_results) == 0
        
        # LLM should still generate a response (saying it doesn't know)
        llm_service = LLMService()
        answer = llm_service.generate_answer("What is the weather?", search_results)
        
        assert isinstance(answer, str)
        assert len(answer) > 0
    
    @patch('app.services.llm.ollama.Client')
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_query_relevance_ranking(
        self,
        mock_embedding_client_class,
        mock_chromadb_client_class,
        mock_llm_client_class
    ):
        """Test that search results are ranked by relevance."""
        # Setup mocks
        mock_embedding_client = MagicMock()
        mock_embedding_client.embeddings.return_value = {'embedding': [0.1] * 768}
        mock_embedding_client_class.return_value = mock_embedding_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 10
        # Return results with different distances (lower = more relevant)
        mock_collection.query.return_value = {
            'ids': [['chunk1', 'chunk2', 'chunk3']],
            'documents': [['Doc 1', 'Doc 2', 'Doc 3']],
            'metadatas': [[
                {'document_id': 'doc1', 'document_title': 'Test 1'},
                {'document_id': 'doc2', 'document_title': 'Test 2'},
                {'document_id': 'doc3', 'document_title': 'Test 3'}
            ]],
            'distances': [[0.1, 0.3, 0.5]]  # Ascending order (most to least relevant)
        }
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        mock_llm_client = MagicMock()
        mock_llm_client_class.return_value = mock_llm_client
        
        # Execute
        embedding_service = EmbeddingService()
        question_embedding = embedding_service.generate_embedding("Test question")
        
        vector_store = VectorStore()
        search_results = vector_store.search(question_embedding, top_k=3)
        
        # Verify results are in order of relevance
        assert len(search_results) == 3
        assert search_results[0]['distance'] < search_results[1]['distance']
        assert search_results[1]['distance'] < search_results[2]['distance']
        
        # Verify relevance scores are calculated correctly
        for result in search_results:
            expected_relevance = 1.0 - result['distance']
            assert abs(result['relevance'] - expected_relevance) < 0.001
    
    @patch('app.services.llm.ollama.Client')
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_query_top_k_parameter(
        self,
        mock_embedding_client_class,
        mock_chromadb_client_class,
        mock_llm_client_class
    ):
        """Test that top_k parameter controls number of results."""
        # Setup mocks
        mock_embedding_client = MagicMock()
        mock_embedding_client.embeddings.return_value = {'embedding': [0.1] * 768}
        mock_embedding_client_class.return_value = mock_embedding_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 10
        mock_collection.query.return_value = {
            'ids': [['chunk1', 'chunk2']],
            'documents': [['Doc 1', 'Doc 2']],
            'metadatas': [[
                {'document_id': 'doc1', 'document_title': 'Test 1'},
                {'document_id': 'doc2', 'document_title': 'Test 2'}
            ]],
            'distances': [[0.1, 0.2]]
        }
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        mock_llm_client = MagicMock()
        mock_llm_client_class.return_value = mock_llm_client
        
        # Execute with top_k=2
        embedding_service = EmbeddingService()
        question_embedding = embedding_service.generate_embedding("Test question")
        
        vector_store = VectorStore()
        search_results = vector_store.search(question_embedding, top_k=2)
        
        # Verify top_k was passed to ChromaDB
        call_args = mock_collection.query.call_args
        assert call_args[1]['n_results'] == 2
        
        assert len(search_results) == 2
    
    @patch('app.services.llm.ollama.Client')
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_query_context_assembly(
        self,
        mock_embedding_client_class,
        mock_chromadb_client_class,
        mock_llm_client_class
    ):
        """Test that context is properly assembled for LLM."""
        # Setup mocks
        mock_embedding_client = MagicMock()
        mock_embedding_client.embeddings.return_value = {'embedding': [0.1] * 768}
        mock_embedding_client_class.return_value = mock_embedding_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 10
        mock_collection.query.return_value = {
            'ids': [['chunk1', 'chunk2']],
            'documents': [['Context 1', 'Context 2']],
            'metadatas': [[
                {'document_id': 'doc1', 'document_title': 'Report 1'},
                {'document_id': 'doc2', 'document_title': 'Report 2'}
            ]],
            'distances': [[0.1, 0.2]]
        }
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        mock_llm_client = MagicMock()
        mock_llm_client.generate.return_value = {'response': 'Test answer'}
        mock_llm_client_class.return_value = mock_llm_client
        
        # Execute
        embedding_service = EmbeddingService()
        question_embedding = embedding_service.generate_embedding("Test question")
        
        vector_store = VectorStore()
        search_results = vector_store.search(question_embedding, top_k=2)
        
        llm_service = LLMService()
        answer = llm_service.generate_answer("Test question", search_results)
        
        # Verify prompt includes context
        call_args = mock_llm_client.generate.call_args
        prompt = call_args[1]['prompt']
        
        assert 'Context 1' in prompt
        assert 'Context 2' in prompt
        assert 'Report 1' in prompt
        assert 'Report 2' in prompt
        assert 'Test question' in prompt
    
    def test_query_error_handling_embedding_failure(self):
        """Test query pipeline handles embedding failures."""
        from app.services.embeddings import EmbeddingError
        
        # Setup mock to fail
        mock_embedding_client = MagicMock()
        mock_embedding_client.embeddings.side_effect = Exception('Ollama error')
        
        # Execute with patched client
        with patch('app.services.embeddings.ollama.Client', return_value=mock_embedding_client):
            embedding_service = EmbeddingService()
            
            with pytest.raises(EmbeddingError) as exc_info:
                embedding_service.generate_embedding("Test question")
            
            assert 'Embedding generation failed' in str(exc_info.value)
    
    @patch('app.services.llm.ollama.Client')
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_query_error_handling_llm_failure(
        self,
        mock_embedding_client_class,
        mock_chromadb_client_class,
        mock_llm_client_class
    ):
        """Test query pipeline handles LLM failures."""
        # Setup mocks
        mock_embedding_client = MagicMock()
        mock_embedding_client.embeddings.return_value = {'embedding': [0.1] * 768}
        mock_embedding_client_class.return_value = mock_embedding_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 10
        mock_collection.query.return_value = {
            'ids': [['chunk1']],
            'documents': [['Context']],
            'metadatas': [[{'document_id': 'doc1', 'document_title': 'Test'}]],
            'distances': [[0.1]]
        }
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        # Setup LLM to fail
        mock_llm_client = MagicMock()
        mock_llm_client.generate.side_effect = Exception('LLM error')
        mock_llm_client_class.return_value = mock_llm_client
        
        # Execute
        embedding_service = EmbeddingService()
        question_embedding = embedding_service.generate_embedding("Test question")
        
        vector_store = VectorStore()
        search_results = vector_store.search(question_embedding)
        
        llm_service = LLMService()
        
        with pytest.raises(Exception) as exc_info:
            llm_service.generate_answer("Test question", search_results)
        
        assert 'Answer generation failed' in str(exc_info.value)
    
    @patch('app.services.llm.ollama.Client')
    @patch('app.services.vector_store.chromadb.PersistentClient')
    @patch('app.services.embeddings.ollama.Client')
    def test_query_metadata_filtering(
        self,
        mock_embedding_client_class,
        mock_chromadb_client_class,
        mock_llm_client_class
    ):
        """Test query pipeline with metadata filtering."""
        # Setup mocks
        mock_embedding_client = MagicMock()
        mock_embedding_client.embeddings.return_value = {'embedding': [0.1] * 768}
        mock_embedding_client_class.return_value = mock_embedding_client
        
        mock_chromadb_client = MagicMock()
        mock_collection = MagicMock()
        mock_collection.count.return_value = 10
        mock_collection.query.return_value = {
            'ids': [['chunk1']],
            'documents': [['Filtered content']],
            'metadatas': [[{'document_id': 'doc1', 'document_title': 'Specific Doc'}]],
            'distances': [[0.1]]
        }
        mock_chromadb_client.get_or_create_collection.return_value = mock_collection
        mock_chromadb_client_class.return_value = mock_chromadb_client
        
        mock_llm_client = MagicMock()
        mock_llm_client_class.return_value = mock_llm_client
        
        # Execute with filter
        embedding_service = EmbeddingService()
        question_embedding = embedding_service.generate_embedding("Test question")
        
        vector_store = VectorStore()
        filter_metadata = {'document_id': 'doc1'}
        search_results = vector_store.search(
            question_embedding,
            top_k=5,
            filter_metadata=filter_metadata
        )
        
        # Verify filter was applied
        call_args = mock_collection.query.call_args
        assert call_args[1]['where'] == filter_metadata
        
        assert len(search_results) > 0
