# Watch Party Bot Setup Guide

This Discord bot allows you to create watch party links for movies and TV shows using Real-Debrid, IMDb, and Watchparty services.

## Features

- 🎬 Search movies and TV shows by title or IMDb ID
- 🔍 Live autocomplete search as you type
- 📺 Support for both movies and TV series (with episode selection)
- 🎥 Multiple quality options (4K, 1080p, 720p, etc.)
- 🔗 Automatic Real-Debrid integration for torrent streaming
- 🎉 Watch party link generation
- 📊 Rich IMDb information embeds

## Prerequisites

1. **Discord Bot Token** - Already configured in `.env`
2. **Real-Debrid Account** - Required for torrent streaming
3. **OMDb API Key** - Optional but recommended for better IMDb data
4. **Watch2Gether API Key** - Optional (fallback URLs work without it)

## API Keys Setup

### 1. Real-Debrid API Key (REQUIRED)

1. Go to [https://real-debrid.com/apitoken](https://real-debrid.com/apitoken)
2. Log in to your Real-Debrid account
3. Copy your API token
4. Add it to `.env`:
   ```
   REAL_DEBRID_API_KEY="your_actual_api_key_here"
   ```

### 2. OMDb API Key (RECOMMENDED)

1. Go to [https://www.omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx)
2. Select the FREE tier (1,000 daily requests)
3. Enter your email and activate the key
4. Add it to `.env`:
   ```
   OMDB_API_KEY="your_actual_api_key_here"
   ```

### 3. Watch2Gether API Key (OPTIONAL)

1. The bot works without this using fallback URLs
2. If you want official W2G rooms, contact Watch2Gether for API access
3. Add it to `.env` if you have one:
   ```
   W2G_API_KEY="your_api_key_here"
   ```

## Installation

All dependencies have been installed. If you need to reinstall:

```bash
npm install
```

## Running the Bot

```bash
npm start
```

## Usage

### Command: `/watchparty`

#### Option 1: Search by Title
```
/watchparty title: Inception
```
- Start typing and select from autocomplete suggestions
- The bot will show IMDb info and available torrents

#### Option 2: Search by IMDb ID
```
/watchparty imdb_id: tt1375666
```
- Use this if you know the exact IMDb ID

### For Movies:
1. Run `/watchparty title: Movie Name`
2. Bot displays movie info
3. Select your preferred quality from the dropdown
4. Bot processes the torrent through Real-Debrid
5. Receive watch party link and direct stream link

### For TV Shows:
1. Run `/watchparty title: Show Name`
2. Bot displays show info
3. Select season from dropdown
4. Select episode from dropdown
5. Select quality from dropdown
6. Receive watch party link and direct stream link

## File Structure

```
src/
├── services/
│   ├── RealDebridService.js      # Real-Debrid API integration
│   ├── IMDbService.js             # IMDb/OMDb API integration
│   ├── TorrentService.js          # Torrent search via Torrentio
│   └── WatchPartyService.js       # Watch party link generation
├── commands/
│   └── Entertainment/
│       └── slashcommand-watchparty.js  # Main command
├── components/
│   ├── SelectMenu/
│   │   ├── watchparty-torrent-select.js          # Movie quality selection
│   │   ├── watchparty-season-select.js           # Season selection
│   │   ├── watchparty-episode-select.js          # Episode selection
│   │   └── watchparty-episode-torrent-select.js  # TV quality selection
│   └── autocomplete/
│       └── watchparty-title-autocomplete.js      # Live search
```

## How It Works

1. **Search**: User types movie/show title
2. **IMDb Lookup**: Bot fetches info from OMDb API
3. **Torrent Search**: Bot queries Torrentio API (same as Stremio)
4. **Real-Debrid**: Selected torrent is added and converted to streaming link
5. **Watch Party**: Streaming link is used to create a watch party room
6. **Share**: User receives both watch party link and direct stream link

## Troubleshooting

### "No torrents found"
- Try a different movie/show or search by IMDb ID
- Some content may not have available torrents

### "Failed to process torrent"
- Check your Real-Debrid account status
- Verify API key is correct
- Try a different quality option
- Some torrents may not be instantly available on Real-Debrid

### "Session expired"
- Selections must be made within a reasonable timeframe
- Simply run the command again

### Autocomplete not working
- Make sure you have a valid OMDb API key
- Check that you're typing at least 2 characters
- Wait a moment for results to load

## API Rate Limits

- **OMDb Free**: 1,000 requests per day
- **Real-Debrid**: Varies by account type
- **Torrentio**: No official limits

## Notes

- Links may expire after some time (Real-Debrid caching)
- Watch party services may have their own limitations
- Direct stream links can be used in any video player
- The bot stores temporary session data in memory

## Support

For issues or questions:
1. Check your API keys are correctly configured
2. Ensure your Real-Debrid account is active
3. Verify all dependencies are installed
4. Check console logs for detailed error messages

## Legal Notice

This bot is for personal use only. Ensure you have the rights to stream any content. Respect copyright laws in your jurisdiction.
