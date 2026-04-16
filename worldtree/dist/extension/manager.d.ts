import { Extension, ExtensionPoint, ExtensionContext, ExtensionRegistration } from './types';
declare class ExtensionManager {
    private extensions;
    private pointExtensions;
    constructor();
    /**
     * 注册扩展
     */
    register(extension: Extension): boolean;
    /**
     * 注销扩展
     */
    unregister(extensionId: string): boolean;
    /**
     * 触发扩展点
     */
    trigger<T = any, R = any>(point: ExtensionPoint, context: ExtensionContext, data: T): Promise<R[]>;
    /**
     * 获取扩展列表
     */
    listExtensions(): ExtensionRegistration[];
    /**
     * 启用/禁用扩展
     */
    toggleExtension(extensionId: string, enabled: boolean): boolean;
}
export declare const extensionManager: ExtensionManager;
export default extensionManager;
