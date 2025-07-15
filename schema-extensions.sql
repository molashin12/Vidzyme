-- Schema Extensions for Vidzyme
-- Additional tables for channel management and scheduled video generation

-- User channels/pages table
CREATE TABLE IF NOT EXISTS public.user_channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    channel_name TEXT NOT NULL,
    channel_description TEXT,
    channel_type TEXT NOT NULL DEFAULT 'youtube' CHECK (channel_type IN ('youtube', 'instagram', 'tiktok', 'linkedin', 'other')),
    channel_url TEXT,
    target_audience TEXT,
    content_style TEXT,
    posting_frequency TEXT,
    preferred_video_length INTEGER DEFAULT 60, -- in seconds
    preferred_voice TEXT DEFAULT 'alloy',
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, channel_name)
);

-- Scheduled video generation table
CREATE TABLE IF NOT EXISTS public.scheduled_videos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    channel_id UUID REFERENCES public.user_channels(id) ON DELETE CASCADE,
    title_template TEXT,
    prompt_template TEXT NOT NULL,
    schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'custom')),
    schedule_time TIME NOT NULL DEFAULT '09:00:00',
    schedule_days INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Monday, 7=Sunday
    next_execution TIMESTAMP WITH TIME ZONE,
    last_execution TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    auto_publish BOOLEAN DEFAULT FALSE,
    max_executions INTEGER, -- NULL for unlimited
    execution_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video generation queue table
CREATE TABLE IF NOT EXISTS public.video_queue (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    scheduled_video_id UUID REFERENCES public.scheduled_videos(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES public.user_channels(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    voice TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 60,
    priority INTEGER DEFAULT 5, -- 1=highest, 10=lowest
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    scheduled_for TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    video_id UUID REFERENCES public.videos(id) ON DELETE SET NULL,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User onboarding status table
CREATE TABLE IF NOT EXISTS public.user_onboarding (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    step_completed INTEGER DEFAULT 0, -- 0=not started, 1=profile, 2=channel, 3=completed
    completed_at TIMESTAMP WITH TIME ZONE,
    skipped BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_channels_user_id ON public.user_channels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_channels_is_primary ON public.user_channels(user_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_videos_user_id ON public.scheduled_videos(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_videos_next_execution ON public.scheduled_videos(next_execution) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_video_queue_status ON public.video_queue(status);
CREATE INDEX IF NOT EXISTS idx_video_queue_scheduled_for ON public.video_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_video_queue_priority ON public.video_queue(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON public.user_onboarding(user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_user_channels_updated_at BEFORE UPDATE ON public.user_channels
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_videos_updated_at BEFORE UPDATE ON public.scheduled_videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_queue_updated_at BEFORE UPDATE ON public.video_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_onboarding_updated_at BEFORE UPDATE ON public.user_onboarding
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.user_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_channels
CREATE POLICY "Users can view own channels" ON public.user_channels
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own channels" ON public.user_channels
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channels" ON public.user_channels
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own channels" ON public.user_channels
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scheduled_videos
CREATE POLICY "Users can view own scheduled videos" ON public.scheduled_videos
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scheduled videos" ON public.scheduled_videos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scheduled videos" ON public.scheduled_videos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scheduled videos" ON public.scheduled_videos
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for video_queue
CREATE POLICY "Users can view own video queue" ON public.video_queue
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own video queue" ON public.video_queue
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own video queue" ON public.video_queue
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_onboarding
CREATE POLICY "Users can view own onboarding" ON public.user_onboarding
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own onboarding" ON public.user_onboarding
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding" ON public.user_onboarding
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to handle new user onboarding initialization
CREATE OR REPLACE FUNCTION public.initialize_user_onboarding()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_onboarding (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the existing handle_new_user function to include onboarding
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User')
    );
    
    INSERT INTO public.user_profiles (user_id)
    VALUES (NEW.id);
    
    INSERT INTO public.user_onboarding (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate next execution time for scheduled videos
CREATE OR REPLACE FUNCTION public.calculate_next_execution(
    schedule_type_param TEXT,
    schedule_time_param TIME,
    schedule_days_param INTEGER[],
    current_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    next_exec TIMESTAMP WITH TIME ZONE;
    current_date DATE;
    current_dow INTEGER; -- day of week (1=Monday, 7=Sunday)
    target_dow INTEGER;
    days_ahead INTEGER;
BEGIN
    current_date := current_time::DATE;
    current_dow := EXTRACT(ISODOW FROM current_time); -- ISO day of week
    
    CASE schedule_type_param
        WHEN 'daily' THEN
            -- Next execution is today if time hasn't passed, otherwise tomorrow
            next_exec := current_date + schedule_time_param;
            IF next_exec <= current_time THEN
                next_exec := next_exec + INTERVAL '1 day';
            END IF;
            
        WHEN 'weekly' THEN
            -- Find the next day in schedule_days_param
            target_dow := NULL;
            
            -- First, check if any day today or later this week
            FOR i IN 1..array_length(schedule_days_param, 1) LOOP
                IF schedule_days_param[i] >= current_dow THEN
                    IF schedule_days_param[i] = current_dow THEN
                        -- Today - check if time has passed
                        next_exec := current_date + schedule_time_param;
                        IF next_exec > current_time THEN
                            target_dow := schedule_days_param[i];
                            EXIT;
                        END IF;
                    ELSE
                        target_dow := schedule_days_param[i];
                        EXIT;
                    END IF;
                END IF;
            END LOOP;
            
            -- If no day found this week, use first day of next week
            IF target_dow IS NULL THEN
                target_dow := schedule_days_param[1];
                days_ahead := (7 - current_dow) + target_dow;
            ELSE
                days_ahead := target_dow - current_dow;
            END IF;
            
            next_exec := current_date + (days_ahead || ' days')::INTERVAL + schedule_time_param;
            
        WHEN 'monthly' THEN
            -- Next execution is same day next month
            next_exec := (current_date + INTERVAL '1 month') + schedule_time_param;
            
        ELSE
            -- Default to daily
            next_exec := current_date + schedule_time_param;
            IF next_exec <= current_time THEN
                next_exec := next_exec + INTERVAL '1 day';
            END IF;
    END CASE;
    
    RETURN next_exec;
END;
$$ LANGUAGE plpgsql;

-- Function to update next execution time for scheduled videos
CREATE OR REPLACE FUNCTION public.update_scheduled_video_next_execution()
RETURNS TRIGGER AS $$
BEGIN
    NEW.next_execution := public.calculate_next_execution(
        NEW.schedule_type,
        NEW.schedule_time,
        NEW.schedule_days,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically calculate next execution time
CREATE TRIGGER calculate_next_execution_trigger
    BEFORE INSERT OR UPDATE OF schedule_type, schedule_time, schedule_days
    ON public.scheduled_videos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_scheduled_video_next_execution();

-- Grant permissions
GRANT ALL ON public.user_channels TO anon, authenticated;
GRANT ALL ON public.scheduled_videos TO anon, authenticated;
GRANT ALL ON public.video_queue TO anon, authenticated;
GRANT ALL ON public.user_onboarding TO anon, authenticated;

-- Enable realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_channels;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_videos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.video_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_onboarding;

COMMIT;