import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
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
    const optionsTyped: FindManyOptions<Hospital> = {};
    optionsTyped.where = {};
    if (options.city) {
      optionsTyped.where['city'] = options.city;
    }
    if (options.rating) {
      if (options.rating === 5) {
        optionsTyped.where['rating'] = Between(5, 5.99);
      }
      if (options.rating === 4) {
        optionsTyped.where['rating'] = Between(4, 4.99);
      }
      if (options.rating === 3) {
        optionsTyped.where['rating'] = Between(3, 3.99);
      }
      if (options.rating === 2) {
        optionsTyped.where['rating'] = Between(2, 2.99);
      }
    }

    if (options.name) {
      optionsTyped.where['name'] = ILike(`%${options.name}%`);
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

  async update(id: string, updateHospitalDto: UpdateHospitalDto) {
    const hospital = await this.findOne(id);
    Object.assign(hospital, updateHospitalDto);
    return this.hospitalRepository.save(hospital);
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
