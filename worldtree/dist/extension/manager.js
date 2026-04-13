"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extensionManager = void 0;
const types_1 = require("./types");
class ExtensionManager {
    constructor() {
        this.extensions = new Map();
        this.pointExtensions = new Map();
        // 初始化所有扩展点
        Object.values(types_1.ExtensionPoint).forEach(point => {
            this.pointExtensions.set(point, []);
        });
    }
    /**
     * 注册扩展
     */
    register(extension) {
        if (this.extensions.has(extension.id)) {
            console.warn(`扩展 ${extension.id} 已存在，将被覆盖`);
        }
        const registration = {
            extension,
            registerTime: Date.now(),
            lastActiveTime: Date.now()
        };
        this.extensions.set(extension.id, registration);
        // 注册到对应扩展点
        extension.points.forEach(point => {
            const extensions = this.pointExtensions.get(point) || [];
            // 按优先级排序
            extensions.push(extension);
            extensions.sort((a, b) => b.priority - a.priority);
            this.pointExtensions.set(point, extensions);
        });
        console.log(`扩展 ${extension.id} v${extension.version} 注册成功`);
        return true;
    }
    /**
     * 注销扩展
     */
    unregister(extensionId) {
        const registration = this.extensions.get(extensionId);
        if (!registration) {
            return false;
        }
        // 从所有扩展点移除
        registration.extension.points.forEach(point => {
            const extensions = this.pointExtensions.get(point) || [];
            const index = extensions.findIndex(e => e.id === extensionId);
            if (index > -1) {
                extensions.splice(index, 1);
            }
        });
        this.extensions.delete(extensionId);
        console.log(`扩展 ${extensionId} 已注销`);
        return true;
    }
    /**
     * 触发扩展点
     */
    async trigger(point, context, data) {
        const extensions = this.pointExtensions.get(point) || [];
        const results = [];
        for (const extension of extensions) {
            if (!extension.enabled)
                continue;
            try {
                const result = await extension.handler(context, data);
                if (result !== undefined && result !== null) {
                    results.push(result);
                }
                // 更新活跃时间
                const registration = this.extensions.get(extension.id);
                if (registration) {
                    registration.lastActiveTime = Date.now();
                }
            }
            catch (err) {
                console.error(`扩展 ${extension.id} 执行失败:`, err);
            }
        }
        return results;
    }
    /**
     * 获取扩展列表
     */
    listExtensions() {
        return Array.from(this.extensions.values());
    }
    /**
     * 启用/禁用扩展
     */
    toggleExtension(extensionId, enabled) {
        const registration = this.extensions.get(extensionId);
        if (!registration) {
            return false;
        }
        registration.extension.enabled = enabled;
        return true;
    }
}
exports.extensionManager = new ExtensionManager();
exports.default = exports.extensionManager;
