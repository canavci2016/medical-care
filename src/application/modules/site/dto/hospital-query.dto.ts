import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class HospitalQueryDto {
  [key: string]: string | undefined;

  @IsOptional()
  @IsNumberString()
  page?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumberString()
  rating?: string;

  @IsOptional()
  @IsString()
  sorting?: string;

  @IsOptional()
  @IsString()
  name?: string;
}
