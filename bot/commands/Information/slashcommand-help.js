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
            .setTitle('🍿 Hey There, Movie Lover!')
            .setDescription('*I\'m your friendly movie buddy! Let me help you find something amazing to watch~*\n\n✨ **Pro tip:** Start with `/recommend` if you\'re not sure what to watch!')
            .setThumbnail(interaction.client.user.displayAvatarURL({ size: 256 }))
            .addFields(
                { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' },
                { 
                    name: '🎯 Find Your Perfect Movie', 
                    value: '**`/recommend`** ✨ *My favorite!*\n' +
                           '→ Answer 3 quick questions\n' +
                           '→ I\'ll pick something *perfect* for you!\n' +
                           '→ Don\'t like it? Hit "Try Again"!\n\n' +
                           '**`/browse`** 🎬 *For explorers*\n' +
                           '→ Check out movies by category\n' +
                           '→ Navigate with fancy buttons!\n' +
                           '→ See what\'s hot right now~',
                    inline: false
                },
                { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' },
                { 
                    name: '🎥 Watch & Learn', 
                    value: '**`/watchparty`** 🍿 *Let\'s watch together!*\n' +
                           '→ Search any movie or show\n' +
                           '→ Pick your quality (4K? Yes please!)\n' +
                           '→ Get instant streaming links\n\n' +
                           '**`/movieinfo`** 📚 *For the curious ones*\n' +
                           '→ Deep dive into any movie\n' +
                           '→ IMDb ratings, cast, awards...\n' +
                           '→ Everything you need to know!',
                    inline: false
                },
                { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' },
                { 
                    name: '💫 Cool Tricks You Should Know', 
                    value: '• **Type to search** - Autocomplete is magic! ✨\n' +
                           '• **Direct streaming** - Works in VLC, MPV, browsers!\n' +
                           '• **IMDb IDs** - Know the ID? Use it directly!\n' +
                           '• **Fresh links** - Old link expired? Just make a new one!\n' +
                           '• **TV shows** - Yep! Pick season & episode~',
                    inline: false
                },
                { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' },
                { 
                    name: '🎪 What Makes Me Special?', 
                    value: '🎬 High-quality streaming (Real-Debrid powered!)\n' +
                           '🔍 Smart movie recommendations\n' +
                           '📺 Movies AND TV shows\n' +
                           '🎥 Up to 4K quality!\n' +
                           '🍿 Watch with friends\n' +
                           '⭐ Full IMDb integration',
                    inline: false
                }
            )
            .setFooter({ 
                text: 'Made with 💖 for movie lovers • Powered by Real-Debrid',
                iconURL: 'https://fcdn.real-debrid.com/0830/images/favicon.png'
            })
            .setTimestamp();

        await interaction.editReply({
            embeds: [embed]
        });
    }
}).toJSON();
