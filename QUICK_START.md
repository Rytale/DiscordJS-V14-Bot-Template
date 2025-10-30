# Quick Start - Get Your Watch Party Working in 5 Minutes

## 🎯 What's Happening Now

The bot command works and the button works, but the **activity app itself isn't deployed yet**. You need to deploy the React app so there's something to open when users click the link.

## ⚡ Fastest Way to Get It Working

### Option 1: Deploy to Vercel (Recommended - 5 minutes)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Go to the activity folder**
   ```bash
   cd discord-activity
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Login to Vercel**
   ```bash
   vercel login
   ```
   - Opens browser to login
   - Use your GitHub/GitLab/Email

5. **Deploy!**
   ```bash
   vercel
   ```
   - Press Enter for all prompts (accept defaults)
   - Wait for deployment (~1 minute)
   - Copy the deployment URL (something like: `https://discord-activity-xyz.vercel.app`)

6. **Set Environment Variable**
   ```bash
   vercel env add VITE_DISCORD_CLIENT_ID
   ```
   - Paste your Discord Application ID
   - Select "Production"

7. **Deploy to Production**
   ```bash
   vercel --prod
   ```
   - Copy your PRODUCTION URL

8. **Update Bot Code**
   - Open: `src/commands/Entertainment/slashcommand-watchparty-activity.js`
   - Line 59: Replace `https://your-deployed-activity.vercel.app` with YOUR actual URL
   - Save file

9. **Restart Bot**
   ```bash
   # In project root (go back from discord-activity folder)
   cd ..
   npm start
   ```

10. **Test It!**
    - Join voice channel
    - Run: `/watch url:https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4 title:Test`
    - Click button
    - Click the URL it gives you
    - Activity should load!

### Option 2: Test Locally First (For Development)

If you want to see it working locally before deploying:

1. **Go to activity folder**
   ```bash
   cd discord-activity
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   echo VITE_DISCORD_CLIENT_ID=your_discord_app_id > .env
   ```
   Replace `your_discord_app_id` with your actual Discord Application ID

4. **Start dev server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Go to: `http://localhost:3000/?streamUrl=https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4&title=Test`
   - You should see the activity load!

**Note:** This won't work in Discord yet, but you can see the UI and test it works.

## 🔧 What You Need Before Starting

### 1. Discord Application ID

Go to [Discord Developer Portal](https://discord.com/developers/applications):
- Select your application (or create new one)
- Copy the **Application ID** from General Information page

### 2. Test Video URL

Use this free test video:
```
https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
```

Or use your Real-Debrid streaming URL.

## 📋 Complete Flow

```
1. Deploy React app → Get URL
2. Update bot code with URL
3. Restart bot
4. Run /watch command
5. Click button
6. Open activity link
7. Watch party starts! 🎉
```

## ❓ Common Questions

**Q: Do I need to set up Discord Developer Portal?**
A: For basic testing, no! Just deploy and use the URL. For it to be a proper embedded Discord Activity, yes (see DISCORD_SETUP.md).

**Q: Can I skip deployment and test locally?**
A: You can test the UI locally, but to use it from Discord you need to deploy it.

**Q: What if I don't have Vercel account?**
A: It's free! Just sign up with GitHub at vercel.com

**Q: The activity loads but video won't play?**
A: Make sure you're using a valid video URL. Test with the sample URL above first.

## 🚀 After It Works

Once you have it working:

1. **Set up Discord Activity properly**
   - See `discord-activity/DISCORD_SETUP.md`
   - This makes it embedded in Discord (not just a link)

2. **Customize the app**
   - Edit files in `discord-activity/src/`
   - Run `npm run build` and redeploy

3. **Use with Real-Debrid**
   - Get streaming URL from your existing `/watchparty` command
   - Use that URL with `/watch` command

## 💡 Quick Tips

- **Vercel is FREE** for personal projects
- **Deployment takes ~1 minute**
- **No credit card required**
- **Automatic HTTPS** (required for Discord)
- **Updates instantly** when you push changes

## 🆘 Having Issues?

### "npm: command not found"
- Install Node.js from nodejs.org (includes npm)

### "vercel: command not found"
- Run: `npm install -g vercel`
- If still fails, try: `npx vercel`

### "Activity won't load"
- Check deployment URL is correct in bot code
- Make sure URL starts with `https://`
- Check bot is restarted after code change

### "Video won't play"
- Test with the sample video URL first
- Check video URL is accessible
- Make sure URL is a direct video link

## ✅ Success Checklist

- [ ] Vercel CLI installed
- [ ] Deployed to Vercel
- [ ] Got production URL
- [ ] Updated bot code with URL
- [ ] Restarted bot
- [ ] Tested `/watch` command
- [ ] Button works
- [ ] Activity opens and loads
- [ ] Video plays

---

**Next Step:** Once this works, see `DISCORD_ACTIVITY_GUIDE.md` for the complete setup to make it a proper Discord Activity.
