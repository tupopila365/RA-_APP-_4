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
    
    def __init__(self, message: str, error_code: Optional[str] = None, status_code: Optional[int] = None):
        """
        Initialize PDF processing error.
        
        Args:
            message: Error message
            error_code: Specific error code for categorization
            status_code: HTTP status code if applicable
        """
        super().__init__(message)
        self.error_code = error_code
        self.status_code = status_code


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
    
    def download_pdf(self, url: str, document_id: Optional[str] = None) -> bytes:
        """
        Download PDF from URL with retry logic.
        
        Args:
            url: URL of the PDF document
            document_id: Optional document ID for logging context
            
        Returns:
            PDF content as bytes
            
        Raises:
            PDFProcessingError: If download fails after retries
        """
        last_error = None
        last_status_code = None
        
        for attempt in range(self.max_retries):
            try:
                logger.info(f"Downloading PDF from {url} (attempt {attempt + 1}/{self.max_retries})")
                
                # Add User-Agent header to prevent Cloudinary from blocking bot requests
                headers = {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
                
                response = requests.get(url, timeout=self.timeout, headers=headers)
                response.raise_for_status()
                
                # Verify content type
                content_type = response.headers.get('content-type', '').lower()
                if 'pdf' not in content_type and not url.lower().endswith('.pdf'):
                    logger.warning(f"Content type is {content_type}, but proceeding with download")
                
                logger.info(f"Successfully downloaded PDF ({len(response.content)} bytes)")
                return response.content
                
            except requests.exceptions.HTTPError as e:
                last_error = e
                last_status_code = e.response.status_code if e.response else None
                
                # Handle authentication errors (401 and 403) - do not retry
                if last_status_code == 401:
                    error_msg = (
                        f"Authentication required to access PDF. "
                        f"The URL requires valid credentials or authentication. "
                        f"URL: {url}"
                    )
                    if document_id:
                        error_msg += f" | Document ID: {document_id}"
                    
                    logger.error(
                        f"{error_msg} | "
                        f"Skipping retry attempts - authentication errors require configuration changes, not retries"
                    )
                    raise PDFProcessingError(
                        "PDF download failed: Authentication required. "
                        "Check Cloudinary access settings or ensure the URL is publicly accessible.",
                        error_code="AUTH_REQUIRED",
                        status_code=401
                    )
                
                elif last_status_code == 403:
                    error_msg = (
                        f"Access forbidden for PDF. "
                        f"The credentials or permissions are insufficient. "
                        f"URL: {url}"
                    )
                    if document_id:
                        error_msg += f" | Document ID: {document_id}"
                    
                    logger.error(
                        f"{error_msg} | "
                        f"Skipping retry attempts - permission errors require configuration changes, not retries"
                    )
                    raise PDFProcessingError(
                        "PDF download failed: Access forbidden. "
                        "Check Cloudinary permissions and access settings.",
                        error_code="ACCESS_FORBIDDEN",
                        status_code=403
                    )
                
                # For other HTTP errors, log and potentially retry
                logger.warning(
                    f"Download attempt {attempt + 1} failed with HTTP {last_status_code}: {str(e)}"
                )
                
                # Don't retry on 4xx errors (except 401/403 which are already handled)
                if last_status_code is not None and 400 <= last_status_code < 500:
                    logger.error(
                        f"Client error (HTTP {last_status_code}) - skipping retry attempts"
                    )
                    raise PDFProcessingError(
                        f"PDF download failed with HTTP {last_status_code}: {str(e)}",
                        error_code="HTTP_CLIENT_ERROR",
                        status_code=last_status_code
                    )
                
                # Retry on 5xx errors (server errors) or unknown status codes
                if attempt < self.max_retries - 1:
                    backoff_seconds = 2 ** attempt
                    status_msg = f"HTTP {last_status_code}" if last_status_code else "unknown status"
                    logger.info(
                        f"Server error ({status_msg}) - will retry after {backoff_seconds}s "
                        f"(attempt {attempt + 2}/{self.max_retries})"
                    )
                    import time
                    time.sleep(backoff_seconds)
                    
            except requests.exceptions.RequestException as e:
                # Network errors, timeouts, etc.
                last_error = e
                logger.warning(f"Download attempt {attempt + 1} failed with network error: {str(e)}")
                
                if attempt < self.max_retries - 1:
                    # Exponential backoff for network errors
                    backoff_seconds = 2 ** attempt
                    logger.info(
                        f"Network error - will retry after {backoff_seconds}s "
                        f"(attempt {attempt + 2}/{self.max_retries})"
                    )
                    import time
                    time.sleep(backoff_seconds)
                    
            except Exception as e:
                # Unexpected errors
                last_error = e
                logger.error(f"Download attempt {attempt + 1} failed with unexpected error: {str(e)}")
                
                if attempt < self.max_retries - 1:
                    import time
                    time.sleep(2 ** attempt)
        
        # If we exhausted all retries
        error_msg = f"Failed to download PDF after {self.max_retries} attempts: {str(last_error)}"
        if last_status_code:
            error_msg = f"Failed to download PDF after {self.max_retries} attempts (HTTP {last_status_code}): {str(last_error)}"
        
        raise PDFProcessingError(
            error_msg,
            error_code="DOWNLOAD_FAILED",
            status_code=last_status_code
        )
    
    def extract_text_from_pdf(self, pdf_content: bytes, document_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Extract text content from PDF bytes.
        
        Args:
            pdf_content: PDF file content as bytes
            document_id: Optional document ID for logging context
            
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
                
                log_context = f"Processing PDF with {num_pages} pages"
                if document_id:
                    log_context += f" | Document ID: {document_id}"
                logger.info(log_context)
                
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
                        error_msg = f"Failed to extract text from page {page_num}: {str(e)}"
                        if document_id:
                            error_msg += f" | Document ID: {document_id}"
                        logger.warning(error_msg)
                        page_texts.append({
                            'page_number': page_num,
                            'text': ''
                        })
                
                # Combine all page texts
                full_text = '\n\n'.join([p['text'] for p in page_texts if p['text']])
                
                if not full_text.strip():
                    error_msg = "No text content extracted from PDF"
                    if document_id:
                        error_msg += f" | Document ID: {document_id}"
                    logger.error(error_msg)
                    raise PDFProcessingError(
                        "No text content extracted from PDF",
                        error_code="NO_TEXT_EXTRACTED"
                    )
                
                success_msg = f"Successfully extracted {len(full_text)} characters from {num_pages} pages"
                if document_id:
                    success_msg += f" | Document ID: {document_id}"
                logger.info(success_msg)
                
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
            error_msg = f"Failed to extract text from PDF: {str(e)}"
            if document_id:
                error_msg += f" | Document ID: {document_id}"
            logger.error(error_msg)
            raise PDFProcessingError(
                f"Failed to extract text from PDF: {str(e)}",
                error_code="TEXT_EXTRACTION_FAILED"
            )
    
    def process_pdf_from_url(self, url: str, document_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Download and extract text from PDF in one operation.
        
        Args:
            url: URL of the PDF document
            document_id: Optional document ID for logging context
            
        Returns:
            Dictionary containing extracted text and metadata
            
        Raises:
            PDFProcessingError: If processing fails
        """
        log_context = f"URL: {url}"
        if document_id:
            log_context += f" | Document ID: {document_id}"
        
        logger.info(f"Starting PDF processing for {log_context}")
        
        # Download PDF
        pdf_content = self.download_pdf(url, document_id=document_id)
        
        # Extract text
        result = self.extract_text_from_pdf(pdf_content, document_id=document_id)
        result['source_url'] = url
        if document_id:
            result['document_id'] = document_id
        
        logger.info(
            f"PDF processing complete: {result['num_pages']} pages, "
            f"{len(result['text'])} characters | {log_context}"
        )
        
        return result
