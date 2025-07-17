import os
import requests
from PIL import Image
from io import BytesIO
from tqdm import tqdm
from urllib.parse import quote_plus


def image_main(progress_callback=None):
    # 1) Output folder path
    out_dir = os.path.join(os.getcwd(), "outputs", "images")
    os.makedirs(out_dir, exist_ok=True)

    # 2) Read line_by_line.txt
    line_file = os.path.join(os.getcwd(), "outputs", "line_by_line.txt")
    with open(line_file, "r", encoding="utf-8") as f:
        prompts = [line.strip() for line in f if line.strip()]

    total_images = len(prompts)
    if progress_callback:
        progress_callback(f"Preparing to generate {total_images} images")

    # 3) Fetch and save images with enhanced prompts
    for part, prompt in enumerate(prompts):
        try:
            if progress_callback:
                current_progress = 40 + int((part / total_images) * 20)  # 40-60% range
                progress_callback(f"Generating image {part + 1}/{total_images}: {prompt[:30]}...", current_progress)
            
            # Enhance the prompt for better image generation
            enhanced_prompt = f"High-quality, professional, cinematic image representing: {prompt}. Vibrant colors, sharp details, modern style, engaging visual composition, suitable for educational content"

            # URL encode the enhanced prompt
            encoded = quote_plus(enhanced_prompt)
            url = f"https://image.pollinations.ai/prompt/{encoded}"

            resp = requests.get(url, timeout=30)
            resp.raise_for_status()

            img = Image.open(BytesIO(resp.content)).convert("RGB")

            out_path = os.path.join(out_dir, f"part{part}.jpg")
            img.save(out_path, format="JPEG")
            
            if progress_callback:
                progress_callback(f"Saved image {part + 1}/{total_images}")

        except Exception as e:
            print(f"Error downloading or saving image [{prompt}]: {e}")
            if progress_callback:
                progress_callback(f"Error generating image {part + 1}: {str(e)}")
    
    if progress_callback:
        progress_callback(f"Successfully generated {total_images} images")

if __name__ == "__main__":
    image_main()
