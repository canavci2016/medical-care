import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository, MoreThanOrEqual, Raw, Between } from 'typeorm';
import { CreateHospitalHairResultDto } from './dto/create-hospital-hair-result.dto';
import { UpdateHospitalHairResultDto } from './dto/update-hospital-hair-result.dto';
import {
  HairProcedureType,
  HospitalHairResult,
} from './entities/hospital-hair-result.entity';
import { HospitalHairResultImage } from './entities/hospital-hair-result-image.entity';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { instagramGetUrl } from 'instagram-url-direct';
import { Query } from 'src/application/shared/interfaces/query.interface';
import { Pagination } from 'src/application/shared/interfaces/pagination.interface';

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
    const fullImages: string[] = [];
    const { imageUrls, images, ...rest } =
      createHospitalHairResultDto as CreateHospitalHairResultDto & {
        imageUrls?: string[];
        images?: Array<{
          imageUrl: string;
          month?: number;
          isBefore?: boolean;
          isAfter?: boolean;
          angle?: string;
          lighting?: string;
          watermarked?: boolean;
        }>;
      };

    if (imageUrls) {
      fullImages.push(...imageUrls);
    }

    if (
      createHospitalHairResultDto.original_url?.includes('instagramdddd.com')
    ) {
      const data = await instagramGetUrl(
        createHospitalHairResultDto.original_url,
      );

      const urls =
        data.media_details
          ?.filter((m) => m.type == 'image')
          .map((m) => m.url) || [];

      fullImages.push(...urls);
    }

    const result = this.hospitalHairResultRepository.create(rest);
    const savedResult = await this.hospitalHairResultRepository.save(result);

    const imagesToSave =
      images?.map((img) => ({
        resultId: savedResult.id,
        imageUrl: img.imageUrl,
        month: img.month ?? savedResult.monthsAfter ?? 0,
        isBefore: img.isBefore ?? false,
        isAfter: img.isAfter ?? true,
        angle: img.angle,
        lighting: img.lighting,
        watermarked: img.watermarked ?? false,
      })) ??
      fullImages?.map((imageUrl) => ({
        resultId: savedResult.id,
        imageUrl,
        month: savedResult.monthsAfter || 0,
        isAfter: true,
        isBefore: false,
      }));

    if (imagesToSave?.length) {
      const imagesToCreate =
        this.hospitalHairResultImageRepository.create(imagesToSave);
      await this.hospitalHairResultImageRepository.save(imagesToCreate);
    }

    return this.findOne(savedResult.id);
  }

  async bulkCreate(
    createHospitalHairResultInBulkDto: CreateHospitalHairResultDto[],
  ): Promise<HospitalHairResult[]> {
    const results: HospitalHairResult[] = [];
    for (const dto of createHospitalHairResultInBulkDto) {
      const result = await this.create(dto);
      results.push(result);
    }
    return results;
  }

  async findAll(
    options: Partial<{
      hospitalId: string | string[];
      procedureType: string | Query;
      technique: string | Query;
      graftCount: Pick<Query, 'gte'>;
      verified?: boolean;
      page: Required<Pagination>;
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
      const highestGraftCount = options.graftCount.gte + 999;
      optionsTyped.where = {
        ...optionsTyped.where,
        graftCount: Between(options.graftCount.gte, highestGraftCount),
      };
    }

    if (options.ageRange) {
      optionsTyped.where = {
        ...optionsTyped.where,
        patientAgeRange: options.ageRange,
      };
    }

    if (options.hospitalId) {
      const hospitalIds = Array.isArray(options.hospitalId)
        ? options.hospitalId
        : [options.hospitalId];
      optionsTyped.where = {
        ...optionsTyped.where,
        hospitalId: In(hospitalIds),
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

    const [items, total] = await this.hospitalHairResultRepository.findAndCount(
      {
        ...optionsTyped,
        relations: ['images', 'hospital'],
      },
    );

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
      relations: ['images', 'hospital'],
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
    const { imageUrls, images, ...rest } =
      updateHospitalHairResultDto as UpdateHospitalHairResultDto & {
        imageUrls?: string[];
        images?: Array<{
          imageUrl: string;
          month?: number;
          isBefore?: boolean;
          isAfter?: boolean;
          angle?: string;
          lighting?: string;
          watermarked?: boolean;
        }>;
      };

    const result = await this.findOne(id);
    Object.assign(result, rest);
    await this.hospitalHairResultRepository.save(result);

    if (imageUrls !== undefined || images !== undefined) {
      await this.hospitalHairResultImageRepository.delete({ resultId: id });

      const imagesToSave =
        images?.map((img) => ({
          resultId: id,
          imageUrl: img.imageUrl,
          month: img.month ?? result.monthsAfter ?? 0,
          isBefore: img.isBefore ?? false,
          isAfter: img.isAfter ?? true,
          angle: img.angle,
          lighting: img.lighting,
          watermarked: img.watermarked ?? false,
        })) ??
        imageUrls?.map((imageUrl) => ({
          resultId: id,
          imageUrl,
          month: result.monthsAfter || 0,
          isAfter: true,
          isBefore: false,
        }));

      if (imagesToSave && imagesToSave.length > 0) {
        const imagesToCreate =
          this.hospitalHairResultImageRepository.create(imagesToSave);
        await this.hospitalHairResultImageRepository.save(imagesToCreate);
      }
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.findOne(id);
    await this.hospitalHairResultRepository.remove(result);
  }
}
