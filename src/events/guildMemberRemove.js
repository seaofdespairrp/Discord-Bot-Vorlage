const { logMemberRemove } = require("../logging/logEmbeds");

module.exports = {
  name: "guildMemberRemove",
  once: false,
  async execute(member) {
    await logMemberRemove(member);
  },
};
