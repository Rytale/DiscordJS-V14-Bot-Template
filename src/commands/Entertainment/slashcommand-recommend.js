const { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const TMDBService = require("../../services/TMDBService");
const { GENRE_IDS } = require("../../services/TMDBService");

module.exports = new ApplicationCommand({
    command: {
        name: 'recommend',
        description: 'Get a personalized movie recommendation',
        type: 1,
        options: []
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
                    content: '❌ TMDB API key not configured. Please add your TMDB API key to the .env file.'
                });
            }

            // Initialize recommendation session
            if (!client.recommendData) {
                client.recommendData = new Map();
            }

            client.recommendData.set(interaction.user.id, {
                step: 1,
                preferences: {}
            });

            // Step 1: Ask for genre preference
            const genreEmbed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle('🎬 Movie Recommendation - Step 1/3')
                .setDescription('**What genre are you in the mood for?**\n\nSelect a genre below to help me find the perfect movie for you!')
                .setFooter({ text: 'Step 1 of 3 • Genre Selection' });

            const genreMenu = new StringSelectMenuBuilder()
                .setCustomId('recommend-genre')
                .setPlaceholder('Choose your preferred genre')
                .addOptions([
                    { label: '💥 Action', value: 'action', description: 'High-octane thrills and excitement' },
                    { label: '😂 Comedy', value: 'comedy', description: 'Laugh-out-loud entertainment' },
                    { label: '🎭 Drama', value: 'drama', description: 'Emotional and thought-provoking' },
                    { label: '🚀 Sci-Fi', value: 'scifi', description: 'Futuristic and imaginative' },
                    { label: '👻 Horror', value: 'horror', description: 'Scary and suspenseful' },
                    { label: '❤️ Romance', value: 'romance', description: 'Love stories and relationships' }
                ]);

            const row = new ActionRowBuilder().addComponents(genreMenu);

            await interaction.editReply({
                embeds: [genreEmbed],
                components: [row]
            });

        } catch (error) {
            console.error('Error in recommend command:', error);
            await interaction.editReply({
                content: `❌ An error occurred: ${error.message}`
            });
        }
    }
}).toJSON();
