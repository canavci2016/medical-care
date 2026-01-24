import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { HospitalModule } from '../hospital/hospital.module';
import { DoctorModule } from '../doctor/doctor.module';
import { HospitalHairResultModule } from '../hospital-hair-result/hospital-hair-result.module';

@Module({
  imports: [HospitalModule, DoctorModule, HospitalHairResultModule],
  controllers: [HomeController],
  providers: [HomeService],
  exports: [HomeService],
})
export class HomeModule {}
