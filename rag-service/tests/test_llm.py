"""Unit tests for LLM service."""

import pytest
from unittest.mock import Mock, patch, MagicMock
from app.services.llm import LLMService, LLMError


class TestLLMService:
    """Test suite for LLMService class."""
    
    @patch('app.services.llm.ollama.Client')
    def test_initialization_default(self, mock_client_class):
        """Test LLMService initialization with default parameters."""
        service = LLMService()
        
        assert any(model in service.model for model in ['llama3.1', 'qwen2.5'])
        mock_client_class.assert_called_once()
    
    @patch('app.services.llm.ollama.Client')
    def test_initialization_custom(self, mock_client_class):
        """Test LLMService initialization with custom parameters."""
        service = LLMService(
            base_url='http://custom:11434',
            model='custom-model'
        )
        
        assert service.base_url == 'http://custom:11434'
        assert service.model == 'custom-model'
    
    def test_build_prompt_with_context(self, mock_ollama_client):
        """Test prompt building with context chunks."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            context_chunks = [
                {
                    'document': 'Roads Authority manages the national road network.',
                    'metadata': {'document_title': 'Annual Report'}
                },
                {
                    'document': 'Total budget was N$500 million in 2023.',
                    'metadata': {'document_title': 'Financial Report'}
                }
            ]
            
            prompt = service._build_prompt('What is the budget?', context_chunks)
            
            assert 'Roads Authority Namibia' in prompt
            assert 'What is the budget?' in prompt
            assert 'Annual Report' in prompt
            assert 'Financial Report' in prompt
            assert 'Roads Authority manages' in prompt
            assert 'N$500 million' in prompt
    
    def test_build_prompt_empty_context(self, mock_ollama_client):
        """Test prompt building with empty context."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            prompt = service._build_prompt('What is the budget?', [])
            
            assert 'What is the budget?' in prompt
            assert 'Roads Authority Namibia' in prompt
    
    def test_generate_answer_success(self, mock_ollama_client):
        """Test successful answer generation."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            context_chunks = [
                {
                    'document': 'The budget is N$500 million.',
                    'metadata': {'document_title': 'Report'}
                }
            ]
            
            answer = service.generate_answer('What is the budget?', context_chunks)
            
            assert isinstance(answer, str)
            assert len(answer) > 0
            mock_ollama_client.generate.assert_called_once()
    
    def test_generate_answer_empty_question(self, mock_ollama_client):
        """Test that empty question raises error."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            with pytest.raises(LLMError) as exc_info:
                service.generate_answer('', [])
            
            assert 'Question cannot be empty' in str(exc_info.value)
    
    def test_generate_answer_whitespace_question(self, mock_ollama_client):
        """Test that whitespace-only question raises error."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            with pytest.raises(LLMError) as exc_info:
                service.generate_answer('   \n\t  ', [])
            
            assert 'Question cannot be empty' in str(exc_info.value)
    
    def test_generate_answer_no_context(self, mock_ollama_client):
        """Test answer generation without context."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            # Should still work but log a warning
            answer = service.generate_answer('What is the budget?', [])
            
            assert isinstance(answer, str)
            assert len(answer) > 0
    
    def test_generate_answer_ollama_error(self, mock_ollama_client):
        """Test handling of Ollama API errors."""
        mock_ollama_client.generate.side_effect = Exception('Ollama connection failed')
        
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            with pytest.raises(LLMError) as exc_info:
                service.generate_answer('Test question', [])
            
            assert 'Answer generation failed' in str(exc_info.value)
    
    def test_generate_answer_no_response(self, mock_ollama_client):
        """Test handling when Ollama returns no response."""
        mock_ollama_client.generate.return_value = {}
        
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            with pytest.raises(LLMError) as exc_info:
                service.generate_answer('Test question', [])
            
            assert 'No answer generated from LLM' in str(exc_info.value)
    
    def test_generate_answer_custom_temperature(self, mock_ollama_client):
        """Test answer generation with custom temperature."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            context_chunks = [
                {
                    'document': 'Test content',
                    'metadata': {'document_title': 'Test'}
                }
            ]
            
            service.generate_answer(
                'Test question',
                context_chunks,
                temperature=0.5
            )
            
            # Check that temperature was passed
            call_args = mock_ollama_client.generate.call_args
            assert call_args[1]['options']['temperature'] == 0.5
    
    def test_generate_answer_custom_max_tokens(self, mock_ollama_client):
        """Test answer generation with custom max tokens."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            context_chunks = [
                {
                    'document': 'Test content',
                    'metadata': {'document_title': 'Test'}
                }
            ]
            
            service.generate_answer(
                'Test question',
                context_chunks,
                max_tokens=300
            )
            
            # Check that max_tokens was passed
            call_args = mock_ollama_client.generate.call_args
            assert call_args[1]['options']['num_predict'] == 300
    
    def test_generate_answer_streaming_success(self, mock_ollama_client):
        """Test successful streaming answer generation."""
        # Mock streaming response
        mock_ollama_client.generate.return_value = [
            {'response': 'This '},
            {'response': 'is '},
            {'response': 'a '},
            {'response': 'test.'}
        ]
        
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            context_chunks = [
                {
                    'document': 'Test content',
                    'metadata': {'document_title': 'Test'}
                }
            ]
            
            chunks = list(service.generate_answer_streaming('Test question', context_chunks))
            
            assert len(chunks) == 4
            assert ''.join(chunks) == 'This is a test.'
    
    def test_generate_answer_streaming_empty_question(self, mock_ollama_client):
        """Test that streaming with empty question raises error."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            with pytest.raises(LLMError) as exc_info:
                list(service.generate_answer_streaming('', []))
            
            assert 'Question cannot be empty' in str(exc_info.value)
    
    def test_check_connection_success(self, mock_ollama_client):
        """Test successful connection check."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            result = service.check_connection()
            
            assert result is True
            mock_ollama_client.list.assert_called_once()
    
    def test_check_connection_failure(self, mock_ollama_client):
        """Test connection check failure."""
        mock_ollama_client.list.side_effect = Exception('Connection failed')
        
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            result = service.check_connection()
            
            assert result is False
    
    def test_check_model_available_success(self, mock_ollama_client):
        """Test model availability check when model exists."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService(model='llama3.1')
            result = service.check_model_available()
            
            assert result is True
    
    def test_check_model_available_not_found(self, mock_ollama_client):
        """Test model availability check when model doesn't exist."""
        mock_ollama_client.list.return_value = {
            'models': [
                {'name': 'other-model:latest'}
            ]
        }
        
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService(model='missing-model')
            result = service.check_model_available()
            
            assert result is False
    
    def test_prompt_includes_system_instructions(self, mock_ollama_client):
        """Test that prompt includes system instructions."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            prompt = service._build_prompt('Test question', [])
            
            assert 'Roads Authority Namibia' in prompt
            assert 'helpful assistant' in prompt
            assert 'official documents' in prompt
    
    def test_prompt_includes_source_references(self, mock_ollama_client):
        """Test that prompt includes source references."""
        with patch('app.services.llm.ollama.Client', return_value=mock_ollama_client):
            service = LLMService()
            
            context_chunks = [
                {
                    'document': 'Content 1',
                    'metadata': {'document_title': 'Doc 1'}
                },
                {
                    'document': 'Content 2',
                    'metadata': {'document_title': 'Doc 2'}
                }
            ]
            
            prompt = service._build_prompt('Test question', context_chunks)
            
            assert '[Source 1: Doc 1]' in prompt
            assert '[Source 2: Doc 2]' in prompt
