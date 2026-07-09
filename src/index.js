const fs = require("fs");
const path = require("path");
const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const { config } = require("./config");
const { deployCommands } = require("./deploy-commands");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.Channel],
});

client.commands = new Collection();

const commandsDir = path.join(__dirname, "commands");
for (const file of fs.readdirSync(commandsDir).filter((f) => f.endsWith(".js"))) {
  const command = require(path.join(commandsDir, file));
  client.commands.set(command.data.name, command);
}

const eventsDir = path.join(__dirname, "events");
for (const file of fs.readdirSync(eventsDir).filter((f) => f.endsWith(".js"))) {
  const event = require(path.join(eventsDir, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

deployCommands().catch((err) => {
  console.error("Fehler beim Registrieren der Slash Commands beim Start:", err);
});

client.login(config.token);
