"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gatewayRouter = void 0;
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const node_1 = require("./modules/node");
const kg_1 = require("./modules/kg");
const agent_1 = require("./modules/agent");
const perm_1 = require("./modules/perm");
const resource_1 = require("./modules/resource");
const common_1 = require("../types/common");
exports.gatewayRouter = (0, express_1.Router)();
// JWT认证中间件
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        const response = {
            code: common_1.ErrorCode.PERMISSION_DENIED,
            msg: '缺少认证令牌',
            data: null
        };
        return res.status(401).json(response);
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.OPENCLAW_JWT_SECRET || 'default_secret');
        req.user = decoded;
        next();
    }
    catch (err) {
        const response = {
            code: common_1.ErrorCode.PERMISSION_DENIED,
            msg: '无效的认证令牌',
            data: null
        };
        return res.status(401).json(response);
    }
};
// 请求日志中间件
const logMiddleware = (req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
};
// 统一响应格式化中间件
const responseMiddleware = (req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        if (data.code !== undefined) {
            return originalJson.call(this, data);
        }
        const response = {
            code: common_1.ErrorCode.SUCCESS,
            msg: 'success',
            data
        };
        return originalJson.call(this, response);
    };
    next();
};
// 全局错误处理中间件
exports.gatewayRouter.use((err, req, res, next) => {
    console.error('API网关错误:', err);
    const response = {
        code: common_1.ErrorCode.INTERNAL_ERROR,
        msg: '内部服务错误',
        data: null
    };
    res.status(500).json(response);
});
// 注册中间件
exports.gatewayRouter.use(logMiddleware);
exports.gatewayRouter.use(responseMiddleware);
exports.gatewayRouter.use(authMiddleware);
// 注册子路由
exports.gatewayRouter.use('/node', node_1.nodeRouter);
exports.gatewayRouter.use('/kg', kg_1.kgRouter);
exports.gatewayRouter.use('/agent', agent_1.agentRouter);
exports.gatewayRouter.use('/perm', perm_1.permRouter);
exports.gatewayRouter.use('/resource', resource_1.resourceRouter);
exports.default = exports.gatewayRouter;
