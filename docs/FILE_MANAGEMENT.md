# File Management System Configuration

This document explains the configuration options for the video file management system.

## Configuration File: `config/storage_config.json`

### Storage Settings

- **max_storage_gb**: Maximum storage space in GB (default: 10.0)
- **max_videos**: Maximum number of videos to keep (default: 100)
- **retention_days**: Days to keep videos before cleanup (default: 30)
- **auto_cleanup_enabled**: Enable automatic cleanup (default: true)
- **cleanup_check_interval_hours**: Hours between cleanup checks (default: 24)
- **archive_before_delete**: Archive videos before deletion (default: true)
- **archive_directory**: Directory for archived videos (default: "archives")

### Compression Settings

- **enabled**: Enable video compression (default: true)
- **auto_compress_after_days**: Days before auto-compression (default: 7)
- **compression_quality**: Quality level - "low", "medium", "high" (default: "medium")
- **target_size_reduction**: Target size reduction ratio (default: 0.3 = 30% smaller)
- **ffmpeg_preset**: FFmpeg compression preset (default: "medium")

### Naming Convention

- **include_timestamp**: Include timestamp in filename (default: true)
- **include_uuid**: Include UUID for uniqueness (default: true)
- **timestamp_format**: Python datetime format (default: "%Y%m%d_%H%M%S")
- **prefix**: Filename prefix (default: "video")
- **extension**: File extension (default: "mp4")

### Monitoring

- **log_storage_stats**: Log storage statistics (default: true)
- **alert_threshold_gb**: Storage alert threshold in GB (default: 8.0)
- **performance_tracking**: Track performance metrics (default: true)

### Backup (Optional)

- **enabled**: Enable backup system (default: false)
- **backup_directory**: Backup storage directory (default: "backups")
- **backup_retention_days**: Days to keep backups (default: 90)
- **compress_backups**: Compress backup files (default: true)

## API Endpoints

### Video Management
- `GET /api/videos` - List all videos
- `GET /api/videos/{video_id}` - Get video details
- `DELETE /api/videos/{video_id}` - Delete specific video
- `GET /api/videos/latest` - Get most recent video

### Storage Management
- `GET /api/storage/stats` - Get storage statistics
- `POST /api/storage/cleanup` - Trigger manual cleanup
- `POST /api/videos/{video_id}/compress` - Compress specific video

## File Naming Examples

With default settings, videos are named like:
- `video_20241201_143022_a1b2c3d4.mp4`
- `video_20241201_143155_e5f6g7h8.mp4`

## Production Recommendations

1. **Storage**: Set `max_storage_gb` based on available disk space
2. **Retention**: Adjust `retention_days` based on business needs
3. **Compression**: Enable for space savings, adjust quality as needed
4. **Monitoring**: Keep enabled for production insights
5. **Backup**: Enable for critical production environments

## Scaling Considerations

- Use external storage (AWS S3, Google Cloud) for large-scale deployments
- Implement database tracking for enterprise features
- Consider CDN integration for video delivery
- Add user-specific storage quotas for multi-tenant systems