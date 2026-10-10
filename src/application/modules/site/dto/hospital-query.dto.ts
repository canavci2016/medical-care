import {
  IsOptional,
  IsString,
  IsNumberString,
  ValidateIf,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { RatingFilter } from '../../hospital/hospital.service';

export enum HospitalQuerySortingOptions {
  CREATED_AT_ASC = 'createdAt_asc',
  CREATED_AT_DESC = 'createdAt_desc',
  RATING_ASC = 'rating_asc',
  RATING_DESC = 'rating_desc',
}

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
  @IsEnum(HospitalQuerySortingOptions, {
    message: `sorting must be one of the following values: ${Object.values(HospitalQuerySortingOptions).join(', ')}`,
  })
  sorting?: HospitalQuerySortingOptions =
    HospitalQuerySortingOptions.RATING_DESC;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @ValidateIf((o: HospitalQueryDto) => o.country !== '')
  @IsUUID()
  country?: string;
}
