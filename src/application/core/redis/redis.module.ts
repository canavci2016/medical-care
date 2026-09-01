import { Global, Logger, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('RedisModule', { timestamp: true });

        const url = configService.get<string>('REDIS_URL');

        if (!url) {
          throw new Error('REDIS_URL environment variable is not set');
        }

        const client = createClient({
          url,

          socket: {
            connectTimeout: 5000,

            reconnectStrategy: (retries) => {
              const delay = Math.min(retries * 200, 3000);

              logger.warn(
                `Redis reconnect attempt ${retries}, retrying in ${delay}ms`,
              );

              return delay;
            },
          },
        });

        client.on('error', (err) => {
          logger.error(`Redis error: ${err.message}`);
        });

        client.on('connect', () => {
          logger.log('Redis socket connected');
        });

        client.on('ready', () => {
          logger.log('Redis ready');
        });

        client.on('reconnecting', () => {
          logger.warn('Redis reconnecting');
        });
        try {
          await client.connect();
        } catch (error) {
          logger.error(
            'Initial Redis connection failed. Application will continue without Redis.',
          );

          logger.error(error);
        }

        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule { }
