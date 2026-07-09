require("dotenv/config");

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Fehlende Umgebungsvariable: ${name}. Siehe .env.example.`);
  }
  return value;
}

function optional(name) {
  return process.env[name] || null;
}

const config = {
  token: required("TOKEN"),
  clientId: required("CLIENT_ID"),
  guildId: required("GUILD_ID"),
  ticketCategoryId: required("TICKET_CATEGORY_ID"),
  staffRoleId: optional("STAFF_ROLE_ID"),
  logChannelId: optional("LOG_CHANNEL_ID"),
  tempVoiceChannelId: optional("TEMPVOICE_CHANNEL_ID"),
};

module.exports = { config };
