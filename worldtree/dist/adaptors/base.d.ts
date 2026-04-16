export interface AdaptorConfig {
    type: string;
    endpoint?: string;
    apiKey?: string;
    timeout?: number;
    options?: Record<string, any>;
}
export interface AdaptorResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    code?: number;
}
export declare abstract class BaseAdaptor {
    protected config: AdaptorConfig;
    protected name: string;
    protected version: string;
    constructor(config: AdaptorConfig, name: string, version: string);
    /**
     * 初始化适配层
     */
    abstract init(): Promise<boolean>;
    /**
     * 测试连接
     */
    abstract test(): Promise<AdaptorResponse>;
    /**
     * 获取适配层信息
     */
    getInfo(): {
        name: string;
        version: string;
        type: string;
    };
    /**
     * 销毁适配层
     */
    destroy(): Promise<void>;
}
