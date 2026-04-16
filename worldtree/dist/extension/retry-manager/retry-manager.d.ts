import type { RetryConfig, RetryStrategy } from './types';
export declare class RetryManager {
    private idempotencyCache;
    private globalConfig;
    constructor(globalConfig?: Partial<RetryStrategy>);
    execute<T>(fn: () => Promise<T>, config?: RetryConfig): Promise<T>;
    private withTimeout;
    private sleep;
    clearIdempotencyCache(key?: string): void;
}
