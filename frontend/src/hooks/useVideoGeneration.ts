import { useState, useCallback, useRef } from 'react';
import { apiClient, VideoGenerationRequest, VideoGenerationResponse } from '../services/api';

export interface VideoGenerationData {
  prompt: string;
  voice: string;
  duration: number;
  title?: string;
  description?: string;
}

export interface ProgressUpdate {
  step: string;
  progress: number;
  message: string;
  details?: string;
  timestamp?: number;
}

export const useVideoGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setProgress(null);
    setError(null);
    setVideoUrl(null);
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  const resetState = resetGeneration; // Alias for backward compatibility

  const generateVideo = useCallback(async (data: VideoGenerationData): Promise<VideoGenerationResponse> => {
    setIsGenerating(true);
    setError(null);
    setProgress(null);
    setVideoUrl(null);

    try {
      // Start the generation process
      const result = await apiClient.generateVideo(data as VideoGenerationRequest);
      
      // Listen for progress updates
      const progressStream = apiClient.createProgressStream(
        (update) => {
          const progressData: ProgressUpdate = {
            step: update.step || 'processing',
            progress: update.progress || update.percentage || 0,
            message: update.message,
            details: update.error ? `Error: ${update.error}` : undefined,
            timestamp: Date.now()
          };
          setProgress(progressData);
          
          // Check if generation is complete
          if (update.completed || progressData.progress === 100) {
            setIsGenerating(false);
            setVideoUrl('/outputs/youtube_short.mp4');
          }
          
          // Check for errors
          if (update.error) {
            setError(update.error);
            setIsGenerating(false);
          }
        },
        (error) => {
          console.error('Progress stream error:', error);
          setError('Connection error occurred');
          setIsGenerating(false);
        }
      );
      
      eventSourceRef.current = progressStream;
      
      return result;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsGenerating(false);
      throw err;
    }
  }, []);

  return {
    isGenerating,
    progress,
    error,
    videoUrl,
    generateVideo,
    resetGeneration,
    resetState
  };
};