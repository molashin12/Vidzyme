import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DatabaseService } from '../../services/database';
import { ScheduledVideo, UserChannel } from '../../config/supabase';
import { PlusIcon, PlayIcon, PauseIcon, PencilIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ScheduledVideoWithChannel extends ScheduledVideo {
  user_channels?: {
    channel_name: string;
    channel_type: string;
  };
}

interface ScheduledVideoFormData {
  channel_id: string;
  title_template: string;
  prompt_template: string;
  schedule_type: 'daily' | 'weekly' | 'monthly';
  schedule_time: string;
  is_active: boolean;
}

const ScheduledVideosManager: React.FC = () => {
  const { user } = useAuth();
  const [scheduledVideos, setScheduledVideos] = useState<ScheduledVideoWithChannel[]>([]);
  const [userChannels, setUserChannels] = useState<UserChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ScheduledVideoWithChannel | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ScheduledVideoFormData>({
    channel_id: '',
    title_template: '',
    prompt_template: '',
    schedule_type: 'weekly',
    schedule_time: '09:00',
    is_active: true
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const [scheduledResponse, channelsResponse] = await Promise.all([
        DatabaseService.getUserScheduledVideos(user.id),
        DatabaseService.getUserChannels(user.id)
      ]);

      if (scheduledResponse.success) {
        setScheduledVideos(scheduledResponse.data || []);
      }

      if (channelsResponse.success) {
        setUserChannels(channelsResponse.data || []);
        // Set default channel if none selected
        if (channelsResponse.data && channelsResponse.data.length > 0 && !formData.channel_id) {
          setFormData(prev => ({ ...prev, channel_id: channelsResponse.data[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof ScheduledVideoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.channel_id) {
      setError('Please select a channel');
      return false;
    }
    if (!formData.title_template.trim()) {
      setError('Please enter a title template');
      return false;
    }
    if (!formData.prompt_template.trim()) {
      setError('Please enter a prompt template');
      return false;
    }
    return true;
  };

  const calculateNextExecution = (scheduleType: string, scheduleTime: string): string => {
    const now = new Date();
    const [hours, minutes] = scheduleTime.split(':').map(Number);
    
    let nextExecution = new Date();
    nextExecution.setHours(hours, minutes, 0, 0);
    
    // If the time has passed today, move to next occurrence
    if (nextExecution <= now) {
      switch (scheduleType) {
        case 'daily':
          nextExecution.setDate(nextExecution.getDate() + 1);
          break;
        case 'weekly':
          nextExecution.setDate(nextExecution.getDate() + 7);
          break;
        case 'monthly':
          nextExecution.setMonth(nextExecution.getMonth() + 1);
          break;
      }
    }
    
    return nextExecution.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !validateForm()) return;

    setIsSubmitting(true);
    try {
      const nextExecution = calculateNextExecution(formData.schedule_type, formData.schedule_time);
      
      const scheduledVideoData = {
        ...formData,
        next_execution: nextExecution
      };

      let response;
      if (editingVideo) {
        response = await DatabaseService.updateScheduledVideo(editingVideo.id, scheduledVideoData);
      } else {
        response = await DatabaseService.createScheduledVideo(user.id, scheduledVideoData);
      }

      if (response.success) {
        await fetchData();
        resetForm();
      } else {
        setError(response.error || 'Failed to save scheduled video');
      }
    } catch (error) {
      console.error('Error saving scheduled video:', error);
      setError('An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      channel_id: userChannels.length > 0 ? userChannels[0].id : '',
      title_template: '',
      prompt_template: '',
      schedule_type: 'weekly',
      schedule_time: '09:00',
      is_active: true
    });
    setEditingVideo(null);
    setShowForm(false);
    setError(null);
  };

  const handleEdit = (video: ScheduledVideoWithChannel) => {
    setEditingVideo(video);
    setFormData({
      channel_id: video.channel_id,
      title_template: video.title_template,
      prompt_template: video.prompt_template,
      schedule_type: video.schedule_type,
      schedule_time: video.schedule_time,
      is_active: video.is_active
    });
    setShowForm(true);
  };

  const handleToggleActive = async (video: ScheduledVideoWithChannel) => {
    try {
      const response = await DatabaseService.updateScheduledVideo(video.id, {
        is_active: !video.is_active
      });

      if (response.success) {
        await fetchData();
      } else {
        setError(response.error || 'Failed to update video status');
      }
    } catch (error) {
      console.error('Error toggling video status:', error);
      setError('An error occurred while updating status');
    }
  };

  const handleDelete = async (video: ScheduledVideoWithChannel) => {
    if (!confirm('Are you sure you want to delete this scheduled video?')) return;

    try {
      const response = await DatabaseService.deleteScheduledVideo(video.id);

      if (response.success) {
        await fetchData();
      } else {
        setError(response.error || 'Failed to delete scheduled video');
      }
    } catch (error) {
      console.error('Error deleting scheduled video:', error);
      setError('An error occurred while deleting');
    }
  };

  const formatNextExecution = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getScheduleTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (userChannels.length === 0) {
    return (
      <div className="text-center p-8">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Channels Found</h3>
        <p className="text-gray-600 mb-4">
          You need to set up a channel first before creating scheduled videos.
        </p>
        <button
          onClick={() => window.location.href = '/settings'}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Go to Settings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Scheduled Videos</h2>
          <p className="text-gray-600">Automate your video generation with scheduled content</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Add Schedule</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Scheduled Videos List */}
      <div className="grid gap-4">
        {scheduledVideos.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Videos</h3>
            <p className="text-gray-600 mb-4">
              Create your first scheduled video to automate content generation.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Create Schedule
            </button>
          </div>
        ) : (
          scheduledVideos.map((video) => (
            <div key={video.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{video.title_template}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      video.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {video.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{video.prompt_template}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Channel:</span>
                      <p className="text-gray-600">{video.user_channels?.channel_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Frequency:</span>
                      <p className="text-gray-600">{getScheduleTypeLabel(video.schedule_type)}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Time:</span>
                      <p className="text-gray-600">{video.schedule_time}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Next Run:</span>
                      <p className="text-gray-600">{formatNextExecution(video.next_execution)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleToggleActive(video)}
                    className={`p-2 rounded-md ${
                      video.is_active
                        ? 'text-orange-600 hover:bg-orange-50'
                        : 'text-green-600 hover:bg-green-50'
                    }`}
                    title={video.is_active ? 'Pause' : 'Resume'}
                  >
                    {video.is_active ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={() => handleEdit(video)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(video)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingVideo ? 'Edit Scheduled Video' : 'Create Scheduled Video'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Channel
                  </label>
                  <select
                    value={formData.channel_id}
                    onChange={(e) => handleInputChange('channel_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a channel</option>
                    {userChannels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.channel_name} ({channel.channel_type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title Template
                  </label>
                  <input
                    type="text"
                    value={formData.title_template}
                    onChange={(e) => handleInputChange('title_template', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Daily Tech News - {date}"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {'{date}'} for current date, {'{time}'} for current time
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt Template
                  </label>
                  <textarea
                    value={formData.prompt_template}
                    onChange={(e) => handleInputChange('prompt_template', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Create a video about today's tech news..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This prompt will be used to generate your videos automatically
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.schedule_type}
                      onChange={(e) => handleInputChange('schedule_type', e.target.value as any)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={formData.schedule_time}
                      onChange={(e) => handleInputChange('schedule_time', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    Active (start generating videos immediately)
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : (editingVideo ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledVideosManager;