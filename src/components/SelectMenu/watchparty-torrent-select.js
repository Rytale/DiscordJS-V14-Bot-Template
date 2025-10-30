const { StringSelectMenuInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const RealDebridService = require("../../services/RealDebridService");
const WatchPartyService = require("../../services/WatchPartyService");

module.exports = new Component({
    customId: 'watchparty-torrent-select',
    type: 'select',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {StringSelectMenuInteraction} interaction 
     */
    run: async (client, interaction) => {
        await interaction.deferUpdate();

        try {
            // Get stored data
            const userData = client.watchpartyData?.get(interaction.user.id);
            
            if (!userData) {
                return await interaction.editReply({
                    content: '❌ Session expired. Please run the command again.',
                    embeds: [],
                    components: []
                });
            }

            const { movieData, torrents } = userData;
            const selectedValue = interaction.values[0];
            
            // Parse the selected torrent index
            const parts = selectedValue.split('_');
            const torrentIndex = parseInt(parts[parts.length - 1]);
            const selectedTorrent = torrents[torrentIndex];

            if (!selectedTorrent) {
                return await interaction.editReply({
                    content: '❌ Invalid torrent selection.',
                    components: []
                });
            }

            // Create a nice loading embed
            const loadingEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('🎬 Preparing Your Watch Party')
                .setDescription(`**${movieData.title}**\n*${selectedTorrent.quality} • ${selectedTorrent.size}*`)
                .addFields(
                    { name: '⏳ Status', value: '```Adding torrent to Real-Debrid...```', inline: false }
                )
                .setFooter({ text: 'This may take a few moments' })
                .setTimestamp();

            await interaction.editReply({
                embeds: [loadingEmbed],
                components: []
            });

            // Initialize Real-Debrid service
            const rdService = new RealDebridService(process.env.REAL_DEBRID_API_KEY);
            
            // Get streaming link from Real-Debrid
            let streamingUrl;
            try {
                loadingEmbed.setFields(
                    { name: '⏳ Status', value: '```Getting streaming link...```', inline: false }
                );
                await interaction.editReply({ embeds: [loadingEmbed] });
                
                streamingUrl = await rdService.getStreamingLink(selectedTorrent.magnetLink);
            } catch (error) {
                console.error('Real-Debrid error:', error);
                const errorEmbed = new EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('❌ Failed to Process Torrent')
                    .setDescription(`**Error:** ${error.message}\n\nPlease try a different quality or check your Real-Debrid account.`)
                    .setFooter({ text: 'Tip: Try selecting a different torrent' });
                
                return await interaction.editReply({
                    embeds: [errorEmbed],
                    components: []
                });
            }

            // Create watch party link
            loadingEmbed.setFields(
                { name: '⏳ Status', value: '```Creating watch party room...```', inline: false }
            );
            await interaction.editReply({ embeds: [loadingEmbed] });

            const watchPartyService = new WatchPartyService();
            const watchPartyUrl = await watchPartyService.createRoom(streamingUrl, movieData.title);

            // Create final embed with all info - professional styling
            const finalEmbed = new EmbedBuilder()
                .setColor('#00D26A') // Success green
                .setTitle(`✅ ${movieData.title}`)
                .setURL(`https://www.imdb.com/title/${movieData.imdbId}/`)
                .setDescription(`**Your watch party is ready!**\n\n*Choose your preferred streaming method below*`)
                .addFields(
                    { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' }, // Divider
                    { name: '📊 Torrent Details', value: '\u200B' },
                    { name: '🎥 Quality', value: `\`\`\`${selectedTorrent.quality}\`\`\``, inline: true },
                    { name: '💾 File Size', value: `\`\`\`${selectedTorrent.size}\`\`\``, inline: true },
                    { name: '👥 Seeders', value: `\`\`\`${selectedTorrent.seeders}\`\`\``, inline: true },
                    { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' }, // Divider
                    { name: '🎉 Watch Party', value: `**[» Click Here to Create Watch Party «](${watchPartyUrl})**\n\`Opens watchparty.me with your video ready to share\``, inline: false },
                    { name: '\u200B', value: '\u200B' }, // Spacer
                    { name: '📺 Direct Stream Link', value: `**[Open in Video Player](${streamingUrl})**\n\`Alternative: Copy link to VLC, MPV, or any media player\``, inline: false }
                )
                .setFooter({ 
                    text: `Stream expires after inactivity • Powered by Real-Debrid`,
                    iconURL: 'https://fcdn.real-debrid.com/0830/images/favicon.png'
                })
                .setTimestamp();

            if (movieData.poster && movieData.poster !== 'N/A') {
                finalEmbed.setThumbnail(movieData.poster);
            }

            await interaction.editReply({
                content: '✅ Watch party created successfully!',
                embeds: [finalEmbed],
                components: []
            });

            // Clean up stored data
            client.watchpartyData.delete(interaction.user.id);

        } catch (error) {
            console.error('Error in torrent select:', error);
            await interaction.editReply({
                content: `❌ An error occurred: ${error.message}`,
                embeds: [],
                components: []
            });
        }
    }
}).toJSON();
