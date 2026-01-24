import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalHairResultController } from './hospital-hair-result.controller';
import { HospitalHairResultService } from './hospital-hair-result.service';
import { HospitalHairResult } from './entities/hospital-hair-result.entity';
import { HospitalHairResultImage } from './entities/hospital-hair-result-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HospitalHairResult, HospitalHairResultImage]),
  ],
  controllers: [HospitalHairResultController],
  providers: [HospitalHairResultService],
  exports: [HospitalHairResultService],
})
export class HospitalHairResultModule {}
