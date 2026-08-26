import { Module } from '@nestjs/common';
import { AppRateLimitGuard } from './app-rate-limit.guard';

@Module({
  providers: [AppRateLimitGuard],
  exports: [AppRateLimitGuard],
})
export class AppRateLimitModule {}