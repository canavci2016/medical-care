import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';

@Injectable()
export class AppEmailService {
  private readonly logger = new Logger(AppEmailService.name);
  private readonly transporter: Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<string>('SMTP_PORT', '587');
    const secure = this.configService.get<string>('SMTP_SECURE', 'false');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASSWORD');

    this.transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: secure === 'true',
      auth: user && pass ? { user, pass } : undefined,
    });
  }

  async sendMail(options: SendMailOptions) {
    const sender = this.configService.get<string>('SMTP_FROM');

    return this.transporter.sendMail({
      ...options,
      from: options.from ?? sender,
    });
  }
}
