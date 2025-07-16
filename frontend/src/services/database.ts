<<<<<<< HEAD
import { supabase, Video, UserProfile, Subscription, Usage, UserChannel, UserOnboarding, VideoQueue } from '../config/supabase';
=======
import { supabase, Video, UserProfile, Subscription, Usage, UserChannel, UserOnboarding, ScheduledVideo, VideoQueue } from '../config/supabase';
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130

export class DatabaseService {
  // Video operations
  static async createVideo(videoData: Omit<Video, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .insert(videoData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating video:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getUserVideos(userId: string, limit = 20, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user videos:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getVideo(videoId: string) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching video:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateVideo(videoId: string, updates: Partial<Video>) {
    try {
      const { data, error } = await supabase
        .from('videos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', videoId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating video:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async deleteVideo(videoId: string) {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting video:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // User profile operations
  static async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Subscription operations
  static async getUserSubscription(userId: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async createSubscription(subscriptionData: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateSubscription(subscriptionId: string, updates: Partial<Subscription>) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', subscriptionId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Usage tracking
  static async recordUsage(usageData: Omit<Usage, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('usage')
        .insert(usageData)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error recording usage:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getUserUsage(userId: string, startDate?: string, endDate?: string) {
    try {
      let query = supabase
        .from('usage')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user usage:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Analytics
  static async getUserStats(userId: string) {
    try {
      const [videosResult, usageResult] = await Promise.all([
        supabase
          .from('videos')
          .select('status')
          .eq('user_id', userId),
        supabase
          .from('usage')
          .select('credits_used')
          .eq('user_id', userId)
      ]);

      if (videosResult.error) throw videosResult.error;
      if (usageResult.error) throw usageResult.error;

      const videos = videosResult.data || [];
      const usage = usageResult.data || [];

      const stats = {
        totalVideos: videos.length,
        completedVideos: videos.filter(v => v.status === 'completed').length,
        processingVideos: videos.filter(v => v.status === 'processing').length,
        failedVideos: videos.filter(v => v.status === 'failed').length,
        totalCreditsUsed: usage.reduce((sum, u) => sum + u.credits_used, 0),
      };

      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Real-time subscriptions
  static subscribeToUserVideos(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel('user-videos')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'videos',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  static subscribeToVideoUpdates(videoId: string, callback: (payload: any) => void) {
    return supabase
      .channel('video-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'videos',
          filter: `id=eq.${videoId}`,
        },
        callback
      )
      .subscribe();
  }

  // User Channel operations
  static async createUserChannel(userId: string, channelData: Omit<UserChannel, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('user_channels')
        .insert({ ...channelData, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error creating user channel:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getUserChannels(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_channels')
        .select('*')
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user channels:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getPrimaryUserChannel(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_channels')
        .select('*')
        .eq('user_id', userId)
        .eq('is_primary', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching primary user channel:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateUserChannel(channelId: string, updates: Partial<UserChannel>) {
    try {
      const { data, error } = await supabase
        .from('user_channels')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', channelId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating user channel:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async deleteUserChannel(channelId: string) {
    try {
      const { error } = await supabase
        .from('user_channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting user channel:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // User Onboarding operations
  static async getUserOnboardingStatus(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user onboarding status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateOnboardingStatus(userId: string, updates: Partial<UserOnboarding>) {
    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .upsert({ 
          user_id: userId, 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

<<<<<<< HEAD
  // Scheduled Video operations (using backend API)
  static async createScheduledVideo(scheduledVideoData: {
    channel_id: string;
    title_template?: string;
    prompt_template: string;
    schedule_type: string;
    schedule_time: string;
    schedule_days?: number[];
    is_active?: boolean;
    auto_publish?: boolean;
    max_executions?: number;
  }) {
    try {
      const response = await fetch('/api/scheduled-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduledVideoData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to create scheduled video');
      }

      return { success: true, data: result.data };
=======
  // Scheduled Video operations
  static async createScheduledVideo(userId: string, scheduledVideoData: Omit<ScheduledVideo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('scheduled_videos')
        .insert({ ...scheduledVideoData, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
    } catch (error) {
      console.error('Error creating scheduled video:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

<<<<<<< HEAD
  static async getUserScheduledVideos(channelId?: string) {
    try {
      const url = channelId ? `/api/scheduled-videos?channel_id=${channelId}` : '/api/scheduled-videos';
      const response = await fetch(url);
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to fetch scheduled videos');
      }

      return { success: true, data: result.data };
=======
  static async getUserScheduledVideos(userId: string) {
    try {
      const { data, error } = await supabase
        .from('scheduled_videos')
        .select(`
          *,
          user_channels!inner(
            channel_name,
            channel_type
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
    } catch (error) {
      console.error('Error fetching user scheduled videos:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

<<<<<<< HEAD
  static async getScheduledVideo(videoId: string) {
    try {
      const response = await fetch(`/api/scheduled-videos/${videoId}`);
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to fetch scheduled video');
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error fetching scheduled video:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateScheduledVideo(scheduledVideoId: string, updates: {
    title_template?: string;
    prompt_template?: string;
    schedule_type?: string;
    schedule_time?: string;
    schedule_days?: number[];
    is_active?: boolean;
    auto_publish?: boolean;
    max_executions?: number;
  }) {
    try {
      const response = await fetch(`/api/scheduled-videos/${scheduledVideoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to update scheduled video');
      }

      return { success: true, data: result.data };
=======
  static async updateScheduledVideo(scheduledVideoId: string, updates: Partial<ScheduledVideo>) {
    try {
      const { data, error } = await supabase
        .from('scheduled_videos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', scheduledVideoId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
    } catch (error) {
      console.error('Error updating scheduled video:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async deleteScheduledVideo(scheduledVideoId: string) {
    try {
<<<<<<< HEAD
      const response = await fetch(`/api/scheduled-videos/${scheduledVideoId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to delete scheduled video');
      }

      return { success: true, message: result.message };
=======
      const { error } = await supabase
        .from('scheduled_videos')
        .delete()
        .eq('id', scheduledVideoId);

      if (error) throw error;
      return { success: true };
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
    } catch (error) {
      console.error('Error deleting scheduled video:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

<<<<<<< HEAD
  static async toggleScheduledVideo(scheduledVideoId: string) {
    try {
      const response = await fetch(`/api/scheduled-videos/${scheduledVideoId}/toggle`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to toggle scheduled video');
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error toggling scheduled video:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Video Queue operations (using backend API)
  static async addToVideoQueue(userId: string, queueData: Omit<VideoQueue, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
      // Still using Supabase for adding to queue as this is user-initiated
=======
  // Video Queue operations
  static async addToVideoQueue(userId: string, queueData: Omit<VideoQueue, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    try {
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
      const { data, error } = await supabase
        .from('video_queue')
        .insert({ ...queueData, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error adding to video queue:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

<<<<<<< HEAD
  static async getVideoQueue(channelId?: string) {
    try {
      const url = channelId ? `/api/video-queue?channel_id=${channelId}` : '/api/video-queue';
      const response = await fetch(url);
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to fetch video queue');
      }

      return { success: true, data: result.data };
=======
  static async getVideoQueue(userId: string, status?: string) {
    try {
      let query = supabase
        .from('video_queue')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
    } catch (error) {
      console.error('Error fetching video queue:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async updateVideoQueueItem(queueId: string, updates: Partial<VideoQueue>) {
    try {
<<<<<<< HEAD
      // Still using Supabase for queue updates as this might be called frequently
=======
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
      const { data, error } = await supabase
        .from('video_queue')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', queueId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating video queue item:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async deleteVideoQueueItem(queueId: string) {
    try {
<<<<<<< HEAD
      const response = await fetch(`/api/video-queue/${queueId}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.detail || 'Failed to delete queue item');
      }

      return { success: true, message: result.message };
=======
      const { error } = await supabase
        .from('video_queue')
        .delete()
        .eq('id', queueId);

      if (error) throw error;
      return { success: true };
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
    } catch (error) {
      console.error('Error deleting video queue item:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}