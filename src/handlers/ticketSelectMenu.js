const { createTicket } = require("../tickets/ticketManager");

async function handleTicketSelectMenu(interaction) {
  if (interaction.customId !== "ticket-create-select") return false;
  const [typeKey] = interaction.values;
  await createTicket(interaction, typeKey);
  return true;
}

module.exports = { handleTicketSelectMenu };
