const { logMessageDelete } = require("../logging/logEmbeds");

module.exports = {
  name: "messageDelete",
  once: false,
  async execute(message) {
    await logMessageDelete(message);
  },
};
