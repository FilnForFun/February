"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryManager = void 0;
const DEFAULT_CONFIG = {
    maxRetries: 3,
    initialDelayMs: 100,
    backoffFactor: 2,
    timeoutMs: 30000,
    enableIdempotency: true,
};
class RetryManager {
    constructor(globalConfig) {
        this.idempotencyCache = new Map();
        this.globalConfig = { ...DEFAULT_CONFIG, ...globalConfig };
    }
    async execute(fn, config) {
        const mergedConfig = { ...this.globalConfig, ...config };
        const { maxRetries, initialDelayMs, backoffFactor, timeoutMs, enableIdempotency, idempotencyKey, fallbackResult, onRetry, onFailure, onSuccess } = mergedConfig;
        if (enableIdempotency && idempotencyKey && this.idempotencyCache.has(idempotencyKey)) {
            return this.idempotencyCache.get(idempotencyKey);
        }
        let attempt = 0;
        while (attempt <= maxRetries) {
            try {
                const result = await this.withTimeout(fn, timeoutMs);
                if (enableIdempotency && idempotencyKey) {
                    this.idempotencyCache.set(idempotencyKey, result);
                }
                onSuccess?.(result);
                return result;
            }
            catch (error) {
                attempt++;
                if (attempt > maxRetries) {
                    onFailure?.(error);
                    if (fallbackResult !== undefined)
                        return fallbackResult;
                    throw error;
                }
                onRetry?.(attempt, error);
                const delay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
                await this.sleep(delay);
            }
        }
        throw new Error('Retry failed');
    }
    async withTimeout(fn, timeoutMs) {
        return Promise.race([
            fn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs))
        ]);
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    clearIdempotencyCache(key) {
        if (key)
            this.idempotencyCache.delete(key);
        else
            this.idempotencyCache.clear();
    }
}
exports.RetryManager = RetryManager;
