-- Add identity_preference column to user_profiles table
-- Allows users to personalize how they're addressed in the app
-- Options: 'female' -> "Plant Sis", 'male' -> "Plant Buddy", 'prefer-not-to-say' -> "plant parent"

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS identity_preference TEXT
  CHECK (identity_preference IN ('female', 'male', 'prefer-not-to-say'))
  DEFAULT 'prefer-not-to-say';

-- Create index for performance (identity_preference is frequently queried)
CREATE INDEX IF NOT EXISTS idx_user_profiles_identity_preference
  ON user_profiles(identity_preference);

-- Add documentation comment
COMMENT ON COLUMN user_profiles.identity_preference IS
  'User identity/gender preference for personalized messaging. Options: female (Plant Sis), male (Plant Buddy), prefer-not-to-say (plant parent)';
