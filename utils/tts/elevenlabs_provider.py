"""
ElevenLabs TTS Provider

Implementation of TTS provider for ElevenLabs API.
Maintains compatibility with existing voice_gen.py functionality.
"""

import os
import requests
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
import time

from .base_provider import TTSProvider, VoiceConfig, TTSResult
from .exceptions import APIKeyError, ProviderError, AudioGenerationError, create_http_exception
from .logging_utils import get_logger, PerformanceLogger
from .validation import APIKeyValidator


class ElevenLabsProvider(TTSProvider):
    """ElevenLabs TTS provider implementation."""
    
    def __init__(self, api_key_file: str = "voice_secret.txt"):
        self.api_key_file = api_key_file
        self.api_key = None
        self.base_url = "https://api.elevenlabs.io/v1"
        
        # Initialize logging
        self.logger = get_logger()
        self.perf_logger = PerformanceLogger(self.logger)
        
        # Load and validate API key
        self._load_api_key()
        
        # ElevenLabs pricing (approximate)
        self.cost_per_character = 0.00003  # $0.03 per 1000 characters
    
    def _load_api_key(self) -> str:
        """Load and validate API key from file."""
        try:
            # Validate the API key file
            is_valid, message, api_key = APIKeyValidator.validate_key_file(
                self.api_key_file, "elevenlabs"
            )
            
            if not is_valid:
                raise APIKeyError("elevenlabs", message, self.api_key_file)
            
            self.api_key = api_key
            self.logger.info("ElevenLabs API key loaded successfully", file_path=self.api_key_file)
            return api_key
            
        except APIKeyError:
            raise
        except Exception as e:
            raise APIKeyError(
                "elevenlabs", 
                f"Failed to load API key: {str(e)}", 
                self.api_key_file
            )
    
    def text_to_speech(
        self, 
        text: str, 
        voice_config: VoiceConfig, 
        output_file: str
    ) -> TTSResult:
        """Convert text to speech using ElevenLabs API."""
        self.perf_logger.start_timer("elevenlabs_tts")
        
        try:
            # Validate text length
            max_length = self._get_max_text_length()
            if len(text) > max_length:
                raise AudioGenerationError(
                    f"Text too long: {len(text)} chars (max: {max_length})",
                    "elevenlabs",
                    len(text)
                )
            
            # Prepare request
            url = f"{self.base_url}/text-to-speech/{voice_config.voice_id}"
            headers = {
                "Accept": "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": self.api_key
            }
            
            data = {
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {
                    "stability": voice_config.stability,
                    "similarity_boost": voice_config.similarity_boost,
                    "style": voice_config.style,
                    "use_speaker_boost": voice_config.use_speaker_boost
                }
            }
            
            self.logger.info(
                "Making ElevenLabs API request",
                voice_id=voice_config.voice_id,
                text_length=len(text),
                output_file=output_file
            )
            
            # Make API request
            response = requests.post(url, json=data, headers=headers, timeout=30)
            
            # Log API call
            self.logger.log_api_call(
                "elevenlabs",
                f"text-to-speech/{voice_config.voice_id}",
                "success" if response.status_code == 200 else "error",
                duration=self.perf_logger.end_timer("elevenlabs_tts"),
                status_code=response.status_code,
                text_length=len(text)
            )
            
            # Handle response
            if response.status_code == 200:
                # Save audio file
                output_path = Path(output_file)
                output_path.parent.mkdir(parents=True, exist_ok=True)
                
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                
                self.logger.log_file_operation(
                    "write", str(output_path), "success",
                    file_size=len(response.content)
                )
                
                return TTSResult(
                    success=True,
                    audio_file=str(output_path),
                    provider="elevenlabs",
                    cost_estimate=self.get_cost_estimate(text),
                    metadata={
                        "voice_id": voice_config.voice_id,
                        "model": "eleven_monolingual_v1",
                        "audio_size": len(response.content)
                    }
                )
            else:
                # Handle API errors
                error_msg = f"API request failed with status {response.status_code}"
                try:
                    error_data = response.json()
                    if 'detail' in error_data:
                        error_msg = error_data['detail']['message']
                except:
                    error_msg = response.text or error_msg
                
                raise create_http_exception(response.status_code, "elevenlabs", error_msg)
                
        except AudioGenerationError:
            raise
        except requests.exceptions.Timeout:
            raise ProviderError("elevenlabs", "Request timeout")
        except requests.exceptions.ConnectionError:
            raise ProviderError("elevenlabs", "Connection error")
        except Exception as e:
            self.logger.error(
                "Unexpected error in ElevenLabs TTS",
                error=str(e),
                text_length=len(text)
            )
            raise AudioGenerationError(f"Unexpected error: {str(e)}", "elevenlabs", len(text))
    
    def get_available_voices(self) -> List[Dict]:
        """Get available voices from ElevenLabs"""
        try:
            url = f"{self.base_url}/voices"
            headers = {"xi-api-key": self.api_key}
            
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                voices_data = response.json()
                return [
                    {
                        'id': voice['voice_id'],
                        'name': voice['name'],
                        'language': voice.get('labels', {}).get('language', 'en'),
                        'gender': voice.get('labels', {}).get('gender', 'unknown'),
                        'provider': 'elevenlabs'
                    }
                    for voice in voices_data.get('voices', [])
                ]
            else:
                return []
                
        except Exception:
            return []
    
    def validate_config(self) -> Tuple[bool, Optional[str]]:
        """Validate ElevenLabs configuration"""
        if not self.api_key:
            return False, "ElevenLabs API key not found"
        
        try:
            # Test API key by fetching voices
            url = f"{self.base_url}/voices"
            headers = {"xi-api-key": self.api_key}
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                return True, None
            else:
                return False, f"Invalid API key or API error: {response.status_code}"
                
        except Exception as e:
            return False, f"Connection error: {str(e)}"
    
    def get_cost_estimate(self, character_count: int) -> float:
        """Estimate cost for ElevenLabs TTS"""
        return character_count * self.cost_per_character
    
    def supports_feature(self, feature: str) -> bool:
        """Check if ElevenLabs supports a feature"""
        supported_features = {
            'voice_cloning': True,
            'emotion_control': True,
            'multi_language': True,
            'high_quality': True,
            'real_time': True,
            'multi_speaker': False,
            'natural_language_control': False
        }
        return supported_features.get(feature, False)
    
    def _get_supported_features(self) -> List[str]:
        """Get list of supported features"""
        return [
            'voice_cloning',
            'emotion_control', 
            'multi_language',
            'high_quality',
            'real_time'
        ]
    
    def _get_max_text_length(self) -> int:
        """Get maximum text length for ElevenLabs"""
        return 5000  # ElevenLabs limit