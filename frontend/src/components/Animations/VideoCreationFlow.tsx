import React, { useState, useEffect } from 'react';
import { Play, Wand2, Mic, Eye, Share2, Sparkles, Zap, Film, Upload } from 'lucide-react';

interface VideoCreationFlowProps {
  isActive?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function VideoCreationFlow({ isActive = true, size = 'medium' }: VideoCreationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  const steps = [
    { icon: Wand2, label: 'AI Script', color: '#27AE60' },
    { icon: Mic, label: 'Voice Gen', color: '#2ECC71' },
    { icon: Film, label: 'Video Edit', color: '#58D68D' },
    { icon: Eye, label: 'Preview', color: '#82E0AA' },
    { icon: Share2, label: 'Publish', color: '#27AE60' }
  ];

  const sizeClasses = {
    small: 'w-32 h-32',
    medium: 'w-48 h-48',
    large: 'w-64 h-64'
  };

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 1500);

    // Generate floating particles
    const particleInterval = setInterval(() => {
      setParticles(prev => [
        ...prev.slice(-20), // Keep only last 20 particles
        {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          delay: Math.random() * 2
        }
      ]);
    }, 300);

    return () => {
      clearInterval(interval);
      clearInterval(particleInterval);
    };
  }, [isActive]);

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#27AE60]/20 to-[#2ECC71]/20 rounded-full blur-xl animate-pulse"></div>
      
      {/* Floating particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-[#27AE60] rounded-full animate-ping opacity-60"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '2s'
          }}
        />
      ))}

      {/* Central hub */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-full flex items-center justify-center shadow-lg transform transition-all duration-500 hover:scale-110">
          <Play className="w-8 h-8 text-white fill-white animate-pulse" />
        </div>
      </div>

      {/* Orbiting steps */}
      {steps.map((step, index) => {
        const angle = (index * 72) - 90; // 360/5 = 72 degrees between each step
        const radius = size === 'small' ? 60 : size === 'medium' ? 90 : 120;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;
        const isActive = currentStep === index;

        return (
          <div
            key={index}
            className={`absolute w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 transform ${
              isActive 
                ? 'scale-125 shadow-lg animate-bounce' 
                : 'scale-100 hover:scale-110'
            }`}
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${x - 24}px, ${y - 24}px)`,
              backgroundColor: isActive ? step.color : '#374151',
              boxShadow: isActive ? `0 0 20px ${step.color}50` : 'none'
            }}
          >
            <step.icon 
              className={`w-6 h-6 transition-colors duration-300 ${
                isActive ? 'text-white' : 'text-gray-400'
              }`} 
            />
          </div>
        );
      })}

      {/* Connecting lines */}
      <svg className="absolute inset-0 w-full h-full">
        {steps.map((_, index) => {
          const nextIndex = (index + 1) % steps.length;
          const angle1 = (index * 72) - 90;
          const angle2 = (nextIndex * 72) - 90;
          const radius = size === 'small' ? 60 : size === 'medium' ? 90 : 120;
          
          const x1 = Math.cos(angle1 * Math.PI / 180) * radius + (size === 'small' ? 64 : size === 'medium' ? 96 : 128);
          const y1 = Math.sin(angle1 * Math.PI / 180) * radius + (size === 'small' ? 64 : size === 'medium' ? 96 : 128);
          const x2 = Math.cos(angle2 * Math.PI / 180) * radius + (size === 'small' ? 64 : size === 'medium' ? 96 : 128);
          const y2 = Math.sin(angle2 * Math.PI / 180) * radius + (size === 'small' ? 64 : size === 'medium' ? 96 : 128);

          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={currentStep === index ? '#27AE60' : '#374151'}
              strokeWidth="2"
              strokeDasharray="5,5"
              className="transition-all duration-500"
              style={{
                strokeDashoffset: currentStep === index ? '0' : '10',
                opacity: currentStep === index ? 1 : 0.3
              }}
            />
          );
        })}
      </svg>

      {/* Step label */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium border border-[#27AE60]/30">
          {steps[currentStep].label}
        </div>
      </div>
    </div>
  );
}