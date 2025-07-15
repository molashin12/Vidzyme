# Backend Architecture Documentation

## 🏗️ FastAPI Backend Overview

The Vidzyme backend is built on FastAPI, providing a robust and scalable foundation for AI-powered video generation. The architecture follows a modular design pattern with clear separation of concerns.

## 📋 Core Components

### 1. Main Application (`server.py`)

#### Application Setup
```python
app = FastAPI(title="ARABIAN AI SCHOOL Video Generator")
```

#### Key Features:
- **Static File Serving**: Serves CSS, images, and assets
- **Template Rendering**: Jinja2 integration for HTML templates
- **CORS Configuration**: Cross-origin resource sharing
- **Environment Detection**: Handles both development and production

#### Binary Dependencies Management
```python
# Automatic detection of bundled vs system binaries
if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
    # Bundled executable mode
    base = sys._MEIPASS
    ffmpeg_path = os.path.join(base, "ffmpeg", "ffmpeg.exe")
    imagemagick_path = os.path.join(base, "ImageMagick", "magick.exe")
else:
    # Development mode
    ffmpeg_path = r"ffmpeg.exe"
    imagemagick_path = r"C:\Program Files\ImageMagick\magick.exe"
```

### 2. API Endpoints

#### Root Endpoint (`/`)
- **Method**: GET
- **Purpose**: Serves the main application interface
- **Returns**: HTML template with voice options
- **Template**: `index.html`

#### Video Generation Endpoint (`/generate`)
- **Method**: GET
- **Parameters**:
  - `topic` (required): Video topic/subject
  - `voice_name` (required): Selected voice option
- **Process**: Initiates async video generation pipeline
- **Returns**: JSON status response

#### Server-Sent Events (`/stream`)
- **Method**: GET
- **Purpose**: Real-time progress updates
- **Protocol**: SSE (Server-Sent Events)
- **Content-Type**: `text/event-stream`

### 3. Voice Configuration

```python
voice_options = {
    "هيثم": "UR972wNGq3zluze0LoIp",
    "يحيى": "QRq5hPRAKf5ZhSlTBH6r",
    "سارة": "jAAHNNqlbAX9iWjJPEtE",
    "مازن": "rPNcQ53R703tTmtue1AT",
    "أسماء": "qi4PkV9c01kb869Vh7Su"
}
```

## 🔧 Utility Modules

### 1. Gemini Integration (`utils/gemini.py`)

#### Purpose
Handles all interactions with Google Gemini API for content generation.

#### Key Functions
```python
def query(text: str) -> dict:
    """Send query to Gemini API and return response"""
```

#### Configuration
- **API Key**: Read from `gemini_secret.txt`
- **Model**: `gemini-1.5-flash-latest`
- **Endpoint**: Google Generative Language API

#### Error Handling
- Validates API key existence and content
- Graceful exit with user-friendly messages
- HTTP status code validation

### 2. Script Generation (`utils/write_script.py`)

#### Core Functions

##### `write_content(content: str)`
- Saves generated content to `outputs/text.txt`
- UTF-8 encoding for Arabic text support

##### `split_text_to_lines()`
- Processes text for video segmentation
- Removes special characters and normalizes punctuation
- Creates `outputs/line_by_line.txt` for pipeline processing

#### Text Processing Pipeline
```python
text_input = text_input.replace(':', ' ')
                      .replace('-', ' ')
                      .replace('_', " ")
                      .replace('!', '.')
                      .replace('*', "")
                      .replace(',', '.')
```

### 3. Image Generation (`utils/image_gen.py`)

#### Integration
- **Service**: Pollinations AI
- **Translation**: Google Translate (Arabic to English)
- **Output Format**: JPEG images

#### Process Flow
1. Read segmented text from `line_by_line.txt`
2. Translate each segment from Arabic to English
3. Generate image URL with encoded prompt
4. Download and save images as `part{n}.jpg`

#### API Integration
```python
url = f"https://image.pollinations.ai/prompt/{encoded_prompt}"
```

#### Error Handling
- Network timeout protection (30 seconds)
- Image format validation
- Graceful failure with error logging

### 4. Voice Synthesis (`utils/voice_gen.py`)

#### ElevenLabs Integration
- **API**: ElevenLabs Text-to-Speech
- **Model**: `eleven_multilingual_v2`
- **Output**: MP3 audio files

#### Voice Settings
```python
voice_settings = {
    "stability": 0.0,
    "similarity_boost": 1.0,
    "style": 0.0,
    "use_speaker_boost": True
}
```

#### Process Flow
1. Load API key from `voice_secret.txt`
2. Process each text segment individually
3. Generate audio with specified voice ID
4. Save as `part{n}.mp3` in outputs/audio/

### 5. Video Assembly (`utils/video_creation.py`)

#### MoviePy Integration
- **Framework**: MoviePy for video composition
- **Dependencies**: FFmpeg, ImageMagick
- **Output**: MP4 video file

#### Video Composition Elements

##### Text Overlay
```python
text_clip = TextClip(
    txt=text,
    fontsize=80,
    color="white",
    font=font_path,
    method="caption",
    size=(1000, None),
    align="center"
).set_duration(duration).set_position(("center", 1450))
```

##### Image Processing
```python
image_clip = ImageClip(image)
    .resize(width=1280)
    .set_duration(duration + 0.5)
    .set_position(("center", "center"))
    .fx(vfx.resize, zoom_in_image)  # Dynamic zoom effect
```

#### Video Specifications
- **Resolution**: 1080x1920 (9:16 aspect ratio)
- **Frame Rate**: 30 FPS
- **Format**: MP4 with H.264 encoding
- **Audio**: Synchronized with video segments

## 🔄 Processing Pipeline

### Asynchronous Execution
The video generation runs in a separate thread to prevent blocking:

```python
threading.Thread(
    target=run_pipeline,
    args=(topic, voice_id),
    daemon=True
).start()
```

### Pipeline Stages

1. **Initialization**
   - Validate input parameters
   - Create output directories
   - Initialize progress tracking

2. **Content Generation**
   - Generate video titles using Gemini
   - Create detailed script content
   - Process and segment text

3. **Asset Creation**
   - Generate images for each segment
   - Create voice audio for each segment
   - Validate asset quality

4. **Video Assembly**
   - Combine images, audio, and text
   - Apply visual effects and transitions
   - Render final video file

5. **Completion**
   - Validate output file
   - Clean up temporary files
   - Notify completion via SSE

### Progress Broadcasting
```python
def broadcast(message: str):
    """Send progress update to all SSE listeners"""
    for q in listeners:
        q.put_nowait(message)
```

## 📁 File Management

### Directory Structure
```
outputs/
├── text.txt              # Generated script content
├── line_by_line.txt      # Segmented text for processing
├── title.txt             # Selected video title
├── images/               # Generated images
│   ├── part0.jpg
│   ├── part1.jpg
│   └── ...
├── audio/                # Generated audio
│   ├── part0.mp3
│   ├── part1.mp3
│   └── ...
└── youtube_short.mp4     # Final video output
```

### File Handling
- **Encoding**: UTF-8 for all text files
- **Cleanup**: Automatic temporary file management
- **Validation**: File existence checks before processing
- **Permissions**: Proper file access controls

## 🔒 Security Implementation

### API Key Management
- Keys stored in separate text files
- Files excluded from version control
- Runtime validation of key presence and format
- Secure key loading with error handling

### Input Validation
```python
topic = topic.strip()
if not topic:
    raise HTTPException(status_code=400, detail="topic cannot be empty")
if voice_name not in voice_options:
    raise HTTPException(status_code=400, detail="invalid voice_name")
```

### Error Handling
- Comprehensive exception catching
- User-friendly error messages
- Graceful degradation on API failures
- Logging for debugging purposes

## 🚀 Performance Optimizations

### Asynchronous Processing
- Non-blocking video generation
- Real-time progress updates
- Concurrent asset creation where possible

### Resource Management
- Efficient memory usage in video processing
- Temporary file cleanup
- Connection pooling for API requests

### Caching Strategy
- Static file caching
- API response optimization
- Asset reuse where applicable

## 🔧 Configuration Management

### Environment Variables
```python
os.environ["FFMPEG_BINARY"] = ffmpeg_path
os.environ["IMAGEMAGICK_BINARY"] = imagemagick_path
```

### Runtime Configuration
- Automatic binary detection
- Development vs production settings
- Dynamic path resolution

### Dependency Management
- Requirements.txt for Python packages
- Version pinning for stability
- Optional dependencies handling

This backend architecture provides a robust, scalable foundation for AI-powered video generation while maintaining clean code organization and comprehensive error handling.