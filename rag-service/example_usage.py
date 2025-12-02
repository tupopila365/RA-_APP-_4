"""
Example usage of the Ollama model setup utility.

This demonstrates how to use the model manager in your own code.
"""

from app.utils.ollama_setup import OllamaModelManager, initialize_ollama_models


def example_1_simple_initialization():
    """Example 1: Simple initialization with default settings."""
    print("\n" + "=" * 70)
    print("Example 1: Simple Initialization")
    print("=" * 70)
    
    success = initialize_ollama_models(
        embedding_model='nomic-embed-text:latest',
        llm_model='llama3.2:1b',
        auto_pull=True
    )
    
    if success:
        print("\n✓ All models ready! You can start your RAG service.")
    else:
        print("\n✗ Some models are missing. Check the logs above.")


def example_2_custom_path():
    """Example 2: Using a custom model path."""
    print("\n" + "=" * 70)
    print("Example 2: Custom Model Path")
    print("=" * 70)
    
    success = initialize_ollama_models(
        embedding_model='nomic-embed-text:latest',
        llm_model='llama3.2:1b',
        custom_model_path='D:/ollama-models',  # Your custom path
        auto_pull=True
    )
    
    if success:
        print("\n✓ Models loaded from custom path!")


def example_3_manual_control():
    """Example 3: Manual control with OllamaModelManager."""
    print("\n" + "=" * 70)
    print("Example 3: Manual Control")
    print("=" * 70)
    
    # Create manager
    manager = OllamaModelManager(base_url='http://localhost:11434')
    
    # Check if Ollama is running
    if not manager.check_ollama_running():
        print("✗ Ollama is not running!")
        return
    
    print("✓ Ollama is running")
    
    # List all available models
    models = manager.list_available_models()
    print(f"\nAvailable models ({len(models)}):")
    for model in models:
        print(f"  - {model}")
    
    # Check specific model
    model_name = 'nomic-embed-text:latest'
    if manager.is_model_available(model_name):
        print(f"\n✓ Model '{model_name}' is available")
    else:
        print(f"\n✗ Model '{model_name}' not found")
        
        # Pull it
        print(f"Pulling '{model_name}'...")
        if manager.pull_model(model_name):
            print(f"✓ Successfully pulled '{model_name}'")
        else:
            print(f"✗ Failed to pull '{model_name}'")


def example_4_check_without_pulling():
    """Example 4: Check models without auto-pulling."""
    print("\n" + "=" * 70)
    print("Example 4: Check Without Auto-Pull")
    print("=" * 70)
    
    success = initialize_ollama_models(
        embedding_model='nomic-embed-text:latest',
        llm_model='llama3.2:1b',
        auto_pull=False  # Just check, don't download
    )
    
    if success:
        print("\n✓ All required models are already available")
    else:
        print("\n✗ Some models are missing. Run with auto_pull=True to download them.")


def example_5_multiple_models():
    """Example 5: Setup multiple models at once."""
    print("\n" + "=" * 70)
    print("Example 5: Multiple Models")
    print("=" * 70)
    
    manager = OllamaModelManager()
    
    required_models = [
        'nomic-embed-text:latest',
        'llama3.2:1b',
        'llama3.2:3b'  # Additional model
    ]
    
    all_ready, missing = manager.setup_models(
        required_models=required_models,
        auto_pull=True
    )
    
    if all_ready:
        print("\n✓ All models are ready!")
    else:
        print(f"\n✗ Missing models: {missing}")


def example_6_production_setup():
    """Example 6: Production setup (no auto-pull)."""
    print("\n" + "=" * 70)
    print("Example 6: Production Setup")
    print("=" * 70)
    
    # In production, you want to fail fast if models are missing
    # rather than downloading them at startup
    
    success = initialize_ollama_models(
        embedding_model='nomic-embed-text:latest',
        llm_model='llama3.2:1b',
        auto_pull=False  # Don't download in production
    )
    
    if not success:
        print("\n✗ CRITICAL: Required models are missing!")
        print("Please run the following commands:")
        print("  ollama pull nomic-embed-text:latest")
        print("  ollama pull llama3.2:1b")
        exit(1)
    
    print("\n✓ Production environment ready")


if __name__ == "__main__":
    import sys
    
    examples = {
        '1': ('Simple Initialization', example_1_simple_initialization),
        '2': ('Custom Model Path', example_2_custom_path),
        '3': ('Manual Control', example_3_manual_control),
        '4': ('Check Without Pulling', example_4_check_without_pulling),
        '5': ('Multiple Models', example_5_multiple_models),
        '6': ('Production Setup', example_6_production_setup),
    }
    
    if len(sys.argv) > 1 and sys.argv[1] in examples:
        # Run specific example
        name, func = examples[sys.argv[1]]
        func()
    else:
        # Show menu
        print("\n" + "=" * 70)
        print("Ollama Model Setup - Example Usage")
        print("=" * 70)
        print("\nAvailable examples:")
        for key, (name, _) in examples.items():
            print(f"  {key}. {name}")
        print("\nUsage:")
        print(f"  python {sys.argv[0]} <example_number>")
        print("\nExample:")
        print(f"  python {sys.argv[0]} 1")
        print("\nOr run all examples:")
        print(f"  python {sys.argv[0]} all")
        
        if len(sys.argv) > 1 and sys.argv[1] == 'all':
            for name, func in examples.values():
                func()
