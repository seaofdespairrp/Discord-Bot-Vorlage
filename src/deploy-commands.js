const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");
const { config } = require("./config");

const commandsDir = path.join(__dirname, "commands");
const commands = fs
  .readdirSync(commandsDir)
  .filter((f) => f.endsWith(".js"))
  .map((file) => require(path.join(commandsDir, file)).data.toJSON());

async function deployCommands() {
  const rest = new REST().setToken(config.token);

  console.log(`Registriere ${commands.length} Slash Commands...`);
  await rest.put(Routes.applicationGuildCommands(config.clientId, config.guildId), {
    body: commands,
  });
  console.log("Slash Commands erfolgreich registriert.");
}

if (require.main === module) {
  deployCommands().catch((err) => {
    console.error("Fehler beim Registrieren der Commands:", err);
    process.exitCode = 1;
  });
}

module.exports = { deployCommands };
