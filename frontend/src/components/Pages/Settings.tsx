import React, { useState } from 'react';
import { User, Bell, Shield, CreditCard, Link, Trash2, Save, Youtube, Instagram, Twitter, Linkedin, Calendar, Settings as SettingsIcon } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../hooks/useAuth';
import ScheduledVideosManager from '../ScheduledVideos/ScheduledVideosManager';
import { useNotification } from '../UI/Notification';
import { DatabaseService } from '../../services/database';

import type { NotificationSettings } from '../../contexts/UserContext';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

export default function Settings({ onNavigate }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const { profile, notifications, connectedAccounts, updateProfile, updateNotifications, updateConnectedAccounts, isLoading } = useUser();
  const { user } = useAuth();
  const { showSuccess, showError, showLoading, removeNotification, NotificationContainer } = useNotification();

  
  // Local state for editing
  const [profileData, setProfileData] = useState(profile);
  const [notificationSettings, setNotificationSettings] = useState(notifications);
  const [accountSettings, setAccountSettings] = useState(connectedAccounts);
  const [channelData, setChannelData] = useState({
    id: '',
    channel_name: '',
    channel_description: '',
    channel_type: 'youtube' as const,
    channel_url: '',
    target_audience: '',
    content_style: '',
    posting_frequency: 'weekly',
    preferred_video_length: 60,
    preferred_voice: 'alloy',
    is_primary: true,
    platforms: [] as string[]
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);

  // Platform and voice options (same as onboarding)
  const platformOptions = [
    { value: 'youtube', label: 'YouTube', icon: '📺' },
    { value: 'instagram', label: 'Instagram', icon: '📷' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'other', label: 'Other', icon: '🌐' }
  ];

  const voiceOptions = [
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'echo', label: 'Echo (Male)' },
    { value: 'fable', label: 'Fable (British Male)' },
    { value: 'onyx', label: 'Onyx (Deep Male)' },
    { value: 'nova', label: 'Nova (Female)' },
    { value: 'shimmer', label: 'Shimmer (Soft Female)' }
  ];

  const contentStyles = [
    'Educational',
    'Entertainment',
    'News & Updates',
    'Tutorial',
    'Review',
    'Storytelling',
    'Motivational',
    'Comedy',
    'Documentary',
    'Other'
  ];

  // Load existing channel data
  const loadChannelData = async () => {
    if (!user?.id) return;
    
    setIsLoadingChannels(true);
    try {
      const result = await DatabaseService.getUserChannels(user.id);
      if (result.success && result.data && result.data.length > 0) {

        // Load primary channel data
        const primaryChannel = result.data.find(ch => ch.is_primary) || result.data[0];
        if (primaryChannel) {
          setChannelData({
            id: primaryChannel.id,
            channel_name: primaryChannel.channel_name || '',
            channel_description: primaryChannel.channel_description || '',
            channel_type: primaryChannel.channel_type || 'youtube',
            channel_url: primaryChannel.channel_url || '',
            target_audience: primaryChannel.target_audience || '',
            content_style: primaryChannel.content_style || '',
            posting_frequency: primaryChannel.posting_frequency || 'weekly',
            preferred_video_length: primaryChannel.preferred_video_length || 60,
            preferred_voice: primaryChannel.preferred_voice || 'alloy',
            is_primary: primaryChannel.is_primary || true,
            platforms: primaryChannel.platforms || (primaryChannel.channel_type ? [primaryChannel.channel_type] : [])
          });
        }
      }
    } catch (error) {
      console.error('Error loading channel data:', error);
    } finally {
      setIsLoadingChannels(false);
    }
  };


  // Update local state when user data changes
  React.useEffect(() => {
    setProfileData(profile);
    setNotificationSettings(notifications);
    setAccountSettings(connectedAccounts);
  }, [profile, notifications, connectedAccounts]);

  // Load channel data when user changes
  React.useEffect(() => {
    loadChannelData();
  }, [user?.id]);


  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1116] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#27AE60]"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'channels', label: 'Channels', icon: SettingsIcon },
    { id: 'scheduled', label: 'Scheduled Videos', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'connected', label: 'Connected Accounts', icon: Link },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const handleProfileUpdate = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationToggle = (field: keyof NotificationSettings) => {
    setNotificationSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChannelUpdate = (field: string, value: string) => {
    setChannelData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlatformToggle = (platform: string) => {
    setChannelData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    let loadingId: string | null = null;
    
    try {
      if (activeTab === 'profile') {
        loadingId = showLoading('Saving Profile', 'Updating your profile information...');
        await updateProfile(profileData);
        if (loadingId) removeNotification(loadingId);
        showSuccess('Profile Updated', 'Your profile has been saved successfully!');
      } else if (activeTab === 'notifications') {
        loadingId = showLoading('Saving Notifications', 'Updating your notification preferences...');
        await updateNotifications(notificationSettings);
        if (loadingId) removeNotification(loadingId);
        showSuccess('Notifications Updated', 'Your notification preferences have been saved!');
      } else if (activeTab === 'connected') {
        loadingId = showLoading('Saving Accounts', 'Updating your connected accounts...');
        await updateConnectedAccounts(accountSettings);
        if (loadingId) removeNotification(loadingId);
        showSuccess('Accounts Updated', 'Your connected accounts have been saved!');
      } else if (activeTab === 'channels') {
        if (!user?.id) {
          showError('Authentication Error', 'Please log in to save channel information.');
          return;
        }
        
        if (!channelData.channel_name.trim()) {
          showError('Validation Error', 'Channel name is required.');
          return;
        }
        
        if (channelData.platforms.length === 0) {
          showError('Validation Error', 'Please select at least one platform.');
          return;
        }
        
        loadingId = showLoading('Saving Channel', channelData.id ? 'Updating your channel information...' : 'Creating your channel information...');
        
        const channelPayload = {
          channel_name: channelData.channel_name.trim(),
          channel_description: channelData.channel_description.trim(),
          channel_type: (channelData.platforms[0] as 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'other') || 'youtube',
          platforms: channelData.platforms, // Include all selected platforms
          channel_url: channelData.channel_url?.trim() || undefined,
          target_audience: channelData.target_audience.trim(),
          content_style: channelData.content_style,
          posting_frequency: channelData.posting_frequency,
          preferred_video_length: channelData.preferred_video_length,
          preferred_voice: channelData.preferred_voice,
          is_primary: channelData.is_primary
        };
        
        let result;
        if (channelData.id) {
          // Update existing channel
          result = await DatabaseService.updateUserChannel(channelData.id, channelPayload);
        } else {
          // Create new channel
          result = await DatabaseService.createUserChannel(user.id, channelPayload);
        }
        
        if (loadingId) removeNotification(loadingId);
        
        if (result.success) {
          showSuccess(channelData.id ? 'Channel Updated' : 'Channel Created', 'Your channel information has been saved successfully!');
          // Reload channel data
          await loadChannelData();
        } else {
          showError('Save Failed', result.error || 'Failed to save channel information.');
        }
      }
    } catch (error) {
      if (loadingId) removeNotification(loadingId);
      showError('Save Failed', error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);

    }
  };

  return (
    <div className="min-h-screen bg-[#0F1116] text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-[#27AE60] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    
                    {/* Avatar */}
                    <div className="flex items-center space-x-4 mb-6">
                      <img
                        src={profileData.avatar}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                      <div>
                        <button className="bg-[#27AE60] text-white px-4 py-2 rounded-lg hover:bg-[#229954] transition-colors">
                          Change Avatar
                        </button>
                        <p className="text-gray-400 text-sm mt-1">JPG, PNG up to 5MB</p>
                      </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => handleProfileUpdate('name', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleProfileUpdate('email', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-2">Bio</label>
                        <textarea
                          value={profileData.bio}
                          onChange={(e) => handleProfileUpdate('bio', e.target.value)}
                          rows={3}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Channels Tab */}
              {activeTab === 'channels' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Channel Management</h2>
                    <p className="text-gray-400 mb-6">Manage your content channels and their settings</p>
                    
                    {isLoadingChannels ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#27AE60] mx-auto"></div>
                        <p className="mt-2 text-gray-400">Loading channel data...</p>
                      </div>
                    ) : (
                      <div className="bg-gray-700/50 rounded-lg p-6">
                        <h3 className="font-medium mb-4">Channel Information</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Channel Name</label>
                            <input
                              type="text"
                              value={channelData.channel_name}
                              onChange={(e) => handleChannelUpdate('channel_name', e.target.value)}
                              placeholder="Enter your channel name"
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Channel Description</label>
                            <textarea
                              value={channelData.channel_description}
                              onChange={(e) => handleChannelUpdate('channel_description', e.target.value)}
                              placeholder="Describe your channel and content..."
                              rows={4}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Platforms</label>
                            <div className="grid grid-cols-2 gap-3">
                              {platformOptions.map((platform) => (
                                <button
                                  key={platform.value}
                                  type="button"
                                  onClick={() => handlePlatformToggle(platform.value)}
                                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
                                    channelData.platforms.includes(platform.value)
                                      ? 'border-[#27AE60] bg-[#27AE60]/10 text-[#27AE60]'
                                      : 'border-gray-600 bg-gray-700 text-gray-400 hover:border-gray-500'
                                  }`}
                                >
                                  <span>{platform.icon}</span>
                                  <span className="font-medium">{platform.label}</span>
                                  {channelData.platforms.includes(platform.value) && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Channel URL (Optional)</label>
                            <input
                              type="url"
                              value={channelData.channel_url || ''}
                              onChange={(e) => handleChannelUpdate('channel_url', e.target.value)}
                              placeholder="https://youtube.com/@yourchannel"
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Target Audience</label>
                            <input
                              type="text"
                              value={channelData.target_audience}
                              onChange={(e) => handleChannelUpdate('target_audience', e.target.value)}
                              placeholder="e.g., Young professionals, Students, Tech enthusiasts"
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Content Style</label>
                            <select
                              value={channelData.content_style}
                              onChange={(e) => handleChannelUpdate('content_style', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                            >
                              <option value="">Select a style</option>
                              {contentStyles.map((style) => (
                                <option key={style} value={style}>
                                  {style}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Posting Frequency</label>
                            <select
                              value={channelData.posting_frequency}
                              onChange={(e) => handleChannelUpdate('posting_frequency', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                            >
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Bi-weekly</option>
                              <option value="monthly">Monthly</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Preferred Video Length (seconds)</label>
                            <input
                              type="number"
                              value={channelData.preferred_video_length}
                              onChange={(e) => handleChannelUpdate('preferred_video_length', (parseInt(e.target.value) || 60).toString())}
                              min="15"
                              max="300"
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Preferred Voice</label>
                            <select
                              value={channelData.preferred_voice}
                              onChange={(e) => handleChannelUpdate('preferred_voice', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                            >
                              {voiceOptions.map((voice) => (
                                <option key={voice.value} value={voice.value}>
                                  {voice.label}
                                </option>
                              ))}
                            </select>
                          </div>
                         </div>
                         
                         <button
                           onClick={handleSave}
                           disabled={isSaving}
                           className="w-full bg-[#27AE60] text-white py-3 px-4 rounded-lg hover:bg-[#27AE60]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                         >
                           {isSaving ? 'Saving...' : channelData.id ? 'Update Channel Information' : 'Save Channel Information'}
                         </button>
                       </div>
                     )}
                   </div>
                 </div>

              )}

              {/* Scheduled Videos Tab */}
              {activeTab === 'scheduled' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Scheduled Video Generation</h2>
                    <p className="text-gray-400 mb-6">Set up automatic video generation schedules for your channels</p>
                    
                    <ScheduledVideosManager />
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Video Ready</h3>
                          <p className="text-gray-400 text-sm">Get notified when your videos are ready</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.videoReady}
                            onChange={() => handleNotificationToggle('videoReady')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#27AE60]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Weekly Report</h3>
                          <p className="text-gray-400 text-sm">Receive weekly performance reports</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.weeklyReport}
                            onChange={() => handleNotificationToggle('weeklyReport')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#27AE60]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Marketing Emails</h3>
                          <p className="text-gray-400 text-sm">Receive updates about new features</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.marketingEmails}
                            onChange={() => handleNotificationToggle('marketingEmails')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#27AE60]"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Push Notifications</h3>
                          <p className="text-gray-400 text-sm">Receive browser notifications</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings.pushNotifications}
                            onChange={() => handleNotificationToggle('pushNotifications')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#27AE60]"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Connected Accounts Tab */}
              {activeTab === 'connected' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
                    <p className="text-gray-400 mb-6">Connect your social media accounts for seamless publishing</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Youtube className="w-6 h-6 text-red-500" />
                          <div>
                            <h3 className="font-medium">YouTube</h3>
                            <p className="text-gray-400 text-sm">
                              {accountSettings.youtube.connected ? accountSettings.youtube.username : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <button className={`px-4 py-2 rounded-lg transition-colors ${
                          accountSettings.youtube.connected
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-[#27AE60] text-white hover:bg-[#229954]'
                        }`}>
                          {accountSettings.youtube.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Instagram className="w-6 h-6 text-pink-500" />
                          <div>
                            <h3 className="font-medium">Instagram</h3>
                            <p className="text-gray-400 text-sm">
                              {accountSettings.instagram.connected ? accountSettings.instagram.username : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <button className={`px-4 py-2 rounded-lg transition-colors ${
                          accountSettings.instagram.connected
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-[#27AE60] text-white hover:bg-[#229954]'
                        }`}>
                          {accountSettings.instagram.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Twitter className="w-6 h-6 text-blue-400" />
                          <div>
                            <h3 className="font-medium">TikTok</h3>
                            <p className="text-gray-400 text-sm">
                              {accountSettings.tiktok.connected ? accountSettings.tiktok.username : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <button className={`px-4 py-2 rounded-lg transition-colors ${
                          accountSettings.tiktok.connected
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-[#27AE60] text-white hover:bg-[#229954]'
                        }`}>
                          {accountSettings.tiktok.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Linkedin className="w-6 h-6 text-blue-600" />
                          <div>
                            <h3 className="font-medium">LinkedIn</h3>
                            <p className="text-gray-400 text-sm">
                              {accountSettings.linkedin.connected ? accountSettings.linkedin.username : 'Not connected'}
                            </p>
                          </div>
                        </div>
                        <button className={`px-4 py-2 rounded-lg transition-colors ${
                          accountSettings.linkedin.connected
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-[#27AE60] text-white hover:bg-[#229954]'
                        }`}>
                          {accountSettings.linkedin.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Billing & Subscription</h2>
                    
                    <div className="bg-gray-700/50 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">Pro Plan</h3>
                          <p className="text-gray-400">Monthly billing</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">$29</div>
                          <div className="text-gray-400 text-sm">per month</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-400">Next billing date: January 15, 2025</p>
                        <button
                          onClick={() => onNavigate('subscription')}
                          className="text-[#27AE60] hover:text-[#229954] transition-colors"
                        >
                          Change Plan
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Payment Method</h3>
                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
                              <span className="text-white text-sm font-bold">💳</span>
                            </div>
                            <div>
                              <p className="font-medium">•••• •••• •••• 4242</p>
                              <p className="text-gray-400 text-sm">Expires 12/25</p>
                            </div>
                          </div>
                          <button className="text-[#27AE60] hover:text-[#229954] transition-colors">
                            Update
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-medium mb-3">Change Password</h3>
                        <div className="space-y-3">
                          <input
                            type="password"
                            placeholder="Current password"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                          />
                          <input
                            type="password"
                            placeholder="New password"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                          />
                          <input
                            type="password"
                            placeholder="Confirm new password"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-3">Two-Factor Authentication</h3>
                        <div className="bg-gray-700/50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">SMS Authentication</p>
                              <p className="text-gray-400 text-sm">Not configured</p>
                            </div>
                            <button className="bg-[#27AE60] text-white px-4 py-2 rounded-lg hover:bg-[#229954] transition-colors">
                              Enable
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-3 text-red-400">Danger Zone</h3>
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-red-400">Delete Account</p>
                              <p className="text-gray-400 text-sm">Permanently delete your account and all data</p>
                            </div>
                            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2">
                              <Trash2 className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button - Only show for certain tabs */}
              {['profile', 'notifications', 'connected', 'channels'].includes(activeTab) && (
                <div className="flex justify-end pt-6 border-t border-gray-700">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`
                      px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2
                      ${isSaving 
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                        : 'bg-[#27AE60] text-white hover:bg-[#229954]'
                      }
                    `}
                  >
                    <Save className="w-5 h-5" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>

                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <NotificationContainer />

    </div>
  );
}