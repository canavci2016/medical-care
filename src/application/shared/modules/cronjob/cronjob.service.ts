import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GooglePlaceService } from 'src/application/core/google/google-place.service';
import { HospitalService } from 'src/application/modules/hospital/hospital.service';

@Injectable()
export class CronjobService {
  private readonly logger = new Logger(CronjobService.name);
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly googlePlaceService: GooglePlaceService,
  ) {}

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
}
