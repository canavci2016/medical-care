import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { HospitalService } from './hospital.service';
import { CreateHospitalDto } from './dto/create-hospital.dto';
import { UpdateHospitalDto } from './dto/update-hospital.dto';

@Controller('hospitals')
export class HospitalController {
  constructor(private readonly hospitalService: HospitalService) {}

  @Post()
  create(@Body() createHospitalDto: CreateHospitalDto) {
    return this.hospitalService.create(createHospitalDto);
  }

  @Get()
  findAll() {
    return this.hospitalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hospitalService.findOne(id);
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
