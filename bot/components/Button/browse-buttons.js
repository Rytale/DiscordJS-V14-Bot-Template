const { ButtonInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const TorrentService = require("../../services/TorrentService");

// Handle all browse buttons
module.exports = new Component({
    customId: 'browse-',
    type: 'button',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ButtonInteraction} interaction 
     */
    run: async (client, interaction) => {
        // IMMEDIATELY acknowledge to avoid timeout
        await interaction.deferUpdate().catch(console.error);
        
        try {
            const userData = client.browseData?.get(interaction.user.id);
            
            if (!userData) {
                return await interaction.editReply({
                    content: '❌ Browse session expired. Use `/browse` to start again.',
                    embeds: [],
                    components: []
                });
            }

            const { category, detailedMovies, currentIndex } = userData;
            const buttonType = interaction.customId.split('-')[1];
            
            // Handle "Watch Now" button
            if (buttonType === 'watch') {
                const movie = detailedMovies[currentIndex];
                
                if (!movie.imdbId) {
                    return await interaction.editReply({
                        content: '❌ This movie doesn\'t have an IMDb ID. Try another movie!',
                        embeds: [],
                        components: []
                    });
                }

                // Search for torrents using IMDb ID
                await interaction.editReply({
                    content: '🔍 Searching for torrents...',
                    embeds: [],
                    components: []
                });

                const torrentService = new TorrentService();
                const torrents = await torrentService.searchByImdbId(movie.imdbId, 'movie');

                if (!torrents || torrents.length === 0) {
                    return await interaction.editReply({
                        content: `❌ No torrents found for ${movie.title}. Try browsing to another movie!`,
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

                // Store data for the torrent select - convert TMDB movie to format expected by watchparty
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

                const embed = createMovieEmbed(movie, category, currentIndex + 1, detailedMovies.length);

                return await interaction.editReply({
                    content: '✅ Found torrents! Select your preferred quality:',
                    embeds: [embed],
                    components: [row]
                });
            }

            // Handle navigation - instant since movies are pre-loaded!
            let newIndex = currentIndex;
            
            if (buttonType === 'next') {
                newIndex = currentIndex + 1;
            } else if (buttonType === 'prev') {
                newIndex = currentIndex - 1;
            }

            // Check bounds
            if (newIndex < 0 || newIndex >= detailedMovies.length) {
                return await interaction.editReply({
                    content: '❌ No more movies in this direction.',
                    embeds: [],
                    components: []
                });
            }

            // Get the pre-loaded movie (instant - no API call!)
            const movie = detailedMovies[newIndex];

            // Update stored data
            userData.currentIndex = newIndex;
            client.browseData.set(interaction.user.id, userData);

            // Create embed
            const embed = createMovieEmbed(movie, category, newIndex + 1, detailedMovies.length);

            // Create navigation buttons
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('browse-prev')
                        .setLabel('◀ Previous')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(newIndex === 0),
                    new ButtonBuilder()
                        .setCustomId('browse-next')
                        .setLabel('Next ▶')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(newIndex >= detailedMovies.length - 1),
                    new ButtonBuilder()
                        .setCustomId('browse-watch')
                        .setLabel('🎬 Watch Now')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(!movie.imdbId)
                );

            // Update with the new movie
            await interaction.editReply({
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            console.error('Error in browse buttons:', error);
            try {
                await interaction.editReply({
                    content: `❌ An error occurred: ${error.message}`,
                    embeds: [],
                    components: []
                }).catch(console.error);
            } catch (e) {
                console.error('Failed to send error message:', e);
            }
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
            text: `${categoryNames[category]} • Movie ${position}/${total} • ${movie.imdbId ? 'Click "Watch Now" to stream' : 'No IMDb ID available'}`,
            iconURL: 'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg'
        })
        .setTimestamp();

    if (movie.poster) {
        embed.setImage(movie.poster);
    }

    return embed;
}
