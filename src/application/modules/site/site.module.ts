import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { HospitalModule } from '../hospital/hospital.module';
import { DoctorModule } from '../doctor/doctor.module';
import { HospitalHairResultModule } from '../hospital-hair-result/hospital-hair-result.module';
import { HospitalHairResultController } from './hospital-hair-result.controller';
import { HospitalController } from './hospital.controller';
import { BlogModule } from '../blog/blog.module';
import { BlogController } from './blog.controller';
import { OtherController } from './other.controller';
import { AdminBlogController } from './admin-blog.controller';
import { AdminBlogCategoryController } from './admin-blog-category.controller';

@Module({
  imports: [HospitalModule, DoctorModule, HospitalHairResultModule, BlogModule],
  controllers: [
    HomeController,
    HospitalHairResultController,
    HospitalController,
    BlogController,
    AdminBlogController,
    AdminBlogCategoryController,
    OtherController,
  ],
  providers: [HomeService],
  exports: [HomeService],
})
export class SiteModule {}
