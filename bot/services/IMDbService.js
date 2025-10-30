const axios = require('axios');

class IMDbService {
    constructor(apiKey = null) {
        // Using OMDb API - if no key provided, we'll use a limited public endpoint
        this.apiKey = apiKey || ''; // User can add their own OMDb API key
        this.baseURL = 'https://www.omdbapi.com';
    }

    /**
     * Search for movies/TV shows by title
     * @param {string} title - The title to search for
     * @param {string} type - 'movie', 'series', or null for all
     * @param {number} year - Optional year filter
     * @returns {Promise<Array>} Search results
     */
    async searchByTitle(title, type = null, year = null) {
        try {
            const params = {
                apikey: this.apiKey,
                s: title,
                type: type,
                y: year
            };

            // Remove null/undefined params
            Object.keys(params).forEach(key => {
                if (params[key] === null || params[key] === undefined) {
                    delete params[key];
                }
            });

            const response = await axios.get(this.baseURL, { params });

            if (response.data.Response === 'False') {
                return [];
            }

            return response.data.Search || [];
        } catch (error) {
            console.error('Error searching IMDb:', error.message);
            throw new Error('Failed to search IMDb');
        }
    }

    /**
     * Get detailed information by IMDb ID
     * @param {string} imdbId - The IMDb ID (e.g., 'tt1375666')
     * @returns {Promise<Object>} Detailed movie/show information
     */
    async getDetailsByImdbId(imdbId) {
        try {
            const response = await axios.get(this.baseURL, {
                params: {
                    apikey: this.apiKey,
                    i: imdbId,
                    plot: 'full'
                }
            });

            if (response.data.Response === 'False') {
                throw new Error(response.data.Error || 'Movie not found');
            }

            return this.formatMovieData(response.data);
        } catch (error) {
            console.error('Error getting IMDb details:', error.message);
            throw new Error('Failed to get movie details');
        }
    }

    /**
     * Get detailed information by title (gets the first match)
     * @param {string} title - The title to search for
     * @param {string} type - 'movie', 'series', or null
     * @returns {Promise<Object>} Detailed movie/show information
     */
    async getDetailsByTitle(title, type = null) {
        try {
            const response = await axios.get(this.baseURL, {
                params: {
                    apikey: this.apiKey,
                    t: title,
                    type: type,
                    plot: 'full'
                }
            });

            if (response.data.Response === 'False') {
                throw new Error(response.data.Error || 'Movie not found');
            }

            return this.formatMovieData(response.data);
        } catch (error) {
            console.error('Error getting IMDb details by title:', error.message);
            throw new Error('Failed to get movie details');
        }
    }

    /**
     * Format movie data for consistency
     * @param {Object} data - Raw OMDb data
     * @returns {Object} Formatted data
     */
    formatMovieData(data) {
        return {
            imdbId: data.imdbID,
            title: data.Title,
            year: data.Year,
            rated: data.Rated,
            released: data.Released,
            runtime: data.Runtime,
            genre: data.Genre,
            director: data.Director,
            writer: data.Writer,
            actors: data.Actors,
            plot: data.Plot,
            language: data.Language,
            country: data.Country,
            awards: data.Awards,
            poster: data.Poster !== 'N/A' ? data.Poster : null,
            ratings: data.Ratings,
            imdbRating: data.imdbRating,
            imdbVotes: data.imdbVotes,
            type: data.Type, // 'movie' or 'series'
            totalSeasons: data.totalSeasons,
            // Additional fields
            metascore: data.Metascore,
            boxOffice: data.BoxOffice,
            production: data.Production,
            website: data.Website
        };
    }

    /**
     * Get season information for a TV series
     * @param {string} imdbId - The IMDb ID of the series
     * @param {number} season - Season number
     * @returns {Promise<Object>} Season details with episodes
     */
    async getSeasonDetails(imdbId, season) {
        try {
            const response = await axios.get(this.baseURL, {
                params: {
                    apikey: this.apiKey,
                    i: imdbId,
                    Season: season
                }
            });

            if (response.data.Response === 'False') {
                throw new Error(response.data.Error || 'Season not found');
            }

            return {
                title: response.data.Title,
                season: response.data.Season,
                totalSeasons: response.data.totalSeasons,
                episodes: response.data.Episodes.map(ep => ({
                    episode: ep.Episode,
                    title: ep.Title,
                    released: ep.Released,
                    imdbRating: ep.imdbRating,
                    imdbId: ep.imdbID
                }))
            };
        } catch (error) {
            console.error('Error getting season details:', error.message);
            throw new Error('Failed to get season details');
        }
    }

    /**
     * Create autocomplete options from search results
     * @param {string} query - The search query
     * @returns {Promise<Array>} Autocomplete options
     */
    async getAutocompleteOptions(query) {
        try {
            const results = await this.searchByTitle(query);
            
            return results.slice(0, 25).map(result => ({
                name: `${result.Title} (${result.Year}) - ${result.Type}`,
                value: result.imdbID
            }));
        } catch (error) {
            console.error('Error getting autocomplete options:', error.message);
            return [];
        }
    }
}

module.exports = IMDbService;
