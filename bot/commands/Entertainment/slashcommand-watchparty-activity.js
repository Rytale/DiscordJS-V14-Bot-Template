const { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const RealDebridService = require("../../services/RealDebridService");

module.exports = new ApplicationCommand({
    command: {
        name: 'watch',
        description: 'Start a Discord Activity watch party with synchronized playback',
        type: 1,
        options: [
            {
                name: 'url',
                description: 'Direct streaming URL (from Real-Debrid or similar)',
                type: 3, // STRING
                required: true
            },
            {
                name: 'title',
                description: 'Movie/Show title for the watch party',
                type: 3, // STRING
                required: false
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
        try {
            // Check if user is in a voice channel
            if (!interaction.member.voice.channel) {
                return await interaction.reply({
                    content: '❌ You must be in a voice channel to start a watch party!',
                    ephemeral: true
                });
            }

            const streamUrl = interaction.options.getString('url');
            const title = interaction.options.getString('title') || 'Watch Party';

            // Validate URL (basic check)
            try {
                new URL(streamUrl);
            } catch (error) {
                return await interaction.reply({
                    content: '❌ Invalid URL provided. Please provide a valid streaming URL.',
                    ephemeral: true
                });
            }

            // Create the activity URL with encoded parameters
            const activityUrl = `https://eva-11s8nuj39-rytales-projects.vercel.app/?streamUrl=${encodeURIComponent(streamUrl)}&title=${encodeURIComponent(title)}`;

            // Create embed
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('🎬 Watch Party Activity')
                .setDescription(`**${title}**\n\nClick the button below to join the watch party!`)
                .addFields(
                    { name: '📺 Activity Type', value: 'Discord Activity', inline: true },
                    { name: '🔊 Voice Channel', value: interaction.member.voice.channel.name, inline: true },
                    { name: '👥 Participants', value: `${interaction.member.voice.channel.members.size}`, inline: true }
                )
                .setFooter({ text: 'Synchronized playback • First person becomes host' })
                .setTimestamp();

            // Create button to launch activity
            const button = new ButtonBuilder()
                .setCustomId(`launch_activity_${interaction.user.id}`)
                .setLabel('🎬 Launch Watch Party')
                .setStyle(ButtonStyle.Primary);

            const row = new ActionRowBuilder().addComponents(button);

            await interaction.reply({
                embeds: [embed],
                components: [row]
            });

            // Store activity data for button handler
            if (!client.activityData) {
                client.activityData = new Map();
            }

            client.activityData.set(`launch_activity_${interaction.user.id}`, {
                url: activityUrl,
                streamUrl: streamUrl,
                title: title,
                channelId: interaction.member.voice.channel.id,
                guildId: interaction.guild.id
            });

            // Clean up after 5 minutes
            setTimeout(() => {
                client.activityData.delete(`launch_activity_${interaction.user.id}`);
            }, 5 * 60 * 1000);

        } catch (error) {
            console.error('Error in watch command:', error);
            await interaction.reply({
                content: `❌ An error occurred: ${error.message}`,
                ephemeral: true
            });
        }
    }
}).toJSON();
