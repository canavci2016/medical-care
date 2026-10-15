import { createHash } from 'node:crypto';
import { HospitalPasswordResetService } from './hospital-password-reset.service';
import { SupportedEventTypes } from '../../shared/modules/app-queue/supported-event-types.enum';

jest.mock('./hospital.service', () => ({
  HospitalService: class HospitalService {},
}));

describe('HospitalPasswordResetService', () => {
  let service: HospitalPasswordResetService;
  let hospitalService: {
    findByEmail: jest.Mock;
    resetPassword: jest.Mock;
    getPasswordVersion: jest.Mock;
  };
  let redisService: {
    set: jest.Mock;
    getAndDelete: jest.Mock;
    del: jest.Mock;
    incrementWithExpiry: jest.Mock;
  };
  let appQueueService: { add: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(() => {
    hospitalService = {
      findByEmail: jest.fn(),
      resetPassword: jest.fn(),
      getPasswordVersion: jest.fn().mockResolvedValue('password-version'),
    };
    redisService = {
      set: jest.fn(),
      getAndDelete: jest.fn(),
      del: jest.fn(),
      incrementWithExpiry: jest.fn().mockResolvedValue(1),
    };
    appQueueService = { add: jest.fn() };
    configService = {
      get: jest.fn().mockReturnValue('https://example.com'),
    };

    service = new HospitalPasswordResetService(
      hospitalService as never,
      redisService as never,
      appQueueService as never,
      configService as never,
    );
  });

  it('does not create a reset token or queue an email for an unknown email', async () => {
    hospitalService.findByEmail.mockResolvedValue(null);

    await service.requestPasswordReset('unknown@example.com');

    expect(redisService.set).not.toHaveBeenCalled();
    expect(appQueueService.add).not.toHaveBeenCalled();
  });

  it('limits password reset requests for the same email', async () => {
    redisService.incrementWithExpiry.mockResolvedValue(6);

    await service.requestPasswordReset('hospital@example.com');

    expect(redisService.incrementWithExpiry).toHaveBeenCalledWith(
      expect.stringMatching(/^hospital-password-reset:requests:/),
      600,
    );
    expect(hospitalService.findByEmail).not.toHaveBeenCalled();
    expect(appQueueService.add).not.toHaveBeenCalled();
  });

  it('queues a reset link and stores only its hashed token with an expiry', async () => {
    hospitalService.findByEmail.mockResolvedValue({
      id: 'hospital-id',
      email: 'hospital@example.com',
    });

    await service.requestPasswordReset('hospital@example.com');

    const [jobName, jobData] = appQueueService.add.mock.calls[0] as [
      string,
      { email: string; resetUrl: string },
    ];
    const token = new URL(jobData.resetUrl).searchParams.get('token')!;
    const hashedToken = createHash('sha256').update(token).digest('hex');

    expect(jobName).toBe(SupportedEventTypes.HOSPITAL_PASSWORD_RESET);
    expect(jobData.email).toBe('hospital@example.com');
    expect(jobData.resetUrl).toMatch(
      /^https:\/\/example\.com\/hospital\/auth\/reset-password\?token=/,
    );
    expect(redisService.set).toHaveBeenCalledWith(
      `hospital-password-reset:${hashedToken}`,
      { hospitalId: 'hospital-id', authVersion: 'password-version' },
      3600,
    );
    const [storedKey] = redisService.set.mock.calls[0] as [string];
    expect(storedKey).not.toContain(token);
  });

  it('consumes a valid token and resets the hospital password once', async () => {
    const token = 'reset-token';
    const hashedToken = createHash('sha256').update(token).digest('hex');
    redisService.getAndDelete.mockResolvedValueOnce({
      hospitalId: 'hospital-id',
      authVersion: 'password-version',
    });
    hospitalService.resetPassword.mockResolvedValue(true);

    await expect(service.resetPassword(token, 'new-password')).resolves.toBe(
      true,
    );

    expect(redisService.getAndDelete).toHaveBeenCalledWith(
      `hospital-password-reset:${hashedToken}`,
    );
    expect(hospitalService.resetPassword).toHaveBeenCalledWith(
      'hospital-id',
      'new-password',
      'password-version',
    );
  });

  it('rejects reset links issued for an older password version', async () => {
    redisService.getAndDelete.mockResolvedValueOnce({
      hospitalId: 'hospital-id',
      authVersion: 'old-password-version',
    });
    hospitalService.resetPassword.mockResolvedValue(false);

    await expect(
      service.resetPassword('older-token', 'new-password'),
    ).resolves.toBe(false);

    expect(hospitalService.resetPassword).toHaveBeenCalledWith(
      'hospital-id',
      'new-password',
      'old-password-version',
    );
  });

  it('rejects expired or already-used tokens', async () => {
    redisService.getAndDelete.mockResolvedValue(null);

    await expect(
      service.resetPassword('expired-token', 'new-password'),
    ).resolves.toBe(false);
    expect(hospitalService.resetPassword).not.toHaveBeenCalled();
  });
});
