"""PDF processing service for extracting text from PDF documents."""

import logging
import tempfile
from pathlib import Path
from typing import Optional, Dict, Any
import requests
from PyPDF2 import PdfReader

logger = logging.getLogger(__name__)


class PDFProcessingError(Exception):
    """Custom exception for PDF processing errors."""
    pass


class PDFProcessor:
    """Service for downloading and extracting text from PDF documents."""
    
    def __init__(self, max_retries: int = 3, timeout: int = 30):
        """
        Initialize the PDF processor.
        
        Args:
            max_retries: Maximum number of download retry attempts
            timeout: Request timeout in seconds
        """
        self.max_retries = max_retries
        self.timeout = timeout
    
    def download_pdf(self, url: str) -> bytes:
        """
        Download PDF from URL with retry logic.
        
        Args:
            url: URL of the PDF document
            
        Returns:
            PDF content as bytes
            
        Raises:
            PDFProcessingError: If download fails after retries
        """
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                logger.info(f"Downloading PDF from {url} (attempt {attempt + 1}/{self.max_retries})")
                response = requests.get(url, timeout=self.timeout)
                response.raise_for_status()
                
                # Verify content type
                content_type = response.headers.get('content-type', '').lower()
                if 'pdf' not in content_type and not url.lower().endswith('.pdf'):
                    logger.warning(f"Content type is {content_type}, but proceeding with download")
                
                logger.info(f"Successfully downloaded PDF ({len(response.content)} bytes)")
                return response.content
                
            except Exception as e:
                last_error = e
                logger.warning(f"Download attempt {attempt + 1} failed: {str(e)}")
                if attempt < self.max_retries - 1:
                    # Exponential backoff
                    import time
                    time.sleep(2 ** attempt)
        
        raise PDFProcessingError(f"Failed to download PDF after {self.max_retries} attempts: {str(last_error)}")
    
    def extract_text_from_pdf(self, pdf_content: bytes) -> Dict[str, Any]:
        """
        Extract text content from PDF bytes.
        
        Args:
            pdf_content: PDF file content as bytes
            
        Returns:
            Dictionary containing:
                - text: Extracted text content
                - num_pages: Number of pages in the PDF
                - page_texts: List of text per page
                
        Raises:
            PDFProcessingError: If text extraction fails
        """
        try:
            # Write PDF content to temporary file
            with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as temp_file:
                temp_file.write(pdf_content)
                temp_path = temp_file.name
            
            try:
                # Read PDF using PyPDF2
                reader = PdfReader(temp_path)
                num_pages = len(reader.pages)
                
                logger.info(f"Processing PDF with {num_pages} pages")
                
                # Extract text from each page
                page_texts = []
                for page_num, page in enumerate(reader.pages, start=1):
                    try:
                        text = page.extract_text()
                        if text:
                            page_texts.append({
                                'page_number': page_num,
                                'text': text.strip()
                            })
                            logger.debug(f"Extracted {len(text)} characters from page {page_num}")
                    except Exception as e:
                        logger.warning(f"Failed to extract text from page {page_num}: {str(e)}")
                        page_texts.append({
                            'page_number': page_num,
                            'text': ''
                        })
                
                # Combine all page texts
                full_text = '\n\n'.join([p['text'] for p in page_texts if p['text']])
                
                if not full_text.strip():
                    raise PDFProcessingError("No text content extracted from PDF")
                
                logger.info(f"Successfully extracted {len(full_text)} characters from {num_pages} pages")
                
                return {
                    'text': full_text,
                    'num_pages': num_pages,
                    'page_texts': page_texts
                }
                
            finally:
                # Clean up temporary file
                Path(temp_path).unlink(missing_ok=True)
                
        except PDFProcessingError:
            raise
        except Exception as e:
            raise PDFProcessingError(f"Failed to extract text from PDF: {str(e)}")
    
    def process_pdf_from_url(self, url: str) -> Dict[str, Any]:
        """
        Download and extract text from PDF in one operation.
        
        Args:
            url: URL of the PDF document
            
        Returns:
            Dictionary containing extracted text and metadata
            
        Raises:
            PDFProcessingError: If processing fails
        """
        logger.info(f"Starting PDF processing for URL: {url}")
        
        # Download PDF
        pdf_content = self.download_pdf(url)
        
        # Extract text
        result = self.extract_text_from_pdf(pdf_content)
        result['source_url'] = url
        
        logger.info(f"PDF processing complete: {result['num_pages']} pages, {len(result['text'])} characters")
        
        return result
