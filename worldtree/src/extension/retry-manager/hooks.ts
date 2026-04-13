import { RetryManager } from './retry-manager';
import type { RetryConfig } from './types';

const globalRetryManager = new RetryManager();

export function bindRetryHooks(eventBus: any) {
  eventBus.on('agent:invoke:before', async (ctx: any) => {
    if (!ctx.retryConfig) return;
    ctx.retryManager = globalRetryManager;
    ctx.originalInvoke = ctx.invoke;
    ctx.invoke = async () => {
      return globalRetryManager.execute(ctx.originalInvoke, ctx.retryConfig as RetryConfig);
    };
  });

  eventBus.on('agent:invoke:retry', (data: any) => {
    console.debug(`[RetryManager] Retry attempt ${data.attempt} for agent ${data.agentId}: ${data.error.message}`);
  });

  eventBus.on('agent:invoke:fallback', (data: any) => {
    console.warn(`[RetryManager] Agent ${data.agentId} failed after ${data.maxRetries} retries, using fallback result`);
  });

  return {
    globalRetryManager,
    RetryManager,
  };
}
