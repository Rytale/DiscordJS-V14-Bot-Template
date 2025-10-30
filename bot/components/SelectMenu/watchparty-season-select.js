const { StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const Component = require("../../structure/Component");
const IMDbService = require("../../services/IMDbService");

module.exports = new Component({
    customId: 'watchparty-season-select',
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

            await interaction.editReply({
                content: `🔍 Loading episodes for Season ${season}...`,
                components: []
            });

            // Get season details
            const imdbService = new IMDbService(process.env.OMDB_API_KEY);
            const seasonData = await imdbService.getSeasonDetails(imdbId, season);

            if (!seasonData || !seasonData.episodes || seasonData.episodes.length === 0) {
                return await interaction.editReply({
                    content: '❌ No episodes found for this season.',
                    components: []
                });
            }

            // Create episode selection menu
            const episodeOptions = seasonData.episodes.slice(0, 25).map(episode => ({
                label: `Episode ${episode.episode}: ${episode.title}`.substring(0, 100),
                value: `episode_${imdbId}_${season}_${episode.episode}`,
                description: `Rating: ${episode.imdbRating || 'N/A'}`
            }));

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('watchparty-episode-select')
                .setPlaceholder('Select an episode')
                .addOptions(episodeOptions);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            // Store season data
            if (!client.watchpartyData) {
                client.watchpartyData = new Map();
            }
            
            const userData = client.watchpartyData.get(interaction.user.id) || {};
            userData.imdbId = imdbId;
            userData.season = season;
            client.watchpartyData.set(interaction.user.id, userData);

            await interaction.editReply({
                content: `✅ Select an episode from Season ${season}:`,
                components: [row]
            });

        } catch (error) {
            console.error('Error in season select:', error);
            await interaction.editReply({
                content: `❌ An error occurred: ${error.message}`,
                components: []
            });
        }
    }
}).toJSON();
