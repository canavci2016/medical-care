import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes, createHash } from 'node:crypto';
import { HospitalService } from './hospital.service';
import { RedisService } from '../../core/redis/redis.service';
import { AppQueueService } from '../../shared/modules/app-queue/app-queue.service';
import { SupportedEventTypes } from '../../shared/modules/app-queue/supported-event-types.enum';

const TOKEN_TTL_SECONDS = 60 * 60;
const TOKEN_KEY_PREFIX = 'hospital-password-reset:';

@Injectable()
export class HospitalPasswordResetService {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly redisService: RedisService,
    private readonly appQueueService: AppQueueService,
    private readonly configService: ConfigService,
  ) {}

  async requestPasswordReset(email: string): Promise<void> {
    const hospital = await this.hospitalService.findByEmail(email);

    if (!hospital?.email) {
      return;
    }

    const token = randomBytes(32).toString('hex');
    const key = this.getTokenKey(token);
    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:3500',
    );
    const resetUrl = new URL(
      `/hospital/auth/reset-password?token=${encodeURIComponent(token)}`,
      appUrl,
    ).toString();

    await this.redisService.set(key, hospital.id, TOKEN_TTL_SECONDS);

    try {
      await this.appQueueService.add(
        SupportedEventTypes.HOSPITAL_PASSWORD_RESET,
        { email: hospital.email, resetUrl },
        { removeOnFail: true },
      );
    } catch (error) {
      await this.redisService.del(key);
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const hospitalId = await this.redisService.getAndDelete<string>(
      this.getTokenKey(token),
    );

    if (!hospitalId) {
      return false;
    }

    return this.hospitalService.resetPassword(hospitalId, newPassword);
  }

  private getTokenKey(token: string): string {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    return `${TOKEN_KEY_PREFIX}${tokenHash}`;
  }
}
