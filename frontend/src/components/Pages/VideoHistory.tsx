import React, { useState } from 'react';
import { Play, Download, Share2, MoreVertical, Edit, Trash2, Eye, Calendar, Filter, Search } from 'lucide-react';

interface VideoHistoryProps {
  onNavigate: (page: string) => void;
}

export default function VideoHistory({ onNavigate }: VideoHistoryProps) {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);

  const videos = [
    {
      id: 1,
      title: 'AI Revolution in 2025',
      thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      duration: '2:45',
      status: 'Published',
      platform: 'YouTube',
      views: '1.2K',
      likes: 89,
      created: '2 days ago',
      published: '1 day ago'
    },
    {
      id: 2,
      title: 'Quick Python Tutorial',
      thumbnail: 'https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      duration: '1:30',
      status: 'Processing',
      platform: 'TikTok',
      views: '---',
      likes: 0,
      created: '1 day ago',
      published: null
    },
    {
      id: 3,
      title: 'Marketing Tips for Startups',
      thumbnail: 'https://images.pexels.com/photos/7414032/pexels-photo-7414032.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      duration: '3:12',
      status: 'Published',
      platform: 'Instagram',
      views: '856',
      likes: 45,
      created: '3 days ago',
      published: '2 days ago'
    },
    {
      id: 4,
      title: 'Healthy Meal Prep Ideas',
      thumbnail: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      duration: '2:20',
      status: 'Draft',
      platform: 'YouTube',
      views: '---',
      likes: 0,
      created: '4 days ago',
      published: null
    },
    {
      id: 5,
      title: 'React Best Practices',
      thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      duration: '4:15',
      status: 'Published',
      platform: 'LinkedIn',
      views: '2.3K',
      likes: 156,
      created: '5 days ago',
      published: '4 days ago'
    },
    {
      id: 6,
      title: 'Travel Photography Tips',
      thumbnail: 'https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
      duration: '3:45',
      status: 'Failed',
      platform: 'TikTok',
      views: '---',
      likes: 0,
      created: '6 days ago',
      published: null
    }
  ];

  const filteredVideos = videos.filter(video => {
    const matchesFilter = filter === 'all' || video.status.toLowerCase() === filter;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': return 'bg-green-500/20 text-green-400';
      case 'Processing': return 'bg-yellow-500/20 text-yellow-400';
      case 'Draft': return 'bg-blue-500/20 text-blue-400';
      case 'Failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
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
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#27AE60]"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="processing">Processing</option>
                <option value="draft">Draft</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div key={video.id} className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden group hover:border-[#27AE60]/50 transition-all">
              {/* Thumbnail */}
              <div className="relative">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-[#27AE60] text-white p-3 rounded-full hover:bg-[#229954] transition-colors">
                    <Play className="w-6 h-6" />
                  </button>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {video.duration}
                </div>
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(video.status)}`}>
                    {video.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <span className={`px-2 py-1 rounded ${getPlatformColor(video.platform)}`}>
                    {video.platform}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {video.created}
                  </span>
                </div>

                {video.status === 'Published' && (
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                    <span>{video.views} views</span>
                    <span>{video.likes} likes</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    {video.status === 'Published' && (
                      <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
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
                          <button className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700">
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                          <button className="flex items-center space-x-2 w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-gray-700">
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

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No videos found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Start creating your first video'}
            </p>
            <button
              onClick={() => onNavigate('generator')}
              className="bg-[#27AE60] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#229954] transition-colors"
            >
              Create Your First Video
            </button>
          </div>
        )}
      </div>
    </div>
  );
}