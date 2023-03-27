require('dotenv').config();
const { token, token2 } = process.env;
const { Client, Collection, GatewayIntentBits, VoiceChannel, EmbedBuilder, PermissionFlagsBits, ChannelType, PermissionsBitField} = require("discord.js");
const fs = require("fs");


const client = new Client({ 
    intents: [
            GatewayIntentBits.Guilds, 
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildModeration,
            GatewayIntentBits.GuildEmojisAndStickers,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.AutoModerationConfiguration,
            GatewayIntentBits.DirectMessageReactions,
            GatewayIntentBits.GuildVoiceStates,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions,
        ],      
        });

client.commands = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync(`./src/functions`);
for (const folder of functionFolders) {
    const functionFiles = fs
        .readdirSync(`./src/functions/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of functionFiles)
        require(`./functions/${folder}/${file}`)(client);
}


const welcomeChannelId = '1078359681782792192'; // ID do canal de boas-vindas
const welcomeRoleId = '1078355208821809204';    // ID do cargo a ser atribuído aos novos membros
const entryChannelId = '1078883320068329492';   // ID do canal de entrada
const exitChannelId = '1078883370257371206';    // ID do canal de saída
const topicChannelId = '1079417153217892413';   // ID do canal de texto cujo tópico será atualizado
const emojis = ['<a:n0:1079759904325251204>',
                '<a:n1:1079760033908273213>',
                '<a:n2:1079760075251535924>',
                '<a:n3:1079760513271091240>',
                '<a:n4:1079760546049560656>',
                '<a:n5:1079760695786225694>',
                '<a:n6:1079760775301824642>',
                '<a:n7:1079761577475047545>',
                '<a:n8:1079761640821637180>',
                '<a:n9:1079761805028630539>'
              ]
; // emojis de 0 a 9
const CHANNEL_ID = '1085622897202180158';  // ID do canal permanente para criar outros canais privados
const CATEGORY_ID = '1089179005565022228'; // ID da categoria onde vai ser criado os canais privados


client.on('guildMemberAdd', async (member) => {
    // Enviar a mensagem de boas-vindas no canal especificado
    const welcomeChannel = member.guild.channels.cache.get(welcomeChannelId);
    if (welcomeChannel) {
      welcomeChannel.send(`Bem-vindo(a) ao servidor, ${member}!`);
    }
  
    // Adicionar o cargo ao novo membro
    const welcomeRole = member.guild.roles.cache.get(welcomeRoleId);
    if (welcomeRole) {
      await member.roles.add(welcomeRole);
    }

    const entryChannel = member.guild.channels.cache.get(entryChannelId);
    if (entryChannel) {
      entryChannel.send(`**${member.user.tag}** acabou de entrar! Total de membros: **${member.guild.memberCount}**`);
    }

    const topicChannel = member.guild.channels.cache.get(topicChannelId);
    if (topicChannel) {
      const memberCount = member.guild.memberCount;
      const emojiCount = getEmojiCount(memberCount);
      const topic = `Temos um total de ${getEmojiString(emojiCount)} membros.`;
      topicChannel.setTopic(topic);
    }  
});

client.on('guildMemberRemove', async (member) => {

    const exitChannel = member.guild.channels.cache.get(exitChannelId);
    if (exitChannel) {
      exitChannel.send(`**${member.user.tag}** acabou de sair! Total de membros: **${member.guild.memberCount}**`);
    }

    const topicChannel = member.guild.channels.cache.get(topicChannelId);
    if (topicChannel) {
     const memberCount = member.guild.memberCount;
     const emojiCount = getEmojiCount(memberCount);
     const topic = `Temos um total de ${getEmojiString(emojiCount)} membros. `;
     topicChannel.setTopic(topic);
    }
});

function getEmojiCount(number) {
    return Math.min(Math.max(number, 0), 9999).toString().padStart(4, '0');
}
function getEmojiString(count) {
    return count.split('').map(c => emojis[parseInt(c)]).join('');
}

client.on('voiceStateUpdate', async (oldState, newState) => {
  // Verifica se o usuário entrou no canal de voz permanente
  if (newState.channel?.id === CHANNEL_ID) {
    const guild = newState.guild;
    const member = guild.members.cache.get(newState.member.user.id);
    const channelName = `🔒 ${member.displayName}'s channel`; 
    // Cria o canal de voz privado para o usuário
    const createdChannel = await guild.channels.create({
      name: channelName, 
      type: ChannelType.GuildVoice, 
      parent: CATEGORY_ID,
      permissionOverwrites: [
         // Permissões do usuário que criou o canal
        {
          id: guild.roles.everyone,
          deny: [PermissionsBitField.Flags.ManageChannels]
        },
        // Permissões padrão
        {
          id: member.id,
          allow: [PermissionsBitField.Flags.ManageChannels]
        }
      ]
    });
    // Move o usuário para o canal privado que foi criado
    await newState.setChannel(createdChannel);

    // Deleta o canal privado quando todos os usuários saírem
  } else if (oldState.channel?.id !== newState.channel?.id && oldState.channel?.parent?.id === CATEGORY_ID) {
    const channel = oldState.channel;
    if (channel.members.size === 0) {
      channel.delete();
    }
  }
});


client.handleEvents();
client.handleCommands();
client.login(token);
