"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = void 0;
exports.validateConfig = validateConfig;
exports.loadConfig = loadConfig;
exports.DEFAULT_CONFIG = {
    enabled: false,
    channels: [],
    hooks: [],
    logLevel: 'info',
    endpoint: 'https://api.worldtree.dev',
    apiKey: ''
};
function validateConfig(config) {
    if (config.enabled && (!config.apiKey || !config.endpoint)) {
        return false;
    }
    return true;
}
function loadConfig(userConfig) {
    const merged = { ...exports.DEFAULT_CONFIG, ...userConfig };
    if (!validateConfig(merged)) {
        throw new Error('Invalid WorldTree plugin configuration');
    }
    return merged;
}
