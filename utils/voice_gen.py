# utils/voice_gen.py

import os
import time
import requests

ELEVEN_URL_TEMPLATE = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/stream"

def create_folder_if_not_exists(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

def load_api_key(key_file="voice_secret.txt"):
    if not os.path.exists(key_file):
        raise FileNotFoundError(
            f"API key file '{key_file}' not found. Please create it and insert your ElevenLabs API key."
        )
    with open(key_file, "r", encoding="utf-8") as f:
        key = f.read().strip()
    if not key:
        raise ValueError("The API key is empty. Please check your voice_secret.txt file.")
    return key

def text_to_speech_file(
    text: str,
    save_dir: str,
    filename: str,
    voice_id: str,
    api_key: str
) -> str:
    """
    Creates a direct POST request to ElevenLabs for text-to-speech conversion.
    """
    url = ELEVEN_URL_TEMPLATE.format(voice_id=voice_id)
    headers = {
        "xi-api-key": api_key,
        "Content-Type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.0,
            "similarity_boost": 1.0,
            "style": 0.0,
            "use_speaker_boost": True
        }
    }

    resp = requests.post(url, json=payload, headers=headers, stream=True)
    resp.raise_for_status()

    save_file_path = os.path.join(save_dir, f"{filename}.mp3")
    with open(save_file_path, "wb") as f:
        for chunk in resp.iter_content(chunk_size=4096):
            if chunk:
                f.write(chunk)

    print(f"Audio saved to {save_file_path}")
    return save_file_path

def voice_main(voice_id: str = "pNInz6obpgDQGcFmaJgB", progress_callback=None):
    """
    1) Reads ./outputs/text.txt
    2) Splits it sentence by sentence
    3) Generates mp3 for each sentence using voice_id
    4) Saves them in ./outputs/audio/part{i}.mp3
    """
    try:
        api_key = load_api_key("voice_secret.txt")
    except Exception as e:
        print(f"Error loading voice API key: {e}")
        if progress_callback:
            progress_callback(f"Error loading voice API key: {e}")
        return

    outputs_dir = os.path.join(os.getcwd(), "outputs")
    audio_dir   = os.path.join(outputs_dir, "audio")
    create_folder_if_not_exists(outputs_dir)
    create_folder_if_not_exists(audio_dir)

    text_file = os.path.join(outputs_dir, "text.txt")
    if not os.path.exists(text_file):
        error_msg = f"Text file not found: {text_file}"
        if progress_callback:
            progress_callback(error_msg)
        raise FileNotFoundError(error_msg)

    with open(text_file, "r", encoding="utf-8") as f:
        full_text = f.read()

    # Clean and split
    text_clean = (
        full_text
        .replace(":", " ")
        .replace("-", " ")
        .replace("_", " ")
        .replace("!", ".")
        .replace("*", "")
        .replace(",", ".")
    )
    sentences = [s.strip() for s in text_clean.split('.') if s.strip()]

    # (Optional) Update line_by_line.txt
    line_by_line_file = os.path.join(outputs_dir, "line_by_line.txt")
    with open(line_by_line_file, "w", encoding="utf-8") as lf:
        for sentence in sentences:
            lf.write(sentence + "\n")

    total = len(sentences)
    print(f"Total sentences for voice generation: {total}")
    
    if progress_callback:
        progress_callback(f"Preparing to generate voice for {total} sentences")

    for i, sentence in enumerate(sentences):
        try:
            if progress_callback:
                current_progress = 60 + int((i / total) * 20)  # 60-80% range
                progress_callback(f"Generating voice {i+1}/{total}: {sentence[:40]}...", current_progress)
            
            print(f"Generating audio for sentence {i+1}/{total}: {sentence}")
            text_to_speech_file(
                text=sentence,
                save_dir=audio_dir,
                filename=f"part{i}",
                voice_id=voice_id,
                api_key=api_key
            )
            
            if progress_callback:
                progress_callback(f"Completed voice {i+1}/{total}")
            
            time.sleep(1)
        except Exception as e:
            error_msg = f"Error generating audio for sentence {i}: {e}"
            print(error_msg)
            if progress_callback:
                progress_callback(error_msg)
            continue
    
    if progress_callback:
        progress_callback(f"Successfully generated voice for {total} sentences")

if __name__ == "__main__":
    voice_main()
