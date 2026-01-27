-- Add onboarding fields to user_profiles table
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS experience_level TEXT CHECK (experience_level IN ('newbie', 'growing', 'expert')),
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMP WITH TIME ZONE;

-- Allow users to insert their own profile (for onboarding flow)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles'
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON user_profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
