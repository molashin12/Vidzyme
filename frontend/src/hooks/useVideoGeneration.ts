import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient, VideoGenerationRequest, VideoGenerationResponse } from '../services/api';
import { DatabaseService } from '../services/database';

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

export interface RetryInfo {
  count: number;
  maxRetries: number;
  lastError?: string;
  canRetry: boolean;
}

export const useVideoGeneration = (userId?: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [retryInfo, setRetryInfo] = useState<RetryInfo>({
    count: 0,
    maxRetries: 3,
    lastError: undefined,
    canRetry: true
  });
  const [lastGenerationData, setLastGenerationData] = useState<VideoGenerationData | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const taskPollingRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeSubscriptionRef = useRef<any>(null);

  // Fetch video URL function - moved before usage
  const fetchVideoUrl = useCallback(async () => {
    try {
      const response = await fetch('/api/video-preview');
      const data = await response.json();
      if (data.exists && data.video_url) {
        setVideoUrl(data.video_url);
      } else {
        console.log('No video available yet');
      }
    } catch (error) {
      console.error('Failed to fetch video URL:', error);
    }
  }, []);

  // Poll task status for queue-based generation
  const pollTaskStatus = useCallback(async (taskId: string) => {
    setCurrentTaskId(taskId);
    
    const poll = async () => {
      try {
        const response = await fetch(`/api/queue/tasks/${taskId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success && result.data) {
          const task = result.data;
          
          // Update progress based on task status
          switch (task.status) {
            case 'pending':
              setProgress({
                step: 'queued',
                progress: 5,
                message: 'Waiting in queue...',
                timestamp: Date.now()
              });
              break;
            case 'processing':
              setProgress({
                step: 'processing',
                progress: task.progress || 10,
                message: 'Processing video...',
                timestamp: Date.now()
              });
              break;
            case 'completed':
              setProgress({
                step: 'completed',
                progress: 100,
                message: 'Video generation completed!',
                timestamp: Date.now()
              });
              setIsGenerating(false);
              setCurrentTaskId(null);
              if (taskPollingRef.current) {
                clearInterval(taskPollingRef.current);
                taskPollingRef.current = null;
              }
              fetchVideoUrl();
              return; // Stop polling
            case 'failed':
              setError(task.error_message || 'Video generation failed');
              setIsGenerating(false);
              setCurrentTaskId(null);
              if (taskPollingRef.current) {
                clearInterval(taskPollingRef.current);
                taskPollingRef.current = null;
              }
              return; // Stop polling
          }
          
          // Continue polling if task is still pending or processing
          if (task.status === 'pending' || task.status === 'processing') {
            taskPollingRef.current = setTimeout(poll, 2000); // Poll every 2 seconds
          }
        }
      } catch (error) {
        console.error('Error polling task status:', error);
        // Continue polling on error, but with longer interval
        taskPollingRef.current = setTimeout(poll, 5000);
      }
    };
    
    // Start polling
    poll();
  }, [fetchVideoUrl]);

  // Check for ongoing video generation on mount
  useEffect(() => {
    if (userId) {
      checkForOngoingGeneration();
    }
  }, [userId]);

  const checkForOngoingGeneration = useCallback(async () => {
    if (!userId) return;

    try {
      const result = await DatabaseService.getProcessingVideos(userId);
      if (result.success && result.data && result.data.length > 0) {
        const processingVideo = result.data[0]; // Get the most recent processing video
        
        setCurrentVideoId(processingVideo.id);
        setIsGenerating(true);
        setProgress({
          step: 'processing',
          progress: processingVideo.processing_progress || 0,
          message: 'Resuming video generation...',
          timestamp: Date.now()
        });

        // Set up real-time subscription for this video
        setupVideoSubscription(processingVideo.id);
        
        // Try to reconnect to progress stream
        reconnectToProgressStream();
      }
    } catch (error) {
      console.error('Error checking for ongoing generation:', error);
    }
  }, [userId]);

  const setupVideoSubscription = useCallback((videoId: string) => {
    if (realtimeSubscriptionRef.current) {
      realtimeSubscriptionRef.current.unsubscribe();
    }

    realtimeSubscriptionRef.current = DatabaseService.subscribeToVideoUpdates(videoId, (payload) => {
      const updatedVideo = payload.new;
      
      if (updatedVideo.status === 'completed') {
        setIsGenerating(false);
        setProgress({
          step: 'completed',
          progress: 100,
          message: 'Video generation completed!',
          timestamp: Date.now()
        });
        setVideoUrl(updatedVideo.video_url);
        setCurrentVideoId(null);
        
        // Clean up subscription
        if (realtimeSubscriptionRef.current) {
          realtimeSubscriptionRef.current.unsubscribe();
          realtimeSubscriptionRef.current = null;
        }
      } else if (updatedVideo.status === 'failed') {
        setIsGenerating(false);
        setError(updatedVideo.error_message || 'Video generation failed');
        setCurrentVideoId(null);
        
        // Clean up subscription
        if (realtimeSubscriptionRef.current) {
          realtimeSubscriptionRef.current.unsubscribe();
          realtimeSubscriptionRef.current = null;
        }
      } else if (updatedVideo.status === 'processing') {
        setProgress({
          step: 'processing',
          progress: updatedVideo.processing_progress || 0,
          message: 'Processing video...',
          timestamp: Date.now()
        });
      }
    });
  }, []);

  const reconnectToProgressStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Try to reconnect to the progress stream
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
          setRetryInfo(prev => ({ ...prev, count: 0, lastError: undefined, canRetry: true }));
          fetchVideoUrl();
        }
        
        // Check for errors
        if (update.error) {
          const errorMessage = update.error;
          setError(errorMessage);
          setIsGenerating(false);
          setRetryInfo(prev => ({
            ...prev,
            lastError: errorMessage,
            canRetry: prev.count < prev.maxRetries
          }));
        }
      },
      () => {
        console.log('Progress stream connection failed (expected if no active generation)');
      }
    );
    
    eventSourceRef.current = progressStream;
  }, []);

  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setProgress(null);
    setError(null);
    setVideoUrl(null);
    setCurrentVideoId(null);
    setCurrentTaskId(null);
    setRetryInfo({
      count: 0,
      maxRetries: 3,
      lastError: undefined,
      canRetry: true
    });
    setLastGenerationData(null);
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    
    if (taskPollingRef.current) {
      clearTimeout(taskPollingRef.current);
      taskPollingRef.current = null;
    }
    
    if (realtimeSubscriptionRef.current) {
      realtimeSubscriptionRef.current.unsubscribe();
      realtimeSubscriptionRef.current = null;
    }
  }, []);

  const resetState = resetGeneration; // Alias for backward compatibility

  const generateVideo = useCallback(async (data: VideoGenerationData, isRetry: boolean = false): Promise<VideoGenerationResponse> => {
    setIsGenerating(true);
    setError(null);
    setProgress({
      step: 'queuing',
      progress: 0,
      message: 'Adding video to generation queue...',
      timestamp: Date.now()
    });
    setVideoUrl(null);
    setCurrentVideoId(null);
    
    // Store the generation data for potential retries
    if (!isRetry) {
      setLastGenerationData(data);
      setRetryInfo(prev => ({ ...prev, count: 0, lastError: undefined }));
    }

    try {
      // Add delay for retries (exponential backoff)
      if (isRetry && retryInfo.count > 0) {
        const delay = Math.min(1000 * Math.pow(2, retryInfo.count - 1), 10000); // Max 10 seconds
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Start the generation process
      const result = await apiClient.generateVideo(data as VideoGenerationRequest);
      
      // Store the video ID and task ID for tracking
      if (result.video_id) {
        setCurrentVideoId(result.video_id);
        setupVideoSubscription(result.video_id);
      }
      
      // If we get a task_id, it means the video was queued
      if (result.task_id) {
        setProgress({
          step: 'queued',
          progress: 5,
          message: 'Video queued for generation. Waiting for processing...',
          timestamp: Date.now()
        });
        
        // Start polling for task status
        pollTaskStatus(result.task_id);
      }
      
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
            // Reset retry info on success
            setRetryInfo(prev => ({ ...prev, count: 0, lastError: undefined, canRetry: true }));
            // Fetch the actual video URL from the backend
            fetchVideoUrl();
          }
          
          // Check for errors
          if (update.error) {
            const errorMessage = update.error;
            setError(errorMessage);
            setIsGenerating(false);
            
            // Update retry info
            setRetryInfo(prev => ({
              ...prev,
              lastError: errorMessage,
              canRetry: prev.count < prev.maxRetries
            }));
          }
        },
        (error) => {
          console.error('Progress stream error:', error);
          const errorMessage = 'Connection error occurred';
          setError(errorMessage);
          setIsGenerating(false);
          
          // Update retry info
          setRetryInfo(prev => ({
            ...prev,
            lastError: errorMessage,
            canRetry: prev.count < prev.maxRetries
          }));
        }
      );
      
      eventSourceRef.current = progressStream;
      
      return result;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      setIsGenerating(false);
      
      // Update retry info
      setRetryInfo(prev => ({
        ...prev,
        lastError: errorMessage,
        canRetry: prev.count < prev.maxRetries
      }));
      
      throw err;
    }
  }, [retryInfo.count, fetchVideoUrl, setupVideoSubscription]);

  const retryGeneration = useCallback(async (): Promise<VideoGenerationResponse | null> => {
    if (!lastGenerationData || !retryInfo.canRetry || retryInfo.count >= retryInfo.maxRetries) {
      return null;
    }

    // Increment retry count
    setRetryInfo(prev => ({
      ...prev,
      count: prev.count + 1
    }));

    try {
      return await generateVideo(lastGenerationData, true);
    } catch (error) {
      console.error('Retry failed:', error);
      return null;
    }
  }, [lastGenerationData, retryInfo.canRetry, retryInfo.count, retryInfo.maxRetries, generateVideo]);

  return {
    isGenerating,
    progress,
    error,
    videoUrl,
    currentVideoId,
    currentTaskId,
    retryInfo,
    generateVideo,
    retryGeneration,
    resetGeneration,
    resetState,
    checkForOngoingGeneration
  };
};