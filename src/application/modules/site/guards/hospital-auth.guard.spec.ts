import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HospitalAuthGuard } from './hospital-auth.guard';

jest.mock('../../hospital/hospital.service', () => ({
  HospitalService: class HospitalService {},
}));

describe('HospitalAuthGuard', () => {
  let guard: HospitalAuthGuard;
  let hospitalService: { getPasswordVersion: jest.Mock };

  beforeEach(() => {
    hospitalService = {
      getPasswordVersion: jest.fn().mockResolvedValue('current-version'),
    };
    guard = new HospitalAuthGuard(hospitalService as never);
  });

  const createContext = (session: Record<string, unknown>) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ session }),
      }),
    }) as ExecutionContext;

  it('allows sessions with the current hospital auth version', async () => {
    const request = {
      session: {
        hospitalId: 'hospital-id',
        hospitalAuthVersion: 'current-version',
      },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.hospitalId).toBe('hospital-id');
  });

  it('rejects sessions created before a password reset', async () => {
    await expect(
      guard.canActivate(
        createContext({
          hospitalId: 'hospital-id',
          hospitalAuthVersion: 'old-version',
        }),
      ),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects sessions without a recorded auth version', async () => {
    await expect(
      guard.canActivate(createContext({ hospitalId: 'hospital-id' })),
    ).rejects.toThrow(UnauthorizedException);
  });
});
