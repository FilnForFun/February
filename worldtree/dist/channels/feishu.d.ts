import type { Context } from '@openclaw/types';
import type { WorldTreeConfig } from '../config';
import type { ChannelAdapter } from './index';
export declare class FeishuChannel implements ChannelAdapter {
    private context;
    private config;
    constructor(context: Context, config: WorldTreeConfig);
    initialize(): Promise<void>;
    sendMessage(payload: any): Promise<{
        success: boolean;
    }>;
    receiveMessage(payload: any): Promise<any>;
    destroy(): Promise<void>;
}
