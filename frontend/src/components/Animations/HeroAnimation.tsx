import React, { useState, useEffect } from 'react';
import { Play, Wand2, Mic, Video, Share2, Sparkles, Zap } from 'lucide-react';

export default function HeroAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  const steps = [
    { icon: Wand2, label: 'AI generates script', color: '#27AE60' },
    { icon: Mic, label: 'Creates voiceover', color: '#2ECC71' },
    { icon: Video, label: 'Builds video', color: '#58D68D' },
    { icon: Share2, label: 'Auto-publishes', color: '#82E0AA' }
  ];

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % steps.length);
    }, 2000);

    const particleInterval = setInterval(() => {
      setParticles(prev => [
        ...prev.slice(-30),
        {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 2
        }
      ]);
    }, 150);

    return () => {
      clearInterval(stepInterval);
      clearInterval(particleInterval);
    };
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto h-96 flex items-center justify-center">
      {/* Background particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bg-[#27AE60] rounded-full opacity-30 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${3 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 2}s`
          }}
        />
      ))}

      {/* Central play button */}
      <div className="relative">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`w-24 h-24 bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 ${
            isPlaying ? 'animate-pulse' : ''
          }`}
        >
          <Play className="w-12 h-12 text-white fill-white ml-1" />
        </button>

        {/* Ripple effect */}
        <div className="absolute inset-0 rounded-full border-4 border-[#27AE60] animate-ping opacity-20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-[#2ECC71] animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Floating steps */}
      {steps.map((step, index) => {
        const angle = (index * 90) - 45;
        const radius = 140;
        const x = Math.cos(angle * Math.PI / 180) * radius;
        const y = Math.sin(angle * Math.PI / 180) * radius;
        const isActive = activeStep === index;

        return (
          <div
            key={index}
            className={`absolute transition-all duration-700 ${
              isActive ? 'scale-110' : 'scale-100'
            }`}
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(${x - 40}px, ${y - 40}px)`
            }}
          >
            <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-500 ${
              isActive 
                ? 'bg-gradient-to-r from-[#27AE60] to-[#2ECC71] shadow-lg' 
                : 'bg-gray-800 border-2 border-gray-700'
            }`}>
              <step.icon 
                className={`w-6 h-6 transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-gray-400'
                }`} 
              />
            </div>
            
            {/* Step label */}
            <div className={`mt-2 text-center transition-all duration-300 ${
              isActive ? 'opacity-100 transform translate-y-0' : 'opacity-60 transform translate-y-2'
            }`}>
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                isActive 
                  ? 'bg-[#27AE60] text-white' 
                  : 'bg-gray-800 text-gray-400'
              }`}>
                {step.label}
              </div>
            </div>

            {/* Connection line to center */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1="40"
                y1="40"
                x2={40 - x}
                y2={40 - y}
                stroke={isActive ? '#27AE60' : '#374151'}
                strokeWidth="2"
                strokeDasharray="5,5"
                className="transition-all duration-500"
                style={{
                  strokeDashoffset: isActive ? '0' : '10',
                  opacity: isActive ? 0.8 : 0.3
                }}
              />
            </svg>
          </div>
        );
      })}

      {/* Magic sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <Sparkles
            key={i}
            className="absolute w-4 h-4 text-[#27AE60] animate-ping opacity-40"
            style={{
              left: `${20 + (i * 10)}%`,
              top: `${10 + (i * 8)}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '2s'
            }}
          />
        ))}
      </div>
    </div>
  );
}