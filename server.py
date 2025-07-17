# server.py

# -------------------------------------------------------------------------------
# Video Generation API Server
# Automated video content creation with AI-powered text and voice generation
# Built with FastAPI, Gemini AI, and ElevenLabs TTS
# -------------------------------------------------------------------------------

import sys, os
import platform
import subprocess
import shutil
from pathlib import Path

# ───────────────────────────────────────────────────────────────────────────────
# 1) Setup for bundled binaries (ffmpeg & ImageMagick) with auto-installation
# ───────────────────────────────────────────────────────────────────────────────

def get_system_info():
    """Get system information"""
    system = platform.system().lower()
    architecture = platform.machine().lower()
    return system, architecture

def check_command_exists(command):
    """Check if a command exists in system PATH"""
    return shutil.which(command) is not None

def install_ffmpeg():
    """Install FFmpeg based on the operating system"""
    system, arch = get_system_info()
    print(f"Installing FFmpeg for {system} ({arch})...")
    
    try:
        if system == "windows":
            # For Windows, we'll use imageio-ffmpeg as a fallback
            print("Installing imageio-ffmpeg for Windows...")
            subprocess.run([sys.executable, "-m", "pip", "install", "imageio-ffmpeg"], check=True)
            print("FFmpeg installed via imageio-ffmpeg")
            
        elif system == "darwin":  # macOS
            if check_command_exists("brew"):
                subprocess.run(["brew", "install", "ffmpeg"], check=True)
                print("FFmpeg installed via Homebrew")
            else:
                print("Homebrew not found. Please install Homebrew first or install FFmpeg manually.")
                return False
                
        elif system == "linux":
            # Try different package managers
            if check_command_exists("apt-get"):
                subprocess.run(["sudo", "apt-get", "update"], check=True)
                subprocess.run(["sudo", "apt-get", "install", "-y", "ffmpeg"], check=True)
                print("FFmpeg installed via apt-get")
            elif check_command_exists("yum"):
                subprocess.run(["sudo", "yum", "install", "-y", "ffmpeg"], check=True)
                print("FFmpeg installed via yum")
            elif check_command_exists("dnf"):
                subprocess.run(["sudo", "dnf", "install", "-y", "ffmpeg"], check=True)
                print("FFmpeg installed via dnf")
            elif check_command_exists("pacman"):
                subprocess.run(["sudo", "pacman", "-S", "--noconfirm", "ffmpeg"], check=True)
                print("FFmpeg installed via pacman")
            else:
                print("No supported package manager found. Please install FFmpeg manually.")
                return False
        else:
            print(f"Unsupported operating system: {system}")
            return False
            
        return True
    except subprocess.CalledProcessError as e:
        print(f"Failed to install FFmpeg: {e}")
        return False
    except Exception as e:
        print(f"Error installing FFmpeg: {e}")
        return False

def install_imagemagick():
    """Install ImageMagick based on the operating system"""
    system, arch = get_system_info()
    print(f"Installing ImageMagick for {system} ({arch})...")
    
    try:
        if system == "windows":
            print("For Windows, please download ImageMagick from: https://imagemagick.org/script/download.php#windows")
            print("Or use chocolatey: choco install imagemagick")
            print("Or use winget: winget install ImageMagick.ImageMagick")
            return False  # Manual installation required
            
        elif system == "darwin":  # macOS
            if check_command_exists("brew"):
                subprocess.run(["brew", "install", "imagemagick"], check=True)
                print("ImageMagick installed via Homebrew")
                return True
            else:
                print("Homebrew not found. Please install Homebrew first or install ImageMagick manually.")
                return False
                
        elif system == "linux":
            # Try different package managers
            if check_command_exists("apt-get"):
                subprocess.run(["sudo", "apt-get", "update"], check=True)
                subprocess.run(["sudo", "apt-get", "install", "-y", "imagemagick"], check=True)
                print("ImageMagick installed via apt-get")
            elif check_command_exists("yum"):
                subprocess.run(["sudo", "yum", "install", "-y", "ImageMagick"], check=True)
                print("ImageMagick installed via yum")
            elif check_command_exists("dnf"):
                subprocess.run(["sudo", "dnf", "install", "-y", "ImageMagick"], check=True)
                print("ImageMagick installed via dnf")
            elif check_command_exists("pacman"):
                subprocess.run(["sudo", "pacman", "-S", "--noconfirm", "imagemagick"], check=True)
                print("ImageMagick installed via pacman")
            else:
                print("No supported package manager found. Please install ImageMagick manually.")
                return False
            return True
        else:
            print(f"Unsupported operating system: {system}")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"Failed to install ImageMagick: {e}")
        return False
    except Exception as e:
        print(f"Error installing ImageMagick: {e}")
        return False

# Try to find FFmpeg in common locations
def find_ffmpeg():
    possible_commands = ["ffmpeg", "ffmpeg.exe"]
    possible_paths = [
        "ffmpeg",  # System PATH
        "ffmpeg.exe",  # Current directory
        r"C:\ffmpeg\bin\ffmpeg.exe",  # Common installation
        "/usr/bin/ffmpeg",
        "/usr/local/bin/ffmpeg",
        "/opt/homebrew/bin/ffmpeg",
    ]
    
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        possible_paths.append(os.path.join(sys._MEIPASS, "ffmpeg", "ffmpeg.exe"))
    
    # Check system PATH first
    for cmd in possible_commands:
        ffmpeg_path = shutil.which(cmd)
        if ffmpeg_path:
            return ffmpeg_path
    
    # Check specific paths
    for path in possible_paths:
        if os.path.exists(path):
            try:
                subprocess.run([path, "-version"], capture_output=True, check=True)
                return path
            except (subprocess.CalledProcessError, FileNotFoundError, OSError):
                continue
    
    # If no FFmpeg found, use imageio-ffmpeg as fallback
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:
        pass
    
    return None

# Try to find ImageMagick
def find_imagemagick():
    possible_commands = ["magick", "magick.exe", "convert", "convert.exe"]
    possible_paths = [
        "magick",  # System PATH
        "magick.exe",  # Current directory
        "convert",
        "convert.exe",
        r"C:\Program Files\ImageMagick-7.1.1-Q16-HDRI\magick.exe",
        r"C:\Program Files\ImageMagick\magick.exe",
        "/usr/bin/magick",
        "/usr/local/bin/magick",
        "/opt/homebrew/bin/magick",
        "/usr/bin/convert",
        "/usr/local/bin/convert",
        "/opt/homebrew/bin/convert",
    ]
    
    if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
        possible_paths.append(os.path.join(sys._MEIPASS, "ImageMagick", "magick.exe"))
    
    # Check system PATH first
    for cmd in possible_commands:
        path = shutil.which(cmd)
        if path:
            return path
    
    # Check specific paths
    for path in possible_paths:
        if os.path.exists(path):
            try:
                subprocess.run([path, "-version"], capture_output=True, check=True)
                return path
            except (subprocess.CalledProcessError, FileNotFoundError, OSError):
                continue
    
    return None

def setup_dependencies():
    """Setup FFmpeg and ImageMagick dependencies with auto-installation"""
    system, arch = get_system_info()
    print(f"Setting up dependencies for {system} ({arch})...")
    
    # Check and install FFmpeg
    ffmpeg_path = find_ffmpeg()
    if not ffmpeg_path:
        print("FFmpeg not found. Attempting to install...")
        if install_ffmpeg():
            ffmpeg_path = find_ffmpeg()
        else:
            print("Failed to install FFmpeg automatically.")
            # Try imageio-ffmpeg as fallback
            try:
                import imageio_ffmpeg
                ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
                print("Using imageio-ffmpeg as fallback")
            except ImportError:
                print("Installing imageio-ffmpeg as fallback...")
                try:
                    subprocess.run([sys.executable, "-m", "pip", "install", "imageio-ffmpeg"], check=True)
                    import imageio_ffmpeg
                    ffmpeg_path = imageio_ffmpeg.get_ffmpeg_exe()
                    print("Successfully installed and configured imageio-ffmpeg")
                except Exception as e:
                    print(f"Failed to install imageio-ffmpeg: {e}")
                    ffmpeg_path = "ffmpeg"  # Last resort fallback
    
    # Check and install ImageMagick
    imagemagick_path = find_imagemagick()
    if not imagemagick_path:
        print("ImageMagick not found. Attempting to install...")
        if not install_imagemagick():
            print("Failed to install ImageMagick automatically.")
            if system == "windows":
                print("Please install ImageMagick manually from: https://imagemagick.org/script/download.php#windows")
            imagemagick_path = "convert"  # Fallback
    
    return ffmpeg_path, imagemagick_path

# Setup dependencies with auto-installation
ffmpeg_path, imagemagick_path = setup_dependencies()

os.environ["FFMPEG_BINARY"] = ffmpeg_path or "ffmpeg"

# Test ImageMagick availability
imagemagick_available = False
if imagemagick_path:
    try:
        result = subprocess.run([imagemagick_path, "-version"], capture_output=True, check=True, timeout=10)
        os.environ["IMAGEMAGICK_BINARY"] = imagemagick_path
        imagemagick_available = True
        print(f"Using ImageMagick: {imagemagick_path}")
    except (subprocess.CalledProcessError, FileNotFoundError, OSError, subprocess.TimeoutExpired):
        print("ImageMagick not working properly - some features may be limited")

if not imagemagick_available:
    # Set a dummy path to prevent MoviePy from failing
    os.environ["IMAGEMAGICK_BINARY"] = "convert"  # Fallback that MoviePy can handle
    print("ImageMagick not available - using fallback")

print(f"Using FFmpeg: {ffmpeg_path or 'ffmpeg'}")

# ───────────────────────────────────────────────────────────────────────────────
# 2) Ensure outputs folders exist (images and audio)
# ───────────────────────────────────────────────────────────────────────────────
out_base = os.path.join(os.getcwd(), "outputs")
os.makedirs(out_base, exist_ok=True)
for sub in ("images", "audio"):
    os.makedirs(os.path.join(out_base, sub), exist_ok=True)
    
import threading
import asyncio

from fastapi import FastAPI, Request, HTTPException, Query, Depends, status

from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, time as dt_time


# Pydantic models for API requests
class VideoGenerationRequest(BaseModel):
    prompt: str
    voice: str = "haitham"
    duration: int = 60
    title: Optional[str] = None
    description: Optional[str] = None

class ScheduledVideoRequest(BaseModel):
    channel_id: str
    title_template: Optional[str] = None
    prompt_template: str
    schedule_type: str  # 'daily', 'weekly', 'monthly', 'custom'
    schedule_time: str  # HH:MM format
    schedule_days: Optional[List[int]] = [1,2,3,4,5]  # 1=Monday, 7=Sunday
    is_active: bool = True
    auto_publish: bool = False
    max_executions: Optional[int] = None

class ScheduledVideoUpdate(BaseModel):
    title_template: Optional[str] = None
    prompt_template: Optional[str] = None
    schedule_type: Optional[str] = None
    schedule_time: Optional[str] = None
    schedule_days: Optional[List[int]] = None
    is_active: Optional[bool] = None
    auto_publish: Optional[bool] = None
    max_executions: Optional[int] = None


import time
from utils.gemini import query
from utils.write_script import write_content, split_text_to_lines
from utils.image_gen import image_main
from utils.voice_gen import voice_main
from utils.video_creation import video_main

# Import scheduling system
from scheduler import video_scheduler
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


# ───────────────────────────────────────────────────────────────────────────────
# ───────────────────────────────────────────────────────────────────────────────
BASE = getattr(sys, "_MEIPASS", os.getcwd())

# ───────────────────────────────────────────────────────────────────────────────
# FastAPI Setup
# ───────────────────────────────────────────────────────────────────────────────
app = FastAPI(title="Vidzyme - AI Video Generator")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static files (css, images, ...)
app.mount(
    "/static",
    StaticFiles(directory=os.path.join(BASE, "static")),
    name="static"
)

# Serve generated videos
app.mount(
    "/outputs",
    StaticFiles(directory=os.path.join(BASE, "outputs")),
    name="outputs"
)

# Setup Jinja2 templates
templates = Jinja2Templates(directory=os.path.join(BASE, "templates"))

# Available voice mapping
VOICE_MAPPING = {
    "james": "UR972wNGq3zluze0LoIp",
    "david": "QRq5hPRAKf5ZhSlTBH6r",
    "sarah": "jAAHNNqlbAX9iWjJPEtE",
    "michael": "rPNcQ53R703tTmtue1AT",
    "emma": "qi4PkV9c01kb869Vh7Su"
}

# Initialize scheduler on startup
@app.on_event("startup")
async def startup_event():
    await video_scheduler.initialize()
    await video_scheduler.start()

@app.on_event("shutdown")
async def shutdown_event():
    await video_scheduler.stop()


# SSE connection queue for real-time updates
listeners: list[asyncio.Queue] = []


# ───────────────────────────────────────────────────────────────────────────────
# SSE ― Server-Sent Events endpoint
# ───────────────────────────────────────────────────────────────────────────────
@app.get("/stream")
def stream():
    async def event_generator():
        q: asyncio.Queue = asyncio.Queue()
        listeners.append(q)
        try:
            while True:
                msg = await q.get()
                yield f"data: {msg}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            if q in listeners:
                listeners.remove(q)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


def broadcast(message: str):
    """Send message to all SSE listeners."""
    for q in listeners:
        try:
            q.put_nowait(message)
        except:
            pass


def broadcast_progress(step: str, progress: int, message: str, details: str = None):
    """Send structured progress update to all SSE listeners."""
    import json
    progress_data = {
        "step": step,
        "progress": progress,
        "message": message,
        "timestamp": time.time()
    }
    if details:
        progress_data["details"] = details
    
    broadcast(json.dumps(progress_data))


# ───────────────────────────────────────────────────────────────────────────────
# Home page (display interface)
# ───────────────────────────────────────────────────────────────────────────────
@app.get("/")
async def get_form(request: Request):
    return templates.TemplateResponse("index.html", {
        "request": request,
        "voice_options": list(VOICE_MAPPING.keys())
    })


@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend is running"}


@app.get("/video-preview")
async def get_video_preview():
    """Check if generated video exists and return preview information"""
    video_path = os.path.join(BASE, "outputs", "youtube_short.mp4")
    
    if os.path.exists(video_path):
        # Get file size and creation time
        file_stats = os.stat(video_path)
        file_size = file_stats.st_size
        creation_time = datetime.fromtimestamp(file_stats.st_mtime)
        
        return {
            "exists": True,
            "video_url": "/outputs/youtube_short.mp4",
            "file_size": file_size,
            "created_at": creation_time.isoformat(),
            "file_size_mb": round(file_size / (1024 * 1024), 2)
        }
    else:
        return {
            "exists": False,
            "message": "No video has been generated yet"
        }


# ───────────────────────────────────────────────────────────────────────────────
# FILE MANAGEMENT API ENDPOINTS
# ───────────────────────────────────────────────────────────────────────────────

@app.get("/api/videos")
async def list_videos():
    """List all generated videos with metadata"""
    try:
        from utils.file_manager import get_file_manager
        file_manager = get_file_manager()
        videos = file_manager.list_videos()
        return {"success": True, "videos": videos}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing videos: {str(e)}")


@app.get("/api/videos/{video_id}")
async def get_video_details(video_id: str):
    """Get detailed information about a specific video"""
    try:
        from utils.file_manager import get_file_manager
        file_manager = get_file_manager()
        video_metadata = file_manager.get_video_metadata(video_id)
        
        if not video_metadata:
            raise HTTPException(status_code=404, detail="Video not found")
            
        return {"success": True, "video": video_metadata}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting video details: {str(e)}")


@app.delete("/api/videos/{video_id}")
async def delete_video(video_id: str):
    """Delete a specific video and its metadata"""
    try:
        from utils.file_manager import get_file_manager
        file_manager = get_file_manager()
        success = file_manager.delete_video(video_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Video not found")
            
        return {"success": True, "message": "Video deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting video: {str(e)}")


@app.get("/api/storage/stats")
async def get_storage_stats():
    """Get storage statistics and usage information"""
    try:
        from utils.file_manager import get_file_manager
        file_manager = get_file_manager()
        stats = file_manager.get_storage_stats()
        return {"success": True, "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting storage stats: {str(e)}")


@app.post("/api/storage/cleanup")
async def trigger_cleanup():
    """Manually trigger storage cleanup"""
    try:
        from utils.file_manager import get_file_manager
        file_manager = get_file_manager()
        cleanup_result = file_manager.cleanup_old_videos()
        return {"success": True, "cleanup_result": cleanup_result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during cleanup: {str(e)}")


@app.post("/api/videos/{video_id}/compress")
async def compress_video(video_id: str):
    """Compress a specific video to save space"""
    try:
        from utils.file_manager import get_file_manager
        file_manager = get_file_manager()
        result = file_manager.compress_video(video_id)
        
        if not result["success"]:
            raise HTTPException(status_code=404, detail="Video not found or compression failed")
            
        return {"success": True, "compression_result": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error compressing video: {str(e)}")


@app.get("/api/videos/latest")
async def get_latest_video():
    """Get the most recently generated video"""
    try:
        from utils.file_manager import get_file_manager
        file_manager = get_file_manager()
        videos = file_manager.list_videos()
        
        if not videos:
            return {"success": False, "message": "No videos found"}
            
        # Sort by creation time and get the latest
        latest_video = max(videos, key=lambda x: x["creation_time"])
        return {"success": True, "video": latest_video}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting latest video: {str(e)}")


# ───────────────────────────────────────────────────────────────────────────────
# Video generation endpoint (GET)
# ───────────────────────────────────────────────────────────────────────────────
@app.get("/generate")
async def generate_shorts(
    topic: str = Query(..., description="Video topic"),
    voice_name: str = Query(..., description="Voice name")
):
    topic = topic.strip()
    if not topic:
        raise HTTPException(status_code=400, detail="topic cannot be empty")
    if voice_name not in VOICE_MAPPING:
        raise HTTPException(status_code=400, detail="invalid voice_name")

    voice_id = VOICE_MAPPING[voice_name]
    threading.Thread(
        target=run_pipeline,
        args=(topic, voice_id),
        daemon=True
    ).start()

    broadcast(f"▶️ Starting video creation for topic: '{topic}' with voice '{voice_name}'.")
    return {"status": "started"}


# ───────────────────────────────────────────────────────────────────────────────
# Video generation endpoint (POST)
# ───────────────────────────────────────────────────────────────────────────────
@app.post("/generate")
async def generate_shorts_post(request: VideoGenerationRequest):
    topic = request.prompt.strip()
    voice_name = request.voice
    
    if not topic:
        raise HTTPException(status_code=400, detail="prompt cannot be empty")
    if voice_name not in VOICE_MAPPING:
        raise HTTPException(status_code=400, detail="invalid voice_name")

    voice_id = VOICE_MAPPING[voice_name]
    threading.Thread(
        target=run_pipeline,
        args=(topic, voice_id),
        daemon=True
    ).start()

    broadcast(f"▶️ Starting video creation for topic: '{topic}' with voice '{voice_name}'.")
    return {"status": "started", "message": "Video generation started"}


# ───────────────────────────────────────────────────────────────────────────────
# Pipeline function with message broadcasting for each stage
# ───────────────────────────────────────────────────────────────────────────────
def run_pipeline(topic: str, voice_id: str):
    try:
        from utils.write_script import write_content, split_text_to_lines
        from utils.image_gen import image_main
        from utils.voice_gen import voice_main
        from utils.video_creation import video_main
        
        broadcast_progress("initializing", 0, "Starting video generation...", "Preparing pipeline")
        
        # Generate title (5% progress)
        broadcast_progress("title", 5, "Generating title...", "Creating engaging title for your video")
        raw = query(
            f"Give me 5 YouTube Shorts titles related to the topic '{topic}' separated by commas"
        )["candidates"][0]["content"]["parts"][0]["text"]
        title = [t.strip() for t in raw.replace("،", ",").split(",") if t.strip()][0]
        broadcast_progress("title", 15, "Title generated successfully", f"Title: {title[:50]}...")

        # Generate content (15-35% progress)
        broadcast_progress("script", 20, "Generating content...", "Creating script based on your topic")
        content = query(
            f"Explain this topic '{title}' briefly in one minute without instructions."
        )["candidates"][0]["content"]["parts"][0]["text"]
        broadcast_progress("script", 35, "Script generated successfully", f"Generated {len(content.split())} words")

        # Save content and split into lines (35-40% progress)
        broadcast_progress("script", 38, "Saving content and splitting into lines...", "Preparing script for processing")
        write_content(content)
        split_text_to_lines()
        broadcast_progress("script", 40, "Script saved successfully", "Saved line_by_line.txt")

        # Generate images (40-60% progress)
        broadcast_progress("images", 45, "Generating images...", "Creating visual content for your video")
        
        def image_progress_callback(message, progress=None):
            if progress is not None:
                broadcast_progress("images", progress, message, "Creating visual content for your video")
            else:
                broadcast_progress("images", 45, message, "Creating visual content for your video")
        
        image_main(progress_callback=image_progress_callback)
        broadcast_progress("images", 60, "Images generated successfully", "Visual content ready")

        # Generate voice (60-80% progress)
        broadcast_progress("voice", 65, "Generating voice...", "Converting text to speech")
        
        def voice_progress_callback(message, progress=None):
            if progress is not None:
                broadcast_progress("voice", progress, message, "Converting text to speech")
            else:
                broadcast_progress("voice", 65, message, "Converting text to speech")
        
        voice_main(voice_id, progress_callback=voice_progress_callback)
        broadcast_progress("voice", 80, "Voice generated successfully", "Audio narration ready")

        # Create video (80-100% progress)
        broadcast_progress("video", 85, "Creating video...", "Combining images, voice, and effects")
        
        def video_progress_callback(message, progress=None):
            if progress is not None:
                broadcast_progress("video", progress, message, "Combining images, voice, and effects")
            else:
                broadcast_progress("video", 85, message, "Combining images, voice, and effects")
        
        # Pass prompt and voice parameters to video_main for metadata tracking
        video_info = video_main(
            prompt=topic,
            voice=voice_id,
            progress_callback=video_progress_callback
        )
        broadcast_progress("video", 95, "Finalizing video...", "Adding final touches")
        
        # Check if video was created successfully and broadcast completion with preview info
        if video_info and video_info.get("success"):
            completion_message = {
                "message": "✅ Video generation completed!",
                "video_url": f"/outputs/{video_info['filename']}",
                "file_size_mb": video_info['file_size_mb'],
                "preview_available": True,
                "video_id": video_info['video_id'],
                "creation_time": video_info['creation_time']
            }
            broadcast_progress("completed", 100, "✅ Video generation completed!", 
                             f"Video ready for preview ({video_info['file_size_mb']} MB)")
            # Send additional completion data
            import json
            broadcast(json.dumps({
                "step": "video_ready",
                "progress": 100,
                "video_data": completion_message,
                "timestamp": time.time()
            }))
        else:
            # Fallback to legacy path check
            video_path = os.path.join(BASE, "outputs", "youtube_short.mp4")
            if os.path.exists(video_path):
                file_stats = os.stat(video_path)
                file_size_mb = round(file_stats.st_size / (1024 * 1024), 2)
                completion_message = {
                    "message": "✅ Video generation completed!",
                    "video_url": "/outputs/youtube_short.mp4",
                    "file_size_mb": file_size_mb,
                    "preview_available": True
                }
                broadcast_progress("completed", 100, "✅ Video generation completed!", f"Video ready for preview ({file_size_mb} MB)")
                import json
                broadcast(json.dumps({
                    "step": "video_ready",
                    "progress": 100,
                    "video_data": completion_message,
                    "timestamp": time.time()
                }))
            else:
                broadcast_progress("completed", 100, "✅ Video generation completed!", "Video generation finished")

    except Exception as e:
        broadcast_progress("error", 0, f"❌ Error during processing: {e}", "Video generation failed")


# ───────────────────────────────────────────────────────────────────────────────
# SCHEDULED VIDEOS API ENDPOINTS
# ───────────────────────────────────────────────────────────────────────────────

@app.post("/api/scheduled-videos")
async def create_scheduled_video(request: ScheduledVideoRequest):
    """Create a new scheduled video"""
    try:
        # Insert into database
        result = supabase.table("scheduled_videos").insert({
            "channel_id": request.channel_id,
            "title_template": request.title_template,
            "prompt_template": request.prompt_template,
            "schedule_type": request.schedule_type,
            "schedule_time": request.schedule_time,
            "schedule_days": request.schedule_days,
            "is_active": request.is_active,
            "auto_publish": request.auto_publish,
            "max_executions": request.max_executions
        }).execute()
        
        if result.data:
            scheduled_video = result.data[0]
            # Add to scheduler
            video_scheduler.add_scheduled_video(scheduled_video)
            return {"success": True, "data": scheduled_video}
        else:
            raise HTTPException(status_code=400, detail="Failed to create scheduled video")
            
    except Exception as e:
        print(f"Error creating scheduled video: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scheduled-videos")
async def get_scheduled_videos(channel_id: Optional[str] = Query(None)):
    """Get all scheduled videos, optionally filtered by channel_id"""
    try:
        query = supabase.table("scheduled_videos").select("*")
        
        if channel_id:
            query = query.eq("channel_id", channel_id)
            
        result = query.execute()
        return {"success": True, "data": result.data}
        
    except Exception as e:
        print(f"Error fetching scheduled videos: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/scheduled-videos/{video_id}")
async def get_scheduled_video(video_id: str):
    """Get a specific scheduled video by ID"""
    try:
        result = supabase.table("scheduled_videos").select("*").eq("id", video_id).execute()
        
        if result.data:
            return {"success": True, "data": result.data[0]}
        else:
            raise HTTPException(status_code=404, detail="Scheduled video not found")
            
    except Exception as e:
        print(f"Error fetching scheduled video: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/scheduled-videos/{video_id}")
async def update_scheduled_video(video_id: str, request: ScheduledVideoUpdate):
    """Update a scheduled video"""
    try:
        # Prepare update data (only include non-None values)
        update_data = {k: v for k, v in request.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")
            
        result = supabase.table("scheduled_videos").update(update_data).eq("id", video_id).execute()
        
        if result.data:
            updated_video = result.data[0]
            # Update in scheduler
            video_scheduler.update_scheduled_video(updated_video)
            return {"success": True, "data": updated_video}
        else:
            raise HTTPException(status_code=404, detail="Scheduled video not found")
            
    except Exception as e:
        print(f"Error updating scheduled video: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/scheduled-videos/{video_id}")
async def delete_scheduled_video(video_id: str):
    """Delete a scheduled video"""
    try:
        result = supabase.table("scheduled_videos").delete().eq("id", video_id).execute()
        
        if result.data:
            # Remove from scheduler
            video_scheduler.remove_scheduled_video(video_id)
            return {"success": True, "message": "Scheduled video deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Scheduled video not found")
            
    except Exception as e:
        print(f"Error deleting scheduled video: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/scheduled-videos/{video_id}/toggle")
async def toggle_scheduled_video(video_id: str):
    """Toggle the active status of a scheduled video"""
    try:
        # Get current status
        result = supabase.table("scheduled_videos").select("is_active").eq("id", video_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Scheduled video not found")
            
        current_status = result.data[0]["is_active"]
        new_status = not current_status
        
        # Update status
        update_result = supabase.table("scheduled_videos").update({"is_active": new_status}).eq("id", video_id).execute()
        
        if update_result.data:
            updated_video = update_result.data[0]
            # Update in scheduler
            video_scheduler.update_scheduled_video(updated_video)
            return {"success": True, "data": updated_video}
        else:
            raise HTTPException(status_code=400, detail="Failed to toggle scheduled video")
            
    except Exception as e:
        print(f"Error toggling scheduled video: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/video-queue")
async def get_video_queue(channel_id: Optional[str] = Query(None)):
    """Get video queue items"""
    try:
        query = supabase.table("video_queue").select("*").order("created_at", desc=False)
        
        if channel_id:
            query = query.eq("channel_id", channel_id)
            
        result = query.execute()
        return {"success": True, "data": result.data}
        
    except Exception as e:
        print(f"Error fetching video queue: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/video-queue/{queue_id}")
async def delete_queue_item(queue_id: str):
    """Delete a video queue item"""
    try:
        result = supabase.table("video_queue").delete().eq("id", queue_id).execute()
        
        if result.data:
            return {"success": True, "message": "Queue item deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Queue item not found")
            
    except Exception as e:
        print(f"Error deleting queue item: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ───────────────────────────────────────────────────────────────────────────────

# Application entry point (for running exe without auto-reload)
# ───────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
