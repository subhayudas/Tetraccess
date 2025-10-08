# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 1️⃣ Install Dependencies

```bash
npm install
```

## 2️⃣ Set Up Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

### Supabase (Get from: Supabase Dashboard → Settings → API)
- `NEXT_PUBLIC_SUPABASE_URL` - Your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your service_role key ⚠️ Keep secret!

### Google OAuth (Get from: Google Cloud Console → Credentials)
- `GOOGLE_CLIENT_ID` - Your OAuth 2.0 Client ID
- `GOOGLE_CLIENT_SECRET` - Your OAuth 2.0 Client Secret
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - `http://localhost:3000` (for dev)

## 3️⃣ Set Up Database

1. Open Supabase Dashboard → SQL Editor
2. Copy all content from `supabase-setup.sql`
3. Paste and run it

## 4️⃣ Set Up Google OAuth

1. Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add redirect URI: `http://localhost:3000/api/auth/callback/google`

## 5️⃣ Verify Setup

```bash
npm run setup-check
```

This will verify:
- ✅ All environment variables are set
- ✅ Supabase connection works
- ✅ Database table exists
- ✅ Permissions are correct

## 6️⃣ Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🧪 Test the Flow

1. Click "Continue with Google"
2. Sign in with your Google account
3. Check dashboard - should show your profile
4. Verify in Supabase Table Editor → tetraccess table
5. You should see your email, access_token, and refresh_token!

---

## ❌ Troubleshooting

### "Missing environment variables"
→ Run `npm run verify-env` to see what's missing

### "Cannot connect to Supabase"
→ Run `npm run test-supabase` to diagnose

### "redirect_uri_mismatch"
→ Check Google Cloud Console redirect URI matches exactly:
  `http://localhost:3000/api/auth/callback/google`

### "Tokens not saving"
→ Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (not the anon key)

---

## 📚 Full Documentation

See `SETUP-GUIDE.md` for detailed step-by-step instructions.

