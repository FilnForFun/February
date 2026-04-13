import type { RetryConfig, RetryStrategy } from './types';

const DEFAULT_CONFIG: Required<RetryStrategy> = {
  maxRetries: 3,
  initialDelayMs: 100,
  backoffFactor: 2,
  timeoutMs: 30000,
  enableIdempotency: true,
};

export class RetryManager {
  private idempotencyCache = new Map<string, any>();
  private globalConfig: Required<RetryStrategy>;

  constructor(globalConfig?: Partial<RetryStrategy>) {
    this.globalConfig = { ...DEFAULT_CONFIG, ...globalConfig };
  }

  async execute<T>(
    fn: () => Promise<T>,
    config?: RetryConfig
  ): Promise<T> {
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
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          onFailure?.(error as Error);
          if (fallbackResult !== undefined) return fallbackResult;
          throw error;
        }
        onRetry?.(attempt, error as Error);
        const delay = initialDelayMs * Math.pow(backoffFactor, attempt - 1);
        await this.sleep(delay);
      }
    }
    throw new Error('Retry failed');
  }

  private async withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  clearIdempotencyCache(key?: string): void {
    if (key) this.idempotencyCache.delete(key);
    else this.idempotencyCache.clear();
  }
}
