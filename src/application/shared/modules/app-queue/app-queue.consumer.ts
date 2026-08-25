import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { APP_DEFAULT_QUEUE } from './app-queue.constants';
import { SupportedEventTypes } from './supported-event-types.enum';

@Processor(APP_DEFAULT_QUEUE)
export class AppQueueConsumer extends WorkerHost {
  private readonly logger = new Logger(AppQueueConsumer.name);

  async process(
    job: Job<{ [key: string]: unknown; name: SupportedEventTypes }>,
  ) {
    this.logger.log(`Processing contact submission: ${job.id}`);

    const payload = job.data;
    this.logger.debug(`Contact payload: ${JSON.stringify(payload)}`);

    if (job.name === SupportedEventTypes.CONTACT_FORM_SUBMISSION) {
      // Handle contact form submission
      console.log('Contact form submission received:', payload);
    }

    return payload;
  }
}
