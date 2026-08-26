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
        const client = createClient({ url });

        client.on('error', (err) => {
          logger.error('Redis Error:', err);
        });

        client.on('connect', () => {
          logger.log('Connected to Redis');
        });

        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule { }
