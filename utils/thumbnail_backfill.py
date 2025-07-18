#!/usr/bin/env python3
"""
Thumbnail Backfill Utility for Vidzyme

This script helps maintain thumbnail organization in the Supabase database by:
1. Generating thumbnails for existing videos that don't have them
2. Updating database records with thumbnail URLs
3. Cleaning up orphaned thumbnail files
4. Providing database maintenance functions

Usage:
    python utils/thumbnail_backfill.py --backfill
    python utils/thumbnail_backfill.py --cleanup
    python utils/thumbnail_backfill.py --verify
"""

import os
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Optional
import uuid

# Add the parent directory to the path to import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.video_creation import generate_thumbnail
from utils.file_manager import get_file_manager
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class ThumbnailManager:
    def __init__(self):
        self.file_manager = get_file_manager()
        self.base_dir = Path(__file__).parent.parent
        self.videos_dir = self.base_dir / "outputs" / "videos"
        self.thumbnails_dir = self.base_dir / "outputs" / "thumbnails"
        
        # Ensure thumbnails directory exists
        self.thumbnails_dir.mkdir(parents=True, exist_ok=True)
    
    def get_videos_without_thumbnails(self) -> List[Dict]:
        """Get all videos from database that don't have thumbnail URLs"""
        try:
            result = supabase.table("videos").select("*").is_("thumbnail_url", "null").execute()
            return result.data or []
        except Exception as e:
            print(f"❌ Error fetching videos without thumbnails: {e}")
            return []
    
    def get_all_videos(self) -> List[Dict]:
        """Get all videos from database"""
        try:
            result = supabase.table("videos").select("*").execute()
            return result.data or []
        except Exception as e:
            print(f"❌ Error fetching all videos: {e}")
            return []
    
    def generate_thumbnail_for_video(self, video_path: str, video_id: str) -> Optional[str]:
        """Generate thumbnail for a specific video file"""
        try:
            if not os.path.exists(video_path):
                print(f"⚠️  Video file not found: {video_path}")
                return None
            
            # Generate unique thumbnail filename
            thumbnail_filename = f"thumbnail_{video_id}_{uuid.uuid4().hex[:8]}.jpg"
            thumbnail_path = self.thumbnails_dir / thumbnail_filename
            
            # Generate thumbnail
            success = generate_thumbnail(video_path, str(thumbnail_path))
            
            if success and thumbnail_path.exists():
                print(f"✅ Generated thumbnail: {thumbnail_filename}")
                return f"/outputs/thumbnails/{thumbnail_filename}"
            else:
                print(f"❌ Failed to generate thumbnail for: {video_path}")
                return None
                
        except Exception as e:
            print(f"❌ Error generating thumbnail for {video_path}: {e}")
            return None
    
    def update_video_thumbnail_url(self, video_id: str, thumbnail_url: str) -> bool:
        """Update video record with thumbnail URL"""
        try:
            result = supabase.table("videos").update({
                "thumbnail_url": thumbnail_url,
                "updated_at": "now()"
            }).eq("id", video_id).execute()
            
            if result.data:
                print(f"✅ Updated video {video_id} with thumbnail URL")
                return True
            else:
                print(f"❌ Failed to update video {video_id}")
                return False
                
        except Exception as e:
            print(f"❌ Error updating video {video_id}: {e}")
            return False
    
    def backfill_thumbnails(self) -> Dict[str, int]:
        """Generate thumbnails for all videos that don't have them"""
        print("🔄 Starting thumbnail backfill process...")
        
        videos_without_thumbnails = self.get_videos_without_thumbnails()
        stats = {
            "total_videos": len(videos_without_thumbnails),
            "successful": 0,
            "failed": 0,
            "skipped": 0
        }
        
        print(f"📊 Found {stats['total_videos']} videos without thumbnails")
        
        for video in videos_without_thumbnails:
            video_id = video["id"]
            video_url = video.get("video_url")
            
            if not video_url:
                print(f"⚠️  Skipping video {video_id}: No video URL")
                stats["skipped"] += 1
                continue
            
            # Convert URL to file path
            if video_url.startswith("/outputs/videos/"):
                filename = video_url.replace("/outputs/videos/", "")
                video_path = self.videos_dir / filename
            else:
                print(f"⚠️  Skipping video {video_id}: Invalid video URL format")
                stats["skipped"] += 1
                continue
            
            # Generate thumbnail
            thumbnail_url = self.generate_thumbnail_for_video(str(video_path), video_id)
            
            if thumbnail_url:
                # Update database
                if self.update_video_thumbnail_url(video_id, thumbnail_url):
                    stats["successful"] += 1
                else:
                    stats["failed"] += 1
            else:
                stats["failed"] += 1
        
        print(f"\n📊 Backfill Results:")
        print(f"   Total videos: {stats['total_videos']}")
        print(f"   ✅ Successful: {stats['successful']}")
        print(f"   ❌ Failed: {stats['failed']}")
        print(f"   ⚠️  Skipped: {stats['skipped']}")
        
        return stats
    
    def cleanup_orphaned_thumbnails(self) -> Dict[str, int]:
        """Remove thumbnail files that don't have corresponding database records"""
        print("🧹 Starting thumbnail cleanup process...")
        
        # Get all thumbnail URLs from database
        all_videos = self.get_all_videos()
        db_thumbnail_urls = set()
        
        for video in all_videos:
            if video.get("thumbnail_url"):
                # Extract filename from URL
                thumbnail_url = video["thumbnail_url"]
                if thumbnail_url.startswith("/outputs/thumbnails/"):
                    filename = thumbnail_url.replace("/outputs/thumbnails/", "")
                    db_thumbnail_urls.add(filename)
        
        # Get all thumbnail files on disk
        thumbnail_files = set()
        if self.thumbnails_dir.exists():
            for file_path in self.thumbnails_dir.glob("*.jpg"):
                thumbnail_files.add(file_path.name)
        
        # Find orphaned files
        orphaned_files = thumbnail_files - db_thumbnail_urls
        
        stats = {
            "total_files": len(thumbnail_files),
            "referenced_files": len(db_thumbnail_urls),
            "orphaned_files": len(orphaned_files),
            "deleted": 0
        }
        
        print(f"📊 Found {stats['orphaned_files']} orphaned thumbnail files")
        
        # Delete orphaned files
        for filename in orphaned_files:
            try:
                file_path = self.thumbnails_dir / filename
                file_path.unlink()
                print(f"🗑️  Deleted orphaned thumbnail: {filename}")
                stats["deleted"] += 1
            except Exception as e:
                print(f"❌ Error deleting {filename}: {e}")
        
        print(f"\n📊 Cleanup Results:")
        print(f"   Total files: {stats['total_files']}")
        print(f"   Referenced files: {stats['referenced_files']}")
        print(f"   Orphaned files: {stats['orphaned_files']}")
        print(f"   🗑️  Deleted: {stats['deleted']}")
        
        return stats
    
    def verify_thumbnail_integrity(self) -> Dict[str, int]:
        """Verify that all thumbnail URLs in database point to existing files"""
        print("🔍 Verifying thumbnail integrity...")
        
        all_videos = self.get_all_videos()
        stats = {
            "total_videos": len(all_videos),
            "videos_with_thumbnails": 0,
            "valid_thumbnails": 0,
            "broken_thumbnails": 0,
            "missing_thumbnails": 0
        }
        
        for video in all_videos:
            video_id = video["id"]
            thumbnail_url = video.get("thumbnail_url")
            
            if thumbnail_url:
                stats["videos_with_thumbnails"] += 1
                
                # Check if file exists
                if thumbnail_url.startswith("/outputs/thumbnails/"):
                    filename = thumbnail_url.replace("/outputs/thumbnails/", "")
                    file_path = self.thumbnails_dir / filename
                    
                    if file_path.exists():
                        stats["valid_thumbnails"] += 1
                        print(f"✅ Valid thumbnail for video {video_id}")
                    else:
                        stats["broken_thumbnails"] += 1
                        print(f"❌ Broken thumbnail for video {video_id}: {thumbnail_url}")
                else:
                    stats["broken_thumbnails"] += 1
                    print(f"❌ Invalid thumbnail URL for video {video_id}: {thumbnail_url}")
            else:
                stats["missing_thumbnails"] += 1
                print(f"⚠️  No thumbnail for video {video_id}")
        
        print(f"\n📊 Integrity Check Results:")
        print(f"   Total videos: {stats['total_videos']}")
        print(f"   Videos with thumbnails: {stats['videos_with_thumbnails']}")
        print(f"   ✅ Valid thumbnails: {stats['valid_thumbnails']}")
        print(f"   ❌ Broken thumbnails: {stats['broken_thumbnails']}")
        print(f"   ⚠️  Missing thumbnails: {stats['missing_thumbnails']}")
        
        return stats

def main():
    parser = argparse.ArgumentParser(description="Thumbnail management utility for Vidzyme")
    parser.add_argument("--backfill", action="store_true", help="Generate thumbnails for videos that don't have them")
    parser.add_argument("--cleanup", action="store_true", help="Remove orphaned thumbnail files")
    parser.add_argument("--verify", action="store_true", help="Verify thumbnail integrity")
    parser.add_argument("--all", action="store_true", help="Run all operations (backfill, cleanup, verify)")
    
    args = parser.parse_args()
    
    if not any([args.backfill, args.cleanup, args.verify, args.all]):
        parser.print_help()
        return
    
    manager = ThumbnailManager()
    
    try:
        if args.all or args.backfill:
            print("=" * 60)
            print("🎬 THUMBNAIL BACKFILL")
            print("=" * 60)
            manager.backfill_thumbnails()
        
        if args.all or args.cleanup:
            print("\n" + "=" * 60)
            print("🧹 THUMBNAIL CLEANUP")
            print("=" * 60)
            manager.cleanup_orphaned_thumbnails()
        
        if args.all or args.verify:
            print("\n" + "=" * 60)
            print("🔍 THUMBNAIL VERIFICATION")
            print("=" * 60)
            manager.verify_thumbnail_integrity()
        
        print("\n✅ Thumbnail management operations completed!")
        
    except KeyboardInterrupt:
        print("\n⚠️  Operation cancelled by user")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")

if __name__ == "__main__":
    main()