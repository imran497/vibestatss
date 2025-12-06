# Database Migrations

This directory contains all database migrations for the project.

## Directory Structure

```
supabase/
├── migrations/           # SQL migration files
│   └── 20241203000000_initial_schema.sql
├── run-migration.js     # Migration runner script
└── README.md           # This file
```

## Migration Naming Convention

Migrations are named with the following pattern:
```
YYYYMMDDHHMMSS_description.sql
```

Example: `20241203000000_initial_schema.sql`

## Running Migrations

### Method 1: Using the Script (Automated)

```bash
node supabase/run-migration.js 20241203000000_initial_schema.sql
```

### Method 2: Manual (via Supabase Dashboard)

1. Go to [Supabase SQL Editor](https://app.supabase.com)
2. Select your project
3. Click **New Query**
4. Copy and paste the migration SQL
5. Click **Run** (or `Ctrl+Enter`)

## Creating New Migrations

1. Create a new file in `supabase/migrations/` with timestamp and description:
   ```bash
   touch supabase/migrations/$(date +%Y%m%d%H%M%S)_add_user_preferences.sql
   ```

2. Write your SQL migration in the file

3. Run the migration:
   ```bash
   node supabase/run-migration.js <your-migration-file>.sql
   ```

## Example Migration

```sql
-- Migration: Add user preferences
-- Created: 2024-12-03

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'dark',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Best Practices

1. ✅ **Always use `IF NOT EXISTS`** for CREATE statements
2. ✅ **Include rollback scripts** (in comments or separate files)
3. ✅ **Test migrations** on a development database first
4. ✅ **One migration per feature/change**
5. ✅ **Never modify existing migrations** - create new ones instead
6. ✅ **Include descriptive comments** in your migrations

## Current Schema

### Users Table
- `id` - UUID (Primary Key)
- `twitter_id` - TEXT (Unique, Twitter user ID)
- `username` - TEXT (Twitter username)
- `name` - TEXT (Display name)
- `email` - TEXT (Email, nullable)
- `profile_image_url` - TEXT (Profile picture URL)
- `created_at` - TIMESTAMP (Auto-generated)
- `updated_at` - TIMESTAMP (Auto-updated via trigger)

## Troubleshooting

### Migration fails with permission error
- Ensure you're using the `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- Check that your Supabase project is active

### Table already exists error
- Use `IF NOT EXISTS` in CREATE statements
- Or manually drop the table first (⚠️ be careful in production)

### Need to rollback a migration?
- Create a new migration that reverses the changes
- Or manually run rollback SQL in Supabase Dashboard
