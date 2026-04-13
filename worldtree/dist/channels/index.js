"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChannels = registerChannels;
const feishu_1 = require("./feishu");
async function registerChannels(context, config) {
    const channelInstances = [];
    if (config.channels.includes('feishu')) {
        const feishuChannel = new feishu_1.FeishuChannel(context, config);
        await feishuChannel.initialize();
        channelInstances.push(feishuChannel);
    }
    // Register other channels here
    context.logger.info(`Registered ${channelInstances.length} WorldTree channels`);
}
