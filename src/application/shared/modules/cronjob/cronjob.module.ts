import { Module } from '@nestjs/common';
import { CronjobService } from './cronjob.service';
import { HospitalModule } from 'src/application/modules/hospital/hospital.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HospitalModule, HttpModule],
  providers: [CronjobService],
  exports: [CronjobService],
})
export class CronjobModule {}
