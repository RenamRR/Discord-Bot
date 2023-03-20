const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v10");
const fs = require("fs");

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync('./src/commands');
        for (const folder of commandFolders) {
            const commandFiles = fs
                .readdirSync(`./src/commands/${folder}`)
                .filter((file) => file.endsWith('.js'));

            const { commands, commandArray } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/${folder}/${file}`);
                commands.set(command.data.name, command);
                commandArray.push(command.data.toJSON());
            }
        }

        const clientId = "787656023447175168";
        //const guildId = "585927804441591809" || "1041120600359444611";
        const rest = new REST({ version: "10" }).setToken(process.env.token);
        try {
            console.log("\x1b[31m", "Carregando o (/) commands !", '\x1b[0m')

            await rest.put(Routes.applicationCommands(clientId), {
                body: client.commandArray,
            });

            console.log("\x1b[33m", "Carregamento do (/) commands completo !", '\x1b[0m')
        } catch (error) {
            console.error(error);
        }

    };
};