const { ChatInputCommandInteraction, EmbedBuilder } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const ApplicationCommand = require("../../structure/ApplicationCommand");
const IMDbService = require("../../services/IMDbService");

module.exports = new ApplicationCommand({
    command: {
        name: 'movieinfo',
        description: 'Get detailed information about a movie or TV show',
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
            const title = interaction.options.getString('title');
            const imdbId = interaction.options.getString('imdb_id');

            // Validate input
            if (!title && !imdbId) {
                return await interaction.editReply({
                    content: '❌ Please provide either a title or an IMDb ID!',
                    ephemeral: true
                });
            }

            // Initialize IMDb service
            const imdbService = new IMDbService(process.env.OMDB_API_KEY);

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

            // Create detailed info embed
            const embed = new EmbedBuilder()
                .setColor('#FFD700')
                .setTitle(`🎬 ${movieData.title}`)
                .setURL(`https://www.imdb.com/title/${movieData.imdbId}/`)
                .setDescription(movieData.plot && movieData.plot !== 'N/A' 
                    ? `*${movieData.plot}*`
                    : '*No plot available*');

            // Add basic info fields
            const fields = [
                { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' }
            ];

            // Type-specific information
            if (movieData.type === 'series') {
                fields.push(
                    { name: '📺 Type', value: `\`\`\`TV Series\`\`\``, inline: true },
                    { name: '📅 Years', value: `\`\`\`${movieData.year || 'N/A'}\`\`\``, inline: true },
                    { name: '📺 Seasons', value: `\`\`\`${movieData.totalSeasons || 'N/A'}\`\`\``, inline: true }
                );
            } else {
                fields.push(
                    { name: '🎬 Type', value: `\`\`\`Movie\`\`\``, inline: true },
                    { name: '📅 Year', value: `\`\`\`${movieData.year || 'N/A'}\`\`\``, inline: true },
                    { name: '⏱️ Runtime', value: `\`\`\`${movieData.runtime || 'N/A'}\`\`\``, inline: true }
                );
            }

            // Ratings
            fields.push(
                { name: '\u200B', value: '\u200B' },
                { name: '⭐ IMDb Rating', value: `\`\`\`${movieData.imdbRating || 'N/A'}/10\`\`\``, inline: true },
                { name: '🗳️ Votes', value: `\`\`\`${movieData.imdbVotes || 'N/A'}\`\`\``, inline: true },
                { name: '📊 Metascore', value: `\`\`\`${movieData.metascore || 'N/A'}/100\`\`\``, inline: true }
            );

            // Additional info
            fields.push(
                { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' },
                { name: '🎭 Genre', value: `\`\`\`${movieData.genre || 'N/A'}\`\`\``, inline: false },
                { name: '🎬 Director', value: `\`\`\`${movieData.director || 'N/A'}\`\`\``, inline: false },
                { name: '✍️ Writer', value: `\`\`\`${movieData.writer || 'N/A'}\`\`\``, inline: false },
                { name: '🎭 Cast', value: `\`\`\`${movieData.actors || 'N/A'}\`\`\``, inline: false }
            );

            // Additional details if available
            if (movieData.awards && movieData.awards !== 'N/A') {
                fields.push({ name: '🏆 Awards', value: `\`\`\`${movieData.awards}\`\`\``, inline: false });
            }

            if (movieData.boxOffice && movieData.boxOffice !== 'N/A') {
                fields.push({ name: '💰 Box Office', value: `\`\`\`${movieData.boxOffice}\`\`\``, inline: true });
            }

            if (movieData.language && movieData.language !== 'N/A') {
                fields.push({ name: '🗣️ Language', value: `\`\`\`${movieData.language}\`\`\``, inline: true });
            }

            if (movieData.country && movieData.country !== 'N/A') {
                fields.push({ name: '🌍 Country', value: `\`\`\`${movieData.country}\`\`\``, inline: true });
            }

            fields.push(
                { name: '\u200B', value: '**━━━━━━━━━━━━━━━━━━━━**' },
                { name: '🎥 Want to watch?', value: `Use \`/watchparty title:${movieData.title}\` to create a watch party!`, inline: false }
            );

            embed.addFields(fields);

            if (movieData.poster && movieData.poster !== 'N/A') {
                embed.setImage(movieData.poster);
            }

            embed.setFooter({ 
                text: `IMDb ID: ${movieData.imdbId} • ${movieData.imdbVotes || '0'} votes`,
                iconURL: 'https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg'
            });

            embed.setTimestamp();

            await interaction.editReply({
                embeds: [embed]
            });

        } catch (error) {
            console.error('Error in movieinfo command:', error);
            await interaction.editReply({
                content: `❌ An error occurred: ${error.message}`,
                embeds: []
            });
        }
    }
}).toJSON();
