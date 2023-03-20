const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('casar')
    .setDescription('Casar com outro usuário.')
    .addUserOption(option => 
      option.setName('usuario')
        .setDescription('Usuário que deseja se casar.')
        .setRequired(true)
    ),
  async execute(interaction) {
    const usuario = interaction.options.getUser('usuario');
    const autor = interaction.user;
    
    if (usuario.id === autor.id) {
      return interaction.reply({ content: 'Você não pode se casar consigo mesmo!', ephemeral: true });
    }

    const confirmEmbed = {
      color: 0x00ff00,
      title: `Pedido de casamento`,
      description: `${autor} está pedindo a mão de ${usuario} em casamento!`,
      fields: [
        { name: 'Reaja com 👍 para aceitar ou com 👎 para negar.', value: '\u200B' }
      ]
    };

    const confirmMsg = await interaction.channel.send({ embeds: [confirmEmbed] });
    confirmMsg.react('👍');
    confirmMsg.react('👎');

    const filter = (reaction, user) => ['👍', '👎'].includes(reaction.emoji.name) && user.id === usuario.id;

    confirmMsg.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] })
      .then(collected => {
        const reaction = collected.first();

        if (reaction.emoji.name === '👍') {
          const casamentoEmbed = {
            color: 0xff00ff,
            title: `🎉 Parabéns 🎉`,
            description: `${autor} e ${usuario} estão oficialmente casados! 💍`
          };
          interaction.channel.send({ embeds: [casamentoEmbed] });
        } else {
          interaction.channel.send(`${usuario} recusou o pedido de casamento.`);
        }
      })
      .catch(() => {
        interaction.channel.send('O tempo para aceitar o pedido de casamento acabou.');
      });
  },
};
