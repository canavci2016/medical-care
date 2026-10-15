import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalService } from './hospital.service';
import { Hospital } from './entities/hospital.entity';
import { CountryModule } from 'src/application/shared/modules/country/country.module';
import { CityModule } from 'src/application/shared/modules/city/city.module';
import { AppQueueModule } from 'src/application/shared/modules/app-queue/app-queue.module';
import { HospitalPasswordResetService } from './hospital-password-reset.service';

@Module({
  imports: [
    CountryModule,
    CityModule,
    AppQueueModule,
    TypeOrmModule.forFeature([Hospital]),
  ],
  controllers: [],
  providers: [HospitalService, HospitalPasswordResetService],
  exports: [HospitalService, HospitalPasswordResetService],
})
export class HospitalModule {}
