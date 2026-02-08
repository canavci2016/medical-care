import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Res,
} from '@nestjs/common';
import { HospitalService } from '../hospital/hospital.service';
import { CreateHospitalDto } from '../hospital/dto/create-hospital.dto';
import { UpdateHospitalDto } from '../hospital/dto/update-hospital.dto';
import type { Response } from 'express';
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';
import { parse } from 'path';

@Controller('hospitals')
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly hospitalHairResultService: HospitalHairResultService,
  ) { }

  @Post()
  create(@Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalService.create(createHospitalDto);
  }

  @Get()
  findAll() {
    return this.hospitalService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {

    const hospital = await this.hospitalService.findOne(id);
    if (!hospital) {
      return res.status(404).send('Hospital not found');
    }

    const procedureTypes =
      await this.hospitalHairResultService.getProcedureTypes({
        hospitalId: id,
      });

    const { data: latestHairResults } =
      await this.hospitalHairResultService.findAll({
        hospitalId: id,
      });

    return res.render('application/modules/home/views/hospital-detail', {
      hospital: hospital,
      procedureTypes: procedureTypes,
      latestHairResults: latestHairResults
        .map((hr) => ({
          id: hr.id,
          imageUrl: hr.images[0]?.imageUrl || null,
        }))
        .filter((hr) => hr.imageUrl), // Filter out results without images
      totalProcedures: procedureTypes.reduce(
        (total, pt) => total + parseInt(pt.count, 10),
        0,
      ),
    });
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHospitalDto: UpdateHospitalDto,
  ) {
    return this.hospitalService.update(id, updateHospitalDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hospitalService.remove(id);
  }
}
