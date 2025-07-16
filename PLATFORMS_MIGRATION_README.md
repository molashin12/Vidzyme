# Platforms Migration Guide

This guide explains how to migrate your database to support multiple platforms per channel.

## What's Changed

The onboarding and settings system has been updated to:
- Store multiple platforms (e.g., TikTok + YouTube) in a single channel record
- Remember all selected platforms for retrieval in the settings page
- Maintain backward compatibility with existing single-platform channels

## Database Migration Required

**IMPORTANT**: You need to run the database migration before the new functionality will work.

### Steps:

1. **Open your Supabase Dashboard**
   - Go to your project dashboard
   - Navigate to the "SQL Editor" section

2. **Run the Migration Script**
   - Copy the contents of `schema-migration-platforms.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the migration

3. **Verify the Migration**
   - Go to "Table Editor" → "user_channels"
   - Confirm the new `platforms` column exists
   - Check that existing records have their `platforms` array populated

## What the Migration Does

1. **Adds `platforms` column**: A text array to store multiple platform selections
2. **Migrates existing data**: Populates the `platforms` array from existing `channel_type` values
3. **Adds constraints**: Ensures `platforms` array is not empty and contains valid values
4. **Creates sync function**: Automatically updates `channel_type` from the first platform (for backward compatibility)
5. **Adds performance index**: Optimizes queries on the `platforms` array

## Code Changes Made

### 1. Database Schema
- Updated `UserChannel` interface to include `platforms: string[]`
- Added migration script for database schema changes

### 2. Onboarding Flow
- Modified `handleComplete()` to save all selected platforms in the `platforms` array
- Maintains `channel_type` as the first selected platform for compatibility

### 3. Settings Page
- Updated `loadChannelData()` to load platforms from the `platforms` array
- Modified `handleSave()` to include platforms when creating/updating channels
- Maintains existing platform selection UI and functionality

## Testing the Changes

1. **Complete the database migration first**
2. **Test onboarding flow**:
   - Create a new user account
   - Go through onboarding
   - Select multiple platforms (e.g., TikTok + YouTube)
   - Complete the setup

3. **Test settings page**:
   - Navigate to Settings → Channels
   - Verify that all selected platforms are displayed and selected
   - Try updating platform selections
   - Save and verify changes persist

## Backward Compatibility

- Existing channels will continue to work
- Single-platform channels will be migrated to have a single-item platforms array
- The `channel_type` field is maintained for any legacy code dependencies

## Troubleshooting

If you encounter issues:

1. **Migration fails**: Check Supabase logs for specific error messages
2. **Platforms not saving**: Verify the migration completed successfully
3. **UI not showing platforms**: Check browser console for TypeScript errors

## Next Steps

After successful migration, users can:
- Select multiple platforms during onboarding
- Have all platforms remembered in a single channel record
- Edit platform selections in the settings page
- Maintain all existing functionality while supporting multi-platform workflows