const { logMemberAdd } = require("../logging/logEmbeds");

module.exports = {
  name: "guildMemberAdd",
  once: false,
  async execute(member) {
    await logMemberAdd(member);
  },
};
