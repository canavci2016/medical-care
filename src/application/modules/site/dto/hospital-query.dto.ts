import {
  IsOptional,
  IsString,
  IsNumberString,
  ValidateIf,
} from 'class-validator';

export class HospitalQueryDto {
  [key: string]: string | undefined;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @ValidateIf((o: HospitalQueryDto) => o.rating !== '')
  @IsNumberString()
  rating?: string;

  @IsOptional()
  @IsString()
  sorting?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
