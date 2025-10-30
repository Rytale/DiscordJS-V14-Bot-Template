# Troubleshooting Guide - Discord Watch Party Activity

## 🔧 Common Issues and Solutions

### "Interaction Failed" Error When Clicking Launch Button

**What I Fixed:**
- ✅ Added `deferReply()` to prevent 3-second timeout
- ✅ Changed from `reply()` to `editReply()` for proper response handling
- ✅ Added proper error handling and fallbacks
- ✅ Simplified the activity launch process

**Steps to Test:**

1. **Restart Your Bot**
   ```bash
   # Stop the bot (Ctrl+C if running)
   npm start
   ```

2. **Verify Bot is Running**
   - Check console for "Bot is online!" message
   - Check that commands are loaded

3. **Test the Button**
   - Join a voice channel in Discord
   - Run: `/watch url:https://example.com/video.mp4 title:Test`
   - Click the "🎬 Launch Watch Party" button
   - You should now see a response with the activity link

### Still Getting Errors?

#### Check Console Logs
Look for error messages in your bot console that start with:
```
Error in watchparty activity button:
```

#### Common Issues:

**1. Bot Not Recognizing Button**
- Make sure bot restarted after adding the button file
- Check that `src/components/Button/watchparty-activity-button.js` exists
- Verify the file exports properly

**2. Activity Data Not Found**
- The activity data expires after 5 minutes
- Run the `/watch` command again
- Click the button within 5 minutes

**3. User Not in Voice Channel**
- You must be in a voice channel to use the button
- The bot checks this before proceeding

**4. Voice Channel Mismatch**
- Make sure you're in the same voice channel as when you ran `/watch`

## 🧪 Testing Steps

### Basic Test (Without Deployed Activity)

1. Start bot: `npm start`
2. Join voice channel
3. Run: `/watch url:https://example.com/video.mp4 title:Test Movie`
4. Click button
5. You should get a link (even if not deployed yet)

### Full Test (With Deployed Activity)

1. Deploy activity to Vercel/Netlify/Cloudflare
2. Update bot code with deployment URL (line 59 in `slashcommand-watchparty-activity.js`)
3. Restart bot
4. Join voice channel
5. Run: `/watch url:REAL_VIDEO_URL title:Movie Name`
6. Click button
7. Open the activity link
8. Activity should load in browser/Discord

## 📝 Debug Checklist

- [ ] Bot is running without errors
- [ ] `/watch` command appears in Discord
- [ ] Button file exists: `src/components/Button/watchparty-activity-button.js`
- [ ] User is in a voice channel
- [ ] Clicked button within 5 minutes of running command
- [ ] Bot has permissions to read voice state
- [ ] Console shows any error messages

## 🔍 Debugging Steps

### Enable Detailed Logging

Add this to the button handler to see what's happening:

```javascript
console.log('Button clicked:', interaction.customId);
console.log('Activity data exists:', !!activityData);
console.log('User in voice:', !!interaction.member.voice.channel);
```

### Check Activity Data

After running `/watch`, check if data is stored:

```javascript
// In slashcommand-watchparty-activity.js, after storing data:
console.log('Stored activity data for:', `launch_activity_${interaction.user.id}`);
console.log('Data:', client.activityData.get(`launch_activity_${interaction.user.id}`));
```

## 🎯 Expected Behavior

### When Working Correctly:

1. **Run `/watch` command**
   - Bot responds with embed showing movie info
   - Button appears: "🎬 Launch Watch Party"

2. **Click Button**
   - Bot responds immediately (within 1 second)
   - Shows message: "🎬 Watch Party Ready!"
   - Provides activity link
   - Lists features

3. **Open Link**
   - Activity loads (if deployed)
   - Or shows error if not deployed yet

## 🚀 Next Steps After Fix

Once the button works:

1. **Deploy the Activity**
   ```bash
   cd discord-activity
   npm install
   vercel --prod
   ```

2. **Update Bot Code**
   - Edit `src/commands/Entertainment/slashcommand-watchparty-activity.js`
   - Line 59: Update with your Vercel URL
   - Restart bot

3. **Configure Discord Portal**
   - Add activity URL mapping
   - See `discord-activity/DISCORD_SETUP.md`

4. **Test Full Flow**
   - Run `/watch` with real video URL
   - Click button
   - Activity opens in Discord
   - Video plays and syncs

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Check Bot Permissions**
   - View Channels
   - Send Messages
   - Use Slash Commands
   - Connect to Voice
   - View Voice Channel

2. **Verify File Structure**
   ```
   src/
   ├── commands/Entertainment/
   │   └── slashcommand-watchparty-activity.js  ✓
   └── components/Button/
       └── watchparty-activity-button.js        ✓
   ```

3. **Check Environment Variables**
   - `.env` file exists in project root
   - Contains `DISCORD_TOKEN`
   - Contains other required variables

4. **Review Console Output**
   - Any error messages?
   - Did components load successfully?
   - Did commands register?

## 💡 Tips

- Always restart bot after code changes
- Button data expires after 5 minutes
- Test with a short test video first
- Deploy activity before real usage
- Monitor console for errors
- Keep bot logs for debugging

## ✅ Success Indicators

You'll know it's working when:
- ✅ Button click responds immediately
- ✅ No "Interaction failed" error
- ✅ Bot sends activity link
- ✅ Link opens (even if activity not deployed yet)
- ✅ No errors in console

---

**Need more help?** Check the documentation:
- `DISCORD_ACTIVITY_GUIDE.md` - Complete setup guide
- `discord-activity/README.md` - Activity documentation
- `discord-activity/DISCORD_SETUP.md` - Discord portal setup
