# Frontend Integration Guide

## 🔗 Connecting to Vidzyme API

This guide explains how to integrate your frontend application with the Vidzyme API-only backend.

## 📋 API Overview

### Base Configuration
```javascript
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINTS = {
    info: '/',
    generate: '/generate',
    stream: '/stream',
    status: '/status',
    voices: '/voices',
    health: '/health'
};
```

## 🚀 Quick Start Integration

### 1. Basic API Client
```javascript
class VidzemeAPIClient {
    constructor(baseURL = 'http://localhost:8000') {
        this.baseURL = baseURL;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    // Get API information
    async getInfo() {
        return this.request('/');
    }

    // Get available voices
    async getVoices() {
        return this.request('/voices');
    }

    // Start video generation
    async generateVideo(topic, voiceName = 'Rachel') {
        return this.request('/generate', {
            method: 'POST',
            body: JSON.stringify({
                topic,
                voice_name: voiceName
            })
        });
    }

    // Get current status
    async getStatus() {
        return this.request('/status');
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }

    // Listen to progress updates
    createProgressStream(onProgress, onError, onComplete) {
        const eventSource = new EventSource(`${this.baseURL}/stream`);
        
        eventSource.onmessage = (event) => {
            const progress = JSON.parse(event.data);
            onProgress(progress);
            
            if (progress.status === 'completed') {
                onComplete(progress);
                eventSource.close();
            } else if (progress.status === 'error') {
                onError(progress);
                eventSource.close();
            }
        };
        
        eventSource.onerror = (error) => {
            onError(error);
            eventSource.close();
        };
        
        return eventSource;
    }
}
```

### 2. React Integration Example
```jsx
import React, { useState, useEffect } from 'react';
import { VidzemeAPIClient } from './api-client';

const VideoGenerator = () => {
    const [api] = useState(new VidzemeAPIClient());
    const [voices, setVoices] = useState([]);
    const [topic, setTopic] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('Rachel');
    const [progress, setProgress] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    // Load voices on component mount
    useEffect(() => {
        loadVoices();
    }, []);

    const loadVoices = async () => {
        try {
            const voicesData = await api.getVoices();
            setVoices(voicesData.voices);
        } catch (err) {
            setError('Failed to load voices');
        }
    };

    const startGeneration = async () => {
        if (!topic.trim()) {
            setError('Please enter a topic');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setProgress(null);

        try {
            // Start generation
            await api.generateVideo(topic, selectedVoice);
            
            // Listen to progress
            api.createProgressStream(
                (progressData) => {
                    setProgress(progressData);
                },
                (errorData) => {
                    setError(errorData.message || 'Generation failed');
                    setIsGenerating(false);
                },
                (completedData) => {
                    setProgress(completedData);
                    setIsGenerating(false);
                }
            );
        } catch (err) {
            setError(err.message);
            setIsGenerating(false);
        }
    };

    return (
        <div className="video-generator">
            <h2>AI Video Generator</h2>
            
            {error && (
                <div className="error">
                    {error}
                </div>
            )}
            
            <div className="form-group">
                <label>Topic:</label>
                <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter video topic..."
                    disabled={isGenerating}
                />
            </div>
            
            <div className="form-group">
                <label>Voice:</label>
                <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    disabled={isGenerating}
                >
                    {voices.map(voice => (
                        <option key={voice} value={voice}>{voice}</option>
                    ))}
                </select>
            </div>
            
            <button
                onClick={startGeneration}
                disabled={isGenerating || !topic.trim()}
            >
                {isGenerating ? 'Generating...' : 'Generate Video'}
            </button>
            
            {progress && (
                <div className="progress">
                    <div className="progress-bar">
                        <div 
                            className="progress-fill" 
                            style={{ width: `${progress.progress}%` }}
                        />
                    </div>
                    <p>{progress.message}</p>
                    <p>Step: {progress.step}</p>
                    <p>Progress: {progress.progress}%</p>
                    
                    {progress.status === 'completed' && progress.video_path && (
                        <div className="result">
                            <h3>Video Generated Successfully!</h3>
                            <p>Video saved to: {progress.video_path}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoGenerator;
```

### 3. Vue.js Integration Example
```vue
<template>
  <div class="video-generator">
    <h2>AI Video Generator</h2>
    
    <div v-if="error" class="error">
      {{ error }}
    </div>
    
    <div class="form-group">
      <label>Topic:</label>
      <input
        v-model="topic"
        type="text"
        placeholder="Enter video topic..."
        :disabled="isGenerating"
      />
    </div>
    
    <div class="form-group">
      <label>Voice:</label>
      <select v-model="selectedVoice" :disabled="isGenerating">
        <option v-for="voice in voices" :key="voice" :value="voice">
          {{ voice }}
        </option>
      </select>
    </div>
    
    <button
      @click="startGeneration"
      :disabled="isGenerating || !topic.trim()"
    >
      {{ isGenerating ? 'Generating...' : 'Generate Video' }}
    </button>
    
    <div v-if="progress" class="progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: progress.progress + '%' }"
        />
      </div>
      <p>{{ progress.message }}</p>
      <p>Step: {{ progress.step }}</p>
      <p>Progress: {{ progress.progress }}%</p>
      
      <div v-if="progress.status === 'completed' && progress.video_path" class="result">
        <h3>Video Generated Successfully!</h3>
        <p>Video saved to: {{ progress.video_path }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { VidzemeAPIClient } from './api-client';

export default {
  name: 'VideoGenerator',
  data() {
    return {
      api: new VidzemeAPIClient(),
      voices: [],
      topic: '',
      selectedVoice: 'Rachel',
      progress: null,
      isGenerating: false,
      error: null
    };
  },
  async mounted() {
    await this.loadVoices();
  },
  methods: {
    async loadVoices() {
      try {
        const voicesData = await this.api.getVoices();
        this.voices = voicesData.voices;
      } catch (err) {
        this.error = 'Failed to load voices';
      }
    },
    async startGeneration() {
      if (!this.topic.trim()) {
        this.error = 'Please enter a topic';
        return;
      }

      this.isGenerating = true;
      this.error = null;
      this.progress = null;

      try {
        await this.api.generateVideo(this.topic, this.selectedVoice);
        
        this.api.createProgressStream(
          (progressData) => {
            this.progress = progressData;
          },
          (errorData) => {
            this.error = errorData.message || 'Generation failed';
            this.isGenerating = false;
          },
          (completedData) => {
            this.progress = completedData;
            this.isGenerating = false;
          }
        );
      } catch (err) {
        this.error = err.message;
        this.isGenerating = false;
      }
    }
  }
};
</script>
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in your frontend project:
```env
VITE_API_BASE_URL=http://localhost:8000
# or for production
VITE_API_BASE_URL=https://your-api-domain.com
```

### CORS Configuration
For production, update the CORS settings in `server.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],  # Specific domain
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## 📊 Error Handling

### Common Error Responses
```javascript
// Handle API errors
try {
    const result = await api.generateVideo(topic, voice);
} catch (error) {
    if (error.message.includes('409')) {
        // Generation already in progress
        console.log('Video generation already in progress');
    } else if (error.message.includes('400')) {
        // Invalid parameters
        console.log('Invalid topic or voice selection');
    } else {
        // Other errors
        console.error('Unexpected error:', error.message);
    }
}
```

## 🚀 Deployment

### Frontend Build
1. Build your frontend application
2. Configure API base URL for production
3. Deploy to your preferred hosting service

### Backend Setup
1. Run the API server: `python server.py`
2. Ensure CORS is configured for your frontend domain
3. Set up reverse proxy if needed (nginx, Apache)

## 📝 API Reference

For complete API documentation, visit:
- **Interactive Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **API Info**: `http://localhost:8000/`

## 🔍 Testing

### Test API Connection
```javascript
// Test if API is accessible
async function testConnection() {
    try {
        const api = new VidzemeAPIClient();
        const info = await api.getInfo();
        console.log('API connected successfully:', info);
        return true;
    } catch (error) {
        console.error('API connection failed:', error);
        return false;
    }
}
```

This guide provides everything you need to integrate your frontend with the Vidzyme API backend. The API is designed to be framework-agnostic and can work with any frontend technology that supports HTTP requests and Server-Sent Events.