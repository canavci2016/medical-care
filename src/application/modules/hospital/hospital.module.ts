import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './hospital.service';
import { Hospital } from './entities/hospital.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Hospital])],
  controllers: [HospitalController],
  providers: [HospitalService],
  exports: [HospitalService],
})
export class HospitalModule {}
