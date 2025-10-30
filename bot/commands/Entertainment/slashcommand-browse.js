const { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const TMDBService = require("../../services/TMDBService");
const { GENRE_IDS } = require("../../services/TMDBService");

module.exports = new ApplicationCommand({
    command: {
        name: 'browse',
        description: 'Browse recent and popular movies',
        type: 1,
        options: [
            {
                name: 'category',
                description: 'Choose a category to browse',
                type: 3,
                required: true,
                choices: [
                    { name: '🔥 Popular Now', value: 'popular' },
                    { name: '💥 Action', value: 'action' },
                    { name: '😂 Comedy', value: 'comedy' },
                    { name: '🚀 Sci-Fi', value: 'scifi' },
                    { name: '👻 Horror', value: 'horror' },
                    { name: '🎭 Drama', value: 'drama' }
                ]
            }
        ]
    },
    options: {
        cooldown: 5000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.deferReply();

        try {
            // Check if TMDB API key is set
            if (!process.env.TMDB_API_KEY || process.env.TMDB_API_KEY.trim() === '') {
                return await interaction.editReply({
                    content: '❌ TMDB API key not configured. Please add your TMDB API key to the .env file.\nGet one free at: https://www.themoviedb.org/settings/api'
                });
            }

            const category = interaction.options.getString('category');
            const tmdbService = new TMDBService(process.env.TMDB_API_KEY);

            // Fetch movies based on category
            let movies;
            if (category === 'popular') {
                movies = await tmdbService.getTrendingMovies();
            } else {
                const genreId = GENRE_IDS[category];
                movies = await tmdbService.getMoviesByGenre(genreId);
            }

            if (!movies || movies.length === 0) {
                return await interaction.editReply({
                    content: '❌ No movies found in this category. Try another!'
                });
            }

            // Pre-load details for first 10 movies for instant navigation
            await interaction.editReply({
                content: '⏳ Loading movies... This may take a moment.'
            });

            const detailedMovies = [];
            for (let i = 0; i < Math.min(10, movies.length); i++) {
                try {
                    const details = await tmdbService.getMovieDetails(movies[i].tmdbId);
                    detailedMovies.push(details);
                } catch (error) {
                    console.error(`Failed to load movie ${i}:`, error);
                }
            }

            if (detailedMovies.length === 0) {
                return await interaction.editReply({
                    content: '❌ Failed to load movie details. Please try again.'
                });
            }

            // Store browse session with pre-loaded movies
            if (!client.browseData) {
                client.browseData = new Map();
            }

            client.browseData.set(interaction.user.id, {
                category: category,
                detailedMovies: detailedMovies,
                currentIndex: 0
            });

            // Create embed for first movie
            const embed = createMovieEmbed(detailedMovies[0], category, 1, detailedMovies.length);

            // Create buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('browse-prev')
                        .setLabel('◀ Previous')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('browse-next')
                        .setLabel('Next ▶')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(detailedMovies.length <= 1),
                    new ButtonBuilder()
                        .setCustomId('browse-watch')
                        .setLabel('🎬 Watch Now')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(!detailedMovies[0].imdbId)
                );

            await interaction.editReply({
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            console.error('Error in browse command:', error);
            await interaction.editReply({
                content: `❌ An error occurred: ${error.message}\n\nMake sure your TMDB API key is valid.`
            });
        }
    }
}).toJSON();

function createMovieEmbed(movie, category, position, total) {
    const categoryNames = {
        popular: '🔥 Popular Now',
        action: '💥 Action Movies',
        comedy: '😂 Comedy Movies',
        scifi: '🚀 Sci-Fi Movies',
        horror: '👻 Horror Movies',
        drama: '🎭 Drama Movies'
    };

    const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`${movie.title} (${movie.year})`)
        .setURL(movie.imdbId ? `https://www.imdb.com/title/${movie.imdbId}/` : `https://www.themoviedb.org/movie/${movie.tmdbId}`)
        .setDescription(movie.tagline ? `*"${movie.tagline}"*\n\n${movie.overview}` : movie.overview)
        .addFields(
            { name: '⭐ Rating', value: `${movie.rating}/10`, inline: true },
            { name: '🗳️ Votes', value: movie.votes.toLocaleString(), inline: true },
            { name: '⏱️ Runtime', value: movie.runtime, inline: true },
            { name: '🎭 Genre', value: movie.genres, inline: true },
            { name: '🎬 Director', value: movie.director, inline: true },
            { name: '🎭 Cast', value: movie.cast, inline: true }
        )
        .setFooter({ 
            text: `${categoryNames[category]} • Movie ${position}/${total} • Click "Watch Now" to stream`,
            iconURL: 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg'
        })
        .setTimestamp();

    if (movie.poster) {
        embed.setImage(movie.poster);
    }

    return embed;
}
