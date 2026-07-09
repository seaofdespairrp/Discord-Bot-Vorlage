const { handleVoiceStateUpdate } = require("../tempvoice/tempVoiceManager");
const { logVoiceStateChange } = require("../logging/logEmbeds");
const { config } = require("../config");

module.exports = {
  name: "voiceStateUpdate",
  once: false,
  async execute(oldState, newState) {
    const guild = newState.guild || oldState.guild;

    const isJoinToCreateTrigger = newState.channelId === config.tempVoiceChannelId;
    if (!isJoinToCreateTrigger) {
      await logVoiceStateChange({
        guild,
        member: newState.member || oldState.member,
        oldChannel: oldState.channel,
        newChannel: newState.channel,
      });
    }

    await handleVoiceStateUpdate(oldState, newState);
  },
};
