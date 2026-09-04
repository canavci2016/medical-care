import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { Query } from '../../interfaces/query.interface';
import { StringHelper } from '../../helpers/String';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) { }

  async create(payload: Partial<City>): Promise<City> {
    const city = this.cityRepository.create(payload);
    return this.cityRepository.save(city);
  }

  async findAll(
    params: Partial<{
      skip: number;
      take: number;
      id: Query<string>;
      isActive: boolean;
    }> = {},
  ): Promise<City[]> {
    const where = {};

    if (params.id?.eq) {
      where['id'] = params.id.eq;
    } else if (params.id?.in) {
      where['id'] = In(params.id.in);
    }

    if (typeof params.isActive === 'boolean') {
      where['isActive'] = params.isActive;
    }

    return this.cityRepository.find({
      where,
      skip: params.skip || 0,
      take: params.take || 10,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<City> {
    const city = await this.cityRepository.findOne({ where: { id } });

    if (!city) {
      throw new NotFoundException(`City with ID "${id}" not found`);
    }

    return city;
  }

  async findOneBy(
    params: Partial<Pick<City, 'id' | 'name' | 'slug'>>,
  ): Promise<City> {
    const city = await this.cityRepository.findOneBy(params);

    if (!city) {
      throw new NotFoundException(`City not found`);
    }

    return city;
  }

  async update(id: string, payload: Partial<City>): Promise<City> {
    const city = await this.findOne(id);
    Object.assign(city, payload);
    return this.cityRepository.save(city);
  }

  async remove(id: string): Promise<void> {
    const city = await this.findOne(id);
    await this.cityRepository.remove(city);
  }

  async findCityOrCreate(name: string): Promise<City> {
    const normalizedName = name.trim();
    const lowerCaseName = normalizedName.toLowerCase();
    const slug = StringHelper.toSlug(lowerCaseName);

    let city = await this.cityRepository.findOne({
      where: [{ name: lowerCaseName }, { slug }],
    });

    if (!city) {
      city = await this.create({
        name: lowerCaseName,
        slug,
      });
    } else if (city && !city.slug) {
      city.slug = StringHelper.toSlug(city.name);
      await this.cityRepository.save(city);
    }

    return city;
  }
}
