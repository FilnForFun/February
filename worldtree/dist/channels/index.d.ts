import type { Context } from '@openclaw/types';
import type { WorldTreeConfig } from '../config';
export declare function registerChannels(context: Context, config: WorldTreeConfig): Promise<void>;
export interface ChannelAdapter {
    initialize(): Promise<void>;
    sendMessage(payload: any): Promise<any>;
    receiveMessage(payload: any): Promise<any>;
    destroy(): Promise<void>;
}
