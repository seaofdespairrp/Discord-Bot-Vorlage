const { ChannelType, PermissionsBitField } = require("discord.js");
const { readJson, writeJson } = require("../store");
const { config } = require("../config");

const TEMP_CHANNELS_FILE = "tempVoiceChannels.json";

async function getTrackedChannels() {
  return readJson(TEMP_CHANNELS_FILE, {});
}

async function trackChannel(channelId, ownerId) {
  const tracked = await getTrackedChannels();
  tracked[channelId] = { ownerId, createdAt: Date.now() };
  await writeJson(TEMP_CHANNELS_FILE, tracked);
}

async function untrackChannel(channelId) {
  const tracked = await getTrackedChannels();
  delete tracked[channelId];
  await writeJson(TEMP_CHANNELS_FILE, tracked);
}

async function handleVoiceStateUpdate(oldState, newState) {
  const guild = newState.guild || oldState.guild;
  const joinChannelId = config.tempVoiceChannelId;
  if (!joinChannelId) return;

  if (newState.channelId === joinChannelId) {
    const member = newState.member;
    const parent = newState.channel.parentId;
    const newChannel = await guild.channels.create({
      name: `Support von ${member.displayName}`,
      type: ChannelType.GuildVoice,
      parent: parent || undefined,
      permissionOverwrites: [
        {
          id: member.id,
          allow: [
            PermissionsBitField.Flags.ManageChannels,
            PermissionsBitField.Flags.MoveMembers,
          ],
        },
      ],
    });
    await trackChannel(newChannel.id, member.id);
    await member.voice.setChannel(newChannel).catch(() => {});
  }

  if (oldState.channelId && oldState.channelId !== newState.channelId) {
    const tracked = await getTrackedChannels();
    if (tracked[oldState.channelId]) {
      const channel = oldState.channel;
      if (channel && channel.members.size === 0) {
        await untrackChannel(oldState.channelId);
        await channel.delete().catch(() => {});
      }
    }
  }
}

module.exports = { handleVoiceStateUpdate };
