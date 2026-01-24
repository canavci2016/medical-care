import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateHospitalHairResultDto } from './dto/create-hospital-hair-result.dto';
import { UpdateHospitalHairResultDto } from './dto/update-hospital-hair-result.dto';
import { HospitalHairResult } from './entities/hospital-hair-result.entity';

@Injectable()
export class HospitalHairResultService {
  constructor(
    @InjectRepository(HospitalHairResult)
    private readonly hospitalHairResultRepository: Repository<HospitalHairResult>,
  ) { }

  async create(
    createHospitalHairResultDto: CreateHospitalHairResultDto,
  ): Promise<HospitalHairResult> {
    const result = this.hospitalHairResultRepository.create(
      createHospitalHairResultDto,
    );
    return this.hospitalHairResultRepository.save(result);
  }

  async findAll(): Promise<HospitalHairResult[]> {
    return this.hospitalHairResultRepository.find({});
  }

  async findOne(id: string): Promise<HospitalHairResult> {
    const result = await this.hospitalHairResultRepository.findOne({
      where: { id },
      relations: ['hospital', 'doctor'],
    });
    if (!result) {
      throw new NotFoundException(
        `HospitalHairResult with ID "${id}" not found`,
      );
    }
    return result;
  }

  async findBy(
    criteria: Partial<Pick<HospitalHairResult, 'doctorId' | 'hospitalId'>>,
  ): Promise<HospitalHairResult[]> {
    return this.hospitalHairResultRepository.find({
      where: criteria,
    });
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
