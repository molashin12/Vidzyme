import os
import requests
import replicate
from tqdm import tqdm

def load_api_token(file_path="REPLICATE_API_TOKEN.txt"):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        raise FileNotFoundError(f"API token file not found: {file_path}")

def video_main():
    # Setup folders
    out_dir = os.path.join(os.getcwd(), "outputs", "videos")
    os.makedirs(out_dir, exist_ok=True)

    # Read text file
    line_file = os.path.join(os.getcwd(), "outputs", "line_by_line.txt")
    with open(line_file, "r", encoding="utf-8") as f:
        prompts = [line.strip() for line in f if line.strip()]

    # Load API key
    api_token = load_api_token()

    # Setup Replicate client
    client = replicate.Client(api_token=api_token)
    model = client.models.get("google/veo-3")
    version = model.versions.get("latest")

    # Generate videos with enhanced prompts
    for i, prompt in enumerate(tqdm(prompts, desc="Generating videos")):
        try:
            # Enhance the prompt for better video generation
            enhanced_prompt = f"High-quality, cinematic video showing: {prompt}. Professional lighting, smooth camera movement, engaging visual storytelling, suitable for educational content"
            
            output = version.predict(
                prompt=enhanced_prompt,
                aspect_ratio="16:9",
                fps=24,
            )
            video_url = output[0]

            # Download video
            response = requests.get(video_url, stream=True)
            response.raise_for_status()
            out_path = os.path.join(out_dir, f"part{i}.mp4")
            with open(out_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)

        except Exception as e:
            print(f"Error generating video for prompt [{prompt}]: {e}")

if __name__ == "__main__":
    video_main()
