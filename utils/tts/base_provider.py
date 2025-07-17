"""
Base TTS Provider Interface

Abstract base class defining the interface that all TTS providers must implement.
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass


@dataclass
class VoiceConfig:
    """Configuration for voice synthesis"""
    voice_id: str
    provider: str
    language: str = "en"
    style: Optional[str] = None
    speed: float = 1.0
    pitch: float = 1.0
    emotion: Optional[str] = None


@dataclass
class TTSResult:
    """Result of TTS synthesis"""
    success: bool
    audio_path: Optional[str] = None
    error_message: Optional[str] = None
    cost_estimate: Optional[float] = None
    character_count: int = 0
    duration_seconds: Optional[float] = None


class TTSProvider(ABC):
    """Abstract base class for TTS providers"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.provider_name = self.__class__.__name__
    
    @abstractmethod
    def text_to_speech(
        self, 
        text: str, 
        voice_config: VoiceConfig, 
        output_path: str
    ) -> TTSResult:
        """
        Convert text to speech and save to output_path
        
        Args:
            text: Text to convert to speech
            voice_config: Voice configuration
            output_path: Path to save the audio file
            
        Returns:
            TTSResult with success status and details
        """
        pass
    
    @abstractmethod
    def get_available_voices(self) -> List[Dict]:
        """
        Get list of available voices for this provider
        
        Returns:
            List of voice dictionaries with id, name, language, etc.
        """
        pass
    
    @abstractmethod
    def validate_config(self) -> Tuple[bool, Optional[str]]:
        """
        Validate provider configuration
        
        Returns:
            Tuple of (is_valid, error_message)
        """
        pass
    
    @abstractmethod
    def get_cost_estimate(self, character_count: int) -> float:
        """
        Estimate cost for given character count
        
        Args:
            character_count: Number of characters to synthesize
            
        Returns:
            Estimated cost in USD
        """
        pass
    
    @abstractmethod
    def supports_feature(self, feature: str) -> bool:
        """
        Check if provider supports a specific feature
        
        Args:
            feature: Feature name (e.g., 'voice_cloning', 'multi_speaker', 'emotion_control')
            
        Returns:
            True if feature is supported
        """
        pass
    
    def get_provider_info(self) -> Dict:
        """Get provider information"""
        return {
            'name': self.provider_name,
            'features': self._get_supported_features(),
            'cost_per_1k_chars': self.get_cost_estimate(1000),
            'max_text_length': self._get_max_text_length()
        }
    
    @abstractmethod
    def _get_supported_features(self) -> List[str]:
        """Get list of supported features"""
        pass
    
    @abstractmethod
    def _get_max_text_length(self) -> int:
        """Get maximum text length supported"""
        pass