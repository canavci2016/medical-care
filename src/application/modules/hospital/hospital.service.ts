import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindManyOptions, In, Repository } from 'typeorm';
import { Hospital } from './entities/hospital.entity';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

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
  ) { }

  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    const hospital = this.hospitalRepository.create(createHospitalDto);
    return this.hospitalRepository.save(hospital);
  }

  async findAll(
    params: Partial<{ skip: number; take: number; id: string | string[] }> = {},
  ): Promise<Hospital[]> {
    const payload = {};

    if (params.id) {
      const idAttr = Array.isArray(params.id) ? params.id : [params.id];
      payload['id'] = In(idAttr);
    }

    return this.hospitalRepository.find({
      where: payload,
      skip: params.skip || 0,
      take: params.take || 10,
    });
  }

  async paginated(
    options: Partial<{
      rating: number;
      city: string;
      page: Pagination;
      orderBy: string;
      orderDirection: 'asc' | 'desc';
    }> = {},
  ) {
    const optionsTyped: FindManyOptions<Hospital> = {};
    optionsTyped.where = {};
    if (options.city) {
      optionsTyped.where['city'] = options.city;
    }
    if (options.rating) {
      if (options.rating === 4) {
        optionsTyped.where['rating'] = Between(4, 5);
      }
      if (options.rating === 3) {
        optionsTyped.where['rating'] = Between(3, 5);
      }
      if (options.rating === 2) {
        optionsTyped.where['rating'] = Between(2, 5);
      }
    }

    const page = options.page?.page || 1;
    const limit = options.page?.limit || 10;

    optionsTyped.skip = (page - 1) * limit;
    optionsTyped.take = limit;

    if (options.orderBy) {
      optionsTyped.order = {
        [options.orderBy]: options.orderDirection || 'ASC',
      };
    }

    const [items, total] = await this.hospitalRepository.findAndCount({
      ...optionsTyped,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: items,
      pagination: {
        total,
        length: items.length,
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
