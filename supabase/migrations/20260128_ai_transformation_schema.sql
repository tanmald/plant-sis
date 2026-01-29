-- AI Transformation Database Schema
-- This migration adds tables and functions needed for AI-driven features

-- ============================================================================
-- 1. AI Plant Analyses Table
-- ============================================================================
-- Comprehensive AI analysis results (replaces basic plant_identifications)
CREATE TABLE ai_plant_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE NOT NULL,
  photo_id UUID REFERENCES plant_photos(id) ON DELETE SET NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('initial_identification', 'check_in_photo', 'health_monitoring')),

  -- Identification results
  identified_species TEXT,
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),

  -- Health assessment
  health_status TEXT CHECK (health_status IN ('thriving', 'good', 'at_risk', 'critical')),
  insights JSONB DEFAULT '[]'::jsonb, -- Array of insight strings
  recommendations JSONB DEFAULT '[]'::jsonb, -- Array of care recommendations
  risk_flags JSONB DEFAULT '[]'::jsonb, -- Array of detected issues

  -- AI metadata
  ai_model_used TEXT NOT NULL, -- 'claude-3-5-sonnet', 'claude-3-haiku', 'gpt-4-vision'
  tokens_used INTEGER, -- For cost tracking
  processing_time_ms INTEGER, -- Performance tracking

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for ai_plant_analyses
CREATE INDEX idx_ai_analyses_plant_id ON ai_plant_analyses(plant_id);
CREATE INDEX idx_ai_analyses_created_at ON ai_plant_analyses(created_at DESC);
CREATE INDEX idx_ai_analyses_health_status ON ai_plant_analyses(health_status);
CREATE INDEX idx_ai_analyses_analysis_type ON ai_plant_analyses(analysis_type);

-- ============================================================================
-- 2. Notifications Table
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plant_id UUID REFERENCES plants(id) ON DELETE CASCADE,

  -- Notification content
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'check_in_reminder',
    'health_alert',
    'care_tip',
    'milestone',
    'seasonal',
    'pattern_insight'
  )),
  title TEXT NOT NULL,
  body TEXT NOT NULL,

  -- Context and triggers
  trigger_reason JSONB, -- What caused this notification (AI analysis, schedule, milestone)
  action_url TEXT, -- Deep link to relevant page

  -- Delivery and engagement tracking
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  action_taken_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_plant_id ON notifications(plant_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_read_at ON notifications(read_at);
CREATE INDEX idx_notifications_type ON notifications(notification_type);

-- ============================================================================
-- 3. Check-In Schedules Table
-- ============================================================================
CREATE TABLE check_in_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID UNIQUE REFERENCES plants(id) ON DELETE CASCADE NOT NULL,

  -- Schedule data
  next_check_in_date TIMESTAMP WITH TIME ZONE NOT NULL,
  check_in_frequency_days INTEGER NOT NULL DEFAULT 7 CHECK (check_in_frequency_days > 0),

  -- AI calculation context
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculation_factors JSONB, -- What AI considered: species, health, season, user patterns

  -- User preferences
  user_override_frequency INTEGER, -- User-set frequency (overrides AI)
  snoozed_until TIMESTAMP WITH TIME ZONE, -- Temporary snooze

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for check_in_schedules
CREATE INDEX idx_schedules_next_check_in ON check_in_schedules(next_check_in_date);
CREATE INDEX idx_schedules_plant_id ON check_in_schedules(plant_id);

-- ============================================================================
-- 4. Extend User Profiles Table
-- ============================================================================
-- Add AI and notification fields to existing user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS ai_analyses_used_this_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS check_ins_used_this_month INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"push": true, "email": false, "in_app": true}'::jsonb,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- ============================================================================
-- 5. Row Level Security (RLS) Policies
-- ============================================================================

-- ai_plant_analyses: Users can only see analyses for their own plants
ALTER TABLE ai_plant_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plant analyses"
  ON ai_plant_analyses FOR SELECT
  USING (
    plant_id IN (
      SELECT id FROM plants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analyses for their plants"
  ON ai_plant_analyses FOR INSERT
  WITH CHECK (
    plant_id IN (
      SELECT id FROM plants WHERE user_id = auth.uid()
    )
  );

-- notifications: Users can only see their own notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- check_in_schedules: Users can only see schedules for their own plants
ALTER TABLE check_in_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plant schedules"
  ON check_in_schedules FOR SELECT
  USING (
    plant_id IN (
      SELECT id FROM plants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own plant schedules"
  ON check_in_schedules FOR UPDATE
  USING (
    plant_id IN (
      SELECT id FROM plants WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert schedules for their plants"
  ON check_in_schedules FOR INSERT
  WITH CHECK (
    plant_id IN (
      SELECT id FROM plants WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- 6. Database Functions
-- ============================================================================

-- Function to increment AI usage counter
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles
  SET ai_analyses_used_this_month = ai_analyses_used_this_month + 1
  WHERE id = p_user_id;
END;
$$;

-- Function to increment check-in usage counter
CREATE OR REPLACE FUNCTION increment_checkin_usage(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles
  SET check_ins_used_this_month = check_ins_used_this_month + 1
  WHERE id = p_user_id;
END;
$$;

-- Function to reset monthly AI quotas (run via cron on 1st of month)
CREATE OR REPLACE FUNCTION reset_monthly_ai_quotas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles
  SET
    ai_analyses_used_this_month = 0,
    check_ins_used_this_month = 0;
END;
$$;

-- Function to update check-in schedule after a check-in
CREATE OR REPLACE FUNCTION update_check_in_schedule_after_checkin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_frequency INTEGER;
BEGIN
  -- Get current frequency for this plant
  SELECT check_in_frequency_days INTO v_frequency
  FROM check_in_schedules
  WHERE plant_id = NEW.plant_id;

  -- If no schedule exists, create one with default 7-day frequency
  IF NOT FOUND THEN
    INSERT INTO check_in_schedules (plant_id, next_check_in_date, check_in_frequency_days)
    VALUES (NEW.plant_id, NOW() + INTERVAL '7 days', 7);
  ELSE
    -- Update next check-in date based on frequency
    UPDATE check_in_schedules
    SET
      next_check_in_date = NOW() + (v_frequency || ' days')::INTERVAL,
      last_calculated_at = NOW()
    WHERE plant_id = NEW.plant_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger to auto-update check-in schedule when check-in is created
CREATE TRIGGER on_check_in_created
  AFTER INSERT ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION update_check_in_schedule_after_checkin();

-- Function to get unread notification count (useful for badge)
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND read_at IS NULL;

  RETURN v_count;
END;
$$;

-- Function to check if user can use AI feature (quota check)
CREATE OR REPLACE FUNCTION can_use_ai_feature(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tier TEXT;
  v_used INTEGER;
  v_limit INTEGER;
BEGIN
  -- Get user's subscription tier and usage
  SELECT subscription_tier, ai_analyses_used_this_month
  INTO v_tier, v_used
  FROM user_profiles
  WHERE id = p_user_id;

  -- Set limits based on tier
  IF v_tier = 'pro' THEN
    RETURN TRUE; -- Unlimited for pro users
  ELSE
    v_limit := 3; -- Free tier: 3 per month
    RETURN v_used < v_limit;
  END IF;
END;
$$;

-- ============================================================================
-- 7. Initial Data / Defaults
-- ============================================================================

-- Create default check-in schedule for existing plants (7-day frequency)
INSERT INTO check_in_schedules (plant_id, next_check_in_date, check_in_frequency_days)
SELECT
  id,
  NOW() + INTERVAL '7 days',
  7
FROM plants
WHERE id NOT IN (SELECT plant_id FROM check_in_schedules)
ON CONFLICT (plant_id) DO NOTHING;

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE ai_plant_analyses IS 'Stores comprehensive AI analysis results for plant photos including species ID, health assessment, and recommendations';
COMMENT ON TABLE notifications IS 'Tracks all user notifications including check-in reminders, health alerts, and milestone celebrations';
COMMENT ON TABLE check_in_schedules IS 'Manages smart check-in scheduling with AI-calculated frequencies based on plant needs';

COMMENT ON FUNCTION increment_ai_usage IS 'Increments the monthly AI usage counter for a user (called after successful AI analysis)';
COMMENT ON FUNCTION reset_monthly_ai_quotas IS 'Resets all users monthly AI and check-in quotas (scheduled via cron for 1st of month)';
COMMENT ON FUNCTION can_use_ai_feature IS 'Checks if a user has remaining AI quota or is on Pro tier (returns boolean)';
