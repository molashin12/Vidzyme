# Vidzyme Supabase Setup Guide

This guide will walk you through setting up Supabase for the Vidzyme application, including database tables, authentication, and Row Level Security (RLS).

## 📋 Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Basic understanding of SQL and database concepts
- Access to your Vidzyme project

## 🚀 Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `vidzyme` (or your preferred name)
   - **Database Password**: Choose a strong password
   - **Region**: Select the region closest to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## 🔧 Step 2: Configure Project Settings

### Get Your Project Credentials

1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Project API Keys** → **anon public** key

### Update Environment Variables

1. Open `frontend/.env` in your Vidzyme project
2. Update the Supabase configuration:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_PROXY_URL=/api

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🗄️ Step 3: Set Up Database Schema

### Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
<<<<<<< HEAD
3. Run the schema files in this order:

**Step 1: Main Schema**
```sql
-- Copy and run the entire contents of supabase-schema.sql
```

**Step 2: Extensions**
```sql
-- Copy and run the entire contents of schema-extensions.sql
```

**Step 3: Multi-Platform Migration**
```sql
-- Copy and run the entire contents of schema-migration-platforms.sql
```
=======
3. Copy the entire contents of `supabase-schema.sql` (created in your project root)
4. Paste it into the SQL editor
5. Click "Run" to execute the schema
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130

This will create:
- **users** table (extends Supabase auth)
- **user_profiles** table (additional user data)
<<<<<<< HEAD
- **user_channels** table (multi-platform channel management)
- **videos** table (video generation records)
- **subscriptions** table (user subscriptions)
- **usage** table (credit usage tracking)
- Multi-platform support with platform constraints
=======
- **videos** table (video generation records)
- **subscriptions** table (user subscriptions)
- **usage** table (credit usage tracking)
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamps
- Helper functions for credits and stats

### Verify Tables Creation

1. Go to **Table Editor** in your Supabase dashboard
2. You should see all the tables listed:
   - `users`
   - `user_profiles`
<<<<<<< HEAD
   - `user_channels` (with platforms array column)
   - `videos`
   - `subscriptions`
   - `usage`
3. Verify the `user_channels` table has:
   - `platforms` column (text array)
   - Check constraint for valid platforms
   - Proper indexes and RLS policies
=======
   - `videos`
   - `subscriptions`
   - `usage`
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130

## 🔐 Step 4: Configure Authentication

### Enable Email Authentication

1. Go to **Authentication** → **Settings**
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure email settings:
   - **Enable email confirmations**: Toggle based on your preference
   - **Enable email change confirmations**: Recommended to keep enabled
   - **Enable secure email change**: Recommended to keep enabled

### Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the email templates for:
   - Confirm signup
   - Reset password
   - Magic link
   - Email change

### Set Up Redirect URLs

1. Go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add any additional URLs you'll use

## 🛡️ Step 5: Configure Row Level Security

The schema already includes RLS policies, but here's what they do:

### Users Table
- Users can only view, update, and insert their own profile
- Automatic user creation on signup via trigger

### Videos Table
- Users can only access their own videos
- Full CRUD operations for own videos

### User Profiles Table
- Users can only access their own profile data
- Automatic profile creation on user signup

<<<<<<< HEAD
### User Channels Table
- Users can only access their own channels
- Full CRUD operations for own channels
- Platform validation via check constraints
- Support for multi-platform selection

=======
>>>>>>> 9ae0d1499acfd62c5677a7f717500482b621a130
### Subscriptions & Usage Tables
- Users can only view their own subscription and usage data
- Insert permissions for new subscriptions and usage records

## 📊 Step 6: Set Up Realtime (Optional)

For live updates on video processing:

1. Go to **Database** → **Replication**
2. Enable replication for tables that need real-time updates:
   - `videos` (for processing status updates)
   - `users` (for credit updates)

## 🧪 Step 7: Test the Setup

### Test Authentication

1. Start your frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Navigate to the signup page
3. Create a test account
4. Verify the user appears in the **Authentication** → **Users** section
5. Check that corresponding records are created in the `users` and `user_profiles` tables

### Test Database Operations

1. Sign in with your test account
2. Try generating a video (this will create records in the `videos` table)
3. Check the **Table Editor** to verify data is being stored correctly

## 🔧 Step 8: Production Configuration

### Security Settings

1. Go to **Settings** → **API**
2. Configure **JWT Settings**:
   - Set appropriate JWT expiry time
   - Consider enabling JWT verification

### Database Settings

1. Go to **Settings** → **Database**
2. Configure connection pooling if needed
3. Set up database backups

### Performance Optimization

1. Monitor query performance in **Reports**
2. Add additional indexes if needed based on usage patterns
3. Consider enabling database extensions as needed

## 📈 Step 9: Monitoring and Maintenance

### Set Up Monitoring

1. Go to **Reports** to monitor:
   - API usage
   - Database performance
   - Authentication metrics

### Regular Maintenance

1. Monitor storage usage
2. Review and optimize slow queries
3. Update RLS policies as needed
4. Backup important data regularly

## 🚨 Troubleshooting

### Common Issues

1. **Authentication not working**:
   - Check environment variables are correct
   - Verify Supabase URL and anon key
   - Check browser console for errors

2. **Database queries failing**:
   - Verify RLS policies are correct
   - Check user permissions
   - Review SQL logs in Supabase dashboard

3. **Real-time updates not working**:
   - Ensure replication is enabled for relevant tables
   - Check subscription setup in frontend code

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Visit the [Supabase Community](https://github.com/supabase/supabase/discussions)
- Review error logs in the Supabase dashboard

## 📝 Next Steps

After completing this setup:

1. **Test all authentication flows** (signup, signin, password reset)
2. **Verify database operations** work correctly
3. **Set up production environment** with production URLs
4. **Configure email provider** for production (SendGrid, etc.)
5. **Set up monitoring and alerts** for production

## 🔗 Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)

---

**Note**: Keep your Supabase credentials secure and never commit them to version control. Use environment variables for all sensitive configuration.