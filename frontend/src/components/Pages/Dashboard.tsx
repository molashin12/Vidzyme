import { Play, Plus, BarChart3, Users, Clock, Video, TrendingUp, Calendar } from 'lucide-react';
import VideoCreationFlow from '../Animations/VideoCreationFlow';
import VideoPlayerProgressIndicator from '../Animations/VideoPlayerProgressIndicator';
import { useVideoGeneration } from '../../hooks/useVideoGeneration';
import { useUser } from '../../contexts/UserContext';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { isGenerating, progress } = useVideoGeneration();
  const { stats, usage, videos, isLoading } = useUser();
  
  // Format stats for display
  const formattedStats = [
    { 
      label: 'Videos Created', 
      value: stats.videosCreated.toString(), 
      change: stats.monthlyChange.videos, 
      icon: Video 
    },
    { 
      label: 'Total Views', 
      value: stats.totalViews >= 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toString(), 
      change: stats.monthlyChange.views, 
      icon: TrendingUp 
    },
    { 
      label: 'Watch Time', 
      value: `${(stats.watchTimeHours / 1000).toFixed(1)}K hrs`, 
      change: stats.monthlyChange.watchTime, 
      icon: Clock 
    },
    { 
      label: 'Subscribers', 
      value: stats.subscribers >= 1000 ? `${(stats.subscribers / 1000).toFixed(1)}K` : stats.subscribers.toString(), 
      change: stats.monthlyChange.subscribers, 
      icon: Users 
    },
  ];

  // Get recent videos (limit to 4 for display)
  const recentVideos = videos.slice(0, 4).map(video => ({
    id: video.id,
    title: video.title,
    duration: video.duration,
    status: video.status,
    views: video.views,
    platform: video.platform
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1116] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#27AE60]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1116] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 animate-slideInLeft">Welcome back!</h1>
            <p className="text-gray-400 animate-slideInLeft stagger-1">Here's what's happening with your content</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <VideoCreationFlow size="small" />
            <button
              onClick={() => onNavigate('generator')}
              className="bg-[#27AE60] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#229954] transition-colors flex items-center space-x-2 hover-glow animate-slideInRight"
            >
              <Plus className="w-5 h-5" />
              <span>Create Video</span>
            </button>
          </div>
        </div>

        {/* Processing Status - Only show when actively generating */}
        {isGenerating && progress && (
          <div className="mb-8 max-w-4xl mx-auto">
            <VideoPlayerProgressIndicator
                isProcessing={isGenerating}
                progress={progress?.progress || 0}
                stage={progress?.step || 'initializing'}
                message={progress?.message || 'Starting video generation...'}
                details={progress?.details}
                timestamp={progress?.timestamp}
                videoPath={undefined}
                onVideoReady={(path) => {
                  console.log('Video ready:', path);
                }}
                onGoToDashboard={() => {
                  // Already on dashboard, maybe refresh or scroll to top
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {formattedStats.map((stat, index) => (
            <div key={index} className={`bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover-lift animate-scaleIn stagger-${index + 1}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-[#27AE60] text-sm">{stat.change}</p>
                </div>
                <div className="w-12 h-12 bg-[#27AE60]/20 rounded-lg flex items-center justify-center animate-pulse">
                  <stat.icon className="w-6 h-6 text-[#27AE60]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Usage Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700 animate-slideInLeft">
            <h3 className="text-xl font-semibold mb-4 animate-slideInUp">Usage This Month</h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Videos Created</span>
                  <span className="text-white">{usage.current} / {usage.limit}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-[#27AE60] h-2 rounded-full transition-all duration-1000 animate-pulse"
                    style={{ width: `${(usage.current / usage.limit) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Voice Minutes</span>
                  <span className="text-white">{usage.voiceMinutes} / {usage.voiceLimit}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-[#27AE60] h-2 rounded-full transition-all duration-1000 animate-pulse"
                    style={{ width: `${(usage.voiceMinutes / usage.voiceLimit) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 animate-slideInRight">
            <h3 className="text-xl font-semibold mb-4 animate-slideInUp">Current Plan</h3>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#27AE60] rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-[#27AE60]">{usage.plan}</h4>
              <p className="text-gray-400 text-sm mb-4">$29/month</p>
              <button
                onClick={() => onNavigate('subscription')}
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors hover-lift"
              >
                Manage Plan
              </button>
            </div>
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 animate-slideInUp">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">Recent Videos</h3>
            <button
              onClick={() => onNavigate('history')}
              className="text-[#27AE60] hover:text-[#229954] transition-colors hover-glow"
            >
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 text-gray-400">Title</th>
                  <th className="text-left py-3 text-gray-400">Duration</th>
                  <th className="text-left py-3 text-gray-400">Platform</th>
                  <th className="text-left py-3 text-gray-400">Status</th>
                  <th className="text-left py-3 text-gray-400">Views</th>
                  <th className="text-left py-3 text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentVideos.map((video) => (
                  <tr key={video.id} className="border-b border-gray-700/50">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center animate-pulse">
                          <Play className="w-5 h-5 text-[#27AE60]" />
                        </div>
                        <span className="text-white">{video.title}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-400">{video.duration}</td>
                    <td className="py-4 text-gray-400">{video.platform}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        video.status === 'Published' ? 'bg-green-500/20 text-green-400' :
                        video.status === 'Processing' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {video.status}
                      </span>
                    </td>
                    <td className="py-4 text-gray-400">{video.views}</td>
                    <td className="py-4">
                      <button className="text-[#27AE60] hover:text-[#229954] transition-colors hover-glow">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center hover-lift animate-slideInUp stagger-1">
            <div className="w-12 h-12 bg-[#27AE60]/20 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Plus className="w-6 h-6 text-[#27AE60]" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Create New Video</h4>
            <p className="text-gray-400 text-sm mb-4">Generate AI-powered content in minutes</p>
            <button
              onClick={() => onNavigate('generator')}
              className="w-full bg-[#27AE60] text-white px-4 py-2 rounded-lg hover:bg-[#229954] transition-colors hover-glow"
            >
              Start Creating
            </button>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center hover-lift animate-slideInUp stagger-2">
            <div className="w-12 h-12 bg-[#27AE60]/20 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce stagger-1">
              <BarChart3 className="w-6 h-6 text-[#27AE60]" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Analytics</h4>
            <p className="text-gray-400 text-sm mb-4">Track your video performance</p>
            <button className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors hover-lift">
              View Analytics
            </button>
          </div>
          
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 text-center hover-lift animate-slideInUp stagger-3">
            <div className="w-12 h-12 bg-[#27AE60]/20 rounded-lg flex items-center justify-center mx-auto mb-4 animate-bounce stagger-2">
              <Calendar className="w-6 h-6 text-[#27AE60]" />
            </div>
            <h4 className="text-lg font-semibold mb-2">Schedule Posts</h4>
            <p className="text-gray-400 text-sm mb-4">Plan your content calendar</p>
            <button className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors hover-lift">
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}