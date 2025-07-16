import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  subscription_plan: 'free' | 'pro' | 'enterprise';
  subscription_status: 'active' | 'inactive' | 'cancelled';
  credits_remaining: number;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  prompt: string;
  voice: string;
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  thumbnail_url?: string;
  file_size?: number;
  processing_progress?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  bio?: string;
  website?: string;
  social_links?: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  preferences?: {
    default_voice?: string;
    default_duration?: number;
    notifications?: {
      video_ready: boolean;
      weekly_report: boolean;
      marketing: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Usage {
  id: string;
  user_id: string;
  video_id: string;
  credits_used: number;
  action_type: 'video_generation' | 'voice_synthesis' | 'image_generation';
  created_at: string;
}

export interface UserChannel {
  id: string;
  user_id: string;
  channel_name: string;
  channel_description: string;
  channel_type: 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'other';
  platforms: string[];

  channel_url?: string;
  target_audience: string;
  content_style: string;
  posting_frequency: string;
  preferred_video_length: number;
  preferred_voice: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserOnboarding {
  id: string;
  user_id: string;
  step_completed: number;
  completed_at?: string;
  skipped: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledVideo {
  id: string;
  user_id: string;
  channel_id: string;
  title_template: string;
  prompt_template: string;
  schedule_type: 'daily' | 'weekly' | 'monthly' | 'custom';
  schedule_time: string;
  schedule_days?: number[];
  next_execution: string;
  is_active: boolean;
  auto_publish?: boolean;
  max_executions?: number;

  last_generated?: string;
  created_at: string;
  updated_at: string;
}

export interface VideoQueue {
  id: string;
  user_id: string;
  scheduled_video_id?: string;
  title: string;
  prompt: string;
  voice: string;
  duration: number;
  priority: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  scheduled_for?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

// Database Tables
export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'id' | 'created_at'>>;
      };
      videos: {
        Row: Video;
        Insert: Omit<Video, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Video, 'id' | 'created_at'>>;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserProfile, 'id' | 'created_at'>>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Subscription, 'id' | 'created_at'>>;
      };
      usage: {
        Row: Usage;
        Insert: Omit<Usage, 'id' | 'created_at'>;
        Update: Partial<Omit<Usage, 'id' | 'created_at'>>;
      };
      user_channels: {
        Row: UserChannel;
        Insert: Omit<UserChannel, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserChannel, 'id' | 'created_at'>>;
      };
      user_onboarding: {
        Row: UserOnboarding;
        Insert: Omit<UserOnboarding, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<UserOnboarding, 'id' | 'created_at'>>;
      };
      scheduled_videos: {
        Row: ScheduledVideo;
        Insert: Omit<ScheduledVideo, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ScheduledVideo, 'id' | 'created_at'>>;
      };
      video_queue: {
        Row: VideoQueue;
        Insert: Omit<VideoQueue, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<VideoQueue, 'id' | 'created_at'>>;
      };
    };
  };
};