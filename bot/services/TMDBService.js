const axios = require('axios');

class TMDBService {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://api.themoviedb.org/3';
        this.imageBaseURL = 'https://image.tmdb.org/t/p/w500';
    }

    /**
     * Get popular movies
     * @param {number} page - Page number
     * @returns {Promise<Array>} Array of movies
     */
    async getPopularMovies(page = 1) {
        try {
            const response = await axios.get(`${this.baseURL}/movie/popular`, {
                params: {
                    api_key: this.apiKey,
                    page: page,
                    language: 'en-US'
                }
            });
            return this.formatMovies(response.data.results);
        } catch (error) {
            console.error('TMDB Error:', error.message);
            throw new Error('Failed to fetch popular movies');
        }
    }

    /**
     * Get movies by genre
     * @param {string} genreId - Genre ID
     * @param {number} page - Page number
     * @returns {Promise<Array>} Array of movies
     */
    async getMoviesByGenre(genreId, page = 1) {
        try {
            const response = await axios.get(`${this.baseURL}/discover/movie`, {
                params: {
                    api_key: this.apiKey,
                    with_genres: genreId,
                    sort_by: 'popularity.desc',
                    page: page,
                    language: 'en-US',
                    'primary_release_date.gte': '2020-01-01' // Recent movies
                }
            });
            return this.formatMovies(response.data.results);
        } catch (error) {
            console.error('TMDB Error:', error.message);
            throw new Error('Failed to fetch movies by genre');
        }
    }

    /**
     * Get trending movies
     * @returns {Promise<Array>} Array of movies
     */
    async getTrendingMovies() {
        try {
            const response = await axios.get(`${this.baseURL}/trending/movie/week`, {
                params: {
                    api_key: this.apiKey,
                    language: 'en-US'
                }
            });
            return this.formatMovies(response.data.results);
        } catch (error) {
            console.error('TMDB Error:', error.message);
            throw new Error('Failed to fetch trending movies');
        }
    }

    /**
     * Get movie details by TMDB ID
     * @param {number} tmdbId - TMDB movie ID
     * @returns {Promise<Object>} Movie details
     */
    async getMovieDetails(tmdbId) {
        try {
            const response = await axios.get(`${this.baseURL}/movie/${tmdbId}`, {
                params: {
                    api_key: this.apiKey,
                    append_to_response: 'external_ids,credits',
                    language: 'en-US'
                }
            });
            return this.formatMovieDetails(response.data);
        } catch (error) {
            console.error('TMDB Error:', error.message);
            throw new Error('Failed to fetch movie details');
        }
    }

    /**
     * Format movie data
     * @param {Array} movies - Raw TMDB movies
     * @returns {Array} Formatted movies
     */
    formatMovies(movies) {
        return movies.map(movie => ({
            tmdbId: movie.id,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
            votes: movie.vote_count || 0,
            overview: movie.overview || 'No overview available',
            poster: movie.poster_path ? `${this.imageBaseURL}${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `${this.imageBaseURL}${movie.backdrop_path}` : null
        }));
    }

    /**
     * Format detailed movie data
     * @param {Object} movie - Raw TMDB movie details
     * @returns {Object} Formatted movie details
     */
    formatMovieDetails(movie) {
        const director = movie.credits?.crew?.find(person => person.job === 'Director');
        const cast = movie.credits?.cast?.slice(0, 3).map(actor => actor.name).join(', ') || 'N/A';

        return {
            tmdbId: movie.id,
            imdbId: movie.external_ids?.imdb_id || null,
            title: movie.title,
            year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
            releaseDate: movie.release_date || 'N/A',
            rating: movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A',
            votes: movie.vote_count || 0,
            runtime: movie.runtime ? `${movie.runtime} min` : 'N/A',
            genres: movie.genres?.map(g => g.name).join(', ') || 'N/A',
            overview: movie.overview || 'No overview available',
            director: director?.name || 'N/A',
            cast: cast,
            poster: movie.poster_path ? `${this.imageBaseURL}${movie.poster_path}` : null,
            backdrop: movie.backdrop_path ? `${this.imageBaseURL}${movie.backdrop_path}` : null,
            tagline: movie.tagline || '',
            budget: movie.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : 'N/A',
            revenue: movie.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : 'N/A'
        };
    }
}

// TMDB Genre IDs
const GENRE_IDS = {
    action: 28,
    comedy: 35,
    horror: 27,
    scifi: 878,
    drama: 18,
    thriller: 53,
    romance: 10749
};

module.exports = TMDBService;
module.exports.GENRE_IDS = GENRE_IDS;
