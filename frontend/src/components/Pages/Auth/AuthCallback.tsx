import React, { useEffect, useState } from 'react';
import { supabase } from '../../../config/supabase';

interface AuthCallbackProps {
  onNavigate: (page: string) => void;
}

export default function AuthCallback({ onNavigate }: AuthCallbackProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setError('Authentication failed. Please try again.');
          setTimeout(() => onNavigate('signin'), 3000);
          return;
        }

        if (data.session) {
          // Check if user profile exists in our custom users table
          const { data: userProfile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

          // If user profile doesn't exist, create it (for Google OAuth users)
          if (profileError && profileError.code === 'PGRST116') {
            const userName = data.session.user.user_metadata?.full_name || 
                           data.session.user.user_metadata?.name || 
                           data.session.user.email?.split('@')[0] || 
                           'User';

            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email!,
                name: userName,
                avatar_url: data.session.user.user_metadata?.avatar_url,
                subscription_plan: 'free',
                subscription_status: 'active',
                credits_remaining: 10, // Free tier credits
              });

            if (insertError) {
              console.error('Error creating user profile:', insertError);
            }

            // Create default user profile
            const { error: userProfileError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: data.session.user.id,
                preferences: {
                  notifications: {
                    video_ready: true,
                    weekly_report: true,
                    marketing: false,
                  },
                },
              });

            if (userProfileError) {
              console.error('Error creating user profile:', userProfileError);
            }
          }

          // Redirect to dashboard
          onNavigate('dashboard');
        } else {
          setError('No session found. Please try signing in again.');
          setTimeout(() => onNavigate('signin'), 3000);
        }
      } catch (err) {
        console.error('Unexpected error during auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
        setTimeout(() => onNavigate('signin'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Completing Sign In...</h2>
          <p className="text-gray-300">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Authentication Error</h2>
            <p className="text-red-300">{error}</p>
          </div>
          <p className="text-gray-300">Redirecting to sign in page...</p>
        </div>
      </div>
    );
  }

  return null;
}