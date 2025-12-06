# Twitter/X OAuth Setup Guide

## Step 1: Create a Twitter Developer App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/projects-and-apps)
2. Sign in with your Twitter account
3. Create a new Project (if you don't have one)
4. Create a new App within the project
5. Note down your **Client ID** and **Client Secret**

## Step 2: Configure OAuth Settings

In your Twitter App settings:

1. Navigate to **User authentication settings**
2. Click **Set up** or **Edit**
3. Configure the following:

   **App permissions:**
   - Select: `Read`

   **Type of App:**
   - Select: `Web App`

   **App info:**
   - Callback URI: `http://localhost:3000/api/auth/twitter/callback`
   - Website URL: `http://localhost:3000`

4. Save the settings

## Step 3: Set Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your credentials:
   ```env
   TWITTER_CLIENT_ID=your_actual_client_id
   TWITTER_CLIENT_SECRET=your_actual_client_secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   SESSION_SECRET=generate_random_string_here
   ```

3. Generate a random session secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Step 4: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`
3. Click "Continue with X"
4. You should be redirected to Twitter for authorization
5. After authorization, you'll be redirected back to `/creator`

## Production Deployment

When deploying to production:

1. Update callback URI in Twitter Developer Portal:
   - `https://yourdomain.com/api/auth/twitter/callback`

2. Update environment variables:
   ```env
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

## Current Implementation Status

✅ OAuth 2.0 with PKCE flow
✅ User authentication
✅ Basic session management (cookie-based)
⏳ Database integration (TODO)
⏳ Advanced session management (TODO)
⏳ User profile management (TODO)

## Next Steps

1. Set up a database (e.g., PostgreSQL, MongoDB)
2. Create user model/schema
3. Implement proper session management (e.g., using NextAuth.js or custom JWT)
4. Add user profile page
5. Implement logout functionality
