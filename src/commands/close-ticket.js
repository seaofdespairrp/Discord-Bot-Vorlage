const { SlashCommandBuilder } = require("discord.js");
const { closeTicket } = require("../tickets/ticketManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("close")
    .setDescription("Schließt das aktuelle Ticket."),

  async execute(interaction) {
    await closeTicket(interaction);
  },
};
