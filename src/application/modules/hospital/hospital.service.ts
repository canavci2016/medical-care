import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository } from 'typeorm';
import { Hospital } from './entities/hospital.entity';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

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

  async findOne(id: string): Promise<Hospital> {
    const hospital = await this.hospitalRepository.findOne({ where: { id } });
    if (!hospital) {
      throw new NotFoundException(`Hospital with ID "${id}" not found`);
    }
    return hospital;
  }

  async update(
    id: string,
    updateHospitalDto: UpdateHospitalDto,
  ): Promise<Hospital> {
    const hospital = await this.findOne(id);
    Object.assign(hospital, updateHospitalDto);
    return this.hospitalRepository.save(hospital);
  }

  async remove(id: string): Promise<void> {
    const hospital = await this.findOne(id);
    await this.hospitalRepository.remove(hospital);
  }
}
