const { ButtonInteraction, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const TorrentService = require("../../services/TorrentService");

module.exports = new Component({
    customId: 'recommend-',
    type: 'button',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ButtonInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        try {
            const userData = client.recommendData?.get(interaction.user.id);
            
            if (!userData) {
                return await interaction.editReply({
                    content: '❌ Recommendation session expired. Use `/recommend` to start again.',
                    embeds: [],
                    components: []
                });
            }

            const buttonType = interaction.customId.split('-')[1];

            // Handle "Try Again" button
            if (buttonType === 'again') {
                const TMDBService = require("../../services/TMDBService");
                const { GENRE_IDS } = require("../../services/TMDBService");
                const { EmbedBuilder } = require("discord.js");

                // Show loading
                await interaction.editReply({
                    content: '🎲 Finding another perfect match...',
                    embeds: [],
                    components: []
                });

                const tmdbService = new TMDBService(process.env.TMDB_API_KEY);
                const { genre, rating, year } = userData.preferences;

                // Fetch movies based on preferences
                const genreId = GENRE_IDS[genre] || GENRE_IDS.action;
                const movies = await tmdbService.getMoviesByGenre(genreId, 1);

                if (!movies || movies.length === 0) {
                    return await interaction.editReply({
                        content: '❌ No movies found. Try `/recommend` again!',
                        components: []
                    });
                }

                // Filter by rating preference
                let filteredMovies = movies;
                if (rating === 'high') {
                    filteredMovies = movies.filter(m => parseFloat(m.rating) >= 8.0);
                } else if (rating === 'good') {
                    filteredMovies = movies.filter(m => parseFloat(m.rating) >= 7.0);
                } else {
                    filteredMovies = movies.filter(m => parseFloat(m.rating) >= 6.0);
                }

                // Filter by year preference
                if (year === 'new') {
                    filteredMovies = filteredMovies.filter(m => parseInt(m.year) >= 2023);
                } else if (year === 'recent') {
                    filteredMovies = filteredMovies.filter(m => parseInt(m.year) >= 2020);
                }

                if (filteredMovies.length === 0) {
                    filteredMovies = movies.slice(0, 10);
                }

                // Exclude the previously recommended movie if possible
                if (userData.recommendedMovie && filteredMovies.length > 1) {
                    filteredMovies = filteredMovies.filter(m => m.tmdbId !== userData.recommendedMovie.tmdbId);
                }

                // Pick a random different movie
                const randomMovie = filteredMovies[Math.floor(Math.random() * Math.min(10, filteredMovies.length))];
                const movieDetails = await tmdbService.getMovieDetails(randomMovie.tmdbId);

                // Create recommendation embed
                const recommendEmbed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle(`🎬 I Recommend: ${movieDetails.title}`)
                    .setURL(movieDetails.imdbId ? `https://www.imdb.com/title/${movieDetails.imdbId}/` : `https://www.themoviedb.org/movie/${movieDetails.tmdbId}`)
                    .setDescription(
                        `${movieDetails.tagline ? `*"${movieDetails.tagline}"*\n\n` : ''}` +
                        `${movieDetails.overview}\n\n` +
                        `**Why this movie?**\n` +
                        `✓ Matches your ${genre} preference\n` +
                        `✓ ${rating === 'high' ? 'Highly rated' : rating === 'good' ? 'Well-rated' : 'Quality'} movie\n` +
                        `✓ ${year === 'new' ? 'Recent release' : year === 'recent' ? 'Modern film' : 'Great pick'}`
                    )
                    .addFields(
                        { name: '⭐ Rating', value: `${movieDetails.rating}/10`, inline: true },
                        { name: '📅 Year', value: movieDetails.year, inline: true },
                        { name: '⏱️ Runtime', value: movieDetails.runtime, inline: true },
                        { name: '🎭 Genre', value: movieDetails.genres, inline: true },
                        { name: '🎬 Director', value: movieDetails.director, inline: true },
                        { name: '👥 Cast', value: movieDetails.cast, inline: true }
                    )
                    .setFooter({ text: 'Click "Watch Now" to stream • Click "Try Again" for another recommendation' });

                if (movieDetails.poster) {
                    recommendEmbed.setImage(movieDetails.poster);
                }

                // Create action buttons
                const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
                const buttons = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId(`recommend-watch-${movieDetails.imdbId || movieDetails.tmdbId}`)
                            .setLabel('🎬 Watch Now')
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(!movieDetails.imdbId),
                        new ButtonBuilder()
                            .setCustomId('recommend-again')
                            .setLabel('🔄 Try Again')
                            .setStyle(ButtonStyle.Primary)
                    );

                // Store new movie data
                userData.recommendedMovie = movieDetails;
                client.recommendData.set(interaction.user.id, userData);

                return await interaction.editReply({
                    content: null,
                    embeds: [recommendEmbed],
                    components: [buttons]
                });
            }

            // Handle "Watch Now" button
            if (buttonType === 'watch') {
                const movie = userData.recommendedMovie;
                
                if (!movie || !movie.imdbId) {
                    return await interaction.editReply({
                        content: '❌ This movie doesn\'t have an IMDb ID for streaming.',
                        embeds: [],
                        components: []
                    });
                }

                // Search for torrents
                await interaction.editReply({
                    content: '🔍 Searching for torrents...',
                    embeds: [],
                    components: []
                });

                const torrentService = new TorrentService();
                const torrents = await torrentService.searchByImdbId(movie.imdbId, 'movie');

                if (!torrents || torrents.length === 0) {
                    return await interaction.editReply({
                        content: `❌ No torrents found for ${movie.title}. Try another recommendation!`,
                        components: []
                    });
                }

                // Create select menu for quality options
                const torrentOptions = torrents.slice(0, 25).map((torrent, index) => ({
                    label: torrent.displayName.substring(0, 100),
                    value: `torrent_${movie.imdbId}_movie_${index}`,
                    description: `Quality: ${torrent.quality}`
                }));

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('watchparty-torrent-select')
                    .setPlaceholder('Select quality')
                    .addOptions(torrentOptions);

                const row = new ActionRowBuilder().addComponents(selectMenu);

                // Store data for the torrent select
                if (!client.watchpartyData) {
                    client.watchpartyData = new Map();
                }
                client.watchpartyData.set(interaction.user.id, {
                    movieData: {
                        imdbId: movie.imdbId,
                        title: movie.title,
                        year: movie.year,
                        poster: movie.poster,
                        imdbRating: movie.rating,
                        imdbVotes: movie.votes.toString(),
                        runtime: movie.runtime,
                        genre: movie.genres,
                        director: movie.director,
                        plot: movie.overview,
                        type: 'movie'
                    },
                    torrents: torrents
                });

                return await interaction.editReply({
                    content: '✅ Found torrents! Select your preferred quality:',
                    embeds: [],
                    components: [row]
                });
            }

        } catch (error) {
            console.error('Error in recommend buttons:', error);
            await interaction.editReply({
                content: `❌ An error occurred: ${error.message}`,
                components: []
            }).catch(console.error);
        }
    }
}).toJSON();
