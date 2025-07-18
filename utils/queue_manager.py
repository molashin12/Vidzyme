"""
Queue Manager for Video Generation
Implements queue-first approach with concurrency limits and rate limiting
"""

import asyncio
import time
from typing import Dict, List, Optional, Callable, Any
from dataclasses import dataclass, field
from enum import Enum
import threading
from concurrent.futures import ThreadPoolExecutor
import logging
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

class TaskStatus(Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class TaskPriority(Enum):
    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4

@dataclass
class QueueTask:
    id: str
    task_type: str
    payload: Dict[str, Any]
    priority: TaskPriority = TaskPriority.NORMAL
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    progress: int = 0
    retry_count: int = 0
    max_retries: int = 3
    user_id: Optional[str] = None
    video_record_id: Optional[str] = None

class RateLimiter:
    """Rate limiter for external API calls"""
    
    def __init__(self, max_calls: int, time_window: int):
        self.max_calls = max_calls
        self.time_window = time_window
        self.calls = []
        self.lock = threading.Lock()
    
    def can_proceed(self) -> bool:
        """Check if we can make another API call"""
        with self.lock:
            now = time.time()
            # Remove old calls outside the time window
            self.calls = [call_time for call_time in self.calls if now - call_time < self.time_window]
            
            if len(self.calls) < self.max_calls:
                self.calls.append(now)
                return True
            return False
    
    def wait_time(self) -> float:
        """Get the time to wait before next call is allowed"""
        with self.lock:
            if len(self.calls) < self.max_calls:
                return 0
            
            oldest_call = min(self.calls)
            return self.time_window - (time.time() - oldest_call)

class QueueManager:
    """Production-ready queue manager with concurrency limits and rate limiting"""
    
    def __init__(self, max_concurrent_tasks: int = 3, max_workers: int = 5):
        self.max_concurrent_tasks = max_concurrent_tasks
        self.max_workers = max_workers
        
        # Task storage
        self.tasks: Dict[str, QueueTask] = {}
        self.pending_queue: List[str] = []
        self.processing_tasks: Dict[str, threading.Thread] = {}
        
        # Thread management
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.lock = threading.Lock()
        self.running = False
        self.worker_thread = None
        
        # Rate limiters for different services
        self.rate_limiters = {
            'gemini': RateLimiter(max_calls=60, time_window=60),  # 60 calls per minute
            'elevenlabs': RateLimiter(max_calls=120, time_window=60),  # 120 calls per minute
            'veo3': RateLimiter(max_calls=30, time_window=60),  # 30 calls per minute
        }
        
        # Progress callbacks
        self.progress_callbacks: Dict[str, Callable] = {}
        
        # Statistics
        self.stats = {
            'total_tasks': 0,
            'completed_tasks': 0,
            'failed_tasks': 0,
            'average_processing_time': 0
        }
    
    def start(self):
        """Start the queue manager"""
        if self.running:
            return
        
        self.running = True
        self.worker_thread = threading.Thread(target=self._worker_loop, daemon=True)
        self.worker_thread.start()
        logger.info("Queue manager started")
    
    def stop(self):
        """Stop the queue manager"""
        self.running = False
        if self.worker_thread:
            self.worker_thread.join(timeout=5)
        self.executor.shutdown(wait=True)
        logger.info("Queue manager stopped")
    
    def add_task(self, task: QueueTask) -> str:
        """Add a task to the queue"""
        with self.lock:
            self.tasks[task.id] = task
            self.pending_queue.append(task.id)
            self.pending_queue.sort(key=lambda tid: self.tasks[tid].priority.value, reverse=True)
            self.stats['total_tasks'] += 1
        
        logger.info(f"Task {task.id} added to queue (priority: {task.priority.name})")
        return task.id
    
    def get_task_status(self, task_id: str) -> Optional[QueueTask]:
        """Get task status"""
        return self.tasks.get(task_id)
    
    def cancel_task(self, task_id: str) -> bool:
        """Cancel a pending task"""
        with self.lock:
            if task_id in self.pending_queue:
                self.pending_queue.remove(task_id)
                if task_id in self.tasks:
                    self.tasks[task_id].status = TaskStatus.CANCELLED
                return True
            return False
    
    def get_queue_status(self) -> Dict[str, Any]:
        """Get overall queue status"""
        with self.lock:
            return {
                'pending_tasks': len(self.pending_queue),
                'processing_tasks': len(self.processing_tasks),
                'total_tasks': len(self.tasks),
                'stats': self.stats.copy(),
                'rate_limiters': {
                    service: {
                        'calls_made': len(limiter.calls),
                        'max_calls': limiter.max_calls,
                        'wait_time': limiter.wait_time()
                    }
                    for service, limiter in self.rate_limiters.items()
                }
            }
    
    def register_progress_callback(self, task_id: str, callback: Callable):
        """Register a progress callback for a task"""
        self.progress_callbacks[task_id] = callback
    
    def _worker_loop(self):
        """Main worker loop"""
        while self.running:
            try:
                # Check if we can process more tasks
                if len(self.processing_tasks) >= self.max_concurrent_tasks:
                    time.sleep(0.1)
                    continue
                
                # Get next task
                task_id = None
                with self.lock:
                    if self.pending_queue:
                        task_id = self.pending_queue.pop(0)
                
                if task_id:
                    task = self.tasks[task_id]
                    self._start_task_processing(task)
                else:
                    time.sleep(0.1)
                    
            except Exception as e:
                logger.error(f"Error in worker loop: {e}")
                time.sleep(1)
    
    def _start_task_processing(self, task: QueueTask):
        """Start processing a task"""
        task.status = TaskStatus.PROCESSING
        task.started_at = datetime.now()
        
        # Submit to thread pool
        future = self.executor.submit(self._process_task, task)
        
        # Store the future for tracking
        with self.lock:
            self.processing_tasks[task.id] = future
        
        # Add completion callback
        future.add_done_callback(lambda f: self._task_completed(task.id, f))
    
    def _process_task(self, task: QueueTask):
        """Process a single task"""
        try:
            logger.info(f"Processing task {task.id} of type {task.task_type}")
            
            # Update progress callback
            def progress_callback(stage: str, progress: int, message: str, details: str = ""):
                task.progress = progress
                if task.id in self.progress_callbacks:
                    self.progress_callbacks[task.id](stage, progress, message, details)
            
            # Route to appropriate processor
            if task.task_type == "video_generation":
                self._process_video_generation(task, progress_callback)
            elif task.task_type == "platform_content":
                self._process_platform_content(task, progress_callback)
            else:
                raise ValueError(f"Unknown task type: {task.task_type}")
            
            task.status = TaskStatus.COMPLETED
            task.completed_at = datetime.now()
            
        except Exception as e:
            logger.error(f"Task {task.id} failed: {e}")
            task.status = TaskStatus.FAILED
            task.error_message = str(e)
            task.completed_at = datetime.now()
            
            # Retry logic
            if task.retry_count < task.max_retries:
                task.retry_count += 1
                task.status = TaskStatus.PENDING
                task.started_at = None
                task.completed_at = None
                
                with self.lock:
                    self.pending_queue.insert(0, task.id)  # High priority for retries
                
                logger.info(f"Task {task.id} queued for retry ({task.retry_count}/{task.max_retries})")
    
    def _process_video_generation(self, task: QueueTask, progress_callback: Callable):
        """Process video generation task with rate limiting"""
        from utils.write_script import write_content, split_text_to_lines
        from utils.image_gen import image_main
        from utils.voice_gen import voice_main
        from utils.video_creation import video_main
        from utils.gemini import query
        
        payload = task.payload
        topic = payload['topic']
        voice_id = payload['voice_id']
        video_record = payload.get('video_record')
        
        # Rate limit Gemini API calls
        while not self.rate_limiters['gemini'].can_proceed():
            wait_time = self.rate_limiters['gemini'].wait_time()
            logger.info(f"Rate limiting Gemini API, waiting {wait_time:.2f} seconds")
            time.sleep(wait_time)
        
        progress_callback("initializing", 0, "Starting video generation...", "Preparing pipeline")
        
        # Generate title (5% progress)
        progress_callback("title", 5, "Generating title...", "Creating engaging title")
        raw = query(f"Give me 5 YouTube Shorts titles related to the topic '{topic}' separated by commas")["candidates"][0]["content"]["parts"][0]["text"]
        title = [t.strip() for t in raw.replace("،", ",").split(",") if t.strip()][0]
        progress_callback("title", 15, "Title generated successfully", f"Title: {title[:50]}...")
        
        # Rate limit for content generation
        while not self.rate_limiters['gemini'].can_proceed():
            wait_time = self.rate_limiters['gemini'].wait_time()
            time.sleep(wait_time)
        
        # Generate content (15-35% progress)
        progress_callback("script", 20, "Generating content...", "Creating script")
        content = query(f"Explain this topic '{title}' briefly in one minute without instructions.")["candidates"][0]["content"]["parts"][0]["text"]
        progress_callback("script", 35, "Script generated successfully", f"Generated {len(content.split())} words")
        
        # Save content and split into lines
        progress_callback("script", 38, "Saving content...", "Preparing script")
        write_content(content)
        split_text_to_lines()
        progress_callback("script", 40, "Script saved successfully", "Saved line_by_line.txt")
        
        # Generate images with rate limiting
        progress_callback("images", 45, "Generating images...", "Creating visual content")
        
        def image_progress_wrapper(message, progress=None):
            if progress is not None:
                progress_callback("images", progress, message, "Creating visual content")
        
        image_main(progress_callback=image_progress_wrapper)
        progress_callback("images", 60, "Images generated successfully", "Visual content ready")
        
        # Generate voice with rate limiting
        while not self.rate_limiters['elevenlabs'].can_proceed():
            wait_time = self.rate_limiters['elevenlabs'].wait_time()
            logger.info(f"Rate limiting ElevenLabs API, waiting {wait_time:.2f} seconds")
            time.sleep(wait_time)
        
        progress_callback("voice", 65, "Generating voice...", "Converting text to speech")
        
        def voice_progress_wrapper(message, progress=None):
            if progress is not None:
                progress_callback("voice", progress, message, "Converting text to speech")
        
        voice_main(voice_id, progress_callback=voice_progress_wrapper)
        progress_callback("voice", 80, "Voice generated successfully", "Audio ready")
        
        # Create video
        progress_callback("video", 85, "Creating video...", "Combining elements")
        
        def video_progress_wrapper(message, progress=None):
            if progress is not None:
                progress_callback("video", progress, message, "Combining elements")
        
        video_info = video_main(
            prompt=topic,
            voice=voice_id,
            progress_callback=video_progress_wrapper
        )
        
        progress_callback("video", 100, "Video generation completed!", "Ready for download")
        
        # Store result in task
        task.payload['result'] = video_info
    
    def _process_platform_content(self, task: QueueTask, progress_callback: Callable):
        """Process platform content generation task"""
        # Implementation for platform content generation
        # This would be similar to video generation but for multiple platforms
        pass
    
    def _task_completed(self, task_id: str, future):
        """Handle task completion"""
        with self.lock:
            if task_id in self.processing_tasks:
                del self.processing_tasks[task_id]
        
        task = self.tasks[task_id]
        
        if task.status == TaskStatus.COMPLETED:
            self.stats['completed_tasks'] += 1
            processing_time = (task.completed_at - task.started_at).total_seconds()
            
            # Update average processing time
            total_completed = self.stats['completed_tasks']
            current_avg = self.stats['average_processing_time']
            self.stats['average_processing_time'] = (current_avg * (total_completed - 1) + processing_time) / total_completed
            
        elif task.status == TaskStatus.FAILED and task.retry_count >= task.max_retries:
            self.stats['failed_tasks'] += 1
        
        logger.info(f"Task {task_id} completed with status: {task.status.value}")

# Global queue manager instance
queue_manager = QueueManager()