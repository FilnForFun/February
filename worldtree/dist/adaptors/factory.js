"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptorFactory = void 0;
const openclaw_1 = require("./openclaw");
const feishu_1 = require("./feishu");
class AdaptorFactory {
    /**
     * 创建适配层实例
     */
    static createAdaptor(type, config) {
        const AdaptorClass = this.adaptorMap[type];
        if (!AdaptorClass) {
            throw new Error(`不支持的适配层类型: ${type}`);
        }
        return new AdaptorClass(config);
    }
    /**
     * 注册新的适配层类型
     */
    static registerAdaptor(type, adaptorClass) {
        this.adaptorMap[type] = adaptorClass;
        console.log(`适配层类型 ${type} 已注册`);
    }
    /**
     * 获取支持的适配层类型列表
     */
    static getSupportedTypes() {
        return Object.keys(this.adaptorMap);
    }
}
exports.AdaptorFactory = AdaptorFactory;
AdaptorFactory.adaptorMap = {
    'openclaw': openclaw_1.OpenClawAdaptor,
    'feishu': feishu_1.FeishuAdaptor
};
exports.default = AdaptorFactory;
