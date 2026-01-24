import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { HospitalHairResultService } from './hospital-hair-result.service';
import { CreateHospitalHairResultDto } from './dto/create-hospital-hair-result.dto';
import { UpdateHospitalHairResultDto } from './dto/update-hospital-hair-result.dto';

@Controller('hospital-hair-results')
export class HospitalHairResultController {
  constructor(
    private readonly hospitalHairResultService: HospitalHairResultService,
  ) {}

  @Post()
  create(@Body() createHospitalHairResultDto: CreateHospitalHairResultDto) {
    return this.hospitalHairResultService.create(createHospitalHairResultDto);
  }

  @Get()
  findAll(
    @Query('hospitalId') hospitalId?: string,
    @Query('doctorId') doctorId?: string,
  ) {
    if (hospitalId) {
      return this.hospitalHairResultService.findByHospital(hospitalId);
    }
    if (doctorId) {
      return this.hospitalHairResultService.findByDoctor(doctorId);
    }
    return this.hospitalHairResultService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hospitalHairResultService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateHospitalHairResultDto: UpdateHospitalHairResultDto,
  ) {
    return this.hospitalHairResultService.update(id, updateHospitalHairResultDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hospitalHairResultService.remove(id);
  }
}
