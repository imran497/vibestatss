-- Add google_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;

-- Make twitter_id and username nullable since Google users won't have them
ALTER TABLE users ALTER COLUMN twitter_id DROP NOT NULL;
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;

-- Note: We keep email nullable to support existing Twitter users who may not have email
-- Google users will always have email set during user creation

-- Add check constraint to ensure either google_id or twitter_id exists
ALTER TABLE users ADD CONSTRAINT user_has_auth_provider
  CHECK (google_id IS NOT NULL OR twitter_id IS NOT NULL);

-- Create index on google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
