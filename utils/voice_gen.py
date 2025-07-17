# utils/voice_gen.py

import os
import time
import requests
from typing import Optional, Callable

# Import new TTS system
try:
    from .tts import TTSFactory, VoiceConfig
    from .tts_config import tts_config
    TTS_SYSTEM_AVAILABLE = True
except ImportError:
    TTS_SYSTEM_AVAILABLE = False
    print("New TTS system not available, falling back to legacy ElevenLabs")

# Legacy ElevenLabs support
ELEVEN_URL_TEMPLATE = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"

def create_folder_if_not_exists(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

def load_api_key(key_file="voice_secret.txt"):
    if not os.path.exists(key_file):
        raise FileNotFoundError(
            f"API key file '{key_file}' not found. Please create it and insert your ElevenLabs API key."
        )
    with open(key_file, "r", encoding="utf-8") as f:
        key = f.read().strip()
    if not key:
        raise ValueError("The API key is empty. Please check your voice_secret.txt file.")
    return key

def text_to_speech_file(
    text: str,
    save_dir: str,
    filename: str,
    voice_id: str,
    api_key: str
) -> str:
    """
    Creates a direct POST request to ElevenLabs for text-to-speech conversion.
    Legacy function for backward compatibility.
    """
    url = ELEVEN_URL_TEMPLATE.format(voice_id=voice_id)
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8,
            "style": 0.2,
            "use_speaker_boost": True
        }
    }

    resp = requests.post(url, json=payload, headers=headers, stream=True)
    resp.raise_for_status()

    save_file_path = os.path.join(save_dir, f"{filename}.mp3")
    with open(save_file_path, "wb") as f:
        for chunk in resp.iter_content(chunk_size=4096):
            if chunk:
                f.write(chunk)

    print(f"Audio saved to {save_file_path}")
    return save_file_path

def text_to_speech_enhanced(
    text: str,
    save_dir: str,
    filename: str,
    voice_key: str = "arabic_male",
    provider: Optional[str] = None,
    quality: str = "high"
) -> str:
    """
    Enhanced text-to-speech using the new provider system.
    
    Args:
        text: Text to convert to speech
        save_dir: Directory to save audio file
        filename: Filename without extension
        voice_key: Voice key from configuration (e.g., 'arabic_male', 'english_female')
        provider: Specific provider to use ('elevenlabs', 'gemini', or None for auto)
        quality: Quality preference ('high', 'standard', 'cost_effective')
    
    Returns:
        Path to saved audio file
    """
    if not TTS_SYSTEM_AVAILABLE:
        # Fallback to legacy system
        api_key = load_api_key("voice_secret.txt")
        voice_id = "pNInz6obpgDQGcFmaJgB"  # Default Arabic male
        return text_to_speech_file(text, save_dir, filename, voice_id, api_key)
    
    try:
        # Initialize TTS factory
        factory = TTSFactory()
        
        # Get voice configuration
        if provider:
            voice_id = tts_config.get_voice_for_provider(voice_key, provider)
            tts_provider = factory.get_provider(provider)
        else:
            # Auto-select optimal provider
            tts_provider = factory.get_optimal_provider_for_text(text, quality)
            provider_name = tts_provider.__class__.__name__.lower().replace('provider', '')
            voice_id = tts_config.get_voice_for_provider(voice_key, provider_name)
        
        # Create voice configuration
        voice_config = VoiceConfig(
            voice_id=voice_id,
            provider=provider or 'auto',
            language="ar" if "arabic" in voice_key else "en"
        )
        
        # Generate speech
        output_path = os.path.join(save_dir, f"{filename}.mp3")
        result = tts_provider.text_to_speech(text, voice_config, output_path)
        
        if result.success:
            print(f"Audio saved to {output_path} (Provider: {tts_provider.provider_name}, Cost: ${result.cost_estimate:.4f})")
            return output_path
        else:
            raise Exception(f"TTS generation failed: {result.error_message}")
            
    except Exception as e:
        print(f"Enhanced TTS failed, falling back to legacy: {e}")
        # Fallback to legacy system
        api_key = load_api_key("voice_secret.txt")
        voice_id = tts_config.get_voice_for_provider(voice_key, 'elevenlabs')
        return text_to_speech_file(text, save_dir, filename, voice_id, api_key)

def voice_main(
    voice_id: str = "pNInz6obpgDQGcFmaJgB", 
    progress_callback=None,
    voice_key: str = "arabic_male",
    provider: Optional[str] = None,
    quality: str = "high",
    use_enhanced: bool = True
):
    """
    Enhanced voice generation with multi-provider support.
    
    Args:
        voice_id: Legacy voice ID for backward compatibility
        progress_callback: Callback function for progress updates
        voice_key: Voice key from configuration (e.g., 'arabic_male', 'english_female')
        provider: Specific provider to use ('elevenlabs', 'gemini', or None for auto)
        quality: Quality preference ('high', 'standard', 'cost_effective')
        use_enhanced: Whether to use the new enhanced TTS system
    
    1) Reads ./outputs/text.txt
    2) Splits it sentence by sentence
    3) Generates mp3 for each sentence using selected provider
    4) Saves them in ./outputs/audio/part{i}.mp3
    """
    
    # Determine which TTS system to use
    if use_enhanced and TTS_SYSTEM_AVAILABLE:
        print(f"Using enhanced TTS system (Provider: {provider or 'auto'}, Quality: {quality})")
        if progress_callback:
            progress_callback(f"Initializing enhanced TTS system...")
        
        try:
            # Initialize and validate TTS factory
            factory = TTSFactory()
            
            # Get provider info for user feedback
            if provider:
                tts_provider = factory.get_provider(provider)
                provider_info = tts_provider.get_provider_info()
                print(f"Using {provider} provider - Cost: ${provider_info['cost_per_1k_chars']:.4f} per 1K chars")
            else:
                comparison = factory.get_provider_comparison(1000)
                available_providers = [p['name'] for p in comparison if p.get('available', False)]
                print(f"Available providers: {', '.join(available_providers)}")
                
        except Exception as e:
            print(f"Enhanced TTS initialization failed: {e}")
            if progress_callback:
                progress_callback(f"Enhanced TTS failed, using legacy system: {e}")
            use_enhanced = False
    else:
        use_enhanced = False
        print("Using legacy ElevenLabs system")
    
    # Legacy API key loading for fallback
    if not use_enhanced:
        try:
            api_key = load_api_key("voice_secret.txt")
        except Exception as e:
            print(f"Error loading voice API key: {e}")
            if progress_callback:
                progress_callback(f"Error loading voice API key: {e}")
            return

    outputs_dir = os.path.join(os.getcwd(), "outputs")
    audio_dir   = os.path.join(outputs_dir, "audio")
    create_folder_if_not_exists(outputs_dir)
    create_folder_if_not_exists(audio_dir)

    text_file = os.path.join(outputs_dir, "text.txt")
    if not os.path.exists(text_file):
        error_msg = f"Text file not found: {text_file}"
        if progress_callback:
            progress_callback(error_msg)
        raise FileNotFoundError(error_msg)

    with open(text_file, "r", encoding="utf-8") as f:
        full_text = f.read()

    # Clean and split
    text_clean = (
        full_text
        .replace(":", " ")
        .replace("-", " ")
        .replace("_", " ")
        .replace("!", ".")
        .replace("*", "")
        .replace(",", ".")
    )
    sentences = [s.strip() for s in text_clean.split('.') if s.strip()]

    # (Optional) Update line_by_line.txt
    line_by_line_file = os.path.join(outputs_dir, "line_by_line.txt")
    with open(line_by_line_file, "w", encoding="utf-8") as lf:
        for sentence in sentences:
            lf.write(sentence + "\n")

    total = len(sentences)
    print(f"Total sentences for voice generation: {total}")
    
    # Calculate estimated cost if using enhanced system
    if use_enhanced and TTS_SYSTEM_AVAILABLE:
        try:
            factory = TTSFactory()
            total_chars = sum(len(s) for s in sentences)
            
            if provider:
                tts_provider = factory.get_provider(provider)
                estimated_cost = tts_provider.get_cost_estimate(total_chars)
            else:
                tts_provider = factory.get_optimal_provider_for_text(full_text, quality)
                estimated_cost = tts_provider.get_cost_estimate(total_chars)
            
            print(f"Estimated cost: ${estimated_cost:.4f} for {total_chars} characters")
            if progress_callback:
                progress_callback(f"Preparing to generate voice for {total} sentences (Est. cost: ${estimated_cost:.4f})")
        except Exception as e:
            print(f"Cost estimation failed: {e}")
            if progress_callback:
                progress_callback(f"Preparing to generate voice for {total} sentences")
    else:
        if progress_callback:
            progress_callback(f"Preparing to generate voice for {total} sentences")

    # Track generation statistics
    successful_generations = 0
    total_cost = 0.0
    
    for i, sentence in enumerate(sentences):
        try:
            if progress_callback:
                current_progress = 60 + int((i / total) * 20)  # 60-80% range
                progress_callback(f"Generating voice {i+1}/{total}: {sentence[:40]}...", current_progress)
            
            print(f"Generating audio for sentence {i+1}/{total}: {sentence}")
            
            if use_enhanced:
                # Use enhanced TTS system
                audio_path = text_to_speech_enhanced(
                    text=sentence,
                    save_dir=audio_dir,
                    filename=f"part{i}",
                    voice_key=voice_key,
                    provider=provider,
                    quality=quality
                )
                successful_generations += 1
                
                # Track cost (simplified - would need actual result object)
                if TTS_SYSTEM_AVAILABLE:
                    try:
                        factory = TTSFactory()
                        if provider:
                            tts_provider = factory.get_provider(provider)
                        else:
                            tts_provider = factory.get_optimal_provider_for_text(sentence, quality)
                        sentence_cost = tts_provider.get_cost_estimate(len(sentence))
                        total_cost += sentence_cost
                    except:
                        pass
            else:
                # Use legacy system
                text_to_speech_file(
                    text=sentence,
                    save_dir=audio_dir,
                    filename=f"part{i}",
                    voice_id=voice_id,
                    api_key=api_key
                )
                successful_generations += 1
            
            if progress_callback:
                progress_callback(f"Completed voice {i+1}/{total}")
            
            time.sleep(1)
            
        except Exception as e:
            error_msg = f"Error generating audio for sentence {i}: {e}"
            print(error_msg)
            if progress_callback:
                progress_callback(error_msg)
            continue
    
    # Final summary
    success_rate = (successful_generations / total) * 100 if total > 0 else 0
    summary_msg = f"Voice generation complete: {successful_generations}/{total} sentences ({success_rate:.1f}% success)"
    
    if use_enhanced and total_cost > 0:
        summary_msg += f", Total cost: ${total_cost:.4f}"
    
    print(summary_msg)
    if progress_callback:
        progress_callback(summary_msg)

if __name__ == "__main__":
    voice_main()
