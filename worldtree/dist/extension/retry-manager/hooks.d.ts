import { RetryManager } from './retry-manager';
export declare function bindRetryHooks(eventBus: any): {
    globalRetryManager: RetryManager;
    RetryManager: typeof RetryManager;
};
