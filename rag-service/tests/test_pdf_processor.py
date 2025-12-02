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


class TestURLFormatHandling:
    """Test suite for backward compatibility with various URL formats."""
    
    @patch('app.services.pdf_processor.requests.get')
    def test_handles_basic_cloudinary_url(self, mock_get, temp_pdf_file):
        """Test handling of basic Cloudinary URL format."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test with basic Cloudinary URL
        url = 'https://res.cloudinary.com/demo/raw/upload/sample.pdf'
        processor = PDFProcessor()
        result = processor.download_pdf(url)
        
        # Assertions
        assert result == pdf_content
        # Verify the exact URL was passed to requests.get
        mock_get.assert_called_once_with(url, timeout=30)
    
    @patch('app.services.pdf_processor.requests.get')
    def test_handles_signed_cloudinary_url(self, mock_get, temp_pdf_file):
        """Test handling of signed Cloudinary URL with query parameters."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test with signed URL containing query parameters
        url = 'https://res.cloudinary.com/demo/raw/upload/sample.pdf?s=abc123&expires=1234567890'
        processor = PDFProcessor()
        result = processor.download_pdf(url)
        
        # Assertions
        assert result == pdf_content
        # Verify the complete URL with query parameters was passed
        mock_get.assert_called_once_with(url, timeout=30)
    
    @patch('app.services.pdf_processor.requests.get')
    def test_handles_url_with_multiple_query_params(self, mock_get, temp_pdf_file):
        """Test handling of URL with multiple query parameters."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test with URL containing multiple query parameters
        url = 'https://res.cloudinary.com/demo/raw/upload/v1234567890/folder/sample.pdf?s=signature&expires=1234567890&api_key=test123'
        processor = PDFProcessor()
        result = processor.download_pdf(url)
        
        # Assertions
        assert result == pdf_content
        # Verify all query parameters are preserved
        mock_get.assert_called_once_with(url, timeout=30)
    
    @patch('app.services.pdf_processor.requests.get')
    def test_handles_url_with_version_number(self, mock_get, temp_pdf_file):
        """Test handling of Cloudinary URL with version number."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test with versioned URL
        url = 'https://res.cloudinary.com/demo/raw/upload/v1234567890/sample.pdf'
        processor = PDFProcessor()
        result = processor.download_pdf(url)
        
        # Assertions
        assert result == pdf_content
        mock_get.assert_called_once_with(url, timeout=30)
    
    @patch('app.services.pdf_processor.requests.get')
    def test_handles_url_with_folder_structure(self, mock_get, temp_pdf_file):
        """Test handling of Cloudinary URL with folder structure."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test with folder structure in URL
        url = 'https://res.cloudinary.com/demo/raw/upload/documents/tenders/2024/sample.pdf'
        processor = PDFProcessor()
        result = processor.download_pdf(url)
        
        # Assertions
        assert result == pdf_content
        mock_get.assert_called_once_with(url, timeout=30)
    
    @patch('app.services.pdf_processor.requests.get')
    def test_handles_authenticated_url_format(self, mock_get, temp_pdf_file):
        """Test handling of authenticated Cloudinary URL format."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test with authenticated URL format
        url = 'https://res.cloudinary.com/demo/raw/authenticated/sample.pdf'
        processor = PDFProcessor()
        result = processor.download_pdf(url)
        
        # Assertions
        assert result == pdf_content
        mock_get.assert_called_once_with(url, timeout=30)
    
    @patch('app.services.pdf_processor.requests.get')
    def test_handles_url_with_special_characters(self, mock_get, temp_pdf_file):
        """Test handling of URL with special characters in filename."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test with URL containing encoded special characters
        url = 'https://res.cloudinary.com/demo/raw/upload/document%20with%20spaces.pdf'
        processor = PDFProcessor()
        result = processor.download_pdf(url)
        
        # Assertions
        assert result == pdf_content
        mock_get.assert_called_once_with(url, timeout=30)
    
    @patch('app.services.pdf_processor.requests.get')
    def test_handles_secure_url_format(self, mock_get, temp_pdf_file):
        """Test handling of secure (https) Cloudinary URL."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test with secure URL
        url = 'https://res.cloudinary.com/demo/raw/upload/sample.pdf'
        processor = PDFProcessor()
        result = processor.download_pdf(url)
        
        # Assertions
        assert result == pdf_content
        mock_get.assert_called_once_with(url, timeout=30)
    
    @patch('app.services.pdf_processor.requests.get')
    def test_preserves_query_string_order(self, mock_get, temp_pdf_file):
        """Test that query string parameter order is preserved."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test with specific query parameter order
        url = 'https://res.cloudinary.com/demo/raw/upload/sample.pdf?param1=value1&param2=value2&param3=value3'
        processor = PDFProcessor()
        result = processor.download_pdf(url)
        
        # Assertions
        assert result == pdf_content
        # Verify exact URL was passed (preserving order)
        called_url = mock_get.call_args[0][0]
        assert called_url == url
    
    @patch('app.services.pdf_processor.requests.get')
    def test_handles_url_with_fragment(self, mock_get, temp_pdf_file):
        """Test handling of URL with fragment identifier."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test with URL containing fragment
        url = 'https://res.cloudinary.com/demo/raw/upload/sample.pdf#page=1'
        processor = PDFProcessor()
        result = processor.download_pdf(url)
        
        # Assertions
        assert result == pdf_content
        mock_get.assert_called_once_with(url, timeout=30)
    
    @patch('app.services.pdf_processor.requests.get')
    def test_process_pdf_from_url_preserves_url_format(self, mock_get, temp_pdf_file):
        """Test that complete PDF processing preserves URL format in result."""
        # Read the temp PDF file
        with open(temp_pdf_file, 'rb') as f:
            pdf_content = f.read()
        
        # Setup mock
        mock_response = Mock()
        mock_response.content = pdf_content
        mock_response.headers = {'content-type': 'application/pdf'}
        mock_response.raise_for_status = Mock()
        mock_get.return_value = mock_response
        
        # Test with signed URL
        url = 'https://res.cloudinary.com/demo/raw/upload/sample.pdf?s=signature&expires=1234567890'
        processor = PDFProcessor()
        result = processor.process_pdf_from_url(url)
        
        # Assertions
        assert result['source_url'] == url
        # Verify the exact URL was used for download
        mock_get.assert_called_once_with(url, timeout=30)
