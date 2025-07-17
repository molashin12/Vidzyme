interface VideoGenerationRequest {
  prompt: string;
  voice: string;
  duration: number;
  title?: string;
  description?: string;
}

interface VideoGenerationResponse {
  success: boolean;
  video_id?: string;
  video_path?: string;
  message?: string;
}

interface ProgressUpdate {
  message: string;
  progress?: number;
  step?: string;
  percentage?: number;
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
    const url = this.getURL('/generate');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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
        // Try to parse as JSON first (structured progress data)
        const data = JSON.parse(event.data);
        onProgress({
          message: data.message || event.data,
          progress: data.progress,
          step: data.step,
          percentage: data.progress, // For backward compatibility
          completed: data.progress === 100,
          error: data.details && data.details.startsWith('Error:') ? data.details : undefined
        });
      } catch (error) {
        // Fallback to plain text message
        console.log('Received plain text message:', event.data);
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