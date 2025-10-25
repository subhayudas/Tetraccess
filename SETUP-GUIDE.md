# 🚀 Complete Setup Guide for TetrAccess

This guide will walk you through setting up the Google OAuth authentication app with Supabase storage.

## ✅ Prerequisites

- Node.js 18 or later
- A Google Cloud account
- A Supabase account

---

## 📋 Step-by-Step Setup

### 1. Install Dependencies

```bash
cd /Users/subhayudas/Desktop/tetraccess
npm install
```

### 2. Set Up Google OAuth 2.0

#### A. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Select a project"** → **"New Project"**
3. Enter project name (e.g., "TetrAccess") and click **Create**

#### B. Enable OAuth Consent Screen
1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Choose **External** user type (or Internal if you have Google Workspace)
3. Fill in required fields:
   - App name: `TetrAccess`
   - User support email: Your email
   - Developer contact email: Your email
4. Click **Save and Continue**
5. Skip the Scopes section (click **Save and Continue**)
6. Add test users (your email) if using External
7. Click **Save and Continue**

#### C. Create OAuth 2.0 Credentials
1. Navigate to **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth 2.0 Client ID**
3. Choose **Web application** as application type
4. Set name: `TetrAccess Web Client`
5. Add **Authorized redirect URIs**:
   - For development: `http://localhost:3000/api/auth/callback/google`
   - For production: `https://yourdomain.com/api/auth/callback/google`
6. Click **Create**
7. **SAVE YOUR CLIENT ID AND CLIENT SECRET** (you'll need them next)

### 3. Set Up Supabase

#### A. Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click **New Project**
3. Fill in:
   - Name: `tetraccess`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
4. Click **Create new project** (wait ~2 minutes)

#### B. Run SQL Setup
1. In your Supabase project, navigate to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the entire contents of `supabase-setup.sql`
4. Click **Run** or press `Ctrl/Cmd + Enter`
5. You should see: "Success. No rows returned"

#### C. Get Supabase Keys
1. Navigate to **Settings** → **API** (left sidebar)
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)
   - **service_role** key (under Project API keys) - **Keep this secret!**

### 4. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
NEXTAUTH_SECRET=your-generated-secret-here
NEXTAUTH_URL=http://localhost:3000
```

To generate `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 5. Run the Application

Development mode:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing the Application

### Test Flow:
1. **Visit** `http://localhost:3000`
2. **Click** "Continue with Google"
3. **Sign in** with your Google account
4. **Grant permissions** when prompted
5. **You should be redirected** to `/dashboard`
6. **Your dashboard** will show:
   - Your Google profile picture
   - Your name and email
   - Authentication status showing "Connected"

### Verify in Supabase:
1. Go to your Supabase project
2. Navigate to **Table Editor** → **tetraccess**
3. You should see a row with:
   - Your email
   - Your access_token (long string starting with "ya29.")
   - Your refresh_token (if provided)
   - Timestamps

---

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
- **Solution**: Make sure the redirect URI in Google Cloud Console exactly matches:
  `http://localhost:3000/api/auth/callback/google` (for dev)

### Error: "Failed to save credentials"
- **Solution**: 
  - Check that `SUPABASE_SERVICE_ROLE_KEY` is set correctly in `.env`
  - Verify the SQL script ran successfully in Supabase
  - Check Supabase logs in Dashboard → Logs

### Error: "Cannot connect to Supabase"
- **Solution**: Verify your `NEXT_PUBLIC_SUPABASE_URL` and keys are correct

### Tokens not showing in database
- **Solution**: 
  - Check browser console for errors
  - Check terminal/console logs for error messages
  - Ensure you're using the service_role key (not anon key) in the server code

### Session not persisting
- **Solution**: 
  - Clear browser cookies
  - Check that cookies are enabled
  - Verify `NEXTAUTH_URL` matches your current URL

---

## 🔒 Security Notes

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Service Role Key** - This bypasses Row Level Security, keep it secret
3. **Production Setup**: 
   - Use environment variables in your hosting platform
   - Enable HTTPS (cookies marked secure)
   - Rotate secrets regularly
4. **Token Storage**: Tokens are stored securely in Supabase with encryption at rest

---

## 📊 How It Works

```
User clicks "Sign in with Google"
           ↓
Redirect to Google OAuth consent screen
           ↓
User grants permissions
           ↓
Google redirects back with authorization code
           ↓
Backend exchanges code for tokens (access + refresh)
           ↓
Fetch user info from Google
           ↓
Store tokens in Supabase (tetraccess table)
           ↓
Create session cookies (HTTP-only, secure)
           ↓
Redirect to dashboard
```

---

## 🚀 Production Deployment

### Environment Variables to Set:
- All variables from `.env.example`
- Update `NEXTAUTH_URL` to your production domain
- Update Google OAuth redirect URI to production URL

### Platforms:
- **Vercel**: Automatically detects Next.js, just add env vars
- **Netlify**: Use Netlify CLI or web interface for env vars
- **Railway/Render**: Add env vars in project settings

---

## 📝 Need Help?

1. Check the main `README.md` for additional information
2. Review the code comments in `lib/supabase.ts` and `lib/google-auth.ts`
3. Check browser DevTools Console for client-side errors
4. Check terminal for server-side errors
5. Review Supabase logs in the Dashboard

---

## ✨ What's Stored in Supabase

When a user signs in, the following is stored:

| Field | Description | Example |
|-------|-------------|---------|
| `id` | UUID primary key | `550e8400-e29b-41d4...` |
| `email` | User's Google email | `user@gmail.com` |
| `access_token` | OAuth access token | `ya29.a0AfB_byC...` |
| `refresh_token` | OAuth refresh token | `1//0gLhN5...` |
| `created_at` | First login timestamp | `2025-10-08 10:30:00` |
| `updated_at` | Last update timestamp | `2025-10-08 10:30:00` |

The `upsert` operation ensures:
- **First login**: Creates new record
- **Subsequent logins**: Updates existing record with new tokens


