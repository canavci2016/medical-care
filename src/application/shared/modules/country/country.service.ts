import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Country } from './entities/country.entity';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async create(payload: Partial<Country>): Promise<Country> {
    const country = this.countryRepository.create(payload);
    return this.countryRepository.save(country);
  }

  async findAll(
    params: Partial<{ skip: number; take: number; id: string | string[] }> = {},
  ): Promise<Country[]> {
    const where = {};

    if (params.id) {
      const idList = Array.isArray(params.id) ? params.id : [params.id];
      where['id'] = In(idList);
    }

    return this.countryRepository.find({
      where,
      skip: params.skip || 0,
      take: params.take || 10,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Country> {
    const country = await this.countryRepository.findOne({ where: { id } });

    if (!country) {
      throw new NotFoundException(`Country with ID "${id}" not found`);
    }

    return country;
  }

  async update(id: string, payload: Partial<Country>): Promise<Country> {
    const country = await this.findOne(id);
    Object.assign(country, payload);
    return this.countryRepository.save(country);
  }

  async remove(id: string): Promise<void> {
    const country = await this.findOne(id);
    await this.countryRepository.remove(country);
  }
}
