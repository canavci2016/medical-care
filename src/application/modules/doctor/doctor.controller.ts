import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import type { Response } from 'express';

@Controller('doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) { }

  @Get()
  async findAll(@Res() res: Response) {
    const doctors = await this.doctorService.paginated();

    return res.render('doctor-list', { doctors });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.doctorService.findOne(id);
  }
}
