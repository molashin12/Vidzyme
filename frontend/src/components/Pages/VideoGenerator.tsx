import { useState, useEffect } from 'react';
import { Play, Wand2, Settings, Clock, User, Globe, Download, Share2 } from 'lucide-react';
import VideoCreationFlow from '../Animations/VideoCreationFlow';
import ProcessingIndicator from '../Animations/ProcessingIndicator';
import { useVideoGeneration } from '../../hooks/useVideoGeneration';
import { useUser } from '../../contexts/UserContext';
import { DatabaseService } from '../../services/database';
import { VOICES } from '../../config/voices';

interface VideoGeneratorProps {
  onNavigate: (page: string) => void;
}

export default function VideoGenerator({ onNavigate }: VideoGeneratorProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    prompt: '',
    voice: 'haitham',
    duration: 60,
    title: '',
    description: ''
  });

  const [uiState, setUiState] = useState({
    category: '',
    length: '60',
    avatar: false,
    subtitles: true,
    platform: 'youtube',
    tags: '',
    schedule: 'now'
  });

  const { isGenerating, progress, error, videoUrl, generateVideo, resetState } = useVideoGeneration();
  const { addVideo, profile } = useUser();
  const [videoSaved, setVideoSaved] = useState(false);

  // Save video when generation completes
  useEffect(() => {
    const saveVideoToDatabase = async () => {
      if (videoUrl && !videoSaved && !isGenerating && profile.id) {
        try {
          // Create video object
          const newVideo = {
            user_id: profile.id,
            title: formData.title || formData.prompt.slice(0, 50) + '...',
            description: formData.description || undefined,
            prompt: formData.prompt,
            voice: formData.voice,
            duration: formData.duration,
            status: 'completed' as const,
            video_url: videoUrl,
            thumbnail_url: undefined
          };

          // Save to Supabase
          const response = await DatabaseService.createVideo(newVideo);
          
          if (response.success && response.data) {
            // Add to local user videos list
            const videoForContext = {
              id: response.data.id,
              title: response.data.title,
              duration: `${Math.floor(formData.duration / 60)}:${(formData.duration % 60).toString().padStart(2, '0')}`,
              status: 'Published' as const,
              views: '0',
              platform: uiState.platform,
              createdAt: response.data.created_at,
              thumbnailUrl: response.data.thumbnail_url
            };
            
            addVideo(videoForContext);
             setVideoSaved(true);
             console.log('Video saved successfully:', response.data);
             
             // Video will now appear in recent videos automatically
          } else {
            console.error('Failed to save video to database:', response.error);
          }
        } catch (error) {
          console.error('Error saving video:', error);
        }
      }
    };

    saveVideoToDatabase();
  }, [videoUrl, isGenerating, videoSaved, profile.id, formData, uiState, addVideo]);

  const categories = [
    { id: 'education', name: 'Education', icon: '📚', description: 'Tutorials, explanations, how-tos' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬', description: 'Fun content, stories, comedy' },
    { id: 'business', name: 'Business', icon: '💼', description: 'Marketing, entrepreneurship, tips' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🌟', description: 'Health, travel, personal growth' },
    { id: 'tech', name: 'Technology', icon: '💻', description: 'Tech reviews, coding, gadgets' },
    { id: 'custom', name: 'Custom', icon: '✨', description: 'Your own creative prompt' },
  ];

  // Voice options are imported from VOICES config

  const platforms = [
    { id: 'youtube', name: 'YouTube', ratio: '16:9', maxLength: '10 minutes' },
    { id: 'tiktok', name: 'TikTok', ratio: '9:16', maxLength: '3 minutes' },
    { id: 'instagram', name: 'Instagram', ratio: '9:16', maxLength: '90 seconds' },
    { id: 'linkedin', name: 'LinkedIn', ratio: '16:9', maxLength: '10 minutes' },
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    if (['prompt', 'voice', 'title', 'description'].includes(field)) {
      setFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setUiState(prev => ({ ...prev, [field]: value }));
    }
    
    // Update duration when length changes
    if (field === 'length') {
      setFormData(prev => ({ ...prev, duration: parseInt(value as string) }));
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleGenerate = async () => {
    if (!formData.prompt || !uiState.category) {
      return;
    }

    try {
      resetState();
      setVideoSaved(false); // Reset video saved state
      
      const videoRequest = {
        prompt: formData.prompt,
        voice: formData.voice,
        duration: formData.duration,
        title: formData.title || undefined,
        description: formData.description || undefined
      };
      
      console.log('Generating video with:', videoRequest);
      
      await generateVideo(videoRequest);
      
      // Video generation started successfully
      console.log('Video generation started');
      // Keep user on current page to show progress
    } catch (error) {
      console.error('Video generation failed:', error);
      // Error is already handled by the hook
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1116] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 animate-slideInUp">Create Your Video</h1>
          <p className="text-gray-400 animate-slideInUp stagger-1">AI-powered video generation made simple</p>
          <div className="mt-6">
            <VideoCreationFlow size="medium" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-slideInUp stagger-2">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400">Step {step} of 4</span>
            <span className="text-sm text-gray-400">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-[#27AE60] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 animate-slideInUp">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Wand2 className="w-6 h-6 text-[#27AE60] mr-3 animate-bounce" />
              Choose Your Content Category
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover-lift ${
                    uiState.category === category.id
                      ? 'border-[#27AE60] bg-[#27AE60]/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => {
                    handleInputChange('category', category.id);
                    if (category.id !== 'custom') {
                      handleInputChange('prompt', '');
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-400">{category.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {uiState.category && (
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                  {uiState.category === 'custom' ? 'Custom Prompt' : 'Topic or Specific Request'}
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => handleInputChange('prompt', e.target.value)}
                  placeholder={uiState.category === 'custom' 
                    ? 'Describe exactly what kind of video you want...'
                    : 'e.g., "How to learn React in 2025" or "Top 10 productivity tips"'
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#27AE60]"
                  rows={3}
                />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Video Settings */}
        {step === 2 && (
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 animate-slideInUp">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Settings className="w-6 h-6 text-[#27AE60] mr-3 animate-spin" style={{ animationDuration: '3s' }} />
              Video Settings
            </h2>
            
            <div className="space-y-6">
              {/* Video Length */}
              <div>
                <label className="block text-sm font-medium mb-3">Video Length</label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {['30', '60', '90', '180'].map((length) => (
                    <button
                      key={length}
                      onClick={() => handleInputChange('length', length)}
                      className={`p-3 rounded-lg border-2 transition-all hover-lift ${
                        uiState.length === length
                          ? 'border-[#27AE60] bg-[#27AE60]/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <Clock className="w-5 h-5 text-[#27AE60] mx-auto mb-1 animate-pulse" />
                      <div className="text-sm">{length} seconds</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Style */}
              <div>
                <label className="block text-sm font-medium mb-3">Voice</label>
                <div className="grid grid-cols-1 gap-3">
                  {VOICES.map((voice) => (
                    <div
                      key={voice.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover-lift ${
                        formData.voice === voice.id
                          ? 'border-[#27AE60] bg-[#27AE60]/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => handleInputChange('voice', voice.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <User className="w-5 h-5 text-[#27AE60] animate-pulse" />
                          <div>
                            <h3 className="font-semibold">{voice.name}</h3>
                            <p className="text-sm text-gray-400">{voice.description}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          voice.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'
                        }`}>
                          {voice.gender}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={uiState.avatar}
                      onChange={(e) => handleInputChange('avatar', e.target.checked)}
                      className="w-4 h-4 text-[#27AE60] bg-gray-700 border-gray-600 rounded focus:ring-[#27AE60] focus:ring-2"
                    />
                    <span>Include AI Avatar</span>
                  </label>
                  <p className="text-sm text-gray-400 mt-1">Add a realistic AI presenter to your video</p>
                </div>
                
                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={uiState.subtitles}
                      onChange={(e) => handleInputChange('subtitles', e.target.checked)}
                      className="w-4 h-4 text-[#27AE60] bg-gray-700 border-gray-600 rounded focus:ring-[#27AE60] focus:ring-2"
                    />
                    <span>Auto-generate Subtitles</span>
                  </label>
                  <p className="text-sm text-gray-400 mt-1">Improve accessibility and engagement</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Platform & Format */}
        {step === 3 && (
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 animate-slideInUp">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Globe className="w-6 h-6 text-[#27AE60] mr-3 animate-spin" style={{ animationDuration: '4s' }} />
              Platform & Format
            </h2>
            
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium mb-3">Target Platform</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover-lift ${
                        uiState.platform === platform.id
                          ? 'border-[#27AE60] bg-[#27AE60]/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => handleInputChange('platform', platform.id)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{platform.name}</h3>
                        <span className="text-sm text-gray-400">{platform.ratio}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">Max: {platform.maxLength}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Video Metadata */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Video Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter a catchy title for your video"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#27AE60]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your video content..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#27AE60]"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <input
                    type="text"
                    value={uiState.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    placeholder="ai, tutorial, education (comma-separated)"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#27AE60]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Generate */}
        {step === 4 && (
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 animate-slideInUp">
            {/* Show progress prominently when generating */}
            {isGenerating ? (
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-6 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#27AE60] mr-3"></div>
                  Generating Your Video
                </h2>
                <p className="text-gray-400 mb-8">Please wait while we create your video. This may take a few minutes.</p>
                
                {/* Large Progress Display */}
                {progress && (
                  <div className="max-w-2xl mx-auto">
                    <ProcessingIndicator
                      isProcessing={isGenerating}
                      progress={progress}
                    />
                  </div>
                )}
                
                {/* Video Preview - Show when generation is complete */}
                {videoUrl && !isGenerating && (
                  <div className="bg-green-900/20 border border-green-600/30 rounded-xl p-6 mt-6">
                    <div className="text-center mb-4">
                      <div className="flex items-center justify-center space-x-2 text-green-400 mb-2">
                        <Play className="w-5 h-5" />
                        <span className="font-medium">Video Generated Successfully!</span>
                      </div>
                      {videoSaved && (
                        <div className="flex items-center justify-center space-x-2 text-green-300 mb-2">
                          <span className="text-sm">✅ Video saved to your library</span>
                        </div>
                      )}
                      <p className="text-sm text-green-300">Your video is ready to preview and download.</p>
                    </div>
                    
                    {/* Video Player */}
                    <div className="bg-black rounded-lg overflow-hidden mb-4">
                      <video 
                        controls 
                        className="w-full h-auto max-h-96"
                        src={videoUrl}
                        poster="/api/placeholder/640/360"
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <a
                        href={videoUrl}
                        download="generated-video.mp4"
                        className="bg-[#27AE60] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#229954] transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Video</span>
                      </a>
                      <button
                        onClick={() => onNavigate('dashboard')}
                        className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Go to Dashboard</span>
                      </button>
                      <button
                        onClick={() => {
                          resetState();
                          setVideoSaved(false);
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>Create Another</span>
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Error Display */}
                {error && (
                  <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-4 mt-6">
                    <div className="flex items-center justify-center space-x-2 text-red-400">
                      <span className="font-medium">Generation Failed</span>
                    </div>
                    <p className="text-sm text-red-300 mt-1 text-center">{error}</p>
                    <div className="flex justify-center mt-4 space-x-4">
                      <button
                        onClick={resetState}
                        className="text-sm text-red-400 hover:text-red-300 underline"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={() => onNavigate('dashboard')}
                        className="text-sm text-gray-400 hover:text-gray-300 underline"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold mb-6 flex items-center">
                  <Play className="w-6 h-6 text-[#27AE60] mr-3 animate-pulse" />
                  Review & Generate
                </h2>
                
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-gray-700/50 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Video Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Category:</span> {categories.find(c => c.id === uiState.category)?.name}
                      </div>
                      <div>
                        <span className="text-gray-400">Length:</span> {formData.duration} seconds
                      </div>
                      <div>
                        <span className="text-gray-400">Voice:</span> {VOICES.find(v => v.id === formData.voice)?.name}
                      </div>
                      <div>
                        <span className="text-gray-400">Platform:</span> {platforms.find(p => p.id === uiState.platform)?.name}
                      </div>
                      <div>
                        <span className="text-gray-400">Avatar:</span> {uiState.avatar ? 'Yes' : 'No'}
                      </div>
                      <div>
                        <span className="text-gray-400">Subtitles:</span> {uiState.subtitles ? 'Yes' : 'No'}
                      </div>
                    </div>
                    {formData.prompt && (
                      <div className="mt-4">
                        <span className="text-gray-400">Prompt:</span>
                        <p className="text-white mt-1">{formData.prompt}</p>
                      </div>
                    )}
                  </div>

                  {/* Generation Options */}
                  <div>
                    <label className="block text-sm font-medium mb-3">Post Schedule</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleInputChange('schedule', 'now')}
                        className={`p-3 rounded-lg border-2 transition-all hover-lift ${
                          uiState.schedule === 'now'
                            ? 'border-[#27AE60] bg-[#27AE60]/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <Share2 className="w-5 h-5 text-[#27AE60] mx-auto mb-1 animate-pulse" />
                        <div className="text-sm">Post Now</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('schedule', 'later')}
                        className={`p-3 rounded-lg border-2 transition-all hover-lift ${
                          uiState.schedule === 'later'
                            ? 'border-[#27AE60] bg-[#27AE60]/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <Clock className="w-5 h-5 text-[#27AE60] mx-auto mb-1 animate-pulse" />
                        <div className="text-sm">Schedule Later</div>
                      </button>
                      <button
                        onClick={() => handleInputChange('schedule', 'draft')}
                        className={`p-3 rounded-lg border-2 transition-all hover-lift ${
                          uiState.schedule === 'draft'
                            ? 'border-[#27AE60] bg-[#27AE60]/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <Download className="w-5 h-5 text-[#27AE60] mx-auto mb-1 animate-pulse" />
                        <div className="text-sm">Save as Draft</div>
                      </button>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="bg-gradient-to-r from-[#27AE60] to-[#2ECC71] p-6 rounded-lg animate-glow">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white">Ready to Generate</h3>
                        <p className="text-green-100 text-sm">Estimated time: 2-3 minutes</p>
                      </div>
                      <button
                        onClick={handleGenerate}
                        disabled={!formData.prompt || !uiState.category || isGenerating}
                        className="bg-white text-[#27AE60] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors hover-lift animate-bounce disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#27AE60]"></div>
                            <span>Generating...</span>
                          </>
                        ) : (
                          <span>Generate Video</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 animate-slideInUp">
          <button
            onClick={prevStep}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors hover-lift ${
              step === 1
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            Previous
          </button>
          
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => setStep(num)}
                className={`w-8 h-8 rounded-full transition-colors ${
                  step === num
                    ? 'bg-[#27AE60] text-white'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          
          <button
            onClick={nextStep}
            disabled={step === 4}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors hover-lift ${
              step === 4
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-[#27AE60] text-white hover:bg-[#229954]'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}