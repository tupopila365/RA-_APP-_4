"""Simple test runner script."""

import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 70)
print("RAG Service Test Suite")
print("=" * 70)
print()

try:
    import pytest
    
    # Run pytest
    exit_code = pytest.main([
        'tests/',
        '-v',
        '--tb=short',
        '--color=yes'
    ])
    
    sys.exit(exit_code)
    
except ImportError:
    print("ERROR: pytest is not installed.")
    print("Please install test dependencies:")
    print("  pip install pytest pytest-asyncio pytest-mock httpx")
    print()
    print("Or install all requirements:")
    print("  pip install -r requirements.txt")
    sys.exit(1)
