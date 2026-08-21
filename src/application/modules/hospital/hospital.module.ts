import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalService } from './hospital.service';
import { Hospital } from './entities/hospital.entity';
import { CountryModule } from 'src/application/shared/modules/country/country.module';
import { CityModule } from 'src/application/shared/modules/city/city.module';

@Module({
  imports: [CountryModule, CityModule, TypeOrmModule.forFeature([Hospital])],
  controllers: [],
  providers: [HospitalService],
  exports: [HospitalService],
})
export class HospitalModule {}
