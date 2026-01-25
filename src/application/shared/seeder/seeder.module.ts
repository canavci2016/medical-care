import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Hospital } from '../../modules/hospital/entities/hospital.entity';
import { Doctor } from '../../modules/doctor/entities/doctor.entity';
import { HospitalHairResult } from '../../modules/hospital-hair-result/entities/hospital-hair-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hospital, Doctor, HospitalHairResult])],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
