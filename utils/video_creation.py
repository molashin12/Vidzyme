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

def video_main(progress_callback=None):
    if progress_callback:
        progress_callback("Starting video creation process")
    
    # Read text split line by line
    with open("./outputs/line_by_line.txt", "r", encoding="utf-8") as f:
        content = f.read().split("\n")

    clips = []
    part = 0
    total_parts = len([text for text in content if text.strip() != ""])
    
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
        return

    if progress_callback:
        progress_callback("Concatenating video clips...", 95)
    
    final_clip = concatenate_videoclips(clips)
    
    if progress_callback:
        progress_callback("Rendering final video...", 98)
    
    final_clip.write_videofile("./outputs/youtube_short.mp4", fps=30, audio=True)
    
    if progress_callback:
        progress_callback("Video creation completed successfully!", 100)
    
    print("Video created successfully: ./outputs/youtube_short.mp4")

if __name__ == "__main__":
    video_main()
