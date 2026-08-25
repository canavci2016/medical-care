import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Like, Not, Repository } from 'typeorm';
import { HospitalHairResultImage } from './entities/hospital-hair-result-image.entity';
import { Query } from 'src/application/shared/interfaces/query.interface';
import { Pagination } from 'src/application/shared/interfaces/pagination.interface';

@Injectable()
export class HospitalHairResultImageService {
  constructor(
    @InjectRepository(HospitalHairResultImage)
    private readonly hospitalHairResultImageRepository: Repository<HospitalHairResultImage>,
  ) {}

  async findAll(
    options: Partial<{
      page: Required<Pagination>;
      id: Query<HospitalHairResultImage['id']>;
      imageUrl: Query<HospitalHairResultImage['imageUrl']>;
    }>,
  ) {
    const optionsTyped: FindManyOptions<HospitalHairResultImage> = {
      where: {},
    };

    const page = options.page?.page || 1;
    const limit = options.page?.limit || 10;

    if (options.imageUrl?.notLike) {
      optionsTyped.where = {
        ...optionsTyped.where,
        imageUrl: Not(Like(`%${options.imageUrl.notLike}%`)),
      };
    }

    optionsTyped.skip = (page - 1) * limit;
    optionsTyped.take = limit;

    return this.hospitalHairResultImageRepository.findAndCount(optionsTyped);
  }

  async findOne(id: string): Promise<HospitalHairResultImage> {
    const image = await this.hospitalHairResultImageRepository.findOne({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException(
        `HospitalHairResultImage with ID "${id}" not found`,
      );
    }

    return image;
  }

  async update(
    id: string,
    updateHospitalHairResultImage: Partial<
      Pick<
        HospitalHairResultImage,
        | 'resultId'
        | 'imageUrl'
        | 'month'
        | 'isBefore'
        | 'isAfter'
        | 'angle'
        | 'lighting'
        | 'watermarked'
      >
    >,
  ): Promise<HospitalHairResultImage> {
    const image = await this.findOne(id);

    Object.assign(image, updateHospitalHairResultImage);

    return this.hospitalHairResultImageRepository.save(image);
  }
}
