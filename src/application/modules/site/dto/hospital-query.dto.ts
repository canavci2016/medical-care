import {
  IsOptional,
  IsString,
  IsNumberString,
  ValidateIf,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { RatingFilter } from '../../hospital/hospital.service';

export class HospitalQueryDto {
  [key: string]: string | undefined;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @ValidateIf((o: HospitalQueryDto) => o.limit !== '')
  @IsNumberString()
  limit?: string;

  @IsOptional()
  @ValidateIf((o: HospitalQueryDto) => o.city !== '')
  city?: string;

  @IsOptional()
  @ValidateIf((o: HospitalQueryDto) => o.rating !== '')
  @IsEnum(RatingFilter, {
    message: `rating must be one of the following values: ${Object.values(
      RatingFilter,
    ).join(', ')}`,
  })
  rating?: RatingFilter | '';

  @IsOptional()
  @IsString()
  sorting?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateIf((o: HospitalQueryDto) => o.country !== '')
  @IsUUID()
  country?: string;
}
