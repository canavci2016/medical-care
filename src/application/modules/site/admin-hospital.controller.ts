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
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { HospitalService } from '../hospital/hospital.service';
import { CreateHospitalDto } from '../hospital/dto/create-hospital.dto';
import { UpdateHospitalDto } from '../hospital/dto/update-hospital.dto';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { buildPagination } from './pagination.util';
import { AwsS3Service } from 'src/application/shared/modules/aws/s3.service';
import { randomUUID } from 'node:crypto';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@UseGuards(AdminAuthGuard)
@Controller('admin/hospitals')
export class AdminHospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  @Get()
  async findAll(@Res() res: Response, @Query('page') page?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;

    const { data: hospitals, pagination } =
      await this.hospitalService.paginated({
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
    const techniquesOptions = Object.values(HairTransplantTechnique).map(
      (value) => ({
        value,
        selected: false,
      }),
    );

    return res.render('admin/create-hospital', {
      techniquesOptions,
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
    const selectedTechniques = hospital.techniques || [];
    const techniquesOptions = Object.values(HairTransplantTechnique).map(
      (value) => ({
        value,
        selected: selectedTechniques.includes(value),
      }),
    );

    return res.render('admin/hospital-detail', {
      hospital,
      techniquesOptions,
      styles: ['create-blog.css'],
      layout: false,
    });
  }

  @Post()
  async create(@Body() payload: CreateHospitalDto) {
    return this.hospitalService.create(payload);
  }

  @Post('upload-url')
  async getUploadUrl(@Body('contentType') contentType: string) {
    return this.awsS3Service.getSignedUploadUrl(
      `uploads/hospitals/${randomUUID()}`,
      contentType,
    );
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
