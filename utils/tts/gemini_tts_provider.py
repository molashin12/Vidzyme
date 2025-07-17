"""
Google Gemini TTS Provider

Implementation of TTS provider for Google Gemini's text-to-speech capabilities.
Provides cost-effective alternative to ElevenLabs with natural language control.
"""

import os
import json
import requests
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

from .base_provider import TTSProvider, VoiceConfig, TTSResult
from .exceptions import APIKeyError, ProviderError, AudioGenerationError, create_http_exception
from .logging_utils import get_logger, PerformanceLogger
from .validation import APIKeyValidator


class GeminiTTSProvider(TTSProvider):
    """Google Gemini TTS provider implementation."""
    
    def __init__(self, api_key_file: str = "gemini_secret.txt"):
        self.api_key_file = api_key_file
        self.api_key = None
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        
        # Initialize logging
        self.logger = get_logger()
        self.perf_logger = PerformanceLogger(self.logger)
        
        # Load and validate API key
        self._load_api_key()
        
        # Gemini pricing (approximate based on research)
        self.cost_per_character = 0.000016  # ~$6.77 per 423k characters
        
        # Gemini voice mapping
        self.voice_mapping = {
            'alloy': 'Alloy',
            'echo': 'Echo', 
            'fable': 'Fable',
            'onyx': 'Onyx',
            'nova': 'Nova',
            'shimmer': 'Shimmer'
        }
    
    def _load_api_key(self) -> str:
        """Load and validate API key from file."""
        try:
            # Validate the API key file
            is_valid, message, api_key = APIKeyValidator.validate_key_file(
                self.api_key_file, "gemini"
            )
            
            if not is_valid:
                raise APIKeyError("gemini", message, self.api_key_file)
            
            self.api_key = api_key
            self.logger.info("Gemini API key loaded successfully", file_path=self.api_key_file)
            return api_key
            
        except APIKeyError:
            raise
        except Exception as e:
            raise APIKeyError(
                "gemini", 
                f"Failed to load API key: {str(e)}", 
                self.api_key_file
            )
    
    def text_to_speech(
        self, 
        text: str, 
        voice_config: VoiceConfig, 
        output_path: str
    ) -> TTSResult:
        """Convert text to speech using Google Gemini TTS"""
        if not self.api_key:
            return TTSResult(
                success=False,
                error_message="Gemini API key not available",
                character_count=len(text)
            )
        
        # Validate text length
        if len(text) > 32000:  # Gemini context limit
            return TTSResult(
                success=False,
                error_message=f"Text too long: {len(text)} characters (max: 32000)",
                character_count=len(text)
            )
        
        if not text.strip():
            return TTSResult(
                success=False,
                error_message="Empty text provided",
                character_count=len(text)
            )
        
        self.logger.info(f"Starting Gemini TTS conversion: {len(text)} characters")
        
        with self.perf_logger.log_performance("gemini_tts_conversion"):
            try:
                # Prepare the prompt for Gemini with TTS instructions
                tts_prompt = self._create_tts_prompt(text, voice_config)
                
                url = f"{self.base_url}/models/gemini-2.0-flash-exp:generateContent"
                
                headers = {
                    "Content-Type": "application/json",
                    "x-goog-api-key": self.api_key
                }
                
                data = {
                    "contents": [{
                        "parts": [{
                            "text": tts_prompt
                        }]
                    }],
                    "generationConfig": {
                        "temperature": 0.1,
                        "maxOutputTokens": 1000
                    }
                }
                
                self.logger.debug(f"Making request to: {url}")
                
                response = requests.post(url, json=data, headers=headers, timeout=30)
                
                if response.status_code == 200:
                    response_data = response.json()
                    
                    # Extract audio data from response
                    # Note: This is a simplified implementation
                    # Actual Gemini TTS integration may require different approach
                    audio_data = self._extract_audio_from_response(response_data)
                    
                    if audio_data:
                        # Save audio file
                        os.makedirs(os.path.dirname(output_path), exist_ok=True)
                        with open(output_path, 'wb') as f:
                            f.write(audio_data)
                        
                        self.logger.info(f"Successfully generated {len(audio_data)} bytes of audio")
                        
                        return TTSResult(
                            success=True,
                            audio_path=output_path,
                            character_count=len(text),
                            cost_estimate=self.get_cost_estimate(len(text))
                        )
                    else:
                        error_msg = "Failed to extract audio from Gemini response"
                        self.logger.error(error_msg)
                        return TTSResult(
                            success=False,
                            error_message=error_msg,
                            character_count=len(text)
                        )
                else:
                    error_msg = f"Gemini API error: {response.status_code} - {response.text}"
                    self.logger.error(error_msg)
                    return TTSResult(
                        success=False,
                        error_message=error_msg,
                        character_count=len(text)
                    )
                    
            except requests.exceptions.Timeout:
                error_msg = "Gemini TTS request timed out"
                self.logger.error(error_msg)
                return TTSResult(
                    success=False,
                    error_message=error_msg,
                    character_count=len(text)
                )
                
            except requests.exceptions.ConnectionError:
                error_msg = "Failed to connect to Gemini TTS API"
                self.logger.error(error_msg)
                return TTSResult(
                    success=False,
                    error_message=error_msg,
                    character_count=len(text)
                )
                
            except requests.exceptions.RequestException as e:
                error_msg = f"Gemini TTS API request failed: {str(e)}"
                self.logger.error(error_msg)
                return TTSResult(
                    success=False,
                    error_message=error_msg,
                    character_count=len(text)
                )
                
            except Exception as e:
                error_msg = f"Unexpected error in Gemini TTS: {str(e)}"
                self.logger.error(error_msg, exc_info=True)
                return TTSResult(
                    success=False,
                    error_message=error_msg,
                    character_count=len(text)
                )
    
    def _create_tts_prompt(self, text: str, voice_config: VoiceConfig) -> str:
        """Create TTS prompt for Gemini with natural language instructions"""
        voice_name = self.voice_mapping.get(voice_config.voice_id, 'Alloy')
        
        style_instructions = ""
        if voice_config.style:
            style_instructions = f" Use a {voice_config.style} speaking style."
        
        speed_instructions = ""
        if voice_config.speed != 1.0:
            if voice_config.speed > 1.0:
                speed_instructions = " Speak at a faster pace."
            else:
                speed_instructions = " Speak at a slower pace."
        
        emotion_instructions = ""
        if voice_config.emotion:
            emotion_instructions = f" Express {voice_config.emotion} emotion."
        
        prompt = f"""Please convert the following text to speech using the {voice_name} voice.{style_instructions}{speed_instructions}{emotion_instructions}

Text to convert:
{text}

Please generate high-quality audio output."""
        
        return prompt
    
    def _extract_audio_from_response(self, response_data: Dict) -> Optional[bytes]:
        """Extract audio data from Gemini response"""
        # Note: This is a placeholder implementation
        # Actual Gemini TTS response format may be different
        # This would need to be updated based on actual API documentation
        
        try:
            # Look for audio data in response
            candidates = response_data.get('candidates', [])
            if candidates:
                content = candidates[0].get('content', {})
                parts = content.get('parts', [])
                
                for part in parts:
                    if 'audio' in part:
                        # Decode base64 audio data
                        import base64
                        return base64.b64decode(part['audio'])
            
            return None
            
        except Exception:
            return None
    
    def get_available_voices(self) -> List[Dict]:
        """Get available voices for Gemini TTS"""
        # Return predefined voices since Gemini uses natural language control
        return [
            {
                'id': 'alloy',
                'name': 'Alloy',
                'language': 'en',
                'gender': 'neutral',
                'provider': 'gemini'
            },
            {
                'id': 'echo',
                'name': 'Echo',
                'language': 'en',
                'gender': 'male',
                'provider': 'gemini'
            },
            {
                'id': 'fable',
                'name': 'Fable',
                'language': 'en',
                'gender': 'neutral',
                'provider': 'gemini'
            },
            {
                'id': 'onyx',
                'name': 'Onyx',
                'language': 'en',
                'gender': 'male',
                'provider': 'gemini'
            },
            {
                'id': 'nova',
                'name': 'Nova',
                'language': 'en',
                'gender': 'female',
                'provider': 'gemini'
            },
            {
                'id': 'shimmer',
                'name': 'Shimmer',
                'language': 'en',
                'gender': 'female',
                'provider': 'gemini'
            }
        ]
    
    def validate_config(self) -> Tuple[bool, Optional[str]]:
        """Validate Gemini configuration"""
        if not self.api_key:
            return False, "Google Gemini API key not found"
        
        try:
            # Test API key with a simple request
            url = f"{self.base_url}/models"
            headers = {"x-goog-api-key": self.api_key}
            response = requests.get(url, headers=headers)
            
            if response.status_code == 200:
                return True, None
            else:
                return False, f"Invalid API key or API error: {response.status_code}"
                
        except Exception as e:
            return False, f"Connection error: {str(e)}"
    
    def get_cost_estimate(self, character_count: int) -> float:
        """Estimate cost for Gemini TTS"""
        return character_count * self.cost_per_character
    
    def supports_feature(self, feature: str) -> bool:
        """Check if Gemini supports a feature"""
        supported_features = {
            'voice_cloning': False,
            'emotion_control': True,
            'multi_language': True,
            'high_quality': True,
            'real_time': False,
            'multi_speaker': True,
            'natural_language_control': True,
            'cost_effective': True
        }
        return supported_features.get(feature, False)
    
    def _get_supported_features(self) -> List[str]:
        """Get list of supported features"""
        return [
            'emotion_control',
            'multi_language',
            'high_quality',
            'multi_speaker',
            'natural_language_control',
            'cost_effective'
        ]
    
    def _get_max_text_length(self) -> int:
        """Get maximum text length for Gemini"""
        return 32000  # Gemini 2.0 context limit