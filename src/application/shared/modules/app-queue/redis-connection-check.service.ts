import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppQueueService } from './app-queue.service';

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
      await this.appQueueService.queue.waitUntilReady();

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
