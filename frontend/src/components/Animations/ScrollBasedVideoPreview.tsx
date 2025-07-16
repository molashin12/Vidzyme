import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, Maximize } from 'lucide-react';

export default function ScrollBasedVideoPreview() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const containerHeight = containerRef.current.offsetHeight;
        const windowHeight = window.innerHeight;
        
        if (rect.top < windowHeight && rect.bottom > 0) {
          const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
          const progress = visibleHeight / containerHeight;
          setScrollProgress(Math.max(0, Math.min(1, progress)));
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const videoStages = [
    { stage: 'Script Generation', progress: 0.2, color: '#27AE60' },
    { stage: 'Voice Synthesis', progress: 0.4, color: '#2ECC71' },
    { stage: 'Video Assembly', progress: 0.6, color: '#58D68D' },
    { stage: 'Final Render', progress: 0.8, color: '#82E0AA' },
    { stage: 'Complete', progress: 1.0, color: '#A3E4D7' }
  ];

  const currentStage = videoStages.find(stage => scrollProgress <= stage.progress) || videoStages[0];

  return (
    <div ref={containerRef} className="relative h-screen flex items-center justify-center">
      {/* Video Preview Container */}
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Main Video Frame */}
        <div 
          className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-2xl transition-all duration-500"
          style={{
            transform: `scale(${0.8 + scrollProgress * 0.2})`,
            boxShadow: `0 0 ${scrollProgress * 50}px ${currentStage.color}40`
          }}
        >
          {/* Video Content */}
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
            {/* Animated Background */}
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(45deg, ${currentStage.color}20, transparent)`,
                transform: `translateX(${scrollProgress * 100 - 100}%)`
              }}
            />
            
            {/* Content based on stage */}
            <div className="relative z-10 text-center">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center mb-4 mx-auto transition-all duration-500"
                style={{ 
                  backgroundColor: `${currentStage.color}20`,
                  border: `2px solid ${currentStage.color}`
                }}
              >
                <Play className="w-12 h-12" style={{ color: currentStage.color }} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{currentStage.stage}</h3>
              <div className="w-64 bg-gray-700 rounded-full h-2 mx-auto">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    backgroundColor: currentStage.color,
                    width: `${(scrollProgress / currentStage.progress) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Floating Elements */}
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full opacity-60 animate-pulse"
                style={{
                  backgroundColor: currentStage.color,
                  left: `${20 + i * 12}%`,
                  top: `${30 + (i % 2) * 40}%`,
                  animationDelay: `${i * 0.2}s`,
                  transform: `translateY(${Math.sin(scrollProgress * Math.PI * 2 + i) * 10}px)`
                }}
              />
            ))}
          </div>

          {/* Video Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <span className="text-sm">AI Video Generation</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Volume2 className="w-5 h-5" />
                <Maximize className="w-5 h-5" />
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-2 w-full bg-white/20 rounded-full h-1">
              <div 
                className="h-1 rounded-full transition-all duration-300"
                style={{ 
                  backgroundColor: currentStage.color,
                  width: `${scrollProgress * 100}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* Stage Indicator */}
        <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
          <div 
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border-l-4 transition-all duration-300"
            style={{ borderColor: currentStage.color }}
          >
            <div className="text-sm font-semibold">{currentStage.stage}</div>
            <div className="text-xs text-gray-400">
              {Math.round(scrollProgress * 100)}% Complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}