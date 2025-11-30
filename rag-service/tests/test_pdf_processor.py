"""Unit tests for PDF processing service."""

import pytest
from unittest.mock import Mock, patch, MagicMock
import requests
from app.services.pdf_processor import PDFProcessor, PDFProcessingError


class TestPDFProcessor:
    """Test suite for PDFProcessor class."""
    
    def test_initialization(self):
        """Test PDFProcessor initialization with default parameters."""
        processor = PDFProcessor()
        assert processor.max_retries == 3
        assert processor.timeout == 30
    
    def test_initialization_custom_params(self):
        """Test PDFProcessor initialization with custom parameters."""
        processor = PDFProcessor(max_retries=5, timeout=60)
        assert processor.max_retries == 5
        assert processor.timeout == 60
    
    @patch('app.services.pdf_processor.requests.get')
    def test_download_pdf_success(self, mock_get):
        """Test successful PDF download."""
        # Setup mock
        mock_response = Mock()
        mock_response.content = b'PDF content'
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test
        processor = PDFProcessor()
        result = processor.download_pdf('http://example.com/test.pdf')
        
        # Assertions
        assert result == b'PDF content'
        mock_get.assert_called_once_with('http://example.com/test.pdf', timeout=30)
    
    @patch('app.services.pdf_processor.requests.get')
    def test_download_pdf_retry_on_failure(self, mock_get):
        """Test PDF download retries on failure."""
        # Setup mock to fail twice then succeed
        mock_response = Mock()
        mock_response.content = b'PDF content'
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        
        mock_get.side_effect = [
            requests.exceptions.RequestException('Network error'),
            requests.exceptions.RequestException('Network error'),
            mock_response
        ]
        
        # Test
        processor = PDFProcessor(max_retries=3)
        result = processor.download_pdf('http://example.com/test.pdf')
        
        # Assertions
        assert result == b'PDF content'
        assert mock_get.call_count == 3
    
    @patch('app.services.pdf_processor.requests.get')
    def test_download_pdf_max_retries_exceeded(self, mock_get):
        """Test PDF download fails after max retries."""
        # Setup mock to always fail
        mock_get.side_effect = requests.exceptions.RequestException('Network error')
        
        # Test
        processor = PDFProcessor(max_retries=3)
        
        with pytest.raises(PDFProcessingError) as exc_info:
            processor.download_pdf('http://example.com/test.pdf')
        
        assert 'Failed to download PDF after 3 attempts' in str(exc_info.value)
        assert mock_get.call_count == 3
    
    def test_extract_text_from_pdf_success(self, temp_pdf_file):
        """Test successful text extraction from PDF."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Test
        processor = PDFProcessor()
        result = processor.extract_text_from_pdf(pdf_content)
        
        # Assertions
        assert 'text' in result
        assert 'num_pages' in result
        assert 'page_texts' in result
        assert result['num_pages'] > 0
        assert len(result['page_texts']) == result['num_pages']
        assert isinstance(result['text'], str)
    
    def test_extract_text_from_pdf_invalid_content(self):
        """Test text extraction fails with invalid PDF content."""
        processor = PDFProcessor()
        
        with pytest.raises(PDFProcessingError) as exc_info:
            processor.extract_text_from_pdf(b'Not a PDF')
        
        assert 'Failed to extract text from PDF' in str(exc_info.value)
    
    def test_extract_text_from_pdf_empty_content(self):
        """Test text extraction fails with empty content."""
        processor = PDFProcessor()
        
        with pytest.raises(PDFProcessingError):
            processor.extract_text_from_pdf(b'')
    
    @patch('app.services.pdf_processor.requests.get')
    def test_process_pdf_from_url_success(self, mock_get, temp_pdf_file):
        """Test complete PDF processing from URL."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test
        processor = PDFProcessor()
        result = processor.process_pdf_from_url('http://example.com/test.pdf')
        
        # Assertions
        assert 'text' in result
        assert 'num_pages' in result
        assert 'page_texts' in result
        assert 'source_url' in result
        assert result['source_url'] == 'http://example.com/test.pdf'
    
    @patch('app.services.pdf_processor.requests.get')
    def test_process_pdf_from_url_download_failure(self, mock_get):
        """Test PDF processing fails when download fails."""
        # Setup mock to fail
        mock_get.side_effect = requests.exceptions.RequestException('Network error')
        
        # Test
        processor = PDFProcessor(max_retries=2)
        
        with pytest.raises(PDFProcessingError) as exc_info:
            processor.process_pdf_from_url('http://example.com/test.pdf')
        
        assert 'Failed to download PDF' in str(exc_info.value)
    
    def test_extract_text_preserves_page_structure(self, temp_pdf_file):
        """Test that page structure is preserved during extraction."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Test
        processor = PDFProcessor()
        result = processor.extract_text_from_pdf(pdf_content)
        
        # Assertions
        assert len(result['page_texts']) > 0
        for page_info in result['page_texts']:
            assert 'page_number' in page_info
            assert 'text' in page_info
            assert isinstance(page_info['page_number'], int)
            assert page_info['page_number'] > 0
