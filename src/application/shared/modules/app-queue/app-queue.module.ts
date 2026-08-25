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
export class AppQueueModule {}
