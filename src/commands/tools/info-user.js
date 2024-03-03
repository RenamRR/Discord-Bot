// src/commands/info-user.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info-user')
    .setDescription('Mostra informações sobre a data de criação da conta do usuário.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('Usuário para obter informações (opcional)'),
    ),
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const accountCreationDate = targetUser.createdAt;
    const currentDate = new Date();

    const years = currentDate.getFullYear() - accountCreationDate.getFullYear();
    const months = currentDate.getMonth() - accountCreationDate.getMonth();
    const days = currentDate.getDate() - accountCreationDate.getDate();

    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Informações do Usuário')
      .setDescription(`Conta criada por ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: 'Conta criada', value: accountCreationDate.toLocaleDateString(), inline: true },
        { name: 'Tempo de Conta', value: `${years} anos, ${months} meses, ${days} dias`, inline: true },
      );

    await interaction.reply({ embeds: [exampleEmbed] });
  },
};
