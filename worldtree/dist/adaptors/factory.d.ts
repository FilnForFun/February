import { BaseAdaptor, AdaptorConfig } from './base';
export declare class AdaptorFactory {
    private static adaptorMap;
    /**
     * 创建适配层实例
     */
    static createAdaptor(type: string, config: AdaptorConfig): BaseAdaptor;
    /**
     * 注册新的适配层类型
     */
    static registerAdaptor(type: string, adaptorClass: new (config: AdaptorConfig) => BaseAdaptor): void;
    /**
     * 获取支持的适配层类型列表
     */
    static getSupportedTypes(): string[];
}
export default AdaptorFactory;
