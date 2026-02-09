import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { HospitalService } from '../hospital/hospital.service';
import type { Response } from 'express';
import { HospitalHairResultService } from '../hospital-hair-result/hospital-hair-result.service';

@Controller('hospitals')
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalService,
    private readonly hospitalHairResultService: HospitalHairResultService,
  ) { }

  @Get()
  async findAll(@Res() res: Response) {
    const hospitals = await this.hospitalService.findAll();
    return res.render('hospital-list', { hospitals });
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

    return res.render('hospital-detail', {
      hospital: hospital,
      procedureTypes: procedureTypes,
      latestHairResults: latestHairResults
        .map((hr) => ({
          id: hr.id,
          imageUrl: hr.images[0]?.imageUrl || null,
        }))
        .filter((hr) => hr.imageUrl),
      totalProcedures: procedureTypes.reduce(
        (total, pt) => total + parseInt(pt.count, 10),
        0,
      ),
    });
  }
}
