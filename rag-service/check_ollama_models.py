"""
Standalone script to check and setup Ollama models.

This script can be run independently to verify Ollama setup
before starting the RAG service.

Usage:
    python check_ollama_models.py
    
    # With custom model path:
    python check_ollama_models.py --models-path "D:/ollama-models"
    
    # Without auto-pull:
    python check_ollama_models.py --no-auto-pull
"""

import argparse
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.utils.ollama_setup import initialize_ollama_models


def main():
    parser = argparse.ArgumentParser(description='Check and setup Ollama models for RAG service')
    parser.add_argument(
        '--base-url',
        default='http://localhost:11434',
        help='Ollama API base URL (default: http://localhost:11434)'
    )
    parser.add_argument(
        '--embedding-model',
        default='nomic-embed-text:latest',
        help='Embedding model name (default: nomic-embed-text:latest)'
    )
    parser.add_argument(
        '--llm-model',
        default='llama3.2:1b',
        help='LLM model name (default: llama3.2:1b)'
    )
    parser.add_argument(
        '--models-path',
        default=None,
        help='Custom path for Ollama models (optional)'
    )
    parser.add_argument(
        '--no-auto-pull',
        action='store_true',
        help='Disable automatic model pulling'
    )
    
    args = parser.parse_args()
    
    print("\n" + "=" * 70)
    print("Ollama Model Setup Checker")
    print("=" * 70)
    print(f"Base URL: {args.base_url}")
    print(f"Embedding Model: {args.embedding_model}")
    print(f"LLM Model: {args.llm_model}")
    if args.models_path:
        print(f"Custom Models Path: {args.models_path}")
    print(f"Auto-pull: {not args.no_auto_pull}")
    print("=" * 70 + "\n")
    
    # Initialize models
    success = initialize_ollama_models(
        embedding_model=args.embedding_model,
        llm_model=args.llm_model,
        base_url=args.base_url,
        custom_model_path=args.models_path,
        auto_pull=not args.no_auto_pull
    )
    
    # Exit with appropriate code
    if success:
        print("\n✓ All models are ready!")
        sys.exit(0)
    else:
        print("\n✗ Some models are missing or unavailable")
        sys.exit(1)


if __name__ == "__main__":
    main()
