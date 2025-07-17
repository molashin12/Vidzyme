"""
TTS System Diagnostic Utility
Helps troubleshoot API key issues and system configuration problems.
"""

import os
import sys
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class TTSDiagnostic:
    """Comprehensive diagnostic utility for TTS system."""
    
    def __init__(self, project_root: Optional[str] = None):
        self.project_root = Path(project_root) if project_root else Path.cwd()
        self.issues = []
        self.warnings = []
        self.info = []
    
    def run_full_diagnostic(self) -> Dict:
        """Run complete diagnostic check."""
        logger.info("Starting TTS System Diagnostic...")
        
        results = {
            'system_info': self._check_system_info(),
            'file_structure': self._check_file_structure(),
            'api_keys': self._check_api_keys(),
            'imports': self._check_imports(),
            'configuration': self._check_configuration(),
            'permissions': self._check_permissions(),
            'issues': self.issues,
            'warnings': self.warnings,
            'info': self.info
        }
        
        self._print_summary(results)
        return results
    
    def _check_system_info(self) -> Dict:
        """Check basic system information."""
        info = {
            'python_version': sys.version,
            'working_directory': str(Path.cwd()),
            'project_root': str(self.project_root),
            'platform': sys.platform
        }
        
        self.info.append(f"Python version: {sys.version}")
        self.info.append(f"Working directory: {Path.cwd()}")
        self.info.append(f"Project root: {self.project_root}")
        
        return info
    
    def _check_file_structure(self) -> Dict:
        """Check if required files and directories exist."""
        required_files = [
            'voice_secret.txt',
            'gemini_secret.txt',
            'utils/voice_gen.py',
            'utils/tts_config.py',
            'utils/tts/__init__.py',
            'utils/tts/base_provider.py',
            'utils/tts/elevenlabs_provider.py',
            'utils/tts/gemini_tts_provider.py',
            'utils/tts/tts_factory.py'
        ]
        
        file_status = {}
        missing_files = []
        
        for file_path in required_files:
            full_path = self.project_root / file_path
            exists = full_path.exists()
            file_status[file_path] = {
                'exists': exists,
                'path': str(full_path),
                'size': full_path.stat().st_size if exists else 0
            }
            
            if not exists:
                missing_files.append(file_path)
                self.issues.append(f"Missing required file: {file_path}")
            else:
                self.info.append(f"Found: {file_path} ({full_path.stat().st_size} bytes)")
        
        return {
            'file_status': file_status,
            'missing_files': missing_files,
            'all_files_present': len(missing_files) == 0
        }
    
    def _check_api_keys(self) -> Dict:
        """Check API key files and validate their content."""
        api_key_files = {
            'elevenlabs': 'voice_secret.txt',
            'gemini': 'gemini_secret.txt'
        }
        
        key_status = {}
        
        for provider, filename in api_key_files.items():
            file_path = self.project_root / filename
            status = {
                'file_exists': file_path.exists(),
                'readable': False,
                'content_length': 0,
                'appears_valid': False,
                'error': None
            }
            
            if file_path.exists():
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read().strip()
                    
                    status['readable'] = True
                    status['content_length'] = len(content)
                    
                    # Basic validation
                    if provider == 'elevenlabs':
                        status['appears_valid'] = content.startswith('sk_') and len(content) > 20
                    elif provider == 'gemini':
                        status['appears_valid'] = content.startswith('AIza') and len(content) > 20
                    
                    if status['appears_valid']:
                        self.info.append(f"{provider} API key appears valid ({len(content)} chars)")
                    else:
                        self.warnings.append(f"{provider} API key format may be invalid")
                        
                except Exception as e:
                    status['error'] = str(e)
                    self.issues.append(f"Cannot read {filename}: {e}")
            else:
                self.issues.append(f"API key file missing: {filename}")
            
            key_status[provider] = status
        
        return key_status
    
    def _check_imports(self) -> Dict:
        """Check if TTS modules can be imported."""
        import_status = {}
        
        # Test imports
        imports_to_test = [
            ('utils.voice_gen', 'voice_gen'),
            ('utils.tts_config', 'tts_config'),
            ('utils.tts.base_provider', 'base_provider'),
            ('utils.tts.elevenlabs_provider', 'elevenlabs_provider'),
            ('utils.tts.gemini_tts_provider', 'gemini_provider'),
            ('utils.tts.tts_factory', 'tts_factory')
        ]
        
        for module_name, short_name in imports_to_test:
            try:
                __import__(module_name)
                import_status[short_name] = {'success': True, 'error': None}
                self.info.append(f"Successfully imported: {module_name}")
            except Exception as e:
                import_status[short_name] = {'success': False, 'error': str(e)}
                self.issues.append(f"Import failed for {module_name}: {e}")
        
        # Test TTS system availability
        try:
            sys.path.insert(0, str(self.project_root))
            from utils.voice_gen import TTS_SYSTEM_AVAILABLE
            import_status['tts_system_available'] = TTS_SYSTEM_AVAILABLE
            
            if TTS_SYSTEM_AVAILABLE:
                self.info.append("TTS_SYSTEM_AVAILABLE = True")
            else:
                self.warnings.append("TTS_SYSTEM_AVAILABLE = False")
                
        except Exception as e:
            import_status['tts_system_available'] = False
            self.issues.append(f"Cannot check TTS_SYSTEM_AVAILABLE: {e}")
        
        return import_status
    
    def _check_configuration(self) -> Dict:
        """Check TTS configuration."""
        config_status = {}
        
        try:
            sys.path.insert(0, str(self.project_root))
            from utils.tts_config import TTSConfig
            
            config = TTSConfig()
            config_status = {
                'config_loaded': True,
                'default_provider': config.default_provider,
                'quality_preference': config.quality_preference,
                'providers': list(config.providers.keys()),
                'voice_mappings': list(config.voice_mappings.keys())
            }
            
            self.info.append(f"Configuration loaded successfully")
            self.info.append(f"Default provider: {config.default_provider}")
            self.info.append(f"Available providers: {list(config.providers.keys())}")
            
        except Exception as e:
            config_status = {'config_loaded': False, 'error': str(e)}
            self.issues.append(f"Configuration loading failed: {e}")
        
        return config_status
    
    def _check_permissions(self) -> Dict:
        """Check file permissions."""
        permission_status = {}
        
        files_to_check = ['voice_secret.txt', 'gemini_secret.txt']
        
        for filename in files_to_check:
            file_path = self.project_root / filename
            if file_path.exists():
                try:
                    # Test read permission
                    with open(file_path, 'r') as f:
                        f.read(1)
                    permission_status[filename] = {'readable': True}
                    self.info.append(f"File readable: {filename}")
                except Exception as e:
                    permission_status[filename] = {'readable': False, 'error': str(e)}
                    self.issues.append(f"Permission issue with {filename}: {e}")
        
        return permission_status
    
    def _print_summary(self, results: Dict):
        """Print diagnostic summary."""
        print("\n" + "="*60)
        print("TTS SYSTEM DIAGNOSTIC SUMMARY")
        print("="*60)
        
        # Issues
        if self.issues:
            print(f"\n🔴 ISSUES FOUND ({len(self.issues)}):")
            for issue in self.issues:
                print(f"  ❌ {issue}")
        
        # Warnings
        if self.warnings:
            print(f"\n🟡 WARNINGS ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  ⚠️  {warning}")
        
        # Info
        if self.info:
            print(f"\n🟢 SYSTEM INFO ({len(self.info)}):")
            for info in self.info[:10]:  # Limit to first 10
                print(f"  ℹ️  {info}")
            if len(self.info) > 10:
                print(f"  ... and {len(self.info) - 10} more items")
        
        # Overall status
        print(f"\n{'='*60}")
        if not self.issues:
            print("✅ NO CRITICAL ISSUES FOUND")
            print("The TTS system should be working correctly.")
        else:
            print("❌ CRITICAL ISSUES DETECTED")
            print("Please resolve the issues above before using the TTS system.")
        
        print("="*60)
    
    def get_fix_suggestions(self) -> List[str]:
        """Get suggestions for fixing common issues."""
        suggestions = []
        
        if any("Missing required file" in issue for issue in self.issues):
            suggestions.append("Run the TTS system setup again to create missing files")
        
        if any("API key" in issue for issue in self.issues):
            suggestions.append("Ensure API key files exist and contain valid keys")
            suggestions.append("Check file permissions for API key files")
        
        if any("Import failed" in issue for issue in self.issues):
            suggestions.append("Check Python path and module structure")
            suggestions.append("Ensure all TTS modules are in the correct location")
        
        if any("TTS_SYSTEM_AVAILABLE = False" in warning for warning in self.warnings):
            suggestions.append("Check import errors in the TTS modules")
            suggestions.append("Verify all dependencies are installed")
        
        return suggestions


def main():
    """Run diagnostic utility."""
    print("TTS System Diagnostic Utility")
    print("=" * 40)
    
    # Allow custom project root
    project_root = input("Enter project root path (or press Enter for current directory): ").strip()
    if not project_root:
        project_root = None
    
    diagnostic = TTSDiagnostic(project_root)
    results = diagnostic.run_full_diagnostic()
    
    # Show fix suggestions
    suggestions = diagnostic.get_fix_suggestions()
    if suggestions:
        print(f"\n🔧 FIX SUGGESTIONS:")
        for i, suggestion in enumerate(suggestions, 1):
            print(f"  {i}. {suggestion}")
    
    # Save detailed results
    import json
    results_file = Path("tts_diagnostic_results.json")
    with open(results_file, 'w') as f:
        # Convert Path objects to strings for JSON serialization
        json_results = json.loads(json.dumps(results, default=str))
        json.dump(json_results, f, indent=2)
    
    print(f"\n📄 Detailed results saved to: {results_file}")


if __name__ == "__main__":
    main()