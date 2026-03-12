import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const session = request.session as unknown as
      | Record<string, unknown>
      | undefined;

    const adminToken =
      typeof session?.adminToken === 'string' ? session.adminToken : undefined;

    if (!adminToken) {
      throw new UnauthorizedException('Admin token is missing from session');
    }

    (request as Request & { adminToken?: string }).adminToken = adminToken;

    return true;
  }
}
