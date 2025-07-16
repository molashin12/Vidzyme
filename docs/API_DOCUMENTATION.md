# API Documentation

## 🌐 Vidzyme API Reference

This document provides comprehensive documentation for the Vidzyme FastAPI backend, including all endpoints, request/response formats, authentication, and integration patterns.

## 📋 Base Information

### API Base URL
```
Development: http://localhost:8000
Production: https://your-domain.com
```

### API Version
- **Current Version**: v1
- **Framework**: FastAPI
- **Documentation**: Auto-generated OpenAPI/Swagger docs available at `/docs`

### Content Types
- **Request**: `application/json`, `application/x-www-form-urlencoded`
- **Response**: `application/json`, `text/html`, `text/event-stream`

## 🔐 Authentication

### Current Implementation
The current API operates without authentication for the core video generation functionality. Future versions will implement:

- **JWT Token Authentication**
- **API Key Authentication**
- **OAuth 2.0 Integration**

### Security Headers
```http
CORS-Allow-Origin: *
CORS-Allow-Methods: GET, POST, PUT, DELETE
CORS-Allow-Headers: Content-Type, Authorization
```

## 📡 API Endpoints

### 1. Root Endpoint

#### Get Main Interface
```http
GET /
```

**Description**: Serves the main application interface with voice selection options.

**Response**:
- **Content-Type**: `text/html`
- **Template**: `index.html`
- **Status Code**: `200 OK`

**Response Body**: HTML page with:
- Voice selection dropdown
- Topic input field
- Generate button
- Progress display area

**Voice Options Included**:
```javascript
{
  "هيثم": "UR972wNGq3zluze0LoIp",
  "يحيى": "QRq5hPRAKf5ZhSlTBH6r",
  "سارة": "jAAHNNqlbAX9iWjJPEtE",
  "مازن": "rPNcQ53R703tTmtue1AT",
  "أسماء": "qi4PkV9c01kb869Vh7Su"
}
```

**Example Response**:
```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>مولد المحتوى</title>
    <!-- Additional head content -->
</head>
<body>
    <!-- Interface content -->
</body>
</html>
```

### 2. Video Generation Endpoint

#### Generate Video
```http
GET /generate
```

**Description**: Initiates the video generation pipeline with specified topic and voice.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `topic` | string | Yes | Video topic or subject matter |
| `voice_name` | string | Yes | Selected voice option (Arabic name) |

**Parameter Validation**:
- `topic`: Must not be empty after trimming whitespace
- `voice_name`: Must be one of the predefined voice options

**Example Request**:
```http
GET /generate?topic=الذكاء الاصطناعي&voice_name=هيثم
```

**Response Format**:
```json
{
  "status": "success",
  "message": "Video generation started",
  "topic": "الذكاء الاصطناعي",
  "voice": "هيثم",
  "voice_id": "UR972wNGq3zluze0LoIp",
  "estimated_time": "2-3 minutes"
}
```

**Status Codes**:
- `200 OK`: Generation started successfully
- `400 Bad Request`: Invalid parameters
- `500 Internal Server Error`: Server error

**Error Response Example**:
```json
{
  "status": "error",
  "message": "topic cannot be empty",
  "error_code": "INVALID_TOPIC"
}
```

### 3. Server-Sent Events Endpoint

#### Real-time Progress Stream
```http
GET /stream
```

**Description**: Provides real-time progress updates during video generation using Server-Sent Events (SSE).

**Response Headers**:
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
Access-Control-Allow-Origin: *
```

**Event Format**:
```
data: {"step": "script_generation", "progress": 20, "message": "Generating video script..."}

data: {"step": "image_generation", "progress": 40, "message": "Creating images..."}

data: {"step": "voice_synthesis", "progress": 60, "message": "Synthesizing voice..."}

data: {"step": "video_assembly", "progress": 80, "message": "Assembling video..."}

data: {"step": "completed", "progress": 100, "message": "Video generation completed!"}
```

**Progress Steps**:
1. **Initialization** (0-10%): Setting up pipeline
2. **Script Generation** (10-30%): Creating content with Gemini
3. **Image Generation** (30-50%): Generating visuals
4. **Voice Synthesis** (50-70%): Creating audio
5. **Video Assembly** (70-90%): Combining assets
6. **Finalization** (90-100%): Saving and cleanup

**Client Implementation Example**:
```javascript
const eventSource = new EventSource('/stream');

eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    updateProgress(data.progress, data.message);
};

eventSource.onerror = function(event) {
    console.error('SSE error:', event);
};
```

### 4. Static File Endpoints

#### Serve Static Assets
```http
GET /static/{file_path}
```

**Description**: Serves static files (CSS, images, JavaScript).

**Supported File Types**:
- CSS files (`.css`)
- JavaScript files (`.js`)
- Image files (`.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`)
- Font files (`.woff`, `.woff2`, `.ttf`)

**Example Requests**:
```http
GET /static/css/style.css
GET /static/images/logo.png
GET /static/js/app.js
```

**Response Headers**:
```http
Content-Type: text/css; charset=utf-8
Cache-Control: public, max-age=3600
```

## 🔄 Video Generation Pipeline API

### Pipeline Stages

#### 1. Content Generation
**Internal API**: Gemini Integration
```python
# Internal function call
response = gemini.query(f"اكتب عنوان جذاب لفيديو يوتيوب شورت عن: {topic}")
```

**Process**:
1. Generate video title
2. Create detailed script content
3. Process and segment text

#### 2. Image Generation
**External API**: Pollinations AI
```http
GET https://image.pollinations.ai/prompt/{encoded_prompt}
```

**Parameters**:
- `encoded_prompt`: URL-encoded English translation of Arabic text
- **Format**: JPEG images
- **Timeout**: 30 seconds per request

#### 3. Voice Synthesis
**External API**: ElevenLabs TTS
```http
POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}
```

**Request Headers**:
```http
Content-Type: application/json
xi-api-key: {api_key}
```

**Request Body**:
```json
{
  "text": "النص المراد تحويله إلى صوت",
  "model_id": "eleven_multilingual_v2",
  "voice_settings": {
    "stability": 0.0,
    "similarity_boost": 1.0,
    "style": 0.0,
    "use_speaker_boost": true
  }
}
```

**Response**: MP3 audio data

#### 4. Video Assembly
**Internal Process**: MoviePy Integration
- Combines images, audio, and text overlays
- Applies visual effects and transitions
- Renders final MP4 video

## 📊 Response Formats

### Success Response
```json
{
  "status": "success",
  "data": {
    "video_id": "uuid-string",
    "title": "Generated Title",
    "duration": 45,
    "file_path": "/outputs/youtube_short.mp4",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "message": "Video generated successfully"
}
```

### Error Response
```json
{
  "status": "error",
  "error": {
    "code": "GENERATION_FAILED",
    "message": "Failed to generate video",
    "details": {
      "step": "image_generation",
      "reason": "API timeout"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Progress Update Format
```json
{
  "step": "voice_synthesis",
  "progress": 65,
  "message": "Generating voice for segment 3 of 5",
  "estimated_remaining": 45,
  "current_segment": 3,
  "total_segments": 5
}
```

## 🚨 Error Handling

### HTTP Status Codes

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Successful request |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Authentication required (future) |
| 403 | Forbidden | Access denied (future) |
| 404 | Not Found | Endpoint not found |
| 429 | Too Many Requests | Rate limiting (future) |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | External API failure |

### Error Categories

#### Validation Errors
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "topic": "Topic cannot be empty",
      "voice_name": "Invalid voice selection"
    }
  }
}
```

#### External API Errors
```json
{
  "status": "error",
  "error": {
    "code": "EXTERNAL_API_ERROR",
    "message": "Failed to connect to external service",
    "details": {
      "service": "elevenlabs",
      "reason": "API key invalid"
    }
  }
}
```

#### Processing Errors
```json
{
  "status": "error",
  "error": {
    "code": "PROCESSING_ERROR",
    "message": "Video generation failed",
    "details": {
      "step": "video_assembly",
      "reason": "Insufficient disk space"
    }
  }
}
```

## 🔧 Configuration

### Environment Variables
```bash
# Server Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=false

# External API Keys
GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key

# File Paths
FFMPEG_PATH=/usr/bin/ffmpeg
IMAGEMAGICK_PATH=/usr/bin/convert
OUTPUT_DIR=./outputs

# Rate Limiting (Future)
RATE_LIMIT_PER_MINUTE=10
MAX_CONCURRENT_GENERATIONS=3
```

### API Limits

#### Current Limits
- **Concurrent Generations**: 1 (single-threaded)
- **Video Length**: 15-60 seconds
- **Topic Length**: 500 characters max
- **File Size**: 100MB max output

#### Future Limits
```json
{
  "rate_limits": {
    "requests_per_minute": 10,
    "generations_per_hour": 20,
    "concurrent_generations": 3
  },
  "resource_limits": {
    "max_video_length": 300,
    "max_file_size": "500MB",
    "storage_quota": "10GB"
  }
}
```

## 🧪 Testing

### API Testing Examples

#### Using cURL
```bash
# Test video generation
curl -X GET "http://localhost:8000/generate?topic=الذكاء الاصطناعي&voice_name=هيثم"

# Test SSE connection
curl -N -H "Accept: text/event-stream" "http://localhost:8000/stream"
```

#### Using Python requests
```python
import requests
import json

# Generate video
response = requests.get(
    "http://localhost:8000/generate",
    params={
        "topic": "الذكاء الاصطناعي",
        "voice_name": "هيثم"
    }
)

print(response.json())

# Listen to progress
import sseclient

response = requests.get("http://localhost:8000/stream", stream=True)
client = sseclient.SSEClient(response)

for event in client.events():
    data = json.loads(event.data)
    print(f"Progress: {data['progress']}% - {data['message']}")
```

#### Using JavaScript/Fetch
```javascript
// Generate video
fetch('/generate?topic=الذكاء الاصطناعي&voice_name=هيثم')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

// Listen to progress
const eventSource = new EventSource('/stream');
eventSource.onmessage = function(event) {
    const data = JSON.parse(event.data);
    console.log(`${data.progress}%: ${data.message}`);
};
```

## 🚀 Future API Enhancements

### Planned Endpoints

#### User Management
```http
POST /api/v1/auth/register
POST /api/v1/auth/login
GET /api/v1/user/profile
PUT /api/v1/user/profile
```

#### Video Management
```http
GET /api/v1/videos
GET /api/v1/videos/{id}
DELETE /api/v1/videos/{id}
POST /api/v1/videos/{id}/share
```

#### Analytics
```http
GET /api/v1/analytics/usage
GET /api/v1/analytics/videos/{id}/stats
```

### Webhook Support
```http
POST /api/v1/webhooks/generation-complete
```

**Webhook Payload**:
```json
{
  "event": "video.generation.completed",
  "video_id": "uuid-string",
  "user_id": "user-uuid",
  "status": "success",
  "file_url": "https://cdn.example.com/videos/uuid.mp4",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

This API documentation provides a comprehensive reference for integrating with the Vidzyme video generation platform, covering all current endpoints and planned future enhancements.