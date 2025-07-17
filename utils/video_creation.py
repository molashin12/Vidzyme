import os
import sys
from PIL import Image as PilImage
# Compatibility shim: make ANTIALIAS an alias for Resampling.LANCZOS if needed
if not hasattr(PilImage, "ANTIALIAS"):
    PilImage.ANTIALIAS = PilImage.Resampling.LANCZOS

from moviepy.editor import (
    ImageClip,
    AudioFileClip,
    CompositeVideoClip,
    concatenate_videoclips,
    TextClip,
    ColorClip,
    vfx
)
from datetime import datetime
from .file_manager import get_file_manager, VideoMetadata

# External font path (font.ttf) in outputs directory
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # Get project root
font_path = os.path.join(BASE, "outputs", "font.ttf")
font = font_path  # Can also use font name if installed

def zoom_in_image(t):
    return 1.5 + (0.1 * t)

def create_text(text, duration):
    """
    Create text with automatic wrapping based on specified width.
    """
    text_clip = (
        TextClip(
            txt=text,
            fontsize=80,
            color="white",
            font=font,
            method="caption",
            size=(1000, None),
            align="center"
        )
        .set_duration(duration)
        .set_position(("center", 1450))
    )
    return text_clip

def create_image_clip(image_path, duration):
    """
    Create image clip with continuous zoom effect.
    """
    image_clip = (
        ImageClip(image_path)
        .resize(width=1280)  # Now uses ANTIALIAS behind the scenes
        .set_duration(duration + 0.5)
        .set_position(("center", "center"))
    )
    image_clip = image_clip.fx(vfx.resize, zoom_in_image)
    return image_clip

def video_main(progress_callback=None, prompt: str = "Generated Video", voice: str = "default"):
    """
    Enhanced video creation with production-ready file management
    
    Args:
        progress_callback: Function to report progress
        prompt: Original prompt used for video generation
        voice: Voice used for audio generation
    """
    file_manager = get_file_manager()
    
    if progress_callback:
        progress_callback("Starting video creation process")
    
    # Read text split line by line
    with open("./outputs/line_by_line.txt", "r", encoding="utf-8") as f:
        content = f.read().split("\n")

    clips = []
    part = 0
    total_parts = len([text for text in content if text.strip() != ""])
    total_duration = 0
    
    if progress_callback:
        progress_callback(f"Processing {total_parts} video clips")
    
    for text in content:
        if text.strip() == "":
            break

        if progress_callback:
            current_progress = 80 + int((part / total_parts) * 15)  # 80-95% range
            progress_callback(f"Creating clip {part+1}/{total_parts}: {text[:30]}...", current_progress)

        mp3_path = f'./outputs/audio/part{part}.mp3'
        wav_path = f'./outputs/audio/part{part}.wav'

        try:
            # Select audio file if exists
            if os.path.exists(mp3_path):
                audioclip = AudioFileClip(mp3_path)
                duration = audioclip.duration
            elif os.path.exists(wav_path):
                audioclip = AudioFileClip(wav_path)
                duration = audioclip.duration
            else:
                print(f"Warning: Audio file not found for part{part}. Using silent audio for 5 seconds.")
                duration = 5
                from moviepy.editor import AudioClip
                audioclip = AudioClip(lambda t: 0, duration=duration)

            total_duration += duration

            # Select image if exists
            image_file = f"./outputs/images/part{part}.jpg"
            if os.path.exists(image_file):
                image_clip = create_image_clip(image_file, duration)
            else:
                print(f"Warning: Image not found for part{part}. Using black background.")
                image_clip = ColorClip((1080, 1920), color=(0, 0, 0)).set_duration(duration)

            text_clip = create_text(text, duration)
            segment_bg = ColorClip((1080, 1920), color=(0, 0, 0)).set_duration(duration)

            video_segment = CompositeVideoClip([segment_bg, image_clip, text_clip]).set_audio(audioclip)
            clips.append(video_segment)
            
            if progress_callback:
                progress_callback(f"Completed clip {part+1}/{total_parts}")
                
        except Exception as e:
            error_msg = f"Error creating clip {part+1}: {e}"
            print(error_msg)
            if progress_callback:
                progress_callback(error_msg)
            
        part += 1

    if not clips:
        print("No video clips to create.")
        return None

    if progress_callback:
        progress_callback("Concatenating video clips...", 95)
    
    final_clip = concatenate_videoclips(clips)
    
    # Generate unique filename using file manager
    video_id, filename = file_manager.generate_unique_filename(prompt, voice)
    video_path = file_manager.get_video_path(filename)
    
    if progress_callback:
        progress_callback("Rendering final video...", 98)
    
    # Render video with unique filename
    final_clip.write_videofile(str(video_path), fps=30, audio=True)
    
    # Get file size
    file_size = video_path.stat().st_size if video_path.exists() else 0
    
    # Create metadata
    video_metadata = VideoMetadata(
        video_id=video_id,
        filename=filename,
        original_prompt=prompt,
        voice_used=voice,
        duration=total_duration,
        file_size=file_size,
        created_at=datetime.now().isoformat(),
        file_path=str(video_path)
    )
    
    # Save metadata
    file_manager.save_video_metadata(video_metadata)
    
    # Check if cleanup is needed
    file_manager.auto_cleanup_check()
    
    if progress_callback:
        progress_callback("Video creation completed successfully!", 100)
    
    print(f"Video created successfully: {video_path}")
    print(f"Video ID: {video_id}")
    print(f"File size: {file_size / (1024*1024):.2f} MB")
    
    # Also create the legacy file for backward compatibility
    legacy_path = "./outputs/youtube_short.mp4"
    try:
        import shutil
        shutil.copy2(str(video_path), legacy_path)
        print(f"Legacy copy created: {legacy_path}")
    except Exception as e:
        print(f"Warning: Could not create legacy copy: {e}")
    
    return {
        "success": True,
        "video_id": video_id,
        "filename": filename,
        "file_path": str(video_path),
        "file_size": file_size,
        "file_size_mb": round(file_size / (1024 * 1024), 2),
        "duration": total_duration,
        "metadata": video_metadata,
        "creation_time": datetime.now().isoformat()
    }

if __name__ == "__main__":
    video_main()
