"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenClawAdaptor = void 0;
const base_1 = require("./base");
const axios_1 = __importDefault(require("axios"));
class OpenClawAdaptor extends base_1.BaseAdaptor {
    constructor(config) {
        super(config, 'openclaw', '1.0.0');
        this.client = axios_1.default.create({
            baseURL: config.endpoint || 'http://localhost:7412',
            timeout: config.timeout,
            headers: {
                'Authorization': `Bearer ${config.apiKey}`
            }
        });
    }
    async init() {
        try {
            await this.test();
            return true;
        }
        catch (err) {
            console.error('OpenClaw适配层初始化失败:', err);
            return false;
        }
    }
    async test() {
        try {
            const response = await this.client.get('/api/v1/status');
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
     * 调用OpenClaw工具
     */
    async callTool(toolName, parameters) {
        try {
            const response = await this.client.post('/api/v1/tools/call', {
                tool: toolName,
                parameters
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
     * 获取Agent列表
     */
    async listAgents() {
        try {
            const response = await this.client.get('/api/v1/agents');
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
exports.OpenClawAdaptor = OpenClawAdaptor;
