import { Global, Logger, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

// If Redis is temporarily unreachable, the client's default reconnect
// strategy retries forever without ever rejecting, which would leave
// `client.connect()` pending indefinitely. That, in turn, blocks the whole
// application from starting up (and binding its port), so a deployment
// would just hang until an external timeout is hit. Bounding the initial
// connection attempt lets startup fail fast instead so the process can be
// restarted and retried.
const INITIAL_CONNECTION_TIMEOUT_MS = 10_000;

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

        await Promise.race([
          client.connect(),
          new Promise((_resolve, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    `Timed out connecting to Redis after ${INITIAL_CONNECTION_TIMEOUT_MS}ms`,
                  ),
                ),
              INITIAL_CONNECTION_TIMEOUT_MS,
            ),
          ),
        ]);

        return client;
      },
      inject: [ConfigService],
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule { }
