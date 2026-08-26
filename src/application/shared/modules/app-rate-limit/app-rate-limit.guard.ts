import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Cache } from 'cache-manager';
import type { Request } from 'express';
import { APP_RATE_LIMIT_METADATA } from './app-rate-limit.constants';
import type { AppRateLimitOptions } from './app-rate-limit.interface';

@Injectable()
export class AppRateLimitGuard implements CanActivate {
  private readonly cacheManager: Cache;

  constructor(
    @Inject(CACHE_MANAGER) cacheManager: object,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    this.cacheManager = cacheManager as Cache;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<AppRateLimitOptions>(
      APP_RATE_LIMIT_METADATA,
      [context.getHandler(), context.getClass()],
    );

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest() as Request;
    const clientIp = this.getClientIp(request);
    const keyPrefix =
      options.keyPrefix ?? `${context.getClass().name}:${context.getHandler().name}`;
    const cacheKey = `rate-limit:${keyPrefix}:${clientIp}`;
    const maxAttempts = this.resolveMaxAttempts(options);
    const ttlSeconds = this.resolveTtlSeconds(options);
    const attempts = (await this.cacheManager.get<number>(cacheKey)) ?? 0;

    if (attempts >= maxAttempts) {
      throw new HttpException(
        options.message ?? 'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheManager.set(cacheKey, attempts + 1, ttlSeconds * 1000);

    return true;
  }

  private resolveMaxAttempts(options: AppRateLimitOptions): number {
    return Number(
      options.maxAttempts ??
        this.configService.get('RATE_LIMIT_MAX_ATTEMPTS', 5),
    );
  }

  private resolveTtlSeconds(options: AppRateLimitOptions): number {
    return Number(
      options.ttlSeconds ??
        this.configService.get('RATE_LIMIT_TTL_SECONDS', 300),
    );
  }

  private getClientIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];

    if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
      return forwardedFor[0].split(',')[0].trim();
    }

    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
      return forwardedFor.split(',')[0].trim();
    }

    return request.ip ?? 'unknown';
  }
}