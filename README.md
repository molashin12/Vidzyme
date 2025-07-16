# Vidzyme - AI Video Generation Platform

Vidzyme is a comprehensive AI-powered video generation platform that enables users to create engaging videos automatically with scheduled generation capabilities and seamless channel management.

## Features

### 🎥 Video Generation
- AI-powered video creation with customizable prompts
- Multiple video formats and styles
- Real-time video processing status
- Video history and management

### 📅 Scheduled Video Generation
- Automated video generation on custom schedules (daily, weekly, monthly)
- Multiple scheduling options with flexible timing
- Channel-specific content generation
- Queue management for video processing

### 🎯 User Onboarding
- Interactive onboarding flow for new users
- Channel setup and content description capture
- Personalized experience based on user preferences
- Skip option for experienced users

### ⚙️ Channel Management
- Create and manage multiple content channels
- Edit channel information and content descriptions
- Content categorization and target audience settings
- Channel-specific video generation

<<<<<<< HEAD
### 🔗 Multi-Platform Support
- Support for multiple platforms per channel (YouTube, Instagram, TikTok, LinkedIn, and more)
- Select multiple platforms during onboarding for unified content creation
- Platform-specific content optimization and formatting
- Seamless video publishing across selected platforms
=======
### 🔗 Social Media Integration
- Connect YouTube, Instagram, TikTok, and LinkedIn accounts
- Seamless video publishing across platforms
- Account management and disconnection options
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130

### 💳 Subscription Management
- Multiple subscription tiers (Free, Pro, Enterprise)
- Usage tracking and credit system
- Billing management and payment methods
- Real-time usage analytics

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Custom hooks** for state management

### Backend
- **Supabase** for database and authentication
- **Row Level Security (RLS)** for data protection
- **Real-time subscriptions** for live updates
- **PostgreSQL** with custom functions and triggers

### Database Schema
- Users and user profiles
- Video management and history
- Channel management
- Scheduled video generation
- Video queue processing
- Subscription and usage tracking
- User onboarding status

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Git for version control

---

## 🚀 Project Overview

**AI Video Generator** is a FastAPI-based pipeline that:
1. Uses **Google Gemini** (via `gemini_secret.txt`) to write a video script.
2. Splits the script into lines and generates AI images (Pollinations).( you can use any other image or video generation api )
3. Translates prompts via `googletrans` if needed.
4. Generates voice-overs with **ElevenLabs TTS** (`voice_secret.txt`).
5. Assembles images or videos, audio, and captions into a short video with **MoviePy**, **FFmpeg**, and **ImageMagick**.
6. Streams real-time progress via Server-Sent Events (SSE).

Ideal for automating quick YouTube Shorts,videos or social media clips on any topic.

---

## 📋 Features

- **Automated Script Writing** with Google Gemini  
- **Image and video Generation** for each caption segment  
- **High-Quality TTS** from ElevenLabs  
- **Dynamic Video Composition** (MoviePy + FFmpeg + ImageMagick)  
- **Live Progress Updates** through SSE endpoint  
- **Modular Codebase** for easy customization  

---

## ⚙️ Prerequisites

### 1. System Dependencies

- **FFmpeg**  
  - **Windows**: Download installer from [ffmpeg.org](https://ffmpeg.org/download.html) → Add `ffmpeg.exe` to your `PATH`.  
  - **macOS**:  
    ```bash
    brew install ffmpeg
    ```
  - **Ubuntu/Debian Linux**:  
    ```bash
    sudo apt update
    sudo apt install ffmpeg
    ```

- **ImageMagick**  
  - **Windows**: Download from https://imagemagick.org → Add `magick.exe` to your `PATH`.  
  - **macOS**:  
    ```bash
    brew install imagemagick
    ```
  - **Ubuntu/Debian Linux**:  
    ```bash
    sudo apt update
    sudo apt install imagemagick
    ```

### 2. Python 3.9+

Ensure you have **Python 3.9** or newer installed.

### 3. API Keys

Create two text files in the project root (they are ignored by `.gitignore`):

- `gemini_secret.txt`  
  - Your Google Gemini API key.

- `voice_secret.txt`  
  - Your ElevenLabs API key.

---

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/molashin12/Vidzyme.git
   cd Vidzyme
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
<<<<<<< HEAD
=======
   cd backend
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   
   Create `.env` files in both frontend and backend directories:
   
   **Frontend (.env)**
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
<<<<<<< HEAD
   **Backend (.env in root directory)**
=======
   **Backend (.env)**
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   OPENAI_API_KEY=your_openai_api_key
   ```

5. **Set up the database**
   
   Run the SQL scripts in your Supabase SQL editor:
   ```bash
   # First, run the main schema
   cat supabase-schema.sql | supabase db reset
   
   # Then, run the extensions for new features
   cat schema-extensions.sql | supabase db reset
<<<<<<< HEAD
   
   # Finally, run the platforms migration for multi-platform support
   cat schema-migration-platforms.sql | supabase db reset
=======
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
   ```

6. **Start the development servers**
   
   **Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   
   **Backend**
   ```bash
<<<<<<< HEAD
=======
   cd backend
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
   python server.py
   ```

### Development

The application will be available at:
- Frontend: `http://localhost:3000` (or next available port)
- Backend API: `http://localhost:8000`

---

## ▶️ Running the Server

### Production Mode (Compiled Executable)
```bash
# Run the compiled executable
.\server.exe
```

### Development Mode
```bash
# Start the FastAPI application in development
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

* Open your browser to **[http://127.0.0.1:8000](http://127.0.0.1:8000)**.
* Enter a **topic** and select a **voice**.
* Watch real-time progress and download your generated video when it completes.

### Alternative Implementation (Veo-3)
The project includes an alternative implementation using Google Veo-3 model:
* Configure `veo3/REPLICATE_API_TOKEN.txt` with your Replicate API token
* Use the Veo-3 modules for direct video generation instead of image-based assembly

---

## Project Structure

```
Vidzyme/
<<<<<<< HEAD
├── frontend/                    # React frontend application
=======
├── frontend/
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/          # Header, Footer, Navigation
│   │   │   ├── Pages/           # Main application pages
│   │   │   ├── Onboarding/      # User onboarding flow
│   │   │   ├── ScheduledVideos/ # Scheduled video management
<<<<<<< HEAD
│   │   │   ├── Auth/            # Authentication components
│   │   │   └── UI/              # Reusable UI components
=======
│   │   │   └── Auth/            # Authentication components
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API and database services
│   │   ├── contexts/            # React context providers
│   │   └── config/              # Configuration files
│   ├── public/                  # Static assets
│   └── package.json
<<<<<<< HEAD
├── utils/                       # Backend utility functions
│   ├── gemini.py               # Google Gemini integration
│   ├── image_gen.py            # Image generation
│   ├── video_creation.py       # Video assembly
│   ├── voice_gen.py            # Voice generation
│   └── write_script.py         # Script writing
├── veo3/                       # Alternative Veo-3 implementation
├── outputs/                    # Generated content storage
│   ├── audio/                  # Generated audio files
│   └── images/                 # Generated images
├── docs/                       # Documentation
├── server.py                   # Main FastAPI server
├── scheduler.py                # Video scheduling system
├── requirements.txt            # Python dependencies
├── supabase-schema.sql         # Main database schema
├── schema-extensions.sql       # Extended schema for new features
├── schema-migration-platforms.sql # Multi-platform migration
├── PLATFORMS_MIGRATION_README.md  # Migration guide
=======
├── backend/
│   ├── services/                # Backend services
│   ├── models/                  # Data models
│   ├── routes/                  # API routes
│   ├── utils/                   # Utility functions
│   ├── server.py               # Main server file
│   └── requirements.txt
├── supabase-schema.sql         # Main database schema
├── schema-extensions.sql       # Extended schema for new features
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
└── README.md
```

## Key Features Implementation

<<<<<<< HEAD
### Multi-Platform Support
- Select multiple platforms (YouTube, Instagram, TikTok, LinkedIn, Other) during onboarding
- Store all selected platforms in a single channel record
- Backward compatibility with existing single-platform channels
- Platform-specific content optimization and formatting
- Unified content creation workflow across platforms

### Onboarding Flow
- Multi-step form for new user setup
- Channel information collection with multi-platform selection
=======
### Onboarding Flow
- Multi-step form for new user setup
- Channel information collection
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
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
<<<<<<< HEAD
- Multi-platform selection and management
=======
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
- Content description and categorization
- Target audience specification
- Integration with scheduled video generation

## API Endpoints

### Video Management
- `POST /api/videos` - Create new video
- `GET /api/videos` - Get user videos
- `GET /api/videos/:id` - Get specific video
- `PUT /api/videos/:id` - Update video
- `DELETE /api/videos/:id` - Delete video

### Channel Management
- `POST /api/channels` - Create channel
- `GET /api/channels` - Get user channels
- `PUT /api/channels/:id` - Update channel
- `DELETE /api/channels/:id` - Delete channel

### Scheduled Videos
- `POST /api/scheduled-videos` - Create schedule
- `GET /api/scheduled-videos` - Get user schedules
- `PUT /api/scheduled-videos/:id` - Update schedule
- `DELETE /api/scheduled-videos/:id` - Delete schedule

## Database Schema

### Core Tables
- `users` - User authentication and basic info
- `user_profiles` - Extended user information
- `videos` - Video records and metadata
- `subscriptions` - User subscription plans
- `usage` - Usage tracking and analytics

### New Feature Tables
<<<<<<< HEAD
- `user_channels` - Channel management with multi-platform support
=======
- `user_channels` - Channel management
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
- `scheduled_videos` - Automated video schedules
- `video_queue` - Video processing queue
- `user_onboarding` - Onboarding progress tracking

<<<<<<< HEAD
### Recent Updates
- **Multi-Platform Migration**: Added `platforms` array column to `user_channels` table
- **Platform Constraints**: Enforced valid platform values (youtube, instagram, tiktok, linkedin, other)
- **Backward Compatibility**: Automatic sync between `platforms` array and legacy `channel_type` field
- **Performance Optimization**: Added GIN index for efficient platform array queries

=======
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@vidzyme.com or join our Discord community.

## Roadmap

- [ ] Advanced AI video customization
- [ ] More social media platform integrations
- [ ] Team collaboration features
- [ ] Advanced analytics and reporting
- [ ] Mobile application
- [ ] API for third-party integrations

---

**Vidzyme** - Transforming content creation with AI-powered video generation.

```
```
