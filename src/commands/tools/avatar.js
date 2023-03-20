const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, User } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Exibe a foto de perfil do usuário mencionado ou do próprio usuário')
        .addStringOption(option => 
            option.setName('user')
            .setDescription('O ID ou a menção do usuário')
            .setRequired(false)
        ),

    async execute(interaction) {
        const userId = interaction.options.getString('user');
        let user;

        if (userId) {
            const mentionRegex = /^<@!?(\d+)>$/;
            const match = mentionRegex.exec(userId);
            if (match) {
                user = await interaction.guild.members.fetch(match[1]).catch(() => {});
            }
            else {
                user = await interaction.guild.members.fetch(userId).catch(() => {});
            }
        }

        if (!user) {
            user = interaction.member;
        }

        const avatarEmbed = new EmbedBuilder()
            .setTitle(`Avatar de ${user.user.tag}`)
            .setColor('#0099ff')
            .setImage(user.user.displayAvatarURL({ dynamic: true, size: 2048 }));

        interaction.reply({ embeds: [avatarEmbed] });
    },
};
