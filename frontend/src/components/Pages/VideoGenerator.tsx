import { useState, useEffect } from 'react';
import { Lightbulb, Settings, Calendar, ChevronLeft, ChevronRight, Download, Globe, Wand2, Upload, Clock, FileText, Sparkles, Bot, User, Building2, Target, Palette, Monitor, Smartphone, Square, Film, ImageIcon, VideoIcon, UserIcon, Type, Activity } from 'lucide-react';
import VideoCreationFlow from '../Animations/VideoCreationFlow';
import VideoPlayerProgressIndicator from '../Animations/VideoPlayerProgressIndicator';
import QueueManager from '../QueueManager';
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
    useAiIdea: false,
    aiGeneratedIdea: '',
    aspectRatio: '16:9',
    footageType: 'pexels',
    length: '60',
    avatar: false,
    subtitles: true,
    platform: 'youtube',
    tags: '',
    schedule: 'now'
  });

  const [channelData, setChannelData] = useState({
    channel_name: '',
    channel_description: '',
    target_audience: '',
    content_style: ''
  });

  const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);

  // AI Content Generation State
  const [aiContentState, setAiContentState] = useState({
    useAiGeneration: true, // Default to AI generation
    isGeneratingContent: false,
    generatedContent: {
      youtube: {
        title: '',
        description: '',
        tags: ''
      },
      instagram: {
        caption: '',
        hashtags: ''
      },
      tiktok: {
        caption: '',
        hashtags: ''
      }
    }
  });

  const { addVideo, profile, connectedAccounts } = useUser();
  const { isGenerating, progress, error, videoUrl, currentVideoId, generateVideo, resetState, retryInfo, retryGeneration, checkForOngoingGeneration } = useVideoGeneration(profile.id);
  const [videoSaved, setVideoSaved] = useState(false);
  const [showQueueManager, setShowQueueManager] = useState(false);

  // Load user channel data for AI idea generation
  useEffect(() => {
    const loadChannelData = async () => {
      if (!profile.id) return;
      
      try {
        const result = await DatabaseService.getUserChannels(profile.id);
        if (result.success && result.data && result.data.length > 0) {
          const primaryChannel = result.data.find(ch => ch.is_primary) || result.data[0];
          if (primaryChannel) {
            setChannelData({
              channel_name: primaryChannel.channel_name || '',
              channel_description: primaryChannel.channel_description || '',
              target_audience: primaryChannel.target_audience || '',
              content_style: primaryChannel.content_style || ''
            });
          }
        }
      } catch (error) {
        console.error('Error loading channel data:', error);
      }
    };

    loadChannelData();
  }, [profile.id]);

  // Generate AI idea based on channel data
  const generateAiIdea = async () => {
    if (!channelData.channel_name || !channelData.channel_description) {
      alert('Please set up your channel information in Settings first.');
      return;
    }

    setIsGeneratingIdea(true);
    try {
      // Enhanced AI prompt for more relevant video ideas
      const aiPrompt = `Generate a creative and specific video idea for the channel "${channelData.channel_name}".

Channel Details:
- Name: ${channelData.channel_name}
- Description: ${channelData.channel_description}
- Content Style: ${channelData.content_style}
- Target Audience: ${channelData.target_audience}

Based on the channel description and name, create a video topic that:
1. Directly relates to the channel's main theme/niche
2. Appeals to the target audience
3. Is specific and actionable
4. Uses trending video formats (how-to, tips, myths, comparisons, etc.)

Please provide a compelling video title that someone would actually want to click on.`;
      
      // Simulate AI response (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate contextual ideas based on channel description keywords
      const generateContextualIdeas = () => {
        const description = channelData.channel_description.toLowerCase();
        const channelName = channelData.channel_name.toLowerCase();
        const audience = channelData.target_audience.toLowerCase();
        
        // Extract key topics from description
        const healthKeywords = ['health', 'medical', 'wellness', 'fitness', 'nutrition', 'disease', 'prevention', 'body', 'mind'];
        const techKeywords = ['tech', 'technology', 'ai', 'software', 'coding', 'programming', 'digital', 'innovation'];
        const educationKeywords = ['education', 'learning', 'study', 'academic', 'knowledge', 'science', 'research'];
        const lifestyleKeywords = ['lifestyle', 'life', 'daily', 'routine', 'habits', 'personal', 'growth'];
        
        let ideas = [];
        
        // Health-focused ideas
        if (healthKeywords.some(keyword => description.includes(keyword) || channelName.includes(keyword))) {
          ideas = [
            `"5 Science-Backed Health Hacks That Actually Work (Backed by Research)"`,
            `"The Truth About ${audience} Health: What Doctors Don't Tell You"`,
            `"Daily Health Routine That Changed My Life in 30 Days"`,
            `"Debunking Common Health Myths: What Science Really Says"`,
            `"Simple Health Tips for Busy ${audience}: No Equipment Needed"`
          ];
        }
        // Tech-focused ideas
        else if (techKeywords.some(keyword => description.includes(keyword) || channelName.includes(keyword))) {
          ideas = [
            `"Tech Tools Every ${audience} Should Know About in 2024"`,
            `"The Future of Technology: What's Coming Next?"`,
            `"5 Tech Mistakes That Are Costing You Time and Money"`,
            `"From Beginner to Pro: Essential Tech Skills for ${audience}"`,
            `"Hidden Tech Features That Will Blow Your Mind"`
          ];
        }
        // Education-focused ideas
        else if (educationKeywords.some(keyword => description.includes(keyword) || channelName.includes(keyword))) {
          ideas = [
            `"Study Techniques That Actually Work: Science-Based Methods"`,
            `"The Learning Secrets Top Students Don't Want You to Know"`,
            `"How to Learn Anything 10x Faster: Proven Strategies"`,
            `"Education Myths That Are Holding ${audience} Back"`,
            `"The Ultimate Learning Guide for ${audience}"`
          ];
        }
        // Generic but contextual ideas
        else {
          const mainTopic = channelData.content_style || 'content';
          ideas = [
            `"The Ultimate ${audience} Guide to ${mainTopic}"`,
            `"5 ${mainTopic} Mistakes Everyone Makes (And How to Fix Them)"`,
            `"Why ${mainTopic} is More Important Than You Think"`,
            `"From Zero to Hero: My ${mainTopic} Journey"`,
            `"The Secret to Mastering ${mainTopic} in 2024"`
          ];
        }
        
        return ideas;
      };
      
      const sampleIdeas = generateContextualIdeas();
      
      const randomIdea = sampleIdeas[Math.floor(Math.random() * sampleIdeas.length)];
      setUiState(prev => ({ ...prev, aiGeneratedIdea: randomIdea }));
      setFormData(prev => ({ ...prev, prompt: randomIdea }));
      
    } catch (error) {
      console.error('Error generating AI idea:', error);
      alert('Failed to generate AI idea. Please try again.');
    } finally {
      setIsGeneratingIdea(false);
    }
  };

  // AI Content Generation Functions
  const generatePlatformContent = async () => {
    if (!aiContentState.useAiGeneration) return;
    
    setAiContentState(prev => ({ ...prev, isGeneratingContent: true }));
    
    try {
      const videoScript = formData.prompt;
      
      // Get connected platforms from user's connected accounts
      const connectedPlatforms: string[] = [];
      if (connectedAccounts.youtube.connected) connectedPlatforms.push('youtube');
      if (connectedAccounts.instagram.connected) connectedPlatforms.push('instagram');
      if (connectedAccounts.tiktok.connected) connectedPlatforms.push('tiktok');
      
      if (connectedPlatforms.length === 0) {
        console.log('No platforms connected, skipping content generation');
        setAiContentState(prev => ({ ...prev, isGeneratingContent: false }));
        return;
      }

      // Call the new backend API for combined platform content generation
      const response = await fetch('/api/generate-platform-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_topic: videoScript,
          platforms: connectedPlatforms
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data && result.data.content) {
        const generatedContent = {
          youtube: result.data.content.youtube || { title: '', description: '', tags: '' },
          instagram: result.data.content.instagram || { caption: '', hashtags: '' },
          tiktok: result.data.content.tiktok || { caption: '', hashtags: '' }
        };

        setAiContentState(prev => ({
          ...prev,
          generatedContent,
          isGeneratingContent: false
        }));

        // Auto-fill the main form with YouTube content if available
        if (generatedContent.youtube.title) {
          setFormData(prev => ({
            ...prev,
            title: generatedContent.youtube.title,
            description: generatedContent.youtube.description
          }));
          setUiState(prev => ({
            ...prev,
            tags: generatedContent.youtube.tags
          }));
        }
      } else {
        throw new Error('Invalid response format from API');
      }

    } catch (error) {
      console.error('Error generating platform content:', error);
      
      // Fallback to individual generation if the new API fails
      console.log('Falling back to individual platform content generation...');
      await generatePlatformContentFallback();
    }
  };

  // Fallback function for individual platform content generation
  const generatePlatformContentFallback = async () => {
    try {
      const videoScript = formData.prompt;
      const channelInfo = {
        name: channelData.channel_name,
        description: channelData.channel_description,
        audience: channelData.target_audience,
        style: channelData.content_style
      };

      const generatedContent = {
        youtube: { title: '', description: '', tags: '' },
        instagram: { caption: '', hashtags: '' },
        tiktok: { caption: '', hashtags: '' }
      };

      // Generate YouTube content if connected
      if (connectedAccounts.youtube.connected) {
        const youtubeContent = await generateYouTubeContent(videoScript, channelInfo);
        generatedContent.youtube = youtubeContent;
      }

      // Generate Instagram content if connected
      if (connectedAccounts.instagram.connected) {
        const instagramContent = await generateInstagramContent(videoScript, channelInfo);
        generatedContent.instagram = instagramContent;
      }

      // Generate TikTok content if connected
      if (connectedAccounts.tiktok.connected) {
        const tiktokContent = await generateTikTokContent(videoScript, channelInfo);
        generatedContent.tiktok = tiktokContent;
      }

      setAiContentState(prev => ({
        ...prev,
        generatedContent,
        isGeneratingContent: false
      }));

      // Auto-fill the main form with YouTube content if available
      if (generatedContent.youtube.title) {
        setFormData(prev => ({
          ...prev,
          title: generatedContent.youtube.title,
          description: generatedContent.youtube.description
        }));
        setUiState(prev => ({
          ...prev,
          tags: generatedContent.youtube.tags
        }));
      }

    } catch (error) {
      console.error('Error in fallback platform content generation:', error);
      setAiContentState(prev => ({ ...prev, isGeneratingContent: false }));
    }
  };

  const generateYouTubeContent = async (script: string, channelInfo: any) => {
    // Simulate AI generation (replace with actual API call)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const keywords = extractKeywords(script, channelInfo);
    const titleTemplates = [
      `${keywords[0]} That Will Change Your Life`,
      `The Ultimate Guide to ${keywords[0]}`,
      `${keywords[0]} Secrets Nobody Tells You`,
      `How to Master ${keywords[0]} in 2024`,
      `${keywords[0]}: Everything You Need to Know`
    ];
    
    const title = titleTemplates[Math.floor(Math.random() * titleTemplates.length)];
    
    const description = `In this video, we dive deep into ${keywords.join(', ')} and show you exactly how to apply these concepts in your daily life.

🎯 What you'll learn:
• Key insights about ${keywords[0]}
• Practical tips for ${keywords[1] || 'success'}
• Real-world examples and case studies

📱 Connect with us:
${channelInfo.name ? `Channel: ${channelInfo.name}` : ''}
${channelInfo.description ? `About: ${channelInfo.description}` : ''}

🔔 Don't forget to subscribe and hit the notification bell for more content like this!

#${keywords[0].replace(/\s+/g, '')} #${keywords[1]?.replace(/\s+/g, '') || 'Tutorial'} #Education`;

    const tags = keywords.slice(0, 8).join(', ') + ', tutorial, education, tips, guide';
    
    return { title, description, tags };
  };

  const generateInstagramContent = async (script: string, channelInfo: any) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const keywords = extractKeywords(script, channelInfo);
    const caption = `✨ ${keywords[0]} insights that will transform your perspective! 

Swipe to see the key takeaways from our latest video 👆

What's your experience with ${keywords[0]}? Drop a comment below! 👇

${channelInfo.name ? `Follow @${channelInfo.name.toLowerCase().replace(/\s+/g, '')} for more!` : ''}`;

    const hashtags = `#${keywords[0].replace(/\s+/g, '')} #${keywords[1]?.replace(/\s+/g, '') || 'tips'} #education #learning #motivation #inspiration #growth #mindset #success #tutorial #guide #viral #explore #reels #instagram`;
    
    return { caption, hashtags };
  };

  const generateTikTokContent = async (script: string, channelInfo: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const keywords = extractKeywords(script, channelInfo);
    const caption = `${keywords[0]} hack that actually works! 🤯

Try this and let me know in the comments if it worked for you! 

Follow for more ${keywords[0]} tips 🔥`;

    const hashtags = `#${keywords[0].replace(/\s+/g, '')} #${keywords[1]?.replace(/\s+/g, '') || 'hack'} #fyp #viral #tutorial #tips #lifehack #learn #education #trending #foryou #tiktok #shorts`;
    
    return { caption, hashtags };
  };

  const extractKeywords = (script: string, channelInfo: any) => {
    // Simple keyword extraction (in real implementation, use NLP)
    const text = `${script} ${channelInfo.description} ${channelInfo.style}`.toLowerCase();
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an'];
    
    const words = text.match(/\b\w+\b/g) || [];
    const wordCount: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 3 && !commonWords.includes(word)) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  };

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
             
             // Auto-generate platform content after video is saved
             if (aiContentState.useAiGeneration) {
               generatePlatformContent();
             }
             
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
  }, [videoUrl, isGenerating, videoSaved, profile.id, formData, uiState, addVideo, aiContentState.useAiGeneration, generatePlatformContent]);

  const aspectRatios = [
    { id: '16:9', name: 'Landscape (16:9)', description: 'YouTube, LinkedIn' },
    { id: '9:16', name: 'Portrait (9:16)', description: 'TikTok, Instagram Stories' },
    { id: '1:1', name: 'Square (1:1)', description: 'Instagram Posts' },
    { id: '4:5', name: 'Vertical (4:5)', description: 'Instagram Feed' },
  ];

  const footageTypes = [
    { id: 'pexels', name: 'Stock Footage', icon: '📹', description: 'High-quality stock videos from Pexels' },
    { id: 'ai-images', name: 'AI Images', icon: '🎨', description: 'AI-generated static images' },
    { id: 'ai-videos', name: 'AI Videos', icon: '🎬', description: 'AI-generated video clips' },
    { id: 'avatar', name: 'Realistic Avatar', icon: '👤', description: 'AI presenter with realistic avatar' },
  ];

  // Voice options are imported from VOICES config

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
    
    // Update avatar setting when footage type changes
    if (field === 'footageType') {
      setUiState(prev => ({ ...prev, avatar: value === 'avatar' }));
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleGenerate = async () => {
    if (!formData.prompt) {
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
          <div className="flex items-center justify-between mb-4">
            <div></div> {/* Spacer */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 animate-slideInUp">Create Your Video</h1>
              <p className="text-gray-400 animate-slideInUp stagger-1">AI-powered video generation made simple</p>
            </div>
            <button
              onClick={() => setShowQueueManager(true)}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              title="View Queue Status"
            >
              <Activity className="w-4 h-4" />
              <span>Queue</span>
            </button>
          </div>
          <div className="mt-6">
            <VideoCreationFlow size="medium" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-slideInUp stagger-2">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-400">Step {step} of 3</span>
            <span className="text-sm text-gray-400">{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-[#27AE60] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step 1: AI Idea Generation */}
        {step === 1 && (
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 animate-slideInUp">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Sparkles className="w-6 h-6 text-[#27AE60] mr-3 animate-bounce" />
              Video Idea Generation
            </h2>
            
            <div className="space-y-6">
              {/* AI Idea Toggle */}
              <div className="bg-gray-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Use AI to Generate Ideas</h3>
                    <p className="text-sm text-gray-400">Let AI create video ideas based on your channel</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uiState.useAiIdea}
                      onChange={(e) => handleInputChange('useAiIdea', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#27AE60]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#27AE60]"></div>
                  </label>
                </div>

                {uiState.useAiIdea && (
                  <div className="space-y-4">
                    {channelData.channel_name ? (
                      <div className="bg-gray-600/50 rounded-lg p-4">
                        <h4 className="font-medium mb-2">Channel Information</h4>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p><span className="text-gray-400">Name:</span> {channelData.channel_name}</p>
                          <p><span className="text-gray-400">Description:</span> {channelData.channel_description || 'Not set'}</p>
                          <p><span className="text-gray-400">Target Audience:</span> {channelData.target_audience || 'Not set'}</p>
                          <p><span className="text-gray-400">Content Style:</span> {channelData.content_style || 'Not set'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
                        <p className="text-yellow-400 text-sm">
                          Please set up your channel information in Settings to use AI idea generation.
                        </p>
                      </div>
                    )}

                    <button
                      onClick={generateAiIdea}
                      disabled={isGeneratingIdea || !channelData.channel_name}
                      className="w-full bg-[#27AE60] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#229954] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isGeneratingIdea ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Generating Idea...</span>
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5" />
                          <span>Generate AI Idea</span>
                        </>
                      )}
                    </button>

                    {uiState.aiGeneratedIdea && (
                      <div className="bg-[#27AE60]/10 border border-[#27AE60]/30 rounded-lg p-4">
                        <h4 className="font-medium text-[#27AE60] mb-2">AI Generated Idea</h4>
                        <p className="text-white">{uiState.aiGeneratedIdea}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Manual Prompt Input */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {uiState.useAiIdea ? 'Edit or Replace AI Idea' : 'Video Idea / Prompt'}
                </label>
                <textarea
                  value={formData.prompt}
                  onChange={(e) => handleInputChange('prompt', e.target.value)}
                  placeholder={uiState.useAiIdea 
                    ? 'The AI idea will appear here, or you can write your own...'
                    : 'Describe what kind of video you want to create...'
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#27AE60]"
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Enhanced Video Settings */}
        {step === 2 && (
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 animate-slideInUp">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <Settings className="w-6 h-6 text-[#27AE60] mr-3 animate-spin" style={{ animationDuration: '3s' }} />
              Enhanced Video Settings
            </h2>
            
            <div className="space-y-6">
              {/* Aspect Ratio */}
              <div>
                <label className="block text-sm font-medium mb-3">Aspect Ratio</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aspectRatios.map((ratio) => (
                    <div
                      key={ratio.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover-lift ${
                        uiState.aspectRatio === ratio.id
                          ? 'border-[#27AE60] bg-[#27AE60]/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => handleInputChange('aspectRatio', ratio.id)}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{ratio.name}</h3>
                        <span className="text-sm text-gray-400">{ratio.id}</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{ratio.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footage Type */}
              <div>
                <label className="block text-sm font-medium mb-3">Footage Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {footageTypes.map((footage) => (
                    <div
                      key={footage.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover-lift ${
                        uiState.footageType === footage.id
                          ? 'border-[#27AE60] bg-[#27AE60]/10'
                          : 'border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => handleInputChange('footageType', footage.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{footage.icon}</span>
                        <div>
                          <h3 className="font-semibold">{footage.name}</h3>
                          <p className="text-sm text-gray-400">{footage.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

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

        {/* Step 3: Schedule & Generate */}
        {step === 3 && (
          <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700 animate-slideInUp">
            {isGenerating || videoUrl ? (
              <div className="text-center">
                {isGenerating && (
                  <div className="mb-8">
                    {/* Resume indicator */}
                    {currentVideoId && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-blue-400 font-medium">
                            Resumed ongoing video generation
                          </span>
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                        <p className="text-blue-300 text-sm text-center mt-2">
                          Your video generation continued from where it left off
                        </p>
                      </div>
                    )}
                    
                    <h2 className="text-2xl font-semibold mb-4 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#27AE60] mr-3"></div>
                      Generating Your Video
                    </h2>
                    <VideoPlayerProgressIndicator 
                      isProcessing={isGenerating}
                      progress={progress?.progress || 0}
                      stage={progress?.step || 'initializing'}
                      message={progress?.message || 'Initializing video generation...'}
                      details={progress?.details}
                      timestamp={progress?.timestamp}
                      retryInfo={retryInfo}
                      onRetry={retryGeneration}
                    />
                    <p className="text-gray-400 mt-4">This may take a few minutes...</p>
                  </div>
                )}

                {videoUrl && !isGenerating && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-[#27AE60] flex items-center justify-center">
                      <span className="mr-3">🎉</span>
                      Video Generated Successfully!
                    </h2>
                    
                    <div className="bg-gray-700/50 rounded-lg p-6">
                      <video 
                        controls 
                        className="w-full max-w-2xl mx-auto rounded-lg"
                        src={videoUrl}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
                  <Calendar className="w-6 h-6 text-[#27AE60] mr-3 animate-pulse" />
                  Schedule & Generate
                </h2>
                
                <div className="space-y-6">
                  {/* AI Content Generation Toggle */}
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Bot className="w-5 h-5 text-[#27AE60]" />
                        <h3 className="font-semibold">Content Generation</h3>
                      </div>
                      <button
                        onClick={() => setAiContentState(prev => ({ 
                          ...prev, 
                          useAiGeneration: !prev.useAiGeneration 
                        }))}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          aiContentState.useAiGeneration ? 'bg-[#27AE60]' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            aiContentState.useAiGeneration ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400">
                      {aiContentState.useAiGeneration 
                        ? 'AI will automatically generate platform-specific content after video creation'
                        : 'Manual input mode - enter your own content below'
                      }
                    </p>
                  </div>

                  {/* Platform-Specific Content */}
                  {aiContentState.useAiGeneration ? (
                    <div className="space-y-6">
                      {aiContentState.isGeneratingContent && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                            <span className="text-blue-400">Generating platform-specific content...</span>
                          </div>
                        </div>
                      )}

                      {/* YouTube Content */}
                      {connectedAccounts.youtube.connected && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <VideoIcon className="w-5 h-5 text-red-500" />
                            <h4 className="font-semibold text-red-400">YouTube Content</h4>
                            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">
                              @{connectedAccounts.youtube.username}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-red-400">Title</label>
                              <input
                                type="text"
                                value={aiContentState.generatedContent.youtube.title || formData.title}
                                onChange={(e) => {
                                  setFormData(prev => ({ ...prev, title: e.target.value }));
                                  setAiContentState(prev => ({
                                    ...prev,
                                    generatedContent: {
                                      ...prev.generatedContent,
                                      youtube: { ...prev.generatedContent.youtube, title: e.target.value }
                                    }
                                  }));
                                }}
                                placeholder="AI will generate an engaging title..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1 text-red-400">Description</label>
                              <textarea
                                value={aiContentState.generatedContent.youtube.description || formData.description}
                                onChange={(e) => {
                                  setFormData(prev => ({ ...prev, description: e.target.value }));
                                  setAiContentState(prev => ({
                                    ...prev,
                                    generatedContent: {
                                      ...prev.generatedContent,
                                      youtube: { ...prev.generatedContent.youtube, description: e.target.value }
                                    }
                                  }));
                                }}
                                placeholder="AI will generate a detailed description with timestamps..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                                rows={4}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1 text-red-400">Tags</label>
                              <input
                                type="text"
                                value={aiContentState.generatedContent.youtube.tags || uiState.tags}
                                onChange={(e) => {
                                  setUiState(prev => ({ ...prev, tags: e.target.value }));
                                  setAiContentState(prev => ({
                                    ...prev,
                                    generatedContent: {
                                      ...prev.generatedContent,
                                      youtube: { ...prev.generatedContent.youtube, tags: e.target.value }
                                    }
                                  }));
                                }}
                                placeholder="AI will generate relevant tags..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Instagram Content */}
                      {connectedAccounts.instagram.connected && (
                        <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <ImageIcon className="w-5 h-5 text-pink-500" />
                            <h4 className="font-semibold text-pink-400">Instagram Content</h4>
                            <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded">
                              @{connectedAccounts.instagram.username}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-pink-400">Caption</label>
                              <textarea
                                value={aiContentState.generatedContent.instagram.caption}
                                onChange={(e) => setAiContentState(prev => ({
                                  ...prev,
                                  generatedContent: {
                                    ...prev.generatedContent,
                                    instagram: { ...prev.generatedContent.instagram, caption: e.target.value }
                                  }
                                }))}
                                placeholder="AI will generate an engaging Instagram caption..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                                rows={3}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1 text-pink-400">Hashtags</label>
                              <textarea
                                value={aiContentState.generatedContent.instagram.hashtags}
                                onChange={(e) => setAiContentState(prev => ({
                                  ...prev,
                                  generatedContent: {
                                    ...prev.generatedContent,
                                    instagram: { ...prev.generatedContent.instagram, hashtags: e.target.value }
                                  }
                                }))}
                                placeholder="AI will generate trending hashtags..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-pink-500"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TikTok Content */}
                      {connectedAccounts.tiktok.connected && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                          <div className="flex items-center space-x-3 mb-4">
                            <Smartphone className="w-5 h-5 text-purple-500" />
                            <h4 className="font-semibold text-purple-400">TikTok Content</h4>
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                              @{connectedAccounts.tiktok.username}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1 text-purple-400">Caption</label>
                              <textarea
                                value={aiContentState.generatedContent.tiktok.caption}
                                onChange={(e) => setAiContentState(prev => ({
                                  ...prev,
                                  generatedContent: {
                                    ...prev.generatedContent,
                                    tiktok: { ...prev.generatedContent.tiktok, caption: e.target.value }
                                  }
                                }))}
                                placeholder="AI will generate a viral TikTok caption..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                rows={2}
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium mb-1 text-purple-400">Hashtags</label>
                              <textarea
                                value={aiContentState.generatedContent.tiktok.hashtags}
                                onChange={(e) => setAiContentState(prev => ({
                                  ...prev,
                                  generatedContent: {
                                    ...prev.generatedContent,
                                    tiktok: { ...prev.generatedContent.tiktok, hashtags: e.target.value }
                                  }
                                }))}
                                placeholder="AI will generate trending TikTok hashtags..."
                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                                rows={2}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* No Connected Accounts Message */}
                      {!connectedAccounts.youtube.connected && !connectedAccounts.instagram.connected && !connectedAccounts.tiktok.connected && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                          <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-yellow-500" />
                            <div>
                              <h4 className="font-semibold text-yellow-400">No Connected Accounts</h4>
                              <p className="text-sm text-yellow-300 mt-1">
                                Connect your social media accounts in Settings to enable AI content generation for each platform.
                              </p>
                              <button
                                onClick={() => onNavigate('settings')}
                                className="text-yellow-400 hover:text-yellow-300 underline text-sm mt-2"
                              >
                                Go to Settings
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Manual Input Mode */
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
                        <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={uiState.tags}
                          onChange={(e) => handleInputChange('tags', e.target.value)}
                          placeholder="e.g., tutorial, education, technology"
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#27AE60]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-gray-700/50 rounded-lg p-6">
                    <h3 className="font-semibold mb-4">Video Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Aspect Ratio:</span> {aspectRatios.find(r => r.id === uiState.aspectRatio)?.name}
                      </div>
                      <div>
                        <span className="text-gray-400">Length:</span> {formData.duration} seconds
                      </div>
                      <div>
                        <span className="text-gray-400">Voice:</span> {VOICES.find(v => v.id === formData.voice)?.name}
                      </div>
                      <div>
                        <span className="text-gray-400">Footage:</span> {footageTypes.find(f => f.id === uiState.footageType)?.name}
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

                  {/* Schedule Options */}
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
                        <Upload className="w-5 h-5 text-[#27AE60] mx-auto mb-1 animate-pulse" />
                        <div className="text-sm">Upload Now</div>
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
                        <FileText className="w-5 h-5 text-[#27AE60] mx-auto mb-1 animate-pulse" />
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
                        disabled={!formData.prompt || isGenerating}
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
            {[1, 2, 3].map((num) => (
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
            disabled={step === 3}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors hover-lift ${
              step === 3
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-[#27AE60] text-white hover:bg-[#229954]'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Queue Manager Modal */}
      <QueueManager 
        isOpen={showQueueManager} 
        onClose={() => setShowQueueManager(false)} 
      />
    </div>
  );
}