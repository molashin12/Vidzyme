# Vidzyme Backend Architecture

## Overview

The Vidzyme backend is built on FastAPI, providing a robust and scalable foundation for AI-powered video generation. The architecture follows a modular design pattern with clear separation of concerns, featuring real-time processing, queue management, and scheduled video generation.

## Core Components

### 1. Main Application (`server.py`)

#### Application Setup
```python
app = FastAPI(
    title="Vidzyme AI Video Generator",
    description="AI-powered video generation platform",
    version="2.0.0"
)
```

#### Key Features:
- **Static File Serving**: Serves generated videos and assets
- **Template Rendering**: Jinja2 integration for web interface
- **CORS Configuration**: Cross-origin resource sharing for frontend
- **Environment Detection**: Handles development and production modes
- **Real-time Progress**: Server-Sent Events for live updates

#### Binary Dependencies Management
```python
# Automatic detection of bundled vs system binaries
if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
    # Bundled executable mode
    base = sys._MEIPASS
    ffmpeg_path = os.path.join(base, "ffmpeg", "ffmpeg.exe")
    imagemagick_path = os.path.join(base, "ImageMagick", "magick.exe")
else:
    # Development mode - system PATH
    ffmpeg_path = "ffmpeg"
    imagemagick_path = "magick"
```

### 2. Video Scheduler (`scheduler.py`)

#### VideoScheduler Class
```python
class VideoScheduler:
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.video_queue = VideoQueue()
        self.running_jobs = {}
```

#### Key Features:
- **Background Processing**: APScheduler for automated video generation
- **Queue Integration**: Manages video processing queue
- **Job Management**: Track and control scheduled tasks
- **Database Integration**: Supabase for persistent storage

#### Scheduling Functions:
```python
def schedule_video(self, scheduled_video_data: dict) -> str:
    """Schedule a new video for automated generation"""

def update_schedule(self, video_id: str, updates: dict):
    """Update existing schedule parameters"""

def delete_schedule(self, video_id: str):
    """Remove scheduled video and cancel job"""
```

### 3. Queue Management (`video_queue.py`)

#### VideoQueue Class
```python
class VideoQueue:
    def __init__(self):
        self.queue = []
        self.processing = {}
        self.completed = {}
        self.failed = {}
```

#### Queue Operations:
- **Add to Queue**: `add_video(video_data)`
- **Process Queue**: `process_next()`
- **Status Tracking**: Real-time status updates
- **Error Handling**: Failed video management

## API Endpoints

### Core Video Generation

#### Root Endpoint (`/`)
- **Method**: GET
- **Purpose**: Serves the main application interface
- **Returns**: HTML template with voice options
- **Template**: `index.html`

#### Video Generation (`/generate`)
- **Method**: POST
- **Purpose**: Immediate video generation
- **Parameters**:
  - `topic` (required): Video topic/subject
  - `voice_name` (required): Selected voice option
- **Process**: Initiates async video generation pipeline
- **Returns**: JSON with video_id and status

#### Progress Tracking (`/progress/{video_id}`)
- **Method**: GET
- **Purpose**: Real-time progress updates
- **Protocol**: Server-Sent Events (SSE)
- **Content-Type**: `text/event-stream`
- **Returns**: Live progress data

#### Video Download (`/video/{video_id}`)
- **Method**: GET
- **Purpose**: Download generated video file
- **Returns**: MP4 video file or 404 if not found

### Scheduled Video Management

#### Create Scheduled Video (`/scheduled-videos`)
- **Method**: POST
- **Purpose**: Create new automated video schedule
- **Body**: Schedule configuration (frequency, time, channel, etc.)
- **Returns**: Created schedule with ID

#### List Scheduled Videos (`/scheduled-videos`)
- **Method**: GET
- **Purpose**: Get all user's scheduled videos
- **Query Parameters**: Optional filtering
- **Returns**: Array of scheduled video objects

#### Update Schedule (`/scheduled-videos/{video_id}`)
- **Method**: PUT
- **Purpose**: Update existing schedule
- **Body**: Updated schedule parameters
- **Returns**: Updated schedule object

#### Delete Schedule (`/scheduled-videos/{video_id}`)
- **Method**: DELETE
- **Purpose**: Remove scheduled video
- **Returns**: Success confirmation

#### Toggle Schedule (`/scheduled-videos/{video_id}/toggle`)
- **Method**: POST
- **Purpose**: Enable/disable schedule
- **Returns**: Updated schedule status

### Queue Management

#### Queue Status (`/queue/status`)
- **Method**: GET
- **Purpose**: Get current queue statistics
- **Returns**: Queue metrics and processing status

#### Queue Videos (`/queue/videos`)
- **Method**: GET
- **Purpose**: List videos in processing queue
- **Returns**: Array of queued video objects

### System Health

#### Health Check (`/health`)
- **Method**: GET
- **Purpose**: System health monitoring
- **Returns**: Service status and dependencies

#### API Documentation (`/docs`)
- **Method**: GET
- **Purpose**: Interactive API documentation
- **Framework**: Swagger UI

## Utility Modules

### 1. Gemini Integration (`utils/gemini.py`)

#### Purpose
Handles all interactions with Google Gemini API for content generation.

#### Key Functions
```python
def query(text: str) -> dict:
    """Send query to Gemini API and return response"""

def generate_script(topic: str, style: str = "educational") -> str:
    """Generate video script for given topic"""
```

#### Configuration
- **API Key**: Environment variable or `gemini_secret.txt`
- **Model**: `gemini-1.5-flash-latest`
- **Endpoint**: Google Generative Language API

#### Error Handling
- API key validation
- Rate limiting protection
- Graceful fallback mechanisms

### 2. Script Generation (`utils/write_script.py`)

#### Core Functions

##### `write_content(content: str)`
- Saves generated content to `outputs/text.txt`
- UTF-8 encoding for multilingual support

##### `split_text_to_lines()`
- Processes text for video segmentation
- Removes special characters and normalizes punctuation
- Creates `outputs/line_by_line.txt` for pipeline processing

#### Text Processing Pipeline
```python
def clean_text(text: str) -> str:
    """Clean and normalize text for video processing"""
    return text.replace(':', ' ') \
              .replace('-', ' ') \
              .replace('_', " ") \
              .replace('!', '.') \
              .replace('*', "") \
              .replace(',', '.')
```

### 3. Image Generation (`utils/image_gen.py`)

#### Integration
- **Primary Service**: Pollinations AI
- **Fallback Service**: Alternative image generation APIs
- **Translation**: Google Translate for multilingual support
- **Output Format**: JPEG images

#### Process Flow
1. Read segmented text from `line_by_line.txt`
2. Translate text if needed (Arabic to English)
3. Generate image URL with encoded prompt
4. Download and save images as `part{n}.jpg`
5. Validate image quality and format

#### API Integration
```python
def generate_image(prompt: str, part_number: int) -> str:
    """Generate image for video segment"""
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}"
    # Download and save logic
```

#### Error Handling
- Network timeout protection (30 seconds)
- Image format validation
- Retry mechanism for failed generations
- Fallback to default images

### 4. Voice Synthesis (`utils/voice_gen.py`)

#### ElevenLabs Integration
- **API**: ElevenLabs Text-to-Speech
- **Model**: `eleven_multilingual_v2`
- **Output**: MP3 audio files
- **Languages**: Arabic, English, and others

#### Voice Configuration
```python
voice_options = {
    "هيثم": "UR972wNGq3zluze0LoIp",
    "يحيى": "QRq5hPRAKf5ZhSlTBH6r",
    "سارة": "jAAHNNqlbAX9iWjJPEtE",
    "مازن": "rPNcQ53R703tTmtue1AT",
    "أسماء": "qi4PkV9c01kb869Vh7Su"
}

voice_settings = {
    "stability": 0.0,
    "similarity_boost": 1.0,
    "style": 0.0,
    "use_speaker_boost": True
}
```

#### Process Flow
1. Load API key from environment or file
2. Process each text segment individually
3. Generate audio with specified voice ID
4. Save as `part{n}.mp3` in outputs/audio/
5. Validate audio quality and duration

### 5. Video Assembly (`utils/video_creation.py`)

#### MoviePy Integration
- **Framework**: MoviePy for video composition
- **Dependencies**: FFmpeg, ImageMagick
- **Output**: MP4 video file
- **Resolution**: 1080x1920 (9:16 aspect ratio)

#### Video Composition Elements

##### Text Overlay
```python
def create_text_clip(text: str, duration: float) -> TextClip:
    """Create text overlay for video segment"""
    return TextClip(
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
def create_image_clip(image_path: str, duration: float) -> ImageClip:
    """Create image clip with zoom effect"""
    return ImageClip(image_path) \
        .resize(width=1280) \
        .set_duration(duration + 0.5) \
        .set_position(("center", "center")) \
        .fx(vfx.resize, zoom_in_image)
```

#### Video Specifications
- **Resolution**: 1080x1920 (9:16 aspect ratio)
- **Frame Rate**: 30 FPS
- **Format**: MP4 with H.264 encoding
- **Audio**: Synchronized with video segments
- **Effects**: Dynamic zoom, text animations

## Processing Pipeline

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