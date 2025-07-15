# Frontend-Backend Integration Guide

## 🎯 Overview
This guide provides step-by-step instructions to connect your React frontend (`d:\CODING\Vidzyme\frontend`) with the FastAPI backend to create a fully functional SaaS for video generation automation.

## 📋 Current State Analysis

### Backend (FastAPI)
- **Location**: `d:\CODING\Vidzyme\server.py`
- **Port**: 8000
- **Main Endpoints**:
  - `GET /` - Main interface
  - `GET /generate` - Video generation (topic, voice_name)
  - `GET /stream` - Real-time progress updates (SSE)
- **Voice Options**: Arabic voices (هيثم, يحيى, سارة, مازن, أسماء)
- **Output**: `outputs/youtube_short.mp4`

### Frontend (React + Vite)
- **Location**: `d:\CODING\Vidzyme\frontend`
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Current State**: Multi-step form with mock functionality

## 🚀 Step-by-Step Integration

### Step 1: Configure Frontend Development Server

#### 1.1 Update Vite Configuration
Edit `frontend/vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

#### 1.2 Update Environment Variables
Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PROXY_URL=/api
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiaGJ4cXR3bGZ4cmN3bGNobmR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MTMzMTUsImV4cCI6MjA2ODA4OTMxNX0.stA51LEq77o5dapHlWkMxJz2KsD4khNPAH85XpS4q_s
VITE_SUPABASE_URL=https://pbhbxqtwlfxrcwlchndu.supabase.co
```

### Step 2: Create API Service Layer

#### 2.1 Create API Client
Create `frontend/src/services/api.ts`:

```typescript
interface VideoGenerationRequest {
  topic: string;
  voice_name: string;
}

interface VideoGenerationResponse {
  status: string;
}

interface ProgressUpdate {
  message: string;
  progress?: number;
  completed?: boolean;
  error?: string;
}

class VidzemeAPIClient {
  private baseURL: string;
  private proxyURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.proxyURL = import.meta.env.VITE_API_PROXY_URL || '/api';
  }

  private getURL(endpoint: string): string {
    // Use proxy in development, direct URL in production
    return import.meta.env.DEV 
      ? `${this.proxyURL}${endpoint}`
      : `${this.baseURL}${endpoint}`;
  }

  async generateVideo(data: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const url = this.getURL(`/generate?topic=${encodeURIComponent(data.topic)}&voice_name=${encodeURIComponent(data.voice_name)}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  createProgressStream(onProgress: (update: ProgressUpdate) => void, onError: (error: Error) => void): EventSource {
    const url = this.getURL('/stream');
    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      try {
        const data = event.data;
        onProgress({ message: data });
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        onProgress({ message: event.data });
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      onError(new Error('Connection to progress stream failed'));
      eventSource.close();
    };

    return eventSource;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const url = this.getURL('/');
      const response = await fetch(url);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = new VidzemeAPIClient();
export type { VideoGenerationRequest, VideoGenerationResponse, ProgressUpdate };
```

### Step 3: Create Voice Mapping

#### 3.1 Create Voice Configuration
Create `frontend/src/config/voices.ts`:

```typescript
export interface VoiceOption {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  gender: 'male' | 'female';
}

export const ARABIC_VOICES: VoiceOption[] = [
  {
    id: 'haitham',
    name: 'Haitham',
    arabicName: 'هيثم',
    description: 'Professional male voice',
    gender: 'male'
  },
  {
    id: 'yahya',
    name: 'Yahya', 
    arabicName: 'يحيى',
    description: 'Natural male voice',
    gender: 'male'
  },
  {
    id: 'sara',
    name: 'Sara',
    arabicName: 'سارة', 
    description: 'Warm female voice',
    gender: 'female'
  },
  {
    id: 'mazen',
    name: 'Mazen',
    arabicName: 'مازن',
    description: 'Energetic male voice', 
    gender: 'male'
  },
  {
    id: 'asma',
    name: 'Asma',
    arabicName: 'أسماء',
    description: 'Calm female voice',
    gender: 'female'
  }
];

// Map frontend voice IDs to backend Arabic names
export const VOICE_MAPPING: Record<string, string> = {
  'haitham': 'هيثم',
  'yahya': 'يحيى', 
  'sara': 'سارة',
  'mazen': 'مازن',
  'asma': 'أسماء'
};
```

### Step 4: Create Progress Tracking Hook

#### 4.1 Create Progress Hook
Create `frontend/src/hooks/useVideoGeneration.ts`:

```typescript
import { useState, useCallback, useRef } from 'react';
import { apiClient, VideoGenerationRequest, ProgressUpdate } from '../services/api';

interface UseVideoGenerationReturn {
  isGenerating: boolean;
  progress: ProgressUpdate | null;
  error: string | null;
  generateVideo: (request: VideoGenerationRequest) => Promise<void>;
  resetState: () => void;
}

export function useVideoGeneration(): UseVideoGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const resetState = useCallback(() => {
    setIsGenerating(false);
    setProgress(null);
    setError(null);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const generateVideo = useCallback(async (request: VideoGenerationRequest) => {
    try {
      setIsGenerating(true);
      setError(null);
      setProgress({ message: 'Initializing video generation...' });

      // Start progress stream first
      eventSourceRef.current = apiClient.createProgressStream(
        (update) => {
          setProgress(update);
          if (update.message.includes('✅ انتهى!')) {
            setIsGenerating(false);
            setTimeout(() => {
              if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
              }
            }, 2000);
          }
        },
        (error) => {
          setError(error.message);
          setIsGenerating(false);
        }
      );

      // Start video generation
      await apiClient.generateVideo(request);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setIsGenerating(false);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    }
  }, []);

  return {
    isGenerating,
    progress,
    error,
    generateVideo,
    resetState
  };
}
```

### Step 5: Update VideoGenerator Component

#### 5.1 Integrate Real API Calls
Update `frontend/src/components/Pages/VideoGenerator.tsx`:

```typescript
// Add these imports at the top
import { useVideoGeneration } from '../../hooks/useVideoGeneration';
import { ARABIC_VOICES, VOICE_MAPPING } from '../../config/voices';

// Replace the existing voiceOptions with Arabic voices
const voiceOptions = ARABIC_VOICES.map(voice => ({
  id: voice.id,
  name: `${voice.name} (${voice.arabicName})`,
  description: voice.description
}));

// Add this inside the VideoGenerator component, after the state declarations:
const { isGenerating, progress, error, generateVideo, resetState } = useVideoGeneration();

// Replace the handleGenerate function:
const handleGenerate = async () => {
  if (!formData.prompt.trim()) {
    alert('Please enter a topic or prompt for your video.');
    return;
  }

  if (!formData.voice) {
    alert('Please select a voice for your video.');
    return;
  }

  try {
    const arabicVoiceName = VOICE_MAPPING[formData.voice];
    if (!arabicVoiceName) {
      throw new Error('Invalid voice selection');
    }

    await generateVideo({
      topic: formData.prompt,
      voice_name: arabicVoiceName
    });
  } catch (err) {
    console.error('Video generation failed:', err);
  }
};

// Add progress display in Step 4 (replace the existing generate button section):
{isGenerating ? (
  <div className="bg-blue-600/20 border border-blue-500 p-6 rounded-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-semibold text-white">Generating Video...</h3>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
    </div>
    {progress && (
      <div className="space-y-2">
        <p className="text-blue-100 text-sm">{progress.message}</p>
        {progress.progress && (
          <div className="w-full bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
        )}
      </div>
    )}
    {error && (
      <div className="mt-4 p-3 bg-red-600/20 border border-red-500 rounded text-red-200 text-sm">
        Error: {error}
      </div>
    )}
  </div>
) : (
  <div className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] p-6 rounded-lg animate-glow">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="font-semibold text-white">Ready to Generate</h3>
        <p className="text-green-100 text-sm">Estimated time: 2-3 minutes</p>
      </div>
      <button
        onClick={handleGenerate}
        disabled={!formData.prompt.trim() || !formData.voice}
        className="bg-white text-[#27AE60] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors hover-lift animate-bounce disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Generate Video
      </button>
    </div>
  </div>
)}
```

### Step 6: Add CORS Support to Backend

#### 6.1 Update Backend Dependencies
Add to `requirements.txt`:

```
fastapi-cors
```

#### 6.2 Update server.py
Add CORS middleware to `server.py` (add after FastAPI app creation):

```python
from fastapi.middleware.cors import CORSMiddleware

# Add after: app = FastAPI(title="ARABIAN AI SCHOOL Video Generator")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Step 7: Development Workflow

#### 7.1 Start Backend Server
```bash
# From project root (d:\CODING\Vidzyme)
cd d:\CODING\Vidzyme
python -m uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

#### 7.2 Start Frontend Development Server
```bash
# From frontend directory
cd d:\CODING\Vidzyme\frontend
npm install
npm run dev
```

#### 7.3 Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

### Step 8: Testing Integration

#### 8.1 Test API Connection
Create `frontend/src/components/HealthCheck.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';

export default function HealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    apiClient.checkHealth().then(setIsHealthy);
  }, []);

  return (
    <div className={`p-2 rounded text-sm ${
      isHealthy === null ? 'bg-yellow-600' :
      isHealthy ? 'bg-green-600' : 'bg-red-600'
    }`}>
      Backend: {isHealthy === null ? 'Checking...' : isHealthy ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

#### 8.2 Add to Header Component
Add `<HealthCheck />` to your Header component for real-time connection status.

### Step 9: Production Deployment

#### 9.1 Build Frontend
```bash
cd frontend
npm run build
```

#### 9.2 Serve Frontend from Backend
Update `server.py` to serve built frontend:

```python
# Add after existing static files mount
app.mount(
    "/",
    StaticFiles(directory="frontend/dist", html=True),
    name="frontend"
)
```

#### 9.3 Update Production Environment
Create `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://your-domain.com
VITE_API_PROXY_URL=
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure CORS middleware is properly configured
   - Check that frontend URL is in allowed origins

2. **API Connection Failed**
   - Verify backend is running on port 8000
   - Check firewall settings
   - Ensure proxy configuration in vite.config.ts

3. **SSE Connection Issues**
   - Check browser developer tools for EventSource errors
   - Verify `/stream` endpoint is accessible

4. **Voice Selection Not Working**
   - Verify VOICE_MAPPING matches backend voice_options
   - Check Arabic character encoding

### Debug Commands

```bash
# Check backend health
curl http://localhost:8000/

# Test video generation
curl "http://localhost:8000/generate?topic=test&voice_name=هيثم"

# Check SSE stream
curl -N http://localhost:8000/stream
```

## 🎉 Success Indicators

✅ Frontend loads at http://localhost:3000  
✅ Backend API responds at http://localhost:8000  
✅ Health check shows "Connected"  
✅ Video generation starts without errors  
✅ Progress updates appear in real-time  
✅ Generated video appears in `outputs/youtube_short.mp4`  

## 📚 Next Steps

1. **Add File Download**: Implement video download functionality
2. **Add Video Preview**: Show generated video in the frontend
3. **Add History**: Store and display previous generations
4. **Add Authentication**: Integrate with Supabase for user management
5. **Add Payment**: Integrate subscription management
6. **Add Analytics**: Track usage and performance metrics

Your Vidzyme SaaS platform is now fully integrated and ready for video generation automation! 🚀