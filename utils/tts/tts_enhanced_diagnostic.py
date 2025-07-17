#!/usr/bin/env python3
"""
Enhanced TTS System Diagnostic Tool

This script performs comprehensive diagnostics on the TTS system to identify
issues with API key access, configuration, and system setup.
"""

import os
import sys
import json
import traceback
from pathlib import Path
from typing import Dict, List, Tuple, Any

# Add the project root to the path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

# Import our enhanced utilities
try:
    from utils.tts.exceptions import TTSError, APIKeyError, ProviderError
    from utils.tts.logging_utils import get_logger, DiagnosticLogger
    from utils.tts.validation import run_comprehensive_validation
    from utils.tts.tts_factory import TTSFactory
    ENHANCED_UTILS_AVAILABLE = True
except ImportError as e:
    print(f"⚠️  Enhanced utilities not available: {e}")
    ENHANCED_UTILS_AVAILABLE = False


class TTSDiagnostic:
    """Enhanced TTS diagnostic tool"""
    
    def __init__(self):
        self.project_root = project_root
        self.issues = []
        self.warnings = []
        self.info = []
        
        if ENHANCED_UTILS_AVAILABLE:
            self.logger = get_logger()
            self.diag_logger = DiagnosticLogger(self.logger)
        else:
            self.logger = None
            self.diag_logger = None
    
    def run_all_diagnostics(self) -> Dict[str, Any]:
        """Run all diagnostic checks"""
        print("🔍 Starting Enhanced TTS System Diagnostics...")
        print("=" * 60)
        
        results = {}
        
        # Basic system checks
        results['system'] = self.check_system_info()
        results['file_structure'] = self.check_file_structure()
        results['dependencies'] = self.check_dependencies()
        results['imports'] = self.check_module_imports()
        
        # Enhanced checks if utilities are available
        if ENHANCED_UTILS_AVAILABLE:
            results['validation'] = self.run_enhanced_validation()
            results['tts_factory'] = self.test_tts_factory()
            results['provider_test'] = self.test_basic_provider_functionality()
        
        # Generate summary
        results['summary'] = self.generate_summary()
        
        return results
    
    def check_system_info(self) -> Dict[str, Any]:
        """Check basic system information"""
        print("\n📋 System Information")
        print("-" * 30)
        
        info = {
            'python_version': sys.version,
            'platform': sys.platform,
            'working_directory': os.getcwd(),
            'project_root': str(self.project_root),
            'path_entries': sys.path[:5]  # First 5 entries
        }
        
        for key, value in info.items():
            print(f"  {key}: {value}")
        
        return info
    
    def check_file_structure(self) -> Dict[str, Any]:
        """Check if required files and directories exist"""
        print("\n📁 File Structure Check")
        print("-" * 30)
        
        required_files = [
            'voice_secret.txt',
            'gemini_secret.txt',
            'utils/tts/tts_factory.py',
            'utils/tts/elevenlabs_provider.py',
            'utils/tts/gemini_tts_provider.py',
            'utils/tts/base_provider.py'
        ]
        
        optional_files = [
            'utils/tts/exceptions.py',
            'utils/tts/logging_utils.py',
            'utils/tts/validation.py',
            'config/tts_config.json'
        ]
        
        results = {'required': {}, 'optional': {}}
        
        # Check required files
        for file_path in required_files:
            full_path = self.project_root / file_path
            exists = full_path.exists()
            results['required'][file_path] = exists
            status = "✓" if exists else "✗"
            print(f"  {status} {file_path}")
            
            if not exists:
                self.issues.append(f"Missing required file: {file_path}")
        
        # Check optional files
        print("\n  Optional files:")
        for file_path in optional_files:
            full_path = self.project_root / file_path
            exists = full_path.exists()
            results['optional'][file_path] = exists
            status = "✓" if exists else "○"
            print(f"  {status} {file_path}")
        
        return results
    
    def check_dependencies(self) -> Dict[str, Any]:
        """Check if required dependencies are available"""
        print("\n📦 Dependencies Check")
        print("-" * 30)
        
        required_deps = ['requests', 'pathlib', 'json']
        optional_deps = ['numpy', 'scipy', 'pydub']
        
        results = {'required': {}, 'optional': {}}
        
        # Check required dependencies
        for dep in required_deps:
            try:
                __import__(dep)
                results['required'][dep] = True
                print(f"  ✓ {dep}")
            except ImportError:
                results['required'][dep] = False
                print(f"  ✗ {dep}")
                self.issues.append(f"Missing required dependency: {dep}")
        
        # Check optional dependencies
        print("\n  Optional dependencies:")
        for dep in optional_deps:
            try:
                __import__(dep)
                results['optional'][dep] = True
                print(f"  ✓ {dep}")
            except ImportError:
                results['optional'][dep] = False
                print(f"  ○ {dep}")
        
        return results
    
    def check_module_imports(self) -> Dict[str, Any]:
        """Test importing TTS modules"""
        print("\n🔧 Module Import Check")
        print("-" * 30)
        
        modules_to_test = [
            'utils.tts.base_provider',
            'utils.tts.elevenlabs_provider',
            'utils.tts.gemini_tts_provider',
            'utils.tts.tts_factory'
        ]
        
        results = {}
        
        for module_name in modules_to_test:
            try:
                __import__(module_name)
                results[module_name] = True
                print(f"  ✓ {module_name}")
            except ImportError as e:
                results[module_name] = False
                print(f"  ✗ {module_name}: {e}")
                self.issues.append(f"Failed to import {module_name}: {e}")
        
        return results
    
    def run_enhanced_validation(self) -> Dict[str, Any]:
        """Run comprehensive validation using enhanced utilities"""
        print("\n🔍 Enhanced Validation")
        print("-" * 30)
        
        try:
            validation_report = run_comprehensive_validation(str(self.project_root))
            
            # Access the sections correctly
            sections = validation_report.sections
            
            print(f"  API Key Validation:")
            if 'api_keys' in sections:
                api_key_details = sections['api_keys']['details']
                for provider, result in api_key_details.items():
                    status = "✓" if result['status'] else "✗"
                    print(f"    {status} {provider}: {result['message']}")
                    if not result['status']:
                        self.issues.append(f"API key issue for {provider}: {result['message']}")
            
            print(f"  Configuration Validation:")
            if 'configuration' in sections:
                config_section = sections['configuration']
                status = "✓" if config_section['status'] else "✗"
                config_details = config_section['details']
                if 'validation_passed' in config_details:
                    print(f"    {status} Config: Validation {'passed' if config_details['validation_passed'] else 'failed'}")
                    if not config_details['validation_passed'] and 'errors' in config_details:
                        for error in config_details['errors']:
                            self.issues.append(f"Configuration error: {error}")
                else:
                    error_msg = config_details.get('error', 'Unknown configuration error')
                    print(f"    {status} Config: {error_msg}")
                    self.issues.append(f"Configuration issue: {error_msg}")
            
            print(f"  System Validation:")
            if 'dependencies' in sections:
                deps_section = sections['dependencies']
                status = "✓" if deps_section['status'] else "✗"
                deps_details = deps_section['details']
                missing_req = deps_details.get('missing_required', [])
                missing_opt = deps_details.get('missing_optional', [])
                
                if missing_req:
                    print(f"    {status} Dependencies: Missing required: {', '.join(missing_req)}")
                    for dep in missing_req:
                        self.issues.append(f"Missing required dependency: {dep}")
                else:
                    print(f"    {status} Dependencies: All required dependencies available")
                
                if missing_opt:
                    print(f"    ○ Optional dependencies missing: {', '.join(missing_opt)}")
            
            if 'file_structure' in sections:
                struct_section = sections['file_structure']
                status = "✓" if struct_section['status'] else "✗"
                struct_details = struct_section['details']
                missing_files = struct_details.get('missing_files', [])
                missing_dirs = struct_details.get('missing_directories', [])
                
                if missing_files or missing_dirs:
                    print(f"    {status} File Structure: Missing files/directories")
                    for item in missing_files + missing_dirs:
                        self.issues.append(f"Missing file/directory: {item}")
                else:
                    print(f"    {status} File Structure: All required files present")
            
            return {
                'sections': sections,
                'summary': validation_report.get_summary()
            }
            
        except Exception as e:
            error_msg = f"Enhanced validation failed: {e}"
            print(f"  ✗ {error_msg}")
            self.issues.append(error_msg)
            return {'error': error_msg}
    
    def test_tts_factory(self) -> Dict[str, Any]:
        """Test TTSFactory initialization and methods"""
        print("\n🏭 TTS Factory Test")
        print("-" * 30)
        
        try:
            # Test factory initialization
            factory = TTSFactory()
            print("  ✓ TTSFactory initialized")
            
            # Test get_available_providers method
            try:
                providers = factory.get_available_providers()
                print(f"  ✓ Available providers: {list(providers.keys())}")
                
                if not providers:
                    self.warnings.append("No TTS providers are available")
                
                return {
                    'initialized': True,
                    'available_providers': list(providers.keys()),
                    'provider_count': len(providers)
                }
                
            except AttributeError as e:
                error_msg = f"TTSFactory missing method: {e}"
                print(f"  ✗ {error_msg}")
                self.issues.append(error_msg)
                return {'initialized': True, 'method_error': error_msg}
                
        except Exception as e:
            error_msg = f"TTSFactory initialization failed: {e}"
            print(f"  ✗ {error_msg}")
            self.issues.append(error_msg)
            return {'initialized': False, 'error': error_msg}
    
    def test_basic_provider_functionality(self) -> Dict[str, Any]:
        """Test basic provider functionality"""
        print("\n🎤 Provider Functionality Test")
        print("-" * 30)
        
        results = {}
        
        # Test individual providers
        provider_classes = {
            'elevenlabs': 'utils.tts.elevenlabs_provider.ElevenLabsProvider',
            'gemini': 'utils.tts.gemini_tts_provider.GeminiTTSProvider'
        }
        
        for provider_name, class_path in provider_classes.items():
            try:
                module_name, class_name = class_path.rsplit('.', 1)
                module = __import__(module_name, fromlist=[class_name])
                provider_class = getattr(module, class_name)
                
                # Test provider initialization
                api_key_file = f"{provider_name.replace('elevenlabs', 'voice')}_secret.txt"
                if provider_name == 'elevenlabs':
                    api_key_file = 'voice_secret.txt'
                elif provider_name == 'gemini':
                    api_key_file = 'gemini_secret.txt'
                
                provider = provider_class(api_key_file)
                print(f"  ✓ {provider_name} provider initialized")
                
                # Test validation
                is_valid, error = provider.validate_config()
                if is_valid:
                    print(f"  ✓ {provider_name} provider validation passed")
                    results[provider_name] = {'initialized': True, 'valid': True}
                else:
                    print(f"  ✗ {provider_name} provider validation failed: {error}")
                    results[provider_name] = {'initialized': True, 'valid': False, 'error': error}
                    self.issues.append(f"{provider_name} provider validation failed: {error}")
                
            except Exception as e:
                error_msg = f"{provider_name} provider test failed: {e}"
                print(f"  ✗ {error_msg}")
                results[provider_name] = {'initialized': False, 'error': error_msg}
                self.issues.append(error_msg)
        
        return results
    
    def generate_summary(self) -> Dict[str, Any]:
        """Generate diagnostic summary"""
        print("\n📊 Diagnostic Summary")
        print("=" * 60)
        
        summary = {
            'total_issues': len(self.issues),
            'total_warnings': len(self.warnings),
            'total_info': len(self.info),
            'issues': self.issues,
            'warnings': self.warnings,
            'info': self.info
        }
        
        if self.issues:
            print(f"\n❌ Issues Found ({len(self.issues)}):")
            for i, issue in enumerate(self.issues, 1):
                print(f"  {i}. {issue}")
        
        if self.warnings:
            print(f"\n⚠️  Warnings ({len(self.warnings)}):")
            for i, warning in enumerate(self.warnings, 1):
                print(f"  {i}. {warning}")
        
        if not self.issues and not self.warnings:
            print("\n✅ No issues found! TTS system appears to be configured correctly.")
        
        # Recommendations
        print(f"\n💡 Recommendations:")
        if self.issues:
            print("  1. Address the issues listed above")
            print("  2. Verify API key files contain valid keys")
            print("  3. Check file permissions and paths")
            print("  4. Ensure all required dependencies are installed")
        else:
            print("  1. Try running a simple TTS test")
            print("  2. Monitor logs for any runtime issues")
            print("  3. Consider running performance tests")
        
        return summary


def main():
    """Main diagnostic function"""
    diagnostic = TTSDiagnostic()
    results = diagnostic.run_all_diagnostics()
    
    # Save results to file
    output_file = diagnostic.project_root / "tts_diagnostic_results.json"
    try:
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
        print(f"\n💾 Diagnostic results saved to: {output_file}")
    except Exception as e:
        print(f"\n⚠️  Could not save results: {e}")
    
    # Exit with appropriate code
    exit_code = 1 if results['summary']['total_issues'] > 0 else 0
    sys.exit(exit_code)


if __name__ == "__main__":
    main()