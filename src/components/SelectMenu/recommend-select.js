const { StringSelectMenuInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const TMDBService = require("../../services/TMDBService");
const { GENRE_IDS } = require("../../services/TMDBService");

module.exports = new Component({
    customId: 'recommend-',
    type: 'select',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {StringSelectMenuInteraction} interaction 
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

            const selectType = interaction.customId.split('-')[1];
            const value = interaction.values[0];

            // Handle genre selection (Step 1)
            if (selectType === 'genre') {
                userData.preferences.genre = value;
                userData.step = 2;
                client.recommendData.set(interaction.user.id, userData);

                // Step 2: Ask for rating preference
                const ratingEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🎬 Movie Recommendation - Step 2/3')
                    .setDescription('**What kind of movie quality are you looking for?**\n\nChoose your preferred rating range!')
                    .setFooter({ text: 'Step 2 of 3 • Rating Preference' });

                const ratingMenu = new StringSelectMenuBuilder()
                    .setCustomId('recommend-rating')
                    .setPlaceholder('Choose rating preference')
                    .addOptions([
                        { label: '⭐⭐⭐⭐⭐ Highly Rated (8.0+)', value: 'high', description: 'Only the best movies' },
                        { label: '⭐⭐⭐⭐ Good Movies (7.0+)', value: 'good', description: 'Solid entertainment' },
                        { label: '⭐⭐⭐ Any Rating (6.0+)', value: 'any', description: 'Surprise me!' }
                    ]);

                const row = new ActionRowBuilder().addComponents(ratingMenu);

                return await interaction.editReply({
                    embeds: [ratingEmbed],
                    components: [row]
                });
            }

            // Handle rating selection (Step 2)
            if (selectType === 'rating') {
                userData.preferences.rating = value;
                userData.step = 3;
                client.recommendData.set(interaction.user.id, userData);

                // Step 3: Ask for release year preference
                const yearEmbed = new EmbedBuilder()
                    .setColor('#FFD700')
                    .setTitle('🎬 Movie Recommendation - Step 3/3')
                    .setDescription('**When should the movie be from?**\n\nChoose your preferred time period!')
                    .setFooter({ text: 'Step 3 of 3 • Release Period' });

                const yearMenu = new StringSelectMenuBuilder()
                    .setCustomId('recommend-year')
                    .setPlaceholder('Choose time period')
                    .addOptions([
                        { label: '🔥 New Releases (2023-2025)', value: 'new', description: 'Latest movies' },
                        { label: '📅 Recent Years (2020-2025)', value: 'recent', description: 'Modern films' },
                        { label: '🎞️ Any Year', value: 'any', description: 'Classic or new' }
                    ]);

                const row = new ActionRowBuilder().addComponents(yearMenu);

                return await interaction.editReply({
                    embeds: [yearEmbed],
                    components: [row]
                });
            }

            // Handle year selection (Step 3) and generate recommendation
            if (selectType === 'year') {
                userData.preferences.year = value;
                client.recommendData.set(interaction.user.id, userData);

                // Show loading
                await interaction.editReply({
                    content: '🎬 Finding the perfect movie for you...',
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
                        content: '❌ No movies found matching your preferences. Try `/recommend` again!',
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
                    // Fallback to non-filtered if no matches
                    filteredMovies = movies.slice(0, 10);
                }

                // Pick a random movie from filtered results
                const randomMovie = filteredMovies[Math.floor(Math.random() * Math.min(10, filteredMovies.length))];

                // Get full details
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

                // Store movie data for watch button
                userData.recommendedMovie = movieDetails;
                client.recommendData.set(interaction.user.id, userData);

                return await interaction.editReply({
                    content: null,
                    embeds: [recommendEmbed],
                    components: [buttons]
                });
            }

        } catch (error) {
            console.error('Error in recommend select:', error);
            await interaction.editReply({
                content: `❌ An error occurred: ${error.message}`,
                components: []
            });
        }
    }
}).toJSON();
