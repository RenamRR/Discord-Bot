const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('limparchat')
    .setDescription('Limpa completamente o chat (somente administradores).')
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Quantidade de mensagens a serem excluídas (máximo: 100).')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      await interaction.reply({
        content: 'Você não tem permissão para executar este comando.',
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.channel;
    const quantidade = interaction.options.getInteger('quantidade');

    if (quantidade <= 0 || quantidade > 100) {
      await interaction.reply({
        content: 'Por favor, escolha um valor entre 1 e 100 para a quantidade de mensagens a serem excluídas.',
        ephemeral: true,
      });
      return;
    }

    try {
      let messages = await channel.messages.fetch({ limit: quantidade });

      // Excluir as mensagens em lotes até que todas sejam excluídas
      while (messages.size > 0) {
        const filteredMessages = messages.filter((message) => !message.pinned);
        if (filteredMessages.size === 0) {
          break; // Interromper se não houver mais mensagens
        }
        await channel.bulkDelete(filteredMessages, true);
        messages = await channel.messages.fetch({ limit: quantidade });
      }

      await interaction.reply({
        content: `Foram excluídas ${quantidade} mensagens do chat com sucesso!`,
        ephemeral: true,
      });
    } catch (error) {
      if (error.code === 10008) {
        console.error('A mensagem não existe mais:', error);
        // Lidar com a situação em que a mensagem não existe mais
      } else {
        console.error('Erro ao limpar o chat:', error);
        await interaction.reply({
          content: 'Ocorreu um erro ao limpar o chat.',
          ephemeral: true,
        });
      }
    }
  },
};
