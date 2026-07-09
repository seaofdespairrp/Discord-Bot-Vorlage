const { handleTicketSelectMenu } = require("../handlers/ticketSelectMenu");
const { handleTicketButtons } = require("../handlers/ticketButtons");

async function safeReplyError(interaction) {
  const payload = { content: "Da ist etwas schiefgelaufen. Bitte später erneut versuchen.", ephemeral: true };
  try {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload);
    } else {
      await interaction.reply(payload);
    }
  } catch {}
}

module.exports = {
  name: "interactionCreate",
  once: false,
  async execute(interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;
        await command.execute(interaction);
        return;
      }

      if (interaction.isStringSelectMenu()) {
        if (await handleTicketSelectMenu(interaction)) return;
      }

      if (interaction.isButton()) {
        if (await handleTicketButtons(interaction)) return;
      }
    } catch (err) {
      console.error("Fehler bei Interaktion:", err);
      await safeReplyError(interaction);
    }
  },
};
