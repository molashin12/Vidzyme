"""
Enhanced TTS System Diagnostic Tool
Comprehensive diagnostic utility to identify and resolve TTS system issues.
"""

import os
import sys
from pathlib import Path
import traceback
from typing import Dict, List, Any, Optional

# Add the utils directory to the path for imports
current_dir = Path(__file__).parent
utils_dir = current_dir / "utils"
if utils_dir.exists():
    sys.path.insert(0, str(utils_dir))

def safe_import(module_name: str, description: str = None) -> tuple:
    """Safely import a module and return (module, success, error)."""
    try:
        module = __import__(module_name)
        return module, True, None
    except ImportError as e:
        return None, False, f"ImportError: {str(e)}"
    except Exception as e:
        return None, False, f"Error: {str(e)}"


def print_section(title: str, char: str = "="):
    """Print a formatted section header."""
    print(f"\n{char * 60}")
    print(f"{title.upper()}")
    print(f"{char * 60}")


def print_subsection(title: str):
    """Print a formatted subsection header."""
    print(f"\n{'-' * 40}")
    print(f"{title}")
    print(f"{'-' * 40}")


def check_system_info():
    """Check basic system information."""
    print_section("System Information")
    
    import platform
    
    info = {
        "Platform": platform.platform(),
        "Python Version": platform.python_version(),
        "Working Directory": os.getcwd(),
        "Script Location": str(Path(__file__).absolute()),
        "Utils Directory": str(utils_dir) if utils_dir.exists() else "Not found"
    }
    
    for key, value in info.items():
        print(f"{key}: {value}")


def check_file_structure():
    """Check expected file structure."""
    print_section("File Structure Check")
    
    base_path = Path.cwd()
    
    # Expected files and directories
    expected_structure = {
        "API Key Files": [
            "voice_secret.txt",
            "gemini_secret.txt"
        ],
        "Core TTS Files": [
            "utils/tts/__init__.py",
            "utils/tts/base_provider.py",
            "utils/tts/elevenlabs_provider.py",
            "utils/tts/gemini_tts_provider.py",
            "utils/tts/tts_factory.py",
            "utils/tts/exceptions.py",
            "utils/tts/logging_utils.py",
            "utils/tts/validation.py"
        ],
        "Configuration Files": [
            "utils/tts_config.py",
            "utils/voice_gen.py"
        ],
        "Directories": [
            "utils/",
            "utils/tts/",
            "outputs/"
        ]
    }
    
    for category, files in expected_structure.items():
        print_subsection(category)
        
        for file_path in files:
            full_path = base_path / file_path
            
            if file_path.endswith('/'):
                # Directory check
                exists = full_path.exists() and full_path.is_dir()
                status = "✓ EXISTS" if exists else "✗ MISSING"
                print(f"  {status}: {file_path}")
            else:
                # File check
                exists = full_path.exists() and full_path.is_file()
                status = "✓ EXISTS" if exists else "✗ MISSING"
                size = f" ({full_path.stat().st_size} bytes)" if exists else ""
                print(f"  {status}: {file_path}{size}")


def check_api_keys():
    """Check API key files and their contents."""
    print_section("API Key Validation")
    
    # Try to import validation utilities
    validation_module, validation_success, validation_error = safe_import("tts.validation")
    
    if not validation_success:
        print(f"⚠️  Validation utilities not available: {validation_error}")
        print("Performing basic API key checks...")
        
        # Basic checks without validation utilities
        api_key_files = {
            "ElevenLabs": "voice_secret.txt",
            "Gemini": "gemini_secret.txt"
        }
        
        for provider, filename in api_key_files.items():
            print_subsection(f"{provider} API Key")
            
            file_path = Path(filename)
            if not file_path.exists():
                print(f"  ✗ File not found: {filename}")
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                
                if not content:
                    print(f"  ✗ File is empty: {filename}")
                elif len(content) < 10:
                    print(f"  ✗ Content too short: {len(content)} characters")
                elif content.startswith('your_') or content.startswith('YOUR_'):
                    print(f"  ✗ Appears to be placeholder text")
                else:
                    print(f"  ✓ File exists with content: {len(content)} characters")
                    print(f"    First 10 chars: {content[:10]}...")
                    
            except Exception as e:
                print(f"  ✗ Error reading file: {str(e)}")
    
    else:
        # Use validation utilities
        print("Using enhanced validation utilities...")
        
        try:
            APIKeyValidator = validation_module.APIKeyValidator
            
            api_key_files = {
                "elevenlabs": "voice_secret.txt",
                "gemini": "gemini_secret.txt"
            }
            
            for provider, filename in api_key_files.items():
                print_subsection(f"{provider.title()} API Key")
                
                is_valid, message, api_key = APIKeyValidator.validate_key_file(filename, provider)
                
                if is_valid:
                    print(f"  ✓ {message}")
                    print(f"    File: {filename}")
                    print(f"    Length: {len(api_key)} characters")
                else:
                    print(f"  ✗ {message}")
                    print(f"    File: {filename}")
                    
                    # Show requirements
                    requirements = APIKeyValidator.get_key_requirements(provider)
                    print(f"    Expected: {requirements['description']}")
                    print(f"    Example: {requirements['example']}")
                    
        except Exception as e:
            print(f"  ✗ Error using validation utilities: {str(e)}")


def check_module_imports():
    """Check if TTS modules can be imported."""
    print_section("Module Import Check")
    
    modules_to_check = [
        ("tts", "TTS package"),
        ("tts.base_provider", "Base provider"),
        ("tts.elevenlabs_provider", "ElevenLabs provider"),
        ("tts.gemini_tts_provider", "Gemini provider"),
        ("tts.tts_factory", "TTS factory"),
        ("tts.exceptions", "Exception classes"),
        ("tts.logging_utils", "Logging utilities"),
        ("tts.validation", "Validation utilities"),
        ("tts_config", "TTS configuration"),
        ("voice_gen", "Voice generation")
    ]
    
    for module_name, description in modules_to_check:
        module, success, error = safe_import(module_name, description)
        
        if success:
            print(f"  ✓ {description}: {module_name}")
            
            # Try to get some info about the module
            try:
                if hasattr(module, '__file__'):
                    print(f"    Location: {module.__file__}")
                if hasattr(module, '__version__'):
                    print(f"    Version: {module.__version__}")
            except:
                pass
        else:
            print(f"  ✗ {description}: {module_name}")
            print(f"    Error: {error}")


def check_dependencies():
    """Check required dependencies."""
    print_section("Dependency Check")
    
    required_deps = [
        ("requests", "HTTP requests"),
        ("pathlib", "Path handling"),
        ("json", "JSON processing"),
        ("os", "Operating system interface"),
        ("typing", "Type hints")
    ]
    
    optional_deps = [
        ("psutil", "System monitoring"),
        ("typing_extensions", "Extended type hints")
    ]
    
    print_subsection("Required Dependencies")
    for dep, description in required_deps:
        module, success, error = safe_import(dep)
        status = "✓" if success else "✗"
        print(f"  {status} {dep}: {description}")
        if not success:
            print(f"    Error: {error}")
    
    print_subsection("Optional Dependencies")
    for dep, description in optional_deps:
        module, success, error = safe_import(dep)
        status = "✓" if success else "⚠️"
        print(f"  {status} {dep}: {description}")
        if not success:
            print(f"    Note: {error}")


def test_tts_system():
    """Test the TTS system functionality."""
    print_section("TTS System Test")
    
    try:
        # Try to import TTS factory
        tts_factory, factory_success, factory_error = safe_import("tts.tts_factory")
        
        if not factory_success:
            print(f"  ✗ Cannot import TTS factory: {factory_error}")
            return
        
        print("  ✓ TTS factory imported successfully")
        
        # Try to create factory instance
        try:
            TTSFactory = tts_factory.TTSFactory
            factory = TTSFactory()
            print("  ✓ TTS factory instance created")
            
            # Check available providers
            available_providers = factory.get_available_providers()
            print(f"  ✓ Available providers: {available_providers}")
            
            # Try to get optimal provider
            try:
                optimal_provider = factory.get_optimal_provider("Hello world test")
                print(f"  ✓ Optimal provider selected: {optimal_provider}")
            except Exception as e:
                print(f"  ⚠️  Could not select optimal provider: {str(e)}")
            
        except Exception as e:
            print(f"  ✗ Error creating TTS factory: {str(e)}")
            print(f"    Traceback: {traceback.format_exc()}")
            
    except Exception as e:
        print(f"  ✗ Unexpected error in TTS system test: {str(e)}")


def check_configuration():
    """Check TTS configuration."""
    print_section("Configuration Check")
    
    try:
        # Try to import configuration
        config_module, config_success, config_error = safe_import("tts_config")
        
        if not config_success:
            print(f"  ✗ Cannot import configuration: {config_error}")
            return
        
        print("  ✓ Configuration module imported successfully")
        
        # Try to create config instance
        try:
            TTSConfig = config_module.TTSConfig
            config = TTSConfig()
            print("  ✓ Configuration instance created")
            
            # Check configuration structure
            config_data = config.config
            print(f"  ✓ Configuration loaded with {len(config_data)} top-level keys")
            
            # Check providers
            if 'providers' in config_data:
                providers = config_data['providers']
                print(f"  ✓ Providers configured: {list(providers.keys())}")
                
                for provider_name, provider_config in providers.items():
                    enabled = provider_config.get('enabled', False)
                    status = "enabled" if enabled else "disabled"
                    print(f"    - {provider_name}: {status}")
            
            # Check voice mappings
            if 'voice_mappings' in config_data:
                voice_mappings = config_data['voice_mappings']
                print(f"  ✓ Voice mappings for {len(voice_mappings)} languages")
            
        except Exception as e:
            print(f"  ✗ Error with configuration: {str(e)}")
            print(f"    Traceback: {traceback.format_exc()}")
            
    except Exception as e:
        print(f"  ✗ Unexpected error in configuration check: {str(e)}")


def provide_recommendations():
    """Provide recommendations based on findings."""
    print_section("Recommendations & Next Steps")
    
    print("""
Based on the diagnostic results above, here are recommended actions:

1. MISSING FILES:
   - If any core TTS files are missing, re-run the setup process
   - Ensure all files are in the correct directories

2. API KEY ISSUES:
   - Verify API keys are correctly placed in voice_secret.txt and gemini_secret.txt
   - Check that API keys don't contain extra whitespace or newlines
   - Ensure API keys match the expected format for each provider

3. IMPORT ERRORS:
   - Check that all files are in the correct locations
   - Verify Python path includes the utils directory
   - Look for syntax errors in Python files

4. DEPENDENCY ISSUES:
   - Install missing required dependencies: pip install requests
   - Optional dependencies can improve functionality but aren't required

5. CONFIGURATION PROBLEMS:
   - Check tts_config.py for syntax errors
   - Verify configuration structure matches expected format

6. TESTING:
   - Run test_tts_system.py to validate the complete system
   - Use the enhanced TTS system with auto provider selection

7. DEBUGGING:
   - Enable debug logging in the TTS system
   - Check log files for detailed error information
   - Use the validation utilities for specific component testing
""")


def main():
    """Run comprehensive TTS system diagnostics."""
    print("TTS SYSTEM DIAGNOSTIC TOOL")
    print("=" * 60)
    print("This tool will check your TTS system configuration and identify issues.")
    print("Please wait while we run comprehensive diagnostics...")
    
    try:
        # Run all diagnostic checks
        check_system_info()
        check_file_structure()
        check_dependencies()
        check_module_imports()
        check_api_keys()
        check_configuration()
        test_tts_system()
        provide_recommendations()
        
        print_section("Diagnostic Complete")
        print("✓ Diagnostic scan completed successfully!")
        print("Review the results above and follow the recommendations.")
        print("\nIf issues persist, please check:")
        print("1. File permissions")
        print("2. Python environment")
        print("3. API key validity")
        print("4. Network connectivity")
        
    except Exception as e:
        print_section("Diagnostic Error")
        print(f"✗ An error occurred during diagnostics: {str(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        print("\nPlease report this error with the full traceback.")


if __name__ == "__main__":
    main()