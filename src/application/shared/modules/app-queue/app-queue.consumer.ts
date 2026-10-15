import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { AppEmailService } from '../app-email/app-email.service';
import { APP_DEFAULT_QUEUE } from './app-queue.constants';
import { SupportedEventTypes } from './supported-event-types.enum';

@Processor(APP_DEFAULT_QUEUE)
export class AppQueueConsumer extends WorkerHost {
  private readonly logger = new Logger(AppQueueConsumer.name);

  constructor(private readonly appEmailService: AppEmailService) {
    super();
  }

  async process(
    job: Job<{ [key: string]: unknown; name: SupportedEventTypes }>,
  ) {
    this.logger.log(`Processing job: ${job.name} (${job.id})`);

    const jobName = job.name as SupportedEventTypes;
    const payload = job.data;

    if (jobName === SupportedEventTypes.CONTACT_FORM_SUBMISSION) {
      const contact = payload as {
        firstName?: string;
        lastName?: string;
        email?: string;
        subject?: string;
        message?: string;
      };

      const to = process.env.SMTP_REPLY_TO ?? 'admin@example.com';
      const subject = contact.subject ?? 'New contact form submission';
      const text = [
        `Name: ${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim(),
        `Email: ${contact.email ?? 'N/A'}`,
        'Message:',
        contact.message ?? 'No message provided',
      ].join('\n');

      await this.appEmailService.sendMail({
        to,
        subject,
        text,
      });

      this.logger.log(
        `Contact form email sent for ${contact.email ?? 'unknown email'}`,
      );
    }

    if (jobName === SupportedEventTypes.HOSPITAL_PASSWORD_RESET) {
      const passwordReset = payload as unknown as {
        email: string;
        resetUrl: string;
      };

      await this.appEmailService.sendMail({
        to: passwordReset.email,
        subject: 'Reset your hospital password',
        text: [
          'We received a request to reset your hospital password.',
          `Use this link within one hour to choose a new password: ${passwordReset.resetUrl}`,
          'If you did not request this change, you can ignore this email.',
        ].join('\n\n'),
      });
    }

    return payload;
  }
}
