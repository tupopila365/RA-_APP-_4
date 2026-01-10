#!/usr/bin/env python3
"""Script to index all PDF files from the data/documents folder."""

import sys
import os
import logging
from pathlib import Path
import time

# Add the app directory to the path
sys.path.insert(0, str(Path(__file__).parent))

from app.services.pdf_processor import PDFProcessor
from app.services.embeddings import EmbeddingService
from app.services.vector_store import VectorStore
from app.utils.chunking import TextChunker
from app.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def index_local_pdf(pdf_path: str, document_id: str, title: str):
    """
    Index a local PDF file into ChromaDB.
    
    Args:
        pdf_path: Path to the PDF file
        document_id: Unique identifier for the document
        title: Title of the document
        
    Returns:
        tuple: (success: bool, chunks_indexed: int)
    """
    pdf_path = Path(pdf_path)
    
    if not pdf_path.exists():
        logger.error(f"PDF file not found: {pdf_path}")
        return False, 0
    
    if not pdf_path.suffix.lower() == '.pdf':
        logger.error(f"File is not a PDF: {pdf_path}")
        return False, 0
    
    logger.info("=" * 80)
    logger.info(f"Indexing local PDF: {pdf_path.name}")
    logger.info(f"Document ID: {document_id}")
    logger.info(f"Title: {title}")
    logger.info("=" * 80)
    
    try:
        # Step 1: Read PDF file
        logger.info("\n📥 STEP 1/4: Reading PDF file")
        with open(pdf_path, 'rb') as f:
            pdf_content = f.read()
        logger.info(f"✓ Read {len(pdf_content)} bytes from PDF")
        
        # Step 2: Extract text from PDF
        logger.info("\n📄 STEP 2/4: Extracting text from PDF")
        pdf_processor = PDFProcessor()
        pdf_data = pdf_processor.extract_text_from_pdf(pdf_content, document_id=document_id)
        logger.info(f"✓ Extracted text from {pdf_data['num_pages']} pages ({len(pdf_data['text'])} characters)")
        
        # Step 3: Chunk the text
        logger.info("\n✂️  STEP 3/4: Chunking text")
        chunker = TextChunker(
            chunk_size=settings.chunk_size,
            chunk_overlap=settings.chunk_overlap
        )
        
        document_metadata = {
            'document_id': document_id,
            'title': title,
            'source': str(pdf_path)
        }
        
        chunks = chunker.chunk_document_pages(pdf_data['page_texts'], document_metadata)
        logger.info(f"✓ Created {len(chunks)} chunks")
        
        # Step 4: Generate embeddings and store in ChromaDB
        logger.info("\n🔢 STEP 4/4: Generating embeddings and storing in ChromaDB")
        embedding_service = EmbeddingService()
        vector_store = VectorStore()
        
        # Generate embeddings for all chunks
        logger.info("Generating embeddings...")
        embedded_chunks = embedding_service.embed_chunks(chunks)
        logger.info(f"✓ Generated {len(embedded_chunks)} embeddings")
        
        # Store in ChromaDB
        logger.info("Storing in ChromaDB...")
        chunks_indexed = vector_store.add_documents(
            chunks=embedded_chunks,
            document_id=document_id,
            document_title=title
        )
        logger.info(f"✓ Stored {chunks_indexed} chunks in ChromaDB")
        
        logger.info("\n" + "=" * 80)
        logger.info("✅ Document indexing completed successfully!")
        logger.info(f"   Document ID: {document_id}")
        logger.info(f"   Title: {title}")
        logger.info(f"   Chunks indexed: {chunks_indexed}")
        logger.info("=" * 80)
        
        return True, chunks_indexed
        
    except Exception as e:
        logger.error(f"\n❌ Failed to index document: {str(e)}", exc_info=True)
        return False, 0


def generate_document_id(filename: str) -> str:
    """Generate a document ID from filename."""
    # Remove extension and clean up the filename
    base_name = Path(filename).stem
    # Replace spaces and special chars with underscores, make lowercase
    doc_id = base_name.lower().replace(' ', '_').replace('-', '_')
    # Remove any remaining special characters except underscores
    doc_id = ''.join(c if c.isalnum() or c == '_' else '' for c in doc_id)
    # Remove multiple underscores
    doc_id = '_'.join(filter(None, doc_id.split('_')))
    return f"doc_{doc_id}"


def generate_title(filename: str) -> str:
    """Generate a readable title from filename."""
    # Remove extension
    base_name = Path(filename).stem
    # Replace underscores and dashes with spaces
    title = base_name.replace('_', ' ').replace('-', ' ')
    # Capitalize first letter of each word
    title = ' '.join(word.capitalize() for word in title.split())
    return title


def index_all_pdfs_in_folder(folder_path: str):
    """
    Index all PDF files in a folder.
    
    Args:
        folder_path: Path to the folder containing PDF files
    """
    folder = Path(folder_path)
    
    if not folder.exists():
        logger.error(f"Folder not found: {folder_path}")
        return
    
    if not folder.is_dir():
        logger.error(f"Path is not a directory: {folder_path}")
        return
    
    # Find all PDF files
    pdf_files = list(folder.glob("*.pdf")) + list(folder.glob("*.PDF"))
    
    if not pdf_files:
        logger.warning(f"No PDF files found in: {folder_path}")
        return
    
    logger.info("=" * 80)
    logger.info(f"📚 Found {len(pdf_files)} PDF file(s) to index")
    logger.info(f"📁 Folder: {folder_path}")
    logger.info("=" * 80)
    logger.info("")
    
    success_count = 0
    error_count = 0
    total_chunks = 0
    errors = []
    
    # Index each PDF
    for index, pdf_file in enumerate(pdf_files, 1):
        logger.info(f"\n{'='*80}")
        logger.info(f"📄 Processing file {index}/{len(pdf_files)}")
        logger.info(f"{'='*80}\n")
        
        # Generate document ID and title from filename
        document_id = generate_document_id(pdf_file.name)
        title = generate_title(pdf_file.name)
        
        start_time = time.time()
        success, chunks_indexed = index_local_pdf(str(pdf_file), document_id, title)
        elapsed_time = time.time() - start_time
        
        if success:
            success_count += 1
            total_chunks += chunks_indexed
            logger.info(f"\n✅ Successfully indexed in {elapsed_time:.1f} seconds")
        else:
            error_count += 1
            errors.append({
                'file': pdf_file.name,
                'document_id': document_id,
                'title': title
            })
            logger.error(f"\n❌ Failed to index after {elapsed_time:.1f} seconds")
        
        # Add a small delay between files to avoid overwhelming the system
        if index < len(pdf_files):
            logger.info("\n⏳ Waiting 2 seconds before processing next file...\n")
            time.sleep(2)
    
    # Print final summary
    logger.info("")
    logger.info("=" * 80)
    logger.info("📊 INDEXING SUMMARY")
    logger.info("=" * 80)
    logger.info(f"Total PDF files found: {len(pdf_files)}")
    logger.info(f"✅ Successfully indexed: {success_count}")
    logger.info(f"❌ Failed: {error_count}")
    logger.info(f"📦 Total chunks indexed: {total_chunks}")
    
    if errors:
        logger.info("\n❌ Failed files:")
        for error in errors:
            logger.info(f"   - {error['file']} (ID: {error['document_id']}, Title: {error['title']})")
    
    logger.info("=" * 80)
    logger.info("")


if __name__ == "__main__":
    # Default to backend/data/documents folder
    # Can be overridden with command line argument
    if len(sys.argv) > 1:
        folder_path = sys.argv[1]
    else:
        # Get the rag-service directory and go up to find backend/data/documents
        script_dir = Path(__file__).parent
        folder_path = script_dir.parent / "backend" / "data" / "documents"
    
    folder_path = str(folder_path)
    
    logger.info("🚀 Starting batch PDF indexing")
    logger.info(f"📁 Target folder: {folder_path}")
    logger.info("")
    
    try:
        index_all_pdfs_in_folder(folder_path)
        logger.info("🎉 Batch indexing completed!")
    except KeyboardInterrupt:
        logger.warning("\n⚠️  Indexing interrupted by user")
        sys.exit(1)
    except Exception as e:
        logger.error(f"\n❌ Fatal error: {str(e)}", exc_info=True)
        sys.exit(1)








