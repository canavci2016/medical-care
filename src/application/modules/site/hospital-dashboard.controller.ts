import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';
import { DoctorService } from '../doctor/doctor.service';
import { CreateHospitalHairResultDto } from '../hospital-hair-result/dto/create-hospital-hair-result.dto';
import { UpdateHospitalHairResultDto } from '../hospital-hair-result/dto/update-hospital-hair-result.dto';
import { CreateDoctorDto } from '../doctor/dto/create-doctor.dto';
import { HairProcedureType } from '../hospital-hair-result/entities/hospital-hair-result.entity';
import { HairTransplantTechnique } from 'src/application/shared/enums/hairtransplant-techniques.enum';
import { TreatmentArea } from 'src/application/shared/enums/treatment-area.enum';
import { AwsS3Service } from 'src/application/shared/modules/aws/s3.service';
import { randomUUID } from 'node:crypto';
import { buildPagination } from './pagination.util';
import { HospitalAuthGuard } from './guards/hospital-auth.guard';

@UseGuards(HospitalAuthGuard)
@Controller('hospital/dashboard')
export class HospitalDashboardController {
  constructor(
    private readonly hospitalHairResultService: HospitalHairResultService,
    private readonly doctorService: DoctorService,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  /* ===============================
     HAIR RESULTS
  =============================== */

  @Get('hair-results')
  async hairResults(
    @Session() session: Record<string, any>,
    @Res() res: Response,
    @Query('page') page?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;

    const { data: results, pagination } =
      await this.hospitalHairResultService.findAll({
        hospitalId: session.hospitalId as string,
        page: {
          page: Number.isNaN(pageNumber) ? 1 : pageNumber,
          limit: 20,
        },
        orderBy: 'createdAt',
        orderDirection: 'desc',
      });

    const newPagination = buildPagination(pagination, { page });

    return res.render('hospital-hair-results', {
      results,
      pagination: newPagination,
      layout: false,
    });
  }

  @Get('hair-results/create')
  createHairResultForm(@Res() res: Response) {
    return res.render('hospital-create-hair-result', {
      procedureTypes: Object.values(HairProcedureType),
      techniques: Object.values(HairTransplantTechnique),
      treatmentAreas: Object.values(TreatmentArea),
      layout: false,
    });
  }

  @Post('hair-results')
  async createHairResult(
    @Session() session: Record<string, any>,
    @Body() payload: CreateHospitalHairResultDto,
  ) {
    return this.hospitalHairResultService.create({
      ...payload,
      hospitalId: session.hospitalId as string,
    });
  }

  @Get('hair-results/:id/detail')
  async hairResultDetail(
    @Session() session: Record<string, any>,
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    const result = await this.hospitalHairResultService.findOne(id);

    if (result.hospitalId !== session.hospitalId) {
      throw new ForbiddenException('You do not own this hair result');
    }

    return res.render('hospital-hair-result-detail', {
      result,
      availableMonthsText: (result.availableMonths || []).join(','),
      imageUrlsText: (result.images || [])
        .map((image) => image.imageUrl)
        .join(','),
      procedureTypes: Object.values(HairProcedureType),
      techniques: Object.values(HairTransplantTechnique),
      treatmentAreas: Object.values(TreatmentArea),
      layout: false,
    });
  }

  @Put('hair-results/:id')
  async updateHairResult(
    @Session() session: Record<string, any>,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() payload: UpdateHospitalHairResultDto,
  ) {
    const result = await this.hospitalHairResultService.findOne(id);

    if (result.hospitalId !== session.hospitalId) {
      throw new ForbiddenException('You do not own this hair result');
    }

    // Ignore any client-supplied hospitalId; ownership cannot be reassigned.
    delete payload.hospitalId;

    return this.hospitalHairResultService.update(id, payload);
  }

  @Post('hair-results/upload-url')
  async getHairResultUploadUrl(@Body('contentType') contentType: string) {
    return this.awsS3Service.getSignedUploadUrl(
      `uploads/results/${randomUUID()}`,
      contentType,
    );
  }

  /* ===============================
     DOCTORS
  =============================== */

  @Get('doctors')
  async doctors(
    @Session() session: Record<string, any>,
    @Res() res: Response,
    @Query('page') page?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;

    const { data: doctors, pagination } = await this.doctorService.paginated({
      hospitalId: session.hospitalId as string,
      page: Number.isNaN(pageNumber) ? 1 : pageNumber,
      limit: 20,
    });

    const newPagination = buildPagination(pagination, { page });

    return res.render('hospital-doctors', {
      doctors,
      pagination: newPagination,
      layout: false,
    });
  }

  @Get('doctors/create')
  createDoctorForm(@Res() res: Response) {
    return res.render('hospital-create-doctor', {
      layout: false,
    });
  }

  @Post('doctors')
  async createDoctor(
    @Session() session: Record<string, any>,
    @Body() payload: CreateDoctorDto,
  ) {
    return this.doctorService.create({
      ...payload,
      hospitalId: session.hospitalId as string,
    });
  }
}
