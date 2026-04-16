import { BaseAdaptor, AdaptorConfig, AdaptorResponse } from './base';
export declare class OpenClawAdaptor extends BaseAdaptor {
    private client;
    constructor(config: AdaptorConfig);
    init(): Promise<boolean>;
    test(): Promise<AdaptorResponse>;
    /**
     * 调用OpenClaw工具
     */
    callTool(toolName: string, parameters: Record<string, any>): Promise<AdaptorResponse>;
    /**
     * 获取Agent列表
     */
    listAgents(): Promise<AdaptorResponse>;
}
