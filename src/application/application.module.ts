import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalModule } from './modules/hospital/hospital.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { HospitalHairResultModule } from './modules/hospital-hair-result/hospital-hair-result.module';
import { SiteModule } from './modules/site/site.module';
import { BlogModule } from './modules/blog/blog.module';
import { CountryModule } from './shared/modules/country/country.module';
import { CityModule } from './shared/modules/city/city.module';
import { SeederModule } from './shared/seeder/seeder.module';
import { AwsModule } from './shared/modules/aws/aws.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronjobModule } from './shared/modules/cronjob/cronjob.module';
import { GoogleModule } from './core/google/google.module';
import { AppQueueModule } from './shared/modules/app-queue/app-queue.module';
import { AppEmailModule } from './shared/modules/app-email/app-email.module';
import { RedisModule } from './core/redis/redis.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: configService.get('DB_SYNC_SCHEMA') === 'true',
        extra: {
          ssl:
            configService.get('DB_SSL') === 'true'
              ? { rejectUnauthorized: false }
              : undefined,
        },
        logging: configService.get('NODE_ENV') === 'local',
      }),
      inject: [ConfigService],
    }),
    HospitalModule,
    DoctorModule,
    HospitalHairResultModule,
    SiteModule,
    BlogModule,
    CountryModule,
    CityModule,
    SeederModule,
    AwsModule,
    CronjobModule,
    AppQueueModule,
    AppEmailModule,
    GoogleModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        apiKey: config.get<string>('GOOGLE_API_KEY', ''),
      }),
      inject: [ConfigService],
    }),
  ],

  controllers: [],
  providers: [],
})
export class ApplicationModule { }
