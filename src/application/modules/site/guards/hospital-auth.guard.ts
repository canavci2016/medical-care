import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { HospitalService } from '../../hospital/hospital.service';

@Injectable()
export class HospitalAuthGuard implements CanActivate {
  constructor(private readonly hospitalService: HospitalService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session as unknown as
      | Record<string, unknown>
      | undefined;

    const hospitalId =
      typeof session?.hospitalId === 'string' ? session.hospitalId : undefined;
    const authVersion =
      typeof session?.hospitalAuthVersion === 'string'
        ? session.hospitalAuthVersion
        : undefined;

    if (!hospitalId || !authVersion) {
      throw new UnauthorizedException('You must be logged in as a hospital');
    }

    const currentAuthVersion =
      await this.hospitalService.getPasswordVersion(hospitalId);

    if (!currentAuthVersion || authVersion !== currentAuthVersion) {
      throw new UnauthorizedException('You must be logged in as a hospital');
    }

    (request as Request & { hospitalId?: string }).hospitalId = hospitalId;

    return true;
  }
}
