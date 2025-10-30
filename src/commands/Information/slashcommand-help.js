const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");

module.exports = new ApplicationCommand({
    command: {
        name: 'help',
        description: 'View all available commands and features',
        type: 1,
        options: []
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

        const embed = new EmbedBuilder()
            .setColor('#FFD700')
            .setTitle('🎬 Movie & TV Streaming Bot')
            .setDescription('*Stream movies and TV shows with friends using Real-Debrid*')
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' },
                { 
                    name: '🎥 Main Commands', 
                    value: '**`/recommend`** - Get personalized suggestions\n' +
                           '• Answer 3 questions • Get perfect match\n\n' +
                           '**`/browse`** - Browse by category\n' +
                           '• Popular, Action, Comedy, Sci-Fi, Horror, Drama\n\n' +
                           '**`/watchparty`** - Create watch parties\n' +
                           '• Search or use IMDb ID • Select quality\n\n' +
                           '**`/movieinfo`** - Detailed IMDb info\n\n' +
                           '**`/help`** - Show this menu • **`/ping`** - Check latency',
                    inline: false
                },
                { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' },
                { 
                    name: '✨ Features', 
                    value: '🎬 Real-Debrid streaming • 🔍 Smart search\n' +
                           '📺 TV shows & movies • 🎥 4K/1080p/720p\n' +
                           '🍿 Watch parties • ⭐ IMDb integration',
                    inline: false
                },
                { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' },
                { 
                    name: '💡 Quick Tips', 
                    value: '• Type to see autocomplete suggestions\n' +
                           '• Direct links work in VLC/MPV\n' +
                           '• Search by IMDb ID if needed\n' +
                           '• Links expire - create new ones if needed',
                    inline: false
                }
            )
            .setFooter({ 
                text: 'Powered by Real-Debrid',
                iconURL: 'https://fcdn.real-debrid.com/0830/images/favicon.png'
            })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });
    }
}).toJSON();
