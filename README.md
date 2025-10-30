# 🎬 Movie & TV Streaming Discord Bot

A feature-rich Discord bot for streaming movies and TV shows with friends using Real-Debrid and IMDb integration. Create watch parties, browse movie info, and stream high-quality content directly in Discord!

## ✨ Features

### 🎥 Watch Party System
- **Create Watch Parties**: Generate instant watch party links using watchparty.me
- **Real-Debrid Integration**: Convert torrents to high-speed streaming links
- **Quality Selection**: Choose from 4K, 1080p, 720p, and more
- **Movies & TV Shows**: Full support for both movies and episodic content
- **Direct Streaming**: Get direct links for VLC, MPV, or any media player

### 📺 Movie Information
- **Detailed Info**: Get comprehensive information about any movie or TV show
- **IMDb Integration**: Ratings, cast, crew, plot, awards, and more
- **Live Search**: Autocomplete suggestions as you type
- **Rich Embeds**: Beautiful, professional-looking embeds with posters

### 🔍 Smart Search
- **Autocomplete**: Real-time search suggestions from IMDb
- **Flexible Queries**: Search by title or IMDb ID
- **Smart Matching**: Handles compound words and variations

### 🎯 User Experience
- **Professional Design**: Gold-themed embeds matching IMDb branding
- **Easy Navigation**: Select menus for seasons, episodes, and quality
- **Clear Instructions**: Step-by-step guidance throughout
- **Error Handling**: Helpful error messages with suggestions

## 📋 Commands

### `/watchparty`
Create a watch party for movies or TV shows
- **Options:**
  - `title`: Search by movie/show title (with autocomplete)
  - `imdb_id`: Search by IMDb ID (e.g., tt1375666)

**Examples:**
```
/watchparty title: Inception
/watchparty imdb_id: tt1375666
/watchparty title: Breaking Bad
```

### `/movieinfo`
Get detailed information about a movie or TV show
- **Options:**
  - `title`: Search by movie/show title (with autocomplete)
  - `imdb_id`: Search by IMDb ID (e.g., tt1375666)

**Examples:**
```
/movieinfo title: The Matrix
/movieinfo imdb_id: tt0133093
```

## 🚀 Setup

### Prerequisites
1. **Discord Bot Token** - [Discord Developer Portal](https://discord.com/developers/applications)
2. **Real-Debrid Account** - [Real-Debrid](https://real-debrid.com/) (Required)
3. **OMDb API Key** - [OMDb API](https://www.omdbapi.com/apikey.aspx) (Free tier available)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd DiscordJS-V14-Bot-Template
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Edit `.env` file:
```env
# Discord Bot Token
CLIENT_TOKEN="your_discord_bot_token"

# Real-Debrid API Key (Required)
REAL_DEBRID_API_KEY="your_real_debrid_api_key"

# OMDb API Key (Recommended)
OMDB_API_KEY="your_omdb_api_key"

# Watch2Gether API Key (Optional)
W2G_API_KEY=""
```

4. **Get your API keys**
- **Real-Debrid**: Visit [https://real-debrid.com/apitoken](https://real-debrid.com/apitoken)
- **OMDb**: Visit [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)

5. **Configure the bot**

Edit `src/config.js`:
```javascript
development: {
    enabled: true, // Set to false for global commands
    guildId: 'your_guild_id_here',
},
users: {
    ownerId: 'your_user_id_here',
    developers: ['your_user_id_here']
}
```

6. **Start the bot**
```bash
npm start
```

## 🎮 Usage Guide

### Creating a Watch Party

1. Use `/watchparty` and start typing a movie name
2. Select from autocomplete suggestions
3. The bot shows IMDb information
4. **For Movies**: Select your preferred quality
5. **For TV Shows**: 
   - Select a season
   - Select an episode
   - Select quality
6. Get your watch party link and direct stream link!

### Getting Movie Information

1. Use `/movieinfo` and type a movie name
2. Select from autocomplete suggestions
3. View detailed information including:
   - Plot, ratings, cast, crew
   - Awards, box office, runtime
   - Genres, languages, countries
   - Direct link to create a watch party

## 🛠️ Technical Details

### Architecture
- **Discord.js v14**: Latest Discord API wrapper
- **Real-Debrid API**: Torrent to streaming conversion
- **Torrentio API**: Torrent indexing (same as Stremio)
- **OMDb API**: IMDb data access
- **watchparty.me**: Watch party room creation

### File Structure
```
src/
├── services/              # API integrations
│   ├── RealDebridService.js
│   ├── IMDbService.js
│   ├── TorrentService.js
│   └── WatchPartyService.js
├── commands/
│   └── Entertainment/
│       ├── slashcommand-watchparty.js
│       └── slashcommand-movieinfo.js
├── components/
│   ├── SelectMenu/        # Interactive menus
│   └── autocomplete/      # Search autocomplete
└── client/                # Bot initialization
```

### Features in Detail

**Torrent Processing:**
1. Search via Torrentio API
2. Parse quality, size, seeders
3. Add to Real-Debrid
4. Get direct streaming URL

**Watch Party Creation:**
1. Generate watchparty.me URL
2. Include video parameter
3. Provide alternative direct link

**Smart Search:**
- Handles compound words (e.g., "madmax" → "mad max")
- Tries multiple variations
- Caches results for performance

## 📊 Bot Status

The bot rotates between these statuses:
- 🎬 /watchparty for movies
- 🍿 Streaming with friends
- 📺 TV shows & movies
- 🎥 /movieinfo for details
- ⭐ Powered by Real-Debrid

## 🔧 Troubleshooting

### "No torrents found"
- Try searching by IMDb ID instead
- Some content may not be available
- Check Real-Debrid availability

### "Failed to process torrent"
- Verify Real-Debrid API key
- Check account status
- Try different quality option

### Autocomplete not working
- Ensure OMDb API key is set
- Check API rate limits
- Wait for search to load

### Watch party link issues
- Use direct stream link as alternative
- Copy link to VLC or similar player
- Check if video URL is still valid

## 📝 API Rate Limits

- **OMDb Free**: 1,000 requests/day
- **Real-Debrid**: Varies by account type
- **Torrentio**: No official limits

## 🤝 Contributing

This bot is based on the DiscordJS-V14-Bot-Template. Feel free to fork and customize!

## ⚠️ Legal Notice

This bot is for personal use only. Ensure you have the rights to stream any content. Respect copyright laws in your jurisdiction. The developers are not responsible for misuse.

## 📞 Support

For issues or questions:
- Check the troubleshooting section
- Verify all API keys are correct
- Check console logs for errors
- Use `/reportbug` in Discord to report issues

## 🎉 Credits

- **Template**: DiscordJS-V14-Bot-Template by TFAGaming
- **APIs**: Real-Debrid, OMDb, Torrentio
- **Services**: watchparty.me
- **Framework**: Discord.js v14

---

**Made with ❤️ for movie lovers and Discord communities**
