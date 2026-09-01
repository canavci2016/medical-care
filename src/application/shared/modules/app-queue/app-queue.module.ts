import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_DEFAULT_QUEUE } from './app-queue.constants';
import { AppQueueConsumer } from './app-queue.consumer';
import { AppQueueService } from './app-queue.service';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          url: configService.get<string>('REDIS_URL', 'redis://localhost:6379'),
          connectTimeout: 5_000,
          maxRetriesPerRequest: null,
          retryStrategy: (times: number) => {
            return Math.min(times * 500, 10_000);
          },
        },
        defaultJobOptions: {
          attempts: 5,

          backoff: {
            type: 'exponential',
            delay: 1_000,
          },

          removeOnComplete: true,
          removeOnFail: 1_000,
        },
      }),
    }),
    BullModule.registerQueue({
      name: APP_DEFAULT_QUEUE,
    }),
  ],
  providers: [AppQueueService, AppQueueConsumer],
  exports: [BullModule, AppQueueService],
})
export class AppQueueModule { }
