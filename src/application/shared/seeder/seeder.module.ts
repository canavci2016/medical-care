import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { Hospital } from '../../modules/hospital/entities/hospital.entity';
import { Doctor } from '../../modules/doctor/entities/doctor.entity';
import { HospitalHairResult } from '../../modules/hospital-hair-result/entities/hospital-hair-result.entity';
import { HospitalHairResultImage } from '../../modules/hospital-hair-result/entities/hospital-hair-result-image.entity';
import { Blog } from '../../modules/blog/entities/blog.entity';
import { BlogCategory } from '../../modules/blog/entities/blog-category.entity';
import { Country } from '../modules/country/entities/country.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Hospital,
      Doctor,
      HospitalHairResult,
      HospitalHairResultImage,
      Blog,
      BlogCategory,
      Country,
    ]),
  ],
  providers: [SeederService],
  exports: [SeederService],
})
export class SeederModule {}
