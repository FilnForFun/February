"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHooks = registerHooks;
async function registerHooks(context, config) {
    if (config.hooks.includes('message')) {
        context.hooks.register('message:received', messageHandler);
        context.hooks.register('message:sent', messageHandler);
    }
    if (config.hooks.includes('lifecycle')) {
        context.hooks.register('plugin:loaded', lifecycleHandler);
        context.hooks.register('plugin:unloaded', lifecycleHandler);
    }
    context.logger.info(`Registered ${config.hooks.length} WorldTree hooks`);
}
async function messageHandler(payload) {
    // Message hook logic
}
async function lifecycleHandler(payload) {
    // Lifecycle hook logic
}
