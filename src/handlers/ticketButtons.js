const { claimTicket, closeTicket } = require("../tickets/ticketManager");

async function handleTicketButtons(interaction) {
  if (interaction.customId === "ticket-claim") {
    await claimTicket(interaction);
    return true;
  }
  if (interaction.customId === "ticket-close") {
    await closeTicket(interaction);
    return true;
  }
  return false;
}

module.exports = { handleTicketButtons };
