-- Initial Schema Migration
-- Created: 2024-12-03
-- Description: Create users table with Twitter OAuth support

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twitter_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  name TEXT,
  email TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on twitter_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_twitter_id ON users(twitter_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read their own data
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Allow service role to do everything (for server-side operations)
CREATE POLICY "Service role can do everything"
  ON users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
