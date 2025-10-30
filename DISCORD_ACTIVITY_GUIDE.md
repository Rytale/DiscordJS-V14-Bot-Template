# Discord Watch Party Activity - Complete Setup Guide

This guide walks you through setting up the Discord Activity for synchronized movie streaming with your existing bot.

## 📋 What You're Building

A Discord Activity that allows users to watch movies/videos together in voice channels with synchronized playback. The first person to join becomes the host and controls playback for everyone.

## 🎯 Quick Overview

1. **Discord Activity** (React app in `discord-activity/` folder)
   - Embedded web app that runs inside Discord
   - Synchronized video player with host controls
   - Real-time participant tracking

2. **Bot Integration** (New commands in your existing bot)
   - `/watch` command to launch activities
   - Button handler for activity invites
   - Voice channel validation

## 📁 Project Structure

```
DiscordJS-V14-Bot-Template/
├── discord-activity/                    # NEW: React Activity App
│   ├── src/
│   │   ├── components/
│   │   │   ├── VideoPlayer.jsx          # Video player with sync
│   │   │   ├── ParticipantsList.jsx    # Shows viewers
│   │   │   ├── LoadingScreen.jsx       # Loading state
│   │   │   └── ErrorScreen.jsx         # Error handling
│   │   ├── App.jsx                      # Main app logic
│   │   └── main.jsx                     # Entry point
│   ├── package.json
│   ├── README.md                        # Activity documentation
│   ├── DISCORD_SETUP.md                 # Discord portal setup
│   └── DEPLOYMENT.md                    # Deployment guide
│
├── src/
│   ├── commands/Entertainment/
│   │   └── slashcommand-watchparty-activity.js  # NEW: /watch command
│   └── components/Button/
│       └── watchparty-activity-button.js        # NEW: Launch button
│
└── DISCORD_ACTIVITY_GUIDE.md           # This file
```

## 🚀 Step-by-Step Setup

### Step 1: Install Activity Dependencies

```bash
cd discord-activity
npm install
```

This installs:
- React & React DOM
- Vite (build tool)
- Video.js (video player)
- HLS.js (streaming support)
- Discord Embedded App SDK

### Step 2: Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"**
3. Name it "Watch Party Activity"
4. Copy the **Application ID**

### Step 3: Configure Environment

Create `discord-activity/.env`:

```env
VITE_DISCORD_CLIENT_ID=your_application_id_here
```

### Step 4: Test Locally

```bash
cd discord-activity
npm run dev
```

Visit http://localhost:3000 to verify it loads.

### Step 5: Deploy to Production

Choose one platform (Vercel recommended):

#### Option A: Vercel (Easiest)

```bash
cd discord-activity
npm install -g vercel
vercel login
vercel
# Follow prompts, then:
vercel env add VITE_DISCORD_CLIENT_ID
# Paste your Application ID
vercel --prod
```

Copy your production URL (e.g., `https://watchparty-xxx.vercel.app`)

#### Option B: Netlify

```bash
cd discord-activity
npm install -g netlify-cli
netlify login
netlify init
netlify env:set VITE_DISCORD_CLIENT_ID your_app_id
netlify deploy --prod
```

#### Option C: Cloudflare Pages

1. Push to GitHub
2. Connect in Cloudflare Pages dashboard
3. Set build command: `npm run build`
4. Set output: `dist`
5. Add env var: `VITE_DISCORD_CLIENT_ID`

### Step 6: Configure Discord Developer Portal

1. Go to your application in Discord Developer Portal
2. Navigate to **Activities** (enable in Labs if needed)
3. Click **"Enable Activity"** or **"New Activity"**
4. Under **Activity URL Mappings**, add:
   - **Environment**: Production
   - **URL Prefix**: Your deployment URL
5. Save changes

### Step 7: Update Bot Code

In `src/commands/Entertainment/slashcommand-watchparty-activity.js`, update line 59:

```javascript
const activityUrl = `https://your-deployment-url.vercel.app/?streamUrl=${encodeURIComponent(streamUrl)}&title=${encodeURIComponent(title)}`;
```

### Step 8: Add Bot Environment Variable

In your main `.env` file (bot root):

```env
# Add this line
DISCORD_ACTIVITY_APP_ID=your_discord_application_id
```

### Step 9: Restart Bot

```bash
npm start
```

The bot will now load the new `/watch` command and button handler.

### Step 10: Test It!

1. Join a voice channel in Discord
2. Run: `/watch url:https://example.com/video.mp4 title:Test Movie`
3. Click the **"🎬 Launch Watch Party"** button
4. The activity should open in Discord
5. Invite a friend to test synchronization

## 🎮 How It Works

### For Users

1. **Host starts watch party**: Uses `/watch` command with streaming URL
2. **Others join**: Click the button to join the same activity
3. **Host controls playback**: Play, pause, seek, speed
4. **Everyone syncs automatically**: All viewers see the same thing
5. **Voice chat**: Use Discord's voice chat while watching

### Technical Flow

```
User runs /watch
    ↓
Bot validates user is in voice channel
    ↓
Bot creates button with activity link
    ↓
User clicks button
    ↓
Bot creates Discord Activity invite
    ↓
Activity opens in Discord iframe
    ↓
Activity loads video from Real-Debrid URL
    ↓
First user becomes host
    ↓
Other users join and sync to host
    ↓
Host controls sync to all viewers
```

## 🔧 Integrating with Real-Debrid

Your existing `/watchparty` command gets streaming URLs from Real-Debrid. To integrate:

### Option 1: Modify Existing Command

Update `src/commands/Entertainment/slashcommand-watchparty.js` to add an activity button alongside the watchparty.me link.

### Option 2: Create Separate Flow

Keep `/watchparty` for watchparty.me and use `/watch` for Discord Activities.

### Example Integration

In your torrent select menu handler:

```javascript
// After getting Real-Debrid streaming URL
const streamUrl = await realDebridService.getStreamingUrl(torrent);

// Option 1: Send both watchparty.me and Discord Activity
const embed = new EmbedBuilder()
    .setTitle('Watch Party Options')
    .setDescription('Choose how you want to watch');

const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setLabel('Watch on watchparty.me')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://www.watchparty.me/create?video=${encodeURIComponent(streamUrl)}`)
);

const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
        .setCustomId(`launch_activity_${interaction.user.id}`)
        .setLabel('🎬 Launch Discord Activity')
        .setStyle(ButtonStyle.Primary)
);

await interaction.editReply({
    embeds: [embed],
    components: [row1, row2]
});

// Store data for button handler
client.activityData.set(`launch_activity_${interaction.user.id}`, {
    url: `https://your-activity.vercel.app/?streamUrl=${encodeURIComponent(streamUrl)}&title=${encodeURIComponent(movieData.title)}`,
    streamUrl: streamUrl,
    title: movieData.title,
    channelId: interaction.member.voice.channel.id,
    guildId: interaction.guild.id
});
```

## 📱 Features

### ✅ Implemented

- [x] Synchronized playback (play, pause, seek)
- [x] Host election (first to join)
- [x] Participant list with avatars
- [x] HLS stream support (.m3u8)
- [x] Direct MP4 support
- [x] Mobile responsive design
- [x] Loading and error states
- [x] Discord authentication
- [x] Voice channel integration
- [x] Real-time sync via Discord SDK

### 🚧 Potential Enhancements

- [ ] Vote to skip/change host
- [ ] Subtitle support
- [ ] Quality selection
- [ ] Watch history
- [ ] Playlist support
- [ ] Chat overlay (in addition to voice)
- [ ] Reactions/emojis
- [ ] Screenshots/timestamps
- [ ] Resume from last position

## 🐛 Troubleshooting

### Activity Won't Load

**Symptoms**: White screen or "Failed to load"

**Solutions**:
1. Check Discord Application ID in `.env`
2. Verify URL mapping in Discord Portal
3. Check browser console for errors
4. Ensure HTTPS is enabled (required)

### Video Won't Play

**Symptoms**: Player shows error

**Solutions**:
1. Verify streaming URL is accessible
2. Check CORS headers
3. Test URL directly in browser
4. Ensure format is supported (MP4/HLS)

### Sync Not Working

**Symptoms**: Users see different timestamps

**Solutions**:
1. Check all users are in same activity instance
2. Verify Discord SDK initialized
3. Check browser console
4. Ensure host didn't disconnect

### Bot Can't Launch Activity

**Symptoms**: "Failed to create activity invite"

**Solutions**:
1. Verify `DISCORD_ACTIVITY_APP_ID` in bot `.env`
2. Check user is in voice channel
3. Verify bot has proper permissions
4. Check bot logs for errors

## 📚 Documentation

- **[discord-activity/README.md](discord-activity/README.md)** - Activity app documentation
- **[discord-activity/DISCORD_SETUP.md](discord-activity/DISCORD_SETUP.md)** - Discord portal setup
- **[discord-activity/DEPLOYMENT.md](discord-activity/DEPLOYMENT.md)** - Deployment guide

## 🔒 Security Considerations

1. **Stream URLs**: Only passed as query parameters, not stored
2. **Authentication**: Uses Discord's built-in auth
3. **HTTPS**: Required by Discord (automatic on hosting platforms)
4. **Environment Variables**: Secrets kept in platform-specific storage
5. **CORS**: Configured by video host (Real-Debrid)

## 💡 Tips

- Test with 2-3 friends before going live
- Monitor hosting platform logs
- Keep activity URL updated in bot code
- Use production URLs for real usage
- Test on both desktop and mobile
- Provide clear instructions to users

## 🎉 You're Done!

Your Discord Watch Party Activity is now set up! Users can watch movies together in Discord with perfectly synchronized playback.

### Next Steps

1. Share with your community
2. Gather feedback
3. Monitor for issues
4. Consider adding enhancements
5. Enjoy movie nights with friends! 🍿

## 📞 Support

- Check documentation files
- Review Discord Activities docs
- Join Discord Developer server
- Open GitHub issues for bugs

---

**Built with**: React, Vite, Video.js, Discord Embedded App SDK, Real-Debrid integration
