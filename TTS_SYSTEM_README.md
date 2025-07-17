# Enhanced TTS System for Vidzyme

This document describes the enhanced Text-to-Speech (TTS) system that supports both ElevenLabs and Google Gemini as TTS providers.

## Overview

The enhanced TTS system provides:
- **Multi-provider support**: ElevenLabs and Google Gemini
- **Cost optimization**: Automatic provider selection based on cost and quality preferences
- **Quality options**: High, standard, and cost-effective quality tiers
- **Fallback mechanism**: Automatic fallback to alternative providers
- **Backward compatibility**: Legacy ElevenLabs system remains available

## Architecture

```
utils/
├── tts/
│   ├── __init__.py              # TTS system entry point
│   ├── base_provider.py         # Abstract base class for providers
│   ├── elevenlabs_provider.py   # ElevenLabs implementation
│   ├── gemini_tts_provider.py   # Google Gemini implementation
│   └── tts_factory.py           # Provider factory and management
├── tts_config.py                # Configuration management
├── tts_ui.py                    # Configuration UI component
└── voice_gen.py                 # Enhanced voice generation (updated)
```

## Provider Comparison

| Feature | ElevenLabs | Google Gemini |
|---------|------------|---------------|
| **Voice Quality** | Superior | Good |
| **Cost (per 1K chars)** | ~$0.30 | ~$0.075 (4x cheaper) |
| **Voice Cloning** | ✅ Yes | ❌ No |
| **Multi-language** | ✅ 29+ languages | ✅ 100+ languages |
| **Natural Style Control** | ❌ Limited | ✅ Yes |
| **Multi-speaker** | ❌ No | ✅ Yes |
| **Max Text Length** | 2,500 chars | 5,000 chars |

## Setup

### 1. API Keys

Create the following files in your project root:

**For ElevenLabs:**
```
voice_secret.txt
```
Content: Your ElevenLabs API key

**For Google Gemini:**
```
gemini_secret.txt
```
Content: Your Google Gemini API key

### 2. Configuration

The system uses `utils/tts_config.py` for configuration. Default settings are provided, but you can customize:

```python
from utils.tts_config import TTSConfig

config = TTSConfig()
config.default_provider = "gemini"  # or "elevenlabs"
config.quality_preference = "cost_effective"  # or "standard", "high"
config.save()
```

## Usage

### Basic Usage (Recommended)

```python
from utils.voice_gen import voice_main

# Use enhanced system with auto provider selection
voice_main(
    voice_key="arabic_male",
    quality="standard",
    use_enhanced=True
)
```

### Advanced Usage

```python
from utils.voice_gen import text_to_speech_enhanced

# Generate single audio file with specific provider
audio_path = text_to_speech_enhanced(
    text="مرحبا، هذا اختبار للنظام المحسن",
    save_dir="./outputs/audio",
    filename="test",
    voice_key="arabic_male",
    provider="gemini",  # or "elevenlabs", or None for auto
    quality="high"
)
```

### Provider Factory

```python
from utils.tts.tts_factory import TTSFactory

factory = TTSFactory()

# Get cost comparison
comparison = factory.get_provider_comparison(1000)
for provider in comparison:
    print(f"{provider['name']}: ${provider['cost_per_1k_chars']:.4f} per 1K chars")

# Get optimal provider for text
provider = factory.get_optimal_provider_for_text("Your text here", "standard")
```

## Configuration Options

### Voice Keys

The system supports predefined voice configurations:

- `arabic_male` - Male Arabic voice
- `arabic_female` - Female Arabic voice  
- `english_male` - Male English voice
- `english_female` - Female English voice
- `spanish_male` - Male Spanish voice
- `spanish_female` - Female Spanish voice

### Quality Levels

- `high` - Best quality, higher cost
- `standard` - Balanced quality and cost
- `cost_effective` - Lower cost, acceptable quality

### Provider Selection

- `None` or `"auto"` - Automatic selection based on preferences
- `"elevenlabs"` - Force ElevenLabs provider
- `"gemini"` - Force Google Gemini provider

## Cost Optimization

The system automatically optimizes costs by:

1. **Provider Selection**: Choosing the most cost-effective provider for your quality preference
2. **Text Length Optimization**: Using providers best suited for text length
3. **Fallback Strategy**: Falling back to alternative providers if primary fails
4. **Cost Estimation**: Providing upfront cost estimates

### Example Cost Savings

For 10,000 characters of text:
- **ElevenLabs**: ~$3.00
- **Google Gemini**: ~$0.75
- **Savings**: 75% cost reduction

## Error Handling

The system includes comprehensive error handling:

1. **Provider Fallback**: If primary provider fails, automatically tries alternatives
2. **API Key Validation**: Validates API keys before processing
3. **Legacy Fallback**: Falls back to original ElevenLabs system if enhanced system fails
4. **Graceful Degradation**: Continues processing even if some sentences fail

## Testing

Run the test suite to validate your setup:

```bash
python test_tts_system.py
```

This will test:
- Provider availability
- Configuration loading
- Cost comparison
- Audio generation
- Enhanced voice_main function

## Migration Guide

### From Legacy System

The enhanced system is backward compatible. Existing code will continue to work:

```python
# This still works (legacy mode)
voice_main(voice_id="pNInz6obpgDQGcFmaJgB")

# Enhanced version with same result
voice_main(
    voice_key="arabic_male",
    use_enhanced=True
)
```

### Gradual Migration

1. **Phase 1**: Keep `use_enhanced=False` (default legacy)
2. **Phase 2**: Test with `use_enhanced=True` and auto provider
3. **Phase 3**: Configure specific providers and quality preferences
4. **Phase 4**: Remove legacy fallback once confident

## UI Integration

Use the configuration UI component:

```python
from utils.tts_ui import create_tts_config_dialog

# Create configuration dialog
dialog, ui = create_tts_config_dialog()

# Get user settings
settings = ui.get_current_settings()
print(settings)  # {'use_enhanced': True, 'provider': 'gemini', ...}
```

## Troubleshooting

### Common Issues

1. **"Enhanced TTS system not available"**
   - Check that all TTS files are in place
   - Verify imports are working correctly

2. **"Provider not available"**
   - Check API key files exist and contain valid keys
   - Verify internet connection

3. **"Cost estimation failed"**
   - Usually indicates provider initialization issues
   - Check API keys and provider configuration

4. **Audio generation fails**
   - System will automatically try fallback providers
   - Check logs for specific error messages

### Debug Mode

Enable debug output:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

# Run your TTS operations
```

## Future Enhancements

Planned improvements:
- Additional TTS providers (Azure, AWS Polly)
- Voice style customization UI
- Batch processing optimization
- Real-time cost tracking
- Voice preview functionality

## Support

For issues or questions:
1. Check the test suite output
2. Review error logs
3. Verify API key configuration
4. Test with legacy system for comparison