import { BaseAdaptor, AdaptorConfig, AdaptorResponse } from './base';
export declare class FeishuAdaptor extends BaseAdaptor {
    private tenantAccessToken;
    private tokenExpireTime;
    constructor(config: AdaptorConfig);
    init(): Promise<boolean>;
    test(): Promise<AdaptorResponse>;
    /**
     * 刷新租户访问令牌
     */
    private refreshTenantToken;
    /**
     * 发送消息
     */
    sendMessage(receiveId: string, content: string, msgType?: string): Promise<AdaptorResponse>;
}
