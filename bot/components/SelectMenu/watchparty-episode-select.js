const { StringSelectMenuInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const IMDbService = require("../../services/IMDbService");
const TorrentService = require("../../services/TorrentService");

module.exports = new Component({
    customId: 'watchparty-episode-select',
    type: 'select',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {StringSelectMenuInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        try {
            const selectedValue = interaction.values[0];
            const parts = selectedValue.split('_');
            const imdbId = parts[1];
            const season = parseInt(parts[2]);
            const episode = parseInt(parts[3]);

            await interaction.editReply({
                content: `🔍 Searching torrents for Season ${season} Episode ${episode}...`,
                components: []
            });

            // Get episode details
            const imdbService = new IMDbService(process.env.OMDB_API_KEY);
            const showData = await imdbService.getDetailsByImdbId(imdbId);

            // Search for torrents
            const torrentService = new TorrentService();
            const torrents = await torrentService.searchByImdbId(imdbId, 'series', season, episode);

            if (!torrents || torrents.length === 0) {
                return await interaction.editReply({
                    content: `❌ No torrents found for Season ${season} Episode ${episode}.`,
                    components: []
                });
            }

            // Create embed with episode info - better styling
            const embed = new EmbedBuilder()
                .setColor('#FFD700') // Gold color
                .setTitle(`🎬 ${showData.title}`)
                .setURL(`https://www.imdb.com/title/${imdbId}/`)
                .setDescription(`**Season ${season}, Episode ${episode}**\n\n${showData.plot && showData.plot !== 'N/A' ? `*${showData.plot.substring(0, 200)}...*` : ''}`)
                .addFields(
                    { name: '\u200B', value: '\u200B' }, // Spacer
                    { name: '📅 Year', value: `\`${showData.year || 'N/A'}\``, inline: true },
                    { name: '⭐ IMDb Rating', value: `\`${showData.imdbRating || 'N/A'}/10\``, inline: true },
                    { name: '🎭 Genre', value: `\`${showData.genre || 'N/A'}\``, inline: true },
                    { name: '\u200B', value: '\u200B' } // Spacer
                )
                .setFooter({ 
                    text: `IMDb • ${showData.imdbVotes || '0'} votes`,
                    iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg'
                })
                .setTimestamp();

            if (showData.poster && showData.poster !== 'N/A') {
                embed.setImage(showData.poster);
            }

            // Create select menu for torrent quality options
            const torrentOptions = torrents.slice(0, 25).map((torrent, index) => ({
                label: torrent.displayName.substring(0, 100),
                value: `torrent_${imdbId}_series_${index}_${season}_${episode}`,
                description: `Quality: ${torrent.quality}`
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('watchparty-episode-torrent-select')
                .setPlaceholder('Select quality')
                .addOptions(torrentOptions);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Store torrents data
            if (!client.watchpartyData) {
                client.watchpartyData = new Map();
            }
            
            const userData = client.watchpartyData.get(interaction.user.id) || {};
            userData.movieData = {
                ...showData,
                season: season,
                episode: episode,
                displayTitle: `${showData.title} - S${season}E${episode}`
            };
            userData.torrents = torrents;
            client.watchpartyData.set(interaction.user.id, userData);

            await interaction.editReply({
                content: '✅ Found torrents! Select your preferred quality:',
                embeds: [embed],
                components: [row]
            });

        } catch (error) {
            console.error('Error in episode select:', error);
            await interaction.editReply({
                content: `❌ An error occurred: ${error.message}`,
                embeds: [],
                components: []
            });
        }
    }
}).toJSON();
