import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { DatabaseService } from '../services/database';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  avatar: string;
  plan: string;
  joinDate: string;
}

interface UserStats {
  videosCreated: number;
  totalViews: number;
  watchTimeHours: number;
  subscribers: number;
  monthlyChange: {
    videos: string;
    views: string;
    watchTime: string;
    subscribers: string;
  };
}

interface UserUsage {
  current: number;
  limit: number;
  voiceMinutes: number;
  voiceLimit: number;
  plan: string;
}

interface Video {
  id: string;
  title: string;
  duration: string;
  status: 'Published' | 'Processing' | 'Draft';
  views: string;
  platform: string;
  createdAt: string;
  thumbnailUrl?: string;
}

export interface NotificationSettings {
  videoReady: boolean;
  weeklyReport: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;
}

interface ConnectedAccount {
  connected: boolean;
  username: string;
}

interface ConnectedAccounts {
  youtube: ConnectedAccount;
  instagram: ConnectedAccount;
  tiktok: ConnectedAccount;
  linkedin: ConnectedAccount;
}

interface UserContextType {
  profile: UserProfile;
  stats: UserStats;
  usage: UserUsage;
  videos: Video[];
  notifications: NotificationSettings;
  connectedAccounts: ConnectedAccounts;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateNotifications: (updates: Partial<NotificationSettings>) => Promise<void>;
  updateConnectedAccount: (platform: keyof ConnectedAccounts, data: ConnectedAccount) => Promise<void>;
  updateConnectedAccounts: (accounts: ConnectedAccounts) => Promise<void>;
  addVideo: (video: Video) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const { user: authUser, session, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Get the Supabase auth user for accessing user_metadata
  const supabaseUser = session?.user;
  
  // Initialize with empty data that will be loaded from Supabase
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    bio: '',
    avatar: '',
    plan: 'free',
    joinDate: ''
  });

  const [stats, setStats] = useState<UserStats>({
    videosCreated: 0,
    totalViews: 0,
    watchTimeHours: 0,
    subscribers: 0,
    monthlyChange: {
      videos: '',
      views: '',
      watchTime: '',
      subscribers: ''
    }
  });

  const [usage, setUsage] = useState<UserUsage>({
    current: 0,
    limit: 0,
    voiceMinutes: 0,
    voiceLimit: 0,
    plan: 'free'
  });

  const [videos, setVideos] = useState<Video[]>([]);

  const [notifications, setNotifications] = useState<NotificationSettings>({
    videoReady: false,
    weeklyReport: false,
    marketingEmails: false,
    pushNotifications: false
  });

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccounts>({
    youtube: { connected: false, username: '' },
    instagram: { connected: false, username: '' },
    tiktok: { connected: false, username: '' },
    linkedin: { connected: false, username: '' }
  });

  // Load user data from Supabase
  useEffect(() => {
    const loadUserData = async () => {
      if (!authUser) {
        setIsLoading(false);
        return;
      }

      try {
        // Load user profile from auth user data
        setProfile({
          id: authUser.id,
          name: supabaseUser?.user_metadata?.full_name || authUser.name || authUser.email?.split('@')[0] || '',
          email: authUser.email || '',
          bio: '', // Will be loaded from user_profiles table if needed
          avatar: supabaseUser?.user_metadata?.avatar_url || authUser.avatar_url || '',
          plan: authUser.subscription_plan || 'free',
          joinDate: authUser.created_at || new Date().toISOString()
        });

        // Load additional profile data from user_profiles table
        try {
          const profileResponse = await DatabaseService.getUserProfile(authUser.id);
          if (profileResponse.success && profileResponse.data) {
            setProfile(prev => ({
              ...prev,
              bio: profileResponse.data.bio || prev.bio
            }));
          }
        } catch (profileError) {
          console.warn('Could not load extended profile data:', profileError);
        }

        // Load user videos
        try {
          const videosResponse = await DatabaseService.getUserVideos(authUser.id);
          if (videosResponse.success && videosResponse.data) {
            // Transform Supabase video data to match our Video interface
            const transformedVideos = videosResponse.data.map(video => ({
              id: video.id,
              title: video.title,
              duration: `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`,
              status: video.status === 'completed' ? 'Published' as const : 
                     video.status === 'processing' ? 'Processing' as const : 'Draft' as const,
              views: '0', // This would come from analytics if available
              platform: 'Vidzyme', // Default platform
              createdAt: video.created_at,
              thumbnailUrl: video.thumbnail_url
            }));
            setVideos(transformedVideos);
          }
        } catch (videosError) {
          console.warn('Could not load user videos:', videosError);
        }

        // Load user usage data
        try {
          const usageResponse = await DatabaseService.getUserUsage(authUser.id);
          if (usageResponse.success && usageResponse.data) {
            setUsage({
              current: usageResponse.data.length, // Number of videos generated
              limit: authUser.subscription_plan === 'pro' ? 100 : 10,
              voiceMinutes: 0, // Would need to calculate from videos
              voiceLimit: authUser.subscription_plan === 'pro' ? 120 : 30,
              plan: authUser.subscription_plan || 'free'
            });
          }
        } catch (usageError) {
          console.warn('Could not load usage data:', usageError);
        }

        // Load user stats
        try {
          const statsResponse = await DatabaseService.getUserStats(authUser.id);
          if (statsResponse.success && statsResponse.data) {
            setStats({
              videosCreated: statsResponse.data.totalVideos || 0,
              totalViews: 0, // Not available in current stats
              watchTimeHours: 0, // Not available in current stats
              subscribers: 0, // Not available in current stats
              monthlyChange: {
                videos: '', // Would need historical data
                views: '',
                watchTime: '',
                subscribers: ''
              }
            });
          }
        } catch (statsError) {
          console.warn('Could not load user stats:', statsError);
        }

        // Load connected accounts from user channels platforms
        try {
          const channelsResponse = await DatabaseService.getUserChannels(authUser.id);
          if (channelsResponse.success && channelsResponse.data && channelsResponse.data.length > 0) {
            // Get the primary channel or first channel
            const primaryChannel = channelsResponse.data.find(ch => ch.is_primary) || channelsResponse.data[0];
            
            if (primaryChannel && primaryChannel.platforms) {
              // Update connected accounts based on platforms array
              const newConnectedAccounts: ConnectedAccounts = {
                youtube: { 
                  connected: primaryChannel.platforms.includes('youtube'), 
                  username: primaryChannel.platforms.includes('youtube') ? primaryChannel.channel_name : '' 
                },
                instagram: { 
                  connected: primaryChannel.platforms.includes('instagram'), 
                  username: primaryChannel.platforms.includes('instagram') ? primaryChannel.channel_name : '' 
                },
                tiktok: { 
                  connected: primaryChannel.platforms.includes('tiktok'), 
                  username: primaryChannel.platforms.includes('tiktok') ? primaryChannel.channel_name : '' 
                },
                linkedin: { 
                  connected: primaryChannel.platforms.includes('linkedin'), 
                  username: primaryChannel.platforms.includes('linkedin') ? primaryChannel.channel_name : '' 
                }
              };
              setConnectedAccounts(newConnectedAccounts);
            }
          }
        } catch (channelsError) {
          console.warn('Could not load user channels for connected accounts:', channelsError);
        }
        
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (!authLoading) {
      loadUserData();
    }
  }, [authUser, authLoading]);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!authUser) return;
    
    const previousProfile = profile;
    setProfile(prev => ({ ...prev, ...updates }));
    
    try {
      // Update user profile in Supabase
      const response = await DatabaseService.updateUserProfile(authUser.id, {
        bio: updates.bio
      });
      
      if (!response.success) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Revert local changes on error
      setProfile(previousProfile);
    }
  };

  const updateNotifications = async (updates: Partial<NotificationSettings>) => {
    if (!authUser) return;
    
    const previousNotifications = notifications;
    setNotifications(prev => ({ ...prev, ...updates }));
    
    try {
      // Update notification preferences in user_profiles table
      const response = await DatabaseService.updateUserProfile(authUser.id, {
        preferences: {
          notifications: {
            video_ready: updates.videoReady ?? false,
            weekly_report: updates.weeklyReport ?? false,
            marketing: updates.marketingEmails ?? false
          }
        }
      });
      
      if (!response.success) {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Error updating notifications:', error);
      // Revert local changes on error
      setNotifications(previousNotifications);
    }
  };

  const updateConnectedAccount = async (platform: keyof ConnectedAccounts, data: ConnectedAccount) => {
    if (!authUser) return;
    
    const previousConnectedAccounts = connectedAccounts;
    setConnectedAccounts(prev => ({ ...prev, [platform]: data }));
    
    try {
      // Get the user's primary channel
      const channelsResponse = await DatabaseService.getUserChannels(authUser.id);
      if (channelsResponse.success && channelsResponse.data && channelsResponse.data.length > 0) {
        const primaryChannel = channelsResponse.data.find(ch => ch.is_primary) || channelsResponse.data[0];
        
        if (primaryChannel) {
          // Update platforms array based on the new connected account
          const updatedConnectedAccounts = { ...previousConnectedAccounts, [platform]: data };
          const platforms: string[] = [];
          Object.entries(updatedConnectedAccounts).forEach(([platformKey, account]) => {
            if (account?.connected) {
              platforms.push(platformKey);
            }
          });
          
          // Update the channel with new platforms
          const response = await DatabaseService.updateUserChannel(primaryChannel.id, {
            platforms: platforms,
            // Also update channel_type to the first platform for backward compatibility
            channel_type: (platforms[0] as 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'other') || 'youtube'
          });
          
          if (!response.success) {
            throw new Error(response.error);
          }
        }
      }
    } catch (error) {
      console.error('Error updating connected account:', error);
      // Revert local changes on error
      setConnectedAccounts(previousConnectedAccounts);
    }
  };

  const updateConnectedAccounts = async (accounts: ConnectedAccounts) => {
    if (!authUser) return;
    
    const previousConnectedAccounts = connectedAccounts;
    setConnectedAccounts(accounts);
    
    try {
      // Get the user's primary channel
      const channelsResponse = await DatabaseService.getUserChannels(authUser.id);
      if (channelsResponse.success && channelsResponse.data && channelsResponse.data.length > 0) {
        const primaryChannel = channelsResponse.data.find(ch => ch.is_primary) || channelsResponse.data[0];
        
        if (primaryChannel) {
          // Convert connected accounts to platforms array
          const platforms: string[] = [];
          Object.entries(accounts).forEach(([platform, account]) => {
            if (account?.connected) {
              platforms.push(platform);
            }
          });
          
          // Update the channel with new platforms
          const response = await DatabaseService.updateUserChannel(primaryChannel.id, {
            platforms: platforms,
            // Also update channel_type to the first platform for backward compatibility
            channel_type: (platforms[0] as 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'other') || 'youtube'
          });
          
          if (!response.success) {
            throw new Error(response.error);
          }
        }
      }
    } catch (error) {
      console.error('Error updating connected accounts:', error);
      // Revert local changes on error
      setConnectedAccounts(previousConnectedAccounts);
    }
  };

  const addVideo = (video: Video) => {
    setVideos(prev => [video, ...prev]);
    setStats(prev => ({
      ...prev,
      videosCreated: prev.videosCreated + 1
    }));
    setUsage(prev => ({
      ...prev,
      current: prev.current + 1
    }));
  };

  const value: UserContextType = {
    profile,
    stats,
    usage,
    videos,
    notifications,
    connectedAccounts,
    updateProfile,
    updateNotifications,
    updateConnectedAccount,
    updateConnectedAccounts,
    addVideo,
    isLoading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};