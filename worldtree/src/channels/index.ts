import type { Context } from '@openclaw/types';
import type { WorldTreeConfig } from '../config';
import { FeishuChannel } from './feishu';

export async function registerChannels(context: Context, config: WorldTreeConfig) {
  const channelInstances = [];
  
  if (config.channels.includes('feishu')) {
    const feishuChannel = new FeishuChannel(context, config);
    await feishuChannel.initialize();
    channelInstances.push(feishuChannel);
  }
  
  // Register other channels here
  
  context.logger.info(`Registered ${channelInstances.length} WorldTree channels`);
}

export interface ChannelAdapter {
  initialize(): Promise<void>;
  sendMessage(payload: any): Promise<any>;
  receiveMessage(payload: any): Promise<any>;
  destroy(): Promise<void>;
}
