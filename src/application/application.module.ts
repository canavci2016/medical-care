import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalModule } from './modules/hospital/hospital.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { HospitalHairResultModule } from './modules/hospital-hair-result/hospital-hair-result.module';
import { SiteModule } from './modules/site/site.module';
import { BlogModule } from './modules/blog/blog.module';
import { CountryModule } from './shared/modules/country/country.module';
import { SeederModule } from './shared/seeder/seeder.module';
import { AwsModule } from './shared/modules/aws/aws.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronjobModule } from './shared/modules/cronjob/cronjob.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        stores: [
          new KeyvRedis(
            configService.get('REDIS_URL', 'redis://localhost:6379'),
          ),
        ],
      }),
      inject: [ConfigService],
    }),
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
    SeederModule,
    AwsModule,
    CronjobModule,
  ],

  controllers: [],
  providers: [],
})
export class ApplicationModule {}
