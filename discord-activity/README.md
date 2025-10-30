# Discord Watch Party Activity

A Discord Activity for synchronized movie/video streaming with Real-Debrid integration. Watch movies together in Discord voice channels with perfectly synced playback!

## Features

- 🎬 **Synchronized Playback** - Watch videos in perfect sync with friends
- 👑 **Host Controls** - First person to join becomes host and controls playback
- 👥 **Participant List** - See who's watching with you
- 🎮 **Discord Integration** - Embedded directly in Discord voice channels
- 📱 **Mobile Support** - Works on Discord mobile app
- 🔄 **HLS Support** - Handles both direct MP4 and HLS (.m3u8) streams
- ⚡ **Real-time Sync** - Play, pause, and seek synced across all viewers

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **Video.js** - Video player
- **HLS.js** - HLS stream support
- **Discord Embedded App SDK** - Discord Activity integration

## Prerequisites

- Node.js 18+ and npm
- Discord Application with Activity enabled
- Deployed web hosting (Vercel, Netlify, or Cloudflare Pages)

## Quick Start

### 1. Install Dependencies

```bash
cd discord-activity
npm install
```

### 2. Configure Environment

Create a `.env` file:

```env
VITE_DISCORD_CLIENT_ID=your_discord_application_id
```

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

## Project Structure

```
discord-activity/
├── src/
│   ├── components/
│   │   ├── VideoPlayer.jsx       # Video player with sync
│   │   ├── ParticipantsList.jsx  # Shows watch party members
│   │   ├── LoadingScreen.jsx     # Loading state
│   │   └── ErrorScreen.jsx       # Error handling
│   ├── App.jsx                   # Main application
│   ├── App.css                   # Main styles
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Global styles
├── index.html                    # HTML template
├── vite.config.js               # Vite configuration
├── package.json                  # Dependencies
└── README.md                     # This file
```

## Usage

### URL Parameters

The activity accepts the following query parameters:

- `streamUrl` (required) - Encoded direct streaming URL
- `title` (optional) - Movie/show title for display

Example:
```
https://your-activity.vercel.app/?streamUrl=https%3A%2F%2Fexample.com%2Fvideo.mp4&title=Movie%20Night
```

### Host Controls

- **Host** - First person to join the activity
- Host can play, pause, seek, and change playback speed
- All viewers automatically sync to host's actions
- If host leaves, a new host is elected

### Viewer Experience

- Viewers see the video in sync with the host
- Controls are disabled for viewers
- Volume control is individual per user
- Shows sync status and participant count

## Discord Bot Integration

The activity is designed to work with the Discord bot in the parent directory. The bot:

1. Gets streaming URLs from Real-Debrid
2. Launches the activity with the streaming URL
3. Manages voice channel access
4. Creates activity invites

See the bot's `slashcommand-watchparty-activity.js` for integration details.

## Deployment

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd discord-activity
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `VITE_DISCORD_CLIENT_ID`

### Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   cd discord-activity
   netlify deploy --prod
   ```

### Cloudflare Pages

1. Push to GitHub
2. Connect repository in Cloudflare Pages dashboard
3. Set build command: `npm run build`
4. Set build output: `dist`
5. Add environment variable: `VITE_DISCORD_CLIENT_ID`

## Discord Developer Portal Setup

See [DISCORD_SETUP.md](./DISCORD_SETUP.md) for detailed instructions on:
- Creating Discord Application
- Enabling Activity
- Configuring URL Mappings
- Testing the Activity

## Troubleshooting

### Video Not Loading

- Check if the streaming URL is accessible
- Verify CORS headers allow your domain
- Check browser console for errors
- Ensure URL is properly encoded

### Sync Issues

- Check Discord SDK initialization
- Verify Activity messages are being sent
- Check browser console for errors
- Ensure all users are in the same activity instance

### Activity Not Launching

- Verify Discord Application ID is correct
- Check Activity URL mapping in Developer Portal
- Ensure the activity is enabled for your application
- Check that users are in a voice channel

## Development

### Adding Features

1. Create new components in `src/components/`
2. Update `App.jsx` to integrate new features
3. Add corresponding styles in component CSS files
4. Test locally with `npm run dev`

### Testing

Test the activity locally using Discord's proxy:

1. Start dev server: `npm run dev`
2. Use Discord's test environment
3. Join a voice channel
4. Launch the activity

## Security Considerations

- Never expose streaming URLs in client-side code beyond what's necessary
- Use Discord's authentication to verify users
- Implement rate limiting on your backend
- Validate all streaming URLs before use
- Keep Discord Application secrets secure

## Performance Optimization

- Video.js is optimized for smooth playback
- HLS.js provides adaptive bitrate streaming
- React components are optimized with proper memoization
- Vite provides optimal build splitting

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Discord Desktop Client
- Discord Mobile App (iOS/Android)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the same license as the parent Discord bot.

## Support

For issues or questions:
- Check the troubleshooting section
- Review Discord Activity documentation
- Open an issue on GitHub

## Credits

Built for use with Real-Debrid streaming integration. Uses Discord's Embedded App SDK for seamless integration.
