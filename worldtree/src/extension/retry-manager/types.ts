export interface RetryStrategy {
  maxRetries?: number;
  initialDelayMs?: number;
  backoffFactor?: number;
  timeoutMs?: number;
  enableIdempotency?: boolean;
}

export interface RetryConfig extends RetryStrategy {
  fallbackResult?: any;
  idempotencyKey?: string;
  onRetry?: (attempt: number, error: Error) => void;
  onFailure?: (error: Error) => void;
  onSuccess?: (result: any) => void;
}
