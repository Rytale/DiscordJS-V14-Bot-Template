const axios = require('axios');

class WatchPartyService {
    constructor() {
        this.baseURL = 'https://w2g.tv';
    }

    /**
     * Create a watch party room using watchparty.me
     * @param {string} videoUrl - The video URL to watch
     * @param {string} title - Optional title for the room
     * @returns {Promise<string>} Watch party URL
     */
    async createRoom(videoUrl, title = 'Watch Party') {
        // Use watchparty.me with direct URL
        return `https://www.watchparty.me/create?video=${encodeURIComponent(videoUrl)}`;
    }


    /**
     * Create watchparty.me URL
     * @param {string} videoUrl - The video URL
     * @param {string} title - Video title
     * @returns {string} Watch party URL
     */
    createWatchPartyUrl(videoUrl, title) {
        return `https://www.watchparty.me/create?video=${encodeURIComponent(videoUrl)}`;
    }

    /**
     * Validate if a URL is accessible
     * @param {string} url - URL to validate
     * @returns {Promise<boolean>} Whether the URL is valid
     */
    async validateUrl(url) {
        try {
            const response = await axios.head(url, {
                timeout: 5000,
                maxRedirects: 5
            });
            return response.status === 200;
        } catch (error) {
            console.error('URL validation failed:', error.message);
            return false;
        }
    }
}

module.exports = WatchPartyService;
