# Supabase Setup Guide (Auth + Database)

This guide will help you set up both Supabase Auth and Supabase Database for GoalGuard.

## Why Supabase Auth?

✅ **Works everywhere** - Replit, your own server, Vercel, Netlify, anywhere  
✅ **Email authentication works immediately** - No OAuth setup required!  
✅ **Multiple providers** - Google, GitHub, Apple, Facebook, Twitter, and more (optional)  
✅ **Free tier** - 50,000 monthly active users on the free plan  
✅ **Built-in features** - Email verification, password reset, magic links  
✅ **Easy to use** - Simple SDK and great documentation

## Quick Start (Email Authentication)

**Good news!** Email/password authentication works immediately after setting up your Supabase project. No additional configuration needed!

1. Create a Supabase project (Step 1)
2. Add environment variables (Step 2-3)
3. **That's it! Your app is ready to use** ✅

OAuth providers (Google, GitHub, etc.) are optional and require extra setup (Step 4).  

---

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign in (or create an account)
3. Click "New Project"
4. Fill in the details:
   - **Name**: goalguard (or any name you prefer)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Free tier is perfect to start
5. Click "Create new project" and wait ~2 minutes for setup

---

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, click on **Settings** (gear icon in sidebar)
2. Click on **API** in the left menu
3. You'll see two important values:

### Project URL
```
https://your-project-id.supabase.co
```

### API Keys
- **anon (public) key** - Safe to use in your frontend
- **service_role (secret) key** - **KEEP THIS SECRET!** Only use on backend

Copy both keys - you'll need them in the next step.

---

## Step 3: Configure Environment Variables

### On Replit

1. Click the **Secrets** tool (lock icon) in the left sidebar
2. Add these secrets:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

⚠️ **Important**: Variables starting with `VITE_` are accessible in the frontend.

### For Local Development / Own Server

Create or update your `.env` file:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Existing configuration (keep these)
DATABASE_URL=your_postgres_url
SESSION_SECRET=your_session_secret
STRIPE_SECRET_KEY=your_stripe_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
```

---

## Step 4: Enable OAuth Providers (Optional)

**Note:** Email/password authentication already works! OAuth providers are optional extras.

If you want to add Google, GitHub, or other social login options, follow these steps:

### Enable Google Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** and click **Enable**
3. You'll need to create Google OAuth credentials:

#### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen first if prompted:
   - User Type: **External**
   - App name: **GoalGuard**
   - Support email: your email
   - Add scopes: email, profile (basic)
   - Add test users if needed
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **GoalGuard**
   - **Authorized JavaScript origins**: 
     - `https://your-project-id.supabase.co`
     - `https://your-domain.com` (if deployed)
     - `http://localhost:5000` (for local testing)
   - **Authorized redirect URIs**:
     - `https://your-project-id.supabase.co/auth/v1/callback`
7. Click **Create** and copy:
   - **Client ID**
   - **Client Secret**

#### Back in Supabase

1. Paste the **Client ID** and **Client Secret** into Supabase
2. Make sure **Enabled** is toggled ON
3. Click **Save**

### Enable GitHub Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **GitHub** and click **Enable**
3. You'll need to create a GitHub OAuth App:

#### Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: GoalGuard
   - **Homepage URL**: `https://your-domain.com` (or `http://localhost:5000` for testing)
   - **Authorization callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it

#### Back in Supabase

1. Paste the **Client ID** and **Client Secret**
2. Toggle **Enabled** ON
3. Click **Save**

### Other Providers (Optional)

Supabase supports many other providers:
- **Apple** - Requires Apple Developer account
- **Facebook** - Requires Facebook App
- **Twitter/X** - Requires Twitter Developer account
- **Microsoft** - Requires Azure AD
- **Discord**, **GitLab**, **Bitbucket**, **Slack**, and more!

Follow similar steps to Google/GitHub for any other provider.

---

## Step 5: Configure Redirect URLs

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Add your **Site URL**:
   - For Replit: `https://your-repl-name.your-username.repl.co`
   - For custom domain: `https://yourdomain.com`
   - For local: `http://localhost:5000`

3. Add **Redirect URLs** (comma-separated):
   ```
   https://your-repl-name.your-username.repl.co/,
   https://yourdomain.com/,
   http://localhost:5000/
   ```

⚠️ **Important**: The redirect URL must exactly match your application URL, including the trailing `/`

---

## Step 6: Test Your Setup

1. Restart your application (the code changes are already done!)
2. Navigate to your app URL
3. You should see the landing page with a "Get Started" card
4. **Test Email Authentication:**
   - Click the "Sign Up" tab
   - Enter your email and a password (min 6 characters)
   - Click "Create Account"
   - Check your email for a confirmation link
   - Click the link to confirm your account
   - Go back to the app and sign in!

5. **Test OAuth (if enabled):**
   - Click "Sign in with Google" or "Sign in with GitHub"
   - Authorize the app
   - You'll be redirected back and logged in!

### Troubleshooting

**"Invalid redirect URL"**
- Check that your redirect URL in Supabase matches exactly (including trailing `/`)
- Make sure the OAuth provider's authorized redirect includes the Supabase callback URL

**"Provider not enabled"**
- Go back to Supabase → Authentication → Providers
- Make sure the provider is toggled ON and saved

**"Invalid client credentials"**
- Double-check the Client ID and Client Secret in both Supabase and the OAuth provider
- Make sure there are no extra spaces when copying/pasting

**Authentication works but user data doesn't load**
- Check that all environment variables are set correctly
- Look at browser console for errors
- Check server logs for backend errors

---

## Step 7: Database Setup (Using Supabase PostgreSQL)

GoalGuard ist jetzt so konfiguriert, dass es die Supabase PostgreSQL-Datenbank verwendet.

### Database Connection String abrufen

1. Gehen Sie zu **Project Settings** → **Database** in Ihrem Supabase-Projekt
2. Scrollen Sie zu **Connection String**
3. Wählen Sie **URI** aus
4. Kopieren Sie die Connection String (sieht ungefähr so aus):
   ```
   postgresql://postgres.xxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

### DATABASE_URL in Replit setzen

**Für Development:**
1. Fügen Sie in Replit Secrets die `DATABASE_URL` hinzu:
   - Gehen Sie zu Tools → Secrets
   - Fügen Sie einen neuen Secret hinzu:
     - Key: `DATABASE_URL`
     - Value: Ihre Supabase Connection String

**Für Production (nach dem Publish):**
1. Gehen Sie zu Ihrem Deployment in Replit
2. Klicken Sie auf **Environment Variables**
3. Fügen Sie `DATABASE_URL` mit Ihrer Supabase Connection String hinzu

### Datenbank-Schema erstellen

Nach dem Einrichten der DATABASE_URL:

```bash
npm run db:push
```

Dieser Befehl erstellt alle notwendigen Tabellen (users, organizations, goals, etc.) in Ihrer Supabase-Datenbank.

### Betterplace.org Organisationen synchronisieren

Nachdem die Tabellen erstellt wurden, starten Sie die App:
- Die App wird automatisch 50 Organisationen von betterplace.org synchronisieren
- Oder rufen Sie manuell auf: `GET /api/organizations/init-sync`

### Wichtige Hinweise für Supabase Database

**SSL-Verbindung:**
Die App erkennt automatisch Supabase-Verbindungen und aktiviert SSL. Keine zusätzliche Konfiguration nötig!

SSL wird automatisch aktiviert für:
- Supabase-Datenbanken (supabase.co)
- AWS RDS-Datenbanken
- Neon-Datenbanken
- Wenn `DATABASE_SSL=true` oder `PGSSLMODE=require` gesetzt ist

**Connection Pooling:**
Supabase bietet Connection Pooling. Die Standard-Connection String verwendet bereits Port `6543` (Transaction Mode) für optimale Performance.

**Vorteile von Supabase Database:**
- ✅ Globale Verfügbarkeit
- ✅ Automatische Backups
- ✅ SQL Editor im Dashboard
- ✅ Realtime-Subscriptions (optional)
- ✅ Gleiche Datenbank wie Ihre Auth-Daten

---

## Features Included

✅ **Email/Password Authentication** - Works immediately, no OAuth setup required!  
✅ **Email Confirmation** - Secure sign-up with email verification  
✅ **Google Sign-In** (Optional) - One-click login with Google account  
✅ **GitHub Sign-In** (Optional) - Login with GitHub account  
✅ **Automatic user creation** - Users are created in your database on first login  
✅ **Session persistence** - Users stay logged in across page refreshes  
✅ **Token management** - Automatic token refresh, no manual handling needed  
✅ **Secure logout** - Clears all session data  

---

## Optional: Add More Features

### Email/Password Authentication

1. In Supabase → Authentication → Providers → Email
2. Toggle **Enable Email provider** ON
3. Configure:
   - **Enable Email Confirmations** - Require users to verify email (recommended)
   - **Secure Email Change** - Require re-authentication for email changes
4. You can now add email/password signup forms in your frontend

### Magic Links (Passwordless)

1. Same as Email/Password above
2. Use `supabase.auth.signInWithOtp({ email })` instead of password
3. Users click a link in their email to log in - no password needed!

### Phone Authentication

1. In Supabase → Authentication → Providers → Phone
2. Choose an SMS provider (Twilio, MessageBird, etc.)
3. Add provider credentials
4. Enable phone auth
5. Users can log in with phone number + SMS code

---

## Security Best Practices

✅ **Never commit secrets** - Add `.env` to `.gitignore`  
✅ **Use environment variables** - Store all keys as secrets/env vars  
✅ **Enable RLS** - Supabase Row Level Security (if using Supabase database)  
✅ **HTTPS only** - Always use HTTPS in production  
✅ **Rotate keys** - If keys are compromised, regenerate them in Supabase  

---

## Cost & Limits

**Supabase Free Tier:**
- 50,000 monthly active users
- 500MB database storage
- 1GB file storage
- 2GB bandwidth

**Paid Plans** (if you exceed free tier):
- Pro: $25/month
- Includes 100,000 MAU, more storage, better performance

---

## Next Steps

1. ✅ Customize the user experience
2. ✅ Add more OAuth providers
3. ✅ Set up email templates in Supabase
4. ✅ Configure password policies
5. ✅ Add profile editing functionality
6. ✅ Set up email notifications

---

## Need Help?

- **Supabase Docs**: https://supabase.com/docs/guides/auth
- **Discord**: https://discord.supabase.com
- **GitHub Issues**: https://github.com/supabase/supabase/issues

---

## Summary

You've successfully migrated from Replit Auth to Supabase Auth! Your app now:

- ✅ Works on Replit, your own server, or any hosting platform
- ✅ Supports Google and GitHub login (and can easily add more)
- ✅ Has secure, production-ready authentication
- ✅ Can be deployed anywhere without vendor lock-in

**Enjoy your portable, flexible authentication system!** 🎉
