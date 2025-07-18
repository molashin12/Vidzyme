-- Thumbnail URL Database Optimization Migration
-- Run this in your Supabase SQL Editor to optimize thumbnail URL queries

-- Add index for thumbnail_url column for faster queries
CREATE INDEX IF NOT EXISTS idx_videos_thumbnail_url ON public.videos(thumbnail_url);

-- Add index for videos with non-null thumbnail URLs
CREATE INDEX IF NOT EXISTS idx_videos_has_thumbnail ON public.videos(id) WHERE thumbnail_url IS NOT NULL;

-- Add composite index for user videos with thumbnails
CREATE INDEX IF NOT EXISTS idx_videos_user_thumbnail ON public.videos(user_id, thumbnail_url) WHERE thumbnail_url IS NOT NULL;

-- Update the videos table comment to document the thumbnail_url field
COMMENT ON COLUMN public.videos.thumbnail_url IS 'URL path to the video thumbnail image, typically in format /outputs/thumbnails/{filename}.jpg';

-- Create a function to get videos with thumbnail statistics
CREATE OR REPLACE FUNCTION public.get_thumbnail_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_videos', COUNT(*),
        'videos_with_thumbnails', COUNT(*) FILTER (WHERE thumbnail_url IS NOT NULL),
        'videos_without_thumbnails', COUNT(*) FILTER (WHERE thumbnail_url IS NULL),
        'thumbnail_coverage_percentage', 
            ROUND(
                (COUNT(*) FILTER (WHERE thumbnail_url IS NOT NULL) * 100.0) / 
                NULLIF(COUNT(*), 0), 
                2
            )
    ) INTO result
    FROM public.videos;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to clean up broken thumbnail references
CREATE OR REPLACE FUNCTION public.cleanup_broken_thumbnail_urls()
RETURNS JSON AS $$
DECLARE
    updated_count INTEGER;
    result JSON;
BEGIN
    -- This function would typically be used with external validation
    -- For now, it just provides a framework for cleanup operations
    
    -- Count videos with thumbnail URLs (for reporting)
    SELECT COUNT(*) INTO updated_count
    FROM public.videos 
    WHERE thumbnail_url IS NOT NULL;
    
    SELECT json_build_object(
        'message', 'Thumbnail cleanup function ready',
        'videos_with_thumbnails', updated_count,
        'note', 'Use the Python utility script for actual cleanup operations'
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add a trigger to automatically update the updated_at timestamp when thumbnail_url changes
CREATE OR REPLACE FUNCTION update_thumbnail_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update timestamp if thumbnail_url actually changed
    IF OLD.thumbnail_url IS DISTINCT FROM NEW.thumbnail_url THEN
        NEW.updated_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_update_thumbnail_timestamp'
    ) THEN
        CREATE TRIGGER trigger_update_thumbnail_timestamp
            BEFORE UPDATE ON public.videos
            FOR EACH ROW
            EXECUTE FUNCTION update_thumbnail_timestamp();
    END IF;
END $$;

-- Grant necessary permissions for the utility functions
GRANT EXECUTE ON FUNCTION public.get_thumbnail_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_broken_thumbnail_urls() TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.get_thumbnail_stats() IS 'Returns statistics about thumbnail coverage across all videos';
COMMENT ON FUNCTION public.cleanup_broken_thumbnail_urls() IS 'Framework function for thumbnail cleanup operations';

-- Create a view for videos with thumbnail information
CREATE OR REPLACE VIEW public.videos_with_thumbnail_info AS
SELECT 
    v.*,
    CASE 
        WHEN v.thumbnail_url IS NOT NULL THEN true 
        ELSE false 
    END as has_thumbnail,
    CASE 
        WHEN v.thumbnail_url IS NOT NULL 
        THEN split_part(v.thumbnail_url, '/', -1) 
        ELSE NULL 
    END as thumbnail_filename
FROM public.videos v;

-- Grant access to the view
GRANT SELECT ON public.videos_with_thumbnail_info TO authenticated;

COMMENT ON VIEW public.videos_with_thumbnail_info IS 'Enhanced videos view with thumbnail information and helper fields';

-- Output completion message
SELECT 'Thumbnail URL database optimization completed successfully!' as message;