import React from 'react';
import { CheckCircle, Loader, Sparkles, AlertCircle, Clock } from 'lucide-react';

interface ProgressUpdate {
  step: string;
  progress: number;
  message: string;
  details?: string;
  timestamp?: number;
}

interface ProcessingIndicatorProps {
  isProcessing: boolean;
  progress: ProgressUpdate;
}

const ProcessingIndicator: React.FC<ProcessingIndicatorProps> = ({
  isProcessing,
  progress: progressData
}) => {
  const progress = progressData.progress;
  const stage = progressData.step;
  const message = progressData.message;
  const details = progressData.details;
  const timestamp = progressData.timestamp;
  const isComplete = progress === 100;
  const hasError = details?.includes('Error') || false;
  const stages = [
    { name: 'Initialize', key: 'initializing', icon: '🚀' },
    { name: 'Title', key: 'title', icon: '📝' },
    { name: 'Script', key: 'script', icon: '📄' },
    { name: 'Images', key: 'images', icon: '🖼️' },
    { name: 'Voice', key: 'voice', icon: '🎤' },
    { name: 'Video', key: 'video', icon: '🎬' },
    { name: 'Complete', key: 'completed', icon: '✅' }
  ];

  const getStageProgress = (stageKey: string) => {
    const currentIndex = stages.findIndex(s => s.key === stage);
    const stageIndex = stages.findIndex(s => s.key === stageKey);
    
    if (stageIndex < currentIndex) return 100;
    if (stageIndex === currentIndex) return progress;
    return 0;
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-gray-900 rounded-xl shadow-lg border border-gray-700">
      {/* Main Progress Circle */}
      <div className="relative w-36 h-36 mx-auto mb-6">
        <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke="#374151"
            strokeWidth="6"
            fill="none"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            stroke={hasError ? "#ef4444" : "url(#gradient)"}
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            className="transition-all duration-700 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#6ee7b7" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Center Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {hasError ? (
            <AlertCircle className="w-10 h-10 text-red-500" />
          ) : isComplete ? (
            <CheckCircle className="w-10 h-10 text-green-500" />
          ) : (
            <div className="text-center">
              <Loader className="w-8 h-8 text-green-400 animate-spin mx-auto mb-1" />
              <span className="text-xl font-bold text-white">{Math.round(progress)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center mb-6">
        <h3 className={`text-xl font-semibold mb-2 ${
          hasError ? 'text-red-400' :
          isComplete ? 'text-green-400' : 'text-white'
        }`}>
          {stage ? stage.charAt(0).toUpperCase() + stage.slice(1) : 'Processing'}
        </h3>
        
        <div className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg mb-2">
          {message}
        </div>
        
        {details && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-300">{details}</span>
          </div>
        )}
        
        {timestamp && (
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            <span>{formatTimestamp(timestamp)}</span>
          </div>
        )}
      </div>

      {/* Stage Breakdown */}
      <div className="space-y-3">
        {stages.map((stageItem, index) => {
          const stageProgress = getStageProgress(stageItem.key);
          const isActive = stageItem.key === stage;
          const isCompleted = stageProgress === 100;
          
          return (
            <div key={stageItem.key} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                hasError && isActive ? 'bg-red-500 text-white' :
                isCompleted ? 'bg-green-500 text-white shadow-lg' :
                isActive ? 'bg-green-500 text-white shadow-lg scale-110' :
                'bg-gray-700 text-gray-400'
              }`}>
                {isCompleted ? '✓' : isActive ? stageItem.icon : index + 1}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium transition-colors ${
                    hasError && isActive ? 'text-red-400' :
                    isActive ? 'text-green-400' : 
                    isCompleted ? 'text-green-400' : 'text-gray-400'
                  }`}>
                    {stageItem.name}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {Math.round(stageProgress)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                      hasError && isActive ? 'bg-red-500' :
                      isCompleted ? 'bg-green-500' :
                      isActive ? 'bg-gradient-to-r from-green-500 to-green-400' : 'bg-gray-600'
                    }`}
                    style={{ width: `${stageProgress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Progress Animation */}
      {!isComplete && !hasError && (
        <div className="mt-4 flex justify-center">
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingIndicator;