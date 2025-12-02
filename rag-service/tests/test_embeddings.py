"""Unit tests for embedding generation service."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from app.services.embeddings import EmbeddingService, EmbeddingError


class TestEmbeddingService:
    """Test suite for EmbeddingService class."""
    
    @patch('app.services.embeddings.ollama.Client')
    def test_initialization_default(self, mock_client_class):
        """Test EmbeddingService initialization with default parameters."""
        service = EmbeddingService()
        
        assert service.model == 'nomic-embed-text:latest'
        mock_client_class.assert_called_once()
    
    @patch('app.services.embeddings.ollama.Client')
    def test_initialization_custom(self, mock_client_class):
        """Test EmbeddingService initialization with custom parameters."""
        service = EmbeddingService(
            base_url='http://custom:11434',
            model='custom-model'
        )
        
        assert service.base_url == 'http://custom:11434'
        assert service.model == 'custom-model'
    
    def test_generate_embedding_success(self, mock_ollama_client):
        """Test successful embedding generation."""
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            embedding = service.generate_embedding("Test text")
            
            assert isinstance(embedding, list)
            assert len(embedding) == 768
            assert all(isinstance(x, float) for x in embedding)
            mock_ollama_client.embeddings.assert_called_once()
    
    def test_generate_embedding_empty_text(self, mock_ollama_client):
        """Test that empty text raises error."""
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            
            with pytest.raises(EmbeddingError) as exc_info:
                service.generate_embedding("")
            
            assert 'Cannot generate embedding for empty text' in str(exc_info.value)
    
    def test_generate_embedding_whitespace_only(self, mock_ollama_client):
        """Test that whitespace-only text raises error."""
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            
            with pytest.raises(EmbeddingError) as exc_info:
                service.generate_embedding("   \n\t  ")
            
            assert 'Cannot generate embedding for empty text' in str(exc_info.value)
    
    def test_generate_embedding_ollama_error(self, mock_ollama_client):
        """Test handling of Ollama API errors."""
        mock_ollama_client.embeddings.side_effect = Exception('Ollama connection failed')
        
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            
            with pytest.raises(EmbeddingError) as exc_info:
                service.generate_embedding("Test text")
            
            assert 'Embedding generation failed' in str(exc_info.value)
    
    def test_generate_embedding_no_embedding_returned(self, mock_ollama_client):
        """Test handling when Ollama returns no embedding."""
        mock_ollama_client.embeddings.return_value = {}
        
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            
            with pytest.raises(EmbeddingError) as exc_info:
                service.generate_embedding("Test text")
            
            assert 'No embedding returned from Ollama' in str(exc_info.value)
    
    def test_generate_embeddings_batch_success(self, mock_ollama_client):
        """Test successful batch embedding generation."""
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            texts = ["Text 1", "Text 2", "Text 3"]
            
            embeddings = service.generate_embeddings_batch(texts)
            
            assert len(embeddings) == 3
            assert all(isinstance(emb, list) for emb in embeddings)
            assert mock_ollama_client.embeddings.call_count == 3
    
    def test_generate_embeddings_batch_empty_list(self, mock_ollama_client):
        """Test batch generation with empty list."""
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            embeddings = service.generate_embeddings_batch([])
            
            assert embeddings == []
            mock_ollama_client.embeddings.assert_not_called()
    
    def test_generate_embeddings_batch_partial_failure(self, mock_ollama_client):
        """Test batch generation with some failures."""
        # Make the second call fail
        mock_ollama_client.embeddings.side_effect = [
            {'embedding': [0.1] * 768},
            Exception('Failed'),
            {'embedding': [0.3] * 768}
        ]
        
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            texts = ["Text 1", "Text 2", "Text 3"]
            
            embeddings = service.generate_embeddings_batch(texts)
            
            assert len(embeddings) == 3
            assert embeddings[0] is not None
            assert embeddings[1] is None  # Failed
            assert embeddings[2] is not None
    
    def test_embed_chunks_success(self, mock_ollama_client, sample_chunks):
        """Test embedding chunks successfully."""
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            
            embedded_chunks = service.embed_chunks(sample_chunks)
            
            assert len(embedded_chunks) == len(sample_chunks)
            for chunk in embedded_chunks:
                assert 'embedding' in chunk
                assert isinstance(chunk['embedding'], list)
                assert len(chunk['embedding']) == 768
    
    def test_embed_chunks_empty_list(self, mock_ollama_client):
        """Test embedding empty chunk list."""
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            embedded_chunks = service.embed_chunks([])
            
            assert embedded_chunks == []
    
    def test_embed_chunks_with_failures(self, mock_ollama_client, sample_chunks):
        """Test embedding chunks with some failures."""
        # Make some calls fail
        mock_ollama_client.embeddings.side_effect = [
            {'embedding': [0.1] * 768},
            Exception('Failed'),
            {'embedding': [0.3] * 768}
        ]
        
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            
            embedded_chunks = service.embed_chunks(sample_chunks)
            
            # Should skip failed chunks
            assert len(embedded_chunks) == 2
            assert all('embedding' in chunk for chunk in embedded_chunks)
    
    def test_check_connection_success(self, mock_ollama_client):
        """Test successful connection check."""
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            result = service.check_connection()
            
            assert result is True
            mock_ollama_client.list.assert_called_once()
    
    def test_check_connection_failure(self, mock_ollama_client):
        """Test connection check failure."""
        mock_ollama_client.list.side_effect = Exception('Connection failed')
        
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            result = service.check_connection()
            
            assert result is False
    
    def test_check_model_available_success(self, mock_ollama_client):
        """Test model availability check when model exists."""
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService(model='nomic-embed-text:latest')
            result = service.check_model_available()
            
            assert result is True
    
    def test_check_model_available_not_found(self, mock_ollama_client):
        """Test model availability check when model doesn't exist."""
        mock_ollama_client.list.return_value = {
            'models': [
                {'name': 'other-model:latest'}
            ]
        }
        
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService(model='missing-model')
            result = service.check_model_available()
            
            assert result is False
    
    def test_check_model_available_error(self, mock_ollama_client):
        """Test model availability check with error."""
        mock_ollama_client.list.side_effect = Exception('API error')
        
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            result = service.check_model_available()
            
            assert result is False
    
    def test_embedding_dimension_consistency(self, mock_ollama_client):
        """Test that all embeddings have consistent dimensions."""
        with patch('app.services.embeddings.ollama.Client', return_value=mock_ollama_client):
            service = EmbeddingService()
            texts = ["Text 1", "Text 2", "Text 3"]
            
            embeddings = service.generate_embeddings_batch(texts)
            
            # All embeddings should have the same dimension
            dimensions = [len(emb) for emb in embeddings if emb is not None]
            assert len(set(dimensions)) == 1
            assert dimensions[0] == 768
