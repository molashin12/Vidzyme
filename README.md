# Vidzyme - AI Video Generation SaaS Platform

Vidzyme is a comprehensive AI-powered video generation SaaS platform that enables users to create engaging videos automatically with advanced features including user authentication, subscription management, channel management, scheduled generation, real video thumbnails, and multi-platform publishing.

## 🚀 Project Overview

**Vidzyme** is a full-stack SaaS application featuring:

### 🎯 **Frontend (React + TypeScript)**
- Modern React 18 SaaS interface with TypeScript
- User authentication and onboarding flow
- Dashboard with analytics and video management
- Multi-step video generation wizard
- Channel management and settings
- Subscription management with multiple tiers
- Real-time video generation progress tracking
- Enhanced video player with thumbnail previews

### 🔧 **Backend (FastAPI + Python)**
- FastAPI-based API with comprehensive endpoints
- AI-powered video generation pipeline using Google Gemini
- Advanced TTS system with multiple voice providers (ElevenLabs, Gemini TTS)
- Image generation with Pollinations API
- Video assembly with MoviePy, FFmpeg, and ImageMagick
- Automatic thumbnail generation and storage
- Queue management system for video processing
- Scheduled video generation with APScheduler
- Real-time progress streaming via Server-Sent Events (SSE)
- File management with automatic cleanup

### 🗄️ **Database (Supabase + PostgreSQL)**
- User management with Row Level Security (RLS)
- Video history and analytics with thumbnail URLs
- Channel and subscription management
- Video queue processing
- Scheduled video generation
- User onboarding tracking
- Optimized database indexes for performance

Ideal for content creators, marketers, and businesses looking to automate video content creation for YouTube Shorts, social media clips, and marketing materials.

## 📋 Features

### 🎥 **Video Generation**
- **AI-Powered Script Writing** with Google Gemini 1.5 Flash
- **Advanced Image Generation** with Pollinations API
- **Professional TTS** with multiple voice providers (ElevenLabs, Gemini TTS)
- **Dynamic Video Composition** using MoviePy, FFmpeg, and ImageMagick
- **Automatic Thumbnail Generation** from video frames with resizing and optimization
- **Real-time Progress Tracking** via Server-Sent Events (SSE)
- **Queue-based Processing** for efficient resource management
- **Custom Video Templates** and styling options
- **File Management** with automatic cleanup and storage optimization

### 👤 **User Management**
- **Secure Authentication** with Supabase Auth
- **Interactive Onboarding Flow** for new users
- **User Profile Management** with preferences
- **Multi-channel Support** for different content types
- **Usage Analytics** and performance tracking

### 📅 **Scheduled Video Generation**
- **Automated Scheduling** (daily, weekly, monthly)
- **Flexible Timing Options** with custom schedules
- **Channel-specific Content** generation
- **Queue Management** for processing optimization
- **Batch Processing** capabilities

### 🎯 **Channel Management**
- **Multi-channel Support** for different content niches
- **Channel-specific Settings** and preferences
- **Content Categorization** and target audience settings
- **Platform-specific Optimization** for different social media
- **Performance Analytics** per channel

### 🔗 **Multi-Platform Publishing**
- **Platform Integration** (YouTube, Instagram, TikTok, LinkedIn, Twitter, Facebook)
- **Platform-specific Formatting** and optimization
- **Unified Content Creation** across multiple platforms
- **Publishing Workflow** management
- **Cross-platform Analytics**

### 💳 **Subscription Management**
- **Multiple Subscription Tiers** (Free, Pro, Enterprise)
- **Usage Tracking** and credit system
- **Billing Management** with payment processing
- **Real-time Usage Analytics** and limits
- **Flexible Upgrade/Downgrade** options

### 🛠️ **Advanced Features**
- **Real-time Video Player** with custom controls and thumbnail previews
- **Video History Management** with search and filtering
- **Thumbnail Management** with automatic generation and database storage
- **Download and Sharing** capabilities
- **Performance Analytics** and insights
- **Error Handling** and retry mechanisms
- **Responsive Design** for all devices
- **Database Optimization** with proper indexing and performance tuning

## 🛠️ Tech Stack

### **Frontend Technologies**
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **Lucide React** for consistent iconography
- **Heroicons** for additional UI icons
- **Custom Hooks** for state management and reusable logic
- **Supabase Client** for authentication and real-time data

### **Backend Technologies**
- **FastAPI** for high-performance Python API
- **Uvicorn** ASGI server with standard extras
- **APScheduler** for automated video scheduling
- **Threading** for concurrent video processing
- **Server-Sent Events (SSE)** for real-time updates
- **Advanced Queue Management** with persistence and priority handling
- **File Management System** with automatic cleanup and optimization

### **AI & Media Processing**
- **Google Gemini 1.5 Flash** for AI script generation
- **Pollinations API** for AI image generation
- **Advanced TTS System** with multiple providers:
  - **ElevenLabs** for high-quality voice synthesis
  - **Gemini TTS** for integrated Google voice generation
- **MoviePy** for video composition and editing
- **FFmpeg** for video processing and encoding
- **ImageMagick** for image manipulation
- **Pillow (PIL)** for Python image processing
- **Automatic Thumbnail Generation** with frame extraction and resizing

### **Database & Authentication**
- **Supabase** (PostgreSQL) for database management
- **Row Level Security (RLS)** for data protection
- **Real-time Subscriptions** for live data updates
- **Supabase Auth** for secure user authentication
- **Custom Database Functions** and triggers
- **Optimized Indexes** for thumbnail and video queries
- **Database Migration Scripts** for schema updates

### **Development & Deployment**
- **TypeScript** for type safety across the stack
- **ESLint** for code quality and consistency
- **PostCSS & Autoprefixer** for CSS processing
- **Git** for version control
- **Environment Variables** for secure configuration
- **Utility Scripts** for maintenance and backfill operations

### **Database Schema**
- **Users & Profiles** - User management and preferences
- **Video Management** - Video history, analytics, metadata, and thumbnail URLs
- **Channel Management** - Multi-channel support and settings
- **Scheduled Videos** - Automated generation scheduling
- **Video Queue** - Processing queue management
- **Subscriptions** - Billing and usage tracking
- **User Onboarding** - Onboarding flow tracking
- **Platforms** - Multi-platform publishing support
- **Thumbnail Management** - Optimized thumbnail storage and retrieval

## ⚙️ Prerequisites

### **System Requirements**
- **Node.js 18+** and npm for frontend development
- **Python 3.9+** for backend development
- **Git** for version control
- **Supabase Account** and project setup

### **System Dependencies**

#### **FFmpeg** (Required for video processing)
- **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) → Add to PATH
- **macOS**: `brew install ffmpeg`
- **Ubuntu/Debian**: `sudo apt update && sudo apt install ffmpeg`

#### **ImageMagick** (Required for image processing)
- **Windows**: Download from [imagemagick.org](https://imagemagick.org) → Add to PATH
- **macOS**: `brew install imagemagick`
- **Ubuntu/Debian**: `sudo apt update && sudo apt install imagemagick`

### **API Keys & Configuration**

Create these configuration files in the project root:

#### **Required API Keys**
```bash
# Google Gemini API Key (for AI script generation)
echo "your_gemini_api_key_here" > gemini_secret.txt

# Voice/TTS API Key (if using external TTS service)
echo "your_voice_api_key_here" > voice_secret.txt
```

#### **Environment Variables**

**Frontend Environment (`.env` in `/frontend` directory)**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend Environment (`.env` in root directory)**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_google_gemini_api_key
VOICE_API_KEY=your_voice_service_api_key
```

### **Supabase Setup**
1. Create a new Supabase project
2. Configure authentication providers
3. Set up Row Level Security (RLS) policies
4. Run the provided SQL schema files

## 🚀 Getting Started

### **Quick Installation**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/molashin12/Vidzyme.git
   cd Vidzyme
   ```

2. **Install Dependencies**
   
   **Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```
   
   **Backend Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**
   
   **Frontend Configuration**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```
   
   **Backend Configuration**
   ```bash
   # Create .env in root directory
   touch .env
   # Add your environment variables as shown in Prerequisites
   ```

4. **Set Up Database**
   
   Run the SQL scripts in your Supabase SQL editor in this order:
   ```bash
   # 1. Main schema (core tables and functions)
   supabase-schema.sql
   
   # 2. Schema extensions (additional features)
   schema-extensions.sql
   
   # 3. Platform migration (multi-platform support)
   schema-migration-platforms.sql
   ```

5. **Configure API Keys**
   ```bash
   # Add your Google Gemini API key
   echo "your_gemini_api_key" > gemini_secret.txt
   
   # Add your TTS service API key (if using external service)
   echo "your_voice_api_key" > voice_secret.txt
   ```

6. **Start Development Servers**
   
   **Terminal 1 - Backend Server**
   ```bash
   python server.py
   # Backend will run on http://localhost:8000
   ```
   
   **Terminal 2 - Frontend Development Server**
   ```bash
   cd frontend
   npm run dev
   # Frontend will run on http://localhost:3000 (or next available port)
   ```

### **Development Workflow**

The application will be available at:
- **Frontend**: `http://localhost:3000` (React development server)
- **Backend API**: `http://localhost:8000` (FastAPI server)
- **API Documentation**: `http://localhost:8000/docs` (Swagger UI)

### **Production Deployment**

For production deployment, see the [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for detailed instructions on:
- Docker containerization
- Environment configuration
- Database setup and migrations
- SSL certificate configuration
- Load balancing and scaling

## ▶️ Running the Application

### Development Mode
```bash
# Start the FastAPI application in development
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

### Production Mode
```bash
# Run the compiled executable (if available)
.\server.exe
```

### Usage
1. Open your browser to **[http://127.0.0.1:8000](http://127.0.0.1:8000)**
2. Enter a **topic** and select a **voice**
3. Watch real-time progress and download your generated video when it completes

### Alternative Implementation (Veo-3)
The project includes an alternative implementation using Google Veo-3 model:
- Configure `veo3/REPLICATE_API_TOKEN.txt` with your Replicate API token
- Use the Veo-3 modules for direct video generation instead of image-based assembly

## 📁 Project Structure

```
Vidzyme/
├── frontend/                    # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/          # Header, Footer, Navigation
│   │   │   ├── Pages/           # Main application pages
│   │   │   ├── Onboarding/      # User onboarding flow
│   │   │   ├── ScheduledVideos/ # Scheduled video management
│   │   │   ├── Auth/            # Authentication components
│   │   │   └── UI/              # Reusable UI components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API and database services
│   │   ├── contexts/            # React context providers
│   │   └── config/              # Configuration files
│   ├── public/                  # Static assets
│   └── package.json
├── utils/                       # Backend utility functions
│   ├── gemini.py               # Google Gemini integration
│   ├── image_gen.py            # Image generation
│   ├── video_creation.py       # Video assembly with thumbnail generation
│   ├── voice_gen.py            # Voice generation
│   ├── write_script.py         # Script writing
│   ├── file_manager.py         # File management and cleanup
│   ├── queue_manager.py        # Queue processing management
│   ├── thumbnail_backfill.py   # Thumbnail utility for existing videos
│   └── tts/                    # Advanced TTS system
│       ├── base_provider.py    # TTS provider interface
│       ├── elevenlabs_provider.py # ElevenLabs integration
│       ├── gemini_tts_provider.py # Gemini TTS integration
│       └── tts_factory.py      # TTS provider factory
├── veo3/                       # Alternative Veo-3 implementation
├── config/                     # Configuration files
│   ├── queue_config.json       # Queue management settings
│   ├── storage_config.json     # Storage configuration
│   └── tts_config.json         # TTS system configuration
├── migrations/                 # Database migration scripts
│   └── thumbnail_optimization.sql # Thumbnail database optimizations
├── outputs/                    # Generated content storage
│   ├── audio/                  # Generated audio files
│   ├── images/                 # Generated images
│   ├── videos/                 # Generated video files
│   └── thumbnails/             # Generated video thumbnails
├── logs/                       # Application logs
├── docs/                       # Comprehensive documentation
│   ├── README.md               # Documentation overview
│   ├── PROJECT_OVERVIEW.md     # Project architecture
│   ├── BACKEND_ARCHITECTURE.md # Backend design
│   ├── FRONTEND_ARCHITECTURE.md # Frontend design
│   ├── API_DOCUMENTATION.md    # API reference
│   ├── DEVELOPMENT_GUIDE.md    # Development workflow
│   ├── DEPLOYMENT_GUIDE.md     # Deployment instructions
│   └── FILE_MANAGEMENT.md      # File management guide
├── server.py                   # Main FastAPI server
├── scheduler.py                # Video scheduling system
├── requirements.txt            # Python dependencies
├── package.json                # Node.js dependencies
├── supabase-schema.sql         # Main database schema
├── schema-extensions.sql       # Extended schema for new features
├── schema-migration-platforms.sql # Multi-platform migration
├── SETUP_GUIDE.md              # Complete setup instructions
├── TTS_SYSTEM_README.md        # TTS system documentation
├── PLATFORMS_MIGRATION_README.md # Migration guide
├── GOOGLE_AUTH_SETUP.md        # Google authentication setup
├── SUPABASE_SETUP_GUIDE.md     # Supabase configuration
└── README.md                   # This file
```

## 🔧 Key Features Implementation

### Multi-Platform Support
- Select multiple platforms (YouTube, Instagram, TikTok, LinkedIn, Other) during onboarding
- Store all selected platforms in a single channel record
- Backward compatibility with existing single-platform channels
- Platform-specific content optimization and formatting
- Unified content creation workflow across platforms

### Onboarding Flow
- Multi-step form for new user setup
- Channel information collection with multi-platform selection
- Content preferences and categorization
- Skip option for experienced users
- Automatic redirect to dashboard upon completion

### Scheduled Video Generation
- Create custom schedules with frequency options
- Time-based execution with timezone support
- Channel-specific content generation
- Queue management for processing
- Enable/disable schedules as needed

### Channel Management
- Create and edit multiple channels
- Multi-platform selection and management
- Content description and categorization
- Target audience specification
- Integration with scheduled video generation

## 🔌 API Endpoints

### Core Video Generation
- `POST /generate` - Generate video immediately (real-time processing)
- `GET /progress/{video_id}` - Get video generation progress (Server-Sent Events)
- `GET /video/{video_id}` - Download generated video file
- `GET /` - Main application interface

### Scheduled Video Management
- `POST /scheduled-videos` - Create new scheduled video
- `GET /scheduled-videos` - Get all scheduled videos for user
- `GET /scheduled-videos/{video_id}` - Get specific scheduled video
- `PUT /scheduled-videos/{video_id}` - Update scheduled video
- `DELETE /scheduled-videos/{video_id}` - Delete scheduled video
- `POST /scheduled-videos/{video_id}/toggle` - Enable/disable schedule

### Queue Management
- `GET /queue/status` - Get current queue status and statistics
- `GET /queue/videos` - Get videos in processing queue
- `POST /queue/clear` - Clear all queued videos (admin)

### System Health
- `GET /health` - System health check
- `GET /docs` - Interactive API documentation (Swagger UI)
- `GET /redoc` - Alternative API documentation

### Real-time Updates
- `GET /progress/{video_id}` - Server-Sent Events for real-time progress updates
- WebSocket support for live status updates

## 🗄️ Database Schema

### Core Tables
- `users` - User authentication and basic info
- `user_profiles` - Extended user information
- `videos` - Video records and metadata
- `subscriptions` - User subscription plans
- `usage` - Usage tracking and analytics

### Feature Tables
- `user_channels` - Channel management with multi-platform support
- `scheduled_videos` - Automated video schedules
- `video_queue` - Video processing queue
- `user_onboarding` - Onboarding progress tracking

### Recent Updates
- **Multi-Platform Migration**: Added `platforms` array column to `user_channels` table
- **Platform Constraints**: Enforced valid platform values (youtube, instagram, tiktok, linkedin, other)
- **Backward Compatibility**: Automatic sync between `platforms` array and legacy `channel_type` field
- **Performance Optimization**: Added GIN index for efficient platform array queries

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@vidzyme.com or join our Discord community.

## 🗺️ Roadmap

- [ ] Advanced AI video customization
- [ ] More social media platform integrations
- [ ] Team collaboration features
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] API for third-party integrations

---

**Vidzyme** - Transforming content creation with AI-powered video generation.
