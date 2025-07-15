# Vidzyme - Frontend-Backend Integration Setup Guide

## Overview
This guide will help you set up and run the complete Vidzyme SaaS application with the React frontend connected to the FastAPI backend for automated video generation.

## Prerequisites

### Backend Requirements
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

# Install Python dependencies
pip install -r requirements.txt

# Start the FastAPI server
python server.py
```
Backend will be available at: http://localhost:8000

#### 2. Frontend Setup
```bash
# Navigate to frontend directory
cd d:\CODING\Vidzyme\frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
Frontend will be available at: http://localhost:3000

## Configuration

### Environment Variables
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

### API Endpoints
- `GET /`: Welcome message
- `GET /health`: Health check
- `POST /generate`: Video generation
- `GET /stream`: Real-time progress updates
- `GET /static/*`: Generated video files

## File Structure
```
Vidzyme/
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
```

## Usage

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