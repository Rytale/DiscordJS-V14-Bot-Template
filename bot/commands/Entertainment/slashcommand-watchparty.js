const { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const IMDbService = require("../../services/IMDbService");
const TorrentService = require("../../services/TorrentService");

module.exports = new ApplicationCommand({
    command: {
        name: 'watchparty',
        description: 'Create a watch party link for movies or TV shows',
        type: 1,
        options: [
            {
                name: 'title',
                description: 'Search by movie/show title',
                type: 3, // STRING
                required: false,
                autocomplete: true
            },
            {
                name: 'imdb_id',
                description: 'Search by IMDb ID (e.g., tt1375666)',
                type: 3, // STRING
                required: false
            }
        ]
    },
    options: {
        cooldown: 10000
    },
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ChatInputCommandInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.deferReply();

        try {
            const title = interaction.options.getString('title');
            const imdbId = interaction.options.getString('imdb_id');

            // Validate input
            if (!title && !imdbId) {
                return await interaction.editReply({
                    content: '❌ Please provide either a title or an IMDb ID!',
                    ephemeral: true
                });
            }

            // Initialize services
            const imdbService = new IMDbService(process.env.OMDB_API_KEY);
            const torrentService = new TorrentService();

            let movieData;

            // Get movie/show data
            if (imdbId) {
                movieData = await imdbService.getDetailsByImdbId(imdbId);
            } else {
                // If autocomplete was used, the title is actually an IMDb ID
                if (title.startsWith('tt')) {
                    movieData = await imdbService.getDetailsByImdbId(title);
                } else {
                    movieData = await imdbService.getDetailsByTitle(title);
                }
            }

            // Create IMDb info embed with better styling
            const embed = new EmbedBuilder()
                .setColor('#FFD700') // Gold color
                .setTitle(`🎬 ${movieData.title}`)
                .setURL(`https://www.imdb.com/title/${movieData.imdbId}/`)
                .setDescription(movieData.plot && movieData.plot !== 'N/A' 
                    ? `*${movieData.plot.substring(0, 300)}${movieData.plot.length > 300 ? '...' : ''}*`
                    : '*No plot available*')
                .addFields(
                    { name: '\u200B', value: '\u200B' }, // Spacer
                    { name: '📅 Year', value: `\`${movieData.year || 'N/A'}\``, inline: true },
                    { name: '⭐ IMDb Rating', value: `\`${movieData.imdbRating || 'N/A'}/10\``, inline: true },
                    { name: '⏱️ Runtime', value: `\`${movieData.runtime || 'N/A'}\``, inline: true },
                    { name: '🎭 Genre', value: `\`${movieData.genre || 'N/A'}\``, inline: true },
                    { name: '🎬 Director', value: `\`${movieData.director || 'N/A'}\``, inline: true },
                    { name: '🎥 Type', value: `\`${movieData.type.toUpperCase()}\``, inline: true },
                    { name: '\u200B', value: '\u200B' } // Spacer
                )
                .setFooter({ 
                    text: `IMDb • ${movieData.imdbVotes || '0'} votes`,
                    iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg'
                })
                .setTimestamp();

            if (movieData.poster && movieData.poster !== 'N/A') {
                embed.setImage(movieData.poster);
            }

            // Check if it's a TV series
            if (movieData.type === 'series') {
                // Show season/episode selection
                const totalSeasons = parseInt(movieData.totalSeasons) || 1;
                const seasonOptions = [];

                for (let i = 1; i <= Math.min(totalSeasons, 25); i++) {
                    seasonOptions.push({
                        label: `Season ${i}`,
                        value: `season_${movieData.imdbId}_${i}`,
                        description: `Select episodes from season ${i}`
                    });
                }

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('watchparty-season-select')
                    .setPlaceholder('Select a season')
                    .addOptions(seasonOptions);

                const row = new ActionRowBuilder().addComponents(selectMenu);

                await interaction.editReply({
                    embeds: [embed],
                    components: [row]
                });
            } else {
                // It's a movie - search for torrents
                await interaction.editReply({
                    embeds: [embed],
                    content: '🔍 Searching for torrents...'
                });

                const torrents = await torrentService.searchByImdbId(movieData.imdbId, 'movie');

                if (!torrents || torrents.length === 0) {
                    return await interaction.editReply({
                        embeds: [embed],
                        content: '❌ No torrents found for this movie.',
                        components: []
                    });
                }

                // Create select menu for torrent quality options
                const torrentOptions = torrents.slice(0, 25).map((torrent, index) => ({
                    label: torrent.displayName.substring(0, 100),
                    value: `torrent_${movieData.imdbId}_movie_${index}`,
                    description: `Quality: ${torrent.quality}`
                }));

                const selectMenu = new StringSelectMenuBuilder()
                    .setCustomId('watchparty-torrent-select')
                    .setPlaceholder('Select quality')
                    .addOptions(torrentOptions);

                const row = new ActionRowBuilder().addComponents(selectMenu);

                // Store torrents data temporarily (you may want to use a better storage method)
                if (!client.watchpartyData) {
                    client.watchpartyData = new Map();
                }
                client.watchpartyData.set(interaction.user.id, {
                    movieData: movieData,
                    torrents: torrents
                });

                await interaction.editReply({
                    embeds: [embed],
                    content: '✅ Found torrents! Select your preferred quality:',
                    components: [row]
                });
            }

        } catch (error) {
            console.error('Error in watchparty command:', error);
            await interaction.editReply({
                content: `❌ An error occurred: ${error.message}`,
                embeds: [],
                components: []
            });
        }
    }
}).toJSON();
