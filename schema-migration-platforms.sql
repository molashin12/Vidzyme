-- Migration to add platforms support for multiple platforms per channel
-- Run this in your Supabase SQL Editor

-- Add platforms column to user_channels table
ALTER TABLE public.user_channels 
ADD COLUMN IF NOT EXISTS platforms TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Update existing records to populate platforms array from channel_type
UPDATE public.user_channels 
SET platforms = ARRAY[channel_type] 
WHERE platforms = ARRAY[]::TEXT[] OR platforms IS NULL;

-- Add constraint to ensure platforms array is not empty
ALTER TABLE public.user_channels 
ADD CONSTRAINT check_platforms_not_empty 
CHECK (array_length(platforms, 1) > 0);

-- Add constraint to ensure valid platform values
ALTER TABLE public.user_channels 
ADD CONSTRAINT check_valid_platforms 
CHECK (
    platforms <@ ARRAY['youtube', 'instagram', 'tiktok', 'linkedin', 'other']::TEXT[]
);

-- Update channel_type to be derived from first platform (for backward compatibility)
-- We'll keep channel_type for now but it will be managed automatically
CREATE OR REPLACE FUNCTION public.sync_channel_type_from_platforms()
RETURNS TRIGGER AS $$
BEGIN
    -- Set channel_type to the first platform in the platforms array
    IF array_length(NEW.platforms, 1) > 0 THEN
        NEW.channel_type := NEW.platforms[1];
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync channel_type when platforms change
DROP TRIGGER IF EXISTS sync_channel_type_trigger ON public.user_channels;
CREATE TRIGGER sync_channel_type_trigger
    BEFORE INSERT OR UPDATE OF platforms ON public.user_channels
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_channel_type_from_platforms();

-- Create index for platforms array for better query performance
CREATE INDEX IF NOT EXISTS idx_user_channels_platforms 
ON public.user_channels USING GIN (platforms);

COMMIT;