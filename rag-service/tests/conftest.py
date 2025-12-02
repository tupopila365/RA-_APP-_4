"""Pytest configuration and fixtures for RAG service tests."""

import pytest
import tempfile
from pathlib import Path
from unittest.mock import Mock, MagicMock


@pytest.fixture
def sample_pdf_content():
    """Sample PDF text content for testing."""
    return """
    Roads Authority Namibia
    
    Annual Report 2023
    
    Introduction
    The Roads Authority of Namibia is responsible for the management and maintenance
    of the national road network. This report covers our activities in 2023.
    
    Key Achievements
    - Completed 150km of road rehabilitation
    - Improved road safety measures
    - Enhanced maintenance programs
    
    Financial Overview
    Total budget: N$500 million
    Expenditure: N$480 million
    
    Conclusion
    We remain committed to providing quality road infrastructure for Namibia.
    """


@pytest.fixture
def sample_page_texts():
    """Sample page texts from a PDF."""
    return [
        {
            'page_number': 1,
            'text': 'Roads Authority Namibia\n\nAnnual Report 2023\n\nIntroduction\nThe Roads Authority of Namibia is responsible for the management and maintenance of the national road network.'
        },
        {
            'page_number': 2,
            'text': 'Key Achievements\n- Completed 150km of road rehabilitation\n- Improved road safety measures\n- Enhanced maintenance programs'
        },
        {
            'page_number': 3,
            'text': 'Financial Overview\nTotal budget: N$500 million\nExpenditure: N$480 million\n\nConclusion\nWe remain committed to providing quality road infrastructure for Namibia.'
        }
    ]


@pytest.fixture
def sample_chunks():
    """Sample text chunks for testing."""
    return [
        {
            'text': 'Roads Authority Namibia is responsible for road management.',
            'chunk_index': 0,
            'total_chunks': 3,
            'start_char': 0,
            'end_char': 62,
            'token_count': 10,
            'metadata': {'page_number': 1}
        },
        {
            'text': 'Key achievements include 150km of road rehabilitation.',
            'chunk_index': 1,
            'total_chunks': 3,
            'start_char': 63,
            'end_char': 117,
            'token_count': 9,
            'metadata': {'page_number': 2}
        },
        {
            'text': 'Total budget was N$500 million in 2023.',
            'chunk_index': 2,
            'total_chunks': 3,
            'start_char': 118,
            'end_char': 157,
            'token_count': 8,
            'metadata': {'page_number': 3}
        }
    ]


@pytest.fixture
def sample_embedding():
    """Sample embedding vector for testing."""
    # Return a 768-dimensional vector (typical for nomic-embed-text:latest)
    return [0.1] * 768


@pytest.fixture
def sample_embeddings():
    """Sample embedding vectors for multiple chunks."""
    return [
        [0.1] * 768,
        [0.2] * 768,
        [0.3] * 768
    ]


@pytest.fixture
def mock_ollama_client():
    """Mock Ollama client for testing."""
    mock_client = MagicMock()
    
    # Mock embeddings response
    mock_client.embeddings.return_value = {
        'embedding': [0.1] * 768
    }
    
    # Mock generate response
    mock_client.generate.return_value = {
        'response': 'This is a generated answer based on the provided context.'
    }
    
    # Mock list response
    mock_client.list.return_value = {
        'models': [
            {'name': 'nomic-embed-text:latest:latest'},
            {'name': 'llama3.2:1b'}
        ]
    }
    
    return mock_client


@pytest.fixture
def mock_chromadb_collection():
    """Mock ChromaDB collection for testing."""
    mock_collection = MagicMock()
    
    # Mock count
    mock_collection.count.return_value = 10
    
    # Mock add
    mock_collection.add.return_value = None
    
    # Mock query
    mock_collection.query.return_value = {
        'ids': [['doc1_chunk_0', 'doc1_chunk_1']],
        'documents': [['Sample text 1', 'Sample text 2']],
        'metadatas': [[
            {'document_id': 'doc1', 'document_title': 'Test Doc', 'chunk_index': 0},
            {'document_id': 'doc1', 'document_title': 'Test Doc', 'chunk_index': 1}
        ]],
        'distances': [[0.2, 0.3]]
    }
    
    # Mock get
    mock_collection.get.return_value = {
        'ids': ['doc1_chunk_0', 'doc1_chunk_1'],
        'documents': ['Sample text 1', 'Sample text 2'],
        'metadatas': [
            {'document_id': 'doc1', 'document_title': 'Test Doc', 'chunk_index': 0},
            {'document_id': 'doc1', 'document_title': 'Test Doc', 'chunk_index': 1}
        ]
    }
    
    # Mock delete
    mock_collection.delete.return_value = None
    
    return mock_collection


@pytest.fixture
def temp_pdf_file():
    """Create a temporary PDF file for testing."""
    # Create a minimal valid PDF
    pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
/Font <<
/F1 <<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
>>
>>
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test PDF Content) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000317 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
410
%%EOF
"""
    
    with tempfile.NamedTemporaryFile(mode='wb', suffix='.pdf', delete=False) as f:
        f.write(pdf_content)
        temp_path = f.name
    
    yield temp_path
    
    # Cleanup
    Path(temp_path).unlink(missing_ok=True)
