import { useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase, User } from '../config/supabase';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
  checkSessionPersistence: () => Promise<boolean>;
}

export function useAuth(): AuthState & AuthActions {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from our custom users table
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      console.log('Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.code, error.message);
        
        // If user doesn't exist in our custom table (PGRST116 = no rows returned)
        if (error.code === 'PGRST116') {
          console.warn('User profile not found in custom table, user may need to complete setup');
          // Try to get user data from auth and create a profile
          const { data: { user } } = await supabase.auth.getUser();
          if (user && user.id === userId) {
            console.log('Creating missing user profile from auth data');
            const newUserProfile: Omit<User, 'created_at' | 'updated_at'> = {
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
              subscription_plan: 'free',
              subscription_status: 'active',
              credits_remaining: 10
            };
            
            // Try to create the user profile
            const { data: createdUser, error: createError } = await supabase
              .from('users')
              .insert(newUserProfile)
              .select()
              .single();
              
            if (createError) {
              console.error('Failed to create user profile:', createError);
              return null;
            }
            
            console.log('Successfully created user profile');
            return createdUser;
          }
        }
        return null;
      }

      console.log('Successfully fetched user profile');
      return data;
    } catch (err) {
      console.error('Unexpected error fetching user profile:', err);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const initializeAuth = async () => {
      try {
        // Set a longer timeout and add better error handling
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth initialization timeout - falling back to signed out state');
            setLoading(false);
            setSession(null);
            setUser(null);
          }
        }, 15000); // Increased to 15 seconds

        // Check for session persistence first
        const hasPersistedSession = await checkSessionPersistence();
        console.log('Session persistence check:', hasPersistedSession);

        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setError(error.message);
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          
          if (session?.user && mounted) {
            // Try to fetch user profile with timeout protection
            try {
              const userProfile = await Promise.race([
                fetchUserProfile(session.user.id),
                new Promise<null>((_, reject) => 
                  setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
                )
              ]);
              
              if (mounted) {
                setUser(userProfile);
              }
            } catch (profileError) {
              console.warn('Failed to fetch user profile, using basic user data:', profileError);
              // Create a basic user object from session data if profile fetch fails
              if (mounted) {
                const basicUser: User = {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                  subscription_plan: 'free',
                  subscription_status: 'active',
                  credits_remaining: 10,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                setUser(basicUser);
              }
            }
          } else if (mounted) {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        if (mounted) {
          setError('Failed to initialize authentication');
          setSession(null);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          clearTimeout(timeoutId);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          try {
            const userProfile = await Promise.race([
              fetchUserProfile(session.user.id),
              new Promise<null>((_, reject) => 
                setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
              )
            ]);
            setUser(userProfile);
          } catch (profileError) {
            console.warn('Failed to fetch user profile in auth change, using basic user data:', profileError);
            // Create a basic user object from session data
            const basicUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              subscription_plan: 'free',
              subscription_status: 'active',
              credits_remaining: 10,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            setUser(basicUser);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Create user profile in our custom users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name,
            subscription_plan: 'free',
            subscription_status: 'active',
            credits_remaining: 10, // Free tier credits
          });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't return error here as auth was successful
        }

        // Create default user profile
        const { error: userProfileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: data.user.id,
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

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      console.error('Error signing out:', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      setError(null);
      const { error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [user]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Refreshing authentication...');
      
      // Force refresh the session
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        // If refresh fails, try to get the current session one more time
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          console.log('Found existing session after refresh error');
          setSession(currentSession);
          const userProfile = await fetchUserProfile(currentSession.user.id);
          setUser(userProfile);
        } else {
          // No session available, clear everything
          console.log('No session available, signing out');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setError('Session expired. Please sign in again.');
        }
      } else if (session) {
        console.log('Session refreshed successfully');
        setSession(session);
        const userProfile = await fetchUserProfile(session.user.id);
        setUser(userProfile);
      } else {
        // No session after refresh, clear everything
        console.log('No session after refresh, clearing auth state');
        setSession(null);
        setUser(null);
      }
    } catch (err) {
      console.error('Error during auth refresh:', err);
      setError('Failed to refresh authentication');
      // Fallback: clear everything
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Add session persistence check
  const checkSessionPersistence = useCallback(async () => {
    try {
      // Check if there's a stored session
      const storedSession = localStorage.getItem('supabase.auth.token');
      if (storedSession) {
        console.log('Found stored session, attempting to restore...');
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session && !error) {
          console.log('Successfully restored session from storage');
          return true;
        } else {
          console.log('Stored session is invalid, clearing...');
          localStorage.removeItem('supabase.auth.token');
        }
      }
      return false;
    } catch (err) {
      console.error('Error checking session persistence:', err);
      return false;
    }
  }, []);

  return {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    clearError,
    refreshAuth,
    checkSessionPersistence,
  };
}