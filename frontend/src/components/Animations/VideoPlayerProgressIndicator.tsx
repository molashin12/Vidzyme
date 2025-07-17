import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, Maximize, CheckCircle, AlertCircle, Clock, Sparkles, Download, Globe, Wand2 } from 'lucide-react';

interface ProgressUpdate {
  step: string;
  progress: number;
  message: string;
  details?: string;
  timestamp?: number;
}

interface VideoPlayerProgressIndicatorProps {
  isProcessing: boolean;
  progress: number;
  stage: string;
  message: string;
  details?: string;
  timestamp?: number;
  videoPath?: string;
  onVideoReady?: (videoPath: string) => void;
  onDownload?: () => void;
  onGoToDashboard?: () => void;
  onCreateAnother?: () => void;
}

const VideoPlayerProgressIndicator: React.FC<VideoPlayerProgressIndicatorProps> = ({
  isProcessing,
  progress,
  stage,
  message,
  details,
  timestamp,
  videoPath,
  onVideoReady,
  onDownload,
  onGoToDashboard,
  onCreateAnother
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  
  const isComplete = progress === 100;
  const hasError = details?.includes('Error') || false;

  const stages = [
    { name: 'Initialize', key: 'initializing', icon: '🚀', color: '#3B82F6', description: 'Setting up generation pipeline' },
    { name: 'Title', key: 'title', icon: '📝', color: '#8B5CF6', description: 'Creating compelling title' },
    { name: 'Script', key: 'script', icon: '📄', color: '#06B6D4', description: 'Writing engaging script' },
    { name: 'Images', key: 'images', icon: '🖼️', color: '#10B981', description: 'Generating visual content' },
    { name: 'Voice', key: 'voice', icon: '🎤', color: '#F59E0B', description: 'Synthesizing voice narration' },
    { name: 'Video', key: 'video', icon: '🎬', color: '#EF4444', description: 'Assembling final video' },
    { name: 'Complete', key: 'completed', icon: '✅', color: '#27AE60', description: 'Video ready for preview' }
  ];

  const currentStage = stages.find(s => s.key === stage) || stages[0];
  const currentStageIndex = stages.findIndex(s => s.key === stage);

  // Auto-show video when generation is complete
  useEffect(() => {
    if (isComplete && videoPath) {
      // Small delay for smooth transition
      const timer = setTimeout(() => {
        setShowVideo(true);
        if (onVideoReady) {
          onVideoReady(videoPath);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isComplete, videoPath, onVideoReady]);
  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const getStageProgress = (stageKey: string) => {
    const stageIndex = stages.findIndex(s => s.key === stageKey);
    
    if (stageIndex < currentStageIndex) return 100;
    if (stageIndex === currentStageIndex) return progress;
    return 0;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Video Player Container */}
      <div 
        className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500"
        style={{
          boxShadow: isProcessing ? `0 0 30px ${currentStage.color}40` : '0 0 20px rgba(0,0,0,0.5)'
        }}
      >
        {/* Video Content Area */}
        <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
          {/* Animated Background */}
          <div 
            className="absolute inset-0 opacity-20 transition-all duration-1000"
            style={{
              background: `linear-gradient(45deg, ${currentStage.color}20, transparent)`,
              transform: `translateX(${progress - 100}%)`
            }}
          />
          
          {/* Floating Animation Particles */}
          {isProcessing && [...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full opacity-60 animate-pulse"
              style={{
                backgroundColor: currentStage.color,
                left: `${15 + i * 10}%`,
                top: `${25 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.3}s`,
                transform: `translateY(${Math.sin(Date.now() * 0.001 + i) * 10}px)`
              }}
            />
          ))}

          {/* Main Content */}
          {showVideo && videoPath ? (
            // Video Preview Mode
            <video 
              className="w-full h-full object-cover"
              controls
              autoPlay={isPlaying}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src={videoPath} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          ) : (
            // Progress Mode
            <div className="relative z-10 text-center">
              {/* Main Progress Circle */}
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#374151"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke={hasError ? "#ef4444" : currentStage.color}
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                
                {/* Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {hasError ? (
                    <AlertCircle className="w-12 h-12 text-red-500" />
                  ) : isComplete ? (
                    <div 
                      className="w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110"
                      style={{ backgroundColor: `${currentStage.color}20`, border: `2px solid ${currentStage.color}` }}
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      <Play className="w-8 h-8 ml-1" style={{ color: currentStage.color }} />
                    </div>
                  ) : (
                    <div className="text-center">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto animate-pulse"
                        style={{ backgroundColor: `${currentStage.color}20`, border: `2px solid ${currentStage.color}` }}
                      >
                        <span className="text-2xl">{currentStage.icon}</span>
                      </div>
                      <span className="text-2xl font-bold text-white">{Math.round(progress)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stage Information */}
              <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                hasError ? 'text-red-400' :
                isComplete ? 'text-green-400' : 'text-white'
              }`}>
                {currentStage.name}
              </h3>
              
              <p className="text-gray-300 mb-4 max-w-md mx-auto">
                {currentStage.description}
              </p>

              {/* Progress Bar */}
              <div className="w-80 bg-gray-700 rounded-full h-3 mx-auto mb-4">
                <div 
                  className="h-3 rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: hasError ? '#ef4444' : currentStage.color,
                    width: `${progress}%`,
                    boxShadow: `0 0 10px ${hasError ? '#ef4444' : currentStage.color}40`
                  }}
                />
              </div>

              {/* Message Display */}
              <div className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg max-w-md mx-auto">
                {message}
              </div>
            </div>
          )}
        </div>

        {/* Video Player Controls */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors disabled:opacity-50"
                disabled={!showVideo}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <span className="text-sm font-medium">
                {showVideo ? 'AI Generated Video' : `${currentStage.name} - ${Math.round(progress)}%`}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              {details && (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-300">{details}</span>
                </div>
              )}
              
              {timestamp && (
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(timestamp)}</span>
                </div>
              )}
              
              <Volume2 className="w-5 h-5 opacity-50" />
              <Maximize className="w-5 h-5 opacity-50" />
            </div>
          </div>
          
          {/* Main Progress Bar */}
          <div className="mt-3 w-full bg-white/20 rounded-full h-1">
            <div 
              className="h-1 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: hasError ? '#ef4444' : currentStage.color,
                width: `${showVideo ? 0 : progress}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Stage Progress Indicators */}
      {!showVideo && (
        <div className="mt-6 grid grid-cols-7 gap-2">
          {stages.map((stageItem) => {
            const stageProgress = getStageProgress(stageItem.key);
            const isActive = stageItem.key === stage;
            const isCompleted = stageProgress === 100;
            
            return (
              <div key={stageItem.key} className="text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 mx-auto mb-2 ${
                  hasError && isActive ? 'bg-red-500 text-white shadow-lg' :
                  isCompleted ? 'bg-green-500 text-white shadow-lg' :
                  isActive ? 'text-white shadow-lg scale-110' :
                  'bg-gray-700 text-gray-400'
                }`}
                style={{
                  backgroundColor: isActive && !hasError ? `${stageItem.color}` : undefined,
                  boxShadow: isActive ? `0 0 20px ${stageItem.color}40` : undefined
                }}>
                  {isCompleted ? '✓' : stageItem.icon}
                </div>
                
                <div className="text-xs text-gray-400 font-medium mb-1">
                  {stageItem.name}
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div 
                    className="h-1 rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: hasError && isActive ? '#ef4444' : stageItem.color,
                      width: `${stageProgress}%`
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completion Animation */}
      {isComplete && !hasError && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-full border border-green-500/30">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Video Generation Complete!</span>
          </div>
        </div>
      )}

      {/* Action Buttons - Show when video is ready */}
      {showVideo && videoPath && (
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {onDownload && (
            <button
              onClick={onDownload}
              className="bg-[#27AE60] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#229954] transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Video</span>
            </button>
          )}
          {onGoToDashboard && (
            <button
              onClick={onGoToDashboard}
              className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Globe className="w-4 h-4" />
              <span>Go to Dashboard</span>
            </button>
          )}
          {onCreateAnother && (
            <button
              onClick={onCreateAnother}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Wand2 className="w-4 h-4" />
              <span>Create Another</span>
            </button>
          )}
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full border border-red-500/30">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Generation Error - Please try again</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayerProgressIndicator;