import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CityService } from './city.service';
import { City } from './entities/city.entity';

@Module({
  imports: [TypeOrmModule.forFeature([City])],
  controllers: [],
  providers: [CityService],
  exports: [CityService],
})
export class CityModule {}
