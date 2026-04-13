"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeishuAdaptor = void 0;
const base_1 = require("./base");
const axios_1 = __importDefault(require("axios"));
class FeishuAdaptor extends base_1.BaseAdaptor {
    constructor(config) {
        super(config, 'feishu', '1.0.0');
        this.tenantAccessToken = null;
        this.tokenExpireTime = 0;
    }
    async init() {
        try {
            await this.refreshTenantToken();
            return true;
        }
        catch (err) {
            console.error('飞书适配层初始化失败:', err);
            return false;
        }
    }
    async test() {
        try {
            if (!this.tenantAccessToken || Date.now() > this.tokenExpireTime) {
                await this.refreshTenantToken();
            }
            const response = await axios_1.default.get('https://open.feishu.cn/open-apis/contact/v3/users/me', {
                headers: {
                    'Authorization': `Bearer ${this.tenantAccessToken}`
                }
            });
            return {
                success: true,
                data: response.data
            };
        }
        catch (err) {
            return {
                success: false,
                error: err.message,
                code: err.response?.status || 500
            };
        }
    }
    /**
     * 刷新租户访问令牌
     */
    async refreshTenantToken() {
        const response = await axios_1.default.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
            app_id: this.config.options?.appId,
            app_secret: this.config.options?.appSecret
        });
        this.tenantAccessToken = response.data.tenant_access_token;
        this.tokenExpireTime = Date.now() + (response.data.expire * 1000) - 60000; // 提前1分钟过期
    }
    /**
     * 发送消息
     */
    async sendMessage(receiveId, content, msgType = 'text') {
        try {
            if (!this.tenantAccessToken || Date.now() > this.tokenExpireTime) {
                await this.refreshTenantToken();
            }
            const response = await axios_1.default.post('https://open.feishu.cn/open-apis/im/v1/messages', {
                receive_id: receiveId,
                content: JSON.stringify({ text: content }),
                msg_type: msgType
            }, {
                headers: {
                    'Authorization': `Bearer ${this.tenantAccessToken}`
                },
                params: {
                    receive_id_type: 'open_id'
                }
            });
            return {
                success: true,
                data: response.data
            };
        }
        catch (err) {
            return {
                success: false,
                error: err.message,
                code: err.response?.status || 500
            };
        }
    }
}
exports.FeishuAdaptor = FeishuAdaptor;
