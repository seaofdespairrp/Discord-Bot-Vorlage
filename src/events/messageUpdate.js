const { logMessageUpdate } = require("../logging/logEmbeds");

module.exports = {
  name: "messageUpdate",
  once: false,
  async execute(oldMessage, newMessage) {
    await logMessageUpdate(oldMessage, newMessage);
  },
};
