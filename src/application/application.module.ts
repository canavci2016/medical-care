import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HospitalModule } from './modules/hospital/hospital.module';
import { DoctorModule } from './modules/doctor/doctor.module';
import { HospitalHairResultModule } from './modules/hospital-hair-result/hospital-hair-result.module';
import { SiteModule } from './modules/site/site.module';
import { BlogModule } from './modules/blog/blog.module';
import { SeederModule } from './shared/seeder/seeder.module';
import { AwsModule } from './shared/modules/aws/aws.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
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
    SeederModule,
    AwsModule,
  ],

  controllers: [],
  providers: [],
})
export class ApplicationModule {}
