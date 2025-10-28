# OAuth Redirect URI Fix - Deployment Guide

## Problem Fixed ✅
Updated the code to automatically detect the correct base URL for OAuth redirects in both development and production environments.

## Required Actions

### 1. Update Vercel Environment Variables

Go to your Vercel dashboard and add/update these environment variables:

1. Visit: https://vercel.com/your-project/settings/environment-variables
2. Add or update the `NEXTAUTH_URL` variable:
   - **Name:** `NEXTAUTH_URL`
   - **Value:** `https://masterunion.vercel.app`
3. Redeploy your application

### 2. Add Redirect URI to Google Cloud Console

You need to add your production redirect URI to your Google OAuth credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID (the one being used)
4. Under **Authorized redirect URIs**, add:
   ```
   https://masterunion.vercel.app/api/auth/callback/google
   ```
5. Click **Save**

**Important:** Make sure BOTH redirect URIs are listed:
- `http://localhost:3000/api/auth/callback/google` (for local development)
- `https://masterunion.vercel.app/api/auth/callback/google` (for production)

### 3. Verify All Required Environment Variables in Vercel

Make sure all these environment variables are set in Vercel:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (set to `https://masterunion.vercel.app`)

### 4. Commit and Push Your Changes

```bash
git add .
git commit -m "Fix OAuth redirect URI for production deployment"
git push
```

### 5. Verify the Fix

After redeploying:
1. Visit `https://masterunion.vercel.app`
2. Try signing in with Google
3. The redirect URI should now be correct

## What Was Changed?

The code now uses a smart `getBaseUrl()` function that:
- Uses `NEXTAUTH_URL` if explicitly set
- Falls back to Vercel's `VERCEL_URL` environment variable
- Defaults to your production domain or localhost based on the environment

This ensures OAuth works correctly in both development and production without code changes.

