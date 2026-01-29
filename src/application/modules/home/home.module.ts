import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { HospitalModule } from '../hospital/hospital.module';
import { DoctorModule } from '../doctor/doctor.module';
import { HospitalHairResultModule } from '../hospital-hair-result/hospital-hair-result.module';
import { HospitalHairResultController } from './hospital-hair-result.controller';

@Module({
  imports: [HospitalModule, DoctorModule, HospitalHairResultModule],
  controllers: [HomeController, HospitalHairResultController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule { }
