import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { JobsOptions, Queue } from 'bullmq';
import { APP_DEFAULT_QUEUE } from './app-queue.constants';

@Injectable()
export class AppQueueService {
  constructor(
    @InjectQueue(APP_DEFAULT_QUEUE)
    private readonly defaultQueue: Queue,
  ) {}

  async add<T = unknown>(jobName: string, data: T, options?: JobsOptions) {
    return this.defaultQueue.add(jobName, data, options);
  }

  async addBulk<T = unknown>(
    jobs: Array<{ name: string; data: T; opts?: JobsOptions }>,
  ) {
    return this.defaultQueue.addBulk(
      jobs.map((job) => ({
        name: job.name,
        data: job.data,
        opts: job.opts,
      })),
    );
  }

  get queue() {
    return this.defaultQueue;
  }
}
