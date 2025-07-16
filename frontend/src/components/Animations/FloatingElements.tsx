import React, { useState, useEffect } from 'react';
import { Video, Mic, Image, Type, Sparkles, Zap, Play, Film } from 'lucide-react';

interface FloatingElement {
  id: number;
  icon: React.ComponentType<any>;
  x: number;
  y: number;
  delay: number;
  duration: number;
  color: string;
}

export default function FloatingElements() {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  const icons = [
    { icon: Video, color: '#27AE60' },
    { icon: Mic, color: '#2ECC71' },
    { icon: Image, color: '#58D68D' },
    { icon: Type, color: '#82E0AA' },
    { icon: Sparkles, color: '#A3E4D7' },
    { icon: Zap, color: '#27AE60' },
    { icon: Play, color: '#2ECC71' },
    { icon: Film, color: '#58D68D' }
  ];

  useEffect(() => {
    const generateElement = () => {
      const iconData = icons[Math.floor(Math.random() * icons.length)];
      return {
        id: Date.now() + Math.random(),
        icon: iconData.icon,
        x: Math.random() * 100,
        y: 100 + Math.random() * 20,
        delay: Math.random() * 2,
        duration: 8 + Math.random() * 4,
        color: iconData.color
      };
    };

    // Initial elements
    const initialElements = Array.from({ length: 6 }, generateElement);
    setElements(initialElements);

    // Add new elements periodically
    const interval = setInterval(() => {
      setElements(prev => [
        ...prev.slice(-15), // Keep only last 15 elements
        generateElement()
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {elements.map((element) => (
        <div
          key={element.id}
          className="absolute opacity-20 animate-float"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            animationDelay: `${element.delay}s`,
            animationDuration: `${element.duration}s`,
            color: element.color
          }}
        >
          <element.icon className="w-8 h-8" />
        </div>
      ))}
    </div>
  );
}