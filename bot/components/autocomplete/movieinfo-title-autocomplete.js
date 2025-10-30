const { AutocompleteInteraction } = require("discord.js");
const DiscordBot = require("../../client/DiscordBot");
const AutocompleteComponent = require("../../structure/AutocompleteComponent");
const IMDbService = require("../../services/IMDbService");

module.exports = new AutocompleteComponent({
    commandName: 'movieinfo',
    /**
     * 
     * @param {DiscordBot} client 
     * @param {AutocompleteInteraction} interaction 
     */
    run: async (client, interaction) => {
        try {
            const focusedOption = interaction.options.getFocused(true);
            
            // Only handle autocomplete for the 'title' option
            if (focusedOption.name !== 'title') {
                return await interaction.respond([]);
            }

            let query = focusedOption.value;

            // Require at least 2 characters before searching
            if (!query || query.length < 2) {
                return await interaction.respond([
                    { name: 'Type at least 2 characters to search...', value: 'placeholder' }
                ]);
            }

            // Initialize IMDb service
            const imdbService = new IMDbService(process.env.OMDB_API_KEY);

            // Try to get autocomplete options
            let options = await imdbService.getAutocompleteOptions(query);

            // If no results and query has no spaces, try adding spaces between words
            if (options.length === 0 && !/\s/.test(query)) {
                // Add spaces before capital letters
                const spacedQuery = query.replace(/([a-z])([A-Z])/g, '$1 $2');
                if (spacedQuery !== query) {
                    options = await imdbService.getAutocompleteOptions(spacedQuery);
                }
                
                // If still no results, try common variations
                if (options.length === 0 && query.length > 3) {
                    const variations = [
                        query.replace(/(.{3,4})(.+)/, '$1 $2'),
                        query.replace(/(.+)(.{3,4})/, '$1 $2')
                    ];
                    
                    for (const variation of variations) {
                        if (variation !== query) {
                            options = await imdbService.getAutocompleteOptions(variation);
                            if (options.length > 0) break;
                        }
                    }
                }
            }

            if (options.length === 0) {
                return await interaction.respond([
                    { name: `No results found for "${query}". Try adding spaces or using IMDb ID`, value: 'no_results' }
                ]);
            }

            // Return the autocomplete options
            await interaction.respond(options);

        } catch (error) {
            console.error('Error in autocomplete:', error);
            await interaction.respond([]);
        }
    }
}).toJSON();
