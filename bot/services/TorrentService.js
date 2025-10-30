const axios = require('axios');

class TorrentService {
    constructor() {
        // Using Torrentio addon API (same as Stremio uses)
        this.baseURL = 'https://torrentio.strem.fun';
    }

    /**
     * Search for torrents by IMDb ID
     * @param {string} imdbId - The IMDb ID
     * @param {string} type - 'movie' or 'series'
     * @param {number} season - Season number (for series)
     * @param {number} episode - Episode number (for series)
     * @returns {Promise<Array>} Array of torrent options
     */
    async searchByImdbId(imdbId, type, season = null, episode = null) {
        try {
            let streamId;
            if (type === 'movie') {
                streamId = `${imdbId}`;
            } else if (type === 'series') {
                streamId = `${imdbId}:${season}:${episode}`;
            }

            // Use the manifest and streams endpoint
            const response = await axios.get(
                `${this.baseURL}/stream/${type}/${streamId}.json`,
                { timeout: 10000 }
            );

            if (!response.data || !response.data.streams) {
                return [];
            }

            // Parse and format the streams
            const torrents = response.data.streams
                .filter(stream => stream.infoHash) // Only keep torrents with valid hash
                .map(stream => this.parseTorrentStream(stream))
                .filter(torrent => torrent !== null);

            // Sort by quality and seeders
            torrents.sort((a, b) => {
                // Prioritize by quality rank
                if (a.qualityRank !== b.qualityRank) {
                    return b.qualityRank - a.qualityRank;
                }
                // Then by seeders
                return b.seeders - a.seeders;
            });

            return torrents;
        } catch (error) {
            console.error('Error searching torrents:', error.message);
            return [];
        }
    }

    /**
     * Parse torrent stream data from Torrentio
     * @param {Object} stream - Raw stream data
     * @returns {Object|null} Parsed torrent info
     */
    parseTorrentStream(stream) {
        try {
            const title = stream.title || stream.name || 'Unknown';
            
            // Extract quality from title
            const quality = this.extractQuality(title);
            
            // Extract seeders from title (format: "👤 123")
            const seedersMatch = title.match(/👤\s*(\d+)/);
            const seeders = seedersMatch ? parseInt(seedersMatch[1]) : 0;
            
            // Extract size from title
            const sizeMatch = title.match(/💾\s*([\d.]+\s*[KMGT]B)/i);
            const size = sizeMatch ? sizeMatch[1] : 'Unknown';

            // Get provider/tracker info
            const provider = title.split('\n')[0] || 'Unknown';

            // Build magnet link
            const magnetLink = `magnet:?xt=urn:btih:${stream.infoHash}&dn=${encodeURIComponent(title)}`;

            return {
                title: title,
                quality: quality,
                qualityRank: this.getQualityRank(quality),
                seeders: seeders,
                size: size,
                provider: provider,
                infoHash: stream.infoHash,
                magnetLink: magnetLink,
                displayName: this.formatDisplayName(quality, size, seeders, provider)
            };
        } catch (error) {
            console.error('Error parsing torrent stream:', error.message);
            return null;
        }
    }

    /**
     * Extract quality from title string
     * @param {string} title - Torrent title
     * @returns {string} Quality string
     */
    extractQuality(title) {
        const qualityPatterns = [
            /2160p|4K|UHD/i,
            /1080p/i,
            /720p/i,
            /480p/i,
            /360p/i
        ];

        for (const pattern of qualityPatterns) {
            if (pattern.test(title)) {
                const match = title.match(pattern);
                return match[0].toUpperCase();
            }
        }

        return 'Unknown';
    }

    /**
     * Get quality rank for sorting (higher is better)
     * @param {string} quality - Quality string
     * @returns {number} Rank value
     */
    getQualityRank(quality) {
        const ranks = {
            '4K': 5,
            '2160P': 5,
            'UHD': 5,
            '1080P': 4,
            '720P': 3,
            '480P': 2,
            '360P': 1,
            'UNKNOWN': 0
        };

        return ranks[quality.toUpperCase()] || 0;
    }

    /**
     * Format display name for select menu
     * @param {string} quality - Quality
     * @param {string} size - File size
     * @param {number} seeders - Number of seeders
     * @param {string} provider - Provider name
     * @returns {string} Formatted display name
     */
    formatDisplayName(quality, size, seeders, provider) {
        // Clean up provider name
        const cleanProvider = provider.split('\n')[0].split('⚙️')[0].trim();
        
        return `${quality} | ${size} | 👤 ${seeders} | ${cleanProvider}`.substring(0, 100);
    }

    /**
     * Get the best quality torrent automatically
     * @param {Array} torrents - Array of torrents
     * @returns {Object|null} Best quality torrent
     */
    getBestQuality(torrents) {
        if (!torrents || torrents.length === 0) {
            return null;
        }

        // Filter out torrents with very few seeders
        const viable = torrents.filter(t => t.seeders >= 5);
        
        if (viable.length === 0) {
            return torrents[0]; // Return first if none have good seeders
        }

        // Return the first viable one (already sorted by quality and seeders)
        return viable[0];
    }

    /**
     * Group torrents by quality for better organization
     * @param {Array} torrents - Array of torrents
     * @returns {Object} Torrents grouped by quality
     */
    groupByQuality(torrents) {
        const grouped = {};
        
        torrents.forEach(torrent => {
            const quality = torrent.quality;
            if (!grouped[quality]) {
                grouped[quality] = [];
            }
            grouped[quality].push(torrent);
        });

        return grouped;
    }
}

module.exports = TorrentService;
