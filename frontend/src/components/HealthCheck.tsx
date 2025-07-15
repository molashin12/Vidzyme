import React, { useEffect, useState } from 'react';
import { apiClient } from '../services/api';

export default function HealthCheck() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthy = await apiClient.checkHealth();
        setIsHealthy(healthy);
      } catch (error) {
        setIsHealthy(false);
      }
    };

    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
      isHealthy === null ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30' :
      isHealthy ? 'bg-green-600/20 text-green-400 border border-green-600/30' : 
      'bg-red-600/20 text-red-400 border border-red-600/30'
    }`}>
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${
          isHealthy === null ? 'bg-yellow-400 animate-pulse' :
          isHealthy ? 'bg-green-400' : 'bg-red-400 animate-pulse'
        }`}></div>
        <span>
          {isHealthy === null ? 'Checking...' : 
           isHealthy ? 'Backend Connected' : 'Backend Disconnected'}
        </span>
      </div>
    </div>
  );
}