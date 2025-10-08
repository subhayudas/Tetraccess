# TetrAccess - Google OAuth 2.0 Authentication

A modern web application that implements Google OAuth 2.0 authentication and stores user credentials securely in Supabase.

## Features

- 🔐 **Google OAuth 2.0** - Secure authentication flow
- 💾 **Supabase Integration** - Store access tokens and refresh tokens
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Next.js 14** - Built with the latest Next.js App Router
- 🌙 **Dark Mode** - Automatic dark mode support
- 🔒 **Secure** - HTTP-only cookies for session management

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- A Google Cloud Project with OAuth 2.0 credentials
- A Supabase account and project

## Setup Instructions

### 1. Clone and Install

```bash
cd tetraccess
npm install
```

### 2. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen if you haven't already
6. Set the application type to "Web application"
7. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (for development)
   - Your production URL + `/api/auth/callback/google` (for production)
8. Copy the Client ID and Client Secret

### 3. Set Up Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select an existing one
3. Navigate to the SQL Editor
4. Run the SQL script from `supabase-setup.sql`:

```sql
-- Create the tetraccess table
CREATE TABLE IF NOT EXISTS public.tetraccess (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS tetraccess_email_idx ON public.tetraccess(email);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tetraccess ENABLE ROW LEVEL SECURITY;

-- Create policies as needed (see supabase-setup.sql for complete policies)
```

5. Get your Supabase URL and anon key from Settings > API

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-nextauth-secret-key-generate-one
NEXTAUTH_URL=http://localhost:3000
```

**Important**: 
- The `SUPABASE_SERVICE_ROLE_KEY` is required for storing tokens (found in Supabase Dashboard → Settings → API)
- Keep the service role key secret - never commit it or expose it client-side

To generate a secure `NEXTAUTH_SECRET`, run:

```bash
openssl rand -base64 32
```

### 5. Run the Application

Development mode:

```bash
npm run dev
```

Production build:

```bash
npm run build
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## How It Works

1. **User clicks "Continue with Google"** - Redirects to Google OAuth consent screen
2. **User authorizes the application** - Google redirects back with an authorization code
3. **Exchange code for tokens** - Backend exchanges the code for access and refresh tokens
4. **Get user information** - Fetch user profile from Google
5. **Store in Supabase** - Save email, access_token, and refresh_token in the `tetraccess` table
6. **Create session** - Set HTTP-only cookies for secure session management
7. **Redirect to dashboard** - User sees their profile and authentication status

## Database Schema

The `tetraccess` table includes:

- `id` (UUID) - Primary key
- `email` (TEXT) - User's email address (unique)
- `access_token` (TEXT) - Google OAuth access token
- `refresh_token` (TEXT) - Google OAuth refresh token
- `created_at` (TIMESTAMP) - Record creation time
- `updated_at` (TIMESTAMP) - Last update time

## Security Features

- ✅ Row Level Security (RLS) enabled on Supabase
- ✅ HTTP-only cookies for session management
- ✅ Secure token storage
- ✅ CSRF protection via SameSite cookies
- ✅ Automatic token refresh capability

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Google OAuth 2.0

## Project Structure

```
tetraccess/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── google/route.ts
│   │   │   ├── callback/google/route.ts
│   │   │   └── logout/route.ts
│   │   └── user/route.ts
│   ├── dashboard/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── google-auth.ts
│   └── supabase.ts
├── supabase-setup.sql
├── .env.example
├── package.json
└── README.md
```

## Troubleshooting

### OAuth Error: redirect_uri_mismatch
- Ensure the redirect URI in Google Cloud Console matches exactly: `http://localhost:3000/api/auth/callback/google`

### Supabase Connection Error
- Verify your Supabase URL and anon key are correct
- Check if the `tetraccess` table exists in your database

### Session Not Persisting
- Make sure cookies are enabled in your browser
- Check that `NEXTAUTH_URL` matches your application URL

## License

MIT

## Support

For issues and questions, please open an issue on the GitHub repository.

