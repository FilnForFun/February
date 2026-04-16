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

export const DEFAULT_CONFIG: WorldTreeConfig = {
  enabled: false,
  channels: [],
  hooks: [],
  logLevel: 'info',
  endpoint: 'https://api.worldtree.dev',
  apiKey: ''
};

export function validateConfig(config: Partial<WorldTreeConfig>): config is WorldTreeConfig {
  if (config.enabled && (!config.apiKey || !config.endpoint)) {
    return false;
  }
  return true;
}

export function loadConfig(userConfig: Partial<WorldTreeConfig>): WorldTreeConfig {
  const merged = { ...DEFAULT_CONFIG, ...userConfig };
  if (!validateConfig(merged)) {
    throw new Error('Invalid WorldTree plugin configuration');
  }
  return merged;
}
