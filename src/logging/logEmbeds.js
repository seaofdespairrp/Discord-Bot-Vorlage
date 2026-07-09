const {
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  ThumbnailBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");
const { config } = require("../config");

async function getLogChannel(guild) {
  if (!config.logChannelId) return null;
  const channel = await guild.channels.fetch(config.logChannelId).catch(() => null);
  return channel;
}

function timestampLine() {
  return `-# <t:${Math.floor(Date.now() / 1000)}:f>`;
}

function withTimestamp(container) {
  return container
    .addSeparatorComponents(new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small))
    .addTextDisplayComponents(new TextDisplayBuilder().setContent(timestampLine()));
}

async function sendLog(guild, container) {
  const channel = await getLogChannel(guild);
  if (!channel) return;
  await channel.send({ components: [container], flags: MessageFlags.IsComponentsV2 }).catch(() => {});
}

async function logMessageDelete(message) {
  if (!message.guild || message.author?.bot) return;
  const container = withTimestamp(
    new ContainerBuilder()
      .setAccentColor(0xed4245)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `### 🗑️ Nachricht gelöscht\n` +
            `**Autor:** <@${message.author?.id ?? "unbekannt"}>\n` +
            `**Kanal:** ${message.channel}\n\n` +
            `**Inhalt:**\n${message.content?.slice(0, 1000) || "*(kein Textinhalt im Cache)*"}`
        )
      )
  );
  await sendLog(message.guild, container);
}

async function logMessageUpdate(oldMessage, newMessage) {
  if (!newMessage.guild || newMessage.author?.bot) return;
  if (oldMessage.content === newMessage.content) return;
  const container = withTimestamp(
    new ContainerBuilder()
      .setAccentColor(0xfee75c)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `### ✏️ Nachricht bearbeitet\n` +
            `**Autor:** <@${newMessage.author.id}>\n` +
            `**Kanal:** ${newMessage.channel}\n\n` +
            `**Vorher:**\n${oldMessage.content?.slice(0, 512) || "*(kein Inhalt im Cache)*"}\n\n` +
            `**Nachher:**\n${newMessage.content?.slice(0, 512) || "*(kein Inhalt)*"}`
        )
      )
  );
  await sendLog(newMessage.guild, container);
}

async function logMemberAdd(member) {
  const container = withTimestamp(
    new ContainerBuilder()
      .setAccentColor(0x57f287)
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`### 📥 Mitglied beigetreten\n${member} (${member.user.tag})`)
          )
          .setThumbnailAccessory(new ThumbnailBuilder().setURL(member.user.displayAvatarURL()))
      )
  );
  await sendLog(member.guild, container);
}

async function logMemberRemove(member) {
  const content = `### 📤 Mitglied verlassen\n${member.user?.tag ?? member.id}`;
  const avatarURL = member.user?.displayAvatarURL();
  const container = new ContainerBuilder().setAccentColor(0xed4245);
  if (avatarURL) {
    container.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
        .setThumbnailAccessory(new ThumbnailBuilder().setURL(avatarURL))
    );
  } else {
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(content));
  }
  await sendLog(member.guild, withTimestamp(container));
}

async function logVoiceStateChange({ guild, member, oldChannel, newChannel }) {
  let title;
  let description;
  if (!oldChannel && newChannel) {
    title = "🔊 Voice-Kanal betreten";
    description = `${member} ist ${newChannel} beigetreten.`;
  } else if (oldChannel && !newChannel) {
    title = "🔇 Voice-Kanal verlassen";
    description = `${member} hat ${oldChannel} verlassen.`;
  } else if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
    title = "🔁 Voice-Kanal gewechselt";
    description = `${member} ist von ${oldChannel} zu ${newChannel} gewechselt.`;
  } else {
    return;
  }
  const container = withTimestamp(
    new ContainerBuilder()
      .setAccentColor(0x5865f2)
      .addTextDisplayComponents(new TextDisplayBuilder().setContent(`### ${title}\n${description}`))
  );
  await sendLog(guild, container);
}

async function logTicketEvent(guild, { action, channel, user, ticketOwnerId }) {
  let content = `### 🎫 Ticket ${action}\n**Kanal:** ${channel.name}\n**Von:** <@${user.id}>`;
  if (ticketOwnerId) {
    content += `\n**Ticket-Ersteller:** <@${ticketOwnerId}>`;
  }
  const container = withTimestamp(
    new ContainerBuilder().setAccentColor(0x5865f2).addTextDisplayComponents(new TextDisplayBuilder().setContent(content))
  );
  await sendLog(guild, container);
}

module.exports = {
  logMessageDelete,
  logMessageUpdate,
  logMemberAdd,
  logMemberRemove,
  logVoiceStateChange,
  logTicketEvent,
};
