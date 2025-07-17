"""
TTS Configuration Management

Centralized configuration for TTS providers and voice settings.
"""

import os
import json
from typing import Dict, Any


class TTSConfig:
    """TTS configuration manager"""
    
    def __init__(self, config_path: str = None):
        self.config_path = config_path or os.path.join(
            os.path.dirname(__file__), '..', '..', 'tts_config.json'
        )
        self.config = self._load_config()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file or create default"""
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading TTS config: {e}")
                return self._get_default_config()
        else:
            config = self._get_default_config()
            self.save_config(config)
            return config
    
    def _get_default_config(self) -> Dict[str, Any]:
        """Get default TTS configuration"""
        return {
            "version": "1.0",
            "primary_provider": "elevenlabs",
            "fallback_provider": "gemini",
            "cost_threshold": 0.10,
            "quality_preference": "high",
            "auto_fallback": True,
            "providers": {
                "elevenlabs": {
                    "enabled": True,
                    "api_key_file": "voice_secret.txt",
                    "priority": 1,
                    "default_model": "eleven_multilingual_v2",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.5,
                        "style": 0.0,
                        "use_speaker_boost": True
                    }
                },
                "gemini": {
                    "enabled": True,
                    "api_key_file": "gemini_secret.txt",
                    "priority": 2,
                    "default_model": "gemini-2.0-flash-exp",
                    "generation_config": {
                        "temperature": 0.1,
                        "maxOutputTokens": 1000
                    }
                }
            },
            "voice_mappings": {
                "arabic_male": {
                    "elevenlabs": "pNInz6obpgDQGcFmaJgB",
                    "gemini": "onyx"
                },
                "arabic_female": {
                    "elevenlabs": "Xb7hH8MSUJpSbSDYk0k2",
                    "gemini": "nova"
                },
                "english_male": {
                    "elevenlabs": "29vD33N1CtxCmqQRPOHJ",
                    "gemini": "echo"
                },
                "english_female": {
                    "elevenlabs": "21m00Tcm4TlvDq8ikWAM",
                    "gemini": "shimmer"
                },
                "default": {
                    "elevenlabs": "Rachel",
                    "gemini": "en-US-Journey-D"
                }
            },
            "default_settings": {
                "voice": "default",
                "speed": 1.0,
                "pitch": 1.0,
                "stability": 0.5,
                "similarity_boost": 0.5,
                "style": 0.0,
                "use_speaker_boost": True,
                "quality_preference": "high",
                "auto_fallback": True,
                "max_retries": 3
            },
            "cost_optimization": {
                "enabled": True,
                "max_cost_per_request": 1.00,
                "prefer_cheaper_for_bulk": True,
                "bulk_threshold_chars": 5000
            },
            "quality_settings": {
                "high": {
                    "prefer_provider": "elevenlabs",
                    "max_cost_multiplier": 3.0
                },
                "standard": {
                    "prefer_provider": "auto",
                    "max_cost_multiplier": 2.0
                },
                "cost_effective": {
                    "prefer_provider": "gemini",
                    "max_cost_multiplier": 1.0
                }
            }
        }
    
    def save_config(self, config: Dict[str, Any] = None):
        """Save configuration to file"""
        config_to_save = config or self.config
        try:
            os.makedirs(os.path.dirname(self.config_path), exist_ok=True)
            with open(self.config_path, 'w') as f:
                json.dump(config_to_save, f, indent=2)
        except Exception as e:
            print(f"Error saving TTS config: {e}")
    
    def get(self, key: str, default=None):
        """Get configuration value"""
        keys = key.split('.')
        value = self.config
        
        for k in keys:
            if isinstance(value, dict) and k in value:
                value = value[k]
            else:
                return default
        
        return value
    
    def set(self, key: str, value: Any):
        """Set configuration value"""
        keys = key.split('.')
        config = self.config
        
        for k in keys[:-1]:
            if k not in config:
                config[k] = {}
            config = config[k]
        
        config[keys[-1]] = value
        self.save_config()
    
    def get_voice_for_provider(self, voice_key: str, provider: str) -> str:
        """Get voice ID for specific provider"""
        voice_mappings = self.get('voice_mappings', {})
        voice_config = voice_mappings.get(voice_key, {})
        return voice_config.get(provider, voice_config.get('elevenlabs', 'default'))
    
    def get_provider_config(self, provider: str) -> Dict[str, Any]:
        """Get configuration for specific provider"""
        return self.get(f'providers.{provider}', {})
    
    def is_provider_enabled(self, provider: str) -> bool:
        """Check if provider is enabled"""
        return self.get(f'providers.{provider}.enabled', False)
    
    def get_quality_settings(self, quality: str) -> Dict[str, Any]:
        """Get settings for quality level"""
        return self.get(f'quality_settings.{quality}', {})
    
    def update_provider_status(self, provider: str, enabled: bool):
        """Update provider enabled status"""
        self.set(f'providers.{provider}.enabled', enabled)
    
    def add_voice_mapping(self, voice_key: str, provider_voices: Dict[str, str]):
        """Add or update voice mapping"""
        current_mappings = self.get('voice_mappings', {})
        current_mappings[voice_key] = provider_voices
        self.set('voice_mappings', current_mappings)


# Global configuration instance
tts_config = TTSConfig()