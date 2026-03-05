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
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';
import { HospitalService } from '../hospital/hospital.service';
import { CreateHospitalHairResultDto } from '../hospital-hair-result/dto/create-hospital-hair-result.dto';
import { UpdateHospitalHairResultDto } from '../hospital-hair-result/dto/update-hospital-hair-result.dto';
import { HairProcedureType } from '../hospital-hair-result/entities/hospital-hair-result.entity';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { buildPagination } from './pagination.util';

@Controller('admin/hospital-hair-results')
export class AdminHospitalHairResultController {
  constructor(
    private readonly hospitalHairResultService: HospitalHairResultService,
    private readonly hospitalService: HospitalService,
  ) {}

  @Get()
  async findAll(@Res() res: Response, @Query('page') page?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;

    const { data: results, pagination } =
      await this.hospitalHairResultService.findAll({
        page: {
          page: Number.isNaN(pageNumber) ? 1 : pageNumber,
          limit: 20,
        },
        orderBy: 'operationDate',
        orderDirection: 'desc',
      });

    const hospitals = await this.hospitalService.findAll({
      id: results.map((result) => result.hospitalId),
      take: results.length || 10,
    });

    const mappedResults = results.map((result) => ({
      ...result,
      hospitalName:
        hospitals.find((hospital) => hospital.id === result.hospitalId)?.name ||
        '-',
    }));

    const newPagination = buildPagination(pagination, { page });

    return res.render('admin/hospital-hair-results', {
      results: mappedResults,
      pagination: newPagination,
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Get('create')
  async createForm(@Res() res: Response) {
    const hospitals = await this.hospitalService.findAll({
      take: 200,
    });

    return res.render('admin/create-hospital-hair-result', {
      hospitals,
      procedureTypes: Object.values(HairProcedureType),
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
    const result = await this.hospitalHairResultService.findOne(id);
    const hospitals = await this.hospitalService.findAll({
      take: 200,
    });

    return res.render('admin/hospital-hair-result-detail', {
      result,
      hospitals,
      availableMonthsText: (result.availableMonths || []).join(','),
      procedureTypes: Object.values(HairProcedureType),
      techniques: Object.values(HairTransplantTechnique),
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Post()
  async create(@Body() payload: CreateHospitalHairResultDto) {
    return this.hospitalHairResultService.create(payload);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateHospitalHairResultDto,
  ) {
    return this.hospitalHairResultService.update(id, payload);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.hospitalHairResultService.remove(id);
    return { success: true };
  }
}
