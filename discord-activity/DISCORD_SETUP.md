# Discord Developer Portal Setup Guide

Complete guide to setting up your Discord Activity for the Watch Party application.

## Table of Contents

1. [Create Discord Application](#1-create-discord-application)
2. [Configure Activity](#2-configure-activity)
3. [Set Up URL Mappings](#3-set-up-url-mappings)
4. [Configure Bot Integration](#4-configure-bot-integration)
5. [Testing](#5-testing)
6. [Going Live](#6-going-live)

## 1. Create Discord Application

### Step 1: Create New Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Enter a name (e.g., "Watch Party Activity")
4. Accept the terms and click **"Create"**

### Step 2: Save Application ID

1. On the **General Information** page
2. Copy your **Application ID**
3. Save it for later use in your `.env` file

### Step 3: Add Bot (Optional but Recommended)

1. Go to **Bot** section in sidebar
2. Click **"Add Bot"** → **"Yes, do it!"**
3. Customize bot username and avatar
4. Copy the bot token and save it securely
5. Enable these Privileged Gateway Intents:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

## 2. Configure Activity

### Step 1: Enable Activity

1. Go to **Activities** in the sidebar (if not visible, enable it in Labs)
2. Click **"Enable Activity"** or **"New Activity"**
3. Enter activity details:
   - **Name**: Watch Party
   - **Description**: Synchronized movie streaming in Discord
   - **Category**: Video

### Step 2: Activity Settings

Configure the following settings:

**Display Name**: `Watch Party`

**Short Description**: 
```
Watch movies together with synchronized playback
```

**Detailed Description**:
```
Watch Party brings synchronized video streaming to Discord voice channels. 
Watch movies and shows together with friends in perfect sync. The first 
person to join becomes the host and controls playback while everyone else 
watches along in real-time.

Features:
• Synchronized playback across all viewers
• Host controls for play, pause, and seek
• Support for direct video and HLS streams
• See who's watching with you
• Works on desktop and mobile
```

**Tags**: `Entertainment`, `Social`, `Video`

## 3. Set Up URL Mappings

### Step 1: Production URL

After deploying your activity to Vercel/Netlify/Cloudflare:

1. In **Activities** section
2. Under **Activity URL Mappings**
3. Add new mapping:
   - **Environment**: Production
   - **URL Prefix**: `https://your-deployed-activity.vercel.app`

Example:
```
https://watchparty-activity.vercel.app
```

### Step 2: Development URL (Optional)

For local testing:

1. Add another URL mapping:
   - **Environment**: Development
   - **URL Prefix**: `http://localhost:3000`

**Note**: You'll need Discord's Proxy to test locally. See Testing section.

### Step 3: Verify URL Mapping

1. Click **"Test Activity"** button
2. It should open your deployed activity
3. Verify it loads correctly

## 4. Configure Bot Integration

### Step 1: Add Application to Server

1. Go to **OAuth2** → **URL Generator**
2. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Select bot permissions:
   - ✅ Read Messages/View Channels
   - ✅ Send Messages
   - ✅ Send Messages in Threads
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Use Slash Commands
   - ✅ Connect (Voice)
   - ✅ Speak (Voice)
4. Copy the generated URL
5. Open URL in browser and add bot to your server

### Step 2: Update Bot Environment

Add to your bot's `.env` file:

```env
# Existing variables...
DISCORD_ACTIVITY_APP_ID=your_activity_application_id_here
```

### Step 3: Update Bot Code

In `slashcommand-watchparty-activity.js`, update the activity URL:

```javascript
const activityUrl = `https://your-deployed-activity.vercel.app/?streamUrl=${encodeURIComponent(streamUrl)}&title=${encodeURIComponent(title)}`;
```

## 5. Testing

### Method 1: Production Testing (Recommended)

1. Deploy your activity to production
2. Add bot to your Discord server
3. Join a voice channel
4. Run `/watch url:https://example.com/video.mp4 title:Test Movie`
5. Click the launch button
6. Verify activity loads in Discord

### Method 2: Local Testing with Discord Proxy

**Prerequisites**:
- Install [Discord Local Development](https://discord.com/developers/docs/activities/building-an-activity#step-3-installing-a-dev-tunnel)
- Node.js 18+

**Steps**:

1. Install cloudflared:
   ```bash
   # Windows (via Chocolatey)
   choco install cloudflared
   
   # macOS (via Homebrew)
   brew install cloudflare/cloudflare/cloudflared
   
   # Linux
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
   ```

2. Start your development server:
   ```bash
   cd discord-activity
   npm run dev
   ```

3. In a new terminal, start cloudflared tunnel:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```

4. Copy the generated URL (e.g., `https://xyz.trycloudflare.com`)

5. Add URL mapping in Discord Developer Portal:
   - Environment: Development
   - URL Prefix: Your cloudflared URL

6. Test using Discord desktop client in developer mode

### Method 3: Direct URL Testing

For quick testing without bot integration:

1. Get your deployed activity URL
2. Add query parameters manually:
   ```
   https://your-activity.vercel.app/?streamUrl=https%3A%2F%2Fexample.com%2Fvideo.mp4&title=Test%20Movie
   ```
3. Open in Discord activity test mode

## 6. Going Live

### Checklist Before Launch

- [ ] Activity is deployed to production
- [ ] Production URL mapping is configured
- [ ] Bot is added to your server
- [ ] Bot environment variables are set
- [ ] Activity launches successfully
- [ ] Video playback works correctly
- [ ] Sync works across multiple users
- [ ] Mobile testing completed
- [ ] Error handling tested

### Step 1: Final Configuration

1. Remove development URL mappings
2. Verify production URL is correct
3. Test with multiple users in voice channel
4. Check mobile compatibility

### Step 2: Activity Visibility

**Option A: Private Activity (Recommended for start)**
- Keep activity unlisted
- Only accessible via your bot
- Perfect for testing with friends

**Option B: Public Activity (Later)**
- Submit for review in Developer Portal
- Activity becomes discoverable
- Requires compliance with Discord policies

### Step 3: Monitor and Maintain

- Monitor error logs
- Check Discord Developer Portal for issues
- Update activity as needed
- Respond to user feedback

## Common Issues

### Activity Not Loading

**Problem**: White screen or infinite loading

**Solutions**:
1. Check browser console for errors
2. Verify Discord Client ID is correct
3. Ensure activity URL mapping matches deployment
4. Check CORS headers on your hosting provider

### Authentication Failed

**Problem**: "Failed to authenticate" error

**Solutions**:
1. Verify Application ID in `.env` file
2. Check OAuth2 scopes are correct
3. Clear Discord cache and retry
4. Ensure you're using the correct client ID

### Video Not Playing

**Problem**: Video player shows error

**Solutions**:
1. Verify streaming URL is accessible
2. Check CORS headers allow your domain
3. Test URL directly in browser
4. Ensure video format is supported (MP4 or HLS)

### Sync Issues

**Problem**: Users not synced

**Solutions**:
1. Check all users are in same activity instance
2. Verify Discord SDK is initialized
3. Check browser console for errors
4. Ensure host hasn't disconnected

### Bot Can't Launch Activity

**Problem**: "Failed to create activity invite"

**Solutions**:
1. Verify bot has correct permissions
2. Check Activity Application ID in bot `.env`
3. Ensure users are in voice channel
4. Check bot logs for specific errors

## Advanced Configuration

### Custom Domain

1. Set up custom domain on your hosting provider
2. Update URL mapping in Discord Developer Portal
3. Ensure HTTPS is enabled
4. Update bot code with new URL

### Multiple Environments

Set up staging environment:

1. Create separate Discord application for staging
2. Deploy to staging URL
3. Add staging URL mapping
4. Use different environment variables

### Analytics

Add analytics to track usage:

1. Add Google Analytics or similar
2. Track activity launches
3. Monitor video play events
4. Track user engagement

## Resources

- [Discord Activities Documentation](https://discord.com/developers/docs/activities/overview)
- [Discord Embedded App SDK](https://github.com/discord/embedded-app-sdk)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord Developer Server](https://discord.gg/discord-developers)

## Support

If you encounter issues:

1. Check Discord Developer Portal status
2. Review Discord Activities documentation
3. Check project GitHub issues
4. Join Discord Developer server for help

## Next Steps

After completing setup:

1. ✅ Test with multiple users
2. ✅ Verify sync works correctly
3. ✅ Test on mobile devices
4. ✅ Monitor error logs
5. ✅ Gather user feedback
6. ✅ Plan feature improvements

Congratulations! Your Discord Watch Party Activity is now set up and ready to use! 🎉
