const { SlashCommandBuilder } = require('@discordjs/builders');
const { default: axios } = require('axios');
const { EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
    .setName("addmoji")
    .setDescription("Permite que o administrador adicione emoji ao servidor.")
    .addStringOption((option) => option.setName('emoji').setDescription('O emoji que você deseja adicionar pode ser url/emoji').setRequired(true))
    .addStringOption((option) => option.setName('nome').setDescription('Nome do emoji').setRequired(true)),

    async execute(interaction){

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.reply({content: "Você não pode usar este comando !", ephemeral: true});

        let emoji = interaction.options.getString(`emoji`)?.trim();
        const name = interaction.options.getString(`nome`);

        if (emoji.startsWith("<") && emoji.endsWith(">")){
            const id = emoji.match(/\d{15,}/g)[0];

            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`)
            .then(image => {
                if (image) return "gif"
                else return "png"
            }).catch(err => {
                return "png"
            })

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`
        }

        if (!emoji.startsWith("http")) {
            return await interaction.reply({content: "Você não pode usar emojis padrão!"})
        }

        if (!emoji.startsWith("https")) {
            return await interaction.reply({content: "Você não pode usar emojis padrão!"})
        }

        interaction.guild.emojis.create({ attachment: `${emoji}`, name: `${name}`})
        .then(emoji => {
            const embed = new EmbedBuilder()
            .setColor("Blue")
            .setDescription(`Adicionado o ${emoji}, com o nome "**${name}**"`)

            return interaction.reply({embeds: [embed]});
        }).catch(err => {
            interaction.reply({content: "Você não pode adicionar mais emojis pois o server atingiu o limite de emojis", ephemeral: true})
        })
    }
}