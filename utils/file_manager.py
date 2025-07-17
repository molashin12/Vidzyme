"""
Production-ready file management system for video generation platform.
Handles file naming, storage organization, cleanup, and space management.
"""

import os
import json
import shutil
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import uuid
import zipfile
import threading
from dataclasses import dataclass, asdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class VideoMetadata:
    """Metadata for generated videos"""
    video_id: str
    filename: str
    original_prompt: str
    voice_used: str
    duration: float
    file_size: int
    created_at: str
    file_path: str
    thumbnail_path: Optional[str] = None
    compressed_path: Optional[str] = None
    archived: bool = False

class FileManager:
    """Production-ready file management system"""
    
    def __init__(self, base_output_dir: str = "./outputs"):
        self.base_dir = Path(base_output_dir)
        self.videos_dir = self.base_dir / "videos"
        self.archive_dir = self.base_dir / "archive"
        self.temp_dir = self.base_dir / "temp"
        self.thumbnails_dir = self.base_dir / "thumbnails"
        self.metadata_file = self.base_dir / "video_metadata.json"
        
        # Storage configuration
        self.config = {
            "max_storage_gb": 10.0,  # Maximum storage in GB
            "max_videos_count": 100,  # Maximum number of videos to keep
            "auto_cleanup_days": 30,  # Auto-delete videos older than X days
            "compression_enabled": True,
            "archive_enabled": True,
            "thumbnail_generation": True
        }
        
        self._ensure_directories()
        self._load_metadata()
        
    def _ensure_directories(self):
        """Create necessary directories"""
        for directory in [self.videos_dir, self.archive_dir, self.temp_dir, self.thumbnails_dir]:
            directory.mkdir(parents=True, exist_ok=True)
            
    def _load_metadata(self) -> Dict:
        """Load video metadata from JSON file"""
        if self.metadata_file.exists():
            try:
                with open(self.metadata_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.error(f"Error loading metadata: {e}")
                return {}
        return {}
    
    def _save_metadata(self, metadata: Dict):
        """Save video metadata to JSON file"""
        try:
            with open(self.metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error saving metadata: {e}")
    
    def generate_unique_filename(self, prompt: str, voice: str, extension: str = "mp4") -> Tuple[str, str]:
        """Generate unique filename and video ID"""
        # Create video ID
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        video_id = f"{timestamp}_{unique_id}"
        
        # Create safe filename from prompt
        safe_prompt = "".join(c for c in prompt[:30] if c.isalnum() or c in (' ', '-', '_')).strip()
        safe_prompt = safe_prompt.replace(' ', '_')
        
        # Create filename
        filename = f"{video_id}_{safe_prompt}_{voice}.{extension}"
        
        return video_id, filename
    
    def get_video_path(self, filename: str) -> Path:
        """Get full path for video file"""
        return self.videos_dir / filename
    
    def save_video_metadata(self, video_metadata: VideoMetadata):
        """Save metadata for a generated video"""
        metadata = self._load_metadata()
        metadata[video_metadata.video_id] = asdict(video_metadata)
        self._save_metadata(metadata)
        logger.info(f"Saved metadata for video: {video_metadata.video_id}")
    
    def get_video_metadata(self, video_id: str) -> Optional[VideoMetadata]:
        """Get metadata for a specific video"""
        metadata = self._load_metadata()
        if video_id in metadata:
            return VideoMetadata(**metadata[video_id])
        return None
    
    def list_videos(self, limit: int = 50, archived: bool = False) -> List[VideoMetadata]:
        """List videos with optional filtering"""
        metadata = self._load_metadata()
        videos = []
        
        for video_data in metadata.values():
            if video_data.get('archived', False) == archived:
                videos.append(VideoMetadata(**video_data))
        
        # Sort by creation date (newest first)
        videos.sort(key=lambda x: x.created_at, reverse=True)
        return videos[:limit]
    
    def get_storage_stats(self) -> Dict:
        """Get current storage statistics"""
        total_size = 0
        video_count = 0
        
        for video_file in self.videos_dir.glob("*.mp4"):
            if video_file.is_file():
                total_size += video_file.stat().st_size
                video_count += 1
        
        # Convert to GB
        total_size_gb = total_size / (1024 ** 3)
        
        return {
            "total_size_gb": round(total_size_gb, 2),
            "video_count": video_count,
            "max_storage_gb": self.config["max_storage_gb"],
            "storage_usage_percent": round((total_size_gb / self.config["max_storage_gb"]) * 100, 1),
            "available_space_gb": round(self.config["max_storage_gb"] - total_size_gb, 2)
        }
    
    def cleanup_old_videos(self, force: bool = False) -> Dict:
        """Clean up old videos based on configuration"""
        cleanup_stats = {
            "deleted_count": 0,
            "archived_count": 0,
            "freed_space_mb": 0,
            "errors": []
        }
        
        try:
            metadata = self._load_metadata()
            cutoff_date = datetime.now() - timedelta(days=self.config["auto_cleanup_days"])
            
            for video_id, video_data in list(metadata.items()):
                try:
                    created_at = datetime.fromisoformat(video_data["created_at"])
                    
                    if created_at < cutoff_date or force:
                        video_path = Path(video_data["file_path"])
                        
                        if video_path.exists():
                            file_size = video_path.stat().st_size
                            
                            # Archive if enabled, otherwise delete
                            if self.config["archive_enabled"] and not force:
                                self._archive_video(video_id, video_data)
                                cleanup_stats["archived_count"] += 1
                            else:
                                video_path.unlink()
                                cleanup_stats["deleted_count"] += 1
                                cleanup_stats["freed_space_mb"] += file_size / (1024 * 1024)
                                
                                # Remove from metadata if deleted
                                del metadata[video_id]
                        
                except Exception as e:
                    cleanup_stats["errors"].append(f"Error processing {video_id}: {e}")
            
            self._save_metadata(metadata)
            logger.info(f"Cleanup completed: {cleanup_stats}")
            
        except Exception as e:
            cleanup_stats["errors"].append(f"Cleanup failed: {e}")
            logger.error(f"Cleanup error: {e}")
        
        return cleanup_stats
    
    def _archive_video(self, video_id: str, video_data: Dict):
        """Archive a video to compressed storage"""
        try:
            video_path = Path(video_data["file_path"])
            archive_path = self.archive_dir / f"{video_id}.zip"
            
            with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                zipf.write(video_path, video_path.name)
                
                # Include metadata
                metadata_str = json.dumps(video_data, indent=2)
                zipf.writestr(f"{video_id}_metadata.json", metadata_str)
            
            # Remove original file
            video_path.unlink()
            
            # Update metadata
            video_data["archived"] = True
            video_data["file_path"] = str(archive_path)
            
            logger.info(f"Archived video: {video_id}")
            
        except Exception as e:
            logger.error(f"Error archiving video {video_id}: {e}")
            raise
    
    def compress_video(self, video_path: Path, quality: str = "medium") -> Optional[Path]:
        """Compress video using FFmpeg (if available)"""
        if not self.config["compression_enabled"]:
            return None
            
        try:
            compressed_path = video_path.parent / f"{video_path.stem}_compressed{video_path.suffix}"
            
            # Quality settings
            quality_settings = {
                "low": "-crf 28 -preset fast",
                "medium": "-crf 23 -preset medium", 
                "high": "-crf 18 -preset slow"
            }
            
            # Use FFmpeg for compression (if available)
            import subprocess
            cmd = f'ffmpeg -i "{video_path}" {quality_settings.get(quality, quality_settings["medium"])} "{compressed_path}"'
            
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            
            if result.returncode == 0 and compressed_path.exists():
                logger.info(f"Compressed video: {video_path.name}")
                return compressed_path
            else:
                logger.warning(f"Compression failed for: {video_path.name}")
                return None
                
        except Exception as e:
            logger.error(f"Error compressing video: {e}")
            return None
    
    def auto_cleanup_check(self):
        """Check if automatic cleanup is needed"""
        stats = self.get_storage_stats()
        
        # Check storage limit
        if stats["storage_usage_percent"] > 80:
            logger.warning(f"Storage usage high: {stats['storage_usage_percent']}%")
            return self.cleanup_old_videos()
        
        # Check video count limit
        if stats["video_count"] > self.config["max_videos_count"]:
            logger.warning(f"Video count limit exceeded: {stats['video_count']}")
            return self.cleanup_old_videos()
        
        return None
    
    def delete_video(self, video_id: str) -> bool:
        """Delete a specific video"""
        try:
            metadata = self._load_metadata()
            
            if video_id not in metadata:
                logger.warning(f"Video not found: {video_id}")
                return False
            
            video_data = metadata[video_id]
            video_path = Path(video_data["file_path"])
            
            if video_path.exists():
                video_path.unlink()
            
            # Remove thumbnail if exists
            if video_data.get("thumbnail_path"):
                thumb_path = Path(video_data["thumbnail_path"])
                if thumb_path.exists():
                    thumb_path.unlink()
            
            # Remove from metadata
            del metadata[video_id]
            self._save_metadata(metadata)
            
            logger.info(f"Deleted video: {video_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting video {video_id}: {e}")
            return False
    
    def update_config(self, new_config: Dict):
        """Update file manager configuration"""
        self.config.update(new_config)
        logger.info(f"Updated configuration: {new_config}")

# Global file manager instance
file_manager = FileManager()

def get_file_manager() -> FileManager:
    """Get the global file manager instance"""
    return file_manager