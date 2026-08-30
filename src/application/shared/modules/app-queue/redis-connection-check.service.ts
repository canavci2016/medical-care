import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppQueueService } from './app-queue.service';

// BullMQ's underlying ioredis connection retries indefinitely by default,
// so `waitUntilReady()` would never resolve or reject while Redis is
// unreachable. Bounding it here ensures a temporary Redis outage fails
// startup instead of hanging the application forever with no port bound.
const REDIS_READY_TIMEOUT_MS = 10_000;

@Injectable()
export class RedisConnectionCheckService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RedisConnectionCheckService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly appQueueService: AppQueueService,
  ) {
    // No-op.
  }

  async onApplicationBootstrap(): Promise<void> {
    const redisUrl = this.configService.get<string>(
      'REDIS_URL',
      'redis://localhost:6379',
    );

    try {
      await Promise.race([
        this.appQueueService.queue.waitUntilReady(),
        new Promise((_resolve, reject) =>
          setTimeout(
            () =>
              reject(
                new Error(
                  `Timed out waiting for Redis (BullMQ) after ${REDIS_READY_TIMEOUT_MS}ms`,
                ),
              ),
            REDIS_READY_TIMEOUT_MS,
          ),
        ),
      ]);

      this.logger.log(
        `Redis connection successful: ${this.redactRedisUrl(redisUrl)}`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown Redis connection error';

      this.logger.error(
        `Redis connection check failed for ${this.redactRedisUrl(redisUrl)}: ${message}`,
      );

      throw error;
    }
  }

  private redactRedisUrl(redisUrl: string): string {
    try {
      const parsedUrl = new URL(redisUrl);

      if (parsedUrl.password) {
        parsedUrl.password = '***';
      }

      if (parsedUrl.username) {
        parsedUrl.username = '***';
      }

      return parsedUrl.toString();
    } catch {
      return 'invalid-redis-url';
    }
  }
}
