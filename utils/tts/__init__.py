"""
Text-to-Speech (TTS) Provider System

This module provides a unified interface for multiple TTS providers,
allowing seamless switching between ElevenLabs, Google Gemini TTS, and future providers.
"""

from .base_provider import TTSProvider
from .elevenlabs_provider import ElevenLabsProvider
from .gemini_tts_provider import GeminiTTSProvider
from .tts_factory import TTSFactory

__all__ = [
    'TTSProvider',
    'ElevenLabsProvider', 
    'GeminiTTSProvider',
    'TTSFactory'
]