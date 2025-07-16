<<<<<<< HEAD
# Vidzyme - Complete Setup Guide

## Overview
This guide will help you set up and run the complete Vidzyme SaaS application with React frontend, FastAPI backend, and Supabase database for automated video generation with multi-platform support.
=======
# Vidzyme - Frontend-Backend Integration Setup Guide

## Overview
This guide will help you set up and run the complete Vidzyme SaaS application with the React frontend connected to the FastAPI backend for automated video generation.
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130

## Prerequisites

### Backend Requirements
<<<<<<< HEAD
- Python 3.9+
- FFmpeg installed and accessible
- ImageMagick installed and accessible
- Required Python packages (see requirements.txt)
- Google Gemini API key
- ElevenLabs API key

### Frontend Requirements
- Node.js 18+
- npm or yarn

### Database Requirements
- Supabase account and project
- Database schema setup

## Quick Start

### Manual Setup

#### 1. Database Setup
```bash
# Set up Supabase database
# 1. Create a new Supabase project
# 2. Run the schema files in SQL Editor:
cat supabase-schema.sql | supabase db reset
cat schema-extensions.sql | supabase db reset
cat schema-migration-platforms.sql | supabase db reset
```

#### 2. Backend Setup
```bash
# Navigate to project root
cd Vidzyme

# Create API key files
echo "your_gemini_api_key" > gemini_secret.txt
echo "your_elevenlabs_api_key" > voice_secret.txt
=======
- Python 3.8+
- FFmpeg installed and accessible
- ImageMagick installed and accessible
- Required Python packages (see requirements.txt)

### Frontend Requirements
- Node.js 16+
- npm or yarn

## Quick Start

### Option 1: Automated Setup (Recommended)
1. Double-click `start-dev.bat` to start both servers automatically
2. Wait for both servers to start
3. Open http://localhost:3000 in your browser

### Option 2: Manual Setup

#### 1. Backend Setup
```bash
# Navigate to project root
cd d:\CODING\Vidzyme
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130

# Install Python dependencies
pip install -r requirements.txt

<<<<<<< HEAD
# Create .env file with Supabase credentials
# SUPABASE_URL=your_supabase_url
# SUPABASE_SERVICE_KEY=your_supabase_service_key
# OPENAI_API_KEY=your_openai_api_key

=======
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
# Start the FastAPI server
python server.py
```
Backend will be available at: http://localhost:8000

<<<<<<< HEAD
#### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend
=======
#### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd d:\CODING\Vidzyme\frontend
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130

# Install dependencies
npm install

<<<<<<< HEAD
# Create .env file with Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

=======
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
# Start the development server
npm run dev
```
Frontend will be available at: http://localhost:3000

## Configuration

### Environment Variables
<<<<<<< HEAD

**Frontend (.env)**
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env)**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

**API Keys (text files)**
- `gemini_secret.txt`: Your Google Gemini API key
- `voice_secret.txt`: Your ElevenLabs API key

### Database Integration
The application uses Supabase for:
- **Authentication**: User registration and login
- **Database**: PostgreSQL with Row Level Security
- **Real-time**: Live updates for video generation
- **Storage**: User data and video metadata

## Features

### Multi-Platform Support
- **Platform Selection**: Choose multiple platforms (YouTube, Instagram, TikTok, LinkedIn, Other)
- **Unified Workflow**: Single channel for multiple platforms
- **Platform Optimization**: Content tailored for each platform
- **Migration Support**: Backward compatibility with existing channels

### Video Generation
- **AI-Powered**: Google Gemini for script generation
- **Voice Selection**: Multiple voice options via ElevenLabs
- **Real-time Progress**: Live updates during video generation
- **Error Handling**: Comprehensive error display and retry options
- **Scheduled Generation**: Automated video creation on custom schedules

### User Management
- **Authentication**: Secure user registration and login
- **Onboarding**: Interactive setup flow for new users
- **Channel Management**: Create and manage multiple content channels
- **Subscription Tracking**: Usage monitoring and billing
=======
The frontend uses these environment variables (already configured in `.env`):
- `VITE_API_BASE_URL`: Backend URL (http://localhost:8000)
- `VITE_API_PROXY_URL`: Proxy path for development (/api)

### API Integration
The frontend automatically connects to the backend through:
- **Proxy Configuration**: Vite proxy redirects `/api/*` to `http://localhost:8000`
- **API Client**: `src/services/api.ts` handles all backend communication
- **Real-time Updates**: Server-Sent Events for video generation progress

## Features

### Video Generation
- **Arabic Voice Selection**: 5 different Arabic voices (Male/Female)
- **Real-time Progress**: Live updates during video generation
- **Error Handling**: Comprehensive error display and retry options
- **Health Monitoring**: Backend connection status indicator
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130

### API Endpoints
- `GET /`: Welcome message
- `GET /health`: Health check
- `POST /generate`: Video generation
- `GET /stream`: Real-time progress updates
- `GET /static/*`: Generated video files
<<<<<<< HEAD
- Database operations handled via Supabase client
=======
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130

## File Structure
```
Vidzyme/
<<<<<<< HEAD
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Auth/           # Authentication components
│   │   │   ├── Onboarding/     # User onboarding flow
│   │   │   ├── Pages/          # Main application pages
│   │   │   └── UI/             # Reusable UI components
│   │   ├── services/           # API integration & Supabase
│   │   ├── hooks/
│   │   │   └── useVideoGeneration.ts  # Video generation hook
│   │   ├── config/
│   │   │   └── voices.ts       # Arabic voice configuration
│   │   ├── styles/             # CSS styles
│   │   └── utils/              # Utility functions
│   ├── public/                 # Static assets
│   ├── vite.config.ts          # Vite configuration with proxy
│   ├── package.json            # Frontend dependencies
│   └── .env                    # Environment variables
├── utils/                       # Backend utilities
│   ├── supabase_client.py      # Database client
│   ├── gemini.py               # AI text generation
│   ├── image_gen.py            # Image generation
│   ├── voice_gen.py            # Voice synthesis
│   └── video_creation.py       # Video assembly
├── veo3/                        # Alternative Veo-3 implementation
├── outputs/                     # Generated videos
├── docs/                        # Documentation
├── server.py                    # FastAPI application
├── scheduler.py                 # Video scheduling system
├── requirements.txt             # Backend dependencies
├── start-dev.bat               # Development startup script
├── supabase-schema.sql          # Database schema
├── schema-extensions.sql        # Database extensions
├── schema-migration-platforms.sql # Multi-platform migration
├── PLATFORMS_MIGRATION_README.md # Migration guide
├── SETUP_GUIDE.md              # This setup guide
└── README.md                   # Project documentation
=======
├── server.py                 # FastAPI backend
├── requirements.txt          # Python dependencies
├── start-dev.bat            # Development startup script
├── SETUP_GUIDE.md           # This file
├── frontend/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts       # API client
│   │   ├── hooks/
│   │   │   └── useVideoGeneration.ts  # Video generation hook
│   │   ├── config/
│   │   │   └── voices.ts    # Arabic voice configuration
│   │   ├── components/
│   │   │   ├── HealthCheck.tsx       # Backend status
│   │   │   └── Pages/
│   │   │       └── VideoGenerator.tsx # Main generation UI
│   │   └── App.tsx          # Main app component
│   ├── vite.config.ts       # Vite configuration with proxy
│   ├── package.json         # Frontend dependencies
│   └── .env                 # Environment variables
└── utils/                   # Backend utilities
    ├── gemini.py           # AI text generation
    ├── image_gen.py        # Image generation
    ├── voice_gen.py        # Voice synthesis
    └── video_creation.py   # Video assembly
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
```

## Usage

<<<<<<< HEAD
### Getting Started
1. **Registration**: Create account at http://localhost:3000
2. **Onboarding**: Complete the interactive setup flow
3. **Channel Creation**: Set up your content channels with platform selection
4. **Video Generation**: Create videos with AI-powered content

### Creating Videos
1. Navigate to your dashboard
2. Select or create a channel
3. Enter video topic and preferences
4. Choose target platforms
5. Generate video with real-time progress tracking
6. Review and download completed videos

### Channel Management
- **Multi-Platform**: Select multiple platforms per channel
- **Content Optimization**: Platform-specific content generation
- **Scheduling**: Set up automated video generation
- **Analytics**: Track video performance and usage

### Monitoring
- **Real-time Updates**: Live progress during video generation
- **Error Handling**: Comprehensive error messages with solutions
- **Health Monitoring**: System status and connectivity indicators

## Troubleshooting

### Common Issues

#### Database Connection Failed
- **Symptom**: Authentication errors, data not loading
- **Solution**: 
  1. Verify Supabase URL and keys in .env files
  2. Check Supabase project status
  3. Ensure database schema is properly set up
  4. Verify Row Level Security policies

#### Video Generation Errors
- **Symptom**: Error messages during generation
- **Solution**:
  1. Check API keys (Gemini, ElevenLabs)
  2. Verify FFmpeg and ImageMagick installation
  3. Check available disk space
  4. Review backend logs for detailed errors

#### Platform Selection Issues
- **Symptom**: Invalid platform errors
- **Solution**:
  1. Ensure platforms migration has been run
  2. Check allowed platforms in database constraints
  3. Clear browser cache and reload

#### Frontend Build Issues
- **Symptom**: npm run dev fails
- **Solution**:
  1. Delete node_modules and package-lock.json
  2. Run npm install
  3. Check Node.js version (18+)
  4. Verify environment variables

=======
1. **Start the Application**: Use `start-dev.bat` or start servers manually
2. **Access Frontend**: Open http://localhost:3000
3. **Sign In**: Use the authentication system
4. **Create Video**: 
   - Navigate to "Create Video"
   - Select category and enter prompt
   - Choose Arabic voice and duration
   - Click "Generate Video"
   - Monitor real-time progress
5. **View Results**: Generated videos appear in the dashboard

## Troubleshooting

>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
### Backend Issues
- **Port 8000 in use**: Change port in `server.py` and update frontend `.env`
- **FFmpeg not found**: Ensure FFmpeg is installed and paths are correct
- **Python dependencies**: Run `pip install -r requirements.txt`

### Frontend Issues
- **Port 3000 in use**: Vite will automatically use next available port
- **API connection failed**: Check backend is running and health status
- **Proxy errors**: Verify Vite proxy configuration in `vite.config.ts`

### Common Solutions
- **CORS errors**: Backend includes CORS middleware for all origins
- **Connection timeout**: Check firewall settings
- **Generation fails**: Verify all API keys and external services

## Development

### Adding New Features
1. **Backend**: Add endpoints in `server.py`
2. **Frontend**: Update API client in `src/services/api.ts`
3. **UI**: Modify components in `src/components/`

### Testing
- Backend: Test endpoints at http://localhost:8000/docs
- Frontend: Use browser dev tools and network tab
- Health Check: Monitor connection status in UI

## Production Deployment

### Backend
- Use production ASGI server (uvicorn, gunicorn)
- Configure environment variables
- Set up reverse proxy (nginx)

### Frontend
- Build: `npm run build`
- Serve static files
- Update API base URL for production

## Support

For issues or questions:
1. Check the health status indicator
2. Review browser console for errors
3. Check backend logs
4. Verify all dependencies are installed

---

**Note**: This setup creates a fully functional SaaS application for automated Arabic video generation with real-time progress tracking and comprehensive error handling.