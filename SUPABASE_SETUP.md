# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Fill in the details:
   - Project Name: `vibestatss` (or your preferred name)
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
4. Click **Create new project**
5. Wait for the project to be provisioned (~2 minutes)

## Step 2: Get API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)
   - **service_role** key (under Project API keys) - ⚠️ Keep this secret!

## Step 3: Update Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 4: Create Database Tables

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** or press `Ctrl+Enter`

This will create:
- `users` table
- Indexes for performance
- Row Level Security policies
- Auto-update timestamp trigger

## Step 5: Verify Setup

1. Go to **Table Editor** in Supabase Dashboard
2. You should see the `users` table
3. Click on it to view the schema

## Step 6: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Go to `/login` and sign in with Twitter
3. After successful login, check Supabase:
   - Go to **Table Editor** → **users**
   - You should see your user data!

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key (auto-generated) |
| twitter_id | TEXT | Twitter user ID (unique) |
| username | TEXT | Twitter username |
| name | TEXT | Display name |
| email | TEXT | Email (nullable) |
| profile_image_url | TEXT | Profile picture URL |
| created_at | TIMESTAMP | When user was created |
| updated_at | TIMESTAMP | Last update (auto-updated) |

## Security Notes

- ✅ Row Level Security (RLS) is enabled
- ✅ Users can only read their own data
- ✅ Service role key is used server-side for admin operations
- ⚠️ Never expose service role key in client-side code
- ⚠️ Keep your `.env.local` file out of version control

## Next Steps

After Supabase is set up, you can:
- Add user profiles
- Store user-generated content
- Implement additional features
- Add real-time subscriptions
- Use Supabase Storage for media files
