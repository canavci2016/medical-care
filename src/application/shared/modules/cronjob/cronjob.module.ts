import { Module } from '@nestjs/common';
import { CronjobService } from './cronjob.service';
import { HospitalModule } from 'src/application/modules/hospital/hospital.module';
import { HttpModule } from '@nestjs/axios';
import { HospitalHairResultModule } from 'src/application/modules/hospital-hair-result/hospital-hair-result.module';

@Module({
  imports: [HospitalModule, HttpModule, HospitalHairResultModule],
  providers: [CronjobService],
  exports: [CronjobService],
})
export class CronjobModule { }
