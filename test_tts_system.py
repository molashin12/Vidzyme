"""
Test script for the enhanced TTS system.
Demonstrates both ElevenLabs and Google Gemini TTS providers.
"""

import os
import sys
import time

# Add the parent directory to the path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.voice_gen import text_to_speech_enhanced, voice_main
from utils.tts.tts_factory import TTSFactory
from utils.tts_config import TTSConfig


def test_provider_availability():
    """Test which providers are available."""
    print("=== Testing Provider Availability ===")
    
    try:
        factory = TTSFactory()
        comparison = factory.get_provider_comparison(1000)
        
        print("\nAvailable Providers:")
        for provider in comparison:
            status = "✓ Available" if provider.get('available', False) else "✗ Not Available"
            cost = provider.get('cost_per_1k_chars', 0)
            print(f"  {provider['name']}: {status} (${cost:.4f} per 1K chars)")
            
            if provider.get('available', False):
                features = provider.get('features', [])
                print(f"    Features: {', '.join(features)}")
                print(f"    Max length: {provider.get('max_text_length', 0)} chars")
        
        return True
    except Exception as e:
        print(f"Error testing providers: {e}")
        return False


def test_single_generation():
    """Test generating a single audio file."""
    print("\n=== Testing Single Audio Generation ===")
    
    test_text = "مرحبا، هذا اختبار لنظام تحويل النص إلى كلام المحسن."
    
    try:
        # Test with auto provider selection
        print("\n1. Testing with auto provider selection:")
        audio_path = text_to_speech_enhanced(
            text=test_text,
            save_dir="./test_output",
            filename="test_auto",
            voice_key="arabic_male",
            quality="standard"
        )
        print(f"   Generated: {audio_path}")
        
        # Test with specific provider (ElevenLabs)
        print("\n2. Testing with ElevenLabs provider:")
        audio_path = text_to_speech_enhanced(
            text=test_text,
            save_dir="./test_output",
            filename="test_elevenlabs",
            voice_key="arabic_male",
            provider="elevenlabs",
            quality="high"
        )
        print(f"   Generated: {audio_path}")
        
        # Test with specific provider (Gemini)
        print("\n3. Testing with Gemini provider:")
        audio_path = text_to_speech_enhanced(
            text=test_text,
            save_dir="./test_output",
            filename="test_gemini",
            voice_key="arabic_male",
            provider="gemini",
            quality="cost_effective"
        )
        print(f"   Generated: {audio_path}")
        
        return True
    except Exception as e:
        print(f"Error in single generation test: {e}")
        return False


def test_cost_comparison():
    """Test cost comparison between providers."""
    print("\n=== Testing Cost Comparison ===")
    
    test_texts = [
        "Short text for testing.",
        "This is a medium length text that should give us a better idea of the cost differences between providers when processing typical content.",
        "This is a much longer text that simulates the kind of content that might be processed in a real video generation scenario. It includes multiple sentences, various punctuation marks, and should give us a comprehensive view of how the different TTS providers handle longer content and what the cost implications might be for processing substantial amounts of text in a production environment."
    ]
    
    try:
        factory = TTSFactory()
        
        for i, text in enumerate(test_texts, 1):
            print(f"\nTest {i} - Text length: {len(text)} characters")
            print(f"Text preview: {text[:50]}...")
            
            # Get cost estimates from all providers
            for provider_name in ['elevenlabs', 'gemini']:
                try:
                    provider = factory.get_provider(provider_name)
                    cost = provider.get_cost_estimate(len(text))
                    print(f"  {provider_name}: ${cost:.6f}")
                except Exception as e:
                    print(f"  {provider_name}: Error - {e}")
        
        return True
    except Exception as e:
        print(f"Error in cost comparison test: {e}")
        return False


def test_voice_main_enhanced():
    """Test the enhanced voice_main function."""
    print("\n=== Testing Enhanced voice_main Function ===")
    
    # Create test text file
    test_dir = "./test_output"
    os.makedirs(test_dir, exist_ok=True)
    
    test_text = """مرحبا بكم في اختبار النظام المحسن.
هذا النص يحتوي على عدة جمل.
سيتم تحويل كل جملة إلى ملف صوتي منفصل.
نأمل أن يعمل النظام بشكل صحيح."""
    
    text_file = os.path.join(test_dir, "text.txt")
    with open(text_file, "w", encoding="utf-8") as f:
        f.write(test_text)
    
    # Change to test directory temporarily
    original_cwd = os.getcwd()
    os.chdir(test_dir)
    
    try:
        def progress_callback(message, progress=None):
            if progress:
                print(f"Progress {progress}%: {message}")
            else:
                print(f"Status: {message}")
        
        # Test with enhanced system
        print("\nTesting with enhanced system (auto provider):")
        voice_main(
            progress_callback=progress_callback,
            voice_key="arabic_male",
            quality="standard",
            use_enhanced=True
        )
        
        # Test with specific provider
        print("\nTesting with enhanced system (ElevenLabs):")
        voice_main(
            progress_callback=progress_callback,
            voice_key="arabic_male",
            provider="elevenlabs",
            quality="high",
            use_enhanced=True
        )
        
        return True
    except Exception as e:
        print(f"Error in voice_main test: {e}")
        return False
    finally:
        os.chdir(original_cwd)


def test_configuration():
    """Test configuration loading and management."""
    print("\n=== Testing Configuration System ===")
    
    try:
        config = TTSConfig()
        
        print(f"Default provider: {config.default_provider}")
        print(f"Quality preference: {config.quality_preference}")
        print(f"Available providers: {list(config.providers.keys())}")
        print(f"Available voices: {list(config.voice_mappings.keys())}")
        
        # Test voice mapping
        arabic_voice = config.get_voice_config("arabic_male", "elevenlabs")
        print(f"Arabic male voice (ElevenLabs): {arabic_voice}")
        
        english_voice = config.get_voice_config("english_female", "gemini")
        print(f"English female voice (Gemini): {english_voice}")
        
        return True
    except Exception as e:
        print(f"Error in configuration test: {e}")
        return False


def main():
    """Run all tests."""
    print("Enhanced TTS System Test Suite")
    print("=" * 50)
    
    tests = [
        ("Provider Availability", test_provider_availability),
        ("Configuration System", test_configuration),
        ("Cost Comparison", test_cost_comparison),
        ("Single Generation", test_single_generation),
        ("Enhanced voice_main", test_voice_main_enhanced),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"Test failed with exception: {e}")
            results[test_name] = False
        
        time.sleep(1)  # Brief pause between tests
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        status = "PASS" if result else "FAIL"
        print(f"{test_name:.<40} {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The enhanced TTS system is ready to use.")
    else:
        print("⚠️  Some tests failed. Check the output above for details.")


if __name__ == "__main__":
    main()