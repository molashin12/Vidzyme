import React, { useState } from 'react';
import { User, Bell, Shield, CreditCard, Link, Trash2, Save, Youtube, Instagram, Twitter, Linkedin } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import type { NotificationSettings } from '../../contexts/UserContext';

interface SettingsProps {
  onNavigate: (page: string) => void;
}

export default function Settings({ onNavigate }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('profile');
  const { profile, notifications, connectedAccounts, updateProfile, updateNotifications, updateConnectedAccounts, isLoading } = useUser();
  
  // Local state for editing
  const [profileData, setProfileData] = useState(profile);
  const [notificationSettings, setNotificationSettings] = useState(notifications);
  const [accountSettings, setAccountSettings] = useState(connectedAccounts);

  // Update local state when user data changes
  React.useEffect(() => {
    setProfileData(profile);
    setNotificationSettings(notifications);
    setAccountSettings(connectedAccounts);
  }, [profile, notifications, connectedAccounts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1116] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#27AE60]"></div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
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

  const handleSave = async () => {
    try {
      if (activeTab === 'profile') {
        await updateProfile(profileData);
      } else if (activeTab === 'notifications') {
        await updateNotifications(notificationSettings);
      } else if (activeTab === 'connected') {
        await updateConnectedAccounts(accountSettings);
      }
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
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

              {/* Save Button */}
              <div className="flex justify-end pt-6 border-t border-gray-700">
                <button
                  onClick={handleSave}
                  className="bg-[#27AE60] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#229954] transition-colors flex items-center space-x-2"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}