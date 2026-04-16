"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindRetryHooks = bindRetryHooks;
const retry_manager_1 = require("./retry-manager");
const globalRetryManager = new retry_manager_1.RetryManager();
function bindRetryHooks(eventBus) {
    eventBus.on('agent:invoke:before', async (ctx) => {
        if (!ctx.retryConfig)
            return;
        ctx.retryManager = globalRetryManager;
        ctx.originalInvoke = ctx.invoke;
        ctx.invoke = async () => {
            return globalRetryManager.execute(ctx.originalInvoke, ctx.retryConfig);
        };
    });
    eventBus.on('agent:invoke:retry', (data) => {
        console.debug(`[RetryManager] Retry attempt ${data.attempt} for agent ${data.agentId}: ${data.error.message}`);
    });
    eventBus.on('agent:invoke:fallback', (data) => {
        console.warn(`[RetryManager] Agent ${data.agentId} failed after ${data.maxRetries} retries, using fallback result`);
    });
    return {
        globalRetryManager,
        RetryManager: retry_manager_1.RetryManager,
    };
}
