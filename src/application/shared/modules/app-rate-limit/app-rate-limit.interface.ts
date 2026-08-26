export interface AppRateLimitOptions {
  keyPrefix?: string;
  ttlSeconds?: number;
  maxAttempts?: number;
  message?: string;
}
