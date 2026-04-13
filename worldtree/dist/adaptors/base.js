"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAdaptor = void 0;
class BaseAdaptor {
    constructor(config, name, version) {
        this.config = {
            timeout: 10000,
            ...config
        };
        this.name = name;
        this.version = version;
    }
    /**
     * 获取适配层信息
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            type: this.config.type
        };
    }
    /**
     * 销毁适配层
     */
    async destroy() {
        // 默认空实现，子类可重写
    }
}
exports.BaseAdaptor = BaseAdaptor;
