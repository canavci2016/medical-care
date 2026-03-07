/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { DoctorService } from '../doctor/doctor.service';
import { HospitalService } from '../hospital/hospital.service';
import { CreateDoctorDto } from '../doctor/dto/create-doctor.dto';
import { UpdateDoctorDto } from '../doctor/dto/update-doctor.dto';
import { buildPagination } from './pagination.util';

@Controller('admin/doctors')
export class AdminDoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly hospitalService: HospitalService,
  ) {}

  @Get()
  async findAll(@Res() res: Response, @Query('page') page?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const currentPage = Number.isNaN(pageNumber) ? 1 : pageNumber;
    const limit = 20;

    const [doctors, total] = await Promise.all([
      this.doctorService.findAll({
        skip: (currentPage - 1) * limit,
        take: limit,
      }),
      this.doctorService.count(),
    ]);

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      total,
      length: doctors.length,
      page: currentPage,
      limit,
      totalPages,
      hasPrev: currentPage > 1,
      hasNext: currentPage < totalPages,
      prevPage: currentPage - 1,
      nextPage: currentPage + 1,
    };

    const hospitals = await this.hospitalService.findAll({
      id: doctors
        .map((doctor) => doctor.hospitalId)
        .filter(Boolean) as string[],
      take: doctors.length || 10,
    });

    const mappedDoctors = doctors.map((doctor) => ({
      ...doctor,
      hospitalName:
        hospitals.find((hospital) => hospital.id === doctor.hospitalId)?.name ||
        '-',
    }));

    const newPagination = buildPagination(pagination, { page });

    return res.render('admin/doctors', {
      doctors: mappedDoctors,
      pagination: newPagination,
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Get('create')
  async createForm(@Res() res: Response) {
    const hospitals = await this.hospitalService.findAll({ take: 200 });

    return res.render('admin/create-doctor', {
      hospitals,
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Get(':id/detail')
  async detailPage(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const doctor = await this.doctorService.findOne(id);
    const hospitals = await this.hospitalService.findAll({ take: 200 });

    return res.render('admin/doctor-detail', {
      doctor,
      hospitals,
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Post()
  async create(@Body() payload: CreateDoctorDto) {
    return this.doctorService.create(payload);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateDoctorDto,
  ) {
    return this.doctorService.update(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.doctorService.remove(id);
    return { success: true };
  }
}
