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

### 2. Core Video Generation

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

#### Get Video Progress
```http
GET /progress/{video_id}
```

**Description**: Get the current progress of a video generation task.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `video_id` | string | Yes | Unique video generation ID |

**Response Format**:
```json
{
  "video_id": "uuid-string",
  "status": "processing",
  "progress": 65,
  "current_step": "voice_synthesis",
  "message": "Generating voice for segment 3 of 5",
  "estimated_remaining": 45
}
```

#### Get Video Details
```http
GET /video/{video_id}
```

**Description**: Retrieve details and download link for a completed video.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `video_id` | string | Yes | Unique video generation ID |

**Response Format**:
```json
{
  "video_id": "uuid-string",
  "title": "Generated Title",
  "status": "completed",
  "duration": 45,
  "file_path": "/outputs/youtube_short.mp4",
  "download_url": "/static/outputs/youtube_short.mp4",
  "thumbnail_url": "/static/outputs/thumbnails/youtube_short_thumbnail.jpg",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### 3. Scheduled Video Management

#### Create Scheduled Video
```http
POST /scheduled-videos
```

**Description**: Schedule a video for future generation.

**Request Body**:
```json
{
  "topic": "الذكاء الاصطناعي",
  "voice_name": "هيثم",
  "scheduled_time": "2024-01-15T15:30:00Z",
  "recurring": false,
  "interval_hours": null
}
```

**Response Format**:
```json
{
  "id": "schedule-uuid",
  "topic": "الذكاء الاصطناعي",
  "voice_name": "هيثم",
  "scheduled_time": "2024-01-15T15:30:00Z",
  "status": "scheduled",
  "created_at": "2024-01-15T10:30:00Z"
}
```

#### Get Scheduled Videos
```http
GET /scheduled-videos
```

**Description**: Retrieve all scheduled videos.

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (scheduled, processing, completed, failed) |
| `limit` | integer | No | Maximum number of results (default: 50) |
| `offset` | integer | No | Number of results to skip (default: 0) |

**Response Format**:
```json
{
  "scheduled_videos": [
    {
      "id": "schedule-uuid",
      "topic": "الذكاء الاصطناعي",
      "voice_name": "هيثم",
      "scheduled_time": "2024-01-15T15:30:00Z",
      "status": "scheduled",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### Get Scheduled Video Details
```http
GET /scheduled-videos/{schedule_id}
```

**Description**: Get details of a specific scheduled video.

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `schedule_id` | string | Yes | Unique schedule ID |

#### Update Scheduled Video
```http
PUT /scheduled-videos/{schedule_id}
```

**Description**: Update a scheduled video (only if not yet processed).

**Request Body**:
```json
{
  "topic": "Updated topic",
  "scheduled_time": "2024-01-15T16:30:00Z"
}
```

#### Delete Scheduled Video
```http
DELETE /scheduled-videos/{schedule_id}
```

**Description**: Cancel a scheduled video.

### 4. Queue Management

#### Get Queue Status
```http
GET /queue/status
```

**Description**: Get current queue status and statistics.

**Response Format**:
```json
{
  "queue_size": 3,
  "processing": 1,
  "pending": 2,
  "completed_today": 15,
  "failed_today": 1,
  "average_processing_time": 180
}
```

#### Get Queue Videos
```http
GET /queue/videos
```

**Description**: Get all videos currently in the queue.

**Response Format**:
```json
{
  "videos": [
    {
      "id": "queue-uuid",
      "topic": "الذكاء الاصطناعي",
      "voice_name": "هيثم",
      "status": "processing",
      "progress": 45,
      "added_at": "2024-01-15T10:30:00Z",
      "estimated_completion": "2024-01-15T10:33:00Z"
    }
  ],
  "total": 3
}
```

#### Clear Queue
```http
DELETE /queue/clear
```

**Description**: Clear all pending videos from the queue (admin only).

**Response Format**:
```json
{
  "message": "Queue cleared successfully",
  "cleared_count": 5
}
```

### 5. System Health

#### Health Check
```http
GET /health
```

**Description**: Check system health and service status.

**Response Format**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "gemini_api": "available",
    "elevenlabs_api": "available",
    "ffmpeg": "installed",
    "imagemagick": "installed"
  },
  "system": {
    "cpu_usage": 45.2,
    "memory_usage": 67.8,
    "disk_space": 85.3,
    "queue_size": 3
  }
}
```

#### API Documentation
```http
GET /docs
```

**Description**: Interactive API documentation (Swagger UI).

#### Alternative API Documentation
```http
GET /redoc
```

**Description**: Alternative API documentation (ReDoc).

### 6. Real-time Updates

#### Server-Sent Events Stream
```http
GET /stream
```

**Description**: Real-time progress updates for video generation.

**Response Headers**:
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**Event Format**:
```
data: {"step": "script_generation", "progress": 20, "message": "Generating video script..."}
```

#### WebSocket Connection (Future)
```http
WS /ws/{video_id}
```

**Description**: WebSocket connection for real-time video generation updates.
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