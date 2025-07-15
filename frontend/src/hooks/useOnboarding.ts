import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { DatabaseService } from '../services/database';
import { UserOnboarding } from '../config/supabase';

export const useOnboarding = () => {
  const { user } = useAuth();
  const [onboardingStatus, setOnboardingStatus] = useState<UserOnboarding | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOnboardingStatus = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await DatabaseService.getUserOnboardingStatus(user.id);
      
      if (response.success) {
        setOnboardingStatus(response.data);
      } else {
        setError(response.error || 'Failed to fetch onboarding status');
      }
    } catch (error) {
      console.error('Error fetching onboarding status:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOnboardingStatus();
  }, [user]);

  const isOnboardingComplete = () => {
    if (!onboardingStatus) return false;
    return onboardingStatus.step_completed >= 3 || onboardingStatus.completed_at !== null;
  };

  const isOnboardingSkipped = () => {
    return onboardingStatus?.skipped === true;
  };

  const shouldShowOnboarding = () => {
    if (!user || isLoading) return false;
    return !isOnboardingComplete() && !isOnboardingSkipped();
  };

  const updateOnboardingStatus = async (updates: Partial<UserOnboarding>) => {
    if (!user) return { success: false, error: 'No user found' };

    try {
      const response = await DatabaseService.updateOnboardingStatus(user.id, updates);
      
      if (response.success) {
        setOnboardingStatus(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Error updating onboarding status:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const completeOnboarding = async () => {
    return updateOnboardingStatus({
      step_completed: 3,
      completed_at: new Date().toISOString()
    });
  };

  const skipOnboarding = async () => {
    return updateOnboardingStatus({
      step_completed: 0,
      skipped: true
    });
  };

  const resetOnboarding = async () => {
    return updateOnboardingStatus({
      step_completed: 0,
      completed_at: undefined,
      skipped: false
    });
  };

  return {
    onboardingStatus,
    isLoading,
    error,
    isOnboardingComplete: isOnboardingComplete(),
    isOnboardingSkipped: isOnboardingSkipped(),
    shouldShowOnboarding: shouldShowOnboarding(),
    updateOnboardingStatus,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    refetch: fetchOnboardingStatus
  };
};