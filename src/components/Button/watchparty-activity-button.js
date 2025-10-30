const { ButtonInteraction } = require("discord.js");
const Component = require("../../structure/Component");
const DiscordBot = require("../../client/DiscordBot");

module.exports = new Component({
    customId: 'launch_activity_',
    type: 'button',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {ButtonInteraction} interaction 
     */
    run: async (client, interaction) => {
        try {
            // Defer the reply immediately to prevent timeout
            await interaction.deferReply({ ephemeral: false });

            // Get activity data using the full customId
            const activityData = client.activityData?.get(interaction.customId);

            if (!activityData) {
                return await interaction.editReply({
                    content: '❌ This activity has expired. Please start a new watch party.'
                });
            }

            // Check if user is in a voice channel
            if (!interaction.member.voice.channel) {
                return await interaction.editReply({
                    content: '❌ You must be in a voice channel to join the watch party!'
                });
            }

            // Check if user is in the same voice channel
            if (interaction.member.voice.channel.id !== activityData.channelId) {
                return await interaction.editReply({
                    content: '❌ You must be in the same voice channel as the watch party host!'
                });
            }

            // For now, send the direct activity URL
            // Note: Full Discord Activity API integration requires additional setup
            const activityLink = activityData.url;
            
            await interaction.editReply({
                content: `🎬 **Watch Party Ready!**\n\n**${activityData.title}**\n\n` +
                    `Open this link to join: ${activityLink}\n\n` +
                    `⚡ **Features:**\n` +
                    `• Synchronized playback\n` +
                    `• First person becomes host\n` +
                    `• Real-time sync with all viewers\n\n` +
                    `*Make sure everyone is in the same voice channel!*`
            });

        } catch (error) {
            console.error('Error in watchparty activity button:', error);
            
            // Try to respond to the interaction
            const errorMessage = `❌ An error occurred: ${error.message}`;
            
            if (interaction.deferred) {
                await interaction.editReply({ content: errorMessage }).catch(console.error);
            } else {
                await interaction.reply({ content: errorMessage, ephemeral: true }).catch(console.error);
            }
        }
    }
}).toJSON();
