import React from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthDebugPanelProps {
  isVisible?: boolean;
}

export function AuthDebugPanel({ isVisible = false }: AuthDebugPanelProps) {
  const { user, session, loading, error, refreshAuth, signOut, clearError } = useAuth();

  if (!isVisible) return null;

  const handleClearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const handleForceSignOut = async () => {
    await signOut();
    localStorage.clear();
    sessionStorage.clear();
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="text-lg font-semibold mb-3">Auth Debug Panel</h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>Status:</strong> {loading ? 'Loading...' : 'Ready'}
        </div>
        <div>
          <strong>User:</strong> {user ? user.email : 'None'}
        </div>
        <div>
          <strong>Session:</strong> {session ? 'Active' : 'None'}
        </div>
        {error && (
          <div className="text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <button
          onClick={refreshAuth}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-3 py-1 rounded text-sm"
        >
          Refresh Auth
        </button>
        
        <button
          onClick={clearError}
          className="w-full bg-yellow-600 hover:bg-yellow-700 px-3 py-1 rounded text-sm"
        >
          Clear Error
        </button>
        
        <button
          onClick={handleForceSignOut}
          className="w-full bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm"
        >
          Force Sign Out
        </button>
        
        <button
          onClick={handleClearStorage}
          className="w-full bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm"
        >
          Clear Storage & Reload
        </button>
      </div>
      
      <div className="mt-3 text-xs text-gray-400">
        Press Ctrl+Shift+D to toggle this panel
      </div>
    </div>
  );
}

// Hook to toggle debug panel with keyboard shortcut
export function useAuthDebug() {
  const [isDebugVisible, setIsDebugVisible] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setIsDebugVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isDebugVisible, setIsDebugVisible };
}