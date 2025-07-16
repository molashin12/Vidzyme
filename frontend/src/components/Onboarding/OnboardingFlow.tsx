import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { DatabaseService } from '../../services/database';
import { ChevronRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useNotification } from '../UI/Notification';


interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface ChannelData {
  channelName: string;
  channelDescription: string;
  platforms: string[];
  channelUrl: string;
  targetAudience: string;
  contentStyle: string;

  preferredVoice: string;
}

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete, onSkip }) => {
  const { user } = useAuth();
  const { showSuccess, showError, showLoading, NotificationContainer } = useNotification();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [channelData, setChannelData] = useState<ChannelData>({
    channelName: '',
    channelDescription: '',
    platforms: [],
    channelUrl: '',
    targetAudience: '',
    contentStyle: '',

    preferredVoice: 'alloy'
  });

  const steps: OnboardingStep[] = [
    {
      id: 1,
      title: 'Welcome to Vidzyme!',
      description: 'Let\'s set up your profile and channel to get started with AI video generation.',
      completed: false
    },
    {
      id: 2,
      title: 'Channel Information',
      description: 'Tell us about your channel or page to personalize your video content.',
      completed: false
    },
    {
      id: 3,
      title: 'Content Preferences',
      description: 'Set your content style and preferences for better AI-generated videos.',
      completed: false
    }
  ];

  const voiceOptions = [
    { value: 'alloy', label: 'Alloy (Neutral)' },
    { value: 'echo', label: 'Echo (Male)' },
    { value: 'fable', label: 'Fable (British Male)' },
    { value: 'onyx', label: 'Onyx (Deep Male)' },
    { value: 'nova', label: 'Nova (Female)' },
    { value: 'shimmer', label: 'Shimmer (Soft Female)' }
  ];

  const platformOptions = [

    { value: 'youtube', label: 'YouTube', icon: '📺' },
    { value: 'instagram', label: 'Instagram', icon: '📷' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵' },
    { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
    { value: 'other', label: 'Other', icon: '🌐' }
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




  const handleInputChange = (field: keyof ChannelData, value: any) => {
    setChannelData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handlePlatformToggle = (platform: string) => {
    setChannelData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
    setError(null);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 2:
        return channelData.channelName.trim() !== '' && channelData.channelDescription.trim() !== '' && channelData.platforms.length > 0;

      case 3:
        return channelData.targetAudience.trim() !== '' && channelData.contentStyle !== '';
      default:
        return true;
    }
  };

  const handleNext = async () => {
    if (!validateStep(currentStep)) {
      setError('Please fill in all required fields.');
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    
    showLoading('Setting up your channel...');


    try {
      // Create user channel
      const channelResponse = await DatabaseService.createUserChannel(user.id, {
        channel_name: channelData.channelName,
        channel_description: channelData.channelDescription,
        channel_type: (channelData.platforms[0] as 'youtube' | 'instagram' | 'tiktok' | 'linkedin' | 'other') || 'youtube', // Use first platform as primary
        platforms: channelData.platforms, // Store all selected platforms
        channel_url: channelData.channelUrl || undefined,
        target_audience: channelData.targetAudience,
        content_style: channelData.contentStyle,
        posting_frequency: 'weekly', // Default value
        preferred_video_length: 60, // Default value

        preferred_voice: channelData.preferredVoice,
        is_primary: true
      });

      if (!channelResponse.success) {
        throw new Error(channelResponse.error || 'Failed to create channel');
      }

      // Update onboarding status
      const onboardingResponse = await DatabaseService.updateOnboardingStatus(user.id, {
        step_completed: 3,
        completed_at: new Date().toISOString()
      });

      if (!onboardingResponse.success) {
        console.warn('Failed to update onboarding status:', onboardingResponse.error);
      }

      showSuccess('Channel setup completed successfully!');
      
      // Complete onboarding after a short delay
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during setup';
      showError(errorMessage);
      setError(errorMessage);

    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    setIsLoading(true);
    showLoading('Skipping setup...');
    

    try {
      await DatabaseService.updateOnboardingStatus(user.id, {
        step_completed: 0,
        skipped: true
      });
      showSuccess('Setup skipped successfully!');
      
      setTimeout(() => {
        onSkip();
      }, 1000);
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      showError('Failed to skip setup. Please try again.');

    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-gradient-to-r from-[#27AE60] to-[#2ECC71] rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl text-white">🎬</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to Vidzyme!</h2>
              <p className="text-gray-300 max-w-md mx-auto">

                We're excited to help you create amazing AI-generated videos. Let's set up your profile to get started.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Channel Information</h2>
              <p className="text-gray-300">Tell us about your channel or page</p>

            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">

                  Channel/Page Name *
                </label>
                <input
                  type="text"
                  value={channelData.channelName}
                  onChange={(e) => handleInputChange('channelName', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60]"

                  placeholder="Enter your channel or page name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Platforms *
                  <span className="text-sm text-gray-400 font-normal ml-1">(Select all that apply)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {platformOptions.map((platform) => (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => handlePlatformToggle(platform.value)}
                      className={`p-3 border rounded-lg text-center transition-colors ${
                        channelData.platforms.includes(platform.value)
                          ? 'border-[#27AE60] bg-[#27AE60]/10 text-[#27AE60]'
                          : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{platform.icon}</div>
                      <div className="text-sm font-medium">{platform.label}</div>
                      {channelData.platforms.includes(platform.value) && (
                        <div className="mt-1">
                          <CheckIcon className="w-4 h-4 text-[#27AE60] mx-auto" />
                        </div>
                      )}

                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">

                  Channel Description *
                </label>
                <textarea
                  value={channelData.channelDescription}
                  onChange={(e) => handleInputChange('channelDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60]"

                  placeholder="Describe what your channel is about..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">

                  Channel URL (Optional)
                </label>
                <input
                  type="url"
                  value={channelData.channelUrl}
                  onChange={(e) => handleInputChange('channelUrl', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60]"

                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Content Preferences</h2>
              <p className="text-gray-300">Set your content style and preferences</p>

            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">

                  Target Audience *
                </label>
                <input
                  type="text"
                  value={channelData.targetAudience}
                  onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60]"

                  placeholder="e.g., Young professionals, Students, Tech enthusiasts"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">

                  Content Style *
                </label>
                <select
                  value={channelData.contentStyle}
                  onChange={(e) => handleInputChange('contentStyle', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60]"
                  required
                >
                  <option value="" className="bg-gray-700 text-gray-400">Select content style</option>
                  {contentStyles.map((style) => (
                    <option key={style} value={style} className="bg-gray-700 text-white">{style}</option>

                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">

                  Preferred Voice
                </label>
                <select
                  value={channelData.preferredVoice}
                  onChange={(e) => handleInputChange('preferredVoice', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#27AE60] focus:border-[#27AE60]"
                >
                  {voiceOptions.map((voice) => (
                    <option key={voice.value} value={voice.value} className="bg-gray-700 text-white">{voice.label}</option>

                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800 rounded-lg shadow-2xl p-8 border border-gray-700">

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step.id
                      ? 'bg-[#27AE60] text-white'
                      : 'bg-gray-600 text-gray-300'

                  }`}
                >
                  {currentStep > step.id ? (
                    <CheckIcon className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-[#27AE60]' : 'bg-gray-600'

                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-400">

            Step {currentStep} of {steps.length}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStepContent()}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-md">
            <p className="text-red-400 text-sm">{error}</p>

          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-300 font-medium disabled:opacity-50"

          >
            Skip for now
          </button>

          <div className="flex space-x-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-700 disabled:opacity-50"

              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isLoading || !validateStep(currentStep)}
              className="px-6 py-2 bg-[#27AE60] text-white rounded-md hover:bg-[#219A52] disabled:opacity-50 flex items-center space-x-2"

            >
              <span>{currentStep === steps.length ? 'Complete Setup' : 'Next'}</span>
              {!isLoading && <ChevronRightIcon className="w-4 h-4" />}
              {isLoading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
            </button>
          </div>
        </div>
      </div>
      <NotificationContainer />

    </div>
  );
};

export default OnboardingFlow;