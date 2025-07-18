# Vidzyme - AI Video Generation SaaS Platform

## 🎯 Project Overview

Vidzyme is a comprehensive AI-powered video creation SaaS platform that automates the entire video production pipeline from script generation to publishing. The platform combines a FastAPI backend with a modern React frontend to provide users with an intuitive interface for creating professional video content at scale.

The platform features a complete SaaS architecture with user authentication, subscription management, onboarding flows, scheduled video generation, queue management, automatic thumbnail generation, and multi-channel support for content creators and businesses.

## 🏗️ Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │    │  External APIs  │
│   (React)       │◄──►│   (FastAPI)     │◄──►│   (Supabase)    │◄──►│                 │
│                 │    │                 │    │                 │    │ • Google Gemini │
│ • Landing Page  │    │ • Video Pipeline│    │ • User Auth     │    │ • ElevenLabs    │
│ • Dashboard     │    │ • SSE Streaming │    │ • Subscriptions │    │ • Gemini TTS    │
│ • Onboarding    │    │ • Queue Manager │    │ • Video History │    │ • Pollinations  │
│ • Subscriptions │    │ • Scheduler     │    │ • Channels      │    │ • Veo 3 API     │
│ • Video Gen     │    │ • File Manager  │    │ • Queue Data    │    │                 │
│ • Settings      │    │ • Health Check  │    │ • Thumbnails    │    │                 │
│ • Thumbnails    │    │ • Thumbnails    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Backend
- **Framework**: FastAPI (Python)
- **Video Processing**: MoviePy, FFmpeg, ImageMagick
- **Real-time Communication**: Server-Sent Events (SSE), WebSocket
- **AI Integration**: Google Gemini API, ElevenLabs TTS, Gemini TTS, Veo 3 API
- **Image Generation**: Pollinations AI API
- **Translation**: Google Translate
- **Queue Management**: Custom queue system with persistence
- **Scheduling**: APScheduler for automated video generation
- **File Management**: Advanced file handling, cleanup, and thumbnail generation

#### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React, Heroicons
- **State Management**: React Hooks, Context API
- **Animations**: Custom CSS animations
- **UI Components**: Custom modal system, enhanced video player with thumbnails

#### Database & Authentication
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime subscriptions
- **Storage**: Supabase Storage for video files and thumbnails
- **Optimization**: Custom indexes and migration scripts

#### External Services
- **Google Gemini**: Script generation and content creation
- **ElevenLabs**: High-quality text-to-speech conversion
- **Gemini TTS**: Integrated Google text-to-speech
- **Pollinations AI**: AI-powered image generation
- **Veo 3 API**: Advanced video generation capabilities
- **Google Translate**: Multi-language support

## 🎬 Video Generation Pipeline

The platform follows a sophisticated 13-step pipeline:

1. **Topic Input**: User provides video topic/prompt
2. **Title Generation**: AI generates multiple title options
3. **Content Creation**: AI writes detailed script content
4. **Text Processing**: Content is split into segments
5. **Image Generation**: AI creates visuals for each segment
6. **Voice Synthesis**: Text-to-speech for each segment
7. **Video Assembly**: Combines images, audio, and text
8. **Post-processing**: Applies effects and transitions
9. **Thumbnail Generation**: Extracts and optimizes video thumbnail
10. **Quality Check**: Validates output quality
11. **Format Optimization**: Optimizes for target platform
12. **File Generation**: Creates final video file and thumbnail
13. **Delivery**: Makes video and thumbnail available for download

## 🌟 Key Features

### Core Video Generation
- **AI Script Generation**: Automated content creation using Google Gemini
- **Multi-voice Support**: 5 different Arabic voice options via ElevenLabs
- **Dynamic Image Generation**: AI-generated visuals for each script segment
- **Advanced Video Generation**: Veo 3 API integration for enhanced video creation
- **Real-time Progress**: Live updates via Server-Sent Events
- **Multi-platform Optimization**: YouTube, TikTok, Instagram formats

### User Management & Authentication
- **Secure Authentication**: Sign-up/Sign-in system with Supabase
- **User Onboarding**: Multi-step onboarding flow for new users
- **Profile Management**: User settings and preferences
- **Channel Management**: Multi-channel support with platform preferences
- **User Dashboard**: Comprehensive analytics and video management

### Subscription & Billing
- **Multiple Subscription Tiers**: Free, Pro, and Enterprise plans
- **Usage Tracking**: Monitor API usage and limits
- **Billing Management**: Automated billing cycles and payment processing
- **Feature Access Control**: Tier-based feature restrictions
- **Subscription Analytics**: Usage statistics and billing history

### Scheduled Video Generation
- **Automated Scheduling**: Schedule videos for future generation
- **Queue Management**: Advanced queue system with priority handling
- **Batch Processing**: Process multiple videos efficiently
- **Recurring Schedules**: Set up recurring video generation
- **Schedule Analytics**: Track scheduled video performance

### Video Management
- **Video History**: Complete project management with enhanced player
- **Enhanced Video Player**: Full-screen modal with custom controls
- **Real-time Video Playback**: Seamless video streaming and playback
- **Video Organization**: Categorize and manage video content
- **Download Management**: Secure video download and sharing

### Technical Features
- **Responsive Design**: Mobile-first approach with RTL support
- **Progressive Enhancement**: Graceful degradation
- **Error Handling**: Comprehensive error management and recovery
- **Performance Optimization**: Lazy loading, caching, and optimization
- **Accessibility**: WCAG compliance considerations
- **Real-time Updates**: WebSocket and SSE for live updates

## 📁 Project Structure

```
Vidzyme/
├── server.py                  # Main FastAPI application
├── scheduler.py               # Video scheduling system
├── requirements.txt           # Python dependencies
├── package.json              # Node.js dependencies (for frontend build)
├── config/                   # Configuration files
│   ├── .env.example         # Environment variables template
│   └── database.sql         # Database schema and setup
├── utils/                    # Core backend utilities
│   ├── gemini.py            # Google Gemini integration
│   ├── write_script.py      # Script generation
│   ├── image_gen.py         # Image generation
│   ├── voice_gen.py         # Voice synthesis
│   ├── video_creation.py    # Video assembly
│   ├── file_manager.py      # File management system
│   └── video_queue.py       # Queue management
├── veo3/                     # Veo 3 API integration
│   ├── veo3_client.py       # Veo 3 API client
│   └── video_generator.py   # Advanced video generation
├── templates/                # Jinja2 templates
├── static/                   # Static backend assets
├── outputs/                  # Generated video content
├── logs/                     # Application logs
├── test_output/             # Test and development outputs
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Layout/     # Header, Footer, Navigation
│   │   │   ├── Pages/      # Main application pages
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── VideoGenerator.tsx
│   │   │   │   ├── VideoHistory.tsx
│   │   │   │   ├── Settings.tsx
│   │   │   │   ├── Subscription.tsx
│   │   │   │   └── OnboardingFlow.tsx
│   │   │   ├── Modals/     # Modal components
│   │   │   │   └── VideoPlayerModal.tsx
│   │   │   └── Animations/ # UI animations and effects
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useOnboarding.ts
│   │   │   └── useSubscription.ts
│   │   ├── services/       # API services and database
│   │   │   ├── api.ts
│   │   │   └── database.ts
│   │   ├── contexts/       # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── OnboardingContext.tsx
│   │   ├── config/         # Frontend configuration
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.ts      # Vite build configuration
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── tsconfig.json       # TypeScript configuration
└── docs/                   # Comprehensive documentation
    ├── README.md           # Main project documentation
    ├── PROJECT_OVERVIEW.md # This file
    ├── FRONTEND_ARCHITECTURE.md
    ├── BACKEND_ARCHITECTURE.md
    ├── API_DOCUMENTATION.md
    ├── DEVELOPMENT_GUIDE.md
    ├── DEPLOYMENT_GUIDE.md
    └── FRONTEND_INTEGRATION_GUIDE.md
```

## 🔧 Configuration Requirements

### API Keys
The platform requires two API keys stored in text files:
- `gemini_secret.txt`: Google Gemini API key
- `voice_secret.txt`: ElevenLabs API key

### System Dependencies
- **FFmpeg**: Video processing
- **ImageMagick**: Image manipulation
- **Python 3.9+**: Backend runtime
- **Node.js 16+**: Frontend build tools

## 🚀 Deployment Architecture

The platform supports multiple deployment scenarios:

### Development
- Backend: `uvicorn server:app --reload`
- Frontend: `npm run dev`
- Hot reloading enabled

### Production
- Backend: Containerized FastAPI with Gunicorn
- Frontend: Static build served via CDN
- Load balancing and auto-scaling

### Standalone
- Bundled executable with PyInstaller
- Embedded FFmpeg and ImageMagick
- Self-contained deployment

## 📊 Performance Characteristics

### Processing Times
- Script Generation: 10-30 seconds
- Image Generation: 5-15 seconds per image
- Voice Synthesis: 2-5 seconds per segment
- Video Assembly: 30-60 seconds
- Total Pipeline: 2-5 minutes per video

### Resource Requirements
- RAM: 4GB minimum, 8GB recommended
- Storage: 1GB per video project
- CPU: Multi-core recommended for parallel processing
- Network: Stable internet for API calls

## 🔒 Security Considerations

- API keys stored in separate files (gitignored)
- Input validation and sanitization
- Rate limiting on API endpoints
- Secure file handling and cleanup
- CORS configuration for frontend
- Environment-based configuration

## 🌐 Internationalization

- Primary language: Arabic (RTL support)
- Secondary language: English
- Google Translate integration for prompts
- Multi-language voice support
- Localized UI components

## 📈 Scalability Design

- Microservices-ready architecture
- Stateless backend design
- Queue-based processing for high load
- CDN integration for static assets
- Database-ready for user management
- Horizontal scaling capabilities

This platform represents a complete solution for automated video content creation, combining cutting-edge AI technologies with a user-friendly interface to democratize video production for content creators and businesses.