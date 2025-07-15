import React, { useEffect, useRef, useState } from 'react';
import { Wand2, Mic, Video, Eye, Share2, CheckCircle } from 'lucide-react';

interface TimelineStep {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  color: string;
}

export default function VideoCreationTimeline() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);

  const steps: TimelineStep[] = [
    {
      icon: Wand2,
      title: 'AI Script Generation',
      description: 'Our AI analyzes your prompt and creates an engaging script tailored to your audience',
      color: '#27AE60'
    },
    {
      icon: Mic,
      title: 'Voice Synthesis',
      description: 'Natural-sounding voiceover is generated using advanced AI voice technology',
      color: '#2ECC71'
    },
    {
      icon: Video,
      title: 'Video Assembly',
      description: 'Visuals, animations, and effects are automatically synchronized with the audio',
      color: '#58D68D'
    },
    {
      icon: Eye,
      title: 'Quality Review',
      description: 'AI performs quality checks and optimizations for the best viewing experience',
      color: '#82E0AA'
    },
    {
      icon: Share2,
      title: 'Auto Publishing',
      description: 'Your video is automatically published to your connected social media platforms',
      color: '#A3E4D7'
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = parseInt(entry.target.getAttribute('data-step') || '0');
            setVisibleSteps(prev => [...new Set([...prev, stepIndex])]);
          }
        });
      },
      { threshold: 0.3 }
    );

    const stepElements = timelineRef.current?.querySelectorAll('[data-step]');
    stepElements?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={timelineRef} className="relative max-w-4xl mx-auto">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#27AE60] via-[#2ECC71] to-[#A3E4D7] opacity-30"></div>
      
      {steps.map((step, index) => {
        const isVisible = visibleSteps.includes(index);
        const StepIcon = step.icon;
        
        return (
          <div
            key={index}
            data-step={index}
            className={`relative flex items-start space-x-8 mb-16 transition-all duration-1000 ${
              isVisible 
                ? 'opacity-100 transform translate-x-0' 
                : 'opacity-0 transform translate-x-8'
            }`}
            style={{ transitionDelay: `${index * 200}ms` }}
          >
            {/* Timeline dot */}
            <div className="relative z-10">
              <div 
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                  isVisible ? 'scale-100' : 'scale-0'
                }`}
                style={{ 
                  backgroundColor: `${step.color}20`,
                  border: `2px solid ${step.color}`,
                  boxShadow: isVisible ? `0 0 20px ${step.color}40` : 'none'
                }}
              >
                <StepIcon 
                  className="w-8 h-8 transition-all duration-500"
                  style={{ color: step.color }}
                />
              </div>
              
              {/* Completion checkmark */}
              <div 
                className={`absolute -top-1 -right-1 w-6 h-6 bg-[#27AE60] rounded-full flex items-center justify-center transition-all duration-700 ${
                  isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 200 + 500}ms` }}
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div 
                className={`bg-gray-800/50 rounded-xl p-6 border border-gray-700 transition-all duration-700 ${
                  isVisible 
                    ? 'opacity-100 transform translate-y-0' 
                    : 'opacity-0 transform translate-y-4'
                }`}
                style={{ 
                  transitionDelay: `${index * 200 + 300}ms`,
                  borderColor: isVisible ? `${step.color}40` : '#374151'
                }}
              >
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
                
                {/* Progress bar */}
                <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      backgroundColor: step.color,
                      width: isVisible ? '100%' : '0%',
                      transitionDelay: `${index * 200 + 600}ms`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}