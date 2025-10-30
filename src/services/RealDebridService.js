const axios = require('axios');

class RealDebridService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.real-debrid.com/rest/1.0';
        this.headers = {
            'Authorization': `Bearer ${apiKey}`
        };
    }

    /**
     * Check if a torrent is instantly available (cached)
     * @param {string[]} magnetLinks - Array of magnet links or hashes
     * @returns {Promise<Object>} Availability data
     */
    async checkInstantAvailability(magnetLinks) {
        try {
            const hashes = magnetLinks.map(link => {
                const match = link.match(/btih:([a-fA-F0-9]{40})/i);
                return match ? match[1].toLowerCase() : link;
            });

            const response = await axios.get(`${this.baseURL}/torrents/instantAvailability/${hashes.join('/')}`, {
                headers: this.headers
            });

            return response.data;
        } catch (error) {
            console.error('Error checking instant availability:', error.response?.data || error.message);
            throw new Error('Failed to check torrent availability');
        }
    }

    /**
     * Add a magnet link to Real-Debrid
     * @param {string} magnetLink - The magnet link to add
     * @returns {Promise<Object>} Torrent info
     */
    async addMagnet(magnetLink) {
        try {
            const response = await axios.post(`${this.baseURL}/torrents/addMagnet`, 
                `magnet=${encodeURIComponent(magnetLink)}`,
                {
                    headers: {
                        ...this.headers,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Error adding magnet:', error.response?.data || error.message);
            throw new Error('Failed to add magnet to Real-Debrid');
        }
    }

    /**
     * Get torrent info
     * @param {string} torrentId - The torrent ID
     * @returns {Promise<Object>} Torrent details
     */
    async getTorrentInfo(torrentId) {
        try {
            const response = await axios.get(`${this.baseURL}/torrents/info/${torrentId}`, {
                headers: this.headers
            });

            return response.data;
        } catch (error) {
            console.error('Error getting torrent info:', error.response?.data || error.message);
            throw new Error('Failed to get torrent info');
        }
    }

    /**
     * Select files from a torrent
     * @param {string} torrentId - The torrent ID
     * @param {string} fileIds - Comma-separated file IDs (or 'all')
     * @returns {Promise<void>}
     */
    async selectFiles(torrentId, fileIds = 'all') {
        try {
            await axios.post(`${this.baseURL}/torrents/selectFiles/${torrentId}`,
                `files=${fileIds}`,
                {
                    headers: {
                        ...this.headers,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
        } catch (error) {
            console.error('Error selecting files:', error.response?.data || error.message);
            throw new Error('Failed to select torrent files');
        }
    }

    /**
     * Unrestrict a link (get direct download link)
     * @param {string} link - The link to unrestrict
     * @returns {Promise<string>} Direct download link
     */
    async unrestrictLink(link) {
        try {
            const response = await axios.post(`${this.baseURL}/unrestrict/link`,
                `link=${encodeURIComponent(link)}`,
                {
                    headers: {
                        ...this.headers,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return response.data.download;
        } catch (error) {
            console.error('Error unrestricting link:', error.response?.data || error.message);
            throw new Error('Failed to unrestrict link');
        }
    }

    /**
     * Get streaming link for a torrent
     * @param {string} magnetLink - The magnet link
     * @returns {Promise<string>} Streaming URL
     */
    async getStreamingLink(magnetLink) {
        try {
            // Add the magnet
            const addResult = await this.addMagnet(magnetLink);
            const torrentId = addResult.id;

            // Wait a moment for processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Select all files
            await this.selectFiles(torrentId);

            // Wait for file selection to complete
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Get torrent info
            const torrentInfo = await this.getTorrentInfo(torrentId);

            // Find the largest video file
            const videoFile = torrentInfo.links.reduce((largest, link) => {
                return !largest || link.length > largest.length ? link : largest;
            }, null);

            if (!videoFile) {
                throw new Error('No video file found in torrent');
            }

            // Unrestrict the link
            const streamingUrl = await this.unrestrictLink(videoFile);
            return streamingUrl;

        } catch (error) {
            console.error('Error getting streaming link:', error.message);
            throw error;
        }
    }

    /**
     * Delete a torrent
     * @param {string} torrentId - The torrent ID to delete
     * @returns {Promise<void>}
     */
    async deleteTorrent(torrentId) {
        try {
            await axios.delete(`${this.baseURL}/torrents/delete/${torrentId}`, {
                headers: this.headers
            });
        } catch (error) {
            console.error('Error deleting torrent:', error.response?.data || error.message);
        }
    }
}

module.exports = RealDebridService;
