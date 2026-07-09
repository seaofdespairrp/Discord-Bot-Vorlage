const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageFlags,
} = require("discord.js");
const { TICKET_TYPES } = require("../tickets/ticketManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup-tickets")
    .setDescription("Postet das Ticket-Auswahlmenü in diesem Kanal.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const menu = new StringSelectMenuBuilder()
      .setCustomId("ticket-create-select")
      .setPlaceholder("Wähle eine Ticket-Kategorie...")
      .addOptions(
        Object.entries(TICKET_TYPES).map(([key, value]) => ({
          label: value.label,
          value: key,
          emoji: value.emoji,
        }))
      );

    const container = new ContainerBuilder()
      .setAccentColor(0x5865f2)
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          "###Support & Anfragen\n" +
            "Wähle unten eine Kategorie aus, um ein Ticket zu erstellen:\n\n" +
            "***Bewerben** – Bewerbung fürs Team\n" +
            "**Partner Anfrage** – Partnerschaftsanfragen"
        )
      )
      .addActionRowComponents(new ActionRowBuilder().addComponents(menu));

    await interaction.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    await interaction.reply({ content: "Ticket-Panel wurde gepostet.", ephemeral: true });
  },
};
