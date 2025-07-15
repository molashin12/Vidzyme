# Google Authentication Setup Guide

This guide will help you set up Google OAuth authentication for the Vidzyme application.

## Prerequisites

1. A Supabase project (see `SUPABASE_SETUP_GUIDE.md`)
2. A Google Cloud Console project
3. Environment variables configured

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)

### 1.2 Configure OAuth Consent Screen

1. Navigate to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type
3. Fill in the required information:
   - App name: `Vidzyme`
   - User support email: Your email
   - Developer contact information: Your email
4. Add scopes (optional for basic auth):
   - `email`
   - `profile`
   - `openid`
5. Save and continue

### 1.3 Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. Choose **Web application**
4. Configure the settings:
   - **Name**: `Vidzyme Web Client`
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - **Authorized redirect URIs**:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - Replace `your-project-id` with your actual Supabase project ID
5. Save and copy the **Client ID** and **Client Secret**

## Step 2: Supabase Configuration

### 2.1 Enable Google Provider

1. Go to your Supabase dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and click **Enable**
4. Enter your Google OAuth credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Save the configuration

### 2.2 Configure Redirect URLs

1. In Supabase, go to **Authentication** > **URL Configuration**
2. Add your site URL:
   - **Site URL**: `http://localhost:3000` (development) or `https://yourdomain.com` (production)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)

## Step 3: Environment Variables

Ensure your `.env` file in the frontend directory contains:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Step 4: Testing the Integration

### 4.1 Development Testing

1. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to `http://localhost:3000`
3. Click on "Sign In" or "Sign Up"
4. Click "Continue with Google"
5. Complete the Google OAuth flow
6. You should be redirected back to the application and logged in

### 4.2 Verify User Creation

1. Check your Supabase dashboard
2. Go to **Authentication** > **Users**
3. Verify that the Google user was created
4. Check the **Database** > **Table Editor** > **user_profiles**
5. Confirm that a user profile was automatically created

## Step 5: Production Deployment

### 5.1 Update Google Cloud Console

1. Add your production domain to:
   - **Authorized JavaScript origins**: `https://yourdomain.com`
   - **Authorized redirect URIs**: `https://your-project-id.supabase.co/auth/v1/callback`

### 5.2 Update Supabase Configuration

1. Update **Site URL** to your production domain
2. Add production redirect URL: `https://yourdomain.com/auth/callback`

### 5.3 Environment Variables

Update your production environment variables:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Features Implemented

### Frontend Components

1. **Google Sign-In Button**: Added to both SignIn and SignUp components
2. **OAuth Callback Handler**: `AuthCallback.tsx` handles the redirect from Google
3. **Authentication Hook**: `useAuth.ts` includes `signInWithGoogle` method
4. **Error Handling**: Proper error messages for failed authentication
5. **Loading States**: Visual feedback during authentication process

### Backend Integration

1. **Automatic User Creation**: New Google users are automatically added to the database
2. **Profile Management**: User profiles are created with Google account information
3. **Session Management**: Supabase handles session persistence and refresh

## Security Features

1. **Row Level Security (RLS)**: Enabled on all user-related tables
2. **Secure Redirects**: Only whitelisted URLs are allowed for redirects
3. **Token Validation**: Supabase validates Google OAuth tokens
4. **HTTPS Enforcement**: Production setup requires HTTPS

## Troubleshooting

### Common Issues

1. **"Redirect URI mismatch"**:
   - Verify the redirect URI in Google Cloud Console matches Supabase
   - Check that the Supabase project ID is correct

2. **"Invalid client"**:
   - Verify Client ID and Client Secret in Supabase
   - Ensure the Google Cloud project has the correct APIs enabled

3. **"User not created"**:
   - Check Supabase logs in the dashboard
   - Verify the database schema is properly set up
   - Ensure RLS policies allow user creation

4. **"Callback not working"**:
   - Verify the callback route is properly configured
   - Check that the AuthCallback component is imported and used
   - Ensure the redirect URL matches the configured callback

### Debug Steps

1. Check browser console for JavaScript errors
2. Review Supabase dashboard logs
3. Verify network requests in browser dev tools
4. Test with different browsers/incognito mode
5. Check that all environment variables are loaded

## Next Steps

1. **Email Verification**: Configure email templates in Supabase
2. **Additional Providers**: Add Facebook, GitHub, or other OAuth providers
3. **User Onboarding**: Create a welcome flow for new users
4. **Profile Completion**: Prompt users to complete their profiles
5. **Analytics**: Track authentication events and user behavior

## Support

If you encounter issues:

1. Check the Supabase documentation: https://supabase.com/docs/guides/auth
2. Review Google OAuth documentation: https://developers.google.com/identity/protocols/oauth2
3. Check the application logs and browser console
4. Verify all configuration steps were completed correctly

For additional help, refer to the main project documentation or create an issue in the project repository.