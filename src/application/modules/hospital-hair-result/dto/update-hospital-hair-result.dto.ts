import { PartialType } from '@nestjs/mapped-types';
import { CreateHospitalHairResultDto } from './create-hospital-hair-result.dto';

export class UpdateHospitalHairResultDto extends PartialType(
  CreateHospitalHairResultDto,
) {}
