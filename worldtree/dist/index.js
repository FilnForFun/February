"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const hooks_1 = require("./hooks");
const channels_1 = require("./channels");
// 多Agent协同升级模块
const context_trim_1 = require("./engines/context-trim");
const retry_manager_1 = require("./extension/retry-manager");
const multi_agent_scheduler_1 = require("./extension/multi-agent-scheduler");
const WorldTreePlugin = {
    name: 'worldtree',
    version: '0.1.0',
    description: 'WorldTree Architecture Adaptation Layer Plugin',
    author: 'OpenClaw Team',
    async install(context, userConfig) {
        const config = (0, config_1.loadConfig)(userConfig);
        if (!config.enabled) {
            context.logger.info('WorldTree plugin is disabled, skipping initialization');
            return;
        }
        context.logger.info('Initializing WorldTree plugin...');
        // 初始化多Agent协同升级模块
        const contextTrim = new context_trim_1.ContextTrimEngine(config.contextTrim);
        const retryManager = new retry_manager_1.RetryManager(config.retry);
        const agentScheduler = new multi_agent_scheduler_1.MultiAgentScheduler(config.scheduler, context, retryManager, contextTrim);
        // 绑定模块到上下文，供全局调用
        context.worldtree = {
            contextTrim,
            retryManager,
            agentScheduler
        };
        // Register event hooks
        await (0, hooks_1.registerHooks)(context, config);
        // Register multi-channel adapters
        await (0, channels_1.registerChannels)(context, config);
        context.logger.info('✅ WorldTree plugin + 多Agent协同模块 初始化成功');
        context.logger.info('✅ 上下文裁剪、容错重试、多Agent调度能力已全部启用');
    },
    async uninstall(context) {
        context.logger.info('Uninstalling WorldTree plugin...');
        // Cleanup logic
        context.logger.info('WorldTree plugin uninstalled successfully');
    }
};
exports.default = WorldTreePlugin;
