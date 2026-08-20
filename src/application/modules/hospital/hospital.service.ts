import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  DataSource,
  EntityTarget,
  FindManyOptions,
  ILike,
  In,
  IsNull,
  Not,
  Repository,
} from 'typeorm';
import { Hospital } from './entities/hospital.entity';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';
import { Query } from 'src/application/shared/interfaces/query.interface';
import { GooglePlaceService } from 'src/application/core/google/google-place.service';

export interface Pagination {
  page?: number;
  limit?: number;
}

export interface Filter {
  gt?: number;

  gte?: number;

  lt?: number;

  lte?: number;
}

@Injectable()
export class HospitalService {
  constructor(
    @InjectRepository(Hospital)
    private readonly hospitalRepository: Repository<Hospital>,
    private readonly googlePlaceService: GooglePlaceService,
  ) { }

  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    const hospital = this.hospitalRepository.create(createHospitalDto);
    const createdHosp = await this.hospitalRepository.save(hospital);

    return createdHosp;
  }

  async findAll(
    params: Partial<{
      skip: number;
      take: number;
      id: string | string[];
      googlePlaceId: Query;
    }> = {},
  ): Promise<Hospital[]> {
    const payload = {};

    if (params.id) {
      const idAttr = Array.isArray(params.id) ? params.id : [params.id];
      payload['id'] = In(idAttr);
    }

    if (params.googlePlaceId?.notNull) {
      payload['googlePlaceId'] = Not(IsNull());
    }

    return this.hospitalRepository.find({
      where: payload,
      skip: params.skip || 0,
      take: params.take || 10,
      order: { createdAt: 'DESC' },
    });
  }

  async paginated(
    options: Partial<{
      rating: number;
      city: string;
      name: string;
      page: Pagination;
      orderBy: string;
      orderDirection: 'asc' | 'desc';
    }> = {},
  ) {
    const queryBuilder = this.hospitalRepository.createQueryBuilder('hospital');

    queryBuilder.addSelect(
      '(select count(*) from hospital_hair_results as hhr where "hhr"."hospitalId" = hospital.id)',
      'procedureCount',
    );

    if (options.city) {
      queryBuilder.andWhere('hospital.city = :city', { city: options.city });
    }
    if (options.rating) {
      if (options.rating === 5) {
        queryBuilder.andWhere('hospital.rating >= :rating', { rating: 5 });
      }
      if (options.rating === 4) {
        queryBuilder.andWhere(
          'hospital.rating >= :rating AND hospital.rating < :nextRating',
          {
            rating: 4,
            nextRating: 4.99,
          },
        );
      }
      if (options.rating === 3) {
        queryBuilder.andWhere(
          'hospital.rating >= :rating AND hospital.rating < :nextRating',
          {
            rating: 3,
            nextRating: 3.99,
          },
        );
      }
      if (options.rating === 2) {
        queryBuilder.andWhere(
          'hospital.rating >= :rating AND hospital.rating < :nextRating',
          {
            rating: 2,
            nextRating: 2.99,
          },
        );
      }
    }

    if (options.name) {
      queryBuilder.andWhere('hospital.name ILIKE :name', {
        name: `%${options.name}%`,
      });
    }

    const page = options.page?.page || 1;
    const limit = options.page?.limit || 10;

    if (options.orderBy) {
      const direction = (options.orderDirection || 'ASC').toUpperCase() as
        | 'ASC'
        | 'DESC';
      queryBuilder.orderBy(`hospital.${options.orderBy}`, direction);
    }

    queryBuilder.skip((page - 1) * limit).take(limit);

    const total = await queryBuilder.getCount();
    const items = await queryBuilder.getRawMany();

    const totalPages = Math.ceil(total / limit);

    const formattedItems = items.map((item) => {
      const obj = {};

      for (const key in item) {
        if (key.startsWith('hospital_')) {
          const newKey = key.replace('hospital_', '');
          obj[newKey] = item[key];
        } else {
          obj[key] = item[key];
        }
      }

      return obj as Hospital;
    });

    return {
      data: formattedItems,
      pagination: {
        total,
        length: formattedItems.length,
        page: page,
        limit: limit,
        totalPages: totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevPage: page - 1,
        nextPage: page + 1,
      },
    };
  }

  async findOne(id: string): Promise<Hospital> {
    const hospital = await this.hospitalRepository.findOne({ where: { id } });
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID "${id}" not found`);
    }
    return hospital;
  }

  async update(id: string, updateHospitalDto: UpdateHospitalDto) {
    if (updateHospitalDto.googlePlaceId) {
      const details = await this.googlePlaceService.getPlaceDetails(
        updateHospitalDto.googlePlaceId,
      );
      updateHospitalDto.rating = details.rating;
      updateHospitalDto.reviewCount = details.userRatingCount;
      updateHospitalDto.address = details.formattedAddress;
      updateHospitalDto.name = details.displayName?.text || '';
      updateHospitalDto.website = details.websiteUri;
      updateHospitalDto.phone = details.internationalPhoneNumber;
      updateHospitalDto.weekDayOpenings =
        details.regularOpeningHours?.weekdayDescriptions || [];
      updateHospitalDto.directionsUri =
        details.googleMapsLinks?.directionsUri || undefined;
      updateHospitalDto.reviewUri =
        details.googleMapsLinks?.reviewsUri || undefined;
      updateHospitalDto.reviews =
        details.reviews?.map((r) => ({
          authorName: r.authorAttribution.displayName,
          authorPhoto: r.authorAttribution.photoUri,
          comment: r.originalText?.text || '',
          publishTime: r.publishTime,
          rating: r.rating,
        })) || [];
    }

    const hospital = await this.findOne(id);
    Object.assign(hospital, updateHospitalDto);
    const updatedHospital = await this.hospitalRepository.save(hospital);

    return updatedHospital;
  }

  async remove(id: string): Promise<void> {
    const hospital = await this.findOne(id);
    await this.hospitalRepository.remove(hospital);
  }

  async getCities() {
    const result: { city: string; count: number }[] =
      await this.hospitalRepository
        .createQueryBuilder('hr')
        .select('hr.city', 'city')
        .addSelect('COUNT(*)', 'count')
        .groupBy('hr.city')
        .getRawMany();
    return result;
  }
}
