import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository, MoreThan, MoreThanOrEqual } from 'typeorm';
import { CreateHospitalHairResultDto } from './dto/create-hospital-hair-result.dto';
import { UpdateHospitalHairResultDto } from './dto/update-hospital-hair-result.dto';
import {
  HairProcedureType,
  HospitalHairResult,
} from './entities/hospital-hair-result.entity';
import { HospitalHairResultImage } from './entities/hospital-hair-result-image.entity';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';

export interface Filter {
  gt?: number;

  gte?: number;

  lt?: number;

  lte?: number;
}

export interface Pagination {
  page: number;
  limit: number;
}

@Injectable()
export class HospitalHairResultService {
  constructor(
    @InjectRepository(HospitalHairResult)
    private readonly hospitalHairResultRepository: Repository<HospitalHairResult>,
    @InjectRepository(HospitalHairResultImage)
    private readonly hospitalHairResultImageRepository: Repository<HospitalHairResultImage>,
  ) { }

  async create(
    createHospitalHairResultDto: CreateHospitalHairResultDto,
  ): Promise<HospitalHairResult> {
    const result = this.hospitalHairResultRepository.create(
      createHospitalHairResultDto,
    );
    return this.hospitalHairResultRepository.save(result);
  }

  async findAll(
    options: Partial<{
      hospitalId: string;
      procedureType: string | Filter;
      technique: string | Filter;
      graftCount: Pick<Filter, 'gte'>;
      verified?: boolean;
      page: Pagination;
      orderBy: string;
      orderDirection: 'asc' | 'desc';
      ageRange: string;
    }> = {},
  ) {
    const optionsTyped: FindManyOptions<HospitalHairResult> = {
      where: {},
    };

    if (options.procedureType) {
      optionsTyped.where = {
        ...optionsTyped.where,
        procedureType: options.procedureType as HairProcedureType,
      };
    }
    if (options.technique) {
      optionsTyped.where = {
        ...optionsTyped.where,
        technique: options.technique as HairTransplantTechnique,
      };
    }

    if (options.verified !== undefined) {
      optionsTyped.where = {
        ...optionsTyped.where,
        verified: options.verified,
      };
    }

    if (options.graftCount?.gte) {
      optionsTyped.where = {
        ...optionsTyped.where,
        graftCount: MoreThanOrEqual(options.graftCount.gte),
      };
    }

    if (options.ageRange) {
      optionsTyped.where = {
        ...optionsTyped.where,
        patientAgeRange: options.ageRange,
      };
    }

    if (options.hospitalId) {
      optionsTyped.where = {
        ...optionsTyped.where,
        hospitalId: options.hospitalId,
      };
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

    const [results, total] =
      await this.hospitalHairResultRepository.findAndCount({
        ...optionsTyped,
      });

    const images = await this.hospitalHairResultImageRepository.find({
      where: { resultId: In(results.map((r) => r.id)) },
    });

    const items = results.map((result) => ({
      ...result,
      images: images.filter((img) => img.resultId === result.id),
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: items,
      pagination: {
        total,
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

  async getAgeRanges() {
    const result: { ageRange: string; count: number }[] =
      await this.hospitalHairResultRepository
        .createQueryBuilder('hr')
        .select('hr.patientAgeRange', 'ageRange')
        .addSelect('COUNT(*)', 'count')
        .groupBy('hr.patientAgeRange')
        .getRawMany();
    return result;
  }

  async getProcedureTypes(conditios?: { hospitalId?: string | string[] }) {
    let query = this.hospitalHairResultRepository
      .createQueryBuilder('hr')
      .select('hr.procedureType', 'procedureType')
      .addSelect('COUNT(*)', 'count');

    if (conditios?.hospitalId) {
      const hospitalIds = Array.isArray(conditios.hospitalId)
        ? conditios.hospitalId
        : [conditios.hospitalId];
      query = query.where('hr.hospitalId IN (:...hospitalIds)', {
        hospitalIds,
      });
    }

    const result: { procedureType: string; count: string }[] = await query
      .groupBy('hr.procedureType')
      .getRawMany();
    return result;
  }

  async findOne(id: string): Promise<HospitalHairResult> {
    const result = await this.hospitalHairResultRepository.findOne({
      where: { id },
      relations: ['images'],
    });
    if (!result) {
      throw new NotFoundException(
        `HospitalHairResult with ID "${id}" not found`,
      );
    }
    return result;
  }

  async update(
    id: string,
    updateHospitalHairResultDto: UpdateHospitalHairResultDto,
  ): Promise<HospitalHairResult> {
    const result = await this.findOne(id);
    Object.assign(result, updateHospitalHairResultDto);
    return this.hospitalHairResultRepository.save(result);
  }

  async remove(id: string): Promise<void> {
    const result = await this.findOne(id);
    await this.hospitalHairResultRepository.remove(result);
  }
}
