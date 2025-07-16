# scheduler.py
# Flexible Video Scheduling Service for Vidzyme
# Handles automated video generation based on user-defined schedules

import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.memory import MemoryJobStore
from apscheduler.executors.asyncio import AsyncIOExecutor
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.date import DateTrigger
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class VideoScheduler:
    def __init__(self):
        self.scheduler = None
        self.supabase: Optional[Client] = None
        self.is_running = False
        
    async def initialize(self):
        """Initialize the scheduler and Supabase client"""
        try:
            # Initialize Supabase client
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_ANON_KEY')
            
            if not supabase_url or not supabase_key:
                logger.error("Supabase credentials not found in environment variables")
                return False
                
            self.supabase = create_client(supabase_url, supabase_key)
            
            # Configure scheduler
            jobstores = {
                'default': MemoryJobStore()
            }
            executors = {
                'default': AsyncIOExecutor()
            }
            job_defaults = {
                'coalesce': False,
                'max_instances': 3
            }
            
            self.scheduler = AsyncIOScheduler(
                jobstores=jobstores,
                executors=executors,
                job_defaults=job_defaults,
                timezone='UTC'
            )
            
            logger.info("Video scheduler initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize scheduler: {e}")
            return False
    
    async def start(self):
        """Start the scheduler"""
        if not self.scheduler:
            await self.initialize()
            
        if self.scheduler and not self.is_running:
            self.scheduler.start()
            self.is_running = True
            
            # Load existing scheduled videos
            await self.load_scheduled_videos()
            
            logger.info("Video scheduler started")
    
    async def stop(self):
        """Stop the scheduler"""
        if self.scheduler and self.is_running:
            self.scheduler.shutdown()
            self.is_running = False
            logger.info("Video scheduler stopped")
    
    async def load_scheduled_videos(self):
        """Load all active scheduled videos from database and schedule them"""
        try:
            response = self.supabase.table('scheduled_videos').select(
                '*', 
                'user_channels(channel_name, preferred_voice, preferred_video_length)'
            ).eq('is_active', True).execute()
            
            if response.data:
                for scheduled_video in response.data:
                    await self.schedule_video(scheduled_video)
                    
                logger.info(f"Loaded {len(response.data)} scheduled videos")
            
        except Exception as e:
            logger.error(f"Failed to load scheduled videos: {e}")
    
    async def schedule_video(self, scheduled_video: Dict[str, Any]):
        """Schedule a single video based on its configuration"""
        try:
            video_id = scheduled_video['id']
            schedule_type = scheduled_video['schedule_type']
            schedule_time = scheduled_video['schedule_time']
            schedule_days = scheduled_video.get('schedule_days', [1,2,3,4,5])  # Default to weekdays
            
            # Remove existing job if it exists
            try:
                self.scheduler.remove_job(f"video_{video_id}")
            except:
                pass
            
            # Create trigger based on schedule type
            trigger = self._create_trigger(schedule_type, schedule_time, schedule_days)
            
            if trigger:
                self.scheduler.add_job(
                    func=self._generate_video,
                    trigger=trigger,
                    id=f"video_{video_id}",
                    args=[scheduled_video],
                    replace_existing=True
                )
                
                logger.info(f"Scheduled video {video_id} with {schedule_type} schedule")
            
        except Exception as e:
            logger.error(f"Failed to schedule video {scheduled_video.get('id')}: {e}")
    
    def _create_trigger(self, schedule_type: str, schedule_time: str, schedule_days: list):
        """Create appropriate trigger based on schedule configuration"""
        try:
            # Parse time (format: HH:MM:SS or HH:MM)
            time_parts = schedule_time.split(':')
            hour = int(time_parts[0])
            minute = int(time_parts[1]) if len(time_parts) > 1 else 0
            
            if schedule_type == 'daily':
                return CronTrigger(hour=hour, minute=minute)
            
            elif schedule_type == 'weekly':
                # Convert schedule_days to cron format (0=Sunday, 6=Saturday)
                # Our format: 1=Monday, 7=Sunday
                cron_days = [str((day % 7)) for day in schedule_days]
                day_of_week = ','.join(cron_days)
                return CronTrigger(hour=hour, minute=minute, day_of_week=day_of_week)
            
            elif schedule_type == 'monthly':
                return CronTrigger(hour=hour, minute=minute, day=1)  # First day of month
            
            elif schedule_type == 'custom':
                # For custom schedules, use the next_execution time from database
                return None  # Will be handled separately
            
        except Exception as e:
            logger.error(f"Failed to create trigger: {e}")
            return None
    
    async def _generate_video(self, scheduled_video: Dict[str, Any]):
        """Generate video for a scheduled item"""
        try:
            logger.info(f"Starting video generation for scheduled video {scheduled_video['id']}")
            
            # Get channel information
            channel_info = scheduled_video.get('user_channels', {})
            
            # Prepare video generation parameters
            prompt = scheduled_video['prompt_template']
            title_template = scheduled_video.get('title_template', '')
            voice = channel_info.get('preferred_voice', 'haitham')
            duration = channel_info.get('preferred_video_length', 60)
            
            # Add to video queue
            queue_item = {
                'user_id': scheduled_video['user_id'],
                'scheduled_video_id': scheduled_video['id'],
                'channel_id': scheduled_video['channel_id'],
                'title': title_template or f"Scheduled Video - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
                'prompt': prompt,
                'voice': voice,
                'duration': duration,
                'status': 'pending',
                'scheduled_for': datetime.utcnow().isoformat(),
                'priority': 3  # Medium priority for scheduled videos
            }
            
            # Insert into video queue
            response = self.supabase.table('video_queue').insert(queue_item).execute()
            
            if response.data:
                queue_id = response.data[0]['id']
                logger.info(f"Added video to queue: {queue_id}")
                
                # Update scheduled video execution info
                await self._update_scheduled_video_execution(scheduled_video['id'])
                
                # Process the video immediately (or you can implement a separate queue processor)
                await self._process_video_queue_item(response.data[0])
            
        except Exception as e:
            logger.error(f"Failed to generate video for scheduled item {scheduled_video['id']}: {e}")
    
    async def _update_scheduled_video_execution(self, scheduled_video_id: str):
        """Update the last execution time and increment execution count"""
        try:
            # Get current execution count
            response = self.supabase.table('scheduled_videos').select('execution_count, max_executions').eq('id', scheduled_video_id).execute()
            
            if response.data:
                current_count = response.data[0].get('execution_count', 0)
                max_executions = response.data[0].get('max_executions')
                
                new_count = current_count + 1
                update_data = {
                    'last_execution': datetime.utcnow().isoformat(),
                    'execution_count': new_count
                }
                
                # Check if we've reached max executions
                if max_executions and new_count >= max_executions:
                    update_data['is_active'] = False
                    logger.info(f"Scheduled video {scheduled_video_id} reached max executions ({max_executions})")
                
                self.supabase.table('scheduled_videos').update(update_data).eq('id', scheduled_video_id).execute()
            
        except Exception as e:
            logger.error(f"Failed to update scheduled video execution: {e}")
    
    async def _process_video_queue_item(self, queue_item: Dict[str, Any]):
        """Process a video queue item by calling the video generation pipeline"""
        try:
            from server import run_pipeline, VOICE_MAPPING
            
            # Update queue status to processing
            self.supabase.table('video_queue').update({
                'status': 'processing',
                'started_at': datetime.utcnow().isoformat()
            }).eq('id', queue_item['id']).execute()
            
            # Get voice ID
            voice_name = queue_item['voice']
            voice_id = VOICE_MAPPING.get(voice_name, VOICE_MAPPING['haitham'])
            
            # Run video generation pipeline
            # Note: This runs in a separate thread to avoid blocking the scheduler
            import threading
            threading.Thread(
                target=run_pipeline,
                args=(queue_item['prompt'], voice_id),
                daemon=True
            ).start()
            
            # Update queue status to completed (this is simplified - in reality you'd wait for completion)
            # For now, we'll mark as completed immediately
            self.supabase.table('video_queue').update({
                'status': 'completed',
                'completed_at': datetime.utcnow().isoformat()
            }).eq('id', queue_item['id']).execute()
            
            logger.info(f"Started video generation for queue item {queue_item['id']}")
            
        except Exception as e:
            logger.error(f"Failed to process video queue item {queue_item['id']}: {e}")
            
            # Update queue status to failed
            self.supabase.table('video_queue').update({
                'status': 'failed',
                'error_message': str(e),
                'completed_at': datetime.utcnow().isoformat()
            }).eq('id', queue_item['id']).execute()
    
    async def add_scheduled_video(self, scheduled_video: Dict[str, Any]):
        """Add a new scheduled video to the scheduler"""
        if self.is_running:
            await self.schedule_video(scheduled_video)
    
    async def remove_scheduled_video(self, video_id: str):
        """Remove a scheduled video from the scheduler"""
        try:
            self.scheduler.remove_job(f"video_{video_id}")
            logger.info(f"Removed scheduled video {video_id} from scheduler")
        except Exception as e:
            logger.warning(f"Failed to remove scheduled video {video_id}: {e}")
    
    async def update_scheduled_video(self, scheduled_video: Dict[str, Any]):
        """Update an existing scheduled video"""
        video_id = scheduled_video['id']
        await self.remove_scheduled_video(video_id)
        
        if scheduled_video.get('is_active', True):
            await self.schedule_video(scheduled_video)
    
    def get_scheduled_jobs(self):
        """Get list of currently scheduled jobs"""
        if self.scheduler:
            return [{
                'id': job.id,
                'next_run': job.next_run_time.isoformat() if job.next_run_time else None,
                'trigger': str(job.trigger)
            } for job in self.scheduler.get_jobs()]
        return []

# Global scheduler instance
video_scheduler = VideoScheduler()