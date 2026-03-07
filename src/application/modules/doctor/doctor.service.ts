import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Doctor } from './entities/doctor.entity';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepository: Repository<Doctor>,
  ) { }

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    const doctor = this.doctorRepository.create(createDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async findAll(
    params: Partial<{ skip: number; take: number; id: string | string[] }> = {},
  ): Promise<Doctor[]> {
    const payload = {};

    if (params.id) {
      const idAttr = Array.isArray(params.id) ? params.id : [params.id];
      payload['id'] = In(idAttr);
    }

    return this.doctorRepository.find({
      where: payload,
      skip: params.skip || 0,
      take: params.take || 10,
    });
  }

  async paginated(
    options: Partial<{
      page: number;
      limit: number;
      orderBy: keyof Doctor;
      orderDirection: 'asc' | 'desc';
    }> = {},
  ): Promise<{
    data: Doctor[];
    pagination: {
      total: number;
      length: number;
      page: number;
      limit: number;
      totalPages: number;
      hasPrev: boolean;
      hasNext: boolean;
      prevPage: number;
      nextPage: number;
    };
  }> {
    const page = options.page || 1;
    const limit = options.limit || 20;

    const [items, total] = await this.doctorRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: options.orderBy
        ? { [options.orderBy]: options.orderDirection || 'ASC' }
        : undefined,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: items,
      pagination: {
        total,
        length: items.length,
        page,
        limit,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
        prevPage: page - 1,
        nextPage: page + 1,
      },
    };
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID "${id}" not found`);
    }
    return doctor;
  }

  async findByHospital(hospitalId: string): Promise<Doctor[]> {
    return this.doctorRepository.find({
      where: { hospitalId },
    });
  }

  async count(): Promise<number> {
    return this.doctorRepository.count();
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);
    Object.assign(doctor, updateDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async remove(id: string): Promise<void> {
    const doctor = await this.findOne(id);
    await this.doctorRepository.remove(doctor);
  }
}
