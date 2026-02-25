import { Global, Module } from '@nestjs/common';
import { AwsS3Service } from './s3.service';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [],
  providers: [
    AwsS3Service,
    {
      provide: AwsS3Service,
      useFactory: (configService: ConfigService) =>
        new AwsS3Service({
          accessKeyId: configService.get('AWS_ACCESS_KEY_ID') as string,
          secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY') as string,
          region: configService.get('AWS_REGION') as string,
          bucket: configService.get('AWS_S3_BUCKET_NAME') as string,
        }),
      inject: [ConfigService],
    },
  ],
  exports: [AwsS3Service],
})
export class AwsModule {}
