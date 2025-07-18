import React, { useState, useEffect } from 'react';
import { 
  X, 
  RefreshCw, 
  Trash2, 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RotateCcw,
  Loader2,
  Users,
  Activity
} from 'lucide-react';

interface QueueTask {
  id: string;
  task_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  priority: 'low' | 'normal' | 'high';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  retry_count: number;
  payload: {
    topic?: string;
    voice_name?: string;
  };
}

interface QueueStats {
  queue_size: number;
  active_tasks: number;
  completed_tasks: number;
  failed_tasks: number;
  total_processed: number;
  average_processing_time: number;
  is_running: boolean;
}

interface QueueManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QueueManager({ isOpen, onClose }: QueueManagerProps) {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [tasks, setTasks] = useState<QueueTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueueData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      // Fetch queue stats and tasks in parallel
      const [statsResponse, tasksResponse] = await Promise.all([
        fetch(`${apiBaseUrl}/api/queue/status`),
        fetch(`${apiBaseUrl}/api/queue/tasks`)
      ]);

      if (!statsResponse.ok || !tasksResponse.ok) {
        throw new Error('Failed to fetch queue data');
      }

      const statsData = await statsResponse.json();
      const tasksData = await tasksResponse.json();

      if (statsData.success) {
        setStats(statsData.data);
      }

      if (tasksData.success) {
        setTasks(tasksData.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch queue data');
    } finally {
      setLoading(false);
    }
  };

  const retryTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/queue/retry/${taskId}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to retry task');
      }

      // Refresh data
      fetchQueueData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry task');
    }
  };

  const cancelTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/queue/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to cancel task');
      }

      // Refresh data
      fetchQueueData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel task');
    }
  };

  const clearQueue = async () => {
    if (!confirm('Are you sure you want to clear all pending tasks?')) {
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiBaseUrl}/api/queue/clear`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to clear queue');
      }

      // Refresh data
      fetchQueueData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear queue');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQueueData();
      // Set up polling for real-time updates
      const interval = setInterval(fetchQueueData, 3000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-[#27AE60] animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-[#27AE60]" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'processing':
        return 'text-[#27AE60] bg-[#27AE60]/10 border-[#27AE60]/20';
      case 'completed':
        return 'text-[#27AE60] bg-[#27AE60]/10 border-[#27AE60]/20';
      case 'failed':
        return 'text-red-400 bg-red-400/10 border-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-[#27AE60]/20 rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-[#27AE60]" />
            </div>
            <h2 className="text-xl font-semibold text-white">Queue Manager</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Error</span>
              </div>
              <p className="text-red-300 mt-1">{error}</p>
            </div>
          )}

          {/* Queue Statistics */}
          {stats && (
            <div className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Queue Size</p>
                      <p className="text-xl font-semibold text-white">{stats.queue_size}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center">
                    <Activity className="w-5 h-5 text-[#27AE60] mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Active</p>
                      <p className="text-xl font-semibold text-[#27AE60]">{stats.active_tasks}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-[#27AE60] mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Completed</p>
                      <p className="text-xl font-semibold text-[#27AE60]">{stats.completed_tasks}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-400 mr-2" />
                    <div>
                      <p className="text-sm text-gray-400">Failed</p>
                      <p className="text-xl font-semibold text-red-400">{stats.failed_tasks}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">
                  <span>Total Processed: {stats.total_processed}</span>
                  {stats.average_processing_time > 0 && (
                    <span className="ml-4">
                      Avg Time: {formatDuration(Math.round(stats.average_processing_time))}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${stats.is_running ? 'bg-[#27AE60]' : 'bg-red-400'}`} />
                  <span className="text-sm text-gray-400">
                    {stats.is_running ? 'Running' : 'Stopped'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Queue Actions */}
          <div className="mb-6 flex space-x-4">
            <button
              onClick={fetchQueueData}
              disabled={loading}
              className="px-4 py-2 bg-[#27AE60] text-white rounded-lg hover:bg-[#229954] disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={clearQueue}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Queue</span>
            </button>
          </div>

          {/* Tasks List */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Tasks</h3>
            {loading && tasks.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[#27AE60] animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-400">No tasks in queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div key={task.id} className="bg-gray-700/30 border border-gray-600 rounded-lg p-4 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(task.status)}
                        <div>
                          <p className="font-medium text-white">
                            {task.payload?.topic || 'Video Generation'}
                          </p>
                          <p className="text-sm text-gray-400">
                            Voice: {task.payload?.voice_name || 'Unknown'} • 
                            Created: {formatTime(task.created_at)}
                            {task.retry_count > 0 && ` • Retries: ${task.retry_count}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        {task.status === 'failed' && (
                          <button
                            onClick={() => retryTask(task.id)}
                            className="p-1 hover:bg-gray-600 rounded text-[#27AE60] hover:text-[#229954] transition-colors"
                            title="Retry task"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                        {task.status === 'pending' && (
                          <button
                            onClick={() => cancelTask(task.id)}
                            className="p-1 hover:bg-gray-600 rounded text-red-400 hover:text-red-300 transition-colors"
                            title="Cancel task"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {task.error_message && (
                      <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-sm text-red-300">
                        {task.error_message}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}