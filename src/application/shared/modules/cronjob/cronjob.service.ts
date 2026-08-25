import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GooglePlaceService } from 'src/application/core/google/google-place.service';
import { HospitalHairResultImageService } from 'src/application/modules/hospital-hair-result/hospital-hair-result-image.service';
import { HospitalService } from 'src/application/modules/hospital/hospital.service';
import { AwsS3Service } from 'src/application/shared/modules/aws/s3.service';

@Injectable()
export class CronjobService {
  private readonly logger = new Logger(CronjobService.name);
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly awsS3Service: AwsS3Service,
    private readonly googlePlaceService: GooglePlaceService,
    private readonly hospitalHairResultImageService: HospitalHairResultImageService,
  ) { }

  logInitialization(): void {
    this.logger.debug('CronjobService initialized');
  }

  @Cron('0 23 * * *')
  async readHospitalReviews() {
    this.logger.debug('Running readHospitalReviews cron job');
    const limit = 10;
    let offset = 0;

    while (true) {
      const hospitals = await this.hospitalService.findAll({
        skip: offset,
        take: limit,
        googlePlaceId: { notNull: true },
      });
      if (hospitals.length === 0) {
        break;
      }

      for (const hospital of hospitals) {
        if (!hospital.googlePlaceId) {
          this.logger.warn(
            `Hospital ${hospital.name} does not have a googlePlaceId, skipping...`,
          );
          continue;
        }

        const data = await this.googlePlaceService.getPlaceDetails(
          hospital.googlePlaceId,
        );

        await this.hospitalService.update(hospital.id, {
          rating: data.rating,
          reviewCount: data.userRatingCount,
          address: data.formattedAddress,
          website: data.websiteUri,
          name: data.displayName.text,
        });

        this.logger.debug(
          `Processing hospital: ${hospital.name} with rating ${hospital.rating}`,
        );
        // Here you can add logic to read and process reviews for each hospital
      }

      offset += limit;
    }
  }

  @Cron('*/10 * * * *')
  async uploadHairResultImagesToS3() {
    this.logger.debug('Running uploadHairResultImagesToS3 cron job');
    const baseS3Url = this.awsS3Service.getBaseS3Url();
    const [images, count] = await this.hospitalHairResultImageService.findAll({
      page: { page: 1, limit: 50 },
      imageUrl: {
        notLike: baseS3Url,
      },
    });
    this.logger.debug('number of total images to be uploaded: ' + count);

    for (const image of images) {
      const uploadedImageUrl = await this.awsS3Service.downloadAndUploadToS3(
        image.imageUrl,
        this.hospitalService.getSignedImageUrl(),
      );

      const updatedImage = await this.hospitalHairResultImageService.update(
        image.id,
        { imageUrl: uploadedImageUrl },
      );
      // Here you can add logic to upload images to S3
      this.logger.debug(`Uploading image: ${image.imageUrl}`);
    }
  }
}
