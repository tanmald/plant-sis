-- Fix AI Functions - Apply missing database functions
-- This handles the case where tables exist but functions don't

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

  -- If no profile found, return false
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Set limits based on tier
  IF v_tier = 'pro' THEN
    RETURN TRUE; -- Unlimited for pro users
  ELSE
    v_limit := 3; -- Free tier: 3 per month
    RETURN COALESCE(v_used, 0) < v_limit;
  END IF;
END;
$$;

-- Function to increment AI usage counter
CREATE OR REPLACE FUNCTION increment_ai_usage(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE user_profiles
  SET ai_analyses_used_this_month = COALESCE(ai_analyses_used_this_month, 0) + 1
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
  SET check_ins_used_this_month = COALESCE(check_ins_used_this_month, 0) + 1
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

COMMENT ON FUNCTION can_use_ai_feature IS 'Checks if a user has remaining AI quota or is on Pro tier (returns boolean)';
COMMENT ON FUNCTION increment_ai_usage IS 'Increments the monthly AI usage counter for a user (called after successful AI analysis)';
COMMENT ON FUNCTION reset_monthly_ai_quotas IS 'Resets all users monthly AI and check-in quotas (scheduled via cron for 1st of month)';
