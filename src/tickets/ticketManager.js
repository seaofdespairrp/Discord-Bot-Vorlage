const {
  ChannelType,
  PermissionsBitField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} = require("discord.js");
const { readJson, writeJson } = require("../store");
const { config } = require("../config");
const { logTicketEvent } = require("../logging/logEmbeds");

const TICKETS_FILE = "tickets.json";

const TICKET_TYPES = {
  support: { label: "Support", emoji: "🎫" },
  bewerben: { label: "Bewerben", emoji: "📋" },
  partner: { label: "Partner Anfrage", emoji: "🤝" },
};

function ticketActionRow(status) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ticket-claim")
      .setLabel("Übernehmen")
      .setEmoji("🔧")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(status === "in_bearbeitung"),
    new ButtonBuilder()
      .setCustomId("ticket-close")
      .setLabel("Schließen")
      .setEmoji("🔒")
      .setStyle(ButtonStyle.Danger)
  );
  return row;
}

async function getAllTickets() {
  return readJson(TICKETS_FILE, {});
}

async function getTicketByChannel(channelId) {
  const tickets = await getAllTickets();
  return tickets[channelId] || null;
}

async function findOpenTicketByUser(guildId, userId) {
  const tickets = await getAllTickets();
  return Object.entries(tickets).find(
    ([, t]) => t.guildId === guildId && t.userId === userId
  );
}

async function createTicket(interaction, typeKey) {
  const type = TICKET_TYPES[typeKey];
  if (!type) {
    throw new Error(`Unbekannter Ticket-Typ: ${typeKey}`);
  }

  const existing = await findOpenTicketByUser(interaction.guild.id, interaction.user.id);
  if (existing) {
    const [channelId] = existing;
    await interaction.reply({
      content: `Du hast bereits ein offenes Ticket: <#${channelId}>`,
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const permissionOverwrites = [
    { id: interaction.guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
    {
      id: interaction.user.id,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory,
      ],
    },
  ];
  if (config.staffRoleId) {
    permissionOverwrites.push({
      id: config.staffRoleId,
      allow: [
        PermissionsBitField.Flags.ViewChannel,
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ReadMessageHistory,
      ],
    });
  }

  const safeName = interaction.user.username.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 20) || "user";
  const channel = await interaction.guild.channels.create({
    name: `ticket-${typeKey}-${safeName}`,
    type: ChannelType.GuildText,
    parent: config.ticketCategoryId,
    permissionOverwrites,
  });

  const tickets = await getAllTickets();
  tickets[channel.id] = {
    guildId: interaction.guild.id,
    userId: interaction.user.id,
    type: typeKey,
    status: "offen",
    claimedBy: null,
    createdAt: Date.now(),
  };
  await writeJson(TICKETS_FILE, tickets);

  const container = new ContainerBuilder()
    .setAccentColor(0x5865f2)
    .addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `### ${type.emoji} ${type.label}-Ticket\n` +
          `Hallo <@${interaction.user.id}>, danke für deine Anfrage!\nEin Teammitglied kümmert sich in Kürze darum.`
      )
    )
    .addActionRowComponents(ticketActionRow("offen"));

  const messageComponents = [];
  if (config.staffRoleId) {
    messageComponents.push(new TextDisplayBuilder().setContent(`<@&${config.staffRoleId}>`));
  }
  messageComponents.push(container);

  await channel.send({
    components: messageComponents,
    flags: MessageFlags.IsComponentsV2,
  });

  await logTicketEvent(interaction.guild, {
    action: "erstellt",
    channel,
    user: interaction.user,
  });

  await interaction.editReply({ content: `Dein Ticket wurde erstellt: ${channel}` });
}

async function claimTicket(interaction) {
  const ticket = await getTicketByChannel(interaction.channel.id);
  if (!ticket) {
    await interaction.reply({ content: "Dieses Ticket wurde nicht gefunden.", ephemeral: true });
    return;
  }
  if (ticket.status === "in_bearbeitung") {
    await interaction.reply({ content: "Dieses Ticket ist bereits in Bearbeitung.", ephemeral: true });
    return;
  }

  const tickets = await getAllTickets();
  tickets[interaction.channel.id] = {
    ...ticket,
    status: "in_bearbeitung",
    claimedBy: interaction.user.id,
  };
  await writeJson(TICKETS_FILE, tickets);

  await interaction.update({ components: [ticketActionRow("in_bearbeitung")] });
  await interaction.channel.send({
    content: `🔧 Ticket wird jetzt von <@${interaction.user.id}> bearbeitet.`,
  });

  await logTicketEvent(interaction.guild, {
    action: "in Bearbeitung",
    channel: interaction.channel,
    user: interaction.user,
  });
}

async function closeTicket(interaction) {
  const ticket = await getTicketByChannel(interaction.channel.id);
  if (!ticket) {
    await interaction.reply({ content: "Dieses Ticket wurde nicht gefunden.", ephemeral: true });
    return;
  }

  await interaction.reply({ content: "🔒 Ticket wird in 5 Sekunden geschlossen..." });

  await logTicketEvent(interaction.guild, {
    action: "geschlossen",
    channel: interaction.channel,
    user: interaction.user,
    ticketOwnerId: ticket.userId,
  });

  const tickets = await getAllTickets();
  delete tickets[interaction.channel.id];
  await writeJson(TICKETS_FILE, tickets);

  setTimeout(() => {
    interaction.channel.delete().catch(() => {});
  }, 5000);
}

module.exports = {
  TICKET_TYPES,
  createTicket,
  claimTicket,
  closeTicket,
};
