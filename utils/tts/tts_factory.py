"""
TTS Provider Factory

Factory class for creating and managing TTS providers.
Handles provider selection, fallback logic, and configuration.
"""

import os
from typing import Dict, List, Optional, Union
from .base_provider import TTSProvider, VoiceConfig
from .elevenlabs_provider import ElevenLabsProvider
from .gemini_tts_provider import GeminiTTSProvider


class TTSFactory:
    """Factory for creating and managing TTS providers"""
    
    PROVIDERS = {
        'elevenlabs': ElevenLabsProvider,
        'gemini': GeminiTTSProvider
    }
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or self._load_default_config()
        self._providers = {}
        self._initialize_providers()
    
    def _load_default_config(self) -> Dict:
        """Load default TTS configuration"""
        import json
        
        # Try to load from config file first
        config_path = os.path.join(os.path.dirname(__file__), '..', '..', 'config', 'tts_config.json')
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Warning: Failed to load TTS config from {config_path}: {e}")
        
        # Fallback to hardcoded defaults
        return {
            'primary_provider': 'elevenlabs',
            'fallback_provider': 'gemini',
            'cost_threshold': 0.10,  # Switch to cheaper provider above this cost
            'quality_preference': 'high',  # 'high', 'standard', 'cost_effective'
            'auto_fallback': True,
            'providers': {
                'elevenlabs': {
                    'enabled': True,
                    'priority': 1
                },
                'gemini': {
                    'enabled': True,
                    'priority': 2
                }
            },
            'voice_mappings': {
                'default': {
                    'elevenlabs': 'Rachel',
                    'gemini': 'en-US-Journey-D'
                }
            },
            'default_settings': {
                'voice': 'default',
                'speed': 1.0,
                'pitch': 1.0,
                'stability': 0.5,
                'similarity_boost': 0.5,
                'style': 0.0,
                'use_speaker_boost': True
            }
        }
    
    def _initialize_providers(self):
        """Initialize available providers"""
        # Define API key file mappings
        api_key_files = {
            'elevenlabs': 'voice_secret.txt',
            'gemini': 'gemini_secret.txt'
        }
        
        for provider_name, provider_class in self.PROVIDERS.items():
            if self.config['providers'].get(provider_name, {}).get('enabled', False):
                try:
                    # Get the appropriate API key file for this provider
                    api_key_file = api_key_files.get(provider_name)
                    if not api_key_file:
                        print(f"✗ No API key file defined for {provider_name}")
                        continue
                    
                    # Initialize provider with API key file
                    provider = provider_class(api_key_file)
                    is_valid, error = provider.validate_config()
                    
                    if is_valid:
                        self._providers[provider_name] = provider
                        print(f"✓ {provider_name.title()} TTS provider initialized")
                    else:
                        print(f"✗ {provider_name.title()} TTS provider failed validation: {error}")
                        
                except Exception as e:
                    print(f"✗ Failed to initialize {provider_name} provider: {str(e)}")
    
    def get_provider(self, provider_name: Optional[str] = None) -> TTSProvider:
        """Get a specific provider or the best available provider"""
        if provider_name:
            if provider_name in self._providers:
                return self._providers[provider_name]
            else:
                raise ValueError(f"Provider '{provider_name}' not available")
        
        # Return best provider based on configuration
        return self._get_best_provider()
    
    def _get_best_provider(self) -> TTSProvider:
        """Get the best provider based on configuration and availability"""
        primary = self.config.get('primary_provider')
        
        if primary and primary in self._providers:
            return self._providers[primary]
        
        # Fallback to any available provider
        if self._providers:
            return list(self._providers.values())[0]
        
        raise RuntimeError("No TTS providers available")
    
    def get_optimal_provider_for_text(self, text: str, quality_preference: Optional[str] = None) -> TTSProvider:
        """Get optimal provider based on text length, cost, and quality preferences"""
        character_count = len(text)
        quality_pref = quality_preference or self.config.get('quality_preference', 'high')
        cost_threshold = self.config.get('cost_threshold', 0.10)
        
        available_providers = list(self._providers.values())
        if not available_providers:
            raise RuntimeError("No TTS providers available")
        
        # Calculate costs for each provider
        provider_costs = []
        for provider in available_providers:
            cost = provider.get_cost_estimate(character_count)
            provider_costs.append((provider, cost))
        
        # Sort by cost
        provider_costs.sort(key=lambda x: x[1])
        
        # Selection logic based on preferences
        if quality_pref == 'cost_effective':
            # Always choose cheapest
            return provider_costs[0][0]
        
        elif quality_pref == 'high':
            # Choose ElevenLabs if available and cost is reasonable
            for provider, cost in provider_costs:
                if isinstance(provider, ElevenLabsProvider):
                    if cost <= cost_threshold or len(provider_costs) == 1:
                        return provider
            # Fallback to cheapest if ElevenLabs too expensive
            return provider_costs[0][0]
        
        else:  # 'standard'
            # Balance cost and quality
            if provider_costs[0][1] <= cost_threshold:
                return provider_costs[0][0]  # Cheapest if under threshold
            else:
                # Find best value provider
                for provider, cost in provider_costs:
                    if cost <= cost_threshold * 2:  # Within 2x threshold
                        return provider
                return provider_costs[0][0]  # Fallback to cheapest
    
    def text_to_speech_with_fallback(
        self, 
        text: str, 
        voice_config: VoiceConfig, 
        output_path: str,
        preferred_provider: Optional[str] = None
    ):
        """Convert text to speech with automatic fallback"""
        
        # Get primary provider
        if preferred_provider:
            try:
                provider = self.get_provider(preferred_provider)
                result = provider.text_to_speech(text, voice_config, output_path)
                if result.success:
                    return result
            except Exception as e:
                print(f"Preferred provider {preferred_provider} failed: {str(e)}")
        
        # Try optimal provider
        try:
            provider = self.get_optimal_provider_for_text(text)
            result = provider.text_to_speech(text, voice_config, output_path)
            if result.success:
                return result
        except Exception as e:
            print(f"Optimal provider failed: {str(e)}")
        
        # Try all available providers as fallback
        if self.config.get('auto_fallback', True):
            for provider_name, provider in self._providers.items():
                try:
                    print(f"Trying fallback provider: {provider_name}")
                    result = provider.text_to_speech(text, voice_config, output_path)
                    if result.success:
                        return result
                except Exception as e:
                    print(f"Fallback provider {provider_name} failed: {str(e)}")
                    continue
        
        # All providers failed
        from .base_provider import TTSResult
        return TTSResult(
            success=False,
            error_message="All TTS providers failed",
            character_count=len(text)
        )
    
    def get_all_voices(self) -> List[Dict]:
        """Get all available voices from all providers"""
        all_voices = []
        for provider_name, provider in self._providers.items():
            try:
                voices = provider.get_available_voices()
                all_voices.extend(voices)
            except Exception as e:
                print(f"Failed to get voices from {provider_name}: {str(e)}")
        
        return all_voices
    
    def get_available_providers(self) -> Dict[str, TTSProvider]:
        """Get dictionary of available providers"""
        return self._providers.copy()
    
    def get_optimal_provider(self, text: str, quality_preference: Optional[str] = None) -> str:
        """Get optimal provider name based on text length, cost, and quality preferences"""
        provider = self.get_optimal_provider_for_text(text, quality_preference)
        # Find the provider name
        for name, prov in self._providers.items():
            if prov is provider:
                return name
        return "unknown"
    
    def get_provider_comparison(self, character_count: int = 1000) -> List[Dict]:
        """Get comparison of all providers"""
        comparison = []
        
        for provider_name, provider in self._providers.items():
            try:
                info = provider.get_provider_info()
                info['cost_estimate'] = provider.get_cost_estimate(character_count)
                info['available'] = True
                comparison.append(info)
            except Exception as e:
                comparison.append({
                    'name': provider_name,
                    'available': False,
                    'error': str(e)
                })
        
        return comparison
    
    def update_config(self, new_config: Dict):
        """Update configuration and reinitialize providers"""
        self.config.update(new_config)
        self._providers.clear()
        self._initialize_providers()