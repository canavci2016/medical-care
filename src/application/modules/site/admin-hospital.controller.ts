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
import { HospitalService } from '../hospital/hospital.service';
import { CreateHospitalDto } from '../hospital/dto/create-hospital.dto';
import { UpdateHospitalDto } from '../hospital/dto/update-hospital.dto';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { buildPagination } from './pagination.util';

@Controller('admin/hospitals')
export class AdminHospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Get()
  async findAll(@Res() res: Response, @Query('page') page?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;

    const { data: hospitals, pagination } = await this.hospitalService.paginated({
      page: {
        page: Number.isNaN(pageNumber) ? 1 : pageNumber,
        limit: 20,
      },
      orderBy: 'rating',
      orderDirection: 'desc',
    });

    const newPagination = buildPagination(pagination, { page });

    return res.render('admin/hospitals', {
      hospitals,
      pagination: newPagination,
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Get('create')
  createForm(@Res() res: Response) {
    return res.render('admin/create-hospital', {
      techniques: Object.values(HairTransplantTechnique),
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Get(':id/detail')
  async detailPage(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const hospital = await this.hospitalService.findOne(id);

    return res.render('admin/hospital-detail', {
      hospital,
      techniques: Object.values(HairTransplantTechnique),
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Post()
  async create(@Body() payload: CreateHospitalDto) {
    return this.hospitalService.create(payload);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateHospitalDto,
  ) {
    return this.hospitalService.update(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.hospitalService.remove(id);
    return { success: true };
  }
}
