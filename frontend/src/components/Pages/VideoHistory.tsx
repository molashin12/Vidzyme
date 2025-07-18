import { useState, useEffect } from 'react';
import { Play, Download, Share2, MoreVertical, Edit, Trash2, Eye, Calendar, Filter, Search } from 'lucide-react';
import { DatabaseService } from '../../services/database';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../contexts/UserContext';
import { Video } from '../../config/supabase';
import VideoPlayerModal from '../Modals/VideoPlayerModal';

interface VideoHistoryProps {
  onNavigate: (page: string) => void;
}

interface VideoWithStats extends Video {
  views?: number;
  likes?: number;
  platform?: string;
}

export default function VideoHistory({ onNavigate }: VideoHistoryProps) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videos, setVideos] = useState<VideoWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoWithStats | null>(null);
  const { user } = useAuth();
  const { refreshUsage } = useUser();

  useEffect(() => {
    const fetchVideos = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await DatabaseService.getUserVideos(user.id, 50, 0);
        
        if (result.success && result.data) {
          setVideos(result.data);
        } else {
          setError(result.error || 'Failed to fetch videos');
        }
      } catch (err) {
        setError('An error occurred while fetching videos');
        console.error('Error fetching videos:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [user?.id]);

  const handleDownload = (video: VideoWithStats) => {
     if (video.video_url) {
       const link = document.createElement('a');
       link.href = video.video_url;
       link.download = `${video.title}.mp4`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
     }
   };

   const handlePlay = (video: VideoWithStats) => {
     if (video.video_url) {
       setPlayingVideo(video);
     } else {
       alert('Video is not available for playback');
     }
   };

   const handleDelete = async (videoId: string) => {
     if (window.confirm('Are you sure you want to delete this video?')) {
       try {
         const result = await DatabaseService.deleteVideo(videoId);
         if (result.success) {
           setVideos(videos.filter(v => v.id !== videoId));
           // Refresh usage to update dashboard counts
           await refreshUsage();
         } else {
           alert('Failed to delete video: ' + result.error);
         }
       } catch (err) {
         alert('An error occurred while deleting the video');
         console.error('Error deleting video:', err);
       }
     }
   };

   const handleShare = (video: VideoWithStats) => {
     if (navigator.share && video.video_url) {
       navigator.share({
         title: video.title,
         text: video.description || video.title,
         url: video.video_url,
       });
     } else if (video.video_url) {
       navigator.clipboard.writeText(video.video_url);
       alert('Video URL copied to clipboard!');
     }
   };

   const filteredVideos = videos.filter(video => {
     const matchesFilter = filter === 'all' || video.status?.toLowerCase() === filter;
     const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase());
     return matchesFilter && matchesSearch;
   });

   if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1116] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#27AE60] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading videos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0F1116] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#27AE60] text-white px-4 py-2 rounded-lg hover:bg-[#229954] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400';
      case 'pending': return 'bg-blue-500/20 text-blue-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Published';
      case 'processing': return 'Processing';
      case 'pending': return 'Draft';
      case 'failed': return 'Failed';
      default: return status;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'YouTube': return 'bg-red-500/20 text-red-400';
      case 'TikTok': return 'bg-pink-500/20 text-pink-400';
      case 'Instagram': return 'bg-purple-500/20 text-purple-400';
      case 'LinkedIn': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1116] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Video History</h1>
            <p className="text-gray-400">Manage all your created videos</p>
          </div>
          <button
            onClick={() => onNavigate('generator')}
            className="bg-[#27AE60] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#229954] transition-colors mt-4 md:mt-0"
          >
            Create New Video
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#27AE60]"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select 
               value={filter} 
               onChange={(e) => setFilter(e.target.value)}
               className="bg-[#1A1D23] border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#27AE60]"
             >
               <option value="all">All Status</option>
               <option value="completed">Published</option>
               <option value="processing">Processing</option>
               <option value="pending">Draft</option>
               <option value="failed">Failed</option>
             </select>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        {filteredVideos.length === 0 ? (
             <div className="text-center py-12">
               <div className="text-gray-400 mb-4">
                 <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                 </svg>
               </div>
               <h3 className="text-xl font-semibold text-white mb-2">
                 {videos.length === 0 ? 'No videos yet' : 'No videos match your filters'}
               </h3>
               <p className="text-gray-400 mb-6">
                 {videos.length === 0 
                   ? 'Create your first video to get started!' 
                   : 'Try adjusting your search or filter criteria.'
                 }
               </p>
               {videos.length === 0 && (
                 <button
                   onClick={() => onNavigate('create')}
                   className="bg-[#27AE60] text-white px-6 py-3 rounded-lg hover:bg-[#229954] transition-colors"
                 >
                   Create Your First Video
                 </button>
               )}
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredVideos.map((video) => (
            <div key={video.id} className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden group hover:border-[#27AE60]/50 transition-all">
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={video.thumbnail_url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop'}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handlePlay(video)}
                    className="bg-[#27AE60] text-white p-3 rounded-full hover:bg-[#229954] transition-colors"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '0:00'}
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(video.status)}`}>
                    {getStatusText(video.status)}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <span className={`px-2 py-1 rounded ${getPlatformColor(video.platform || 'YouTube')}`}>
                    {video.platform || 'YouTube'}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(video.created_at).toLocaleDateString()}
                  </span>
                </div>

                {video.status === 'completed' && (
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <span>{video.views || 0} views</span>
                    <span>{video.likes || 0} likes</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handlePlay(video)}
                      className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDownload(video)}
                      disabled={!video.video_url}
                      className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {video.status === 'completed' && (
                      <button 
                        onClick={() => handleShare(video)}
                        className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setSelectedVideo(selectedVideo === video.id ? null : video.id)}
                      className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    {selectedVideo === video.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-10">
                        <div className="py-1">
                          <button className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => handleShare(video)}
                            className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(video.id)}
                            className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayerModal
          isOpen={!!playingVideo}
          onClose={() => setPlayingVideo(null)}
          videoUrl={playingVideo.video_url || ''}
          title={playingVideo.title}
          thumbnail={playingVideo.thumbnail_url}
        />
      )}
    </div>
  );
}