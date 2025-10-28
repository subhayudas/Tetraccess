# 🔄 Token Storage Flow - Visual Guide

This document shows exactly how access_token and refresh_token are stored in Supabase.

---

## 📊 Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Click "Sign in  │
                    │   with Google"   │
                    └──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GOOGLE OAUTH FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│  1. Redirect to Google consent screen                           │
│  2. User grants permissions                                      │
│  3. Google redirects back with authorization code               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    /api/auth/callback/google
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  TOKEN EXCHANGE (getGoogleTokens)                │
├─────────────────────────────────────────────────────────────────┤
│  POST https://oauth2.googleapis.com/token                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Request Body:                                              │ │
│  │ - code: "authorization_code_from_google"                  │ │
│  │ - client_id: GOOGLE_CLIENT_ID                             │ │
│  │ - client_secret: GOOGLE_CLIENT_SECRET                     │ │
│  │ - redirect_uri: http://localhost:3000/api/auth/callback  │ │
│  │ - grant_type: "authorization_code"                        │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Response (tokens object):                                  │ │
│  │ {                                                          │ │
│  │   access_token: "ya29.a0AfB_byC...",      ← STORE THIS   │ │
│  │   refresh_token: "1//0gLhN5TnI...",       ← STORE THIS   │ │
│  │   expires_in: 3599,                                       │ │
│  │   token_type: "Bearer",                                   │ │
│  │   id_token: "eyJhbGci..."                                 │ │
│  │ }                                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              GET USER INFO (getGoogleUser)                       │
├─────────────────────────────────────────────────────────────────┤
│  GET https://www.googleapis.com/oauth2/v2/userinfo              │
│  Authorization: Bearer {access_token}                           │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Response (userInfo object):                                │ │
│  │ {                                                          │ │
│  │   email: "user@gmail.com",                ← STORE THIS   │ │
│  │   name: "John Doe",                                       │ │
│  │   picture: "https://...",                                 │ │
│  │   verified_email: true                                    │ │
│  │ }                                                          │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           SAVE TO SUPABASE (saveUserCredentials)                │
├─────────────────────────────────────────────────────────────────┤
│  File: lib/supabase.ts                                          │
│                                                                  │
│  const data = {                                                 │
│    email: userInfo.email,              // "user@gmail.com"     │
│    access_token: tokens.access_token,  // "ya29.a0..."         │
│    refresh_token: tokens.refresh_token // "1//0g..."           │
│  }                                                              │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Database Operation:                                        │ │
│  │                                                            │ │
│  │ supabaseAdmin                      ← Uses SERVICE ROLE    │ │
│  │   .from('tetraccess')                                     │ │
│  │   .upsert({                                               │ │
│  │     email: "user@gmail.com",                              │ │
│  │     access_token: "ya29.a0...",    ✅ STORED              │ │
│  │     refresh_token: "1//0g...",     ✅ STORED              │ │
│  │   }, {                                                    │ │
│  │     onConflict: 'email'                                   │ │
│  │   })                                                      │ │
│  │                                                            │ │
│  │ First login:  → INSERT new row                            │ │
│  │ Return login: → UPDATE existing row                       │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                             │
├─────────────────────────────────────────────────────────────────┤
│  Table: tetraccess                                              │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ id          | email           | access_token  | refresh_... ││
│  ├────────────────────────────────────────────────────────────┤│
│  │ uuid-123... | user@gmail.com  | ya29.a0...   | 1//0g...   ││
│  │                                  ▲              ▲          ││
│  │                              STORED ✅      STORED ✅      ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   Create Session │
                    │   Cookies & Go   │
                    │   to Dashboard   │
                    └──────────────────┘
```

---

## 🔍 Code Trace - Line by Line

### Step 1: Callback Route Receives Code
**File**: `app/api/auth/callback/google/route.ts`
```typescript
Line 7:  const code = searchParams.get('code')
         // code = "4/0AeaY..."
```

### Step 2: Exchange Code for Tokens
**File**: `lib/google-auth.ts`
```typescript
Line 35-58: export async function getGoogleTokens(code: string)
Line 45:      const response = await fetch(url, { method: 'POST', ... })
Line 58:      return response.json()
              // Returns: { 
              //   access_token: "ya29.a0...", 
              //   refresh_token: "1//0g..." 
              // }
```

### Step 3: Extract Tokens
**File**: `app/api/auth/callback/google/route.ts`
```typescript
Line 20:  const tokens = await getGoogleTokens(code)
          // tokens.access_token = "ya29.a0..."
          // tokens.refresh_token = "1//0g..."
```

### Step 4: Get User Info
**File**: `app/api/auth/callback/google/route.ts`
```typescript
Line 24:  const userInfo = await getGoogleUser(tokens.access_token)
          // userInfo.email = "user@gmail.com"
```

### Step 5: Prepare Data Object
**File**: `app/api/auth/callback/google/route.ts`
```typescript
Line 28-32: await saveUserCredentials({
              email: userInfo.email,           // "user@gmail.com"
              access_token: tokens.access_token,    // "ya29.a0..."
              refresh_token: tokens.refresh_token,  // "1//0g..."
            })
```

### Step 6: Save to Database
**File**: `lib/supabase.ts`
```typescript
Line 30-43: export async function saveUserCredentials(data: TetraccessData)
Line 32:      const { error } = await supabaseAdmin  // ← Uses SERVICE ROLE KEY
Line 33:        .from('tetraccess')
Line 34:        .upsert({
Line 36:          email: data.email,              // ✅ SAVED
Line 37:          access_token: data.access_token,     // ✅ SAVED
Line 38:          refresh_token: data.refresh_token,   // ✅ SAVED
Line 40:        }, {
Line 41:          onConflict: 'email',  // Update if exists, insert if new
Line 42:        })
```

---

## ✅ Verification Checklist

### What Gets Stored:

| Field | Example Value | Source | Stored? |
|-------|---------------|--------|---------|
| `email` | `user@gmail.com` | Google user info | ✅ YES |
| `access_token` | `ya29.a0AfB_byC...` | Google OAuth token | ✅ YES |
| `refresh_token` | `1//0gLhN5TnI...` | Google OAuth token | ✅ YES |
| `created_at` | `2025-10-08 10:30:00` | Auto-generated | ✅ YES |
| `updated_at` | `2025-10-08 10:30:00` | Auto-generated | ✅ YES |

### First Login (Signup):
```sql
INSERT INTO tetraccess (email, access_token, refresh_token)
VALUES ('user@gmail.com', 'ya29.a0...', '1//0g...');
```
✅ Creates new record with tokens

### Return Login (Signin):
```sql
UPDATE tetraccess 
SET access_token = 'ya29.a0...', 
    refresh_token = '1//0g...',
    updated_at = NOW()
WHERE email = 'user@gmail.com';
```
✅ Updates existing record with new tokens

---

## 🔐 Why Service Role Key is Required

### Without Service Role Key (FAILS ❌):
```
supabase (anon key)
  → Checks RLS policies
  → Looks for auth.jwt()
  → Not found (we use Google OAuth, not Supabase Auth)
  → INSERT/UPDATE blocked
  → ❌ Tokens NOT saved
```

### With Service Role Key (WORKS ✅):
```
supabaseAdmin (service role key)
  → Bypasses all RLS policies
  → Direct database access
  → INSERT/UPDATE allowed
  → ✅ Tokens saved successfully
```

---

## 🧪 How to Confirm It's Working

### 1. Check Console Logs
After signing in, you should see:
```
✅ Successfully obtained OAuth tokens
✅ Successfully fetched user info for: user@gmail.com
✅ Successfully saved credentials to Supabase for: user@gmail.com
```

### 2. Check Supabase Dashboard
1. Go to Supabase Dashboard
2. Click **Table Editor** (left sidebar)
3. Select **tetraccess** table
4. You should see:

| email | access_token | refresh_token |
|-------|--------------|---------------|
| user@gmail.com | ya29.a0AfB_by... | 1//0gLhN5Tn... |

### 3. Run SQL Query
In Supabase SQL Editor:
```sql
SELECT 
    email,
    LEFT(access_token, 20) || '...' as access_token,
    CASE 
        WHEN refresh_token IS NOT NULL 
        THEN LEFT(refresh_token, 15) || '...' 
        ELSE 'NULL' 
    END as refresh_token,
    created_at
FROM tetraccess
ORDER BY created_at DESC
LIMIT 5;
```

Expected result:
```
email            | access_token        | refresh_token      | created_at
-----------------|---------------------|--------------------|-----------
user@gmail.com   | ya29.a0AfB_byC...  | 1//0gLhN5Tn...    | 2025-10-08...
```

---

## 🎯 Summary

✅ **Access token IS stored** in `access_token` column  
✅ **Refresh token IS stored** in `refresh_token` column  
✅ **Both signup and signin** use the same flow (upsert)  
✅ **Service role key** ensures tokens are saved (bypasses RLS)  
✅ **Error handling** logs any issues to console  
✅ **Verification scripts** available to test setup  

**Everything works correctly!** 🎉



