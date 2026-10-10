import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class HospitalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session as unknown as
      | Record<string, unknown>
      | undefined;

    const hospitalId =
      typeof session?.hospitalId === 'string' ? session.hospitalId : undefined;

    if (!hospitalId) {
      throw new UnauthorizedException('You must be logged in as a hospital');
    }

    (request as Request & { hospitalId?: string }).hospitalId = hospitalId;

    return true;
  }
}
