import type { ContextTrimOptions } from './engines/context-trim';
import type { RetryConfig } from './extension/retry-manager/types';
export interface SchedulerConfig {
    loadBalanceStrategy: 'round-robin' | 'least-load' | 'random';
    maxConcurrentAgents: number;
    agentIdleTimeout: number;
    enablePermissionControl: boolean;
}
export interface WorldTreeConfig {
    enabled: boolean;
    channels: string[];
    hooks: string[];
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    endpoint: string;
    apiKey: string;
    contextTrim?: ContextTrimOptions;
    retry?: RetryConfig;
    scheduler?: SchedulerConfig;
}
export declare const DEFAULT_CONFIG: WorldTreeConfig;
export declare function validateConfig(config: Partial<WorldTreeConfig>): config is WorldTreeConfig;
export declare function loadConfig(userConfig: Partial<WorldTreeConfig>): WorldTreeConfig;
