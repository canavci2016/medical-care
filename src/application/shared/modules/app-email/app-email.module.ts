import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppEmailService } from './app-email.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AppEmailService],
  exports: [AppEmailService],
})
export class AppEmailModule {}
