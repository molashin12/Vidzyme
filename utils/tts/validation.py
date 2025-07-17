"""
Validation utilities for the TTS system.
Provides comprehensive validation for API keys, configuration, and system requirements.
"""

import os
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any, Union
import json

from .exceptions import APIKeyError, ConfigurationError, FileOperationError
from .logging_utils import get_logger


logger = get_logger()


class APIKeyValidator:
    """Validator for API keys and authentication."""
    
    # Common API key patterns
    PATTERNS = {
        'elevenlabs': {
            'pattern': r'^sk_[a-f0-9]{40,}$',
            'description': 'ElevenLabs API key (starts with sk_, followed by hex characters)',
            'example': 'sk_1234567890abcdef1234567890abcdef12345678'
        },
        'openai': {
            'pattern': r'^sk-[A-Za-z0-9]{48}$',
            'description': 'OpenAI API key (starts with sk-, 48 chars)',
            'example': 'sk-1234567890abcdef1234567890abcdef12345678901234'
        },
        'google': {
            'pattern': r'^[A-Za-z0-9_-]{39}$',
            'description': 'Google API key (39 alphanumeric chars with _ or -)',
            'example': 'AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI'
        },
        'gemini': {
            'pattern': r'^[A-Za-z0-9_-]{39}$',
            'description': 'Gemini API key (39 alphanumeric chars with _ or -)',
            'example': 'AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI'
        }
    }
    
    @classmethod
    def validate_key_format(cls, api_key: str, provider: str) -> Tuple[bool, str]:
        """
        Validate API key format for a specific provider.
        
        Returns:
            Tuple of (is_valid, message)
        """
        if not api_key or not api_key.strip():
            return False, "API key is empty"
        
        api_key = api_key.strip()
        
        # Check for common issues
        if len(api_key) < 10:
            return False, "API key is too short"
        
        if api_key.startswith('your_') or api_key.startswith('YOUR_'):
            return False, "API key appears to be a placeholder"
        
        if api_key.startswith('sk-') and len(api_key) < 20:
            return False, "OpenAI-style key is too short"
        
        # Provider-specific validation
        provider_lower = provider.lower()
        if provider_lower in cls.PATTERNS:
            pattern_info = cls.PATTERNS[provider_lower]
            if re.match(pattern_info['pattern'], api_key):
                return True, "API key format is valid"
            else:
                return False, f"API key format invalid. Expected: {pattern_info['description']}"
        
        # Generic validation for unknown providers
        if len(api_key) >= 20 and api_key.replace('-', '').replace('_', '').isalnum():
            return True, "API key format appears valid (generic validation)"
        
        return False, "API key format does not match expected patterns"
    
    @classmethod
    def validate_key_file(cls, file_path: str, provider: str) -> Tuple[bool, str, Optional[str]]:
        """
        Validate API key file and its contents.
        
        Returns:
            Tuple of (is_valid, message, api_key)
        """
        path = Path(file_path)
        
        # Check file existence
        if not path.exists():
            return False, f"API key file not found: {file_path}", None
        
        # Check file permissions
        if not os.access(path, os.R_OK):
            return False, f"Cannot read API key file: {file_path}", None
        
        try:
            # Read file content
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            if not content:
                return False, f"API key file is empty: {file_path}", None
            
            # Validate key format
            is_valid, format_message = cls.validate_key_format(content, provider)
            
            if is_valid:
                logger.info(f"API key validation successful", provider=provider, file_path=file_path)
                return True, f"API key file is valid: {format_message}", content
            else:
                logger.error(f"API key validation failed", provider=provider, file_path=file_path, reason=format_message)
                return False, f"Invalid API key in {file_path}: {format_message}", content
                
        except UnicodeDecodeError:
            return False, f"API key file has invalid encoding: {file_path}", None
        except Exception as e:
            return False, f"Error reading API key file {file_path}: {str(e)}", None
    
    @classmethod
    def get_key_requirements(cls, provider: str) -> Dict[str, str]:
        """Get API key requirements for a provider."""
        provider_lower = provider.lower()
        if provider_lower in cls.PATTERNS:
            return cls.PATTERNS[provider_lower]
        
        return {
            'pattern': r'^[A-Za-z0-9_-]{20,}$',
            'description': 'At least 20 alphanumeric characters',
            'example': 'your_api_key_here'
        }


class ConfigValidator:
    """Validator for configuration files and settings."""
    
    @classmethod
    def validate_tts_config(cls, config: Dict[str, Any]) -> Tuple[bool, List[str], List[str]]:
        """
        Validate TTS configuration.
        
        Returns:
            Tuple of (is_valid, errors, warnings)
        """
        errors = []
        warnings = []
        
        # Required top-level keys
        required_keys = ['providers', 'voice_mappings', 'default_settings']
        for key in required_keys:
            if key not in config:
                errors.append(f"Missing required configuration key: {key}")
        
        # Validate providers section
        if 'providers' in config:
            providers = config['providers']
            if not isinstance(providers, dict):
                errors.append("'providers' must be a dictionary")
            else:
                for provider_name, provider_config in providers.items():
                    provider_errors, provider_warnings = cls._validate_provider_config(
                        provider_name, provider_config
                    )
                    errors.extend(provider_errors)
                    warnings.extend(provider_warnings)
        
        # Validate voice mappings
        if 'voice_mappings' in config:
            voice_mappings = config['voice_mappings']
            if not isinstance(voice_mappings, dict):
                errors.append("'voice_mappings' must be a dictionary")
            else:
                for lang, mapping in voice_mappings.items():
                    if not isinstance(mapping, dict):
                        errors.append(f"Voice mapping for '{lang}' must be a dictionary")
        
        # Validate default settings
        if 'default_settings' in config:
            default_settings = config['default_settings']
            if not isinstance(default_settings, dict):
                errors.append("'default_settings' must be a dictionary")
            else:
                settings_errors, settings_warnings = cls._validate_default_settings(default_settings)
                errors.extend(settings_errors)
                warnings.extend(settings_warnings)
        
        is_valid = len(errors) == 0
        return is_valid, errors, warnings
    
    @classmethod
    def _validate_provider_config(cls, provider_name: str, config: Dict[str, Any]) -> Tuple[List[str], List[str]]:
        """Validate individual provider configuration."""
        errors = []
        warnings = []
        
        # Required provider keys
        required_keys = ['enabled', 'api_key_file']
        for key in required_keys:
            if key not in config:
                errors.append(f"Provider '{provider_name}' missing required key: {key}")
        
        # Validate API key file
        if 'api_key_file' in config:
            api_key_file = config['api_key_file']
            if not isinstance(api_key_file, str):
                errors.append(f"Provider '{provider_name}' api_key_file must be a string")
            elif not api_key_file.strip():
                errors.append(f"Provider '{provider_name}' api_key_file cannot be empty")
        
        # Validate enabled flag
        if 'enabled' in config:
            enabled = config['enabled']
            if not isinstance(enabled, bool):
                warnings.append(f"Provider '{provider_name}' enabled should be boolean")
        
        # Validate optional settings
        if 'default_voice' in config and not isinstance(config['default_voice'], str):
            warnings.append(f"Provider '{provider_name}' default_voice should be string")
        
        if 'cost_per_char' in config:
            cost = config['cost_per_char']
            if not isinstance(cost, (int, float)) or cost < 0:
                warnings.append(f"Provider '{provider_name}' cost_per_char should be non-negative number")
        
        return errors, warnings
    
    @classmethod
    def _validate_default_settings(cls, settings: Dict[str, Any]) -> Tuple[List[str], List[str]]:
        """Validate default settings."""
        errors = []
        warnings = []
        
        # Validate quality preference
        if 'quality_preference' in settings:
            quality = settings['quality_preference']
            valid_qualities = ['cost', 'balanced', 'quality']
            if quality not in valid_qualities:
                warnings.append(f"quality_preference should be one of: {valid_qualities}")
        
        # Validate auto_fallback
        if 'auto_fallback' in settings:
            auto_fallback = settings['auto_fallback']
            if not isinstance(auto_fallback, bool):
                warnings.append("auto_fallback should be boolean")
        
        # Validate max_retries
        if 'max_retries' in settings:
            max_retries = settings['max_retries']
            if not isinstance(max_retries, int) or max_retries < 0:
                warnings.append("max_retries should be non-negative integer")
        
        return errors, warnings


class SystemValidator:
    """Validator for system requirements and dependencies."""
    
    @classmethod
    def validate_dependencies(cls) -> Tuple[bool, List[str], List[str]]:
        """
        Validate system dependencies.
        
        Returns:
            Tuple of (all_available, missing_required, missing_optional)
        """
        required_modules = [
            'requests',
            'pathlib',
            'json',
            'os'
        ]
        
        optional_modules = [
            'psutil',  # For memory monitoring
            'typing_extensions',  # For enhanced type hints
        ]
        
        missing_required = []
        missing_optional = []
        
        # Check required modules
        for module in required_modules:
            try:
                __import__(module)
                logger.debug(f"Required module available: {module}")
            except ImportError:
                missing_required.append(module)
                logger.error(f"Required module missing: {module}")
        
        # Check optional modules
        for module in optional_modules:
            try:
                __import__(module)
                logger.debug(f"Optional module available: {module}")
            except ImportError:
                missing_optional.append(module)
                logger.debug(f"Optional module missing: {module}")
        
        all_available = len(missing_required) == 0
        return all_available, missing_required, missing_optional
    
    @classmethod
    def validate_file_structure(cls, base_path: str) -> Tuple[bool, List[str], List[str]]:
        """
        Validate expected file structure.
        
        Returns:
            Tuple of (structure_valid, missing_files, missing_directories)
        """
        base = Path(base_path)
        
        expected_files = [
            'utils/tts/__init__.py',
            'utils/tts/base_provider.py',
            'utils/tts/elevenlabs_provider.py',
            'utils/tts/gemini_tts_provider.py',
            'utils/tts/tts_factory.py',
            'utils/tts_config.py',
            'utils/voice_gen.py'
        ]
        
        expected_dirs = [
            'utils',
            'utils/tts',
            'outputs'
        ]
        
        missing_files = []
        missing_dirs = []
        
        # Check directories
        for dir_path in expected_dirs:
            full_path = base / dir_path
            if not full_path.exists() or not full_path.is_dir():
                missing_dirs.append(str(full_path))
        
        # Check files
        for file_path in expected_files:
            full_path = base / file_path
            if not full_path.exists() or not full_path.is_file():
                missing_files.append(str(full_path))
        
        structure_valid = len(missing_files) == 0 and len(missing_dirs) == 0
        return structure_valid, missing_files, missing_dirs


class ValidationReport:
    """Comprehensive validation report."""
    
    def __init__(self):
        self.sections = {}
        self.overall_status = True
    
    def add_section(self, name: str, status: bool, details: Dict[str, Any]):
        """Add a validation section."""
        self.sections[name] = {
            'status': status,
            'details': details
        }
        if not status:
            self.overall_status = False
    
    def get_summary(self) -> Dict[str, Any]:
        """Get validation summary."""
        passed = sum(1 for section in self.sections.values() if section['status'])
        total = len(self.sections)
        
        return {
            'overall_status': self.overall_status,
            'sections_passed': passed,
            'sections_total': total,
            'sections': self.sections
        }
    
    def print_report(self):
        """Print formatted validation report."""
        print("\n" + "="*60)
        print("TTS SYSTEM VALIDATION REPORT")
        print("="*60)
        
        for section_name, section_data in self.sections.items():
            status_icon = "✓" if section_data['status'] else "✗"
            print(f"\n{status_icon} {section_name.upper()}")
            
            details = section_data['details']
            for key, value in details.items():
                if isinstance(value, list) and value:
                    print(f"  {key}:")
                    for item in value:
                        print(f"    - {item}")
                elif value:
                    print(f"  {key}: {value}")
        
        print(f"\n{'='*60}")
        status_text = "PASSED" if self.overall_status else "FAILED"
        print(f"OVERALL STATUS: {status_text}")
        print("="*60)


def run_comprehensive_validation(base_path: str = None) -> ValidationReport:
    """Run comprehensive validation of the TTS system."""
    if base_path is None:
        base_path = os.getcwd()
    
    report = ValidationReport()
    
    # 1. System Dependencies
    deps_ok, missing_req, missing_opt = SystemValidator.validate_dependencies()
    report.add_section('dependencies', deps_ok, {
        'missing_required': missing_req,
        'missing_optional': missing_opt
    })
    
    # 2. File Structure
    struct_ok, missing_files, missing_dirs = SystemValidator.validate_file_structure(base_path)
    report.add_section('file_structure', struct_ok, {
        'missing_files': missing_files,
        'missing_directories': missing_dirs
    })
    
    # 3. API Key Files
    api_key_results = {}
    api_keys_ok = True
    
    key_files = {
        'elevenlabs': os.path.join(base_path, 'voice_secret.txt'),
        'gemini': os.path.join(base_path, 'gemini_secret.txt')
    }
    
    for provider, key_file in key_files.items():
        is_valid, message, key = APIKeyValidator.validate_key_file(key_file, provider)
        api_key_results[provider] = {
            'file_path': key_file,
            'status': is_valid,
            'message': message
        }
        if not is_valid:
            api_keys_ok = False
    
    report.add_section('api_keys', api_keys_ok, api_key_results)
    
    # 4. Configuration
    config_ok = True
    config_details = {}
    
    try:
        config_file = os.path.join(base_path, 'utils', 'tts_config.py')
        if os.path.exists(config_file):
            # Try to import and validate config
            import sys
            sys.path.insert(0, os.path.join(base_path, 'utils'))
            try:
                import tts_config
                config = tts_config.TTSConfig().config
                is_valid, errors, warnings = ConfigValidator.validate_tts_config(config)
                config_details = {
                    'config_file': config_file,
                    'validation_passed': is_valid,
                    'errors': errors,
                    'warnings': warnings
                }
                config_ok = is_valid
            except Exception as e:
                config_details = {
                    'config_file': config_file,
                    'import_error': str(e)
                }
                config_ok = False
        else:
            config_details = {'error': 'Configuration file not found'}
            config_ok = False
    except Exception as e:
        config_details = {'error': f'Configuration validation failed: {str(e)}'}
        config_ok = False
    
    report.add_section('configuration', config_ok, config_details)
    
    return report