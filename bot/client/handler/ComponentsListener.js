const DiscordBot = require("../DiscordBot");
const config = require("../../config");
const { error } = require("../../utils/Console");

class ComponentsListener {
    /**
     * 
     * @param {DiscordBot} client 
     */
    constructor(client) {
        client.on('interactionCreate', async (interaction) => {
            const checkUserPermissions = async (component) => {
                if (component.options?.public === false && interaction.user.id !== interaction.message.interaction.user.id) {
                    await interaction.reply({
                        content: config.messages.COMPONENT_NOT_PUBLIC,
                        ephemeral: true
                    });

                    return false;
                }

                return true;
            }

            try {
                if (interaction.isButton()) {
                    let component = client.collection.components.buttons.get(interaction.customId);

                    // If no exact match, try prefix matching for components ending with '-'
                    if (!component) {
                        for (const [key, value] of client.collection.components.buttons.entries()) {
                            if (key.endsWith('-') && interaction.customId.startsWith(key)) {
                                component = value;
                                break;
                            }
                        }
                    }

                    if (!component) return;

                    if (!(await checkUserPermissions(component))) return;

                    try {
                        component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }

                    return;
                }

                if (interaction.isAnySelectMenu()) {
                    let component = client.collection.components.selects.get(interaction.customId);

                    // If no exact match, try prefix matching for components ending with '-'
                    if (!component) {
                        for (const [key, value] of client.collection.components.selects.entries()) {
                            if (key.endsWith('-') && interaction.customId.startsWith(key)) {
                                component = value;
                                break;
                            }
                        }
                    }

                    if (!component) return;

                    if (!(await checkUserPermissions(component))) return;

                    try {
                        component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }

                    return;
                }

                if (interaction.isModalSubmit()) {
                    const component = client.collection.components.modals.get(interaction.customId);

                    if (!component) return;

                    try {
                        component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }

                    return;
                }

                if (interaction.isAutocomplete()) {
                    const component = client.collection.components.autocomplete.get(interaction.commandName);

                    if (!component) return;

                    try {
                        component.run(client, interaction);
                    } catch (err) {
                        error(err);
                    }

                    return;
                }
            } catch (err) {
                error(err);
            }
        });
    }
}

module.exports = ComponentsListener;
